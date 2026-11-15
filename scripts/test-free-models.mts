import { completeFreeModel } from "../src/lib/free-models";

const r = await completeFreeModel({
  tier: "small",
  maxTokens: 100,
  system:
    "You are Eco AI. Answer the user's question directly in 2-4 short sentences. Lead with the fact. Do not describe your process.",
  prompt: "What is the capital of Bangladesh?",
});
console.log(JSON.stringify(r, null, 2));
