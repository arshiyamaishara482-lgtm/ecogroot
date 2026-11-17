import { cookies } from "next/headers";
import { PAID_PLANS_OPEN, PLAN_CREDITS, SESSION_COOKIE } from "./constants";
import { isAdminUser } from "./admin";
import { isPaidPlan } from "./plans";
import { pushActivity } from "./activity";
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
    // IMPORTANT: this used to call ensureOpenLimited(), which pushed credits
    // back up to the 500,000 floor on EVERY request and undid each debit.
    // Credits are now only set when an account is created.
    // Paid plans are still blocked while they are work-in-progress:
    return !PAID_PLANS_OPEN && isPaidPlan(user.plan)
      ? { ...user, plan: "free" }
      : user;
  });
}

export class AccountError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

function newWelcomeMemory(): MemoryNote {
  return {
    id: newId("mem"),
    title: "Open Limited free",
    body: "Welcome to the open Limited product. Cascade-Verify always runs a small free-tier model first, then a judge scores that answer — never the question alone — and escalates only on FAIL. That keeps easy chats on cheaper free quota. Quantization cuts GPU VRAM, not this creative memory.",
    pinned: true,
    source: "manual",
    createdAt: new Date().toISOString(),
  };
}

/** Create a brand-new account + session and write a "signup" log entry. */
export async function createAccountSession(input: {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  passwordSalt: string;
}): Promise<{ sessionId: string; user: User }> {
  return withStore((store) => {
    const taken = Object.values(store.accounts).some(
      (a) => a.email === input.email
    );
    if (taken) {
      throw new AccountError(
        "That email is already registered. Please log in instead.",
        409
      );
    }
    const user: User = {
      id: newId("user"),
      displayName: input.name,
      email: input.email,
      phone: input.phone || undefined,
      plan: "free",
      credits: PLAN_CREDITS.free,
      chatsTotal: 0,
      cheapPathCount: 0,
      tokensUsed: 0,
      createdAt: new Date().toISOString(),
      accessTier: "early",
    };
    const sessionId = newId("sess");
    store.users[user.id] = user;
    store.accounts[user.id] = {
      userId: user.id,
      email: input.email,
      passwordHash: input.passwordHash,
      passwordSalt: input.passwordSalt,
    };
    store.sessions[sessionId] = user.id;
    store.chats[user.id] = [];
    store.videos[user.id] = [];
    store.memories[user.id] = [newWelcomeMemory()];
    pushActivity(store, {
      type: "signup",
      userId: user.id,
      name: user.displayName,
      email: user.email!,
      phone: user.phone,
    });
    return { sessionId, user };
  }, true);
}

/**
 * Check an email + password. On success a new session is created and a
 * "login" entry is logged; on failure a "login_failed" entry is logged
 * (email only - the password is never stored or logged).
 */
export async function loginWithPassword(
  email: string,
  password: string,
  verify: (password: string, hash: string, salt: string) => boolean
): Promise<{ sessionId: string; user: User } | null> {
  return withStore((store) => {
    const account = Object.values(store.accounts).find((a) => a.email === email);
    const user = account ? store.users[account.userId] : undefined;
    const ok =
      account && user && verify(password, account.passwordHash, account.passwordSalt);
    if (!account || !user || !ok) {
      pushActivity(store, {
        type: "login_failed",
        userId: user?.id ?? null,
        name: user?.displayName ?? "—",
        email,
      });
      return null;
    }
    const sessionId = newId("sess");
    store.sessions[sessionId] = user.id;
    pushActivity(store, {
      type: "login",
      userId: user.id,
      name: user.displayName,
      email: user.email ?? email,
      phone: user.phone,
    });
    return { sessionId, user };
  }, true);
}

/** Remove the session from the store (real logout) and log it. */
export async function endSession(sessionId: string): Promise<void> {
  await withStore((store) => {
    const userId = store.sessions[sessionId];
    if (!userId) return;
    const user = store.users[userId];
    delete store.sessions[sessionId];
    if (user) {
      pushActivity(store, {
        type: "logout",
        userId: user.id,
        name: user.displayName,
        email: user.email ?? "—",
        phone: user.phone,
      });
    }
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
      isAdmin: isAdminUser(fresh),
      cascadeSaveRate: cascadeSaveRate(fresh),
      memories: store.memories[user.id] ?? [],
      chats: store.chats[user.id] ?? [],
      videos: store.videos[user.id] ?? [],
    };
  });
}
