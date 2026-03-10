import type {
  City,
  DatePick,
  LabeledValue,
  PresetDatePick,
  TransportType,
} from "./types";

export const CITY_OPTIONS: readonly City[] = [
  "Latacunga",
  "Quito",
  "Porto Viejo",
];

export const TRANSPORT_OPTIONS: readonly LabeledValue<TransportType>[] = [
  { value: "ida", label: "Solo ida" },
  { value: "vuelta", label: "Solo vuelta" },
  { value: "ida_vuelta", label: "Ida y vuelta" },
];

export const DATE_PICK_OPTIONS: readonly PresetDatePick[] = [
  "Hoy",
  "Ma\u00f1ana",
  "Este s\u00e1bado",
];

export const CUSTOM_DATE_PICK: DatePick = "Otra fecha";
