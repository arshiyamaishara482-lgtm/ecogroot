import { countTokens } from "./mock-models";
import type { ImpactEstimate } from "./types";

/**
 * Secondary ESTIMATES only. Not metered hardware, not a green claim.
 * Order-of-magnitude toys so the wallet UI has energy/CO₂/water numbers.
 */
export function estimateImpact(opts: {
  prompt: string;
  smallAnswer: string;
  largeAnswer: string | null;
  ecoSkill: boolean;
}): ImpactEstimate {
  const tokensIn = countTokens(opts.prompt);
  const tokensOut =
    countTokens(opts.smallAnswer) +
    (opts.largeAnswer ? countTokens(opts.largeAnswer) : 0);

  const smallJoules = (tokensIn + countTokens(opts.smallAnswer)) * 0.35;
  const largeJoules = opts.largeAnswer
    ? (tokensIn + countTokens(opts.largeAnswer)) * 2.6
    : 0;
  const joules = (smallJoules + largeJoules) * (opts.ecoSkill ? 0.9 : 1);
  const energyKwhEstimate = joules / 3.6e6;
  const co2gEstimate = energyKwhEstimate * 385;
  const waterMlEstimate = energyKwhEstimate * 1900;
  const costUsdEstimate =
    tokensIn * 0.0000004 +
    countTokens(opts.smallAnswer) * 0.0000006 +
    (opts.largeAnswer ? countTokens(opts.largeAnswer) * 0.000004 : 0);

  return {
    tokensIn,
    tokensOut,
    costUsdEstimate,
    energyKwhEstimate,
    co2gEstimate,
    waterMlEstimate,
    note: "Estimates only — not measured energy, water, or carbon. Demo heuristics from token counts.",
  };
}
