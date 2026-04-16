import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Children, type ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import {
  getPlanIcon,
  getTimelineEventIcon,
  getTimelineEventLabel,
  hasCompleteWalkSummary,
  sortTimelineEvents,
  type CareTimelineEvent,
  type CareTimelineEventType,
} from "../domain/bookings";
import type { Booking } from "../store/bookingsStore";
import { theme } from "../theme/theme";
import { Card } from "./Card";
import { Screen } from "./Screen";
import { WalkRoutePreview } from "./WalkRoutePreview";

const REPORT_EXCLUDED_EVENT_TYPES = new Set<CareTimelineEventType>([
  "booking_created",
  "booking_confirmed",
  "booking_cancelled",
]);

function padDatePart(value: number) {
  return value.toString().padStart(2, "0");
}

function getLocalDayKey(iso?: string) {
  if (!iso) return "";

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join("-");
}

function parseLocalDayKey(dayKey: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dayKey);

  if (!match) {
    return null;
  }

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function formatReportDate(dayKey: string, fallbackISO?: string) {
  const localDate = parseLocalDayKey(dayKey);
  const date =
    localDate && !Number.isNaN(localDate.getTime())
      ? localDate
      : fallbackISO
        ? new Date(fallbackISO)
        : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("es-EC", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
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

function summarizeEvent(event: CareTimelineEvent) {
  if (event.type === "walk" && hasCompleteWalkSummary(event)) {
    return `${formatDurationSummary(event.durationSeconds)} - ${formatDistanceSummary(
      event.distanceMeters,
    )}`;
  }

  if (event.type === "photo_update") {
    return event.note?.trim() ? "Momento compartido con foto" : "Nueva foto del dia";
  }

  if (event.type === "incident") {
    return "Incidente o novedad importante registrada";
  }

  if (event.note?.trim()) {
    return event.note.trim();
  }

  return "Actividad registrada dentro del cuidado de hoy.";
}

function buildReport(booking: Booking, requestedDayKey?: string) {
  const sortedTimeline = sortTimelineEvents(booking.timeline);
  const reportableTimeline = sortedTimeline.filter(
    (event) => !REPORT_EXCLUDED_EVENT_TYPES.has(event.type),
  );
  const fallbackISO =
    reportableTimeline[reportableTimeline.length - 1]?.createdAtISO ??
    sortedTimeline[sortedTimeline.length - 1]?.createdAtISO ??
    booking.createdAtISO;
  const resolvedDayKey = requestedDayKey || getLocalDayKey(fallbackISO);
  const dayTimeline = reportableTimeline.filter(
    (event) => getLocalDayKey(event.createdAtISO) === resolvedDayKey,
  );
  const photoEvents = dayTimeline.filter(
    (event) => typeof event.photoUri === "string" && event.photoUri.trim().length > 0,
  );
  const walkEvents = dayTimeline.filter(
    (event): event is CareTimelineEvent =>
      event.type === "walk" && hasCompleteWalkSummary(event),
  );
  const noteEvents = dayTimeline
    .filter((event) => typeof event.note === "string" && event.note.trim().length > 0)
    .sort((left, right) => {
      if (left.type === "incident" && right.type !== "incident") return -1;
      if (left.type !== "incident" && right.type === "incident") return 1;
      return left.createdAtISO.localeCompare(right.createdAtISO);
    });
  const firstEvent = dayTimeline[0];
  const lastEvent = dayTimeline[dayTimeline.length - 1];

  return {
    displayDate: formatReportDate(resolvedDayKey, fallbackISO),
    storyEvents: dayTimeline,
    photoEvents,
    walkEvents,
    noteEvents,
    incidentsCount: dayTimeline.filter((event) => event.type === "incident").length,
    totalWalkDurationSeconds: walkEvents.reduce(
      (total, event) => total + (event.durationSeconds ?? 0),
      0,
    ),
    totalWalkDistanceMeters: walkEvents.reduce(
      (total, event) => total + (event.distanceMeters ?? 0),
      0,
    ),
    firstEventTime: firstEvent ? formatTimelineTime(firstEvent.createdAtISO) : "-",
    lastEventTime: lastEvent ? formatTimelineTime(lastEvent.createdAtISO) : "-",
  };
}

function BackPill({ onPress }: { onPress?: () => void }) {
  if (!onPress) {
    return null;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        alignSelf: "flex-start",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.03)",
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <MaterialCommunityIcons
        name="arrow-left"
        size={16}
        color={theme.colors.text}
      />
      <Text style={{ color: theme.colors.text, fontWeight: "800" }}>Volver</Text>
    </Pressable>
  );
}

function MetricChip({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        backgroundColor: "rgba(255,255,255,0.04)",
        gap: 7,
        minHeight: 112,
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
        }}
      >
        <MaterialCommunityIcons name={icon} size={16} color={theme.colors.warn} />
      </View>
      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "900" }}>
        {value}
      </Text>
      <Text style={{ color: theme.colors.muted, fontSize: 12, lineHeight: 16 }}>
        {label}
      </Text>
    </View>
  );
}

