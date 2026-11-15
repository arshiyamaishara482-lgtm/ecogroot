"use client";

import { PlanBadge } from "@/components/plan-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useWallet } from "@/components/wallet-context";
import {
  PAID_PLANS_OPEN,
  PAID_PLANS_WIP_MESSAGE,
  PLAN_CREDITS,
  PLAN_FEATURES,
  PLAN_PRICE,
} from "@/lib/constants";
import { formatCredits } from "@/lib/format";
import type { PlanId } from "@/lib/types";

const ORDER: PlanId[] = ["free", "pro", "master"];

export default function PlansPage() {
  const { snapshot } = useWallet();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Plans</h1>
        <p className="text-sm text-muted-foreground">
          Open Limited (Free) is the only live tier while we build. Pro ($8) and Master ($15)
          are listed as intended prices — not unlocked yet.
        </p>
      </div>

      {!PAID_PLANS_OPEN ? (
        <Alert>
          <AlertTitle>Work in progress</AlertTitle>
          <AlertDescription>{PAID_PLANS_WIP_MESSAGE}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {ORDER.map((id) => {
          const current = snapshot.user.plan === id;
          const price = PLAN_PRICE[id];
          const feat = PLAN_FEATURES[id];
          const locked = id !== "free" && !PAID_PLANS_OPEN;
          return (
            <Card
              key={id}
              className={
                current
                  ? "ring-2 ring-primary"
                  : locked
                    ? "opacity-90"
                    : undefined
              }
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  {price.label}
                  {current ? <PlanBadge plan={id} /> : null}
                  {locked ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                      Coming soon
                    </span>
                  ) : null}
                </CardTitle>
                <CardDescription>
                  ${price.usd}
                  {id === "free" ? "" : "/mo"} · {formatCredits(PLAN_CREDITS[id])} usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-sm">{feat.tagline}</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {feat.items.map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button disabled variant={current ? "secondary" : "outline"}>
                  {current
                    ? "Current plan"
                    : locked
                      ? "Not available yet"
                      : `Switch to ${price.label}`}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
