import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-guard";
import {
  applyPlanGrant,
  isPaidPlan,
  paidPlansAvailable,
  paidPlansBlockedMessage,
} from "@/lib/plans";
import { getSnapshot } from "@/lib/session";
import { withStore } from "@/lib/store";
import type { PlanId } from "@/lib/types";

export const dynamic = "force-dynamic";

const PLANS: PlanId[] = ["free", "pro", "master"];

export async function POST(req: Request) {
  const gate = await requireUser();
  if (gate.response) return gate.response;

  let body: { plan?: string };
  try {
    body = (await req.json()) as { plan?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const plan = body.plan as PlanId | undefined;
  if (!plan || !PLANS.includes(plan)) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  if (isPaidPlan(plan) && !paidPlansAvailable()) {
    return NextResponse.json(
      { error: paidPlansBlockedMessage() },
      { status: 403 },
    );
  }

  try {
    const user = await withStore((store) => {
      const current = store.users[gate.user.id];
      if (!current) throw new Error("User missing");
      const next = applyPlanGrant(current, plan);
      store.users[current.id] = next;
      return next;
    }, true);

    const snapshot = await getSnapshot(user);
    return NextResponse.json({
      ...snapshot,
      notice:
        plan === "free"
          ? "You're on Open Limited (Free)."
          : `Local upgrade: wallet is now ${plan}. No Stripe charge.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Plan change failed";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
