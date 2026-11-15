import type { CascadeStep } from "./types";

const STOPWORDS = new Set(
  "a an the and or but if then else for to of in on at by with from as is are was were be been being it this that these those you your we our they them their i me my not no yes do does did can could should would will just about into over after before than too very also more most some any all how what when where which who why who whom whose".split(
    " "
  )
);

export function countTokens(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  return Math.max(1, Math.round(words.length * 1.3));
}

export function extractKeywords(prompt: string): string[] {
  const words = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
  return [...new Set(words)].slice(0, 12);
}

export function keywordCoverage(answer: string, keywords: string[]): number {
  if (keywords.length === 0) return 1;
  const hay = answer.toLowerCase();
  const hit = keywords.filter((k) => hay.includes(k)).length;
  return hit / keywords.length;
}

/** Classification only affects the *small model*'s simulated quality — never routing. */
export type PromptBand = "easy" | "medium" | "hard-math" | "hard-plan" | "hard-long";

export function promptBand(prompt: string): PromptBand {
  const p = prompt.toLowerCase();
  if (
    /prove|proof|theorem|derive|irrational|induction|lemma|q\.e\.d/.test(p)
  ) {
    return "hard-math";
  }
  if (
    /business plan|go-to-market|full plan|comprehensive strategy|financial model|pitch deck/.test(
      p
    )
  ) {
    return "hard-plan";
  }
  if (
    prompt.length > 480 ||
    /step by step|multi-step|all of the following|walk me through every/.test(p)
  ) {
    return "hard-long";
  }
  if (
    /explain|what is|summarize|list|bullets|how do i|define|quick|tl;dr|tldr/.test(
      p
    )
  ) {
    return "easy";
  }
  return "medium";
}

function clip(text: string, eco: boolean, hardCap: number): string {
  const cap = eco ? Math.min(hardCap, 420) : hardCap;
  if (text.length <= cap) return text;
  return `${text.slice(0, cap).trim()}…`;
}

function opener(prompt: string): string {
  const first = prompt.trim().replace(/\s+/g, " ").slice(0, 80);
  return first.endsWith("?") ? first : first.slice(0, 60);
}

