import {
  PAID_PLANS_OPEN,
  PAID_PLANS_WIP_MESSAGE,
  PLAN_CREDITS,
  PLAN_PRICE,
} from "./constants";
import type { PlanId, User } from "./types";

export function planLabel(plan: PlanId): string {
  return PLAN_PRICE[plan].label;
}

export function isPaidPlan(plan: PlanId): boolean {
  return plan === "pro" || plan === "master";
}

/** Pro/Master are WIP — nothing paid is usable until PAID_PLANS_OPEN flips. */
export function paidPlansAvailable(): boolean {
  return PAID_PLANS_OPEN;
}

export function paidPlansBlockedMessage(): string {
  return PAID_PLANS_WIP_MESSAGE;
}

export function canUseEcoVideo(plan: PlanId): boolean {
  if (!PAID_PLANS_OPEN) return false;
  return plan === "pro" || plan === "master";
}

export function canUsePremiumVideo(plan: PlanId): boolean {
  if (!PAID_PLANS_OPEN) return false;
  return plan === "master";
}

export function applyPlanGrant(user: User, plan: PlanId): User {
  if (!PAID_PLANS_OPEN && isPaidPlan(plan)) {
    throw new Error(PAID_PLANS_WIP_MESSAGE);
  }
  const grant = PLAN_CREDITS[plan];
  return {
    ...user,
    plan,
    credits: Math.max(user.credits, grant),
  };
}

/** Force Open Limited while paid tiers are WIP; also lift usage to the free floor. */
export function ensureOpenLimited(user: User): User {
  let next = user;
  if (!PAID_PLANS_OPEN && isPaidPlan(user.plan)) {
    next = { ...next, plan: "free" };
  }
  const floor = PLAN_CREDITS[next.plan];
  if (next.credits < floor) {
    next = { ...next, credits: floor };
  }
  return next;
}

/** @deprecated Prefer ensureOpenLimited — kept for call sites that only need the floor. */
export function ensureWalletFloor(user: User): User {
  return ensureOpenLimited(user);
}

export function debitOrThrow(user: User, amount: number): User {
  if (user.credits < amount) {
    throw new Error("Usage limit reached for this demo wallet");
  }
  return { ...user, credits: user.credits - amount };
}
