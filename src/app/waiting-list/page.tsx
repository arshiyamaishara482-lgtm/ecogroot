import { WAITLIST_WHATSAPP_PHONE_LOCAL } from "@/lib/contact";
import { MarketingShell } from "@/components/marketing-shell";
import { FadeIn, PageMotion } from "@/components/motion";
import { PageHero } from "@/components/page-hero";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata = {
  title: "Waiting list — Eco AI",
  description:
    "Join the Eco AI waiting list for early access. Your details are sent to the team on WhatsApp.",
};

export default function WaitingListPage() {
  return (
    <MarketingShell>
      <PageMotion>
        <PageHero
          eyebrow="Waiting list"
          title="Get early access notes"
          subtitle="Fill the form and we notify the Eco AI team on WhatsApp with your details. You can still enter Open Limited free anytime while you wait."
          cta={{ href: "/open", label: "Or enter Limited free now" }}
        />
        <section className="bg-[#071a12]">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1fr_1.1fr] md:items-start">
            <FadeIn className="text-emerald-50">
              <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
                What you get on the list
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-emerald-100/75">
                <li>· Early heads-up on new Cascade-Verify and Judgy builds</li>
                <li>· Priority notes when measured energy/water adapters land</li>
                <li>· Your signup pings WhatsApp <span className="font-mono text-lime-200">{WAITLIST_WHATSAPP_PHONE_LOCAL}</span></li>
                <li>· Limited free product stays open — no invite wall</li>
              </ul>
            </FadeIn>
            <FadeIn delay={0.08}>
              <WaitlistForm mode="early-access" />
            </FadeIn>
          </div>
        </section>
      </PageMotion>
    </MarketingShell>
  );
}
