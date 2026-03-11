import type { CareTimelineEvent, CareTimelineEventType } from "./timeline";

export type BookingQrIntent = "check_in" | "check_out";
export type BookingQrPhase =
  | "pending_confirmation"
  | "ready_for_check_in"
  | "checked_in"
  | "checked_out"
  | "disabled";

export type BookingQrCode = {
  token: string;
  issuedAtISO: string;
  consumedAtISO?: string;
};

export type BookingQrState = {
  version: 1;
  phase: BookingQrPhase;
  updatedAtISO: string;
  checkIn: BookingQrCode;
  checkOut: BookingQrCode;
};

export type BookingQrStatusLike = "pendiente" | "confirmada" | "cancelada";

export type BookingQrConsumeError =
  | "missing_token"
  | "invalid_token"
  | "booking_not_confirmed"
  | "wrong_stage"
  | "already_consumed"
  | "booking_inactive";

export type BookingQrConsumeResult =
  | {
      ok: true;
      qr: BookingQrState;
    }
  | {
      ok: false;
      reason: BookingQrConsumeError;
    };

const BOOKING_QR_VERSION = 1 as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function normalizeISO(value: unknown, fallback: string) {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function isBookingQrPhase(value: unknown): value is BookingQrPhase {
  return (
    value === "pending_confirmation" ||
    value === "ready_for_check_in" ||
    value === "checked_in" ||
    value === "checked_out" ||
    value === "disabled"
  );
}

function makeOpaqueChunk() {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 10);
  return `${t}${r}`.toUpperCase().slice(0, 12);
}

function shortBookingKey(bookingId: string) {
  const compact = bookingId.replace(/[^a-z0-9]/gi, "").toUpperCase();
  return compact.slice(-6) || "BOOKING";
}

function hashToken(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36).toUpperCase();
}

function makeBookingQrToken(
  bookingId: string,
  intent: BookingQrIntent,
  issuedAtISO: string,
) {
  const nonce = makeOpaqueChunk();
  const prefix = intent === "check_in" ? "IN" : "OUT";
  const publicBookingKey = shortBookingKey(bookingId);
  const signature = hashToken(`${bookingId}.${intent}.${issuedAtISO}.${nonce}`)
    .slice(-8)
    .padStart(8, "0");

  return `TP1-${prefix}-${publicBookingKey}-${nonce}-${signature}`;
}

function normalizeQrCode(value: unknown, fallback: BookingQrCode): BookingQrCode {
  if (!isRecord(value)) return fallback;

  return {
    token:
      typeof value.token === "string" && value.token.length > 0
        ? value.token
        : fallback.token,
    issuedAtISO: normalizeISO(value.issuedAtISO, fallback.issuedAtISO),
    consumedAtISO:
      typeof value.consumedAtISO === "string" && value.consumedAtISO.length > 0
        ? value.consumedAtISO
        : undefined,
  };
}

function findEventISO(
  timeline: CareTimelineEvent[] | undefined,
  type: CareTimelineEventType,
) {
  return timeline?.find((event) => event.type === type)?.createdAtISO;
}

function derivePhase(options: {
  status: BookingQrStatusLike;
  rawPhase?: BookingQrPhase;
  confirmedAtISO?: string;
  checkInAtISO?: string;
  checkOutAtISO?: string;
}) {
  const { status, rawPhase, confirmedAtISO, checkInAtISO, checkOutAtISO } = options;

  if (status === "cancelada") return "disabled" satisfies BookingQrPhase;
  if (checkOutAtISO || rawPhase === "checked_out") {
    return "checked_out" satisfies BookingQrPhase;
  }
  if (checkInAtISO || rawPhase === "checked_in") {
    return "checked_in" satisfies BookingQrPhase;
  }
  if (
    status === "confirmada" ||
    confirmedAtISO ||
    rawPhase === "ready_for_check_in"
  ) {
    return "ready_for_check_in" satisfies BookingQrPhase;
  }
  return "pending_confirmation" satisfies BookingQrPhase;
}

