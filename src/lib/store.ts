import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StoreFile } from "./types";

// Use /tmp on serverless environments (Vercel/Netlify) to avoid read-only file system errors
const isServerless = process.env.VERCEL || process.env.NETLIFY;
const DATA_DIR = isServerless ? "/tmp" : path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

function emptyStore(): StoreFile {
  return {
    users: {},
    sessions: {},
    memories: {},
    chats: {},
    videos: {},
    waitlist: [],
    invites: {},
    apiKeys: {},
  };
}

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function readStore(): Promise<StoreFile> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    return {
      users: parsed.users ?? {},
      sessions: parsed.sessions ?? {},
      memories: parsed.memories ?? {},
      chats: parsed.chats ?? {},
      videos: parsed.videos ?? {},
      waitlist: parsed.waitlist ?? [],
      invites: parsed.invites ?? {},
      apiKeys: parsed.apiKeys ?? {},
    };
  } catch {
    return emptyStore();
  }
}

async function writeStore(store: StoreFile): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
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