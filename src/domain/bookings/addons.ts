import type { BookingAddon, BookingAddonId } from "./types";

type BookingAddonDefinition = Omit<BookingAddon, "active"> & {
  id: BookingAddonId;
};

export const BOOKING_ADDON_DEFINITIONS: readonly BookingAddonDefinition[] = [
  {
    id: "vet_check",
    label: "Revision veterinaria (aliado)",
    description: "Acompanamiento de revision breve con nuestro aliado.",
  },
  {
    id: "grooming_basic",
    label: "Grooming basico",
    description: "Un refresh suave para que termine el dia limpio y comodo.",
  },
  {
    id: "premium_feeding",
    label: "Alimentacion premium",
    description: "Servicio de alimentacion con indicaciones de cuidado mas detalladas.",
  },
] as const;

const BOOKING_ADDON_DEFINITION_MAP = new Map(
  BOOKING_ADDON_DEFINITIONS.map((addon) => [addon.id, addon]),
);

function normalizeAddonString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

export function createDefaultBookingAddons() {
  return BOOKING_ADDON_DEFINITIONS.map<BookingAddon>((addon) => ({
    ...addon,
    active: false,
  }));
}

export function createBookingAddons(activeIds: readonly string[] = []) {
  const activeSet = new Set(activeIds);

  return BOOKING_ADDON_DEFINITIONS.map<BookingAddon>((addon) => ({
    ...addon,
    active: activeSet.has(addon.id),
  }));
}

export function isBookingAddonActive(
  addons: readonly Pick<BookingAddon, "id" | "active">[] | undefined,
  addonId: BookingAddonId,
) {
  return (addons ?? []).some((addon) => addon.id === addonId && addon.active);
}

export function getActiveBookingAddons(
  addons: readonly BookingAddon[] | undefined,
) {
  return (addons ?? []).filter((addon) => addon.active);
}

export function normalizeBookingAddons(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized: BookingAddon[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const record = item as Record<string, unknown>;
    const id = normalizeAddonString(record.id);
    const definition = id ? BOOKING_ADDON_DEFINITION_MAP.get(id as BookingAddonId) : undefined;
    const label = normalizeAddonString(record.label) ?? definition?.label;

    if (!id || !label) {
      continue;
    }

    const description =
      normalizeAddonString(record.description) ?? definition?.description;

    normalized.push({
      id,
      label,
      active: record.active === true,
      ...(description ? { description } : {}),
    });
  }

  const seenIds = new Set(normalized.map((addon) => addon.id));

  for (const definition of BOOKING_ADDON_DEFINITIONS) {
    if (seenIds.has(definition.id)) {
      continue;
    }

    normalized.push({
      ...definition,
      active: false,
    });
  }

  return normalized.length > 0 ? normalized : undefined;
}
