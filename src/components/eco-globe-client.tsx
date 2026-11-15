"use client";

import dynamic from "next/dynamic";
import { FallbackGlobe } from "@/components/fallback-globe";

/**
 * Prefer the real Three.js WebGL globe. While the chunk loads, show the SVG
 * stand-in so the hero never looks empty. EcoGlobe itself falls back to SVG
 * if WebGL fails.
 */
const EcoGlobe3D = dynamic(
  () => import("@/components/eco-globe").then((m) => m.EcoGlobe),
  {
    ssr: false,
    loading: () => <FallbackGlobe />,
  },
);

export function EcoGlobeClient() {
  return <EcoGlobe3D />;
}
