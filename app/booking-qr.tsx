import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";

import {
  getActiveBookingQrCode,
  getActiveBookingQrIntent,
  getBookingQrConsumeErrorMessage,
  getBookingQrHelperText,
  getBookingQrIntentLabel,
  getBookingQrPhaseLabel,
} from "../src/domain/bookings";
import { useBookingsStore } from "../src/store/bookingsStore";
import { theme } from "../src/theme/theme";
import { Button } from "../src/ui/Button";
import { Card } from "../src/ui/Card";
import { HoldButton } from "../src/ui/HoldButton";
import { Screen } from "../src/ui/Screen";

const QR_GRID_SIZE = 21;
const QR_CELL_SIZE = 8;

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function buildPseudoQrMatrix(value: string) {
  const size = QR_GRID_SIZE;
  const matrix = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved = Array.from({ length: size }, () => Array(size).fill(false));

  const paintFinder = (startRow: number, startCol: number) => {
    for (let row = 0; row < 7; row += 1) {
      for (let col = 0; col < 7; col += 1) {
        const targetRow = startRow + row;
        const targetCol = startCol + col;
        reserved[targetRow][targetCol] = true;

        const edge = row === 0 || row === 6 || col === 0 || col === 6;
        const center = row >= 2 && row <= 4 && col >= 2 && col <= 4;
        matrix[targetRow][targetCol] = edge || center;
      }
    }
  };

  paintFinder(0, 0);
  paintFinder(0, size - 7);
  paintFinder(size - 7, 0);

  for (let index = 0; index < size; index += 1) {
    reserved[6][index] = true;
    reserved[index][6] = true;
    matrix[6][index] = index % 2 === 0;
    matrix[index][6] = index % 2 === 0;
  }

  let seed = hashString(value);

  const nextBit = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return (seed & 1) === 1;
  };

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (reserved[row][col]) continue;
      matrix[row][col] = nextBit();
    }
  }

  return matrix;
}

