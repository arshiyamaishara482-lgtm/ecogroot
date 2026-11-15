"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CascadePipeline } from "@/components/cascade-pipeline";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useWallet } from "@/components/wallet-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CHAT_ECO_MODES,
  DEFAULT_CHAT_ECO_MODE,
  type ChatEcoMode,
} from "@/lib/chat-modes";
import {
  formatCo2,
  formatKwh,
  formatUsd,
  formatWater,
} from "@/lib/format";
import type { ChatMessage, PublicSnapshot } from "@/lib/types";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  { label: "Capital of Bangladesh", prompt: "What is the capital of Bangladesh?" },
  { label: "Composting", prompt: "What is composting? Summarize in 3 bullets." },
  {
    label: "Quantization",
    prompt:
      "Define quantization in one short paragraph for a GPU operator. Mention VRAM, not product memory.",
  },
  {
    label: "Hard math",
    prompt: "Prove that the square root of 2 is irrational.",
  },
];

export default function ChatPage() {
  const { snapshot, setSnapshot } = useWallet();
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<ChatEcoMode>(DEFAULT_CHAT_ECO_MODE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinBusy, setPinBusy] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const lastAssistant = useMemo(() => {
    const msgs = snapshot.chats.filter((m) => m.role === "assistant");
    return msgs[msgs.length - 1] ?? null;
  }, [snapshot.chats]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [snapshot.chats.length, pendingUser, busy]);

  async function send(nextPrompt?: string) {
    const text = (nextPrompt ?? prompt).trim();
    if (!text || busy) return;
    setBusy(true);
    setError(null);
    setPrompt("");
    setPendingUser(text);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, mode }),
      });
      const json = (await res.json()) as PublicSnapshot & {
        error?: string;
        assistantMessage?: ChatMessage;
      };
      if (!res.ok) {
        throw new Error(json.error ?? `Chat failed (${res.status})`);
      }
      setSnapshot({
        user: json.user,
        cascadeSaveRate: json.cascadeSaveRate,
        memories: json.memories,
        chats: json.chats,
        videos: json.videos,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed");
    } finally {
      setPendingUser(null);
      setBusy(false);
    }
  }

  async function pinAnswer(msg: ChatMessage) {
    setPinBusy(msg.id);
    setError(null);
    try {
      const res = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Pinned answer",
          body: msg.content,
          pinned: true,
          source: "answer",
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        memories?: PublicSnapshot["memories"];
      };
      if (!res.ok) throw new Error(json.error ?? "Could not pin");
      if (json.memories) {
        setSnapshot({ ...snapshot, memories: json.memories });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pin failed");
    } finally {
      setPinBusy(null);
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-2rem)] flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chat</h1>
          <p className="text-sm text-muted-foreground">
            Ask anything — Eco AI routes free models automatically (small first, escalate only if
            needed).
          </p>
        </div>
        <div className="flex rounded-lg border border-foreground/10 p-0.5 text-xs">
          {CHAT_ECO_MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={cn(
                "rounded-md px-3 py-1.5 font-medium transition",
                mode === item.id
                  ? "bg-emerald-600 text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title={item.blurb}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <Button
            key={ex.label}
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => void send(ex.prompt)}
          >
            {ex.label}
          </Button>
        ))}
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not complete</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex-1 space-y-4 pb-4">
        {snapshot.chats.length === 0 && !pendingUser ? (
          <div className="rounded-xl border border-dashed px-4 py-16 text-center">
            <p className="text-base font-medium text-foreground">Ask Eco AI anything</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Free open models answer first. Stats stay tucked away unless you open details.
            </p>
          </div>
        ) : null}

        {snapshot.chats.map((msg) =>
          msg.role === "user" ? (
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-[min(42rem,92%)] rounded-2xl bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={msg.id} className="flex justify-start">
              <div className="max-w-[min(46rem,96%)] space-y-2">
                <div className="rounded-2xl bg-card px-4 py-3 text-[15px] leading-relaxed ring-1 ring-foreground/10 whitespace-pre-wrap">
                  {msg.content}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-[11px] text-muted-foreground">
                  <span>
                    {msg.cascade?.modelSource ?? "eco"}
                    {msg.cascade?.usedCheapPath === false ? " · escalated" : " · auto"}
                  </span>
                  <button
                    type="button"
                    className="underline-offset-2 hover:underline"
                    disabled={pinBusy === msg.id}
                    onClick={() => void pinAnswer(msg)}
                  >
                    {pinBusy === msg.id ? "Pinning…" : "Pin"}
                  </button>
                  {msg.cascade ? (
                    <details className="w-full">
                      <summary className="cursor-pointer select-none hover:text-foreground">
                        Details (cascade + impact)
                      </summary>
                      <div className="mt-2 space-y-2 rounded-xl border border-foreground/10 bg-muted/30 p-3">
                        <CascadePipeline result={msg.cascade} />
                        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                          <div>
                            Tokens {msg.cascade.impact.tokensIn}/
                            {msg.cascade.impact.tokensOut}
                          </div>
                          <div>{formatUsd(msg.cascade.impact.costUsdEstimate)}</div>
                          <div>{formatKwh(msg.cascade.impact.energyKwhEstimate)}</div>
                          <div>{formatCo2(msg.cascade.impact.co2gEstimate)}</div>
                          <div>{formatWater(msg.cascade.impact.waterMlEstimate)}</div>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {msg.cascade.impact.note}
                        </p>
                      </div>
                    </details>
                  ) : null}
                </div>
              </div>
            </div>
          ),
        )}

        {pendingUser ? (
          <>
            <div className="flex justify-end">
              <div className="max-w-[min(42rem,92%)] rounded-2xl bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground whitespace-pre-wrap">
                {pendingUser}
              </div>
            </div>
            <div className="flex justify-start">
              <div className="rounded-2xl bg-card px-4 py-3 text-sm text-muted-foreground ring-1 ring-foreground/10">
                Thinking with free models…
              </div>
            </div>
          </>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <form
        className="sticky bottom-2 z-10 space-y-2 rounded-2xl border border-foreground/10 bg-card/95 p-3 shadow-lg backdrop-blur"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder="Message Eco AI…"
          rows={2}
          disabled={busy}
          className="min-h-[64px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {mode === "ultra-eco" ? "Ultra Eco" : "Eco-Cascade"} · Enter to send
          </p>
          <Button type="submit" disabled={busy || !prompt.trim()}>
            {busy ? "Sending…" : "Send"}
          </Button>
        </div>
      </form>

      {lastAssistant?.cascade?.usedCheapPath === false ? (
        <p className="text-xs text-muted-foreground">
          Last turn escalated after Judgy rejected the small answer.
        </p>
      ) : null}
    </div>
  );
}
