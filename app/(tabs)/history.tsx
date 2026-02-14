import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { Booking, useBookingsStore } from "../../src/store/bookingsStore";
import { theme } from "../../src/theme/theme";
import { Button } from "../../src/ui/Button";
import { Card } from "../../src/ui/Card";
import { Screen } from "../../src/ui/Screen";

type Filter = "todas" | "pendiente" | "confirmada" | "cancelada";

function statusMeta(status: Booking["status"]) {
  if (status === "confirmada")
    return {
      label: "Confirmada",
      icon: "check-decagram",
      chipBg: "rgba(34,197,94,0.12)",
      chipBorder: "rgba(34,197,94,0.32)",
      cardBorder: "rgba(34,197,94,0.55)",
    };
  if (status === "cancelada")
    return {
      label: "Cancelada",
      icon: "close-circle",
      chipBg: "rgba(239,68,68,0.10)",
      chipBorder: "rgba(239,68,68,0.32)",
      cardBorder: "rgba(239,68,68,0.55)",
    };
  return {
    label: "Pendiente",
    icon: "clock-outline",
    chipBg: "rgba(255,183,77,0.12)",
    chipBorder: "rgba(255,183,77,0.28)",
    cardBorder: theme.colors.line,
  };
}

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? "rgba(87,215,255,0.55)" : theme.colors.line,
        backgroundColor: active
          ? "rgba(87,215,255,0.14)"
          : theme.colors.surface2,
      }}
    >
      <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
        {label}
      </Text>
    </Pressable>
  );
}

function transportLabel(type?: Booking["transportType"]) {
  if (!type) return "—";
  if (type === "ida") return "Solo ida";
  if (type === "vuelta") return "Solo vuelta";
  return "Ida y vuelta";
}

export default function HistoryScreen() {
  const bookings = useBookingsStore((s) => s.bookings);
  const confirmBooking = useBookingsStore((s) => s.confirmBooking);
  const cancelBooking = useBookingsStore((s) => s.cancelBooking);

  const [filter, setFilter] = useState<Filter>("todas");

  const list = useMemo(() => {
    if (filter === "todas") return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  const askCancel = (id: string) => {
    Alert.alert(
      "Cancelar reserva",
      "¿Seguro que deseas cancelar esta reserva?\n\nEsta acción no se puede deshacer.",
      [
        { text: "Volver", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: () => {
            cancelBooking(id);
            Alert.alert("Listo", "Reserva cancelada ❌");
          },
        },
      ],
    );
  };

  const askConfirm = (id: string) => {
    Alert.alert(
      "Confirmar reserva",
      "¿Confirmamos esta reserva?\n\nPasará a estado “Confirmada”.",
      [
        { text: "Volver", style: "cancel" },
        {
          text: "Sí, confirmar",
          onPress: () => {
            confirmBooking(id);
            Alert.alert("Perfecto", "Reserva confirmada ✅");
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <ScrollView>
        <Text
          style={{ color: theme.colors.text, fontSize: 28, fontWeight: "900" }}
        >
          Mis reservas
        </Text>
        <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
          Historial y estado de tus aventuras 🐾
        </Text>

        <Card style={{ marginTop: theme.spacing(3) }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: "900",
            }}
          >
            Filtros
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: 10,
              flexWrap: "wrap",
              marginTop: 12,
            }}
          >
            <Pill
              label="Todas"
              active={filter === "todas"}
              onPress={() => setFilter("todas")}
            />
            <Pill
              label="Pendiente"
              active={filter === "pendiente"}
              onPress={() => setFilter("pendiente")}
            />
            <Pill
              label="Confirmada"
              active={filter === "confirmada"}
              onPress={() => setFilter("confirmada")}
            />
            <Pill
              label="Cancelada"
              active={filter === "cancelada"}
              onPress={() => setFilter("cancelada")}
            />
          </View>
        </Card>

        <Card style={{ marginTop: theme.spacing(2) }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: "900",
            }}
          >
            Reservas ({list.length})
          </Text>

          {list.length === 0 ? (
            <Text style={{ color: theme.colors.muted, marginTop: 10 }}>
              Aquí aparecerán tus reservas. Crea una en “Nueva” 😄
            </Text>
          ) : (
            <View style={{ marginTop: 12, gap: 10 }}>
              {list.map((b) => {
                const meta = statusMeta(b.status);

                const careTimeLabel =
                  b.careTime === "day"
                    ? "Día laboral (08:30 – 18:00)"
                    : "24 horas (Hospedaje)";

                const showTransport = Boolean(b.transportNeeded);
                const transportText = showTransport
                  ? transportLabel(b.transportType)
                  : "No necesita";

                const canAct = b.status === "pendiente";

                return (
                  <View
                    key={b.id}
                    style={{
                      borderWidth: 1,
                      borderColor: meta.cardBorder,
                      backgroundColor: theme.colors.surface2,
                      borderRadius: theme.radius.xl,
                      padding: theme.spacing(2),
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <MaterialCommunityIcons
                          name={b.petType === "Perro" ? "dog" : "cat"}
                          size={20}
                          color={theme.colors.warn}
                        />
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontWeight: "900",
                            fontSize: 16,
                          }}
                        >
                          {b.petName}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 999,
                          backgroundColor: meta.chipBg,
                          borderWidth: 1,
                          borderColor: meta.chipBorder,
                        }}
                      >
                        <MaterialCommunityIcons
                          name={meta.icon as any}
                          size={16}
                          color={theme.colors.warn}
                        />
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontWeight: "800",
                            fontSize: 12,
                          }}
                        >
                          {meta.label}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={{
                        color: theme.colors.text,
                        fontWeight: "900",
                        marginTop: 10,
                      }}
                    >
                      {b.planName}
                    </Text>

                    <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
                      {careTimeLabel}
                    </Text>

                    <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
                      {b.city} · {b.dateLabel}
                    </Text>

                    <View
                      style={{
                        marginTop: 8,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="car"
                        size={18}
                        color={theme.colors.warn}
                      />
                      <Text style={{ color: theme.colors.muted }}>
                        Transporte:{" "}
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontWeight: "800",
                          }}
                        >
                          {transportText}
                        </Text>
                      </Text>
                    </View>

                    <View
                      style={{
                        marginTop: 10,
                        paddingTop: 10,
                        borderTopWidth: 1,
                        borderTopColor: theme.colors.line,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{ color: theme.colors.muted, fontWeight: "800" }}
                      >
                        Total
                      </Text>
                      <Text
                        style={{
                          color: theme.colors.text,
                          fontWeight: "900",
                          fontSize: 16,
                        }}
                      >
                        {b.totalUSD}
                      </Text>
                    </View>

                    {canAct && (
                      <View style={{ marginTop: 12, gap: 10 }}>
                        <Button
                          title="Confirmar reserva"
                          variant="success"
                          onPress={() => askConfirm(b.id)}
                        />
                        <Button
                          title="Cancelar reserva"
                          variant="danger"
                          onPress={() => askCancel(b.id)}
                        />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        <View style={{ height: 22 }} />
      </ScrollView>
    </Screen>
  );
}
