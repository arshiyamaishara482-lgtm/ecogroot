import { NextResponse } from "next/server";
import { getWaitlistStats, joinWaitlist } from "@/lib/waitlist";
import { notifyWaitlistWhatsApp } from "@/lib/whatsapp-notify";
import type { WaitlistInterest } from "@/lib/types";

export const dynamic = "force-dynamic";

const INTERESTS: WaitlistInterest[] = [
  "creator",
  "developer",
  "researcher",
  "team",
  "curious",
];

export async function GET() {
  const stats = await getWaitlistStats();
  return NextResponse.json(stats);
}

export async function POST(req: Request) {
  let body: {
    email?: string;
    name?: string;
    interest?: string;
    note?: string;
    earlyAccess?: boolean;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const interest = body.interest as WaitlistInterest | undefined;
  if (!interest || !INTERESTS.includes(interest)) {
    return NextResponse.json({ error: "Pick an interest." }, { status: 400 });
  }

  try {
    const result = await joinWaitlist({
      email: body.email ?? "",
      name: body.name ?? "",
      interest,
      note: body.note,
    });

    const whatsapp = await notifyWaitlistWhatsApp({
      name: result.entry.name,
      email: result.entry.email,
      interest: result.entry.interest,
      note: result.entry.note,
      position: result.entry.position,
    });

    return NextResponse.json({
      ok: true,
      created: result.created,
      entry: {
        position: result.entry.position,
        status: result.entry.status,
        inviteCode: result.entry.inviteCode,
        email: result.entry.email,
        name: result.entry.name,
      },
      stats: result.stats,
      whatsapp,
      message: body.earlyAccess
        ? "You're on the Eco AI waiting list for early access. We notified the team on WhatsApp with your details."
        : "You're on the Eco AI updates list. The Limited product is already open — enter free anytime. We also pinged the team on WhatsApp with your details.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not join waitlist";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
