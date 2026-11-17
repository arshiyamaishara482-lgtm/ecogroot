# Eco Groot (Eco AI)

Hosting-ready **Open Limited** credit-wallet product with **Cascade-Verify**. Nature-themed marketing demo — not production multi-tenant auth, and **not** free ChatGPT/OpenAI tokens.

Live reference: [https://ecogroot.netlify.app/](https://ecogroot.netlify.app/)

**Limited is open to everyone** — no invite wall. Cascade-Verify prefers **free-tier model APIs** and keeps easy chats on the small path so free quota stretches further than always-large usage.

## Cascade-Verify + Judgy (correct order — do not reorder)

1. **Small free model answers first** (always).
2. **Judgy** scores that **answer** (local hybrid heuristic — **not** a third LLM) → PASS / FAIL + reason. A cheap difficulty hint from the question only tunes the PASS bar.
3. **Escalate to a larger free model only on FAIL**.

Cheap path (PASS) costs fewer credits than escalate. **Cascade save rate** = cheap-path chats ÷ total chats.

## Plans (marketing / wallet floors)

| Plan   | Price   | Starting credits | Notes |
|--------|---------|------------------|--------|
| Free   | $0      | 500k             | Open Limited + free cascade |
| Pro    | $8/mo   | 5M               | WIP — upgrades hard-blocked |
| Master | $15/mo  | 25M              | WIP — upgrades hard-blocked |

Paid Pro/Master stay closed while Open Limited is WIP (`PAID_PLANS_OPEN = false`).

## Run locally

Requires **Node.js 20+**.

```bash
npm install
npm run dev
```

Open [http://localhost:43127](http://localhost:43127).

Optional API keys: copy `.env.example` → `.env.local`, or paste keys in **`/app/settings`**. Without keys, Pollinations public free API is tried, then a local mock fallback.

Demo data lives in `.data/store.json` (gitignored). Delete it to reset.

**Waiting list** (`/waiting-list`): each signup can notify WhatsApp **01234567890** (prefilled `wa.me`; optional auto-send via CallMeBot / Twilio / webhook — see `.env.example`).

## Deploy

### Netlify (matches live site)

1. Push this folder to a Git repo (or drag-drop the zip contents).
2. New site → import repo (or Netlify Drop for static is **not** enough — use Next runtime).
3. Build command: `npm run build`
4. This repo includes `netlify.toml` with `@netlify/plugin-nextjs`.
5. Add env vars from `.env.example` in Netlify → Site settings → Environment variables (optional keys).
6. Deploy. Custom domain optional.

CLI alternative:

```bash
npm install -g netlify-cli
netlify login
netlify init   # or: netlify link
netlify deploy --build --prod
```

### Vercel

1. Import the Git repo at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Next.js** (defaults are fine — no `vercel.json` required).
3. Add the same env vars from `.env.example`.
4. Deploy.

```bash
npm install -g vercel
vercel          # preview
vercel --prod   # production
```

## Free model cascade order

1. **Groq** — if `GROQ_API_KEY`
2. **Gemini** — if `GEMINI_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY`
3. **OpenRouter** `:free` — if `OPENROUTER_API_KEY`
4. **Pollinations** — no key
5. **Local mock** — always

## Architecture (short)

```
Browser
  /                 marketing + open Limited entry
  /waiting-list     early-access form → WhatsApp notify (01234567890)
  /judgy            Judgy explainer
  /login            open session (no invite)
  /app/*            product (wallet, chat, plans, video, settings)

API
  POST /api/waitlist    waiting list + WhatsApp notify
  POST /api/session     open Limited session
  POST /api/session/enter  progressive-enhancement form enter
  POST /api/chat        Cascade-Verify + debit
  POST /api/plans       refused for Pro/Master while WIP
  POST /api/memory      notes / pins
  POST /api/video       blocked while Pro/Master WIP

Persistence
  .data/store.json
```

Stack: Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui (base-nova / `@base-ui/react`).

## What is mocked / stubbed

- Judgy (local hybrid; not a third grading LLM)
- WhatsApp waitlist notify (`wa.me` always; auto-send needs optional keys)
- Impact estimates
- Video stubs (Pro/Master blocked while WIP)
- Billing / paid upgrades
- Cookie session auth (demo)
- Model text falls back to local mock if free providers fail

## Submission notes

- Source was reconstructed from a cloud-agent transcript; Origin git export was unavailable.
- Binary `public/` assets (favicon/SVGs) were not in the text dump — Next still builds; add branding assets if the host requires them.
- Do **not** reorder Cascade-Verify in `src/lib/cascade.ts` / `src/lib/judgy.ts` / `src/lib/mock-models.ts`.
