import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useRef } from "react";
import { ScrollView, Text, View } from "react-native";

import { createBookingCreatedEvent, createBookingQrState } from "../src/domain/bookings";
import { TransportType, useBookingsStore } from "../src/store/bookingsStore";
import { theme } from "../src/theme/theme";
import { Button } from "../src/ui/Button";
import { Card } from "../src/ui/Card";
import { HoldButton } from "../src/ui/HoldButton";
import { Screen } from "../src/ui/Screen";

type PetType = "Perro" | "Gato";
type PlanId = "bb" | "consientan" | "principe";
type CareTime = "day" | "full";

function pickString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function pickEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
) {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

function makeId(prefix = "b") {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${t}_${r}`;
}

function transportLabel(type?: TransportType) {
  if (!type) return "No";
  if (type === "ida") return "Solo ida";
  if (type === "vuelta") return "Solo vuelta";
  return "Ida y vuelta";
}

function formatCreatedAt(iso: string) {
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

export default function ConfirmScreen() {
  const router = useRouter();
  const addBooking = useBookingsStore((state) => state.addBooking);
  const params = useLocalSearchParams();

  const petId = pickString(params.petId);
  const petName = pickString(params.petName, "-");
  const petType = pickEnum<PetType>(params.petType, ["Perro", "Gato"], "Perro");

  const planId = pickEnum<PlanId>(
    params.planId,
    ["bb", "consientan", "principe"],
    "bb",
  );
  const planName = pickString(params.planName, "-");

  const careTime = pickEnum<CareTime>(params.careTime, ["day", "full"], "day");
  const careTimeLabel = pickString(params.careTimeLabel, "-");

  const city = pickString(params.city, "-");
  const dateLabel = pickString(params.dateLabel, "-");
  const totalUSD = pickString(params.totalUSD, "$0.00");

  const transportNeeded = pickString(params.transportNeeded, "false") === "true";
  const transportType = pickEnum<TransportType>(
    params.transportType,
    ["ida", "vuelta", "ida_vuelta"],
    "ida_vuelta",
  );

  const planIcon = useMemo(() => {
    if (planId === "bb") return "shield-check";
    if (planId === "consientan") return "heart";
    return "crown";
  }, [planId]);

  const confirmedRef = useRef(false);

  const onConfirm = () => {
    if (confirmedRef.current) return;
    confirmedRef.current = true;

    const bookingId = makeId("b");
    const createdAtISO = new Date().toISOString();

    addBooking({
      id: bookingId,
      petId: petId || undefined,
      petName,
      petType,
      planId,
      planName,
      careTime,
      city,
      dateLabel,
      totalUSD,
      status: "pendiente",
      createdAtISO,
      transportNeeded,
      transportType: transportNeeded ? transportType : undefined,
      qr: createBookingQrState({
        bookingId,
        createdAtISO,
        confirmed: false,
      }),
      timeline: [createBookingCreatedEvent(createdAtISO)],
    });

    router.replace("/(tabs)/history");
  };

  const createdAtPreview = useMemo(() => {
    return formatCreatedAt(new Date().toISOString());
  }, []);

  return (
    <Screen>
      <ScrollView>
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.bg,
            padding: theme.spacing(2),
          }}
        >
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 28,
              fontWeight: "900",
            }}
          >
            Confirmacion
          </Text>

          <Text
            style={{ color: theme.colors.muted, marginTop: 6, lineHeight: 18 }}
          >
            Revisa que todo este perfecto. Al confirmar, dejamos lista la reserva y
            preparamos su QR local para check-in y check-out.
          </Text>

          <Card style={{ marginTop: theme.spacing(2) }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255,183,77,0.10)",
                  borderWidth: 1,
                  borderColor: "rgba(255,183,77,0.25)",
                }}
              >
                <MaterialCommunityIcons
                  name={petType === "Gato" ? "cat" : "dog"}
                  size={20}
                  color={theme.colors.warn}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: theme.colors.muted,
                    fontWeight: "900",
                    fontSize: 12,
                  }}
                >
                  PELUDITO
                </Text>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontWeight: "900",
                    fontSize: 18,
                  }}
                >
                  {petName}
                </Text>
              </View>
            </View>

            <View style={{ height: 14 }} />

            <View style={{ gap: 10 }}>
              <Row icon={planIcon} label="Plan" value={planName} />
              <Row icon="clock-outline" label="Tiempo" value={careTimeLabel} />
              <Row icon="map-marker" label="Ciudad" value={city} />
              <Row icon="calendar" label="Fecha" value={dateLabel} />
              <Row
                icon="car"
                label="Transporte"
                value={transportNeeded ? transportLabel(transportType) : "No"}
              />
              <Row
                icon="clock-time-four-outline"
                label="Reserva"
                value={createdAtPreview}
              />
              <Row icon="qrcode" label="QR" value="Se activa al confirmar" />
            </View>

            <View
              style={{
                marginTop: theme.spacing(2),
                paddingTop: theme.spacing(2),
                borderTopWidth: 1,
                borderTopColor: theme.colors.line,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: theme.colors.muted, fontWeight: "900" }}>
                TOTAL
              </Text>
              <Text
                style={{
                  color: theme.colors.text,
                  fontWeight: "900",
                  fontSize: 20,
                }}
              >
                {totalUSD}
              </Text>
            </View>
          </Card>

          <View style={{ marginTop: theme.spacing(2), gap: 10 }}>
            <HoldButton
              title="Confirmar reserva"
              hint="Manten presionado"
              variant="success"
              holdMs={900}
              onComplete={onConfirm}
            />

            <Button
              title="Volver"
              variant="secondary"
              onPress={() => router.back()}
            />
          </View>

          <View style={{ height: 22 }} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Row({
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
      <Text style={{ color: theme.colors.muted, width: 90 }}>{label}:</Text>
      <Text style={{ color: theme.colors.text, fontWeight: "800", flex: 1 }}>
        {value}
      </Text>
    </View>
  );
}
