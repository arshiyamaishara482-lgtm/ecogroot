import Link from "next/link";
import { HowItWorksDiagram } from "@/components/how-it-works-diagram";
import { MarketingShell } from "@/components/marketing-shell";
import { FadeIn, PageMotion, Stagger, StaggerItem } from "@/components/motion";
import { PageHero } from "@/components/page-hero";
import { HOW_IT_WORKS_SIMPLE } from "@/lib/marketing";

export const metadata = {
  title: "How it's done — Eco GrootS",
  description:
    "Diagram of how a user request moves through Honey-style Eco skill, quantization, Cascade-Verify, and impact estimates — plus a plain-language version.",
};

export default function HowItsDonePage() {
  return (
    <MarketingShell>
      <PageMotion>
        <PageHero
          eyebrow="How it's done"
          title="The path your request takes"
          subtitle="A full map of cascading, quantization, and Honey-style Eco skill — then the same story in everyday words."
          cta={{ href: "/open", label: "Try it in Open Limited" }}
        />

        <section className="relative overflow-hidden bg-[#071a12] text-emerald-50">
          <div className="pointer-events-none absolute inset-0 canopy-gradient opacity-80" />
          <div className="pointer-events-none absolute inset-0 leaf-haze opacity-40" />
          <div className="relative mx-auto w-full max-w-6xl px-4 py-16 md:py-20">
            <HowItWorksDiagram />
          </div>
        </section>

        <section className="border-t border-emerald-900/10 bg-[#f3f7f2]">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 md:py-20">
            <FadeIn>
              <p className="text-xs tracking-[0.22em] text-emerald-700 uppercase">
                Same idea, simpler words
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight text-emerald-950 md:text-4xl">
                Explain it like a friend asked
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-emerald-900/70">
                No jargon required. This is the diagram above, told in plain language.
              </p>
            </FadeIn>

            <Stagger className="mt-10 space-y-4">
              {HOW_IT_WORKS_SIMPLE.map((item, i) => (
                <StaggerItem key={item.title}>
                  <article className="rounded-3xl border border-emerald-900/10 bg-white/90 p-5 shadow-sm md:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-5">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-900 font-mono text-sm text-lime-200">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <h3 className="font-[family-name:var(--font-display)] text-xl text-emerald-950">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-emerald-900/70 md:text-base">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>

            <FadeIn
              delay={0.1}
              className="mt-12 rounded-3xl border border-emerald-900/10 bg-[#123226] p-6 text-emerald-50 md:p-8"
            >
              <h3 className="font-[family-name:var(--font-display)] text-2xl">
                One sentence takeaway
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-emerald-100/80 md:text-base">
                Eco Groot asks a small, packed model first, checks if the answer is good enough, and
                only then calls a bigger model — while Eco skill keeps replies shorter — so chats
                stay more affordable and waste less energy and water along the way.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/judgy"
                  className="inline-flex h-10 items-center rounded-full border border-emerald-200/25 bg-white/5 px-4 text-sm text-emerald-50 transition hover:bg-white/10"
                >
                  Judgy
                </Link>
                <Link
                  href="/open"
                  className="inline-flex h-10 items-center rounded-full bg-lime-300 px-4 text-sm font-semibold text-emerald-950 transition hover:bg-lime-200"
                >
                  Open Limited free
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
      </PageMotion>
    </MarketingShell>
  );
}
