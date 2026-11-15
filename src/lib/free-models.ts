/**
 * Free / cheap model providers for Open Limited (Cascade-Verify).
 *
 * Keyless first (works out of the box), then optional free-tier keys
 * from official vendor free tiers (Groq, Gemini, OpenRouter, Cerebras,
 * Hugging Face, NVIDIA NIM, GitHub Models, SambaNova, Cohere).
 */

export type ModelTier = "small" | "large";

export type FreeModelSource =
  | "kilo"
  | "llm7"
  | "ovhcloud"
  | "groq"
  | "gemini"
  | "openrouter-free"
  | "cerebras"
  | "huggingface"
  | "nvidia"
  | "github"
  | "sambanova"
  | "cohere"
  | "pollinations"
  | "mock";

/** Optional free API keys saved per user in the Limited product. */
export type UserApiKeys = {
  groq?: string;
  gemini?: string;
  openrouter?: string;
  cerebras?: string;
  huggingface?: string;
  nvidia?: string;
  github?: string;
  sambanova?: string;
  cohere?: string;
};

export type UserApiKeyStatus = {
  groq: boolean;
  gemini: boolean;
  openrouter: boolean;
  cerebras: boolean;
  huggingface: boolean;
  nvidia: boolean;
  github: boolean;
  sambanova: boolean;
  cohere: boolean;
  stack: string[];
};

type CompleteOpts = {
  tier: ModelTier;
  system: string;
  prompt: string;
  maxTokens: number;
  keys?: UserApiKeys;
};

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

function pickKey(userKey: string | undefined, ...envNames: string[]): string | undefined {
  if (userKey && userKey.trim()) return userKey.trim();
  for (const name of envNames) {
    const v = env(name);
    if (v) return v;
  }
  return undefined;
}

function assertUsable(text: string): string {
  const t = text.trim();
  if (!t) throw new Error("empty completion");
  const lower = t.toLowerCase();
  if (
    lower.includes("reached its budget") ||
    lower.includes("raise the key budget") ||
    lower.includes("valid api key is required") ||
    lower.includes("api key used for this request") ||
    lower.includes("api rate limit exceeded") ||
    lower.includes("missing authentication") ||
    lower.includes("you didn't provide an api key")
  ) {
    throw new Error("provider quota/auth failed");
  }
  // Reject meta-style mock leakage if a provider echoes instructions
  if (
    /^[a-z]+: keep it dense/i.test(t) ||
    /keywords touched:/i.test(t) ||
    /this quantized-style pass/i.test(t) ||
    /offline mock — live free models/i.test(t)
  ) {
    throw new Error("unusable meta completion");
  }
  // Reject pure chain-of-thought with no answer
  if (
    /^(first[,:]?\s+the user|we need (to )?answer|let me think|i need to respond)/i.test(
      t
    ) &&
    t.length > 80 &&
    !/[.!?]\s+[A-Z]/.test(t.slice(0, 120))
  ) {
    throw new Error("reasoning-only completion");
  }
  return t;
}

/** Pull assistant text from OpenAI-style payloads, including reasoning models. */
function extractMessageText(json: unknown): string {
  const root = json as {
    choices?: {
      message?: {
        content?: string | null | { type?: string; text?: string }[];
        reasoning?: string | null;
        reasoning_content?: string | null;
        reasoning_details?: { type?: string; text?: string }[];
      };
      text?: string;
    }[];
    message?: string;
    output_text?: string;
  };

  if (root.message && /rate limit/i.test(root.message)) {
    throw new Error(root.message);
  }

  const msg = root.choices?.[0]?.message;
  const content = msg?.content;
  if (typeof content === "string" && content.trim()) return content.trim();
  if (Array.isArray(content)) {
    const joined = content
      .map((part) => (typeof part === "string" ? part : part.text ?? ""))
      .join("")
      .trim();
    if (joined) return joined;
  }

  // Some free routers put the answer in reasoning when content is null
  const reasoning =
    (typeof msg?.reasoning === "string" && msg.reasoning.trim()) ||
    (typeof msg?.reasoning_content === "string" && msg.reasoning_content.trim()) ||
    msg?.reasoning_details
      ?.map((d) => d.text ?? "")
      .join("")
      .trim() ||
    "";

  if (reasoning) {
    // Prefer a short final-line answer if the model wrote CoT then the answer
    const lines = reasoning
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);
    const last = lines[lines.length - 1] ?? "";
    if (
      last &&
      last.length < 220 &&
      !/^(first|we need|let me|i need|the user|step\s*\d)/i.test(last)
    ) {
      return last;
    }
    // If reasoning is itself a short answer, use it
    if (reasoning.length < 280 && !/^first[,:]?\s+the user/i.test(reasoning)) {
      return reasoning;
    }
  }

  if (typeof root.choices?.[0]?.text === "string" && root.choices[0].text.trim()) {
    return root.choices[0].text.trim();
  }
  if (typeof root.output_text === "string" && root.output_text.trim()) {
    return root.output_text.trim();
  }
  return "";
}

