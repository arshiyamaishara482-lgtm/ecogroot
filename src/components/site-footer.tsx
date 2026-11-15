import Link from "next/link";
import { LeafMark } from "@/components/leaf-mark";
import { BUILDING_PHASE, QUANTIZATION_NOTE } from "@/lib/constants";
import { NAV_LINKS } from "@/lib/marketing";

export function SiteFooter() {
  return (
    <footer className="border-t border-emerald-900/20 bg-[#04140e] text-emerald-50">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <LeafMark className="size-8" />
            <div>
              <div className="font-[family-name:var(--font-display)] text-xl">Eco Groot</div>
              <div className="text-xs text-emerald-200/70">{BUILDING_PHASE}</div>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-emerald-100/70">
            Open Limited usage pool for quieter inference. Cascade-Verify answers with a small
            free model first, judges that answer, then escalates only when needed — stretching free
            API quota further than always-large chat.
          </p>
        </div>
        <div>
          <div className="mb-3 text-xs tracking-[0.2em] text-emerald-300/80 uppercase">Explore</div>
          <ul className="space-y-2 text-sm text-emerald-100/80">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/login" className="hover:text-white">
                Enter free
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-xs tracking-[0.2em] text-emerald-300/80 uppercase">Clarity</div>
          <ul className="space-y-2 text-sm text-emerald-100/80">
            <li>Not free ChatGPT / OpenAI tokens</li>
            <li>Free-tier APIs + cascade failover</li>
            <li>Impact numbers are estimates</li>
            <li>Offline mock fallback when free APIs fail</li>
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-emerald-200/60">{QUANTIZATION_NOTE}</p>
        </div>
      </div>
      <div className="border-t border-white/5 px-4 py-4 text-center text-xs text-emerald-200/50">
        © {new Date().getFullYear()} Eco Groot · working title · Open Limited · grown with care for
        fewer wasted tokens
      </div>
    </footer>
  );
}
