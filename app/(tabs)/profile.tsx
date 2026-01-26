import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useBookingsStore } from "../../src/store/bookingsStore";
import { theme } from "../../src/theme/theme";
import { Card } from "../../src/ui/Card";
import { Screen } from "../../src/ui/Screen";

export default function ProfileScreen() {
  const bookings = useBookingsStore((s) => s.bookings);
  const statusMeta = (status: "pendiente" | "confirmada" | "cancelada") => {
    if (status === "confirmada")
      return {
        label: "Confirmada",
        icon: "check-decagram",
        bg: "rgba(34,197,94,0.12)",
        border: "rgba(34,197,94,0.28)",
      };
    if (status === "cancelada")
      return {
        label: "Cancelada",
        icon: "close-circle",
        bg: "rgba(239,68,68,0.10)",
        border: "rgba(239,68,68,0.28)",
      };
    return {
      label: "Pendiente",
      icon: "clock-outline",
      bg: "rgba(255,183,77,0.12)",
      border: "rgba(255,183,77,0.28)",
    };
  };

  const planIcon = (planId: "bb" | "consientan" | "principe") => {
    if (planId === "bb") return "shield-check";
    if (planId === "consientan") return "heart";
    return "crown";
  };

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
              fontSize: 26,
              fontWeight: "900",
            }}
          >
            Perfil
          </Text>
          <Text style={{ color: theme.colors.muted, marginTop: 8 }}>
            Perfil.
          </Text>

          <Card style={{ marginTop: theme.spacing(3) }}>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 16,
                fontWeight: "900",
              }}
            >
              Mis reservas
            </Text>

            <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
              Tus últimas reservas confirmadas 🐾
            </Text>

            {bookings.length === 0 ? (
              <Text style={{ color: theme.colors.muted, marginTop: 12 }}>
                Aún no tienes reservas. Haz tu primera reserva y vuelve aquí 😄
              </Text>
            ) : (
              <View style={{ marginTop: 12, gap: 10 }}>
                {bookings.slice(0, 5).map((b) => {
                  const meta = statusMeta(b.status);
                  return (
                    <View
                      key={b.id}
                      style={{
                        borderWidth: 1,
                        borderColor: theme.colors.line,
                        backgroundColor: theme.colors.surface2,
                        borderRadius: theme.radius.xl,
                        padding: theme.spacing(2),
                      }}
                    >
                      {/* Header: mascota + estado */}
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

                        {/* Chip estado */}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 999,
                            backgroundColor: meta.bg,
                            borderWidth: 1,
                            borderColor: meta.border,
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

                      {/* Línea 1: plan + icono */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                          marginTop: 10,
                        }}
                      >
                        <MaterialCommunityIcons
                          name={planIcon(b.planId) as any}
                          size={18}
                          color={theme.colors.warn}
                        />
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontWeight: "800",
                          }}
                        >
                          {b.planName}
                        </Text>
                      </View>

                      {/* Línea 2: tiempo */}
                      <Text
                        style={{
                          color: theme.colors.muted,
                          marginTop: 6,
                          lineHeight: 18,
                        }}
                      >
                        {b.careTimeLabel}
                      </Text>

                      {/* Línea 3: ciudad + fecha */}
                      <Text
                        style={{
                          color: theme.colors.muted,
                          marginTop: 6,
                          lineHeight: 18,
                        }}
                      >
                        {b.city} · {b.dateLabel}
                      </Text>

                      {/* Total */}
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
                          style={{
                            color: theme.colors.muted,
                            fontWeight: "800",
                          }}
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
                    </View>
                  );
                })}
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}
