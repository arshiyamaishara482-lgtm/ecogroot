"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { WaitlistInterest, WaitlistStats } from "@/lib/types";

const INTERESTS: { id: WaitlistInterest; label: string; blurb: string }[] = [
  { id: "creator", label: "Creator", blurb: "Writing, research notes, quieter drafts" },
  { id: "developer", label: "Developer", blurb: "Cascade pipeline & usage-pool APIs" },
  { id: "researcher", label: "Researcher", blurb: "Energy / CO₂ estimate methodology" },
  { id: "team", label: "Team", blurb: "Shared memory & Master workspace label" },
  { id: "curious", label: "Curious", blurb: "Just want a greener default" },
];

const fieldClass =
  "h-10 w-full rounded-lg border border-emerald-400/20 bg-emerald-950/40 px-3 text-sm text-emerald-50 outline-none placeholder:text-emerald-100/40 focus-visible:border-lime-300/50 focus-visible:ring-3 focus-visible:ring-lime-300/20";

const areaClass =
  "min-h-24 w-full rounded-lg border border-emerald-400/20 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-50 outline-none placeholder:text-emerald-100/40 focus-visible:border-lime-300/50 focus-visible:ring-3 focus-visible:ring-lime-300/20";

type JoinResult = {
  message: string;
  entry: {
    position: number;
    status: string;
    inviteCode: string | null;
    email: string;
    name: string;
  };
  stats: WaitlistStats;
  created: boolean;
  whatsapp?: {
    sent: boolean;
    method: string;
    whatsappLink: string;
  };
};

/**
 * Native uncontrolled fields + FormData submit.
 * Matches Open Access form reliability (works if Base UI / hydration fights automation).
 */
export function WaitlistForm({
  mode = "updates",
}: {
  mode?: "updates" | "early-access";
}) {
  const early = mode === "early-access";
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [interest, setInterest] = useState<WaitlistInterest>("curious");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JoinResult | null>(null);

  useEffect(() => {
    void fetch("/api/waitlist")
      .then((r) => r.json())
      .then((j) => setStats(j as WaitlistStats))
      .catch(() => undefined);
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const note = String(fd.get("note") ?? "").trim();
    const picked = (String(fd.get("interest") ?? interest) || "curious") as WaitlistInterest;

    try {
      const noteParts = [
        note,
        phone ? `Applicant WhatsApp/phone: ${phone}` : "",
      ].filter(Boolean);
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          interest: picked,
          note: noteParts.join("\n"),
          earlyAccess: early,
        }),
      });
      const json = (await res.json()) as JoinResult & { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Could not join");
      setResult(json);
      setStats(json.stats);
      if (json.whatsapp?.whatsappLink) {
        window.open(json.whatsapp.whatsappLink, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Join failed");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <div className="space-y-4 rounded-2xl border border-emerald-400/25 bg-[#0b2418]/80 p-6 text-emerald-50 shadow-[0_0_80px_-20px_rgba(132,204,22,0.45)]">
        <div className="text-xs tracking-[0.22em] text-lime-300/90 uppercase">
          {early ? "Waiting list confirmed" : "Updates list confirmed"}
        </div>
        <h3 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
          Thanks, {result.entry.name}. You&apos;re #{result.entry.position}.
        </h3>
        <p className="text-sm leading-relaxed text-emerald-100/80">{result.message}</p>
        {result.whatsapp?.whatsappLink ? (
          <p className="text-sm text-emerald-100/75">
            WhatsApp notice{" "}
            {result.whatsapp.sent
              ? `sent (${result.whatsapp.method}).`
              : "opened in a new tab — tap Send if WhatsApp asks to confirm."}{" "}
            <a
              href={result.whatsapp.whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              Open WhatsApp again
            </a>
          </p>
        ) : null}
        <Link
          href="/open"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-lime-300 px-4 text-sm font-semibold text-emerald-950 transition hover:bg-lime-200"
        >
          Enter Limited free now
        </Link>
        <div className="rounded-lg bg-white/5 p-3 text-center text-xs">
          <div className="font-mono text-lg text-white">{result.stats.total}</div>
          people on the list
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="relative z-20 space-y-4 rounded-2xl border border-emerald-400/20 bg-[#0b2418]/75 p-6 text-emerald-50 shadow-[0_0_80px_-24px_rgba(16,185,129,0.55)]"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs tracking-[0.22em] text-lime-300/90 uppercase">
            {early ? "Early access" : "Optional"}
          </div>
          <h3 className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
            {early ? "Join the waiting list" : "Get product update notes"}
          </h3>
        </div>
        {stats ? (
          <div className="text-right text-xs text-emerald-100/70">
            <div className="font-mono text-sm text-lime-200">{stats.total} on the list</div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="wl-name" className="text-sm text-emerald-100">
            Name
          </label>
          <input
            id="wl-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="River Quill"
            className={fieldClass}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="wl-email" className="text-sm text-emerald-100">
            Email
          </label>
          <input
            id="wl-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@grove.dev"
            className={fieldClass}
            required
          />
        </div>
      </div>

      {early ? (
        <div className="space-y-1.5">
          <label htmlFor="wl-phone" className="text-sm text-emerald-100">
            Your phone / WhatsApp (optional)
          </label>
          <input
            id="wl-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+880…"
            className={fieldClass}
          />
        </div>
      ) : null}

      <fieldset className="space-y-2">
        <legend className="text-sm text-emerald-100">I&apos;m joining as</legend>
        <input type="hidden" name="interest" value={interest} />
        <div className="grid gap-2 sm:grid-cols-2">
          {INTERESTS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setInterest(item.id)}
              className={
                interest === item.id
                  ? "rounded-xl border border-lime-300/50 bg-lime-300/15 px-3 py-2 text-left"
                  : "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left hover:border-emerald-300/30"
              }
            >
              <div className="text-sm font-medium">{item.label}</div>
              <div className="text-xs text-emerald-100/65">{item.blurb}</div>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="space-y-1.5">
        <label htmlFor="wl-note" className="text-sm text-emerald-100">
          {early ? "Why early access? (optional)" : "What should we grow first? (optional)"}
        </label>
        <textarea
          id="wl-note"
          name="note"
          placeholder={
            early
              ? "Tell us what you want to try first — cascade, impact estimates, team memory…"
              : "Tell us about your team, workload, or the cascade behavior you want to stress-test…"
          }
          className={areaClass}
        />
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-lg bg-lime-300 px-4 text-sm font-semibold text-emerald-950 transition hover:bg-lime-200 disabled:opacity-60 sm:w-auto"
      >
        {busy ? "Submitting…" : early ? "Request early access" : "Get update notes"}
      </button>
      <p className="text-xs text-emerald-100/60">
        {early
          ? "Submitting notifies Eco Groot on WhatsApp (01852044051) with your details. Limited is also open free anytime."
          : "Optional updates only — the Limited product is already open to everyone."}
      </p>
    </form>
  );
}
