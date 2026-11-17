import { NextResponse } from "next/server";
import { getSessionUser } from "./session";
import type { User } from "./types";

/**
 * Every protected API needs a real, logged-in user. The old "guest-user"
 * fallback is gone: it made questions show up under a fake user and it hid
 * the real wallet, so counts never matched.
 */
export async function requireUser(): Promise<
  { user: User; response?: never } | { user?: never; response: NextResponse }
> {
  const user = await getSessionUser();
  if (!user) {
    return {
      response: NextResponse.json(
        { error: "Please log in to continue." },
        { status: 401 }
      ),
    };
  }
  return { user };
}

export function insufficient(message = "Usage limit reached for this demo wallet") {
  return NextResponse.json({ error: message }, { status: 402 });
}

export function forbidden(message: string) {
  return NextResponse.json({ error: message }, { status: 403 });
}
