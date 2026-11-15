/**
 * Judgy — hybrid Cascade-Verify helper.
 *
 * 1) Cheap difficulty HINT from the question (not a final model pick)
 * 2) Small model still answers first
 * 3) Judgy scores that ANSWER with a threshold tuned by the hint
 *
 * Hard prompts get a stricter PASS bar so weak small answers escalate more often.
 * Easy prompts stay easier to PASS — that is the cascade save path.
 */

export type DifficultyLevel = "easy" | "medium" | "hard";

export type DifficultyHint = {
  level: DifficultyLevel;
  reason: string;
  /** Minimum score for Judgy to PASS the small answer */
  passThreshold: number;
};

const HARD_SIGNALS =
  /\b(proof|prove|derive|theorem|business plan|go-to-market|multi[- ]?step|step[- ]by[- ]step|architecture|refactor|full stack|compare and contrast|literature review|essay|detailed analysis|write a (long|full)|implement|debug this|optimize|legal|contract|financial model)\b/i;

const MEDIUM_SIGNALS =
  /\b(explain|how does|why does|difference between|pros and cons|outline|summary|summarize|guide|tutorial|design|plan)\b/i;

export function estimatePromptDifficulty(prompt: string): DifficultyHint {
  const text = prompt.trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  const hardHits = HARD_SIGNALS.test(text);
  const mediumHits = MEDIUM_SIGNALS.test(text);

  if (hardHits || words >= 80) {
    return {
      level: "hard",
      reason:
        "Judgy hint: prompt looks demanding (complex task cues or long ask). Prefer escalating unless the small answer is strong.",
      passThreshold: 72,
    };
  }
  if (mediumHits || words >= 28) {
    return {
      level: "medium",
      reason:
        "Judgy hint: moderate ask. Small model still goes first; PASS bar stays standard.",
      passThreshold: 58,
    };
  }
  return {
    level: "easy",
    reason:
      "Judgy hint: short/simple ask. Bias toward keeping the cheap small-model path.",
    passThreshold: 50,
  };
}
