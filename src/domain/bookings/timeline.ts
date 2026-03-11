const CARE_TIMELINE_EVENT_TYPES = [
  "booking_created",
  "booking_cancelled",
  "feeding",
  "snack",
  "water",
  "playtime",
  "socialization",
  "nap",
  "walk",
  "grooming",
  "bath",
  "brushing",
  "massage",
  "medication",
  "photo_update",
  "incident",
  "potty",
  "rest",
] as const;

export type CareTimelineEventType = (typeof CARE_TIMELINE_EVENT_TYPES)[number];
export type CareTimelineActor = "system" | "caregiver";

export type CareTimelineEvent = {
  id: string;
  type: CareTimelineEventType;
  createdAtISO: string;
  actor?: CareTimelineActor;
  note?: string;
  photoUri?: string;
};

export type CareTimelineEventInput = Omit<
  CareTimelineEvent,
  "id" | "createdAtISO"
> & {
  id?: string;
  createdAtISO?: string;
};

function makeTimelineId(prefix = "tle") {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${t}_${r}`;
}

function isTimelineEventType(value: unknown): value is CareTimelineEventType {
  return (
    typeof value === "string" &&
    (CARE_TIMELINE_EVENT_TYPES as readonly string[]).includes(value)
  );
}

function normalizeCreatedAtISO(value: unknown, fallback: string) {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function normalizeTimelineEvent(
  value: unknown,
  fallbackCreatedAtISO: string,
): CareTimelineEvent | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;

  if (!isTimelineEventType(record.type)) return null;

  return {
    id:
      typeof record.id === "string" && record.id.length > 0
        ? record.id
        : makeTimelineId(),
    type: record.type,
    createdAtISO: normalizeCreatedAtISO(
      record.createdAtISO,
      fallbackCreatedAtISO,
    ),
    actor:
      record.actor === "system" || record.actor === "caregiver"
        ? record.actor
        : undefined,
    note: typeof record.note === "string" ? record.note : undefined,
    photoUri: typeof record.photoUri === "string" ? record.photoUri : undefined,
  };
}

export function sortTimelineEvents(events: CareTimelineEvent[]) {
  return [...events].sort((a, b) => {
    const byDate = a.createdAtISO.localeCompare(b.createdAtISO);
    if (byDate !== 0) return byDate;
    return a.id.localeCompare(b.id);
  });
}

export function createTimelineEvent(
  input: CareTimelineEventInput,
): CareTimelineEvent {
  return {
    id: input.id && input.id.length > 0 ? input.id : makeTimelineId(),
    type: input.type,
    createdAtISO: normalizeCreatedAtISO(
      input.createdAtISO,
      new Date().toISOString(),
    ),
    actor: input.actor,
    note: input.note,
    photoUri: input.photoUri,
  };
}

export function createBookingCreatedEvent(createdAtISO?: string) {
  return createTimelineEvent({
    type: "booking_created",
    actor: "system",
    createdAtISO,
  });
}

export function createBookingCancelledEvent(createdAtISO?: string) {
  return createTimelineEvent({
    type: "booking_cancelled",
    actor: "system",
    createdAtISO,
  });
}

export function normalizeTimelineEvents(
  value: unknown,
  fallbackCreatedAtISO: string,
  options?: {
    includeCancelledEvent?: boolean;
  },
) {
  const events = Array.isArray(value)
    ? value
        .map((item) => normalizeTimelineEvent(item, fallbackCreatedAtISO))
        .filter((item): item is CareTimelineEvent => item !== null)
    : [];

  if (!events.some((event) => event.type === "booking_created")) {
    events.unshift(createBookingCreatedEvent(fallbackCreatedAtISO));
  }

  if (
    options?.includeCancelledEvent &&
    !events.some((event) => event.type === "booking_cancelled")
  ) {
    events.push(createBookingCancelledEvent(fallbackCreatedAtISO));
  }

  return sortTimelineEvents(events);
}

export function getTimelineEventLabel(type: CareTimelineEventType) {
  switch (type) {
    case "booking_created":
      return "Reserva creada";
    case "booking_cancelled":
      return "Reserva cancelada";
    case "feeding":
      return "Alimentacion";
    case "snack":
      return "Snack";
    case "water":
      return "Agua";
    case "playtime":
      return "Juego";
    case "socialization":
      return "Socializacion";
    case "nap":
      return "Siesta";
    case "walk":
      return "Paseo";
    case "grooming":
      return "Grooming";
    case "bath":
      return "Bano";
    case "brushing":
      return "Cepillado";
    case "massage":
      return "Masaje";
    case "medication":
      return "Medicacion";
    case "photo_update":
      return "Foto";
    case "incident":
      return "Incidente";
    case "potty":
      return "Bano";
    case "rest":
      return "Descanso";
  }
}

export function getTimelineEventIcon(type: CareTimelineEventType) {
  switch (type) {
    case "booking_created":
      return "playlist-plus";
    case "booking_cancelled":
      return "calendar-remove";
    case "feeding":
      return "food-drumstick";
    case "snack":
      return "bone";
    case "water":
      return "cup-water";
    case "playtime":
      return "soccer";
    case "socialization":
      return "account-group";
    case "nap":
      return "sleep";
    case "walk":
      return "walk";
    case "grooming":
      return "content-cut";
    case "bath":
      return "shower";
    case "brushing":
      return "brush";
    case "massage":
      return "hand-heart";
    case "medication":
      return "medical-bag";
    case "photo_update":
      return "camera";
    case "incident":
      return "alert-circle";
    case "potty":
      return "dog-service";
    case "rest":
      return "sofa";
  }
}
