export type City = "Latacunga" | "Quito" | "Porto Viejo";
export type DatePick = "Hoy" | "Ma\u00f1ana" | "Este s\u00e1bado" | "Otra fecha";
export type PresetDatePick = Exclude<DatePick, "Otra fecha">;

export type PlanId = "bb" | "consientan" | "principe";
export type CareTime = "day" | "full";
export type TransportType = "none" | "pickup" | "dropoff" | "both";
export type BookingAddonId =
  | "vet_check"
  | "grooming_basic"
  | "premium_feeding";

export type BookingAddon = {
  id: BookingAddonId | string;
  label: string;
  active: boolean;
  description?: string;
};

export type LabeledValue<T extends string> = {
  value: T;
  label: string;
};

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  basePrice: number;
  includes: string[];
  highlight?: string;
};
