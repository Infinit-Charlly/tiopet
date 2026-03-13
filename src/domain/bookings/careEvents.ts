import type { BookingQrPhase } from "./qr";
import type { CareTimelineEventType } from "./timeline";

export const BOOKING_CARE_EVENT_TYPES = [
  "feeding",
  "snack",
  "playtime",
  "walk",
  "nap",
  "photo_update",
  "incident",
] as const satisfies readonly CareTimelineEventType[];

export type BookingCareEventType = (typeof BOOKING_CARE_EVENT_TYPES)[number];

export type BookingCareEventDefinition = {
  type: BookingCareEventType;
  label: string;
  description: string;
  noteLabel: string;
  notePlaceholder: string;
  helperText?: string;
  requiresNote?: boolean;
};

const BOOKING_CARE_EVENT_DEFINITIONS: Record<
  BookingCareEventType,
  BookingCareEventDefinition
> = {
  feeding: {
    type: "feeding",
    label: "Alimentacion",
    description: "Registra cuando el peludito ya comio.",
    noteLabel: "Nota opcional",
    notePlaceholder: "Ej. Comio todo y tomo agua.",
  },
  snack: {
    type: "snack",
    label: "Snack",
    description: "Deja constancia de un premio o snack supervisado.",
    noteLabel: "Nota opcional",
    notePlaceholder: "Ej. Premio pequeno despues del paseo.",
  },
  playtime: {
    type: "playtime",
    label: "Juego",
    description: "Marca una sesion corta de juego o estimulo.",
    noteLabel: "Nota opcional",
    notePlaceholder: "Ej. Juego con pelota durante 15 minutos.",
  },
  walk: {
    type: "walk",
    label: "Paseo",
    description: "Registra una salida o paseo supervisado.",
    noteLabel: "Nota opcional",
    notePlaceholder: "Ej. Paseo corto y tranquilo.",
  },
  nap: {
    type: "nap",
    label: "Siesta",
    description: "Indica que la mascota estuvo descansando.",
    noteLabel: "Nota opcional",
    notePlaceholder: "Ej. Durmio en zona tranquila.",
  },
  photo_update: {
    type: "photo_update",
    label: "Foto",
    description: "En este MVP solo registramos la descripcion del update.",
    noteLabel: "Descripcion opcional",
    notePlaceholder: "Ej. Foto en area de juegos con otros perritos.",
    helperText: "La carga de imagen real todavia no esta incluida en esta version.",
  },
  incident: {
    type: "incident",
    label: "Incidente",
    description: "Usa este evento para dejar una novedad importante.",
    noteLabel: "Detalle obligatorio",
    notePlaceholder: "Describe que paso y como se atendio.",
    helperText: "Los incidentes necesitan una nota clara para dejar trazabilidad local.",
    requiresNote: true,
  },
};

export function getBookingCareEventDefinitions() {
  return BOOKING_CARE_EVENT_TYPES.map(
    (type) => BOOKING_CARE_EVENT_DEFINITIONS[type],
  );
}

export function getBookingCareEventDefinition(type: BookingCareEventType) {
  return BOOKING_CARE_EVENT_DEFINITIONS[type];
}

export function canRegisterBookingCareEvents(phase: BookingQrPhase) {
  return phase === "checked_in";
}

export function getBookingCareGateMessage(phase: BookingQrPhase) {
  switch (phase) {
    case "pending_confirmation":
      return "Confirma la reserva y completa el check-in antes de registrar cuidados.";
    case "ready_for_check_in":
      return "Todavia falta consumir el QR de check-in para abrir el registro de cuidados.";
    case "checked_in":
      return "La mascota ya esta en cuidado y se pueden registrar eventos locales.";
    case "checked_out":
      return "El cuidado ya termino. No agregamos eventos despues del check-out.";
    case "disabled":
      return "Esta reserva ya no tiene un flujo activo para registrar cuidados.";
  }
}

export function validateBookingCareEventDraft(input: {
  type: BookingCareEventType;
  note: string;
}) {
  const definition = getBookingCareEventDefinition(input.type);
  const normalizedNote = input.note.trim();

  if (definition.requiresNote && normalizedNote.length === 0) {
    return {
      ok: false as const,
      error: "Agrega una nota para registrar el incidente.",
    };
  }

  return {
    ok: true as const,
    note: normalizedNote || undefined,
  };
}
