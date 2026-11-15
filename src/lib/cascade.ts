import { CREDIT_COST } from "./constants";
import {
  completeFreeModel,
  type FreeModelSource,
  type UserApiKeys,
} from "./free-models";
import { estimateImpact } from "./impact";
import { estimatePromptDifficulty } from "./judgy";
import {
  honeyFromMode,
  isChatEcoMode,
  modeFromHoney,
  type ChatEcoMode,
} from "./chat-modes";
import {
  hintStep,
  judgeAnswer,
  judgeStep,
  largeStep,
  mockLargeAnswer,
  mockSmallAnswer,
  smallStep,
} from "./mock-models";
import type { CascadeResult } from "./types";

const SMALL_SYSTEM = (eco: boolean) =>
  [
    "You are Eco AI's small free-tier model in Cascade-Verify.",
    "Answer the user's question DIRECTLY with the actual fact or explanation.",
    "Lead with the answer in the first sentence. Do not narrate your process, scoring, keywords, or density rules.",
    "Do not mention other models, APIs, Judgy, or Cascade.",
    eco
      ? "Keep it dense: 2–5 short sentences is enough when the ask is simple."
      : "Be clear and complete in a short paragraph when the ask is simple.",
  ].join(" ");

const LARGE_SYSTEM = (eco: boolean) =>
  [
    "You are Eco AI's large free-tier model. Judgy rejected a thinner answer, so you must fully answer the question.",
    "Give a real, useful answer — facts, steps, or proof as needed. Lead with the answer.",
    "Do not mention other models, APIs, Judgy, or Cascade.",
    eco ? "Prefer density, but do not omit the core answer." : "Be thorough but stay on the question.",
  ].join(" ");

async function runSmall(
  prompt: string,
  eco: boolean,
  keys?: UserApiKeys,
  difficulty: "easy" | "medium" | "hard" = "medium",
): Promise<{ text: string; source: FreeModelSource }> {
  const maxTokens =
    difficulty === "hard" ? (eco ? 220 : 360) : eco ? 160 : 280;
  try {
    return await completeFreeModel({
      tier: "small",
      maxTokens,
      system: SMALL_SYSTEM(eco),
      prompt,
      keys,
    });
  } catch {
    return { text: mockSmallAnswer(prompt, eco), source: "mock" };
  }
}

async function runLarge(
  prompt: string,
  eco: boolean,
  keys?: UserApiKeys
): Promise<{ text: string; source: FreeModelSource }> {
  try {
    return await completeFreeModel({
      tier: "large",
      maxTokens: eco ? 500 : 900,
      system: LARGE_SYSTEM(eco),
      prompt,
      keys,
    });
  } catch {
    return { text: mockLargeAnswer(prompt, eco), source: "mock" };
  }
}

function debitCredits(
  escalated: boolean,
  eco: boolean
): { creditsDebited: number; creditCostBeforeEco: number } {
  const creditCostBeforeEco = escalated
    ? CREDIT_COST.escalatePath
    : CREDIT_COST.cheapPath;
  const creditsDebited = Math.max(
    1,
    Math.round(creditCostBeforeEco * (eco ? CREDIT_COST.ecoMultiplier : 1))
  );
  return { creditsDebited, creditCostBeforeEco };
}

/**
 * Cascade-Verify always runs. Mode only toggles Honey (denser/shorter outputs).
 * Ultra Eco = cascade + honey; Eco-Cascade = cascade only.
 */
export async function runCascadeVerify(
  prompt: string,
  ecoSkillOrMode: boolean | ChatEcoMode = true,
  keys?: UserApiKeys
): Promise<CascadeResult> {
  const mode: ChatEcoMode = isChatEcoMode(ecoSkillOrMode)
    ? ecoSkillOrMode
    : modeFromHoney(Boolean(ecoSkillOrMode));
  const ecoSkill = honeyFromMode(mode);
  const hint = estimatePromptDifficulty(prompt);
  const small = await runSmall(prompt, ecoSkill, keys, hint.level);
  const verdict = judgeAnswer(small.text, prompt, hint.passThreshold);

  let largeText: string | null = null;
  let largeSource: FreeModelSource = small.source;
  if (!verdict.pass) {
    const large = await runLarge(prompt, ecoSkill, keys);
    largeText = large.text;
    largeSource = large.source;
  }

  const escalated = largeText != null;
  const { creditsDebited, creditCostBeforeEco } = debitCredits(
    escalated,
    ecoSkill
  );
  const impact = estimateImpact({
    prompt,
    smallAnswer: small.text,
    largeAnswer: largeText,
    ecoSkill,
  });

  return {
    usedCheapPath: !escalated,
    escalated,
    ecoSkill,
    mode,
    creditsDebited,
    creditCostBeforeEco,
    modelSource: largeText ? largeSource : small.source,
    difficulty: hint.level,
    steps: [
      hintStep(
        `${hint.reason} Difficulty=${hint.level}; PASS threshold=${hint.passThreshold}.`,
      ),
      smallStep(small.text, small.source),
      judgeStep(verdict),
      largeStep(largeText, largeSource),
    ],
    impact,
    finalAnswer: largeText ?? small.text,
  };
}
