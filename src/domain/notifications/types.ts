import type { PlanId } from "../bookings/types";

export const NOTIFICATION_INTENT_TYPES = [
  "walk_started",
  "walk_finished",
  "photo_available",
] as const;

export type NotificationIntentType = (typeof NOTIFICATION_INTENT_TYPES)[number];

export type NotificationIntent = {
  id: string;
  type: NotificationIntentType;
  bookingId: string;
  petName?: string;
  planId: PlanId;
  createdAtISO: string;
  title: string;
  body: string;
  localDeliveredAtISO?: string;
  localNotificationId?: string;
};

export type NotificationIntentInput = Omit<NotificationIntent, "id"> & {
  id?: string;
};

function makeNotificationIntentId(prefix = "nti") {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${t}_${r}`;
}

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeOptionalISO(value: unknown) {
  return isValidISO(value) ? value : undefined;
}

function isNotificationIntentType(value: unknown): value is NotificationIntentType {
  return (
    typeof value === "string" &&
    (NOTIFICATION_INTENT_TYPES as readonly string[]).includes(value)
  );
}

function isPlanId(value: unknown): value is PlanId {
  return value === "bb" || value === "consientan" || value === "principe";
}

function isValidISO(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && !Number.isNaN(Date.parse(value));
}

export function createNotificationIntent(
  input: NotificationIntentInput,
): NotificationIntent {
  return {
    id: input.id && input.id.length > 0 ? input.id : makeNotificationIntentId(),
    type: input.type,
    bookingId: input.bookingId,
    petName: normalizeOptionalString(input.petName),
    planId: input.planId,
    createdAtISO: input.createdAtISO,
    title: input.title.trim(),
    body: input.body.trim(),
    localDeliveredAtISO: normalizeOptionalISO(input.localDeliveredAtISO),
    localNotificationId: normalizeOptionalString(input.localNotificationId),
  };
}

export function normalizeNotificationIntent(value: unknown): NotificationIntent | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (
    typeof record.id !== "string" ||
    record.id.length === 0 ||
    !isNotificationIntentType(record.type) ||
    typeof record.bookingId !== "string" ||
    record.bookingId.length === 0 ||
    !isPlanId(record.planId) ||
    !isValidISO(record.createdAtISO) ||
    typeof record.title !== "string" ||
    record.title.trim().length === 0 ||
    typeof record.body !== "string" ||
    record.body.trim().length === 0
  ) {
    return null;
  }

  return createNotificationIntent({
    id: record.id,
    type: record.type,
    bookingId: record.bookingId,
    petName: normalizeOptionalString(record.petName),
    planId: record.planId,
    createdAtISO: record.createdAtISO,
    title: record.title,
    body: record.body,
    localDeliveredAtISO: normalizeOptionalISO(record.localDeliveredAtISO),
    localNotificationId: normalizeOptionalString(record.localNotificationId),
  });
}
