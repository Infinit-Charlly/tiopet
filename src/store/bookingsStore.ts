import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import {
  createBookingCancelledEvent,
  createTimelineEvent,
  normalizeTimelineEvents,
  sortTimelineEvents,
  type CareTimelineEvent,
  type CareTimelineEventInput,
  type TransportType,
} from "../domain/bookings";

export type BookingStatus = "pendiente" | "confirmada" | "cancelada";
export type { TransportType } from "../domain/bookings";

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
  timeline: CareTimelineEvent[];
};

type BookingsState = {
  bookings: Booking[];
  hydrated: boolean;

  addBooking: (booking: Booking) => void;
  confirmBooking: (id: string) => void;
  cancelBooking: (id: string) => void;
  addTimelineEvent: (bookingId: string, event: CareTimelineEventInput) => void;

  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
  clearAll: () => Promise<void>;
};

const STORAGE_KEY = "tiopet_bookings_v1";

function makeId(prefix = "b") {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${t}_${r}`;
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
  const createdAtISO =
    typeof raw.createdAtISO === "string" && raw.createdAtISO.length > 0
      ? raw.createdAtISO
      : new Date().toISOString();
  const status = normalizeBookingStatus(raw.status);
  const transportNeeded = raw.transportNeeded === true;

  return {
    id: typeof raw.id === "string" && raw.id.length > 0 ? raw.id : makeId("b"),
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
    timeline: normalizeTimelineEvents(raw.timeline, createdAtISO, {
      includeCancelledEvent: status === "cancelada",
    }),
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
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.id === id && booking.status === "pendiente"
          ? { ...booking, status: "confirmada" }
          : booking,
      ),
    }));
    void get().persist();
  },

  cancelBooking: (id) => {
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.id === id && booking.status === "pendiente"
          ? appendTimelineEvent(
              { ...booking, status: "cancelada" },
              createBookingCancelledEvent(),
            )
          : booking,
      ),
    }));
    void get().persist();
  },

  addTimelineEvent: (bookingId, event) => {
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.id === bookingId ? appendTimelineEvent(booking, event) : booking,
      ),
    }));
    void get().persist();
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
        normalizeHydratedBooking(item as Partial<Booking> & Record<string, unknown>),
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