/** Offline fallback that still answers the question — never meta process chatter. */
function factualMock(prompt: string, eco: boolean): string | null {
  const p = prompt.toLowerCase();

  const capitalMatch = p.match(
    /capital(?:\s+city)?\s+of\s+([a-z][a-z\s]{1,40}?)(?:\?|$|\.)/
  ) ?? p.match(/what(?:'s| is)\s+(?:the\s+)?capital\s+of\s+([a-z][a-z\s]{1,40}?)(?:\?|$|\.)/);
  if (capitalMatch) {
    const place = capitalMatch[1].trim().replace(/\s+/g, " ");
    const known: Record<string, string> = {
      bangladesh: "Dhaka",
      france: "Paris",
      japan: "Tokyo",
      india: "New Delhi",
      "united states": "Washington, D.C.",
      usa: "Washington, D.C.",
      "united kingdom": "London",
      uk: "London",
      germany: "Berlin",
      canada: "Ottawa",
      australia: "Canberra",
      brazil: "Brasília",
      china: "Beijing",
      "south korea": "Seoul",
      pakistan: "Islamabad",
      nepal: "Kathmandu",
      "sri lanka": "Sri Jayawardenepura Kotte (legislative); Colombo is the commercial capital",
    };
    const city = known[place];
    if (city) {
      return eco
        ? `The capital of ${place.replace(/\b\w/g, (c) => c.toUpperCase())} is ${city}.`
        : `The capital of ${place.replace(/\b\w/g, (c) => c.toUpperCase())} is ${city}. It is the main seat of government for the country.`;
    }
  }

  if (/compost/.test(p)) {
    return eco
      ? "Composting turns food scraps and yard waste into soil-like humus.\n• Keep a mix of greens (wet, nitrogen) and browns (dry, carbon).\n• Aerate and keep it moist; finished compost feeds plants."
      : "Composting is controlled decomposition of organic waste into humus.\n• Mix nitrogen-rich greens with carbon-rich browns.\n• Keep the pile moist and aerated so microbes work.\n• Use finished compost to enrich soil instead of sending scraps to landfill.";
  }

  if (/quantiz/.test(p)) {
    return eco
      ? "Quantization stores model weights in fewer bits (e.g. 8-bit or 4-bit) so inference needs less GPU VRAM. Accuracy can drop a little; product memory (notes) is unrelated."
      : "Quantization compresses neural-net weights into lower-precision numbers so a GPU can hold the model in less VRAM. Operators trade a bit of quality for cheaper serving. It does not shrink Eco AI's creative memory of notes and pinned answers.";
  }

  if (/what is\s+eco\s*ai|who are you/.test(p)) {
    return "Eco AI is a Cascade-Verify chat demo: a small free model answers first, Judgy scores that answer, and a larger free model runs only if needed — so easy asks stay cheap.";
  }

  return null;
}

export function mockSmallAnswer(prompt: string, eco: boolean): string {
  const band = promptBand(prompt);
  const factual = factualMock(prompt, eco);
  if (factual && (band === "easy" || band === "medium")) {
    return clip(factual, eco, 420);
  }

  if (band === "hard-math") {
    return clip(
      eco
        ? "Sketch only: assume a contradiction and stop. Not a full proof — this short pass cannot finish the argument."
        : `Sketch only for “${opener(prompt)}”. If it were rational it would be a/b, but I am not filling in divisibility details. Incomplete — too complex for this quantized-style pass.`,
      eco,
      280
    );
  }

  if (band === "hard-plan") {
    return clip(
      eco
        ? "A vertical or local farm needs product, customers, and cash. This is a sketch only — missing market, costs, operations, and go-to-market."
        : `Rough sketch for “${opener(prompt)}”: pick a crop, find buyers, keep lights on. Missing TAM, unit economics, hiring, compliance, and a real go-to-market. Incomplete on purpose — the short model bails on full business plans.`,
      eco,
      320
    );
  }

  if (band === "hard-long") {
    return clip(
      eco
        ? "Too many steps for a short pass. Here is a headline only — not the full walkthrough."
        : `I only have room for a headline on “${opener(prompt)}”. Multi-step work needs the later model if the judge rejects this thin answer.`,
      eco,
      260
    );
  }

  if (factual) return clip(factual, eco, 420);

  // Generic offline answer: still try to respond, not describe process.
  const ask = opener(prompt);
  return clip(
    eco
      ? `Direct take on “${ask}”: the core answer is the main fact or next step implied by that ask. Offline mock — live free models (Kilo / LLM7) give fuller replies when the network path is up.`
      : `Here is a direct offline answer to “${ask}”. State the main claim, add one supporting detail, and stop. When free providers are reachable, Eco AI uses live small models instead of this fallback.`,
    eco,
    360
  );
}

export function mockLargeAnswer(prompt: string, eco: boolean): string {
  const band = promptBand(prompt);
  const keywords = extractKeywords(prompt);

  if (band === "hard-math" && /sqrt|square root|irrational/.test(prompt.toLowerCase())) {
    const proof = [
      "Proof that √2 is irrational (contradiction).",
      "1. Suppose √2 = a/b in lowest terms, a,b integers, b ≠ 0.",
      "2. Then a² = 2b², so a² is even, hence a is even: a = 2k.",
      "3. (2k)² = 2b² ⇒ 4k² = 2b² ⇒ b² = 2k², so b is even.",
      "4. a and b share a factor 2, contradicting lowest terms.",
      "Therefore √2 is irrational.",
    ];
    return eco ? proof.slice(0, 5).join("\n") : proof.join("\n");
  }

  if (band === "hard-plan") {
    const sections = [
      `Business plan outline for: ${prompt.trim().slice(0, 120)}`,
      "",
      "Market: name a beachhead customer, a painful job-to-be-done, and why now. Skip vanity TAM until you have a wedge.",
      "Product: one growing system, one crop mix, one quality bar. Quantized inference is unrelated — this is ops, not VRAM.",
      "Unit economics: energy, labor, yield, spoilage, delivery. If a cycle does not clear contribution margin, the plan fails.",
      "Operations: site, water, HVAC, food-safety, staffing on a 2-week cadence.",
      "Go-to-market: chefs or CSA first; one city; one channel. No spray-and-pray ads.",
      "Risks: energy price spikes, crop failure, buyer concentration. Mitigate with contracts and a second crop.",
      "90-day plan: LOIs, a costing sheet, and a pilot rack — not a 40-page appendix.",
    ];
    return eco ? sections.slice(0, 6).join("\n") : sections.join("\n");
  }

  const long = [
    `Fuller answer (escalated) for: ${prompt.trim().slice(0, 160)}`,
    "",
    "The small pass was too thin. This larger mock fills structure the judge found missing.",
    keywords.length
      ? `Task keywords to cover: ${keywords.join(", ")}.`
      : "No long keywords extracted; expanding the argument anyway.",
    "",
    "1. Restate the ask in one sentence.",
    "2. Give the mechanism or plan in ordered steps.",
    "3. Call out a failure mode and how you would check it.",
    "4. Stop when the question is actually answered — Eco skill still prefers density.",
  ];
  return eco ? long.slice(0, 7).join("\n") : long.join("\n");
}

export type JudgeVerdict = {
  pass: boolean;
  score: number;
  reason: string;
};

/**
 * Judgy scores the ANSWER.
 * Prompt difficulty only adjusts the PASS threshold (hybrid hint) —
 * it never skips writing a small answer first.
 */
export function judgeAnswer(
  answer: string,
  prompt: string,
  passThreshold = 58,
): JudgeVerdict {
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  const keywords = extractKeywords(prompt);
  const coverage = keywordCoverage(answer, keywords);
  const incomplete =
    /sketch only|incomplete|too complex|headline only|cannot finish|bails on|maybe enough|maybe thin/i.test(
      answer
    );
  const hedges = (answer.match(/maybe|not sure|idk|too hard|sketch|headline only/gi) ?? [])
    .length;

  // Short factual answers (e.g. "Dhaka is the capital of Bangladesh.") should still PASS.
  const looksFactual =
    !incomplete &&
    words >= 3 &&
    !/keep it dense|keywords touched|quantized-style pass|honey-style/i.test(answer);

  let score = 0;
  if (words >= 8) score += 18;
  if (words >= 18) score += 12;
  if (words >= 40) score += 10;
  if (words >= 80) score += 8;
  score += Math.round(coverage * 40);
  if (!incomplete) score += 18;
  if (looksFactual && words >= 6 && words < 18) score += 22;
  if (hedges >= 2) score -= 16;
  if (words < 4) score -= 24;
  score = Math.max(0, Math.min(100, score));

  const missing = keywords.filter((k) => !answer.toLowerCase().includes(k));
  const pass = score >= passThreshold && !incomplete;

  if (pass) {
    return {
      pass: true,
      score,
      reason: `Judgy PASS (threshold ${passThreshold}): scored the answer, not the prompt alone. ${words} words, keyword coverage ${Math.round(coverage * 100)}% (${keywords.length - missing.length}/${keywords.length || 0}), score ${score}/100.`,
    };
  }

  const bits: string[] = [];
  if (incomplete) bits.push("answer self-describes as a sketch/incomplete");
  if (words < 18) bits.push(`too thin (${words} words)`);
  if (coverage < 0.45 && missing.length) {
    bits.push(`misses task keywords: ${missing.slice(0, 5).join(", ")}`);
  }
  if (hedges >= 2) bits.push("heavy hedging");
  bits.push(`score ${score}/100 (need ≥${passThreshold})`);

  return {
    pass: false,
    score,
    reason: `Judgy FAIL: ${bits.join("; ")}. Escalate to the large model.`,
  };
}

export function hintStep(output: string): CascadeStep {
  return {
    stage: "hint",
    label: "0. Judgy — cheap difficulty hint",
    output,
  };
}

export function smallStep(answer: string, source: string): CascadeStep {
  return {
    stage: "small",
    label: `1. Small quantized-style model (${source})`,
    output: answer,
  };
}

export function judgeStep(v: JudgeVerdict): CascadeStep {
  return {
    stage: "judge",
    label: "2. Judgy — scores the answer above",
    output: v.reason,
    verdict: v.pass ? "pass" : "fail",
    reason: v.reason,
    score: v.score,
  };
}

export function largeStep(answer: string | null, source: string): CascadeStep {
  if (answer == null) {
    return {
      stage: "large",
      label: "3. Large model — skipped",
      output: "Judgy passed. No escalation. Usage stays on the cheap path.",
      skipped: true,
    };
  }
  return {
    stage: "large",
    label: `3. Large model escalated (${source})`,
    output: answer,
  };
}
