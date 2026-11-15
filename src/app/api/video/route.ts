import { NextResponse } from "next/server";
import { CREDIT_COST } from "@/lib/constants";
import { forbidden, insufficient, requireUser } from "@/lib/api-guard";
import {
  canUseEcoVideo,
  canUsePremiumVideo,
  debitOrThrow,
  paidPlansAvailable,
  paidPlansBlockedMessage,
} from "@/lib/plans";
import { getSnapshot } from "@/lib/session";
import { newId, withStore } from "@/lib/store";
import type { VideoJob, VideoTier } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireUser();
  if (gate.response) return gate.response;
  const snapshot = await getSnapshot(gate.user);
  return NextResponse.json({ videos: snapshot.videos, user: snapshot.user });
}

export async function POST(req: Request) {
  const gate = await requireUser();
  if (gate.response) return gate.response;

  if (!paidPlansAvailable()) {
    return forbidden(paidPlansBlockedMessage());
  }

  let body: { prompt?: string; tier?: VideoTier };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const prompt = (body.prompt ?? "").trim();
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }
  const tier: VideoTier = body.tier === "premium" ? "premium" : "eco";

  if (tier === "eco" && !canUseEcoVideo(gate.user.plan)) {
    return forbidden("Eco video is a Pro/Master feature — still work in progress.");
  }
  if (tier === "premium" && !canUsePremiumVideo(gate.user.plan)) {
    return forbidden("Premium video is Master-only — still work in progress.");
  }

  const cost = CREDIT_COST.video[tier];
  if (gate.user.credits < cost) {
    return insufficient();
  }

  const job: VideoJob = {
    id: newId("vid"),
    prompt: prompt.slice(0, 500),
    tier,
    status: "ready",
    renderer: "placeholder-stub",
    resolution: tier === "premium" ? "1920×1080" : "1280×720",
    durationSec: tier === "premium" ? 8 : 4,
    creditsDebited: cost,
    createdAt: new Date().toISOString(),
  };

  const user = await withStore((store) => {
    const current = store.users[gate.user.id];
    if (!current) throw new Error("User missing");
    const next = debitOrThrow(current, cost);
    store.users[current.id] = next;
    const list = store.videos[current.id] ?? [];
    store.videos[current.id] = [job, ...list].slice(0, 40);
    return next;
  }, true);

  const snapshot = await getSnapshot(user);
  return NextResponse.json({ job, videos: snapshot.videos, user: snapshot.user });
}
