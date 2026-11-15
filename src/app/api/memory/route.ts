import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-guard";
import { getSnapshot } from "@/lib/session";
import { newId, withStore } from "@/lib/store";
import type { MemoryNote } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireUser();
  if (gate.response) return gate.response;
  const snapshot = await getSnapshot(gate.user);
  return NextResponse.json({ memories: snapshot.memories });
}

export async function POST(req: Request) {
  const gate = await requireUser();
  if (gate.response) return gate.response;

  let body: { title?: string; body?: string; pinned?: boolean; source?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = (body.body ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "Note body is required" }, { status: 400 });
  }

  const note: MemoryNote = {
    id: newId("mem"),
    title: (body.title ?? "").trim() || text.slice(0, 48),
    body: text.slice(0, 4000),
    pinned: Boolean(body.pinned),
    source: body.source === "answer" ? "answer" : "manual",
    createdAt: new Date().toISOString(),
  };

  await withStore((store) => {
    const list = store.memories[gate.user.id] ?? [];
    store.memories[gate.user.id] = [note, ...list].slice(0, 80);
  }, true);

  const snapshot = await getSnapshot(gate.user);
  return NextResponse.json({ note, memories: snapshot.memories });
}

export async function PATCH(req: Request) {
  const gate = await requireUser();
  if (gate.response) return gate.response;

  let body: { id?: string; pinned?: boolean };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await withStore((store) => {
    const list = store.memories[gate.user.id] ?? [];
    store.memories[gate.user.id] = list.map((n) =>
      n.id === body.id ? { ...n, pinned: Boolean(body.pinned) } : n
    );
  }, true);

  const snapshot = await getSnapshot(gate.user);
  return NextResponse.json({ memories: snapshot.memories });
}

export async function DELETE(req: Request) {
  const gate = await requireUser();
  if (gate.response) return gate.response;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await withStore((store) => {
    const list = store.memories[gate.user.id] ?? [];
    store.memories[gate.user.id] = list.filter((n) => n.id !== id);
  }, true);

  const snapshot = await getSnapshot(gate.user);
  return NextResponse.json({ memories: snapshot.memories });
}
