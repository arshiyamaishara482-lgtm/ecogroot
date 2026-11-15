"use client";

import { useEffect, useRef, useState } from "react";

type KeyPoint = {
  label: string;
  lat: number;
  lon: number;
  size: number;
};

/** Eco Groot mission nodes on the interactive wireframe globe */
const KEY_POINTS: KeyPoint[] = [
  { label: "AFFORDABILITY", lat: 32, lon: -48, size: 1.15 },
  { label: "ECO FRIENDLY", lat: 18, lon: 20, size: 1.05 },
  { label: "HIGHER USAGE", lat: -8, lon: -95, size: 1 },
  { label: "EFFICIENT", lat: 48, lon: 95, size: 0.95 },
  { label: "WATER", lat: -28, lon: -20, size: 1.05 },
  { label: "ENERGY", lat: 8, lon: 55, size: 1 },
  { label: "QUANTIZATION", lat: -38, lon: 75, size: 1 },
  { label: "HONEY STYLING", lat: 12, lon: 150, size: 1 },
  { label: "CASCADE VERIFICATION", lat: -18, lon: 125, size: 1.05 },
];

/** Always-visible interactive SVG globe (no WebGL / Three.js required). */
export function FallbackGlobe() {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef({
    dragging: false,
    lastX: 0,
    lastY: 0,
    rotY: 18,
    rotX: 14,
  });
  const [, setTick] = useState(0);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const state = dragRef.current;
    let raf = 0;
    let last = performance.now();

    const apply = () => {
      svg.style.transform = `rotateX(${state.rotX}deg) rotateY(${state.rotY}deg)`;
    };
    apply();

    const spin = (now: number) => {
      raf = requestAnimationFrame(spin);
      if (state.dragging) {
        last = now;
        return;
      }
      const dt = Math.min(32, now - last);
      last = now;
      state.rotY += dt * 0.012;
      apply();
    };
    raf = requestAnimationFrame(spin);

    const onDown = (e: PointerEvent) => {
      state.dragging = true;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      svg.setPointerCapture(e.pointerId);
      svg.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!state.dragging) return;
      state.rotY += (e.clientX - state.lastX) * 0.45;
      state.rotX = Math.max(
        -32,
        Math.min(32, state.rotX + (e.clientY - state.lastY) * 0.28),
      );
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      apply();
      setTick((n) => n + 1);
    };
    const onUp = (e: PointerEvent) => {
      state.dragging = false;
      try {
        svg.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
      svg.style.cursor = "grab";
    };

    svg.addEventListener("pointerdown", onDown);
    svg.addEventListener("pointermove", onMove);
    svg.addEventListener("pointerup", onUp);
    svg.addEventListener("pointercancel", onUp);
    return () => {
      cancelAnimationFrame(raf);
      svg.removeEventListener("pointerdown", onDown);
      svg.removeEventListener("pointermove", onMove);
      svg.removeEventListener("pointerup", onUp);
      svg.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div
      className="relative flex h-[min(58vw,380px)] w-full max-w-[400px] touch-none select-none items-center justify-center lg:h-[400px]"
      role="img"
      aria-label="Interactive Eco Groot globe — drag or swipe to rotate"
    >
      <div className="absolute inset-8 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(163,230,53,0.28),rgba(45,212,191,0.12)_42%,transparent_70%)] blur-xl" />
      <div className="absolute inset-[18%] rounded-full border border-teal-300/25 bg-emerald-950/50 shadow-[inset_0_0_60px_rgba(45,212,191,0.15)]" />
      <svg
        ref={svgRef}
        viewBox="0 0 400 400"
        className="relative z-10 h-[88%] w-[88%] cursor-grab text-teal-200"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(14deg) rotateY(18deg)",
          transition: "none",
          filter: "drop-shadow(0 0 18px rgba(45,212,191,0.35))",
        }}
      >
        <defs>
          <radialGradient id="eco-globe-core" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#064e3b" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#022c22" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#011911" stopOpacity="1" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="128" fill="url(#eco-globe-core)" />
        <circle
          cx="200"
          cy="200"
          r="128"
          fill="none"
          stroke="#5eead4"
          strokeWidth="2"
          opacity="0.85"
        />
        <ellipse
          cx="200"
          cy="200"
          rx="128"
          ry="52"
          fill="none"
          stroke="#a3e635"
          strokeWidth="1.4"
          opacity="0.55"
        />
        <ellipse
          cx="200"
          cy="200"
          rx="52"
          ry="128"
          fill="none"
          stroke="#2dd4bf"
          strokeWidth="1.4"
          opacity="0.5"
        />
        {[0, 30, 60, 90, 120, 150].map((deg) => (
          <ellipse
            key={deg}
            cx="200"
            cy="200"
            rx="128"
            ry="78"
            fill="none"
            stroke="#99f6e4"
            strokeWidth="1"
            opacity="0.32"
            transform={`rotate(${deg} 200 200)`}
          />
        ))}
        {[-60, -30, 0, 30, 60].map((lat) => (
          <ellipse
            key={`lat-${lat}`}
            cx="200"
            cy={200 - lat * 1.55}
            rx={Math.max(28, 128 * Math.cos((lat * Math.PI) / 180))}
            ry={14}
            fill="none"
            stroke="#6ee7b7"
            strokeWidth="0.9"
            opacity="0.4"
          />
        ))}
        {[
          [200, 58, "AFFORDABILITY"],
          [300, 100, "ECO FRIENDLY"],
          [330, 180, "HIGHER USAGE"],
          [280, 270, "EFFICIENT"],
          [200, 330, "WATER"],
          [110, 280, "ENERGY"],
          [70, 190, "QUANTIZATION"],
          [100, 110, "HONEY STYLING"],
          [220, 200, "CASCADE"],
        ].map(([x, y, label], i) => (
          <g key={String(label)}>
            <circle
              cx={Number(x)}
              cy={Number(y)}
              r={6 + (i % 3)}
              fill="#2dd4bf"
              opacity="1"
            />
            <circle
              cx={Number(x)}
              cy={Number(y)}
              r={14 + (i % 3)}
              fill="none"
              stroke="#a3e635"
              strokeWidth="1.4"
              opacity="0.75"
            />
            <text
              x={Number(x)}
              y={Number(y) - 18}
              textAnchor="middle"
              fill="#ecfdf5"
              fontSize={String(label).length > 12 ? "9" : "11"}
              fontFamily="ui-monospace, monospace"
              letterSpacing="0.06em"
              style={{ paintOrder: "stroke", stroke: "#064e3b", strokeWidth: 3 }}
            >
              {label}
            </text>
          </g>
        ))}
      </svg>
      <p className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 text-[10px] tracking-[0.16em] text-emerald-100/70 uppercase">
        Drag to explore · {KEY_POINTS.length} Eco Groot nodes
      </p>
    </div>
  );
}
