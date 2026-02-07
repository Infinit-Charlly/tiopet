import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export type BookingStatus = "pendiente" | "confirmada" | "cancelada";
export type TransportType = "ida" | "vuelta" | "ida_vuelta";

export type Booking = {
  id: string;
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
};

type BookingsState = {
  bookings: Booking[];
  hydrated: boolean;

  addBooking: (b: Booking) => void;
  cancelBooking: (id: string) => void;

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

  const fixed = list.map((b) => {
    if (!b.id || seen.has(b.id)) {
      changed = true;
      const newId = makeId("b");
      seen.add(newId);
      return { ...b, id: newId };
    }
    seen.add(b.id);
    return b;
  });

  return { fixed, changed };
}

export const useBookingsStore = create<BookingsState>((set, get) => ({
  bookings: [],
  hydrated: false,

  addBooking: (b) => {
    const ids = new Set(get().bookings.map((x) => x.id));
    const safe = ids.has(b.id) ? { ...b, id: makeId("b") } : b;

    set((s) => ({ bookings: [safe, ...s.bookings] }));
    void get().persist();
  },

  cancelBooking: (id) => {
    set((s) => ({
      bookings: s.bookings.map((b) =>
        b.id === id && b.status === "pendiente"
          ? { ...b, status: "cancelada" }
          : b,
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
      const parsed = raw ? (JSON.parse(raw) as Booking[]) : [];
      const { fixed, changed } = fixDuplicateIds(parsed);

      set({ bookings: fixed, hydrated: true });
      if (changed)
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fixed));
    } catch {
      set({ hydrated: true });
    }
  },

  clearAll: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ bookings: [] });
  },
}));
