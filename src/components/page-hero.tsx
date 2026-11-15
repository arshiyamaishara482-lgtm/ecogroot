import Link from "next/link";
import { FadeIn } from "@/components/motion";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  dark = false,
  cta,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  dark?: boolean;
  cta?: { href: string; label: string };
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b",
        dark
          ? "border-white/10 bg-[#0a1f16] text-emerald-50"
          : "border-emerald-900/10 bg-[#eef5ec]"
      )}
    >
      <div className="pointer-events-none absolute inset-0 leaf-haze opacity-40" />
      {dark ? (
        <div className="pointer-events-none absolute inset-0 canopy-gradient opacity-90" />
      ) : null}
      <div className="relative mx-auto w-full max-w-6xl px-4 py-16 md:py-20">
        <FadeIn>
          <p
            className={cn(
              "text-xs tracking-[0.22em] uppercase",
              dark ? "text-lime-300/90" : "text-emerald-700"
            )}
          >
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-4xl leading-[1.05] tracking-tight md:text-5xl">
            {title}
          </h1>
          <p
            className={cn(
              "mt-4 max-w-2xl text-base leading-relaxed md:text-lg",
              dark ? "text-emerald-100/75" : "text-emerald-900/70"
            )}
          >
            {subtitle}
          </p>
          {cta ? (
            <Link
              href={cta.href}
              className={cn(
                "mt-8 inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold transition",
                dark
                  ? "bg-lime-300 text-emerald-950 hover:bg-lime-200"
                  : "bg-emerald-900 text-emerald-50 hover:bg-emerald-800"
              )}
            >
              {cta.label}
            </Link>
          ) : null}
        </FadeIn>
      </div>
    </section>
  );
}
