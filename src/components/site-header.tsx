"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LeafMark } from "@/components/leaf-mark";
import { BUILDING_PHASE } from "@/lib/constants";
import { NAV_LINKS } from "@/lib/marketing";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#071a12]/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-white">
          <LeafMark className="size-8" />
          <div>
            <div className="font-[family-name:var(--font-display)] text-lg leading-none tracking-tight">
              Eco Groot
            </div>
            <div className="text-[10px] tracking-[0.18em] text-emerald-200/70 uppercase">
              Canopy lab
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-emerald-50/75 hover:bg-white/5 hover:text-white"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-100 sm:inline">
            {BUILDING_PHASE}
          </span>
          <Link
            href="/login"
            className="inline-flex h-7 items-center rounded-lg border border-emerald-300/40 bg-transparent px-2.5 text-[0.8rem] font-medium text-emerald-50 transition hover:bg-emerald-500/15 hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/login?mode=signup"
            className="inline-flex h-7 items-center rounded-lg bg-lime-300 px-2.5 text-[0.8rem] font-medium text-emerald-950 transition hover:bg-lime-200"
          >
            Sign up free
          </Link>
          <button
            type="button"
            className="rounded-md border border-white/15 px-2 py-1 text-xs text-white lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            Menu
          </button>
        </div>
      </div>
      <div
        className={cn(
          "border-t border-white/10 bg-[#071a12] px-4 py-3 lg:hidden",
          open ? "block" : "hidden"
        )}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-1">
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-2 py-2 text-sm",
                  active
                    ? "bg-white/10 text-white"
                    : "text-emerald-50/90 hover:bg-white/5"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
