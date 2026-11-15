"use client";

import Link from "next/link";
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
import { QUANTIZATION_NOTE } from "@/lib/constants";
import { formatCredits, formatPct } from "@/lib/format";

export default function DashboardPage() {
  const { snapshot } = useWallet();
  const { user, memories, cascadeSaveRate, chats, videos } = snapshot;
  const chatTurns = chats.filter((m) => m.role === "user").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          One usage pool. One creative memory. Cascade save rate is cheap-path chats ÷ total chats.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <CardDescription>Cascade save rate</CardDescription>
            <CardTitle className="font-mono text-2xl tabular-nums">
              {formatPct(cascadeSaveRate)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {user.cheapPathCount} cheap / {user.chatsTotal} chats
          </CardContent>
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
              Send an easy prompt to see a judge PASS. Send a proof or a full business plan to
              watch FAIL → escalate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/app/chat" />}>Open chat</Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Creative memory</CardTitle>
          <CardDescription>
            Shared notes and pinned answers. {QUANTIZATION_NOTE}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {memories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Memory is empty. Pin a reply from chat or add a note there.
            </p>
          ) : (
            <ul className="space-y-3">
              {memories.map((note) => (
                <li key={note.id} className="rounded-lg bg-muted/50 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {note.title}
                    {note.pinned ? (
                      <span className="text-[11px] text-primary">pinned</span>
                    ) : null}
                    <span className="text-[11px] font-normal text-muted-foreground">
                      {note.source}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{note.body}</p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4">
            <Button variant="outline" render={<Link href="/app/chat" />}>
              Pin from chat
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
