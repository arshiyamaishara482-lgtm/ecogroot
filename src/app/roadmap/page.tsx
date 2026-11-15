import { MarketingShell } from "@/components/marketing-shell";
import { FadeIn, PageMotion, Stagger, StaggerItem } from "@/components/motion";
import { PageHero } from "@/components/page-hero";
import {
  ENERGY_WATER_COMPARE,
  GREENER_PLAN,
  IMPACT_SAVINGS,
  IMPACT_SAVINGS_SCALE,
  IMPACT_SOURCES,
  ROADMAP_PHASES,
} from "@/lib/marketing";

export const metadata = {
  title: "Roadmap — Eco AI",
  description:
    "Energy and water estimates vs top AI models, how Eco AI plans to improve, and what we’re building now / next / later.",
};

export default function RoadmapPage() {
  return (
    <MarketingShell>
      <PageMotion>
        <PageHero
          eyebrow="Undergoing"
          title="The forest is still growing"
          subtitle="Open Limited is free for everyone while we plant Cascade-Verify deeper — and get honest about energy and water: published frontier estimates vs our labeled demo heuristics, plus how we plan to do better."
          cta={{ href: "/open", label: "Enter Open Limited" }}
        />

        <section className="bg-[#071a12] text-emerald-50">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 md:py-20">
            <FadeIn>
              <p className="text-xs tracking-[0.22em] text-lime-300/90 uppercase">
                Energy &amp; water snapshot
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight md:text-4xl">
                Top models vs Eco AI (estimates)
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-emerald-100/75 md:text-base">
                Frontier rows use public figures for a short text prompt. Eco AI
                rows use our token-count demo math (same heuristics as the chat
                wallet). None of these are a greenhouse certificate — they are
                order-of-magnitude guides so the roadmap has numbers to aim at.
              </p>
            </FadeIn>

            <FadeIn delay={0.08} className="mt-8 overflow-x-auto rounded-3xl border border-emerald-200/15">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-emerald-950/80 text-emerald-50">
                  <tr>
                    <th className="px-4 py-3 font-medium">System</th>
                    <th className="px-4 py-3 font-medium">Energy / short prompt</th>
                    <th className="px-4 py-3 font-medium">Water / short prompt</th>
                    <th className="px-4 py-3 font-medium">Source / caveat</th>
                  </tr>
                </thead>
                <tbody>
                  {ENERGY_WATER_COMPARE.map((row) => (
                    <tr
                      key={row.name}
                      className="border-t border-emerald-200/10 bg-[#0c241a]/80"
                    >
                      <td className="px-4 py-3 font-medium text-lime-100">{row.name}</td>
                      <td className="px-4 py-3 font-mono text-emerald-50">{row.energy}</td>
                      <td className="px-4 py-3 font-mono text-emerald-50">{row.water}</td>
                      <td className="px-4 py-3 text-xs leading-relaxed text-emerald-100/65">
                        {row.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </FadeIn>

            <FadeIn delay={0.1} className="mt-12">
              <p className="text-xs tracking-[0.22em] text-lime-300/90 uppercase">
                What we save in the process
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-tight md:text-3xl">
                Estimated energy &amp; water avoided per short chat
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-emerald-100/75 md:text-base">
                Savings = published frontier estimate minus Eco AI’s demo path.
                Cheap path = Cascade PASS (small model only). Escalate path =
                FAIL then large free model. Still estimates — not a lab meter.
              </p>
            </FadeIn>

            <FadeIn delay={0.12} className="mt-6 overflow-x-auto rounded-3xl border border-lime-300/20">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-lime-300/15 text-lime-100">
                  <tr>
                    <th className="px-4 py-3 font-medium">Compared with</th>
                    <th className="px-4 py-3 font-medium">Cheap path — energy</th>
                    <th className="px-4 py-3 font-medium">Cheap path — water</th>
                    <th className="px-4 py-3 font-medium">Escalate — energy</th>
                    <th className="px-4 py-3 font-medium">Escalate — water</th>
                  </tr>
                </thead>
                <tbody>
                  {IMPACT_SAVINGS.map((row) => (
                    <tr
                      key={row.vs}
                      className="border-t border-emerald-200/10 bg-[#0c241a]/80"
                    >
                      <td className="px-4 py-3 font-medium text-lime-100">{row.vs}</td>
                      <td className="px-4 py-3 font-mono text-emerald-50">{row.cheapEnergy}</td>
                      <td className="px-4 py-3 font-mono text-emerald-50">{row.cheapWater}</td>
                      <td className="px-4 py-3 font-mono text-emerald-100/85">{row.escalateEnergy}</td>
                      <td className="px-4 py-3 font-mono text-emerald-100/85">{row.escalateWater}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </FadeIn>

            <Stagger className="mt-8 grid gap-3 md:grid-cols-3">
              {IMPACT_SAVINGS_SCALE.map((card) => (
                <StaggerItem key={card.label}>
                  <div className="h-full rounded-2xl border border-lime-300/25 bg-lime-300/10 p-4">
                    <div className="text-xs tracking-wide text-lime-200/90 uppercase">
                      {card.label}
                    </div>
                    <div className="mt-3 font-mono text-lg text-lime-100">{card.energy}</div>
                    <div className="mt-1 font-mono text-sm text-emerald-100/90">{card.water}</div>
                    <p className="mt-3 text-xs leading-relaxed text-emerald-100/70">{card.blurb}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            <FadeIn delay={0.14} className="mt-8 rounded-2xl border border-lime-300/20 bg-lime-300/10 p-4 text-sm leading-relaxed text-emerald-50/90 md:p-5">
              <strong className="text-lime-200">Read this carefully:</strong> Eco
              AI does not own GPUs yet, so Wh / mL and “saved” figures are
              secondary estimates — useful when Cascade-Verify stays on the small
              path. Older GPT-4 email estimates (~140 Wh, ~519 mL) show how high
              heavy frontier generations can look; today’s ChatGPT / Gemini
              averages are closer to a fraction of a watt-hour and under a
              milliliter of water per short query.
            </FadeIn>
          </div>
        </section>

        <section className="border-y border-emerald-900/10 bg-white">
          <div className="mx-auto w-full max-w-6xl px-4 py-16">
            <FadeIn>
              <p className="text-xs tracking-[0.22em] text-emerald-700 uppercase">
                Proof &amp; method
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight md:text-4xl">
                Where the numbers come from
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-emerald-900/70 md:text-base">
                Frontier rows cite public research or company disclosures. Eco AI
                rows and “saved” deltas are our demo arithmetic — transparent,
                but not a laboratory measurement of our own GPUs.
              </p>
            </FadeIn>
            <Stagger className="mt-8 space-y-3">
              {IMPACT_SOURCES.map((source) => (
                <StaggerItem key={source.label}>
                  <article className="rounded-2xl border border-emerald-900/10 bg-[#f7faf6] p-4 md:p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-medium text-emerald-950">{source.label}</h3>
                      <a
                        href={source.href}
                        target={source.href.startsWith("http") ? "_blank" : undefined}
                        rel={source.href.startsWith("http") ? "noreferrer" : undefined}
                        className="text-xs font-medium text-emerald-700 underline-offset-2 hover:underline"
                      >
                        {source.href.startsWith("http") ? "Open source →" : "See method →"}
                      </a>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-emerald-900/70">
                      {source.detail}
                    </p>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        <section className="border-y border-emerald-900/10 bg-[#f3f7f2]">
          <div className="mx-auto w-full max-w-6xl px-4 py-16">
            <FadeIn>
              <p className="text-xs tracking-[0.22em] text-emerald-700 uppercase">
                How we get greener
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight md:text-4xl">
                Plan to make ours better
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-emerald-900/70 md:text-base">
                We cannot out-claim a hyperscale lab on day one. We can refuse
                always-large routing, shrink answers, and graduate from toy
                estimates to measured adapters.
              </p>
            </FadeIn>
            <Stagger className="mt-10 grid gap-4 sm:grid-cols-2">
              {GREENER_PLAN.map((item, i) => (
                <StaggerItem key={item.title}>
                  <article className="h-full rounded-3xl border border-emerald-900/10 bg-white/90 p-5 shadow-sm">
                    <div className="font-mono text-xs text-emerald-600">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl text-emerald-950">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-emerald-900/70">
                      {item.body}
                    </p>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        <section className="bg-[#eef5ec]">
          <div className="mx-auto w-full max-w-6xl px-4 py-16">
            <FadeIn>
              <p className="text-xs tracking-[0.22em] text-emerald-700 uppercase">
                Build phases
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight md:text-4xl">
                Now · Next · Later
              </h2>
            </FadeIn>
            <Stagger className="mt-10 grid gap-4 md:grid-cols-3">
              {ROADMAP_PHASES.map((block) => (
                <StaggerItem key={block.phase}>
                  <article className="h-full rounded-3xl border border-emerald-900/10 bg-white/80 p-5">
                    <div className="text-xs tracking-[0.18em] text-lime-700 uppercase">
                      {block.phase}
                    </div>
                    <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl">
                      {block.title}
                    </h2>
                    <ul className="mt-3 space-y-2 text-sm text-emerald-900/75">
                      {block.items.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-600" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      </PageMotion>
    </MarketingShell>
  );
}
