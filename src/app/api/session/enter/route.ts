import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";
import { createDemoSession, getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

function appRedirect(req: Request) {
  // Prefer the browser Host header so cookie host matches redirect host
  // (avoids 127.0.0.1 vs localhost cookie loss).
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (host) {
    const proto = req.headers.get("x-forwarded-proto") ?? "http";
    return NextResponse.redirect(`${proto}://${host}/app`, 303);
  }
  // Relative Location also preserves the request host in browsers.
  return new NextResponse(null, {
    status: 303,
    headers: { Location: "/app" },
  });
}

/**
 * Progressive-enhancement enter endpoint.
 * Native <form method="POST"> works with zero client JS:
 * sets the session cookie and 303-redirects to /app.
 */
export async function POST(req: Request) {
  const existing = await getSessionUser();
  if (existing) return appRedirect(req);

  let displayName = "Free gardener";
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const body = (await req.json()) as { displayName?: string };
      if (body.displayName?.trim()) displayName = body.displayName.trim();
    } catch {
      /* keep default */
    }
  } else {
    try {
      const form = await req.formData();
      const raw = form.get("displayName");
      if (typeof raw === "string" && raw.trim()) displayName = raw.trim();
    } catch {
      /* keep default */
    }
  }

  const { sessionId } = await createDemoSession({
    displayName,
    accessTier: "early",
  });

  const res = appRedirect(req);
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