function formatCreatedAt(iso?: string) {
  if (!iso) return "-";

  try {
    const date = new Date(iso);
    return date.toLocaleString("es-EC", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <MaterialCommunityIcons name={icon} size={18} color={theme.colors.warn} />
      <Text style={{ color: theme.colors.muted, width: 92 }}>{label}:</Text>
      <Text style={{ color: theme.colors.text, fontWeight: "800", flex: 1 }}>
        {value}
      </Text>
    </View>
  );
}

function PseudoQr({ value }: { value: string }) {
  const matrix = useMemo(() => buildPseudoQrMatrix(value), [value]);

  return (
    <View
      style={{
        alignSelf: "center",
        padding: 12,
        borderRadius: 24,
        backgroundColor: "#FFFFFF",
      }}
    >
      {matrix.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={{ flexDirection: "row" }}>
          {row.map((cell, colIndex) => (
            <View
              key={`cell-${rowIndex}-${colIndex}`}
              style={{
                width: QR_CELL_SIZE,
                height: QR_CELL_SIZE,
                backgroundColor: cell ? "#111111" : "#FFFFFF",
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function BookingQrScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookingId = typeof params.bookingId === "string" ? params.bookingId : "";
  const bookings = useBookingsStore((state) => state.bookings);
  const consumeBookingQr = useBookingsStore((state) => state.consumeBookingQr);

  const booking = useMemo(
    () => bookings.find((item) => item.id === bookingId),
    [bookings, bookingId],
  );
  const [enteredToken, setEnteredToken] = useState("");

  if (!booking) {
    return (
      <Screen>
        <View style={{ gap: 16 }}>
          <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "900" }}>
            QR local
          </Text>
          <Card>
            <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>
              Reserva no encontrada
            </Text>
            <Text style={{ color: theme.colors.muted, marginTop: 8, lineHeight: 18 }}>
              No pudimos cargar el QR de esta reserva. Vuelve al historial y abrelo de nuevo.
            </Text>
          </Card>
          <Button
            title="Volver al historial"
            onPress={() => router.replace("/(tabs)/history")}
          />
        </View>
      </Screen>
    );
  }

  const activeIntent = getActiveBookingQrIntent(booking.qr);
  const activeCode = getActiveBookingQrCode(booking.qr);
  const displayToken =
    activeCode?.token ??
    (booking.qr.phase === "checked_out"
      ? booking.qr.checkOut.token
      : "TP1-QR-PENDIENTE-LOCAL");

  const onConsume = () => {
    if (!activeIntent) return;

    const result = consumeBookingQr(booking.id, activeIntent, enteredToken);

    if ("reason" in result) {
      const message =
        result.reason === "booking_not_found"
          ? "No encontramos la reserva para consumir este QR."
          : getBookingQrConsumeErrorMessage(result.reason);
      Alert.alert("No se pudo validar", message);
      return;
    }

    setEnteredToken("");
    Alert.alert(
      "QR consumido",
      `${getBookingQrIntentLabel(activeIntent)} completado en modo local.`,
    );
  };

  return (
    <Screen>
      <ScrollView>
        <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "900" }}>
          QR local
        </Text>
        <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
          Vista para el owner y validacion manual del flujo MVP sin scanner.
        </Text>

        <Card style={{ marginTop: theme.spacing(3) }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <MaterialCommunityIcons
              name={booking.petType === "Perro" ? "dog" : "cat"}
              size={22}
              color={theme.colors.warn}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 18 }}>
                {booking.petName}
              </Text>
              <Text style={{ color: theme.colors.muted, marginTop: 2 }}>
                {booking.planName}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 14, gap: 10 }}>
            <InfoRow
              icon="qrcode"
              label="Estado QR"
              value={getBookingQrPhaseLabel(booking.qr.phase)}
            />
            <InfoRow
              icon="calendar"
              label="Servicio"
              value={`${booking.city} · ${booking.dateLabel}`}
            />
            <InfoRow
              icon="receipt-text-clock"
              label="Reserva"
              value={formatCreatedAt(booking.createdAtISO)}
            />
            <InfoRow
              icon="login"
              label="Check-in"
              value={formatCreatedAt(booking.qr.checkIn.consumedAtISO)}
            />
            <InfoRow
              icon="logout"
              label="Check-out"
              value={formatCreatedAt(booking.qr.checkOut.consumedAtISO)}
            />
          </View>
        </Card>

        <Card style={{ marginTop: theme.spacing(2) }}>
          <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>
            QR activo
          </Text>
          <Text style={{ color: theme.colors.muted, marginTop: 8, lineHeight: 18 }}>
            {getBookingQrHelperText(booking.qr.phase)}
          </Text>

          <View style={{ marginTop: 18 }}>
            <PseudoQr value={displayToken} />
          </View>

          <View
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: theme.radius.xl,
              borderWidth: 1,
              borderColor: theme.colors.line,
              backgroundColor: theme.colors.surface2,
            }}
          >
            <Text style={{ color: theme.colors.muted, fontWeight: "800", fontSize: 12 }}>
              CODIGO LOCAL
            </Text>
            <Text
              selectable
              style={{ color: theme.colors.text, fontWeight: "900", marginTop: 8, lineHeight: 22 }}
            >
              {displayToken}
            </Text>
          </View>

          <View style={{ marginTop: 12, flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Button
                title="Usar codigo activo"
                variant="secondary"
                onPress={() => setEnteredToken(activeCode?.token ?? "")}
                disabled={!activeCode}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="Volver" variant="ghost" onPress={() => router.back()} />
            </View>
          </View>
        </Card>

        <Card style={{ marginTop: theme.spacing(2) }}>
          <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}>
            Validacion local
          </Text>
          <Text style={{ color: theme.colors.muted, marginTop: 8, lineHeight: 18 }}>
            Pega el codigo QR activo para simular la validacion local de{" "}
            {activeIntent
              ? getBookingQrIntentLabel(activeIntent).toLowerCase()
              : "este flujo"}
            .
          </Text>

          <TextInput
            value={enteredToken}
            onChangeText={setEnteredToken}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="TP1-IN-..."
            placeholderTextColor={theme.colors.muted}
            style={{
              marginTop: 14,
              borderWidth: 1,
              borderColor: theme.colors.line,
              borderRadius: theme.radius.xl,
              paddingHorizontal: 14,
              paddingVertical: 14,
              color: theme.colors.text,
              backgroundColor: theme.colors.surface2,
            }}
          />

          <View style={{ marginTop: 12 }}>
            <HoldButton
              title={
                activeIntent
                  ? `Validar ${getBookingQrIntentLabel(activeIntent)}`
                  : "Sin QR activo"
              }
              hint="Manten presionado"
              variant="success"
              holdMs={850}
              onComplete={onConsume}
              disabled={!activeIntent}
            />
          </View>

          {!activeIntent ? (
            <Text style={{ color: theme.colors.muted, marginTop: 10, lineHeight: 18 }}>
              No hay un QR activo por consumir en este momento.
            </Text>
          ) : null}
        </Card>

        <View style={{ height: 22 }} />
      </ScrollView>
    </Screen>
  );
}
