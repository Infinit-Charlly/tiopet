import { create } from "zustand";

export type BookingStatus = "pendiente" | "confirmada" | "cancelada";

export type Booking = {
  id: string;

  petName: string;
  petType: "Perro" | "Gato";

  planId: "bb" | "consientan" | "principe";
  planName: string;

  careTime: "day" | "full";
  careTimeLabel: string;

  city: string;
  dateLabel: string;
  totalUSD: string;

  status: BookingStatus;
  createdAt: number;
};

type BookingsState = {
  bookings: Booking[];
  addBooking: (b: Omit<Booking, "id">) => void;
  cancelBooking: (id: string) => void; // MVP: opcional
};

export const useBookingsStore = create<BookingsState>((set) => ({
  bookings: [],
  addBooking: (b) =>
    set((s) => ({
      bookings: [
        {
          ...b,
          id:
            // crypto suele estar disponible en RN/Expo moderno
            // si no, cae a Date.now()
            (globalThis as any).crypto?.randomUUID?.() ?? String(Date.now()),
        },
        ...s.bookings,
      ],
    })),
  cancelBooking: (id) =>
    set((s) => ({
      bookings: s.bookings.map((x) =>
        x.id === id ? { ...x, status: "cancelada" } : x,
      ),
    })),
}));
