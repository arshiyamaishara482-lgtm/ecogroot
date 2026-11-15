/**
 * Chat eco modes — Cascade-Verify always runs.
 * Honey (shorter outputs) is what differs between modes.
 */
export type ChatEcoMode = "ultra-eco" | "eco-cascade";

export const DEFAULT_CHAT_ECO_MODE: ChatEcoMode = "ultra-eco";

export const CHAT_ECO_MODES: {
  id: ChatEcoMode;
  label: string;
  blurb: string;
  honey: boolean;
}[] = [
  {
    id: "ultra-eco",
    label: "Ultra Eco",
    blurb: "Cascade + Honey — denser replies, lowest burn (default)",
    honey: true,
  },
  {
    id: "eco-cascade",
    label: "Eco-Cascade",
    blurb: "Cascade only — fuller answers, still small-first routing",
    honey: false,
  },
];

export function isChatEcoMode(value: unknown): value is ChatEcoMode {
  return value === "ultra-eco" || value === "eco-cascade";
}

export function honeyFromMode(mode: ChatEcoMode): boolean {
  return mode === "ultra-eco";
}

export function modeFromHoney(honey: boolean): ChatEcoMode {
  return honey ? "ultra-eco" : "eco-cascade";
}
