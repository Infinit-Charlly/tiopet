import { getPlanById } from "../bookings/plans";
import type { PlanId } from "../bookings/types";
import { createNotificationIntent, type NotificationIntent } from "./types";

type NotificationIntentContext = {
  bookingId: string;
  petName?: string;
  planId: PlanId;
  createdAtISO: string;
};

type PhotoAvailableSource = "post_walk" | "premium_event";

function getPetLabel(petName?: string) {
  const normalized = petName?.trim();
  return normalized && normalized.length > 0 ? normalized : "tu mascota";
}

function getPlanAwareWalkStartedCopy(planId: PlanId, petName?: string) {
  const petLabel = getPetLabel(petName);
  const plan = getPlanById(planId);

  switch (planId) {
    case "consientan":
      return {
        title: "Paseo premium en curso",
        body: `${petLabel} ya inicio su paseo del plan ${plan.name}.`,
      };
    case "principe":
      return {
        title: "Salida VIP en curso",
        body: `${petLabel} ya salio a su paseo VIP de ${plan.name}.`,
      };
    default:
      return {
        title: "Paseo iniciado",
        body: `${petLabel} ya salio a su paseo y el seguimiento queda listo para notificaciones.`,
      };
  }
}

function getPlanAwareWalkFinishedCopy(planId: PlanId, petName?: string) {
  const petLabel = getPetLabel(petName);
  const plan = getPlanById(planId);

  switch (planId) {
    case "consientan":
      return {
        title: "Paseo premium completado",
        body: `${petLabel} ya termino su paseo de ${plan.name} y el resumen local quedo listo.`,
      };
    case "principe":
      return {
        title: "Paseo VIP completado",
        body: `${petLabel} ya termino su paseo VIP de ${plan.name} con resumen listo.`,
      };
    default:
      return {
        title: "Paseo completado",
        body: `${petLabel} ya termino su paseo y el resumen local quedo listo.`,
      };
  }
}

function getPlanAwarePhotoCopy(
  planId: PlanId,
  petName?: string,
  source: PhotoAvailableSource = "premium_event",
) {
  const petLabel = getPetLabel(petName);
  const plan = getPlanById(planId);

  if (source === "post_walk") {
    switch (planId) {
      case "consientan":
        return {
          title: "Foto del paseo disponible",
          body: `Ya hay una foto del paseo de ${petLabel} dentro del plan ${plan.name}.`,
        };
      case "principe":
        return {
          title: "Foto VIP del paseo disponible",
          body: `Ya hay una foto del paseo VIP de ${petLabel} dentro del plan ${plan.name}.`,
        };
      default:
        return {
          title: "Foto del paseo disponible",
          body: `Ya hay una foto local del paseo de ${petLabel} disponible para futuras notificaciones.`,
        };
    }
  }

  switch (planId) {
    case "consientan":
      return {
        title: "Nueva evidencia disponible",
        body: `Ya hay una nueva foto de ${petLabel} dentro del plan ${plan.name}.`,
      };
    case "principe":
      return {
        title: "Nueva foto VIP disponible",
        body: `Ya hay una nueva foto VIP de ${petLabel} dentro del plan ${plan.name}.`,
      };
    default:
      return {
        title: "Nueva foto disponible",
        body: `Ya hay una nueva foto local de ${petLabel} lista para futuras notificaciones.`,
      };
  }
}

export function createWalkStartedNotificationIntent(
  input: NotificationIntentContext,
): NotificationIntent {
  const copy = getPlanAwareWalkStartedCopy(input.planId, input.petName);

  return createNotificationIntent({
    type: "walk_started",
    bookingId: input.bookingId,
    petName: input.petName,
    planId: input.planId,
    createdAtISO: input.createdAtISO,
    title: copy.title,
    body: copy.body,
  });
}

export function createWalkFinishedNotificationIntent(
  input: NotificationIntentContext,
): NotificationIntent {
  const copy = getPlanAwareWalkFinishedCopy(input.planId, input.petName);

  return createNotificationIntent({
    type: "walk_finished",
    bookingId: input.bookingId,
    petName: input.petName,
    planId: input.planId,
    createdAtISO: input.createdAtISO,
    title: copy.title,
    body: copy.body,
  });
}

export function createPhotoAvailableNotificationIntent(
  input: NotificationIntentContext & {
    source?: PhotoAvailableSource;
  },
): NotificationIntent {
  const copy = getPlanAwarePhotoCopy(input.planId, input.petName, input.source);

  return createNotificationIntent({
    type: "photo_available",
    bookingId: input.bookingId,
    petName: input.petName,
    planId: input.planId,
    createdAtISO: input.createdAtISO,
    title: copy.title,
    body: copy.body,
  });
}