export function createBookingQrState(options: {
  bookingId: string;
  createdAtISO?: string;
  confirmed?: boolean;
}): BookingQrState {
  const issuedAtISO = options.createdAtISO ?? new Date().toISOString();

  return {
    version: BOOKING_QR_VERSION,
    phase: options.confirmed ? "ready_for_check_in" : "pending_confirmation",
    updatedAtISO: issuedAtISO,
    checkIn: {
      token: makeBookingQrToken(options.bookingId, "check_in", issuedAtISO),
      issuedAtISO,
    },
    checkOut: {
      token: makeBookingQrToken(options.bookingId, "check_out", issuedAtISO),
      issuedAtISO,
    },
  };
}

export function normalizeBookingQrState(
  value: unknown,
  options: {
    bookingId: string;
    createdAtISO: string;
    status: BookingQrStatusLike;
    timeline?: CareTimelineEvent[];
  },
): BookingQrState {
  const fallback = createBookingQrState({
    bookingId: options.bookingId,
    createdAtISO: options.createdAtISO,
    confirmed: options.status === "confirmada",
  });

  const rawPhase =
    isRecord(value) && isBookingQrPhase(value.phase) ? value.phase : undefined;
  const rawUpdatedAtISO =
    isRecord(value) && typeof value.updatedAtISO === "string"
      ? value.updatedAtISO
      : undefined;

  const base: BookingQrState = isRecord(value)
    ? {
        version: BOOKING_QR_VERSION,
        phase: rawPhase ?? fallback.phase,
        updatedAtISO: normalizeISO(rawUpdatedAtISO, fallback.updatedAtISO),
        checkIn: normalizeQrCode(value.checkIn, fallback.checkIn),
        checkOut: normalizeQrCode(value.checkOut, fallback.checkOut),
      }
    : fallback;

  const confirmedAtISO = findEventISO(options.timeline, "booking_confirmed");
  const checkInAtISO =
    base.checkIn.consumedAtISO ??
    findEventISO(options.timeline, "check_in") ??
    ((base.phase === "checked_in" || base.phase === "checked_out")
      ? base.updatedAtISO
      : undefined);
  const checkOutAtISO =
    base.checkOut.consumedAtISO ??
    findEventISO(options.timeline, "check_out") ??
    (base.phase === "checked_out" ? base.updatedAtISO : undefined);
  const phase = derivePhase({
    status: options.status,
    rawPhase: base.phase,
    confirmedAtISO,
    checkInAtISO,
    checkOutAtISO,
  });

  return {
    version: BOOKING_QR_VERSION,
    phase,
    updatedAtISO:
      checkOutAtISO ??
      checkInAtISO ??
      confirmedAtISO ??
      base.updatedAtISO ??
      options.createdAtISO,
    checkIn: {
      ...base.checkIn,
      consumedAtISO: checkInAtISO,
    },
    checkOut: {
      ...base.checkOut,
      consumedAtISO: checkOutAtISO,
    },
  };
}

export function activateBookingQr(
  qr: BookingQrState,
  confirmedAtISO = new Date().toISOString(),
): BookingQrState {
  if (qr.phase !== "pending_confirmation") {
    return {
      ...qr,
      updatedAtISO: confirmedAtISO,
    };
  }

  return {
    ...qr,
    phase: "ready_for_check_in",
    updatedAtISO: confirmedAtISO,
  };
}

export function disableBookingQr(
  qr: BookingQrState,
  updatedAtISO = new Date().toISOString(),
): BookingQrState {
  return {
    ...qr,
    phase: "disabled",
    updatedAtISO,
  };
}

export function getActiveBookingQrIntent(qr: BookingQrState): BookingQrIntent | null {
  if (qr.phase === "ready_for_check_in") return "check_in";
  if (qr.phase === "checked_in") return "check_out";
  return null;
}

export function getBookingQrCode(
  qr: BookingQrState,
  intent: BookingQrIntent,
): BookingQrCode {
  return intent === "check_in" ? qr.checkIn : qr.checkOut;
}

