export type PlanTier = "basic" | "plus" | "pro";

type PlanFeatures = {
  postWalkPhoto: boolean;
};

export const CURRENT_PLAN: PlanTier = "plus";

export const PLAN_FEATURES: Record<PlanTier, PlanFeatures> = {
  basic: {
    postWalkPhoto: false,
  },
  plus: {
    postWalkPhoto: true,
  },
  pro: {
    postWalkPhoto: true,
  },
};
