import { MarketingShell } from "@/components/marketing-shell";
import { FadeIn, PageMotion, Stagger, StaggerItem } from "@/components/motion";
import { PageHero } from "@/components/page-hero";
import { COMPARE_ROWS, IMPACT_PILLARS, IMPACT_STATS } from "@/lib/marketing";

export const metadata = {
  title: "Impact — Eco AI",
  description:
    "Eco skill, one wallet, labeled impact estimates, and an honest Cascade-Verify comparison.",
};

export default function ImpactPage() {
  return (
    <MarketingShell>
      <PageMotion>
        <PageHero
          eyebrow="Canopy details"
          title="Built like a garden, not a hyperscale lobby"
          subtitle="Dense product language on purpose — so visitors know what Open Limited unlocks while we keep building."
          cta={{ href: "/plans", label: "See planned tiers" }}
        />
        <section className="bg-[#f7faf6]">
          <div className="mx-auto w-full max-w-6xl px-4 py-16">
            <Stagger className="grid gap-4 sm:grid-cols-2">
              {IMPACT_PILLARS.map((p) => (
                <StaggerItem key={p.title}>
                  <article className="h-full rounded-3xl border border-emerald-900/8 bg-gradient-to-br from-white to-emerald-50/80 p-6">
                    <h2 className="font-[family-name:var(--font-display)] text-xl">{p.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-emerald-900/70">{p.body}</p>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
            <FadeIn className="mt-8 grid gap-3 rounded-3xl border border-emerald-900/10 bg-[#123226] p-6 text-emerald-50 md:grid-cols-4">
              {IMPACT_STATS.map(([k, v]) => (
                <div key={k}>
                  <div className="font-mono text-2xl text-lime-200">{k}</div>
                  <div className="mt-1 text-xs leading-relaxed text-emerald-100/70">{v}</div>
                </div>
              ))}
            </FadeIn>
          </div>
        </section>
        <section className="border-t border-emerald-900/10 bg-white">
          <div className="mx-auto w-full max-w-6xl px-4 py-16">
            <FadeIn>
              <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
                How Eco AI compares (honestly)
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-emerald-900/65">
                A working-title demo, not a claim of “first green AI.” Comparison is about product
                mechanics while the product is still being grown.
              </p>
            </FadeIn>
            <FadeIn delay={0.1} className="mt-8 overflow-x-auto rounded-2xl border border-emerald-900/10">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-emerald-950 text-emerald-50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Capability</th>
                    <th className="px-4 py-3 font-medium">Eco AI</th>
                    <th className="px-4 py-3 font-medium">Typical chat apps</th>
                    <th className="px-4 py-3 font-medium">Router clones</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row) => (
                    <tr key={row[0]} className="border-t border-emerald-900/10">
                      <td className="px-4 py-3 text-emerald-950/85">{row[0]}</td>
                      {[row[1], row[2], row[3]].map((ok, i) => (
                        <td key={i} className="px-4 py-3">
                          <span
                            className={
                              ok
                                ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800"
                                : "rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500"
                            }
                          >
                            {ok ? "Yes" : "No / rare"}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </FadeIn>
          </div>
        </section>
      </PageMotion>
    </MarketingShell>
  );
}
