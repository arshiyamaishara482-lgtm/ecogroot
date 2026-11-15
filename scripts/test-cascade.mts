import { runCascadeVerify } from "../src/lib/cascade";

const r = await runCascadeVerify(
  "What is the capital of Bangladesh?",
  "ultra-eco",
);
console.log(
  JSON.stringify(
    {
      source: r.modelSource,
      path: r.usedCheapPath ? "cheap" : "escalated",
      answer: r.finalAnswer,
      steps: r.steps.map((s) => ({ stage: s.stage, verdict: s.verdict, skipped: s.skipped })),
    },
    null,
    2,
  ),
);
