import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-shell min-h-dvh text-emerald-950">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
