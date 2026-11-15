"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWallet } from "@/components/wallet-context";
import { CREDIT_COST } from "@/lib/constants";
import { canUseEcoVideo, canUsePremiumVideo } from "@/lib/plans";
import { formatCredits, formatWhen } from "@/lib/format";
import type { PublicSnapshot, VideoJob, VideoTier } from "@/lib/types";

export default function VideoPage() {
  const { snapshot, setSnapshot } = useWallet();
  const { user, videos } = snapshot;
  const ecoOk = canUseEcoVideo(user.plan);
  const premiumOk = canUsePremiumVideo(user.plan);
  const [prompt, setPrompt] = useState("Mossy greenhouse time-lapse, morning light");
  const [tier, setTier] = useState<VideoTier>(premiumOk ? "premium" : "eco");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, tier }),
      });
      const json = (await res.json()) as PublicSnapshot & {
        error?: string;
        job?: VideoJob;
        videos?: VideoJob[];
      };
      if (!res.ok) throw new Error(json.error ?? "Generate failed");
      setSnapshot({
        ...snapshot,
        user: json.user,
        videos: json.videos ?? snapshot.videos,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generate failed");
    } finally {
      setBusy(false);
    }
  }

  if (!ecoOk) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Video</h1>
        <Alert>
          <AlertTitle>Pro and Master only</AlertTitle>
          <AlertDescription>
            Eco video stubs debit credits and return placeholder clip metadata — not a real
            renderer. Free wallets stay on chat.
          </AlertDescription>
        </Alert>
        <Button render={<Link href="/app/plans" />}>Upgrade on Plans</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Video stubs</h1>
        <p className="text-sm text-muted-foreground">
          Placeholder generation. No GPU farm. Eco costs {CREDIT_COST.video.eco} credits ·
          Premium (Master) {CREDIT_COST.video.premium}. You have {formatCredits(user.credits)}{" "}
          credits.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Blocked</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Generate fake clip metadata</CardTitle>
          <CardDescription>
            Debits the wallet and stores a stub. Frames are a CSS stand-in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="clip-prompt">Prompt</Label>
            <Input
              id="clip-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={tier === "eco" ? "default" : "outline"}
              onClick={() => setTier("eco")}
            >
              Eco · {CREDIT_COST.video.eco} cr
            </Button>
            <Button
              type="button"
              size="sm"
              variant={tier === "premium" ? "default" : "outline"}
              disabled={!premiumOk}
              onClick={() => setTier("premium")}
            >
              Premium · {CREDIT_COST.video.premium} cr
              {!premiumOk ? " (Master)" : ""}
            </Button>
          </div>
          <Button onClick={() => void generate()} disabled={busy || !prompt.trim()}>
            {busy ? "Stubbing…" : "Generate stub"}
          </Button>
        </CardContent>
      </Card>

      {videos.length === 0 ? (
        <p className="text-sm text-muted-foreground">No clips yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {videos.map((job) => (
            <li key={job.id}>
              <Card className="overflow-hidden pt-0">
                <div
                  className={
                    job.tier === "premium"
                      ? "h-28 bg-linear-to-br from-emerald-800 via-lime-700 to-amber-600"
                      : "h-28 bg-linear-to-br from-emerald-600 via-green-500 to-teal-700"
                  }
                />
                <CardHeader>
                  <CardTitle className="text-sm">{job.prompt}</CardTitle>
                  <CardDescription>
                    {job.tier} · {job.resolution} · {job.durationSec}s · {job.renderer}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  {job.creditsDebited} credits · {formatWhen(job.createdAt)} · {job.status}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
