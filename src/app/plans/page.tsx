import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { FadeIn, PageMotion, Stagger, StaggerItem } from "@/components/motion";
import { PageHero } from "@/components/page-hero";
import { PAID_PLANS_WIP_MESSAGE } from "@/lib/constants";
import { formatCredits } from "@/lib/format";
import { planCards } from "@/lib/marketing";

export const metadata = {
  title: "Plans — Eco AI",
  description:
    "Open Limited (Free) is live. Pro and Master are work in progress at intended $8 / $15 prices.",
};

export default function PlansMarketingPage() {
  const plans = planCards();

  return (
    <MarketingShell>
      <PageMotion>
        <PageHero
          eyebrow="Planned tiers"
          title="Free · Pro · Master"
          subtitle="Only Open Limited (Free) is live while we build. Pro ($8) and Master ($15) are intended prices — cheaper than typical ~$20 AI tools — and stay locked for now."
          cta={{ href: "/open", label: "Start on Free Limited" }}
        />
        <section className="bg-[#f7faf6]">
          <div className="mx-auto w-full max-w-6xl px-4 py-16">
            <FadeIn className="mb-8 rounded-2xl border border-amber-700/20 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              {PAID_PLANS_WIP_MESSAGE}
            </FadeIn>
            <Stagger className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => {
                const locked = plan.id !== "free";
                return (
                  <StaggerItem key={plan.id}>
                    <article
                      className={
                        plan.id === "free"
                          ? "flex h-full flex-col rounded-3xl border-2 border-emerald-700 bg-white p-5 shadow-md"
                          : "flex h-full flex-col rounded-3xl border border-emerald-900/10 bg-white/70 p-5 opacity-95"
                      }
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <h2 className="font-[family-name:var(--font-display)] text-2xl">
                          {plan.price.label}
                        </h2>
                        <div className="text-right text-sm text-emerald-800">
                          <div>
                            ${plan.price.usd}
                            {plan.id === "free" ? "" : "/mo"}
                          </div>
                          {locked ? (
                            <div className="mt-1 text-[10px] tracking-wide text-amber-800 uppercase">
                              Coming soon
                            </div>
                          ) : (
                            <div className="mt-1 text-[10px] tracking-wide text-emerald-700 uppercase">
                              Live now
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-emerald-900/65">{plan.features.tagline}</p>
                      <p className="mt-3 font-mono text-xs text-emerald-700">
                        {formatCredits(plan.credits)} usage pool
                      </p>
                      <ul className="mt-3 flex-1 space-y-1.5 text-sm text-emerald-900/80">
                        {plan.features.items.map((item) => (
                          <li key={item}>· {item}</li>
                        ))}
                      </ul>
                      {locked ? (
                        <span className="mt-5 inline-flex h-10 items-center justify-center rounded-full border border-emerald-900/15 bg-emerald-50/80 px-4 text-sm font-medium text-emerald-900/55">
                          Not available yet
                        </span>
                      ) : (
                        <Link
                          href="/open"
                          className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-emerald-900 text-sm font-medium text-emerald-50 transition hover:bg-emerald-800"
                        >
                          Enter Limited free
                        </Link>
                      )}
                    </article>
                  </StaggerItem>
                );
              })}
            </Stagger>
            <FadeIn className="mt-10 text-center text-sm text-emerald-900/60">
              Paid upgrades and Pro/Master features (including video) stay closed until we open
              them. Chat on Free is the live product.
            </FadeIn>
          </div>
        </section>
      </PageMotion>
    </MarketingShell>
  );
}
