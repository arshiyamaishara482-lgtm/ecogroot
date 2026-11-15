import { cookies } from "next/headers";
import { PLAN_CREDITS, SESSION_COOKIE } from "./constants";
import { ensureOpenLimited } from "./plans";
import { newId, withStore } from "./store";
import type { MemoryNote, PublicSnapshot, User } from "./types";

export async function getSessionId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

export async function getSessionUser(): Promise<User | null> {
  const sessionId = await getSessionId();
  if (!sessionId) return null;
  return withStore((store) => {
    const userId = store.sessions[sessionId];
    if (!userId) return null;
    const user = store.users[userId];
    if (!user) return null;
    const lifted = ensureOpenLimited(user);
    if (lifted.plan !== user.plan || lifted.credits !== user.credits) {
      store.users[user.id] = lifted;
    }
    return lifted;
  }, true);
}

export async function createDemoSession(opts?: {
  inviteCode?: string;
  accessTier?: "early" | "founding";
  displayName?: string;
}): Promise<{
  sessionId: string;
  user: User;
}> {
  return withStore((store) => {
    const user: User = {
      id: newId("user"),
      displayName: opts?.displayName ?? "Early gardener",
      plan: "free",
      credits: PLAN_CREDITS.free,
      chatsTotal: 0,
      cheapPathCount: 0,
      createdAt: new Date().toISOString(),
      inviteCode: opts?.inviteCode,
      accessTier: opts?.accessTier ?? "early",
    };
    const sessionId = newId("sess");
    store.users[user.id] = user;
    store.sessions[sessionId] = user.id;
    store.chats[user.id] = [];
    store.videos[user.id] = [];
    const welcome: MemoryNote = {
      id: newId("mem"),
      title: "Open Limited free",
      body: "Welcome to the open Limited product. Cascade-Verify always runs a small free-tier model first, then a judge scores that answer — never the question alone — and escalates only on FAIL. That keeps easy chats on cheaper free quota. Quantization cuts GPU VRAM, not this creative memory.",
      pinned: true,
      source: "manual",
      createdAt: new Date().toISOString(),
    };
    store.memories[user.id] = [welcome];
    return { sessionId, user };
  }, true);
}

export function cascadeSaveRate(user: User): number | null {
  if (user.chatsTotal === 0) return null;
  return user.cheapPathCount / user.chatsTotal;
}

export async function getSnapshot(user: User): Promise<PublicSnapshot> {
  return withStore((store) => {
    const fresh = store.users[user.id] ?? user;
    return {
      user: fresh,
      cascadeSaveRate: cascadeSaveRate(fresh),
      memories: store.memories[user.id] ?? [],
      chats: store.chats[user.id] ?? [],
      videos: store.videos[user.id] ?? [],
    };
  });
}
