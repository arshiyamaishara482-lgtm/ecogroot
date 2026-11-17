import { NextResponse } from "next/server";
import { hashPassword, normalizeEmail, validateSignup } from "@/lib/auth";
import { AccountError, createAccountSession, getSnapshot } from "@/lib/session";
import { setSessionCookie } from "@/lib/session-cookie";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const input = {
    name: String(body.name ?? "").trim(),
    email: normalizeEmail(String(body.email ?? "")),
    phone: String(body.phone ?? "").trim(), // optional
    password: String(body.password ?? ""),
  };

  const problem = validateSignup(input);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  try {
    const { hash, salt } = hashPassword(input.password);
    const { sessionId, user } = await createAccountSession({
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash: hash,
      passwordSalt: salt,
    });
    const res = NextResponse.json(await getSnapshot(user));
    setSessionCookie(res, sessionId);
    return res;
  } catch (err) {
    if (err instanceof AccountError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Could not create the account." }, { status: 500 });
  }
}
