import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StoreFile } from "./types";

/**
 * Storage backends
 * ----------------
 * 1. Local file  (.data/store.json)  - default, perfect for `npm run dev`.
 * 2. /tmp file on production         - works, but Netlify/Vercel functions are
 *    ephemeral, so accounts and logs can vanish between requests.
 * 3. Upstash Redis (REST)            - set UPSTASH_REDIS_REST_URL and
 *    UPSTASH_REDIS_REST_TOKEN to keep everything permanently on a host.
 */
const DATA_DIR =
  process.env.NODE_ENV === "production"
    ? "/tmp/.data"
    : path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

const REMOTE_URL = process.env.UPSTASH_REDIS_REST_URL;
const REMOTE_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const REMOTE_KEY = "eco-groot-store";
const USE_REMOTE = Boolean(REMOTE_URL && REMOTE_TOKEN);

function emptyStore(): StoreFile {
  return {
    users: {},
    accounts: {},
    sessions: {},
    memories: {},
    chats: {},
    videos: {},
    waitlist: [],
    invites: {},
    apiKeys: {},
    activity: [],
  };
}

/**
 * One shared queue for the whole server process. Stored on globalThis because
 * Next.js can load this file once per route, which would otherwise give every
 * route its own queue and let two requests overwrite each other.
 */
const g = globalThis as unknown as { __ecoStoreQueue?: Promise<unknown> };
g.__ecoStoreQueue ??= Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = (g.__ecoStoreQueue as Promise<unknown>).then(fn, fn);
  g.__ecoStoreQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function readRaw(): Promise<string | null> {
  if (USE_REMOTE) {
    const res = await fetch(`${REMOTE_URL}/get/${REMOTE_KEY}`, {
      headers: { Authorization: `Bearer ${REMOTE_TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Remote store read failed (${res.status})`);
    const json = (await res.json()) as { result: string | null };
    return json.result ?? null;
  }
  try {
    return await readFile(STORE_PATH, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

async function writeRaw(text: string): Promise<void> {
  if (USE_REMOTE) {
    const res = await fetch(`${REMOTE_URL}/set/${REMOTE_KEY}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${REMOTE_TOKEN}` },
      body: text,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Remote store write failed (${res.status})`);
    return;
  }
  await mkdir(DATA_DIR, { recursive: true });
  // Write to a temp file then rename, so a reader never sees half a file.
  const tmp = `${STORE_PATH}.${process.pid}.tmp`;
  await writeFile(tmp, text, "utf8");
  await rename(tmp, STORE_PATH);
}

async function readStore(): Promise<StoreFile> {
  const raw = await readRaw();
  if (!raw) return emptyStore();
  // If the JSON is corrupt we throw instead of returning an empty store,
  // otherwise the next save would silently wipe every user.
  const parsed = JSON.parse(raw) as Partial<StoreFile>;
  return {
    users: parsed.users ?? {},
    accounts: parsed.accounts ?? {},
    sessions: parsed.sessions ?? {},
    memories: parsed.memories ?? {},
    chats: parsed.chats ?? {},
    videos: parsed.videos ?? {},
    waitlist: parsed.waitlist ?? [],
    invites: parsed.invites ?? {},
    apiKeys: parsed.apiKeys ?? {},
    activity: parsed.activity ?? [],
  };
}

async function writeStore(store: StoreFile): Promise<void> {
  await writeRaw(JSON.stringify(store, null, USE_REMOTE ? 0 : 2));
}

export async function withStore<T>(
  fn: (store: StoreFile) => T | Promise<T>,
  mutate = false
): Promise<T> {
  return enqueue(async () => {
    const store = await readStore();
    const result = await fn(store);
    if (mutate) {
      await writeStore(store);
    }
    return result;
  });
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