export function getActiveBookingQrCode(qr: BookingQrState) {
  const intent = getActiveBookingQrIntent(qr);
  return intent ? getBookingQrCode(qr, intent) : null;
}

export function consumeBookingQr(
  qr: BookingQrState,
  options: {
    intent: BookingQrIntent;
    token: string;
    consumedAtISO?: string;
  },
): BookingQrConsumeResult {
  const token = options.token.trim();

  if (!token) {
    return { ok: false, reason: "missing_token" };
  }

  if (qr.phase === "disabled") {
    return { ok: false, reason: "booking_inactive" };
  }

  const consumedAtISO = options.consumedAtISO ?? new Date().toISOString();

  if (options.intent === "check_in") {
    if (qr.checkIn.consumedAtISO || qr.phase === "checked_out") {
      return { ok: false, reason: "already_consumed" };
    }
    if (qr.phase === "pending_confirmation") {
      return { ok: false, reason: "booking_not_confirmed" };
    }
    if (qr.phase !== "ready_for_check_in") {
      return { ok: false, reason: "wrong_stage" };
    }
    if (token !== qr.checkIn.token) {
      return { ok: false, reason: "invalid_token" };
    }

    return {
      ok: true,
      qr: {
        ...qr,
        phase: "checked_in",
        updatedAtISO: consumedAtISO,
        checkIn: {
          ...qr.checkIn,
          consumedAtISO,
        },
      },
    };
  }

  if (qr.checkOut.consumedAtISO) {
    return { ok: false, reason: "already_consumed" };
  }
  if (qr.phase === "pending_confirmation") {
    return { ok: false, reason: "booking_not_confirmed" };
  }
  if (qr.phase !== "checked_in") {
    return { ok: false, reason: "wrong_stage" };
  }
  if (token !== qr.checkOut.token) {
    return { ok: false, reason: "invalid_token" };
  }

  return {
    ok: true,
    qr: {
      ...qr,
      phase: "checked_out",
      updatedAtISO: consumedAtISO,
      checkOut: {
        ...qr.checkOut,
        consumedAtISO,
      },
    },
  };
}

export function getBookingQrIntentLabel(intent: BookingQrIntent) {
  return intent === "check_in" ? "Check-in" : "Check-out";
}

export function getBookingQrPhaseLabel(phase: BookingQrPhase) {
  switch (phase) {
    case "pending_confirmation":
      return "Pendiente de confirmacion";
    case "ready_for_check_in":
      return "Listo para check-in";
    case "checked_in":
      return "Check-in completado";
    case "checked_out":
      return "Check-out completado";
    case "disabled":
      return "QR desactivado";
  }
}

export function getBookingQrHelperText(phase: BookingQrPhase) {
  switch (phase) {
    case "pending_confirmation":
      return "El QR se activa cuando la reserva pasa a confirmada.";
    case "ready_for_check_in":
      return "Muestra este QR local al momento de entregar a tu peludito.";
    case "checked_in":
      return "El check-in ya se consumio. Ahora queda habilitado el check-out.";
    case "checked_out":
      return "El flujo QR ya se completo para esta reserva.";
    case "disabled":
      return "Este QR quedo inactivo porque la reserva ya no puede consumirse.";
  }
}

export function getBookingQrConsumeErrorMessage(reason: BookingQrConsumeError) {
  switch (reason) {
    case "missing_token":
      return "Ingresa o pega el codigo QR local antes de validar.";
    case "invalid_token":
      return "El codigo no coincide con el QR activo de esta reserva.";
    case "booking_not_confirmed":
      return "Primero confirma la reserva para habilitar el QR.";
    case "wrong_stage":
      return "Ese QR no corresponde al paso actual del flujo.";
    case "already_consumed":
      return "Ese QR ya fue consumido y no puede reutilizarse.";
    case "booking_inactive":
      return "La reserva ya no tiene un QR activo para consumir.";
  }
}
