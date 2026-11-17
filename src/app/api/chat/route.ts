import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-guard";
import { runCascadeVerify } from "@/lib/cascade";
import {
  DEFAULT_CHAT_ECO_MODE,
  isChatEcoMode,
  modeFromHoney,
} from "@/lib/chat-modes";
import { pushActivity } from "@/lib/activity";
import { debitOrThrow } from "@/lib/plans";
import { getSnapshot } from "@/lib/session";
import { newId, withStore } from "@/lib/store";
import type { UserApiKeys } from "@/lib/free-models";
import type { ChatMessage } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const gate = await requireUser();
  if (gate.response) return gate.response;

  let body: {
    prompt?: string;
    ecoSkill?: boolean;
    mode?: string;
    conversationId?: string;
  };
  try {
    body = (await req.json()) as typeof body;
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

  // Which chat thread is this question part of? (a new chat sends a fresh id)
  const rawConv = typeof body.conversationId === "string" ? body.conversationId : "";
  const conversationId = /^[\w-]{1,60}$/.test(rawConv) ? rawConv : newId("conv");

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
      // Always work on the STORED user so the wallet only ever goes down.
      const user = store.users[gate.user.id];
      if (!user) throw new Error("Account not found. Please log in again.");

      const updated = debitOrThrow(user, cascade.creditsDebited);
      const tokensIn = cascade.impact.tokensIn;
      const tokensOut = cascade.impact.tokensOut;
      const tokensTotal = tokensIn + tokensOut;
      updated.chatsTotal += 1;
      if (cascade.usedCheapPath) updated.cheapPathCount += 1;
      updated.tokensUsed = (updated.tokensUsed ?? 0) + tokensTotal;
      store.users[user.id] = updated;

      const now = new Date().toISOString();
      const userMsg: ChatMessage = {
        id: newId("msg"),
        role: "user",
        content: prompt,
        createdAt: now,
        conversationId,
      };
      const assistantMsg: ChatMessage = {
        id: newId("msg"),
        role: "assistant",
        content: cascade.finalAnswer,
        createdAt: now,
        cascade,
        conversationId,
      };
      const thread = store.chats[user.id] ?? [];
      store.chats[user.id] = [...thread, userMsg, assistantMsg];

      // One log row per question, with the real user's details.
      pushActivity(store, {
        type: "question",
        userId: user.id,
        name: user.displayName,
        email: user.email ?? "—",
        phone: user.phone,
        question: prompt,
        tokensIn,
        tokensOut,
        tokensTotal,
        userTokensTotal: updated.tokensUsed,
        creditsDebited: cascade.creditsDebited,
        creditsLeft: updated.credits,
        path: cascade.usedCheapPath ? "cheap" : "escalated",
        model: cascade.modelSource,
      });
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