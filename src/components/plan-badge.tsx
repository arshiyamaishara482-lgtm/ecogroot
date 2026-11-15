import { Badge } from "@/components/ui/badge";
import { planLabel } from "@/lib/plans";
import type { PlanId } from "@/lib/types";

export function PlanBadge({ plan }: { plan: PlanId }) {
  const label = planLabel(plan);
  if (plan === "master") {
    return (
      <Badge className="bg-emerald-800 text-emerald-50">
        {label} · Team
      </Badge>
    );
  }
  if (plan === "pro") {
    return <Badge>{label}</Badge>;
  }
  return <Badge variant="outline">{label}</Badge>;
}
