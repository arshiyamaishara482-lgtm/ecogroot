import { WAITLIST_WHATSAPP_PHONE_LOCAL } from "@/lib/contact";
import {
  PLAN_CREDITS,
  PLAN_FEATURES,
  PLAN_PRICE,
  QUANTIZATION_NOTE,
} from "@/lib/constants";
import type { PlanId } from "@/lib/types";

export const NAV_LINKS = [
  { href: "/how-its-done", label: "How it's done" },
  { href: "/judgy", label: "Judgy" },
  { href: "/impact", label: "Impact" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/plans", label: "Plans" },
  { href: "/waiting-list", label: "Waiting list" },
  { href: "/open", label: "Open Limited" },
  { href: "/faq", label: "FAQ" },
] as const;

/** Full request path shown on /how-its-done */
export const HOW_IT_WORKS_FLOW = [
  {
    id: "01",
    title: "Your request",
    detail:
      "You type a question in Open Limited chat. Usage comes from one roomy pool; notes and pinned answers stay in shared product memory.",
  },
  {
    id: "02",
    title: "Honey-style Eco skill",
    detail:
      "If Eco skill is on, the system nudges denser, shorter replies — fewer tokens, slightly lower debit. Same Cascade-Verify path, shorter canopy.",
  },
  {
    id: "03",
    title: "Quantized small model",
    detail:
      "A quantized-style small free-tier model always answers first. Quantization cuts GPU VRAM for weights — it does not shrink your notes or pinned answers.",
  },
  {
    id: "04",
    title: "Judgy",
    detail:
      "Judgy first peeks at difficulty (hint only), then scores the small answer: substance, coverage, hedging. PASS or FAIL with a visible reason. Not a third-party LLM.",
  },
  {
    id: "05",
    title: "Maybe escalate",
    detail:
      "On FAIL only, a larger free-tier model rewrites. On PASS, you keep the cheap answer. That ratio is your cascade save rate.",
  },
  {
    id: "06",
    title: "Reply + impact",
    detail:
      "You get the final answer, a credit debit, and labeled estimates for tokens, $, energy, CO₂, and water — estimates, not metered hardware claims.",
  },
] as const;

export const HOW_IT_WORKS_SIMPLE = [
  {
    title: "You ask something",
    body: "You send a message. Eco AI spends credits from your wallet — like tickets for each chat.",
  },
  {
    title: "It tries to stay short (Honey / Eco skill)",
    body: "When Eco skill is on, answers aim to be clearer with fewer words. Less talking usually means less energy and fewer credits.",
  },
  {
    title: "A small, lighter model answers first (quantization)",
    body: "Think of quantization as packing the model so it needs less GPU space. The small model always goes first. Your notes and saved answers are separate — packing the model does not delete them.",
  },
  {
    title: "A checker grades that answer (Cascade-Verify)",
    body: "A judge looks at the first answer and says “good enough” or “not yet.” It does not guess from the question alone.",
  },
  {
    title: "Only then might a bigger model help",
    body: "If the first answer fails, a larger free model tries again. If it passed, Eco AI stops there and saves the bigger call — better for cost, energy, and water estimates.",
  },
  {
    title: "You see the reply and rough impact",
    body: "You get the answer plus simple estimates of tokens, cost, energy, CO₂, and water. Those numbers are guides for demos, not a lab meter.",
  },
] as const;

export const CASCADE_STEPS = [
  {
    n: "01",
    title: "Small model answers first",
    body: "A quantized-style small model always writes. Short by design. Weaker on proofs, full business plans, and long multi-step asks — on purpose, so Cascade-Verify has something real to judge.",
  },
  {
    n: "02",
    title: "Judgy scores that answer",
    body: "Never “read the question, then pick a model.” Judgy may hint difficulty to tune the PASS bar, then scores the small answer: substance, keyword coverage, hedging. PASS or FAIL with a reason you can see.",
  },
  {
    n: "03",
    title: "Escalate only after FAIL",
    body: "The large model runs only when the judge rejects the first answer. A PASS keeps you on the cheap credit path. That ratio is your cascade save rate.",
  },
] as const;

export const IMPACT_PILLARS = [
  {
    title: "Honey-style Eco skill",
    body: "Bias toward denser replies. Fewer tokens, slightly lower debit. Not a different router — a shorter canopy.",
  },
  {
    title: "One wallet, one memory",
    body: "A single credit balance and a shared creative memory of notes and pinned answers. History lives in the product, not in GPU VRAM.",
  },
  {
    title: "Impact estimates, labeled",
    body: "Tokens, $, rough energy, CO₂, and water on every reply — clearly marked estimates, not metered hardware claims.",
  },
  {
    title: "Quantization ≠ memory",
    body: QUANTIZATION_NOTE,
  },
] as const;

export const IMPACT_STATS = [
  ["~20–40%", "target cascade saves on easy chats (demo heuristic)"],
  ["1 vs 5", "usage debit cheap path vs escalate (tunable)"],
  ["1 pool", "shared creative memory across the demo"],
  ["Estimates", "energy · CO₂ · water labeled as estimates"],
] as const;

export const COMPARE_ROWS = [
  ["Always small → judge(answer) → maybe large", true, false, false],
  ["Roomy usage pool (not “free OpenAI tokens”)", true, false, false],
  ["Eco skill for shorter outputs", true, false, false],
  ["Impact estimates on every reply", true, false, false],
  ["Quantization explained as VRAM, not product memory", true, false, false],
  ["Local offline mock path for demos", true, false, false],
] as const;

/**
 * Public order-of-magnitude estimates for a short text prompt.
 * Frontier figures are published estimates (not our lab). Eco AI rows are
 * demo heuristics from token counts — labeled estimates, not metered GPUs.
 */
export const ENERGY_WATER_COMPARE = [
  {
    name: "ChatGPT (avg query)",
    energy: "~0.34 Wh",
    water: "~0.32 mL",
    note: "OpenAI CEO, Jun 2025 blog — average ChatGPT query",
  },
  {
    name: "GPT-4o (research)",
    energy: "~0.3–0.42 Wh",
    water: "varies by site",
    note: "Epoch AI ~0.3 Wh; Jegham et al. ~0.42 Wh for short prompts",
  },
  {
    name: "Gemini Apps (median)",
    energy: "~0.24 Wh",
    water: "~0.26 mL",
    note: "Google Cloud, May 2025 comprehensive inference methodology",
  },
  {
    name: "Claude 3.7 Sonnet (research)",
    energy: "~0.95 Wh",
    water: "~1 mL (est.)",
    note: "Jegham et al. for ~100 in / 300 out tokens; water via typical WUE",
  },
  {
    name: "GPT-4 era email (older)",
    energy: "~140 Wh",
    water: "~519 mL",
    note: "WaPo + UC Riverside 2024 for a ~100-word GPT-4 email — higher bound",
  },
  {
    name: "Eco AI cheap path (demo)",
    energy: "~0.003 Wh",
    water: "~0.005 mL",
    note: "Our token heuristic on a short PASS — estimate only, not measured",
  },
  {
    name: "Eco AI escalate path (demo)",
    energy: "~0.04 Wh",
    water: "~0.07 mL",
    note: "Same prompt after FAIL → large free model — still a labeled estimate",
  },
] as const;

/**
 * Estimated savings = published frontier short-prompt figure minus Eco AI demo path.
 * All deltas are labeled estimates for product storytelling — not metered savings.
 */
export const IMPACT_SAVINGS = [
  {
    vs: "vs ChatGPT avg",
    cheapEnergy: "~0.34 Wh saved (~99%)",
    cheapWater: "~0.32 mL saved (~98%)",
    escalateEnergy: "~0.30 Wh saved (~88%)",
    escalateWater: "~0.25 mL saved (~78%)",
  },
  {
    vs: "vs Gemini Apps median",
    cheapEnergy: "~0.24 Wh saved (~99%)",
    cheapWater: "~0.26 mL saved (~98%)",
    escalateEnergy: "~0.20 Wh saved (~83%)",
    escalateWater: "~0.19 mL saved (~73%)",
  },
  {
    vs: "vs Claude 3.7 research",
    cheapEnergy: "~0.95 Wh saved (~99%)",
    cheapWater: "~1.0 mL saved (~99%)",
    escalateEnergy: "~0.91 Wh saved (~96%)",
    escalateWater: "~0.93 mL saved (~93%)",
  },
] as const;

export const IMPACT_SAVINGS_SCALE = [
  {
    label: "1,000 cheap-path chats vs ChatGPT avg",
    energy: "~337 Wh (~0.34 kWh)",
    water: "~315 mL",
    blurb: "About as much energy as leaving a 10 W LED on for ~34 hours — estimate only.",
  },
  {
    label: "1,000,000 cheap-path chats vs ChatGPT avg",
    energy: "~337 kWh",
    water: "~315 L",
    blurb: "Roughly a small household’s few days of electricity, and ~315 water bottles — estimate only.",
  },
  {
    label: "Why cascade matters",
    energy: "PASS ≫ FAIL",
    water: "Stay small first",
    blurb: "Every escalated chat burns more. Higher PASS rates lock in most of the savings above.",
  },
] as const;

/** Citations shown on /roadmap — proof trail for the comparison table. */
export const IMPACT_SOURCES = [
  {
    label: "ChatGPT avg energy & water",
    detail:
      "Sam Altman, “The Gentle Singularity” (Jun 2025): ~0.34 Wh and ~0.000085 gal (~0.32 mL) per average ChatGPT query. Company blog figure — not a peer-reviewed paper; methodology not fully disclosed.",
    href: "https://blog.samaltman.com/the-gentle-singularity",
  },
  {
    label: "GPT-4o energy (independent)",
    detail:
      "Epoch AI gradient update: typical GPT-4o text query ~0.3 Wh under updated hardware assumptions. Independent analysis, not OpenAI telemetry.",
    href: "https://epoch.ai/gradient-updates/how-much-energy-does-chatgpt-use",
  },
  {
    label: "Multi-model inference benchmark",
    detail:
      "Jegham et al., “How Hungry is AI?” (arXiv 2505.09598): GPT-4o ~0.42 Wh and Claude 3.7 Sonnet ~0.95 Wh for short prompt shapes — research estimates from public latency/hardware assumptions.",
    href: "https://arxiv.org/abs/2505.09598",
  },
  {
    label: "Gemini Apps median",
    detail:
      "Google, “Measuring the environmental impact of delivering AI at Google Scale” (2025): median Gemini Apps text prompt ~0.24 Wh and ~0.26 mL water under their comprehensive methodology.",
    href: "https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference",
  },
  {
    label: "Older GPT-4 email bound",
    detail:
      "Washington Post with UC Riverside (2024): ~0.14 kWh (~140 Wh) and ~519 mL for a ~100-word GPT-4 email — location-sensitive, often cited as a high bound for longer generations.",
    href: "https://www.washingtonpost.com/technology/2024/09/18/energy-ai-use-electricity-water-data-centers/",
  },
  {
    label: "Eco AI demo rows & “savings”",
    detail:
      "Not third-party research. Built from Eco AI’s token heuristics in src/lib/impact.ts (~0.35 J/token small path, ~2.6 J/token escalate, water ≈ energy×1900 mL/kWh). Savings = frontier estimate − Eco demo path. Useful for relative storytelling; not metered GPU/PUE proof.",
    href: "/how-its-done",
  },
] as const;

export const GREENER_PLAN = [
  {
    title: "Keep more chats on the small path",
    body: "Raise Cascade-Verify PASS rate on easy asks so we call large models less often — the biggest lever vs always-frontier chat.",
  },
  {
    title: "Shorter answers by default (Honey Eco skill)",
    body: "Ship denser prompts and length caps so every PASS burns fewer tokens, watts, and cooling water in the estimate model.",
  },
  {
    title: "Prefer quantized / small free-tier models",
    body: "Stay on lighter free APIs first. Quantization cuts VRAM for weights; cascading cuts how often a heavy model runs at all.",
  },
  {
    title: "Replace toy heuristics with real meters",
    body: "Later: provider energy APIs, grid carbon intensity, and water-usage factors where published — so the wallet shows measured ranges, not only demos.",
  },
] as const;

export const ROADMAP_PHASES = [
  {
    phase: "Now",
    title: "Open Limited free",
    items: [
      "Everyone can enter — no invite wall",
      "Cascade-Verify on free model APIs (Pollinations + optional Groq/Gemini/OpenRouter)",
      "Credit wallet, creative memory, labeled energy/water estimates on every reply",
      "Honey-style Eco skill + Judgy hybrid cascade",
      "Waiting list with WhatsApp notify for early-access signups",
    ],
  },
  {
    phase: "Next",
    title: "Root system",
    items: [
      "Cascade save dashboards (PASS rate, credits avoided, estimate deltas)",
      "Tighter Eco skill presets and length budgets for lower token burn",
      "More free-provider failover knobs + team memory permissions (Master)",
      "Calibrate impact heuristics against published Wh/query ranges",
    ],
  },
  {
    phase: "Later",
    title: "Full forest",
    items: [
      "Real billing when Pro/Master open (not fake upgrades)",
      "Measured energy / water adapters where providers publish them",
      "True video generation pathways with separate impact accounting",
      "Multi-tenant production auth and regional carbon-intensity toggles",
    ],
  },
] as const;

export const FAQ_ITEMS = [
  {
    q: "Is Eco AI free ChatGPT / OpenAI access?",
    a: "No. It is a credit-wallet product that cascades free-tier model APIs (Pollinations public free, plus optional Groq/Gemini/OpenRouter :free). You are not getting OpenAI tokens — you get more free chats by keeping easy prompts on the small path.",
  },
  {
    q: "What does “undergoing” mean?",
    a: "Open Limited is available to everyone while we keep building. Expect rough edges and local persistence. Pro and Master are shown as intended prices only — they are work in progress and cannot be unlocked yet.",
  },
  {
    q: "Is the Limited product invite-gated?",
    a: "No. Click Open Limited free anytime. The Waiting list page is optional early-access notes — each signup can notify the team on WhatsApp. Cascade free stack: Pollinations (no key) plus optional Groq / Gemini / OpenRouter free tiers.",
  },
  {
    q: "What is Cascade-Verify?",
    a: "Judgy hints difficulty, then a small free model answers first. Judgy scores that answer. Escalate to a larger free model only on FAIL. Easy chats stay cheap, so free quota stretches further than always-large usage.",
  },
  {
    q: "What is Judgy?",
    a: "Eco AI’s own checker in Cascade-Verify — a local hybrid algorithm, not a separate LLM. It peeks at the question for a difficulty hint (tunes the PASS bar), then grades the small model’s answer before any expensive escalate.",
  },
  {
    q: "How does the waiting list WhatsApp notify work?",
    a: `Submit the form on /waiting-list. The API builds a message with your name, email, interest, note, and list position, then targets WhatsApp ${WAITLIST_WHATSAPP_PHONE_LOCAL}. Without API keys it opens a prefilled wa.me chat; with CallMeBot, Twilio, or a webhook URL it can auto-send.`,
  },
  {
    q: "Why are Pro and Master cheaper than typical AI tools?",
    a: "That’s the motto — affordable AI. Intended list prices are Free $0, Pro $8/mo, Master $15/mo — under the common ~$20 AI-tool tier. Those paid tiers are still work in progress and cannot be accessed; only Open Limited (Free) is live.",
  },
  {
    q: "Can I use Pro, Master, or video now?",
    a: "No. Pro/Master upgrades and video stubs are hard-blocked while Open Limited is the only live product. Plans pages show the intended shape; buttons and APIs refuse paid unlocks.",
  },
  {
    q: "Are the green numbers real measurements?",
    a: "No. Energy, CO₂, and water figures are secondary heuristic estimates from token counts. Useful for relative demos — not a greenhouse certificate.",
  },
] as const;

export const PLAN_IDS: PlanId[] = ["free", "pro", "master"];

export function planCards() {
  return PLAN_IDS.map((id) => ({
    id,
    price: PLAN_PRICE[id],
    features: PLAN_FEATURES[id],
    credits: PLAN_CREDITS[id],
  }));
}
