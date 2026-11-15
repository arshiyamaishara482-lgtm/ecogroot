import type { PlanId, VideoTier } from "./types";

export const APP_NAME = "Eco AI";
export const SESSION_COOKIE = "eco-session";

/** Optional waitlist knobs for product update emails (local demo). */
export const EARLY_ACCESS_CAP = 48;
export const FOUNDING_INVITE_CODE = "CANOPY-2026";
export const BUILDING_PHASE = "Open Limited · Cascade-Verify · free models";
export const WAITLIST_TAGLINE =
  "Open Limited product — free-tier models, small-first cascade, nature-aware estimates, still being grown.";

/**
 * Paid Pro/Master features stay closed while Open Limited is work-in-progress.
 * Marketing may show intended prices; upgrades and Pro-only APIs are hard-blocked.
 */
export const PAID_PLANS_OPEN = false;
export const PAID_PLANS_WIP_MESSAGE =
  "Pro and Master are work in progress — only Open Limited (Free) is available right now.";

/**
 * Starting usage wallet per plan — sized for Cursor-like room, not a stingy demo.
 * At 1 (cheap) / 5 (escalate) debits: Free ≈ 100k–500k chats, Pro ≈ 1M–5M.
 */
export const PLAN_CREDITS: Record<PlanId, number> = {
  free: 500_000,
  pro: 5_000_000,
  master: 25_000_000,
};

export const PLAN_PRICE: Record<PlanId, { usd: number; label: string }> = {
  free: { usd: 0, label: "Free" },
  /** Intentionally under typical ~$20 AI tools (e.g. Cursor Pro). */
  pro: { usd: 8, label: "Pro" },
  master: { usd: 15, label: "Master" },
};

/**
 * Per-chat debit. Keep escalate a few× cheap so cascade still matters,
 * but cheap enough that normal use barely dents the wallet.
 */
export const CREDIT_COST = {
  cheapPath: 1,
  escalatePath: 5,
  ecoMultiplier: 0.85,
  video: {
    eco: 20,
    premium: 60,
  },
};

export const PLAN_FEATURES: Record<
  PlanId,
  { tagline: string; items: string[] }
> = {
  free: {
    tagline: "Open Limited — free APIs, small-first cascade, roomy usage.",
    items: [
      "Roomy free usage (hundreds of thousands of easy chats)",
      "Cascade-Verify on free model APIs (Pollinations + optional keys)",
      "Small path first so free quota stretches further",
      "One shared creative memory",
      "Impact estimates + Eco skill (shorter outputs)",
    ],
  },
  pro: {
    tagline: "Coming soon — cheaper than typical ~$20 AI tools.",
    items: [
      "Millions of chats of headroom on the cheap path (planned)",
      "Everything in Free",
      "Eco video stub generation (planned — not unlocked)",
      "Same Cascade-Verify pipeline — not a bigger router",
    ],
  },
  master: {
    tagline: "Coming soon — still under a typical $20 tool.",
    items: [
      "Very high monthly-style usage pool (planned)",
      "Everything in Pro",
      "Premium video stub (planned — not unlocked)",
      "Team workspace label (planned)",
    ],
  },
};

export const QUANTIZATION_NOTE =
  "Quantization reduces GPU VRAM needed to hold model weights. It does not shrink the shared product memory (your notes and pinned answers).";