function MetricGrid({ children }: { children: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -5, marginBottom: -10 }}>
      {Children.toArray(children).map((child, index) => (
        <View
          key={`metric-grid-${index}`}
          style={{ width: "50%", paddingHorizontal: 5, marginBottom: 10 }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

function MetricGroup({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <View
      style={{
        gap: 12,
        padding: theme.spacing(2),
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        backgroundColor: "rgba(255,255,255,0.025)",
      }}
    >
      <View style={{ gap: 4 }}>
        <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "900" }}>{title}</Text>
        {subtitle ? (
          <Text style={{ color: theme.colors.muted, fontSize: 12, lineHeight: 18 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <MetricGrid>{children}</MetricGrid>
    </View>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "900" }}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ color: theme.colors.muted, lineHeight: 19 }}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

function StoryEventCard({ event }: { event: CareTimelineEvent }) {
  const isWalk = event.type === "walk" && hasCompleteWalkSummary(event);
  const isIncident = event.type === "incident";

  return (
    <View
      style={{
        padding: theme.spacing(2),
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: isIncident ? "rgba(255,77,109,0.22)" : "rgba(255,255,255,0.06)",
        backgroundColor: isIncident ? "rgba(255,77,109,0.08)" : "rgba(255,255,255,0.03)",
        gap: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flexDirection: "row", gap: 10, flex: 1 }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isIncident
                ? "rgba(255,77,109,0.12)"
                : "rgba(87,215,255,0.12)",
              borderWidth: 1,
              borderColor: isIncident
                ? "rgba(255,77,109,0.26)"
                : "rgba(87,215,255,0.24)",
            }}
          >
            <MaterialCommunityIcons
              name={getTimelineEventIcon(event.type) as any}
              size={18}
              color={isIncident ? theme.colors.bad : theme.colors.warn}
            />
          </View>

          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "900" }}>
              {getTimelineEventLabel(event.type)}
            </Text>
            <Text style={{ color: theme.colors.muted, lineHeight: 18 }}>
              {summarizeEvent(event)}
            </Text>
          </View>
        </View>

        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "rgba(87,215,255,0.20)",
            backgroundColor: "rgba(87,215,255,0.08)",
          }}
        >
          <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: "900" }}>
            {formatTimelineTime(event.createdAtISO)}
          </Text>
        </View>
      </View>

      {event.note?.trim() ? (
        <Text style={{ color: theme.colors.text, lineHeight: 20 }}>{event.note.trim()}</Text>
      ) : null}

      {isWalk ? (
        <MetricGrid>
          <MetricChip
            icon="timer-outline"
            label="Duracion"
            value={formatDurationSummary(event.durationSeconds)}
          />
          <MetricChip
            icon="map-marker-distance"
            label="Distancia"
            value={formatDistanceSummary(event.distanceMeters)}
          />
        </MetricGrid>
      ) : null}
    </View>
  );
}

function PhotoCard({ event }: { event: CareTimelineEvent }) {
  if (!event.photoUri) {
    return null;
  }

  return (
    <View
      style={{
        width: "48%",
        minWidth: 140,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        backgroundColor: "rgba(255,255,255,0.03)",
        overflow: "hidden",
      }}
    >
      <Image
        source={{ uri: event.photoUri }}
        contentFit="cover"
        transition={120}
        style={{ width: "100%", aspectRatio: 1 }}
      />

      <View style={{ padding: 12, gap: 6 }}>
        <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: "900" }}>
          {formatTimelineTime(event.createdAtISO)}
        </Text>
        <Text style={{ color: theme.colors.muted, lineHeight: 18 }}>
          {event.note?.trim() || "Registro fotografico del dia."}
        </Text>
      </View>
    </View>
  );
}

