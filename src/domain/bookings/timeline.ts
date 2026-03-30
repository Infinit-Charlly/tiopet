const CARE_TIMELINE_EVENT_TYPES = [
  "booking_created",
  "booking_confirmed",
  "booking_cancelled",
  "check_in",
  "check_out",
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

const IMMUTABLE_TIMELINE_EVENT_TYPES = new Set<CareTimelineEventType>([
  "booking_created",
  "booking_confirmed",
  "booking_cancelled",
  "check_in",
  "check_out",
]);

const MUTABLE_CARE_TIMELINE_EVENT_TYPES = new Set<CareTimelineEventType>([
  "feeding",
  "snack",
  "playtime",
  "walk",
  "nap",
  "photo_update",
  "incident",
]);

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

export function sortTimelineEventsDescending(events: CareTimelineEvent[]) {
  return sortTimelineEvents(events).reverse();
}

export type CareEventServiceWindowValidationReason =
  | "before_check_in"
  | "after_check_out"
  | "in_future";

export function validateCareEventCreatedAtISOWithinServiceWindow(input: {
  timeline: CareTimelineEvent[];
  createdAtISO: string;
  nowISO?: string;
}) {
  const nextCreatedAt = Date.parse(input.createdAtISO);

  if (Number.isNaN(nextCreatedAt)) {
    return {
      ok: false as const,
      reason: "in_future" as const,
    };
  }

  const sortedTimeline = sortTimelineEvents(input.timeline);
  const checkInEvent =
    sortedTimeline.find((event) => event.type === "check_in") ?? null;

  if (!checkInEvent) {
    return {
      ok: false as const,
      reason: "before_check_in" as const,
      boundaryISO: undefined,
    };
  }

  if (input.createdAtISO.localeCompare(checkInEvent.createdAtISO) < 0) {
    return {
      ok: false as const,
      reason: "before_check_in" as const,
      boundaryISO: checkInEvent.createdAtISO,
    };
  }

  const checkOutEvent =
    [...sortedTimeline].reverse().find((event) => event.type === "check_out") ?? null;

  if (checkOutEvent) {
    if (input.createdAtISO.localeCompare(checkOutEvent.createdAtISO) > 0) {
      return {
        ok: false as const,
        reason: "after_check_out" as const,
        boundaryISO: checkOutEvent.createdAtISO,
      };
    }
  } else {
    const nowISO = input.nowISO ?? new Date().toISOString();

    if (input.createdAtISO.localeCompare(nowISO) > 0) {
      return {
        ok: false as const,
        reason: "in_future" as const,
        boundaryISO: nowISO,
      };
    }
  }

  return {
    ok: true as const,
  };
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

export function createBookingConfirmedEvent(createdAtISO?: string) {
  return createTimelineEvent({
    type: "booking_confirmed",
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

export function createCheckInEvent(createdAtISO?: string) {
  return createTimelineEvent({
    type: "check_in",
    actor: "system",
    createdAtISO,
  });
}

export function createCheckOutEvent(createdAtISO?: string) {
  return createTimelineEvent({
    type: "check_out",
    actor: "system",
    createdAtISO,
  });
}

export function normalizeTimelineEvents(
  value: unknown,
  fallbackCreatedAtISO: string,
  options?: {
    includeConfirmedEvent?: boolean;
    includeCancelledEvent?: boolean;
    includeCheckInEventAtISO?: string;
    includeCheckOutEventAtISO?: string;
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
    options?.includeConfirmedEvent &&
    !events.some((event) => event.type === "booking_confirmed")
  ) {
    events.push(createBookingConfirmedEvent(fallbackCreatedAtISO));
  }

  if (
    options?.includeCancelledEvent &&
    !events.some((event) => event.type === "booking_cancelled")
  ) {
    events.push(createBookingCancelledEvent(fallbackCreatedAtISO));
  }

  if (
    options?.includeCheckInEventAtISO &&
    !events.some((event) => event.type === "check_in")
  ) {
    events.push(createCheckInEvent(options.includeCheckInEventAtISO));
  }

  if (
    options?.includeCheckOutEventAtISO &&
    !events.some((event) => event.type === "check_out")
  ) {
    events.push(createCheckOutEvent(options.includeCheckOutEventAtISO));
  }

  return sortTimelineEvents(events);
}

export function canMutateTimelineEvent(
  event: unknown,
): event is CareTimelineEvent {
  if (!event || typeof event !== "object") return false;

  const record = event as Partial<CareTimelineEvent>;

  if (!isTimelineEventType(record.type)) return false;
  if (IMMUTABLE_TIMELINE_EVENT_TYPES.has(record.type)) return false;

  return (
    record.actor === "caregiver" &&
    MUTABLE_CARE_TIMELINE_EVENT_TYPES.has(record.type)
  );
}

export function getTimelineEventLabel(type: CareTimelineEventType) {
  switch (type) {
    case "booking_created":
      return "Reserva creada";
    case "booking_confirmed":
      return "Reserva confirmada";
    case "booking_cancelled":
      return "Reserva cancelada";
    case "check_in":
      return "Check-in";
    case "check_out":
      return "Check-out";
    case "feeding":
      return "Alimento";
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
    case "booking_confirmed":
      return "check-decagram";
    case "booking_cancelled":
      return "calendar-remove";
    case "check_in":
      return "login";
    case "check_out":
      return "logout";
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
