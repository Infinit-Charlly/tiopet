import type { CareTime, DatePick, PlanId, TransportType } from "./types";

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
};

export function getPlanIcon(planId: PlanId) {
  if (planId === "bb") return "shield-check";
  if (planId === "consientan") return "heart";
  return "crown";
}

export function getPlanHighlightIcon(planId: PlanId) {
  return planId === "consientan" ? "heart" : "crown";
}

export function getCareTimeLabel(careTime: CareTime | null) {
  if (careTime === "day") return "D\u00eda laboral (08:30 \u2013 18:00)";
  if (careTime === "full") return "24 horas (Hospedaje)";
  return "\u2014 (elige uno)";
}

export function getTransportLabel(
  transportNeeded: boolean,
  transportType: TransportType,
) {
  if (!transportNeeded) return "No";
  if (transportType === "pickup") return "Solo recogida";
  if (transportType === "dropoff") return "Solo entrega";
  if (transportType === "both") return "Recogida y entrega";
  return "No";
}

export function formatBookingDateLabel(
  datePick: DatePick,
  customDate: Date | null,
) {
  const date = customDate ?? new Date();
  const formatted = date.toLocaleDateString("es-EC", DATE_FORMAT_OPTIONS);

  return datePick + " \u00b7 " + formatted;
}
