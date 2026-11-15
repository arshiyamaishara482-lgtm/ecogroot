import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatCo2,
  formatKwh,
  formatUsd,
  formatWater,
} from "@/lib/format";
import type { ImpactEstimate } from "@/lib/types";

export function ImpactCard({ impact }: { impact: ImpactEstimate }) {
  const rows = [
    ["Tokens in (est.)", String(impact.tokensIn)],
    ["Tokens out (est.)", String(impact.tokensOut)],
    ["$ (est.)", formatUsd(impact.costUsdEstimate)],
    ["Energy (est.)", formatKwh(impact.energyKwhEstimate)],
    ["CO₂ (est.)", formatCo2(impact.co2gEstimate)],
    ["Water (est.)", formatWater(impact.waterMlEstimate)],
  ];

  return (
    <Card size="sm" className="bg-muted/40">
      <CardHeader>
        <CardTitle className="text-sm">Impact estimates</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {rows.map(([k, v]) => (
          <div key={k} className="rounded-md bg-background/80 px-2 py-1.5 ring-1 ring-foreground/8">
            <div className="text-[11px] tracking-wide text-muted-foreground uppercase">
              {k}
            </div>
            <div className="font-mono text-sm tabular-nums">{v}</div>
          </div>
        ))}
        <p className="col-span-2 text-xs text-muted-foreground sm:col-span-3">
          {impact.note}
        </p>
      </CardContent>
    </Card>
  );
}
