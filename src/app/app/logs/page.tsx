"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWallet } from "@/components/wallet-context";
import { formatCredits } from "@/lib/format";
import type { ActivityEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  questions: number;
  tokensUsed: number;
  creditsLeft: number;
};

type LogData = { events: ActivityEvent[]; users: UserRow[]; serverTime: string };

type Tab = "all" | "signups" | "logins" | "questions" | "users";

const POLL_MS = 3000;

function when(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString([], {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
}

const TYPE_STYLE: Record<ActivityEvent["type"], { label: string; cls: string }> = {
  signup: { label: "New sign-up", cls: "bg-emerald-100 text-emerald-900" },
  login: { label: "Log in", cls: "bg-sky-100 text-sky-900" },
  login_failed: { label: "Failed log in", cls: "bg-red-100 text-red-900" },
  logout: { label: "Log out", cls: "bg-zinc-100 text-zinc-700" },
  question: { label: "Question", cls: "bg-amber-100 text-amber-900" },
};

function TypePill({ type }: { type: ActivityEvent["type"] }) {
  const t = TYPE_STYLE[type];
  return (
    <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", t.cls)}>
      {t.label}
    </span>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={cn(
        "px-3 py-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase whitespace-nowrap",
        right ? "text-right" : "text-left",
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  right,
  className,
}: {
  children: React.ReactNode;
  right?: boolean;
  className?: string;
}) {
  return (
    <td className={cn("px-3 py-2 align-top text-sm", right && "text-right font-mono tabular-nums", className)}>
      {children}
    </td>
  );
}

function Table({ head, children, empty }: { head: React.ReactNode; children: React.ReactNode[]; empty: string }) {
  return (
    <div className="overflow-x-auto rounded-lg ring-1 ring-foreground/10">
      <table className="w-full min-w-[640px] border-collapse">
        <thead className="bg-muted/50">
          <tr>{head}</tr>
        </thead>
        <tbody className="divide-y divide-foreground/10">
          {children.length === 0 ? (
            <tr>
              <td colSpan={12} className="px-3 py-10 text-center text-sm text-muted-foreground">
                {empty}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function ActivityLogPage() {
  const { snapshot } = useWallet();
  const [data, setData] = useState<LogData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [live, setLive] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/logs", { cache: "no-store" });
        const json = (await res.json()) as LogData & { error?: string };
        if (!res.ok) throw new Error(json.error ?? `Failed (${res.status})`);
        if (cancelled) return;
        setData(json);
        setUpdatedAt(new Date().toLocaleTimeString());
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load the log");
        }
      }
    }
    void load();
    if (!live) {
      return () => {
        cancelled = true;
      };
    }
    const timer = setInterval(() => void load(), POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [live]);

  const events = useMemo(() => data?.events ?? [], [data]);
  const users = useMemo(() => data?.users ?? [], [data]);

  const stats = useMemo(() => {
    const questions = events.filter((e) => e.type === "question");
    return {
      users: users.length,
      logins: events.filter((e) => e.type === "login").length,
      questions: questions.length,
      tokens: users.reduce((sum, u) => sum + u.tokensUsed, 0),
    };
  }, [events, users]);

  if (!snapshot.isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admins only</CardTitle>
          <CardDescription>
            Your account is not on the admin list. Add your email to the ADMIN_EMAILS setting to
            open the activity log.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const byType = (t: ActivityEvent["type"][]) => events.filter((e) => t.includes(e.type));

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: "Everything" },
    { id: "signups", label: "Sign-ups" },
    { id: "logins", label: "Log-ins" },
    { id: "questions", label: "Questions" },
    { id: "users", label: "Users & tokens" },
  ];

  function renderBody() {
    if (tab === "signups") {
      return (
        <Table
          empty="No sign-ups yet."
          head={
            <>
              <Th>Time</Th>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
            </>
          }
        >
          {byType(["signup"]).map((e) => (
            <tr key={e.id}>
              <Td className="whitespace-nowrap">{when(e.at)}</Td>
              <Td className="font-medium">{e.name}</Td>
              <Td>{e.email}</Td>
              <Td>{e.phone || "—"}</Td>
            </tr>
          ))}
        </Table>
      );
    }
    if (tab === "logins") {
      return (
        <Table
          empty="No log-ins yet."
          head={
            <>
              <Th>Time</Th>
              <Th>Result</Th>
              <Th>Name</Th>
              <Th>Email</Th>
            </>
          }
        >
          {byType(["login", "login_failed", "logout"]).map((e) => (
            <tr key={e.id}>
              <Td className="whitespace-nowrap">{when(e.at)}</Td>
              <Td>
                <TypePill type={e.type} />
              </Td>
              <Td className="font-medium">{e.name}</Td>
              <Td>{e.email}</Td>
            </tr>
          ))}
        </Table>
      );
    }
    if (tab === "questions") {
      return (
        <Table
          empty="No questions asked yet."
          head={
            <>
              <Th>Time</Th>
              <Th>User</Th>
              <Th>Question</Th>
              <Th right>Tokens in</Th>
              <Th right>Tokens out</Th>
              <Th right>This question</Th>
              <Th right>User total</Th>
              <Th right>Credits left</Th>
            </>
          }
        >
          {byType(["question"]).map((e) => (
            <tr key={e.id}>
              <Td className="whitespace-nowrap">{when(e.at)}</Td>
              <Td>
                <div className="font-medium">{e.name}</div>
                <div className="text-xs text-muted-foreground">{e.email}</div>
              </Td>
              <Td className="max-w-[22rem] min-w-[12rem] whitespace-pre-wrap break-words">
                {e.question}
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {e.path === "escalated" ? "escalated" : "cheap path"} · {e.model}
                </div>
              </Td>
              <Td right>{e.tokensIn}</Td>
              <Td right>{e.tokensOut}</Td>
              <Td right className="font-semibold">{e.tokensTotal}</Td>
              <Td right>{formatCredits(e.userTokensTotal ?? 0)}</Td>
              <Td right>{formatCredits(e.creditsLeft ?? 0)}</Td>
            </tr>
          ))}
        </Table>
      );
    }
    if (tab === "users") {
      return (
        <Table
          empty="No users yet."
          head={
            <>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Joined</Th>
              <Th right>Questions</Th>
              <Th right>Tokens used</Th>
              <Th right>Credits left</Th>
            </>
          }
        >
          {[...users]
            .sort((a, b) => b.tokensUsed - a.tokensUsed)
            .map((u) => (
              <tr key={u.id}>
                <Td className="font-medium">{u.name}</Td>
                <Td>{u.email}</Td>
                <Td>{u.phone || "—"}</Td>
                <Td className="whitespace-nowrap">{when(u.createdAt)}</Td>
                <Td right>{u.questions}</Td>
                <Td right className="font-semibold">{formatCredits(u.tokensUsed)}</Td>
                <Td right>{formatCredits(u.creditsLeft)}</Td>
              </tr>
            ))}
        </Table>
      );
    }
    return (
      <Table
        empty="Nothing has happened yet."
        head={
          <>
            <Th>Time</Th>
            <Th>Event</Th>
            <Th>User</Th>
            <Th>Details</Th>
          </>
        }
      >
        {events.map((e) => (
          <tr key={e.id}>
            <Td className="whitespace-nowrap">{when(e.at)}</Td>
            <Td>
              <TypePill type={e.type} />
            </Td>
            <Td>
              <div className="font-medium">{e.name}</div>
              <div className="text-xs text-muted-foreground">{e.email}</div>
            </Td>
            <Td className="max-w-[26rem] whitespace-pre-wrap break-words">
              {e.type === "question" ? (
                <>
                  {e.question}
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {e.tokensTotal} tokens ({e.tokensIn} in / {e.tokensOut} out) · user total{" "}
                    {formatCredits(e.userTokensTotal ?? 0)}
                  </div>
                </>
              ) : e.type === "signup" && e.phone ? (
                <span className="text-muted-foreground">Phone: {e.phone}</span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </Td>
          </tr>
        ))}
      </Table>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Activity log</h1>
          <p className="text-sm text-muted-foreground">
            Sign-ups, log-ins and every question asked, with the user who asked it. Refreshes every{" "}
            {POLL_MS / 1000}s.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setLive((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-foreground/10 px-3 py-1.5 text-xs"
        >
          <span
            className={cn(
              "size-2 rounded-full",
              live ? "animate-pulse bg-emerald-500" : "bg-zinc-400",
            )}
          />
          {live ? `Live · updated ${updatedAt ?? "…"}` : "Paused — click to resume"}
        </button>
      </div>

      {error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Users", value: stats.users },
          { label: "Log-ins", value: stats.logins },
          { label: "Questions", value: stats.questions },
          { label: "Tokens used", value: stats.tokens },
        ].map((s) => (
          <Card key={s.label} size="sm">
            <CardHeader>
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="font-mono text-2xl tabular-nums">
                {formatCredits(s.value)}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition",
                  tab === t.id
                    ? "bg-emerald-700 text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {t.label}
                {t.id !== "users" && t.id !== "all" ? (
                  <Badge variant="secondary" className="ml-1.5">
                    {t.id === "signups"
                      ? byType(["signup"]).length
                      : t.id === "logins"
                        ? byType(["login"]).length
                        : byType(["question"]).length}
                  </Badge>
                ) : null}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>{data ? renderBody() : <p className="text-sm text-muted-foreground">Loading…</p>}</CardContent>
      </Card>
    </div>
  );
}
