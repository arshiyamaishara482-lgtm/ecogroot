"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Clapperboard,
  ScrollText,
  LayoutDashboard,
  MessageSquare,
  NotebookPen,
  Pin,
  Plus,
  Sparkles,
} from "lucide-react";
import { LeafMark } from "@/components/leaf-mark";
import { PlanBadge } from "@/components/plan-badge";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/wallet-context";
import {
  buildConversations,
  FIRST_CHAT_ID,
  newConversationId,
} from "@/lib/conversations";
import { formatCredits } from "@/lib/format";
import { cn } from "@/lib/utils";

const ADMIN_NAV = { href: "/app/logs", label: "Activity log", icon: ScrollText };

const NAV = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/chat", label: "Chat", icon: MessageSquare },
  { href: "/app/plans", label: "Plans", icon: Sparkles },
  { href: "/app/video", label: "Video", icon: Clapperboard },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { snapshot } = useWallet();
  const { user, memories, isAdmin } = snapshot;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const conversations = useMemo(
    () => buildConversations(snapshot.chats),
    [snapshot.chats],
  );
  // The chat that is open right now (only while you are on the chat page).
  const activeChatId = pathname.startsWith("/app/chat")
    ? (searchParams.get("c") ?? conversations[0]?.id ?? FIRST_CHAT_ID)
    : null;

  function startNewChat() {
    setMobileOpen(false);
    router.push(`/app/chat?c=${newConversationId()}`);
  }

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/session", { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-col gap-1">
      {(isAdmin ? [...NAV, ADMIN_NAV] : NAV).map((item) => {
        const active =
          item.href === "/app"
            ? pathname === "/app"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm",
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const chatList = (
    <div className="mt-4 flex min-h-0 flex-1 flex-col">
      <div className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Chats
      </div>
      {conversations.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No chats yet. Click New chat to start one.
        </p>
      ) : (
        <ul className="max-h-72 space-y-0.5 overflow-y-auto pr-1 md:max-h-none">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/app/chat?c=${encodeURIComponent(c.id)}`}
                onClick={() => setMobileOpen(false)}
                title={c.title}
                className={cn(
                  "block truncate rounded-md px-2.5 py-1.5 text-sm",
                  c.id === activeChatId
                    ? "bg-muted font-medium text-foreground"
                    : "text-foreground/80 hover:bg-muted/60",
                )}
              >
                {c.title || "Chat"}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const memoryList = (
    <div className="mt-3 max-h-40 shrink-0 overflow-y-auto">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        <NotebookPen className="size-3.5" />
        Creative memory
      </div>
      {memories.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Empty. Pin a chat answer or add a note. This list is product memory — not GPU VRAM.
        </p>
      ) : (
        <ul className="space-y-2 overflow-y-auto pr-1">
          {[...memories]
            .sort((a, b) => Number(b.pinned) - Number(a.pinned))
            .slice(0, 10)
            .map((note) => (
              <li
                key={note.id}
                className="rounded-md bg-background/70 px-2 py-1.5 ring-1 ring-foreground/8"
              >
                <div className="flex items-start gap-1">
                  {note.pinned ? (
                    <Pin className="mt-0.5 size-3 shrink-0 text-primary" />
                  ) : null}
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium">{note.title}</div>
                    <p className="line-clamp-2 text-[11px] text-muted-foreground">
                      {note.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );

  const sideInner = (
    <>
      <Link href="/app" className="mb-4 flex items-center gap-2">
        <LeafMark className="size-7" />
        <div>
          <div className="text-sm font-semibold leading-none">Eco Groot</div>
          <div className="text-[11px] text-muted-foreground">Cascade-Verify demo</div>
        </div>
      </Link>
      <div className="mb-4 rounded-lg bg-background px-3 py-2 ring-1 ring-foreground/10">
        <div className="flex items-center justify-between gap-2">
          <PlanBadge plan={user.plan} />
          {user.plan === "master" ? (
            <span className="text-[10px] tracking-wide text-emerald-800 uppercase">
              Team
            </span>
          ) : null}
        </div>
        <div className="mt-1 font-mono text-lg tabular-nums">
          {formatCredits(user.credits)}{" "}
          <span className="text-xs text-muted-foreground">usage left</span>
        </div>
      </div>
      <Button
        className="mb-3 w-full justify-start gap-2"
        onClick={startNewChat}
      >
        <Plus className="size-4" />
        New chat
      </Button>
      {nav}
      {chatList}
      {memoryList}
      <div className="mt-auto pt-4">
        <p className="mb-2 text-[11px] text-muted-foreground">{user.displayName}</p>
        <Button variant="outline" size="sm" onClick={logout} disabled={loggingOut}>
          {loggingOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-sidebar p-4 md:flex">
        {sideInner}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-2 border-b px-3 py-2 md:hidden">
          <Link href="/app" className="flex items-center gap-2">
            <LeafMark className="size-6" />
            <span className="text-sm font-semibold">Eco Groot</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs tabular-nums">
              {formatCredits(user.credits)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileOpen((v) => !v)}
            >
              Menu
            </Button>
          </div>
        </header>
        {mobileOpen ? (
          <div className="flex flex-col border-b bg-sidebar p-4 md:hidden">
            {sideInner}
          </div>
        ) : null}
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
