import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import {
  getTimelineEventIcon,
  getTimelineEventLabel,
} from "../../src/domain/bookings";
import { Booking, useBookingsStore } from "../../src/store/bookingsStore";
import { theme } from "../../src/theme/theme";
import { Button } from "../../src/ui/Button";
import { Card } from "../../src/ui/Card";
import { HoldButton } from "../../src/ui/HoldButton";
import { Screen } from "../../src/ui/Screen";

type Filter = "todas" | "pendiente" | "confirmada" | "cancelada";

function statusMeta(status: Booking["status"]) {
  if (status === "confirmada") {
    return {
      label: "Confirmada",
      icon: "check-decagram",
      chipBg: "rgba(34,197,94,0.12)",
      chipBorder: "rgba(34,197,94,0.32)",
      cardBorder: "rgba(34,197,94,0.55)",
    };
  }

  if (status === "cancelada") {
    return {
      label: "Cancelada",
      icon: "close-circle",
      chipBg: "rgba(239,68,68,0.10)",
      chipBorder: "rgba(239,68,68,0.32)",
      cardBorder: "rgba(239,68,68,0.55)",
    };
  }

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
    return "—";
  }
}

function Line({
  icon,
  label,
  value,
  valueStrong,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  value: string;
  valueStrong?: boolean;
}) {
  return (
    <View
      style={{
        marginTop: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <MaterialCommunityIcons name={icon} size={18} color={theme.colors.warn} />
      <Text style={{ color: theme.colors.muted }}>
        {label}:{" "}
        <Text
          style={{
            color: theme.colors.text,
            fontWeight: valueStrong ? "900" : "800",
          }}
        >
          {value}
        </Text>
      </Text>
    </View>
  );
}

function TimelineRow({
  event,
  showConnector,
}: {
  event: Booking["timeline"][number];
  showConnector: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "stretch",
        gap: 10,
        paddingBottom: showConnector ? 10 : 0,
      }}
    >
      <View
        style={{
          alignItems: "center",
          width: 28,
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.line,
          }}
        >
          <MaterialCommunityIcons
            name={getTimelineEventIcon(event.type) as any}
            size={15}
            color={theme.colors.warn}
          />
        </View>

        {showConnector ? (
          <View
            style={{
              marginTop: 4,
              width: 2,
              flex: 1,
              minHeight: 10,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          />
        ) : null}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
          {getTimelineEventLabel(event.type)}
        </Text>
        <Text style={{ color: theme.colors.muted, fontSize: 12, marginTop: 2 }}>
          {formatCreatedAt(event.createdAtISO)}
        </Text>
        {event.note ? (
          <Text style={{ color: theme.colors.muted, marginTop: 4 }}>
            {event.note}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const bookings = useBookingsStore((state) => state.bookings);
  const confirmBooking = useBookingsStore((state) => state.confirmBooking);
  const cancelBooking = useBookingsStore((state) => state.cancelBooking);

  const [filter, setFilter] = useState<Filter>("todas");
  const [showAll, setShowAll] = useState(false);

  const counts = useMemo(() => {
    const pending = bookings.filter((booking) => booking.status === "pendiente").length;
    const confirmed = bookings.filter((booking) => booking.status === "confirmada").length;
    const canceled = bookings.filter((booking) => booking.status === "cancelada").length;

    return {
      todas: bookings.length,
      pendiente: pending,
      confirmada: confirmed,
      cancelada: canceled,
    };
  }, [bookings]);

  const filtered = useMemo(() => {
    const base =
      filter === "todas"
        ? bookings
        : bookings.filter((booking) => booking.status === filter);

    return [...base].sort((a, b) => b.createdAtISO.localeCompare(a.createdAtISO));
  }, [bookings, filter]);

  const list = useMemo(() => {
    return showAll ? filtered : filtered.slice(0, 5);
  }, [filtered, showAll]);

  const askCancel = (id: string) => {
    Alert.alert(
      "Cancelar reserva",
      "Seguro que deseas cancelar esta reserva?\n\nEsta accion no se puede deshacer.",
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
      "Confirmamos esta reserva?\n\nPasara a estado \"Confirmada\".",
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
          Historial
        </Text>
        <Text style={{ color: theme.colors.muted, marginTop: 6 }}>
          Tus reservas, tu rastro… tu leyenda 🐾
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
              label={`Todas (${counts.todas})`}
              active={filter === "todas"}
              onPress={() => {
                setFilter("todas");
                setShowAll(false);
              }}
            />
            <Pill
              label={`Pendiente (${counts.pendiente})`}
              active={filter === "pendiente"}
              onPress={() => {
                setFilter("pendiente");
                setShowAll(false);
              }}
            />
            <Pill
              label={`Confirmada (${counts.confirmada})`}
              active={filter === "confirmada"}
              onPress={() => {
                setFilter("confirmada");
                setShowAll(false);
              }}
            />
            <Pill
              label={`Cancelada (${counts.cancelada})`}
              active={filter === "cancelada"}
              onPress={() => {
                setFilter("cancelada");
                setShowAll(false);
              }}
            />
          </View>
        </Card>

        <Card style={{ marginTop: theme.spacing(2) }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 16,
                fontWeight: "900",
              }}
            >
              Reservas ({filtered.length})
            </Text>

            {filtered.length > 5 ? (
              <Button
                title={showAll ? "Ver menos" : "Ver más"}
                variant="secondary"
                onPress={() => setShowAll((value) => !value)}
                style={{ paddingVertical: 10, paddingHorizontal: 12 }}
                textStyle={{ fontSize: 13 }}
              />
            ) : null}
          </View>

          {filtered.length === 0 ? (
            <Text style={{ color: theme.colors.muted, marginTop: 10 }}>
              Aquí aparecerán tus reservas. Crea una en Reservar 😄
            </Text>
          ) : (
            <View style={{ marginTop: 12, gap: 10 }}>
              {list.map((booking) => {
                const meta = statusMeta(booking.status);
                const careTimeLabel =
                  booking.careTime === "day"
                    ? "Día laboral (08:30 – 18:00)"
                    : "24 horas (Hospedaje)";
                const transportText = booking.transportNeeded
                  ? transportLabel(booking.transportType)
                  : "No necesita";
                const reservedAtText = formatCreatedAt(booking.createdAtISO);
                const canAct = booking.status === "pendiente";
                const timelinePreview = [...booking.timeline].slice(-4).reverse();

                return (
                  <View
                    key={booking.id}
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
                          name={booking.petType === "Perro" ? "dog" : "cat"}
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
                          {booking.petName}
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
                      {booking.planName}
                    </Text>

                    <Line
                      icon="calendar"
                      label="Servicio"
                      value={`${booking.city} · ${booking.dateLabel}`}
                      valueStrong
                    />
                    <Line
                      icon="receipt-text-clock"
                      label="Reservado"
                      value={reservedAtText}
                    />

                    <Text style={{ color: theme.colors.muted, marginTop: 8 }}>
                      {careTimeLabel}
                    </Text>

                    <Line icon="car" label="Transporte" value={transportText} />

                    <View
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTopWidth: 1,
                        borderTopColor: theme.colors.line,
                        gap: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: theme.colors.text,
                          fontWeight: "900",
                          fontSize: 13,
                        }}
                      >
                        Timeline
                      </Text>

                      {timelinePreview.map((event, index) => (
                        <TimelineRow
                          key={event.id}
                          event={event}
                          showConnector={index < timelinePreview.length - 1}
                        />
                      ))}

                      {booking.timeline.length > timelinePreview.length ? (
                        <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                          +{booking.timeline.length - timelinePreview.length} evento(s) más
                        </Text>
                      ) : null}
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
                      <Text style={{ color: theme.colors.muted, fontWeight: "800" }}>
                        Total
                      </Text>
                      <Text
                        style={{
                          color: theme.colors.text,
                          fontWeight: "900",
                          fontSize: 16,
                        }}
                      >
                        {booking.totalUSD}
                      </Text>
                    </View>

                    {canAct ? (
                      <View
                        style={{
                          marginTop: 12,
                          flexDirection: "row",
                          gap: 10,
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <HoldButton
                            title="Confirmar"
                            hint="Mantén"
                            variant="success"
                            holdMs={850}
                            onComplete={() => askConfirm(booking.id)}
                          />
                        </View>

                        <View style={{ flex: 1 }}>
                          <HoldButton
                            title="Cancelar"
                            hint="Mantén"
                            variant="danger"
                            holdMs={850}
                            onComplete={() => askCancel(booking.id)}
                          />
                        </View>
                      </View>
                    ) : null}
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
