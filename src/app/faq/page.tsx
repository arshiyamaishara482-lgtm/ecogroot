import { MarketingShell } from "@/components/marketing-shell";
import { PageMotion, Stagger, StaggerItem } from "@/components/motion";
import { PageHero } from "@/components/page-hero";
import { FAQ_ITEMS } from "@/lib/marketing";

export const metadata = {
  title: "FAQ — Eco AI",
  description: "Answers about Open Limited, Cascade-Verify, free APIs, and impact estimates.",
};

export default function FaqPage() {
  return (
    <MarketingShell>
      <PageMotion>
        <PageHero
          eyebrow="FAQ"
          title="Straight answers"
          subtitle="What Eco AI is, what it isn’t, and how Cascade-Verify stretches free model use."
          cta={{ href: "/open", label: "Open Limited free" }}
        />
        <section className="bg-[#f3f7f2]">
          <div className="mx-auto w-full max-w-3xl px-4 py-16">
            <Stagger className="divide-y divide-emerald-900/10 rounded-3xl border border-emerald-900/10 bg-white">
              {FAQ_ITEMS.map((item) => (
                <StaggerItem key={item.q}>
                  <details className="group px-5 py-4">
                    <summary className="cursor-pointer list-none font-medium text-emerald-950 marker:content-none">
                      <span className="flex items-center justify-between gap-3">
                        {item.q}
                        <span className="text-emerald-600 transition group-open:rotate-45">+</span>
                      </span>
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-emerald-900/70">{item.a}</p>
                  </details>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      </PageMotion>
    </MarketingShell>
  );
}
