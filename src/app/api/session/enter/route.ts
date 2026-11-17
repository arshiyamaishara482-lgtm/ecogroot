import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Old one-click guest entry. Now just sends people to the login / sign-up page. */
export async function POST(req: Request) {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const target = host ? `${proto}://${host}/login?mode=signup` : "/login?mode=signup";
  return NextResponse.redirect(target, 303);
}
