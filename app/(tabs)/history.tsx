import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import {
  canRegisterBookingCareEvents,
  getBookingQrPhaseLabel,
  hasCompleteWalkSummary,
  getTimelineEventIcon,
  getTimelineEventLabel,
  sortTimelineEventsDescending,
} from "../../src/domain/bookings";
import { Booking, useBookingsStore } from "../../src/store/bookingsStore";
import { theme } from "../../src/theme/theme";
import { Button } from "../../src/ui/Button";
import { Card } from "../../src/ui/Card";
import { HoldButton } from "../../src/ui/HoldButton";
import { Screen } from "../../src/ui/Screen";
import { WalkRoutePreview } from "../../src/ui/WalkRoutePreview";

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
  if (!type) return "-";
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

function formatTimelineTime(iso?: string) {
  if (!iso) return "-";

  try {
    const date = new Date(iso);
    return date.toLocaleTimeString("es-EC", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

function formatTimelineDate(iso?: string) {
  if (!iso) return "-";

  try {
    const date = new Date(iso);
    return date.toLocaleDateString("es-EC", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  } catch {
    return "-";
  }
}

function getTimelineActorLabel(actor?: Booking["timeline"][number]["actor"]) {
  return actor === "caregiver" ? "Cuidador" : "Sistema";
}

function formatDurationSummary(totalSeconds?: number) {
  if (typeof totalSeconds !== "number" || !Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "-";
  }

  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} h ${minutes} min`;
  }

  if (minutes > 0) {
    return `${minutes} min`;
  }

  return `${safeSeconds} s`;
}

function formatDistanceSummary(distanceMeters?: number) {
  if (
    typeof distanceMeters !== "number" ||
    !Number.isFinite(distanceMeters) ||
    distanceMeters < 0
  ) {
    return "-";
  }

  if (distanceMeters >= 1000) {
    const kilometers = distanceMeters / 1000;
    const digits = kilometers >= 10 ? 1 : 2;
    return `${kilometers.toFixed(digits)} km`;
  }

  return `${Math.round(distanceMeters)} m`;
}

function formatWalkRange(startedAtISO?: string, endedAtISO?: string) {
  if (!startedAtISO || !endedAtISO) return "-";
  return `${formatTimelineTime(startedAtISO)} - ${formatTimelineTime(endedAtISO)}`;
}

function TimelinePhotoPreview({ uri }: { uri: string }) {
  return (
    <View
      style={{
        marginTop: 10,
        width: 104,
        height: 104,
        borderRadius: theme.radius.lg,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(87,215,255,0.22)",
        backgroundColor: "rgba(255,255,255,0.03)",
      }}
    >
      <Image
        source={{ uri }}
        contentFit="cover"
        transition={120}
        style={{ width: "100%", height: "100%" }}
      />
      <View
        style={{
          position: "absolute",
          left: 8,
          right: 8,
          bottom: 8,
          borderRadius: 999,
          paddingHorizontal: 8,
          paddingVertical: 5,
          backgroundColor: "rgba(7,10,18,0.78)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 11,
            fontWeight: "900",
            textAlign: "center",
          }}
        >
          Foto local
        </Text>
      </View>
    </View>
  );
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

function SummaryMiniPill({
  icon,
  value,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  value: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 9,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(87,215,255,0.18)",
        backgroundColor: "rgba(87,215,255,0.08)",
      }}
    >
      <MaterialCommunityIcons name={icon} size={13} color={theme.colors.warn} />
      <Text style={{ color: theme.colors.text, fontSize: 11, fontWeight: "800" }}>
        {value}
      </Text>
    </View>
  );
}

function TimelineRow({ event }: { event: Booking["timeline"][number] }) {
  const hasWalkSummary = hasCompleteWalkSummary(event);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        minHeight: 44,
      }}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "flex-start",
          width: 30,
        }}
      >
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(87,215,255,0.12)",
            borderWidth: 1,
            borderColor: "rgba(87,215,255,0.34)",
          }}
        >
          <MaterialCommunityIcons
            name={getTimelineEventIcon(event.type) as any}
            size={15}
            color={theme.colors.warn}
          />
        </View>
      </View>

      <View
        style={{
          flex: 1,
          paddingTop: 2,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.06)",
          backgroundColor: "rgba(255,255,255,0.03)",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <Text
            style={{
              color: theme.colors.text,
              fontWeight: "900",
              fontSize: 14,
              lineHeight: 18,
              flex: 1,
            }}
          >
            {getTimelineEventLabel(event.type)}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 8,
              paddingVertical: 5,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "rgba(87,215,255,0.24)",
              backgroundColor: "rgba(87,215,255,0.10)",
            }}
          >
            <MaterialCommunityIcons
              name="clock-time-four-outline"
              size={12}
              color={theme.colors.primary}
            />
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 11,
                fontWeight: "900",
              }}
            >
              {formatTimelineTime(event.createdAtISO)}
            </Text>
          </View>
        </View>

        {hasWalkSummary ? (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 8,
            }}
          >
            <SummaryMiniPill
              icon="timer-outline"
              value={formatDurationSummary(event.durationSeconds)}
            />
            <SummaryMiniPill
              icon="map-marker-distance"
              value={formatDistanceSummary(event.distanceMeters)}
            />
          </View>
        ) : null}

        {hasWalkSummary ? (
          <WalkRoutePreview routePoints={event.routePoints} label="Ruta guardada" />
        ) : null}

        {event.note ? (
          <Text
            style={{
              color: theme.colors.text,
              marginTop: hasWalkSummary ? 8 : 6,
              fontSize: 13,
              lineHeight: 18,
            }}
          >
            {event.note}
          </Text>
        ) : null}

        {event.type === "photo_update" && event.photoUri ? (
          <TimelinePhotoPreview uri={event.photoUri} />
        ) : null}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
            marginTop:
              hasWalkSummary ||
              event.note ||
              (event.type === "photo_update" && event.photoUri)
                ? 10
                : 6,
          }}
        >
          <Text
            style={{
              color: theme.colors.muted,
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 0.3,
              textTransform: "uppercase",
            }}
          >
            {formatTimelineDate(event.createdAtISO)}
          </Text>

          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
              backgroundColor: "rgba(255,255,255,0.04)",
            }}
          >
            <Text style={{ color: theme.colors.muted, fontSize: 11, fontWeight: "800" }}>
              {getTimelineActorLabel(event.actor)}
            </Text>
          </View>

          {hasWalkSummary ? (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(255,183,77,0.18)",
                backgroundColor: "rgba(255,183,77,0.08)",
              }}
            >
              <Text style={{ color: theme.colors.text, fontSize: 11, fontWeight: "800" }}>
                {formatWalkRange(event.walkStartedAtISO, event.walkEndedAtISO)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const bookings = useBookingsStore((state) => state.bookings);
  const confirmBooking = useBookingsStore((state) => state.confirmBooking);
  const cancelBooking = useBookingsStore((state) => state.cancelBooking);

  const [filter, setFilter] = useState<Filter>("todas");
  const [showAll, setShowAll] = useState(false);
  const [expandedTimelines, setExpandedTimelines] = useState<
    Record<string, boolean>
  >({});

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
          text: "Si, cancelar",
          style: "destructive",
          onPress: () => {
            cancelBooking(id);
            Alert.alert("Listo", "Reserva cancelada");
          },
        },
      ],
    );
  };

  const askConfirm = (id: string) => {
    Alert.alert(
      "Confirmar reserva",
      'Confirmamos esta reserva?\n\nPasara a estado "Confirmada".',
      [
        { text: "Volver", style: "cancel" },
        {
          text: "Si, confirmar",
          onPress: () => {
            confirmBooking(id);
            Alert.alert("Perfecto", "Reserva confirmada");
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
          Tus reservas y el estado local de su QR.
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
                title={showAll ? "Ver menos" : "Ver mas"}
                variant="secondary"
                onPress={() => setShowAll((value) => !value)}
                style={{ paddingVertical: 10, paddingHorizontal: 12 }}
                textStyle={{ fontSize: 13 }}
              />
            ) : null}
          </View>

          {filtered.length === 0 ? (
            <Text style={{ color: theme.colors.muted, marginTop: 10 }}>
              Aqui apareceran tus reservas. Crea una en Reservar.
            </Text>
          ) : (
            <View style={{ marginTop: 12, gap: 10 }}>
              {list.map((booking) => {
                const meta = statusMeta(booking.status);
                const careTimeLabel =
                  booking.careTime === "day"
                    ? "Dia laboral (08:30 - 18:00)"
                    : "24 horas (Hospedaje)";
                const transportText = booking.transportNeeded
                  ? transportLabel(booking.transportType)
                  : "No necesita";
                const reservedAtText = formatCreatedAt(booking.createdAtISO);
                const canAct = booking.status === "pendiente";
                const canRegisterCare = canRegisterBookingCareEvents(booking.qr.phase);
                const timelineForDisplay = sortTimelineEventsDescending(booking.timeline);
                const timelinePreview = timelineForDisplay.slice(0, 4);
                const isTimelineExpanded = expandedTimelines[booking.id] === true;
                const visibleTimeline = isTimelineExpanded
                  ? timelineForDisplay
                  : timelinePreview;
                const hiddenCount = timelineForDisplay.length - timelinePreview.length;

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
                      value={`${booking.city} - ${booking.dateLabel}`}
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
                    <Line
                      icon="qrcode"
                      label="QR"
                      value={getBookingQrPhaseLabel(booking.qr.phase)}
                    />

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

                      <View
                        style={{
                          marginTop: 10,
                          position: "relative",
                          gap: 12,
                        }}
                      >
                        <View
                          pointerEvents="none"
                          style={{
                            position: "absolute",
                            left: 14,
                            top: 6,
                            bottom: 6,
                            width: 2,
                            borderRadius: 999,
                            backgroundColor: "rgba(255,255,255,0.10)",
                          }}
                        />

                        {visibleTimeline.map((event) => (
                          <TimelineRow key={event.id} event={event} />
                        ))}
                      </View>

                      {hiddenCount > 0 ? (
                        <Pressable
                          onPress={() =>
                            setExpandedTimelines((current) => ({
                              ...current,
                              [booking.id]: !isTimelineExpanded,
                            }))
                          }
                          style={{
                            marginTop: 10,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                            alignSelf: "flex-start",
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: "rgba(87,215,255,0.24)",
                            backgroundColor: "rgba(87,215,255,0.08)",
                          }}
                        >
                          <MaterialCommunityIcons
                            name={isTimelineExpanded ? "chevron-up" : "chevron-down"}
                            size={16}
                            color={theme.colors.warn}
                          />
                          <Text
                            style={{
                              color: theme.colors.text,
                              fontSize: 12,
                              fontWeight: "800",
                            }}
                          >
                            {isTimelineExpanded
                              ? "Ver menos"
                              : `Ver timeline completo (+${hiddenCount})`}
                          </Text>
                        </Pressable>
                      ) : null}

                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: "/booking-report",
                            params: { bookingId: booking.id },
                          })
                        }
                        style={({ pressed }) => ({
                          marginTop: 2,
                          borderRadius: theme.radius.lg,
                          borderWidth: 1,
                          borderColor: "rgba(87,215,255,0.18)",
                          backgroundColor: "rgba(87,215,255,0.08)",
                          paddingHorizontal: 14,
                          paddingVertical: 14,
                          opacity: pressed ? 0.92 : 1,
                        })}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                            <View
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "rgba(255,255,255,0.06)",
                                borderWidth: 1,
                                borderColor: "rgba(255,255,255,0.06)",
                              }}
                            >
                              <MaterialCommunityIcons
                                name="file-document-outline"
                                size={18}
                                color={theme.colors.warn}
                              />
                            </View>

                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  color: theme.colors.text,
                                  fontSize: 14,
                                  fontWeight: "900",
                                }}
                              >
                                Abrir reporte diario
                              </Text>
                              <Text
                                style={{
                                  color: theme.colors.muted,
                                  fontSize: 12,
                                  lineHeight: 17,
                                  marginTop: 2,
                                }}
                              >
                                Vista premium y de solo lectura con fotos, paseos y notas del dia.
                              </Text>
                            </View>
                          </View>

                          <MaterialCommunityIcons
                            name="chevron-right"
                            size={20}
                            color={theme.colors.text}
                          />
                        </View>
                      </Pressable>
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

                    {booking.status !== "cancelada" ? (
                      <View
                        style={{
                          marginTop: 12,
                          flexDirection: "row",
                          gap: 10,
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Button
                            title="Ver QR"
                            variant="secondary"
                            onPress={() =>
                              router.push({
                                pathname: "/booking-qr",
                                params: { bookingId: booking.id },
                              })
                            }
                          />
                        </View>

                        {canRegisterCare ? (
                          <View style={{ flex: 1 }}>
                            <Button
                              title="Registrar cuidado"
                              variant="outline"
                              onPress={() =>
                                router.push({
                                  pathname: "/booking-care",
                                  params: { bookingId: booking.id },
                                })
                              }
                            />
                          </View>
                        ) : null}
                      </View>
                    ) : null}

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
                            hint="Manten"
                            variant="success"
                            holdMs={850}
                            onComplete={() => askConfirm(booking.id)}
                          />
                        </View>

                        <View style={{ flex: 1 }}>
                          <HoldButton
                            title="Cancelar"
                            hint="Manten"
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

