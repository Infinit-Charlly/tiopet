import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import {
  activateBookingQr,
  BOOKING_CARE_EVENT_TYPES,
  canMutateTimelineEvent,
  consumeBookingQr as consumeBookingQrState,
  createBookingCancelledEvent,
  createBookingConfirmedEvent,
  createCheckInEvent,
  createCheckOutEvent,
  createTimelineEvent,
  disableBookingQr,
  hasCompleteWalkSummary,
  normalizeBookingQrState,
  normalizeTimelineEvents,
  sortTimelineEvents,
  validateCareEventCreatedAtISOWithinServiceWindow,
  validateBookingCareEventDraft,
  type BookingCareEventType,
  type BookingQrConsumeError,
  type BookingQrIntent,
  type BookingQrState,
  type CareTimelineEvent,
  type CareTimelineEventInput,
  type TransportType,
} from "../domain/bookings";

export type BookingStatus = "pendiente" | "confirmada" | "cancelada";
export type {
  BookingQrIntent,
  BookingQrPhase,
  BookingQrState,
  TransportType,
} from "../domain/bookings";

export type Booking = {
  id: string;
  petId?: string;
  petName: string;
  petType: "Perro" | "Gato";
  planId: "bb" | "consientan" | "principe";
  planName: string;
  careTime: "day" | "full";
  city: string;
  dateLabel: string;
  totalUSD: string;
  status: BookingStatus;
  createdAtISO: string;
  transportNeeded?: boolean;
  transportType?: TransportType;
  qr: BookingQrState;
  timeline: CareTimelineEvent[];
};

export type ConsumeBookingQrResult =
  | {
      ok: true;
      phase: BookingQrState["phase"];
    }
  | {
      ok: false;
      reason: BookingQrConsumeError | "booking_not_found";
    };

export type TimelineMutationResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      reason:
        | "booking_not_found"
        | "event_not_found"
        | "event_not_mutable"
        | "invalid_type"
        | "invalid_note"
        | "invalid_created_at"
        | "walk_not_started"
        | "walk_not_finished"
        | "before_check_in"
        | "after_check_out"
        | "in_future";
    };

type TimelineEventPatch = {
  type?: BookingCareEventType;
  note?: string;
  createdAtISO?: string;
  photoUri?: string | null;
};

type BookingsState = {
  bookings: Booking[];
  hydrated: boolean;

  addBooking: (booking: Booking) => void;
  confirmBooking: (id: string) => void;
  cancelBooking: (id: string) => void;
  addTimelineEvent: (bookingId: string, event: CareTimelineEventInput) => TimelineMutationResult;
  updateTimelineEvent: (
    bookingId: string,
    eventId: string,
    patch: TimelineEventPatch,
  ) => TimelineMutationResult;
  deleteTimelineEvent: (
    bookingId: string,
    eventId: string,
  ) => TimelineMutationResult;
  consumeBookingQr: (
    bookingId: string,
    intent: BookingQrIntent,
    token: string,
  ) => ConsumeBookingQrResult;

  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
  clearAll: () => Promise<void>;
};

const STORAGE_KEY = "tiopet_bookings_v1";
const EDITABLE_TIMELINE_EVENT_TYPES = new Set<string>(BOOKING_CARE_EVENT_TYPES);

