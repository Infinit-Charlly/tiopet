import type { Plan, PlanId } from "./types";

export const PLANS: Plan[] = [
  {
    id: "bb",
    name: "Cu\u00edden a mi BB",
    tagline: "Cuidado esencial con amor y seguridad.",
    basePrice: 7,
    includes: [
      "Camita + sombra + descanso seguro",
      "Agua fresca permanente",
      "Comida est\u00e1ndar",
      "Patio / espacio de relajaci\u00f3n",
      "Reporte b\u00e1sico del d\u00eda",
    ],
  },
  {
    id: "consientan",
    name: "Consientan a mi peludo",
    tagline: "M\u00e1s atenci\u00f3n, paseo y evidencia para tu tranquilidad.",
    basePrice: 12,
    includes: [
      "Todo lo del plan BB",
      "Paseo con evidencia (foto/video)",
      "Ba\u00f1o b\u00e1sico",
      "Comida org\u00e1nica adaptada (tama\u00f1o/edad)",
      "Reporte detallado + fotos",
    ],
    highlight: "Recomendado",
  },
  {
    id: "principe",
    name: "Pr\u00edncipe del Hogar",
    tagline: "VIP total: mimos, grooming y recogida/entrega.",
    basePrice: 22,
    includes: [
      "Todo lo del plan Consientan",
      "Snacks premium (aprobados por ti)",
      "Grooming completo / corte b\u00e1sico",
      "Juguetes + juegos guiados + mimos",
      "Transporte incluido (recogida/entrega)",
      "Reporte completo + video",
    ],
    highlight: "Premium",
  },
];

export function getPlanById(planId: PlanId): Plan {
  return PLANS.find((plan) => plan.id === planId) ?? PLANS[0];
}