async function openAiCompatible(opts: {
  url: string;
  apiKey?: string;
  model: string;
  system: string;
  prompt: string;
  maxTokens: number;
  extraHeaders?: Record<string, string>;
}): Promise<string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.extraHeaders ?? {}),
  };
  if (opts.apiKey) headers.Authorization = `Bearer ${opts.apiKey}`;

  const res = await fetch(opts.url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: opts.model,
      temperature: 0.3,
      max_tokens: Math.max(opts.maxTokens, 64),
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.prompt },
      ],
    }),
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${opts.url} ${res.status} ${body.slice(0, 120)}`);
  }
  const json = (await res.json()) as unknown;
  return assertUsable(extractMessageText(json));
}

/** Race keyless providers so chat feels fast like Cursor Auto. */
async function raceKeyless(opts: CompleteOpts): Promise<{
  text: string;
  source: FreeModelSource;
}> {
  const runners: { source: FreeModelSource; run: () => Promise<string> }[] = [
    { source: "kilo", run: () => tryKilo(opts) },
    { source: "llm7", run: () => tryLlm7(opts) },
    { source: "ovhcloud", run: () => tryOvh(opts) },
  ];

  return await new Promise((resolve, reject) => {
    let pending = runners.length;
    const errors: string[] = [];
    let settled = false;
    for (const step of runners) {
      step
        .run()
        .then((text) => {
          if (settled) return;
          if (text.trim()) {
            settled = true;
            resolve({ text, source: step.source });
          } else {
            errors.push(`${step.source}: empty`);
            pending -= 1;
            if (pending === 0) {
              reject(new Error(`keyless failed (${errors.join("; ")})`));
            }
          }
        })
        .catch((err) => {
          if (settled) return;
          errors.push(
            `${step.source}: ${err instanceof Error ? err.message.slice(0, 60) : "fail"}`,
          );
          pending -= 1;
          if (pending === 0) {
            reject(new Error(`keyless failed (${errors.join("; ")})`));
          }
        });
    }
  });
}

/** Kilo free auto-router — no API key (anonymous IP limits). */
async function tryKilo(opts: CompleteOpts): Promise<string> {
  const model =
    opts.tier === "small"
      ? env("KILO_SMALL_MODEL") ?? "kilo-auto/free"
      : env("KILO_LARGE_MODEL") ?? "kilo-auto/free";
  return openAiCompatible({
    url: "https://api.kilo.ai/api/gateway/chat/completions",
    model,
    system: opts.system,
    prompt: opts.prompt,
    maxTokens: opts.maxTokens,
  });
}

/** LLM7 turbo pool — works anonymously without a key. */
async function tryLlm7(opts: CompleteOpts): Promise<string> {
  const model =
    opts.tier === "small"
      ? env("LLM7_SMALL_MODEL") ?? "turbo"
      : env("LLM7_LARGE_MODEL") ?? "turbo";
  return openAiCompatible({
    url: "https://api.llm7.io/v1/chat/completions",
    apiKey: env("LLM7_API_KEY"),
    model,
    system: opts.system,
    prompt: opts.prompt,
    maxTokens: opts.maxTokens,
  });
}

/** OVHcloud AI Endpoints — anonymous free tier (very low RPM). */
async function tryOvh(opts: CompleteOpts): Promise<string> {
  const model =
    opts.tier === "small"
      ? env("OVH_SMALL_MODEL") ?? "Mistral-7B-Instruct-v0.3"
      : env("OVH_LARGE_MODEL") ?? "Mistral-Small-3.2-24B-Instruct-2506";
  return openAiCompatible({
    url: "https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions",
    model,
    system: opts.system,
    prompt: opts.prompt,
    maxTokens: opts.maxTokens,
  });
}

async function tryGroq(opts: CompleteOpts): Promise<string> {
  const key = pickKey(opts.keys?.groq, "GROQ_API_KEY");
  if (!key) throw new Error("no groq");
  const model =
    opts.tier === "small"
      ? env("GROQ_SMALL_MODEL") ?? "llama-3.1-8b-instant"
      : env("GROQ_LARGE_MODEL") ?? "llama-3.3-70b-versatile";
  return openAiCompatible({
    url: "https://api.groq.com/openai/v1/chat/completions",
    apiKey: key,
    model,
    system: opts.system,
    prompt: opts.prompt,
    maxTokens: opts.maxTokens,
  });
}

async function tryGemini(opts: CompleteOpts): Promise<string> {
  const key = pickKey(
    opts.keys?.gemini,
    "GEMINI_API_KEY",
    "GOOGLE_GENERATIVE_AI_API_KEY"
  );
  if (!key) throw new Error("no gemini");
  const model =
    opts.tier === "small"
      ? env("GEMINI_SMALL_MODEL") ?? "gemini-2.0-flash"
      : env("GEMINI_LARGE_MODEL") ?? "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: opts.system }] },
      contents: [{ role: "user", parts: [{ text: opts.prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: Math.max(opts.maxTokens, 64),
      },
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = json.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("")
    .trim();
  return assertUsable(text ?? "");
}

async function tryOpenRouter(opts: CompleteOpts): Promise<string> {
  const key = pickKey(opts.keys?.openrouter, "OPENROUTER_API_KEY");
  if (!key) throw new Error("no openrouter");
  const model =
    opts.tier === "small"
      ? env("OPENROUTER_SMALL_MODEL") ?? "openrouter/free"
      : env("OPENROUTER_LARGE_MODEL") ?? "openrouter/free";
  return openAiCompatible({
    url: "https://openrouter.ai/api/v1/chat/completions",
    apiKey: key,
    model,
    system: opts.system,
    prompt: opts.prompt,
    maxTokens: opts.maxTokens,
    extraHeaders: {
      "HTTP-Referer": env("OPENROUTER_SITE_URL") ?? "http://localhost:43127",
      "X-Title": "Eco AI Cascade-Verify",
    },
  });
}

async function tryCerebras(opts: CompleteOpts): Promise<string> {
  const key = pickKey(opts.keys?.cerebras, "CEREBRAS_API_KEY");
  if (!key) throw new Error("no cerebras");
  const model =
    opts.tier === "small"
      ? env("CEREBRAS_SMALL_MODEL") ?? "llama3.1-8b"
      : env("CEREBRAS_LARGE_MODEL") ?? "llama3.3-70b";
  return openAiCompatible({
    url: "https://api.cerebras.ai/v1/chat/completions",
    apiKey: key,
    model,
    system: opts.system,
    prompt: opts.prompt,
    maxTokens: opts.maxTokens,
  });
}

/** Hugging Face Inference Router (free tier with HF token). */
async function tryHuggingFace(opts: CompleteOpts): Promise<string> {
  const key = pickKey(
    opts.keys?.huggingface,
    "HF_TOKEN",
    "HUGGINGFACE_API_KEY",
    "HUGGINGFACEHUB_API_TOKEN"
  );
  if (!key) throw new Error("no huggingface");
  const model =
    opts.tier === "small"
      ? env("HF_SMALL_MODEL") ?? "meta-llama/Llama-3.1-8B-Instruct"
      : env("HF_LARGE_MODEL") ?? "meta-llama/Llama-3.3-70B-Instruct";
  return openAiCompatible({
    url: "https://router.huggingface.co/v1/chat/completions",
    apiKey: key,
    model,
    system: opts.system,
    prompt: opts.prompt,
    maxTokens: opts.maxTokens,
  });
}

/** NVIDIA NIM free tier (build.nvidia.com). */
async function tryNvidia(opts: CompleteOpts): Promise<string> {
  const key = pickKey(opts.keys?.nvidia, "NVIDIA_API_KEY", "NVIDIA_NIM_API_KEY");
  if (!key) throw new Error("no nvidia");
  const model =
    opts.tier === "small"
      ? env("NVIDIA_SMALL_MODEL") ?? "meta/llama-3.3-8b-instruct"
      : env("NVIDIA_LARGE_MODEL") ?? "meta/llama-3.3-70b-instruct";
  return openAiCompatible({
    url: "https://integrate.api.nvidia.com/v1/chat/completions",
    apiKey: key,
    model,
    system: opts.system,
    prompt: opts.prompt,
    maxTokens: opts.maxTokens,
  });
}

/** GitHub Models (any GitHub PAT with models access). */
async function tryGithub(opts: CompleteOpts): Promise<string> {
  const key = pickKey(opts.keys?.github, "GITHUB_TOKEN", "GITHUB_MODELS_TOKEN");
  if (!key) throw new Error("no github");
  const model =
    opts.tier === "small"
      ? env("GITHUB_SMALL_MODEL") ?? "gpt-4o-mini"
      : env("GITHUB_LARGE_MODEL") ?? "gpt-4o";
  return openAiCompatible({
    url: "https://models.github.ai/inference/chat/completions",
    apiKey: key,
    model,
    system: opts.system,
    prompt: opts.prompt,
    maxTokens: opts.maxTokens,
  });
}

/** SambaNova Cloud free tier. */
async function trySambaNova(opts: CompleteOpts): Promise<string> {
  const key = pickKey(opts.keys?.sambanova, "SAMBANOVA_API_KEY");
  if (!key) throw new Error("no sambanova");
  const model =
    opts.tier === "small"
      ? env("SAMBANOVA_SMALL_MODEL") ?? "Meta-Llama-3.1-8B-Instruct"
      : env("SAMBANOVA_LARGE_MODEL") ?? "Meta-Llama-3.3-70B-Instruct";
  return openAiCompatible({
    url: "https://api.sambanova.ai/v1/chat/completions",
    apiKey: key,
    model,
    system: opts.system,
    prompt: opts.prompt,
    maxTokens: opts.maxTokens,
  });
}

/** Cohere free Trial / Command models. */
async function tryCohere(opts: CompleteOpts): Promise<string> {
  const key = pickKey(opts.keys?.cohere, "COHERE_API_KEY");
  if (!key) throw new Error("no cohere");
  const model =
    opts.tier === "small"
      ? env("COHERE_SMALL_MODEL") ?? "command-r"
      : env("COHERE_LARGE_MODEL") ?? "command-r-plus";
  const res = await fetch("https://api.cohere.com/v2/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: Math.max(opts.maxTokens, 64),
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.prompt },
      ],
    }),
    signal: AbortSignal.timeout(35_000),
  });
  if (!res.ok) throw new Error(`cohere ${res.status}`);
  const json = (await res.json()) as {
    message?: { content?: { type?: string; text?: string }[] };
    text?: string;
  };
  const text =
    json.message?.content?.map((c) => c.text ?? "").join("").trim() ||
    (json.text ?? "").trim();
  return assertUsable(text);
}

async function tryPollinations(opts: CompleteOpts): Promise<string> {
  const model =
    opts.tier === "small"
      ? env("POLLINATIONS_SMALL_MODEL") ?? "openai-fast"
      : env("POLLINATIONS_LARGE_MODEL") ?? "openai";
  return openAiCompatible({
    url: "https://text.pollinations.ai/openai",
    apiKey: env("POLLINATIONS_API_KEY"),
    model,
    system: opts.system,
    prompt: opts.prompt,
    maxTokens: opts.maxTokens,
  });
}

export async function completeFreeModel(
  opts: CompleteOpts
): Promise<{ text: string; source: FreeModelSource }> {
  // Fast path: race keyless providers (Cursor Auto–style)
  try {
    return await raceKeyless(opts);
  } catch {
    /* fall through to keyed free tiers */
  }

  const chain: { source: FreeModelSource; run: () => Promise<string> }[] = [
    { source: "groq", run: () => tryGroq(opts) },
    { source: "gemini", run: () => tryGemini(opts) },
    { source: "openrouter-free", run: () => tryOpenRouter(opts) },
    { source: "cerebras", run: () => tryCerebras(opts) },
    { source: "huggingface", run: () => tryHuggingFace(opts) },
    { source: "nvidia", run: () => tryNvidia(opts) },
    { source: "github", run: () => tryGithub(opts) },
    { source: "sambanova", run: () => trySambaNova(opts) },
    { source: "cohere", run: () => tryCohere(opts) },
    { source: "pollinations", run: () => tryPollinations(opts) },
  ];

  const errors: string[] = [];
  for (const step of chain) {
    try {
      const text = await step.run();
      if (text.trim()) return { text, source: step.source };
    } catch (err) {
      errors.push(
        `${step.source}: ${err instanceof Error ? err.message.slice(0, 80) : "fail"}`,
      );
    }
  }
  throw new Error(`all free providers failed (${errors.slice(0, 5).join("; ")})`);
}

export function describeFreeStack(keys?: UserApiKeys): string[] {
  const rows: string[] = [
    "Kilo free auto-router (no key)",
    "LLM7 turbo (no key)",
    "OVHcloud anonymous (no key, low rate)",
  ];
  if (pickKey(keys?.groq, "GROQ_API_KEY")) rows.push("Groq Llama free tier");
  if (pickKey(keys?.gemini, "GEMINI_API_KEY", "GOOGLE_GENERATIVE_AI_API_KEY")) {
    rows.push("Google Gemini free tier");
  }
  if (pickKey(keys?.openrouter, "OPENROUTER_API_KEY")) {
    rows.push("OpenRouter free models");
  }
  if (pickKey(keys?.cerebras, "CEREBRAS_API_KEY")) {
    rows.push("Cerebras free tier");
  }
  if (pickKey(keys?.huggingface, "HF_TOKEN", "HUGGINGFACE_API_KEY")) {
    rows.push("Hugging Face Inference");
  }
  if (pickKey(keys?.nvidia, "NVIDIA_API_KEY", "NVIDIA_NIM_API_KEY")) {
    rows.push("NVIDIA NIM free");
  }
  if (pickKey(keys?.github, "GITHUB_TOKEN", "GITHUB_MODELS_TOKEN")) {
    rows.push("GitHub Models");
  }
  if (pickKey(keys?.sambanova, "SAMBANOVA_API_KEY")) {
    rows.push("SambaNova free tier");
  }
  if (pickKey(keys?.cohere, "COHERE_API_KEY")) {
    rows.push("Cohere free Trial");
  }
  rows.push("Pollinations public free API");
  rows.push("Local mock (offline fallback)");
  return rows;
}

export function userApiKeyStatus(keys?: UserApiKeys): UserApiKeyStatus {
  return {
    groq: Boolean(keys?.groq?.trim()),
    gemini: Boolean(keys?.gemini?.trim()),
    openrouter: Boolean(keys?.openrouter?.trim()),
    cerebras: Boolean(keys?.cerebras?.trim()),
    huggingface: Boolean(keys?.huggingface?.trim()),
    nvidia: Boolean(keys?.nvidia?.trim()),
    github: Boolean(keys?.github?.trim()),
    sambanova: Boolean(keys?.sambanova?.trim()),
    cohere: Boolean(keys?.cohere?.trim()),
    stack: describeFreeStack(keys),
  };
}
