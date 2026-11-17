import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { forbidden, requireUser } from "@/lib/api-guard";
import { withStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireUser();
  if (gate.response) return gate.response;
  if (!isAdminUser(gate.user)) return forbidden("Admins only.");

  const data = await withStore((store) => {
    const users = Object.values(store.users).map((u) => ({
      id: u.id,
      name: u.displayName,
      email: u.email ?? "—",
      phone: u.phone ?? "",
      createdAt: u.createdAt,
      questions: u.chatsTotal,
      tokensUsed: u.tokensUsed ?? 0,
      creditsLeft: u.credits,
    }));
    // Newest first. Passwords/hashes are never included here.
    return { events: [...store.activity].reverse(), users };
  });

  return NextResponse.json({ ...data, serverTime: new Date().toISOString() });
}
