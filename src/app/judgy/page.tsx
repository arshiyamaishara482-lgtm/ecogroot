import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { FadeIn, PageMotion, Stagger, StaggerItem } from "@/components/motion";
import { PageHero } from "@/components/page-hero";

export const metadata = {
  title: "Judgy — Eco Groot",
  description:
    "How Judgy works in Cascade-Verify: cheap difficulty hint, then score the small answer, then escalate only on FAIL.",
};

const STEPS = [
  {
    n: "00",
    title: "Cheap difficulty hint",
    body: "Judgy peeks at the question for easy / medium / hard cues. This only tunes the PASS bar — it does not skip the small model.",
  },
  {
    n: "01",
    title: "Small model answers first",
    body: "A quantized-style small free-tier model always writes an answer. Hard hints may allow a slightly longer small reply, still cheap-first.",
  },
  {
    n: "02",
    title: "Judgy scores that answer",
    body: "Local heuristics (not another LLM): word count, keyword coverage, incomplete/sketch language, hedging. PASS needs score ≥ threshold.",
  },
  {
    n: "03",
    title: "Escalate only on FAIL",
    body: "If Judgy fails the small answer, a larger free-tier model runs. PASS keeps you on the cheap path — that is the cascade save.",
  },
] as const;

export default function JudgyPage() {
  return (
    <MarketingShell>
      <PageMotion>
        <PageHero
          eyebrow="Judgy"
          title="The checker in Cascade-Verify"
          subtitle="Judgy is Eco Groot's own creation — a hybrid algorithm, not a third-party grading model. It hints at difficulty, then grades the small answer before any expensive escalate."
          cta={{ href: "/open", label: "Try it in chat" }}
        />

        <section className="bg-[#e7f0e6]">
          <div className="mx-auto w-full max-w-6xl px-4 py-16">
            <Stagger className="grid gap-4 md:grid-cols-2">
              {STEPS.map((step) => (
                <StaggerItem key={step.n}>
                  <article className="h-full rounded-3xl border border-emerald-900/10 bg-white/80 p-6 shadow-sm">
                    <div className="font-mono text-sm text-emerald-600">{step.n}</div>
                    <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl">
                      {step.title}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-emerald-900/70">{step.body}</p>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>

            <FadeIn delay={0.1} className="mt-12 rounded-3xl border border-emerald-900/10 bg-[#123226] p-6 text-emerald-50 md:p-8">
              <h3 className="font-[family-name:var(--font-display)] text-2xl">
                Is Judgy an AI model?
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-emerald-100/80">
                No. Today Judgy is a named local algorithm. Small and large answers may come from
                free model APIs (Groq, Gemini, OpenRouter, Pollinations) or a mock. Judgy decides
                PASS/FAIL with rules — and a hybrid hint that makes hard questions harder to PASS so
                weak small answers escalate more often, while easy questions stay cheap.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/how-its-done"
                  className="inline-flex h-10 items-center rounded-full bg-lime-300 px-4 text-sm font-semibold text-emerald-950 transition hover:bg-lime-200"
                >
                  How it&apos;s done
                </Link>
                <Link
                  href="/open"
                  className="inline-flex h-10 items-center rounded-full border border-emerald-200/25 bg-white/5 px-4 text-sm transition hover:bg-white/10"
                >
                  Try it in chat
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
      </PageMotion>
    </MarketingShell>
  );
}
