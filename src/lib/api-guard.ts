import { NextResponse } from "next/server";
import { getSessionUser } from "./session";
import type { User } from "./types";

export async function requireUser(): Promise<
  { user: User; response?: never } | { user?: never; response: NextResponse }
> {
  const existingUser = await getSessionUser();
  
  // Fallback guest user for Netlify's ephemeral serverless environment
  const user = existingUser || ({
    id: "guest-user",
    name: "Guest",
    email: "guest@ecogroot.local",
    plan: "free",
    credits: 100,
    chatsTotal: 0,
    cheapPathCount: 0,
    createdAt: new Date().toISOString(),
  } as unknown as User);

  return { user };
}

export function insufficient(message = "Usage limit reached for this demo wallet") {
  return NextResponse.json({ error: message }, { status: 402 });
}

export function forbidden(message: string) {
  return NextResponse.json({ error: message }, { status: 403 });
}