import { NextResponse } from "next/server";
import { normalizeEmail, verifyPassword } from "@/lib/auth";
import { getSnapshot, loginWithPassword } from "@/lib/session";
import { setSessionCookie } from "@/lib/session-cookie";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = normalizeEmail(String(body.email ?? ""));
  const password = String(body.password ?? "");
  if (!email || !password) {
    return NextResponse.json(
      { error: "Please enter your email and password." },
      { status: 400 }
    );
  }

  const result = await loginWithPassword(email, password, verifyPassword);
  if (!result) {
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 }
    );
  }
  const res = NextResponse.json(await getSnapshot(result.user));
  setSessionCookie(res, result.sessionId);
  return res;
}
