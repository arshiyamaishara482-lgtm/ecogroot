"use client";

import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import { HOW_IT_WORKS_FLOW } from "@/lib/marketing";

export function HowItWorksDiagram() {
  return (
    <div className="relative">
      <FadeIn>
        <p className="text-xs tracking-[0.22em] text-lime-300/90 uppercase">Request pipeline</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight text-emerald-50 md:text-4xl">
          From your question to a quieter answer
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-emerald-100/70 md:text-base">
          Every chat follows this path. Cascade-Verify, quantization, and Honey-style Eco skill
          are not separate products — they are stages in one flow.
        </p>
      </FadeIn>

      {/* Desktop / tablet horizontal-ish flow */}
      <div className="mt-10 hidden lg:block">
        <svg
          viewBox="0 0 1100 220"
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label="Eco Groot request flow diagram"
        >
          <defs>
            <linearGradient id="pipeGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#a3e635" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.2" />
            </linearGradient>
            <marker
              id="arrowHead"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill="#a3e635" />
            </marker>
          </defs>

          <rect
            x="20"
            y="95"
            width="1060"
            height="8"
            rx="4"
            fill="url(#pipeGlow)"
          />

          {HOW_IT_WORKS_FLOW.map((step, i) => {
            const x = 70 + i * 175;
            const y = i % 2 === 0 ? 40 : 130;
            const cy = 99;
            return (
              <g key={step.id}>
                <line
                  x1={x}
                  y1={cy}
                  x2={x}
                  y2={i % 2 === 0 ? y + 48 : y}
                  stroke="#34d399"
                  strokeWidth="1.5"
                  strokeOpacity="0.55"
                />
                <circle cx={x} cy={cy} r="7" fill="#a3e635" />
                <circle
                  cx={x}
                  cy={cy}
                  r="14"
                  fill="none"
                  stroke="#2dd4bf"
                  strokeWidth="1.2"
                  strokeOpacity="0.7"
                />
                {i < HOW_IT_WORKS_FLOW.length - 1 ? (
                  <line
                    x1={x + 18}
                    y1={cy}
                    x2={x + 157}
                    y2={cy}
                    stroke="#a3e635"
                    strokeWidth="1.5"
                    strokeOpacity="0.35"
                    markerEnd="url(#arrowHead)"
                  />
                ) : null}
                <foreignObject x={x - 72} y={y} width="144" height="72">
                  <div className="rounded-xl border border-emerald-200/20 bg-[#0c241a]/95 px-2.5 py-2 text-center shadow-lg backdrop-blur">
                    <div className="font-mono text-[10px] tracking-wider text-lime-300/90">
                      {step.id}
                    </div>
                    <div className="mt-0.5 text-[11px] leading-tight font-semibold text-emerald-50">
                      {step.title}
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stacked flow for smaller screens + detail cards for all */}
      <Stagger className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {HOW_IT_WORKS_FLOW.map((step, i) => (
          <StaggerItem key={step.id}>
            <article className="relative h-full rounded-2xl border border-emerald-200/15 bg-white/5 p-5 backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-lime-300/40 bg-lime-300/10 font-mono text-xs text-lime-200">
                  {step.id}
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-lg text-emerald-50">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-100/70">
                    {step.detail}
                  </p>
                  {i < HOW_IT_WORKS_FLOW.length - 1 ? (
                    <p className="mt-3 text-[11px] tracking-wide text-lime-300/70 uppercase md:hidden">
                      then ↓
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Branch callout */}
      <FadeIn delay={0.12} className="mt-8 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-lime-300/25 bg-lime-300/10 p-5">
          <div className="text-xs tracking-[0.18em] text-lime-200 uppercase">Judgy PASS</div>
          <p className="mt-2 text-sm leading-relaxed text-emerald-50/90">
            Keep the small-model answer. Debit the cheap path. Free quota and energy stay lower.
          </p>
        </div>
        <div className="rounded-2xl border border-teal-300/25 bg-teal-400/10 p-5">
          <div className="text-xs tracking-[0.18em] text-teal-200 uppercase">Judgy FAIL</div>
          <p className="mt-2 text-sm leading-relaxed text-emerald-50/90">
            Escalate to a larger free-tier model, return that answer, burn a bit more usage — only
            when the first try was not good enough.
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
