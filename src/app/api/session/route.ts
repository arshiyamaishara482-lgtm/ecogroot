import { NextResponse } from "next/server";
import { endSession, getSessionId, getSessionUser, getSnapshot } from "@/lib/session";
import { clearSessionCookie } from "@/lib/session-cookie";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json(await getSnapshot(user));
}

/** Anonymous "enter" was removed - people must sign up or log in now. */
export async function POST() {
  return NextResponse.json(
    { error: "Please sign up or log in at /login." },
    { status: 401 }
  );
}

export async function DELETE() {
  const sessionId = await getSessionId();
  if (sessionId) await endSession(sessionId);
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
