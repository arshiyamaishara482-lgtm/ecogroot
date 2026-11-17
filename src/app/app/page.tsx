"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { LeafMark } from "@/components/leaf-mark";
import { PlanBadge } from "@/components/plan-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWallet } from "@/components/wallet-context";
import { PLAN_CREDITS } from "@/lib/constants";
import { buildConversations, newConversationId } from "@/lib/conversations";
import { EXAMPLES } from "@/lib/examples";
import { formatCredits, formatWhen } from "@/lib/format";

export default function DashboardPage() {
  const router = useRouter();
  const { snapshot } = useWallet();
  const { user, chats, videos } = snapshot;
  const chatTurns = chats.filter((m) => m.role === "user").length;

  const conversations = useMemo(() => buildConversations(chats), [chats]);
  const recent = conversations.slice(0, 5);

  const totalCredits = PLAN_CREDITS[user.plan];
  const creditsUsed = Math.max(0, totalCredits - user.credits);
  const usedPct = Math.min(100, (creditsUsed / totalCredits) * 100);
  const tokensUsed =
    user.tokensUsed ?? conversations.reduce((sum, c) => sum + c.tokens, 0);

  function quickStart(prompt: string) {
    router.push(
      `/app/chat?c=${newConversationId()}&q=${encodeURIComponent(prompt)}`,
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your usage, your recent chats, and quick ways to get started.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Usage left</CardDescription>
            <CardTitle className="font-mono text-2xl tabular-nums">
              {formatCredits(user.credits)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Plan</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <PlanBadge plan={user.plan} />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Activity</CardDescription>
            <CardTitle>
              {chatTurns} chats · {videos.length} clips
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {chatTurns === 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LeafMark className="size-6" />
              <CardTitle>No chats yet</CardTitle>
            </div>
            <CardDescription>
              Ask your first question below, or open the chat and type your own.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/app/chat" />}>Open chat</Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your usage</CardTitle>
            <CardDescription>
              Each question uses a few credits from your pool.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span className="font-mono tabular-nums">
                  {formatCredits(creditsUsed)} / {formatCredits(totalCredits)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {usedPct < 0.1 && creditsUsed > 0 ? "<0.1" : usedPct.toFixed(1)}% used
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all"
                  style={{ width: `${creditsUsed > 0 ? Math.max(usedPct, 1.5) : 0}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <div className="text-xs text-muted-foreground">Tokens used</div>
                <div className="font-mono text-lg tabular-nums">
                  {formatCredits(tokensUsed)}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <div className="text-xs text-muted-foreground">Questions asked</div>
                <div className="font-mono text-lg tabular-nums">
                  {formatCredits(chatTurns)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent chats</CardTitle>
            <CardDescription>Pick up where you left off.</CardDescription>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Your conversations will show up here.
              </p>
            ) : (
              <ul className="divide-y divide-foreground/10">
                {recent.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/app/chat?c=${encodeURIComponent(c.id)}`}
                      className="flex items-center justify-between gap-4 rounded-md px-2 py-2.5 hover:bg-muted/60"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {c.title || "Chat"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatWhen(c.lastAt)}
                        </div>
                      </div>
                      <div className="shrink-0 text-right text-xs text-muted-foreground">
                        <div>
                          {c.count} {c.count === 1 ? "question" : "questions"}
                        </div>
                        <div className="font-mono tabular-nums">
                          {formatCredits(c.tokens)} tokens
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick start</CardTitle>
          <CardDescription>
            Click one to open a new chat with that question already asked.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <Button
              key={ex.label}
              variant="outline"
              size="sm"
              onClick={() => quickStart(ex.prompt)}
            >
              {ex.label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
