import Link from "next/link";
import { EcoGlobeClient } from "@/components/eco-globe-client";
import { MarketingShell } from "@/components/marketing-shell";
import { Float, PageMotion, Stagger, StaggerItem } from "@/components/motion";
import { BUILDING_PHASE } from "@/lib/constants";
import { NAV_LINKS } from "@/lib/marketing";

export default function HomePage() {
  return (
    <MarketingShell>
      <PageMotion>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 canopy-gradient" />
          <div className="pointer-events-none absolute inset-0 leaf-haze opacity-70" />
          <div className="pointer-events-none absolute -top-20 -right-16 size-72 animate-drift rounded-full bg-lime-300/15 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-[-4rem] size-80 animate-drift-slow rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 px-4 pt-14 pb-16 md:grid-cols-[1.05fr_0.95fr] md:gap-6 md:pt-20 md:pb-24">
            <div className="text-emerald-50">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime-300/30 bg-lime-300/10 px-3 py-1 text-xs tracking-[0.16em] text-lime-100 uppercase">
                <span className="size-1.5 animate-pulse rounded-full bg-lime-300" />
                {BUILDING_PHASE}
              </div>
              <h1 className="font-[family-name:var(--font-display)] text-5xl leading-[0.95] tracking-tight text-balance sm:text-6xl md:text-7xl">
                Eco Groot
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-emerald-100/80 sm:text-lg">
                Aiming to make AI affordable and reduce energy and water wastage
                at the same time — by making a system which watches out for both
                your wallet and our mother earth.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/open"
                  className="inline-flex h-11 items-center rounded-full bg-lime-300 px-5 text-sm font-semibold text-emerald-950 transition hover:bg-lime-200"
                >
                  Open Limited free
                </Link>
                <Link
                  href="/how-its-done"
                  className="inline-flex h-11 items-center rounded-full border border-emerald-200/30 bg-white/5 px-5 text-sm font-medium text-emerald-50 backdrop-blur transition hover:bg-white/10"
                >
                  How it&apos;s done
                </Link>
              </div>
            </div>

            <Float className="flex justify-center md:justify-end">
              <EcoGlobeClient />
            </Float>
          </div>
        </section>

        <section className="border-y border-emerald-900/10 bg-[#f3f7f2]">
          <div className="mx-auto w-full max-w-6xl px-4 py-16">
            <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-emerald-950 md:text-4xl">
              Explore pages
            </h2>
            <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {NAV_LINKS.map((link) => (
                <StaggerItem key={link.href}>
                  <Link
                    href={link.href}
                    className="group block rounded-3xl border border-emerald-900/10 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-700/30 hover:shadow-lg"
                  >
                    <div className="font-[family-name:var(--font-display)] text-xl text-emerald-950 transition group-hover:text-emerald-800">
                      {link.label}
                    </div>
                    <p className="mt-2 text-sm text-emerald-900/65">
                      Open the {link.label.toLowerCase()} page →
                    </p>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      </PageMotion>
    </MarketingShell>
  );
}
