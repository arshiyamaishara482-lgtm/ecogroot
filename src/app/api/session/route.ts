import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";
import { createDemoSession, getSnapshot, getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  const snapshot = await getSnapshot(user);
  return NextResponse.json(snapshot);
}

/** Open Limited product — no invite required. */
export async function POST(req: Request) {
  const existing = await getSessionUser();
  if (existing) {
    const snapshot = await getSnapshot(existing);
    return NextResponse.json(snapshot);
  }

  let body: { displayName?: string } = {};
  try {
    body = (await req.json()) as { displayName?: string };
  } catch {
    body = {};
  }

  const { sessionId, user } = await createDemoSession({
    displayName: body.displayName?.trim() || "Free gardener",
    accessTier: "early",
  });
  const snapshot = await getSnapshot(user);
  const res = NextResponse.json({
    ...snapshot,
    notice:
      "Open Limited access unlocked. Cascade-Verify uses free-tier models first so easy chats stay cheap.",
  });
  res.cookies.set({
    name: SESSION_COOKIE,
    value: sessionId,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
