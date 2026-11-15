import { Badge } from "@/components/ui/badge";
import type { CascadeResult } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CascadePipeline({ result }: { result: CascadeResult }) {
  return (
    <ol className="space-y-2">
      {result.steps.map((step, i) => {
        const tone =
          step.stage === "judge"
            ? step.verdict === "pass"
              ? "border-emerald-600/40 bg-emerald-50"
              : "border-amber-600/40 bg-amber-50"
            : step.stage === "hint"
              ? "border-sky-600/30 bg-sky-50"
              : step.skipped
                ? "border-dashed bg-muted/40"
                : "bg-background";
        return (
          <li
            key={`${step.stage}-${i}`}
            className={cn("rounded-lg border px-3 py-2", tone)}
          >
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">{step.label}</span>
              {step.verdict ? (
                <Badge variant={step.verdict === "pass" ? "default" : "outline"}>
                  {step.verdict.toUpperCase()}
                  {step.score != null ? ` · ${step.score}` : ""}
                </Badge>
              ) : null}
              {step.skipped ? <Badge variant="secondary">skipped</Badge> : null}
            </div>
            <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
              {step.output}
            </pre>
          </li>
        );
      })}
      <li className="text-xs text-muted-foreground">
        Path: {result.usedCheapPath ? "cheap (no escalate)" : "escalated"}
        {result.difficulty ? ` · hint ${result.difficulty}` : ""} ·{" "}
        {result.creditsDebited} usage ·{" "}
        {result.mode === "eco-cascade"
          ? "Eco-Cascade"
          : result.ecoSkill
            ? "Ultra Eco"
            : "Eco-Cascade"}{" "}
        · source {result.modelSource}
      </li>
    </ol>
  );
}