function WalkCard({ event }: { event: CareTimelineEvent }) {
  return (
    <Card
      style={{
        padding: theme.spacing(2),
        backgroundColor: "rgba(12,18,32,0.92)",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "900" }}>
            Paseo registrado
          </Text>
          <Text style={{ color: theme.colors.muted }}>
            Resumen del recorrido registrado dentro del cuidado del dia.
          </Text>
        </View>

        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "rgba(255,184,77,0.20)",
            backgroundColor: "rgba(255,184,77,0.08)",
          }}
        >
          <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: "900" }}>
            {formatTimelineTime(event.createdAtISO)}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 12 }}>
        <MetricGrid>
          <MetricChip
            icon="timer-outline"
            label="Duracion"
            value={formatDurationSummary(event.durationSeconds)}
          />
          <MetricChip
            icon="map-marker-distance"
            label="Distancia"
            value={formatDistanceSummary(event.distanceMeters)}
          />
          <MetricChip
            icon="clock-start"
            label="Inicio"
            value={formatTimelineTime(event.walkStartedAtISO)}
          />
          <MetricChip
            icon="clock-end"
            label="Fin"
            value={formatTimelineTime(event.walkEndedAtISO)}
          />
        </MetricGrid>
      </View>

      <WalkRoutePreview routePoints={event.routePoints} label="Ruta guardada" />

      {event.note?.trim() ? (
        <Text style={{ color: theme.colors.text, lineHeight: 20 }}>{event.note.trim()}</Text>
      ) : null}
    </Card>
  );
}

function ReportSummarySection({
  report,
}: {
  report: ReturnType<typeof buildReport>;
}) {
  return (
    <Card
      style={{
        backgroundColor: "rgba(12,18,32,0.92)",
        borderColor: "rgba(255,255,255,0.06)",
        gap: 16,
      }}
    >
      <SectionTitle
        title="Resumen del dia"
        subtitle="Fotos, paseos, notas y eventos agrupados en una vista pensada para lectura movil."
      />

      <MetricGroup
        title="Actividad"
        subtitle="Conteos clave del dia organizados en un mismo ritmo visual."
      >
        <MetricChip
          icon="timeline-clock-outline"
          label="Eventos del dia"
          value={`${report.storyEvents.length}`}
        />
        <MetricChip
          icon="camera-outline"
          label="Fotos registradas"
          value={`${report.photoEvents.length}`}
        />
        <MetricChip
          icon="dog-side"
          label="Paseos completados"
          value={`${report.walkEvents.length}`}
        />
        <MetricChip
          icon="alert-circle-outline"
          label="Incidentes o alertas"
          value={`${report.incidentsCount}`}
        />
      </MetricGroup>

      <MetricGroup
        title="Cobertura del dia"
        subtitle="Ventana horaria y acumulados del recorrido dentro de la misma grilla."
      >
        <MetricChip
          icon="clock-start"
          label="Primer registro"
          value={report.firstEventTime}
        />
        <MetricChip
          icon="clock-end"
          label="Ultimo registro"
          value={report.lastEventTime}
        />
        <MetricChip
          icon="timer-outline"
          label="Tiempo total caminando"
          value={formatDurationSummary(report.totalWalkDurationSeconds)}
        />
        <MetricChip
          icon="map-marker-distance"
          label="Distancia total"
          value={formatDistanceSummary(report.totalWalkDistanceMeters)}
        />
      </MetricGroup>
    </Card>
  );
}

function NoteCard({ event }: { event: CareTimelineEvent }) {
  const isIncident = event.type === "incident";

  return (
    <View
      style={{
        padding: theme.spacing(2),
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: isIncident ? "rgba(255,77,109,0.24)" : "rgba(255,255,255,0.06)",
        backgroundColor: isIncident ? "rgba(255,77,109,0.08)" : "rgba(255,255,255,0.03)",
        gap: 8,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
          <MaterialCommunityIcons
            name={getTimelineEventIcon(event.type) as any}
            size={18}
            color={isIncident ? theme.colors.bad : theme.colors.warn}
          />
          <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "900", flex: 1 }}>
            {getTimelineEventLabel(event.type)}
          </Text>
        </View>
        <Text style={{ color: theme.colors.muted, fontSize: 12, fontWeight: "800" }}>
          {formatTimelineTime(event.createdAtISO)}
        </Text>
      </View>

      <Text style={{ color: theme.colors.text, lineHeight: 20 }}>{event.note?.trim()}</Text>
    </View>
  );
}

