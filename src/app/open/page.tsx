import { MarketingShell } from "@/components/marketing-shell";
import { FadeIn, PageMotion } from "@/components/motion";
import { OpenAccessForm } from "@/components/open-access-form";
import { PageHero } from "@/components/page-hero";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata = {
  title: "Open Limited — Eco AI",
  description:
    "Enter Eco AI Open Limited free. Cascade-Verify on free model APIs — no invite wall.",
};

export default function OpenPage() {
  return (
    <MarketingShell>
      <PageMotion>
        <PageHero
          dark
          eyebrow="Open Limited"
          title="Free for everyone — cascade stretches free model use"
          subtitle="No invite wall. Enter anytime. Cascade-Verify answers with a small free-tier model first, judges that answer, and only then spends a larger free model."
        />
        <section className="relative overflow-hidden bg-[#0a1f16]">
          <div className="pointer-events-none absolute inset-0 leaf-haze opacity-40" />
          <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[0.9fr_1.1fr]">
            <FadeIn className="text-emerald-50">
              <ul className="space-y-2 text-sm text-emerald-100/80">
                <li>· Pollinations public free API (no key) + optional Groq / Gemini / OpenRouter free</li>
                <li>· Small path uses less of your pool than escalate</li>
                <li>· Ultra Eco (default) or Eco-Cascade mode in chat</li>
                <li>· Waitlist is optional — for product updates only</li>
              </ul>
              <div className="mt-8 rounded-2xl border border-lime-200/20 bg-white p-4 text-emerald-950 shadow-lg">
                <div className="text-xs tracking-wide text-emerald-700 uppercase">Start now</div>
                <div className="mt-3">
                  <OpenAccessForm compact />
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.12}>
              <WaitlistForm />
            </FadeIn>
          </div>
        </section>
      </PageMotion>
    </MarketingShell>
  );
}