function makeId(prefix = "b") {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${t}_${r}`;
}

function isEditableTimelineEventType(
  value: unknown,
): value is BookingCareEventType {
  return typeof value === "string" && EDITABLE_TIMELINE_EVENT_TYPES.has(value);
}

function isValidTimelineCreatedAtISO(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    !Number.isNaN(Date.parse(value))
  );
}

function getWalkTimelineValidationReason(input: {
  type: BookingCareEventType;
  timeline: CareTimelineEvent[];
  walkStartedAtISO?: string;
  walkEndedAtISO?: string;
  durationSeconds?: number;
  distanceMeters?: number;
  routePoints?: CareTimelineEvent["routePoints"];
}) {
  if (input.type !== "walk") {
    return null;
  }

  if (!input.walkStartedAtISO) {
    return "walk_not_started" as const;
  }

  const hasWalkSummary = hasCompleteWalkSummary({
    type: input.type,
    walkStartedAtISO: input.walkStartedAtISO,
    walkEndedAtISO: input.walkEndedAtISO,
    durationSeconds: input.durationSeconds,
    distanceMeters: input.distanceMeters,
    routePoints: input.routePoints,
  });

  if (!hasWalkSummary) {
    return "walk_not_finished" as const;
  }

  const startWindowValidation = validateCareEventCreatedAtISOWithinServiceWindow({
    timeline: input.timeline,
    createdAtISO: input.walkStartedAtISO,
  });

  if (!startWindowValidation.ok) {
    return startWindowValidation.reason;
  }

  const endWindowValidation = validateCareEventCreatedAtISOWithinServiceWindow({
    timeline: input.timeline,
    createdAtISO: input.walkEndedAtISO!,
  });

  if (!endWindowValidation.ok) {
    return endWindowValidation.reason;
  }

  return null;
}

function fixDuplicateIds(list: Booking[]) {
  const seen = new Set<string>();
  let changed = false;

  const fixed = list.map((booking) => {
    if (!booking.id || seen.has(booking.id)) {
      changed = true;
      const newId = makeId("b");
      seen.add(newId);
      return { ...booking, id: newId };
    }

    seen.add(booking.id);
    return booking;
  });

  return { fixed, changed };
}

function mergeHydratedBookings(current: Booking[], hydrated: Booking[]) {
  const currentIds = new Set(current.map((booking) => booking.id));

  return [
    ...current,
    ...hydrated.filter((booking) => !currentIds.has(booking.id)),
  ];
}

function normalizeBookingStatus(value: unknown): BookingStatus {
  if (value === "confirmada" || value === "cancelada") return value;
  return "pendiente";
}

function normalizeTransportType(value: unknown) {
  return value === "ida" || value === "vuelta" || value === "ida_vuelta"
    ? value
    : undefined;
}

function normalizeHydratedBooking(
  raw: Partial<Booking> & Record<string, unknown>,
): Booking {
  const id =
    typeof raw.id === "string" && raw.id.length > 0 ? raw.id : makeId("b");
  const createdAtISO =
    typeof raw.createdAtISO === "string" && raw.createdAtISO.length > 0
      ? raw.createdAtISO
      : new Date().toISOString();
  const status = normalizeBookingStatus(raw.status);
  const transportNeeded = raw.transportNeeded === true;
  const timelineBase = normalizeTimelineEvents(raw.timeline, createdAtISO, {
    includeConfirmedEvent: status === "confirmada",
    includeCancelledEvent: status === "cancelada",
  });
  const qr = normalizeBookingQrState(raw.qr, {
    bookingId: id,
    createdAtISO,
    status,
    timeline: timelineBase,
  });
  const timeline = normalizeTimelineEvents(timelineBase, createdAtISO, {
    includeConfirmedEvent: status === "confirmada",
    includeCancelledEvent: status === "cancelada",
    includeCheckInEventAtISO: qr.checkIn.consumedAtISO,
    includeCheckOutEventAtISO: qr.checkOut.consumedAtISO,
  });

  return {
    id,
    petId:
      typeof raw.petId === "string" && raw.petId.length > 0
        ? raw.petId
        : undefined,
    petName: typeof raw.petName === "string" ? raw.petName : "Mascota",
    petType: raw.petType === "Gato" ? "Gato" : "Perro",
    planId:
      raw.planId === "consientan" || raw.planId === "principe"
        ? raw.planId
        : "bb",
    planName: typeof raw.planName === "string" ? raw.planName : "Plan",
    careTime: raw.careTime === "full" ? "full" : "day",
    city: typeof raw.city === "string" ? raw.city : "Latacunga",
    dateLabel: typeof raw.dateLabel === "string" ? raw.dateLabel : "-",
    totalUSD: typeof raw.totalUSD === "string" ? raw.totalUSD : "$0.00",
    status,
    createdAtISO,
    transportNeeded,
    transportType: transportNeeded
      ? normalizeTransportType(raw.transportType)
      : undefined,
    qr,
    timeline,
  };
}

function appendTimelineEvent(
  booking: Booking,
  event: CareTimelineEventInput,
): Booking {
  return {
    ...booking,
    timeline: sortTimelineEvents([
      ...booking.timeline,
      createTimelineEvent(event),
    ]),
  };
}

export const useBookingsStore = create<BookingsState>((set, get) => ({
  bookings: [],
  hydrated: false,

  addBooking: (booking) => {
    const ids = new Set(get().bookings.map((item) => item.id));
    const safeBooking = normalizeHydratedBooking(
      ids.has(booking.id) ? { ...booking, id: makeId("b") } : booking,
    );

    set((state) => ({ bookings: [safeBooking, ...state.bookings] }));
    void get().persist();
  },

  confirmBooking: (id) => {
    const confirmedAtISO = new Date().toISOString();
    let didChange = false;

    set((state) => ({
      bookings: state.bookings.map((booking) => {
        if (booking.id !== id || booking.status !== "pendiente") {
          return booking;
        }

        didChange = true;

        return appendTimelineEvent(
          {
            ...booking,
            status: "confirmada",
            qr: activateBookingQr(booking.qr, confirmedAtISO),
          },
          createBookingConfirmedEvent(confirmedAtISO),
        );
      }),
    }));

    if (didChange) {
      void get().persist();
    }
  },

  cancelBooking: (id) => {
    const cancelledAtISO = new Date().toISOString();
    let didChange = false;

    set((state) => ({
      bookings: state.bookings.map((booking) => {
        if (booking.id !== id || booking.status !== "pendiente") {
          return booking;
        }

        didChange = true;

        return appendTimelineEvent(
          {
            ...booking,
            status: "cancelada",
            qr: disableBookingQr(booking.qr, cancelledAtISO),
          },
          createBookingCancelledEvent(cancelledAtISO),
        );
      }),
    }));

    if (didChange) {
      void get().persist();
    }
  },

  addTimelineEvent: (bookingId, event) => {
    let didChange = false;
    let result: TimelineMutationResult = {
      ok: false,
      reason: "booking_not_found",
    };

    set((state) => ({
      bookings: state.bookings.map((booking) => {
        if (booking.id !== bookingId) {
          return booking;
        }

        if (!isEditableTimelineEventType(event.type)) {
          result = {
            ok: false,
            reason: "invalid_type",
          };
          return booking;
        }

        const validation = validateBookingCareEventDraft({
          type: event.type,
          note: event.note ?? "",
        });

        if (!validation.ok) {
          result = {
            ok: false,
            reason: "invalid_note",
          };
          return booking;
        }

        const nextCreatedAtISO = event.createdAtISO ?? new Date().toISOString();
        const nextWalkValidationReason = getWalkTimelineValidationReason({
          type: event.type,
          timeline: booking.timeline,
          walkStartedAtISO: event.walkStartedAtISO,
          walkEndedAtISO: event.walkEndedAtISO,
          durationSeconds: event.durationSeconds,
          distanceMeters: event.distanceMeters,
          routePoints: event.routePoints,
        });

        if (!isValidTimelineCreatedAtISO(nextCreatedAtISO)) {
          result = {
            ok: false,
            reason: "invalid_created_at",
          };
          return booking;
        }

        const windowValidation = validateCareEventCreatedAtISOWithinServiceWindow({
          timeline: booking.timeline,
          createdAtISO: nextCreatedAtISO,
        });

        if (!windowValidation.ok) {
          result = {
            ok: false,
            reason: windowValidation.reason,
          };
          return booking;
        }

        if (nextWalkValidationReason) {
          result = {
            ok: false,
            reason: nextWalkValidationReason,
          };
          return booking;
        }

        didChange = true;
        result = { ok: true };

        return appendTimelineEvent(booking, {
          ...event,
          actor: event.actor ?? "caregiver",
          note: validation.note,
          photoUri: event.photoUri,
          createdAtISO:
            event.type === "walk" ? event.walkStartedAtISO : nextCreatedAtISO,
        });
      }),
    }));

    if (didChange) {
      void get().persist();
    }

    return result;
  },

  updateTimelineEvent: (bookingId, eventId, patch) => {
    let didChange = false;
    let result: TimelineMutationResult = {
      ok: false,
      reason: "booking_not_found",
    };

    set((state) => ({
      bookings: state.bookings.map((booking) => {
        if (booking.id !== bookingId) {
          return booking;
        }

        result = {
          ok: false,
          reason: "event_not_found",
        };

        const eventIndex = booking.timeline.findIndex((event) => event.id === eventId);

        if (eventIndex === -1) {
          return booking;
        }

        const currentEvent = booking.timeline[eventIndex];

        if (!canMutateTimelineEvent(currentEvent)) {
          result = {
            ok: false,
            reason: "event_not_mutable",
          };
          return booking;
        }

        const nextType = patch.type ?? currentEvent.type;

        if (!isEditableTimelineEventType(nextType)) {
          result = {
            ok: false,
            reason: "invalid_type",
          };
          return booking;
        }

        const validation = validateBookingCareEventDraft({
          type: nextType,
          note: patch.note ?? currentEvent.note ?? "",
        });

        if (!validation.ok) {
          result = {
            ok: false,
            reason: "invalid_note",
          };
          return booking;
        }

        const nextCreatedAtISO = patch.createdAtISO ?? currentEvent.createdAtISO;
        const nextWalkStartedAtISO =
          nextType === "walk" ? currentEvent.walkStartedAtISO : undefined;
        const nextWalkEndedAtISO =
          nextType === "walk" ? currentEvent.walkEndedAtISO : undefined;
        const nextDurationSeconds =
          nextType === "walk" ? currentEvent.durationSeconds : undefined;
        const nextDistanceMeters =
          nextType === "walk" ? currentEvent.distanceMeters : undefined;
        const nextRoutePoints =
          nextType === "walk" ? currentEvent.routePoints : undefined;
        const nextWalkValidationReason = getWalkTimelineValidationReason({
          type: nextType,
          timeline: booking.timeline,
          walkStartedAtISO: nextWalkStartedAtISO,
          walkEndedAtISO: nextWalkEndedAtISO,
          durationSeconds: nextDurationSeconds,
          distanceMeters: nextDistanceMeters,
          routePoints: nextRoutePoints,
        });

        if (!isValidTimelineCreatedAtISO(nextCreatedAtISO)) {
          result = {
            ok: false,
            reason: "invalid_created_at",
          };
          return booking;
        }

        const windowValidation = validateCareEventCreatedAtISOWithinServiceWindow({
          timeline: booking.timeline,
          createdAtISO: nextCreatedAtISO,
        });

        if (!windowValidation.ok) {
          result = {
            ok: false,
            reason: windowValidation.reason,
          };
          return booking;
        }

        if (nextWalkValidationReason) {
          result = {
            ok: false,
            reason: nextWalkValidationReason,
          };
          return booking;
        }

        const updatedEvent: CareTimelineEvent = {
          ...currentEvent,
          type: nextType,
          note: validation.note,
          createdAtISO:
            nextType === "walk" ? nextWalkStartedAtISO! : nextCreatedAtISO,
          photoUri:
            patch.photoUri === null
              ? undefined
              : patch.photoUri ?? currentEvent.photoUri,
          walkStartedAtISO: nextWalkStartedAtISO,
          walkEndedAtISO: nextWalkEndedAtISO,
          durationSeconds: nextDurationSeconds,
          distanceMeters: nextDistanceMeters,
          routePoints: nextRoutePoints,
        };

        result = { ok: true };

        if (
          updatedEvent.type === currentEvent.type &&
          updatedEvent.note === currentEvent.note &&
          updatedEvent.createdAtISO === currentEvent.createdAtISO &&
          updatedEvent.photoUri === currentEvent.photoUri
        ) {
          return booking;
        }

        didChange = true;

        const nextTimeline = booking.timeline.map((event, index) =>
          index === eventIndex ? updatedEvent : event,
        );

        return {
          ...booking,
          timeline: sortTimelineEvents(nextTimeline),
        };
      }),
    }));

    if (didChange) {
      void get().persist();
    }

    return result;
  },

  deleteTimelineEvent: (bookingId, eventId) => {
    let didChange = false;
    let result: TimelineMutationResult = {
      ok: false,
      reason: "booking_not_found",
    };

    set((state) => ({
      bookings: state.bookings.map((booking) => {
        if (booking.id !== bookingId) {
          return booking;
        }

        result = {
          ok: false,
          reason: "event_not_found",
        };

        const currentEvent = booking.timeline.find((event) => event.id === eventId);

        if (!currentEvent) {
          return booking;
        }

        if (!canMutateTimelineEvent(currentEvent)) {
          result = {
            ok: false,
            reason: "event_not_mutable",
          };
          return booking;
        }

        didChange = true;
        result = { ok: true };

        return {
          ...booking,
          timeline: booking.timeline.filter((event) => event.id !== eventId),
        };
      }),
    }));

    if (didChange) {
      void get().persist();
    }

    return result;
  },

  consumeBookingQr: (bookingId, intent, token) => {
    let didChange = false;
    let result: ConsumeBookingQrResult = {
      ok: false,
      reason: "booking_not_found",
    };

    set((state) => ({
      bookings: state.bookings.map((booking) => {
        if (booking.id !== bookingId) {
          return booking;
        }

        const consumedAtISO = new Date().toISOString();
        const outcome = consumeBookingQrState(booking.qr, {
          intent,
          token,
          consumedAtISO,
        });

        if ("reason" in outcome) {
          result = {
            ok: false,
            reason: outcome.reason,
          };
          return booking;
        }

        didChange = true;
        result = {
          ok: true,
          phase: outcome.qr.phase,
        };

        return appendTimelineEvent(
          {
            ...booking,
            qr: outcome.qr,
          },
          intent === "check_in"
            ? createCheckInEvent(consumedAtISO)
            : createCheckOutEvent(consumedAtISO),
        );
      }),
    }));

    if (didChange) {
      void get().persist();
    }

    return result;
  },

  persist: async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(get().bookings));
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      const list = Array.isArray(parsed) ? parsed : [];
      const normalized = list.map((item) =>
        normalizeHydratedBooking(
          item as Partial<Booking> & Record<string, unknown>,
        ),
      );
      const { fixed, changed } = fixDuplicateIds(normalized);
      const nextRaw = JSON.stringify(fixed);

      set((state) => ({
        bookings: mergeHydratedBookings(state.bookings, fixed),
        hydrated: true,
      }));

      if (changed || raw !== nextRaw) {
        await AsyncStorage.setItem(STORAGE_KEY, nextRaw);
      }
    } catch {
      set({ hydrated: true });
    }
  },

  clearAll: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ bookings: [] });
  },
}));




