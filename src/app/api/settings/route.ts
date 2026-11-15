import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-guard";
import { userApiKeyStatus, type UserApiKeys } from "@/lib/free-models";
import { withStore } from "@/lib/store";

export const dynamic = "force-dynamic";

const KEY_FIELDS = [
  "groq",
  "gemini",
  "openrouter",
  "cerebras",
  "huggingface",
  "nvidia",
  "github",
  "sambanova",
  "cohere",
] as const;

export async function GET() {
  const gate = await requireUser();
  if (gate.response) return gate.response;

  const keys = await withStore((store) => store.apiKeys[gate.user.id] ?? {});
  return NextResponse.json({
    keys: userApiKeyStatus(keys),
    notice:
      "Keyless Kilo / LLM7 / OVH answer first (like Cursor Auto). Optional free keys from Groq, Gemini, OpenRouter, Cerebras, Hugging Face, NVIDIA, GitHub Models, SambaNova, and Cohere raise limits.",
  });
}

export async function POST(req: Request) {
  const gate = await requireUser();
  if (gate.response) return gate.response;

  let body: UserApiKeys = {};
  try {
    body = (await req.json()) as UserApiKeys;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const next = await withStore((store) => {
    const prev = (store.apiKeys[gate.user.id] ?? {}) as UserApiKeys;
    const merged: UserApiKeys = { ...prev };
    for (const field of KEY_FIELDS) {
      const value = body[field];
      if (typeof value === "string" && value.trim()) {
        merged[field] = value.trim();
      }
    }
    store.apiKeys[gate.user.id] = merged;
    return merged;
  }, true);

  return NextResponse.json({
    ok: true,
    keys: userApiKeyStatus(next),
    notice:
      "Saved. Cascade-Verify races keyless free models first, then your official free-tier keys.",
  });
}

export async function DELETE() {
  const gate = await requireUser();
  if (gate.response) return gate.response;
  await withStore((store) => {
    delete store.apiKeys[gate.user.id];
  }, true);
  return NextResponse.json({ ok: true, keys: userApiKeyStatus({}) });
}
