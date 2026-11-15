import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-guard";
import { runCascadeVerify } from "@/lib/cascade";
import {
  DEFAULT_CHAT_ECO_MODE,
  isChatEcoMode,
  modeFromHoney,
} from "@/lib/chat-modes";
import { debitOrThrow } from "@/lib/plans";
import { getSnapshot } from "@/lib/session";
import { newId, withStore } from "@/lib/store";
import type { UserApiKeys } from "@/lib/free-models";
import type { ChatMessage } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const gate = await requireUser();
  if (gate.response) return gate.response;

  let body: { prompt?: string; ecoSkill?: boolean; mode?: string };
  try {
    body = (await req.json()) as { prompt?: string; ecoSkill?: boolean; mode?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const prompt = (body.prompt ?? "").trim();
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }
  if (prompt.length > 8000) {
    return NextResponse.json({ error: "Prompt is too long" }, { status: 400 });
  }

  const mode = isChatEcoMode(body.mode)
    ? body.mode
    : body.ecoSkill != null
      ? modeFromHoney(Boolean(body.ecoSkill))
      : DEFAULT_CHAT_ECO_MODE;

  const keys = await withStore(
    (store) => (store.apiKeys[gate.user.id] ?? {}) as UserApiKeys
  );
  const cascade = await runCascadeVerify(prompt, mode, keys);

  try {
    const result = await withStore((store) => {
      // Ensure the store has a users dictionary and seed the current user if missing from ephemeral storage
      if (!store.users) {
        store.users = {};
      }
      if (!store.users[gate.user.id]) {
        store.users[gate.user.id] = gate.user;
      }

      const user = store.users[gate.user.id];
      const updated = debitOrThrow(user, cascade.creditsDebited);
      updated.chatsTotal += 1;
      if (cascade.usedCheapPath) updated.cheapPathCount += 1;
      store.users[user.id] = updated;

      const now = new Date().toISOString();
      const userMsg: ChatMessage = {
        id: newId("msg"),
        role: "user",
        content: prompt,
        createdAt: now,
      };
      const assistantMsg: ChatMessage = {
        id: newId("msg"),
        role: "assistant",
        content: cascade.finalAnswer,
        createdAt: now,
        cascade,
      };
      const thread = store.chats[user.id] ?? [];
      store.chats[user.id] = [...thread, userMsg, assistantMsg];
      return { user: updated, userMsg, assistantMsg };
    }, true);

    const snapshot = await getSnapshot(result.user);
    return NextResponse.json({
      ...snapshot,
      cascade,
      assistantMessage: result.assistantMsg,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Wallet error";
    if (message === "Usage limit reached for this demo wallet") {
      return NextResponse.json({ error: message }, { status: 402 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}