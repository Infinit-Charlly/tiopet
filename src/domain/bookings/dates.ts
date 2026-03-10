import type { PresetDatePick } from "./types";

export function addDays(base: Date, days: number) {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

export function nextSaturday(base: Date) {
  const date = new Date(base);
  const day = date.getDay();
  const diff = (6 - day + 7) % 7;
  return addDays(date, diff === 0 ? 7 : diff);
}

export function getDateForPresetPick(datePick: PresetDatePick, base = new Date()) {
  if (datePick === "Hoy") return new Date(base);
  if (datePick === "Ma\u00f1ana") return addDays(base, 1);
  return nextSaturday(base);
}
