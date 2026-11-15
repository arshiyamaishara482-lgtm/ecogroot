import { NextResponse } from "next/server";
import { getSessionUser } from "./session";
import type { User } from "./types";

export async function requireUser(): Promise<
  { user: User; response?: never } | { user?: never; response: NextResponse }
> {
  const user = await getSessionUser();
  if (!user) {
    return {
      response: NextResponse.json({ error: "Not signed in" }, { status: 401 }),
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