export function DailyCareReportView({
  booking,
  onBack,
  requestedDayKey,
}: {
  booking: Booking;
  onBack?: () => void;
  requestedDayKey?: string;
}) {
  const report = buildReport(booking, requestedDayKey);
  const planIcon = getPlanIcon(booking.planId);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32, gap: 18 }}>
        <BackPill onPress={onBack} />

        <Card
          style={{
            overflow: "hidden",
            backgroundColor: theme.colors.surface2,
            borderColor: "rgba(87,215,255,0.14)",
            padding: theme.spacing(2.5),
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              width: 180,
              height: 180,
              borderRadius: 90,
              right: -60,
              top: -70,
              backgroundColor: "rgba(87,215,255,0.10)",
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              width: 150,
              height: 150,
              borderRadius: 75,
              left: -40,
              bottom: -80,
              backgroundColor: "rgba(139,92,255,0.10)",
            }}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <View style={{ flex: 1, gap: 8 }}>
              <Text
                style={{
                  color: theme.colors.primary,
                  fontSize: 12,
                  fontWeight: "900",
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                }}
              >
                Reporte diario
              </Text>
              <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "900" }}>
                {booking.petName}
              </Text>
              <Text style={{ color: theme.colors.muted, lineHeight: 20 }}>
                Un resumen elegante y de solo lectura del cuidado registrado durante el dia.
              </Text>
            </View>

            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            >
              <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: "900" }}>
                Solo lectura
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginTop: 18,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(87,215,255,0.12)",
                borderWidth: 1,
                borderColor: "rgba(87,215,255,0.26)",
              }}
            >
              <MaterialCommunityIcons
                name={booking.petType === "Perro" ? "dog" : "cat"}
                size={24}
                color={theme.colors.warn}
              />
            </View>

            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "900" }}>
                {report.displayDate}
              </Text>
              <Text style={{ color: theme.colors.muted }}>
                {booking.city} - {booking.dateLabel}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 12,
                paddingVertical: 9,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                backgroundColor: "rgba(255,255,255,0.04)",
              }}
            >
              <MaterialCommunityIcons name={planIcon as any} size={16} color={theme.colors.warn} />
              <Text style={{ color: theme.colors.text, fontWeight: "800" }}>
                {booking.planName}
              </Text>
            </View>

            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 9,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                backgroundColor: "rgba(255,255,255,0.04)",
              }}
            >
              <Text style={{ color: theme.colors.muted, fontWeight: "800" }}>
                Plan ID: <Text style={{ color: theme.colors.text }}>{booking.planId}</Text>
              </Text>
            </View>
          </View>
        </Card>

        <ReportSummarySection report={report} />

        <Card style={{ gap: 14 }}>
          <SectionTitle
            title="Historia del cuidado"
            subtitle="Una narrativa clara de los momentos que marcaron la jornada."
          />

          {report.storyEvents.length === 0 ? (
            <View
              style={{
                borderRadius: theme.radius.lg,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.06)",
                backgroundColor: "rgba(255,255,255,0.03)",
                padding: theme.spacing(2),
                gap: 8,
              }}
            >
              <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "900" }}>
                Aun no hay actividad de cuidado registrada
              </Text>
              <Text style={{ color: theme.colors.muted, lineHeight: 20 }}>
                Cuando existan eventos, fotos o paseos locales para este dia, apareceran aqui
                como reporte listo para compartir mas adelante.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {report.storyEvents.map((event) => (
                <StoryEventCard key={event.id} event={event} />
              ))}
            </View>
          )}
        </Card>

        {report.photoEvents.length > 0 ? (
          <Card style={{ gap: 14 }}>
            <SectionTitle
              title="Fotos del dia"
              subtitle="Momentos visuales capturados dentro del flujo local de cuidado."
            />

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              {report.photoEvents.map((event) => (
                <PhotoCard key={event.id} event={event} />
              ))}
            </View>
          </Card>
        ) : null}

        {report.walkEvents.length > 0 ? (
          <View style={{ gap: 12 }}>
            <SectionTitle
              title="Paseos del dia"
              subtitle="Cada paseo conserva duracion, distancia y preview de ruta cuando ya existe."
            />

            {report.walkEvents.map((event) => (
              <WalkCard key={event.id} event={event} />
            ))}
          </View>
        ) : null}

        {report.noteEvents.length > 0 ? (
          <Card style={{ gap: 14 }}>
            <SectionTitle
              title="Notas e incidencias"
              subtitle="Observaciones importantes para el cliente, priorizando novedades relevantes."
            />

            <View style={{ gap: 10 }}>
              {report.noteEvents.map((event) => (
                <NoteCard key={`note-${event.id}`} event={event} />
              ))}
            </View>
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
