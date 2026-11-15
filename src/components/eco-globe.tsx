"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

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

const TEAL = 0x2dd4bf;
const EMERALD = 0x34d399;
const LIME = 0xa3e635;

function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function makeLabelTexture(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const fontSize = text.length > 14 ? 32 : text.length > 11 ? 36 : 42;
  ctx.font = `600 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillStyle = "rgba(167, 243, 208, 0.95)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(45, 212, 191, 0.55)";
  ctx.shadowBlur = 12;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function FallbackGlobe() {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef({
    dragging: false,
    lastX: 0,
    lastY: 0,
    rotY: 0,
    rotX: 12,
  });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const state = dragRef.current;

    const onDown = (e: PointerEvent) => {
      state.dragging = true;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      svg.setPointerCapture(e.pointerId);
      svg.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!state.dragging) return;
      state.rotY += (e.clientX - state.lastX) * 0.4;
      state.rotX = Math.max(
        -28,
        Math.min(28, state.rotX + (e.clientY - state.lastY) * 0.25),
      );
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      svg.style.transform = `rotateX(${state.rotX}deg) rotateY(${state.rotY}deg)`;
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
      svg.removeEventListener("pointerdown", onDown);
      svg.removeEventListener("pointermove", onMove);
      svg.removeEventListener("pointerup", onUp);
      svg.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div
      className="relative flex h-[min(72vw,520px)] w-full max-w-[560px] touch-none select-none items-center justify-center lg:h-[560px]"
      role="img"
      aria-label="Interactive Eco Groot globe — drag or swipe to rotate"
    >
      <div className="absolute inset-10 rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.2),transparent_70%)] blur-2xl" />
      <svg
        ref={svgRef}
        viewBox="0 0 400 400"
        className="relative h-[85%] w-[85%] cursor-grab text-teal-300/80"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(12deg) rotateY(0deg)",
          transition: "none",
        }}
      >
        <circle cx="200" cy="200" r="120" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
        <ellipse cx="200" cy="200" rx="120" ry="48" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
        <ellipse cx="200" cy="200" rx="48" ry="120" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
        {[0, 45, 90, 135].map((deg) => (
          <ellipse
            key={deg}
            cx="200"
            cy="200"
            rx="120"
            ry="70"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            opacity="0.28"
            transform={`rotate(${deg} 200 200)`}
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
          [220, 200, "CASCADE VERIFICATION"],
        ].map(([x, y, label], i) => (
          <g key={String(label)}>
            <circle cx={Number(x)} cy={Number(y)} r={5 + (i % 3)} fill="#2dd4bf" opacity="0.9" />
            <circle cx={Number(x)} cy={Number(y)} r={12 + (i % 3)} fill="none" stroke="#a3e635" strokeWidth="1" opacity="0.55" />
            <text
              x={Number(x)}
              y={Number(y) - 16}
              textAnchor="middle"
              fill="#a7f3d0"
              fontSize={String(label).length > 14 ? "8" : "10"}
              fontFamily="ui-monospace, monospace"
              letterSpacing="0.06em"
            >
              {label}
            </text>
          </g>
        ))}
      </svg>
      <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.16em] text-emerald-100/45 uppercase">
        Drag to explore
      </p>
    </div>
  );
}

export function EcoGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
      });
    } catch {
      setUseFallback(true);
      return;
    }

    if (!renderer.getContext()) {
      renderer.dispose();
      setUseFallback(true);
      return;
    }

    const width = mount.clientWidth || 560;
    const height = mount.clientHeight || 560;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.15, 5.2);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const root = new THREE.Group();
    scene.add(root);

    scene.add(new THREE.AmbientLight(0xb7f7d0, 0.55));
    const keyLight = new THREE.PointLight(EMERALD, 1.4, 20);
    keyLight.position.set(3, 2, 4);
    scene.add(keyLight);
    const rim = new THREE.PointLight(LIME, 0.7, 18);
    rim.position.set(-3, -1, -2);
    scene.add(rim);

    const globeRadius = 1.55;

    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(globeRadius, 2),
      new THREE.MeshBasicMaterial({ color: TEAL, wireframe: true, transparent: true, opacity: 0.55 }),
    );
    root.add(wire);

    const fine = new THREE.Mesh(
      new THREE.IcosahedronGeometry(globeRadius * 0.985, 3),
      new THREE.MeshBasicMaterial({ color: EMERALD, wireframe: true, transparent: true, opacity: 0.18 }),
    );
    root.add(fine);

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(globeRadius * 0.92, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x052e1f, transparent: true, opacity: 0.35 }),
    );
    root.add(core);

    const aura = new THREE.Mesh(
      new THREE.SphereGeometry(globeRadius * 1.08, 32, 32),
      new THREE.MeshBasicMaterial({ color: EMERALD, transparent: true, opacity: 0.07, side: THREE.BackSide }),
    );
    root.add(aura);

    const equator = new THREE.Mesh(
      new THREE.TorusGeometry(globeRadius * 1.02, 0.008, 8, 128),
      new THREE.MeshBasicMaterial({ color: LIME, transparent: true, opacity: 0.35 }),
    );
    equator.rotation.x = Math.PI / 2;
    root.add(equator);

    const nodeGroup = new THREE.Group();
    root.add(nodeGroup);

    const nodeMat = new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.95 });
    const ringMat = new THREE.MeshBasicMaterial({ color: LIME, transparent: true, opacity: 0.65, side: THREE.DoubleSide });
    const lineMat = new THREE.LineBasicMaterial({ color: EMERALD, transparent: true, opacity: 0.45 });

    const sprites: THREE.Sprite[] = [];

    for (const point of KEY_POINTS) {
      const surface = latLonToVector3(point.lat, point.lon, globeRadius);
      const outer = surface.clone().multiplyScalar(1.28 + point.size * 0.08);

      const node = new THREE.Mesh(new THREE.SphereGeometry(0.045 * point.size, 16, 16), nodeMat);
      node.position.copy(outer);
      nodeGroup.add(node);

      const ring = new THREE.Mesh(new THREE.RingGeometry(0.09 * point.size, 0.11 * point.size, 32), ringMat);
      ring.position.copy(outer);
      ring.lookAt(0, 0, 0);
      nodeGroup.add(ring);

      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.14 * point.size, 0.006, 8, 48),
        new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.4 }),
      );
      halo.position.copy(outer);
      halo.lookAt(0, 0, 0);
      halo.rotateX(Math.PI / 2.6);
      nodeGroup.add(halo);

      const tether = new THREE.BufferGeometry().setFromPoints([surface, outer]);
      nodeGroup.add(new THREE.Line(tether, lineMat));

      const label = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: makeLabelTexture(point.label),
          transparent: true,
          depthWrite: false,
        }),
      );
      label.position.copy(outer.clone().multiplyScalar(1.12));
      const labelWidth = point.label.length > 14 ? 1.25 : point.label.length > 11 ? 1.1 : 0.95;
      label.userData.labelWidth = labelWidth;
      label.scale.set(labelWidth, 0.24, 1);
      nodeGroup.add(label);
      sprites.push(label);
    }

    const particleCount = 48;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = globeRadius * (1.35 + Math.random() * 0.9);
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.cos(phi);
      particlePositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const particles = new THREE.Points(
      new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(particlePositions, 3)),
      new THREE.PointsMaterial({ color: LIME, size: 0.03, transparent: true, opacity: 0.55, sizeAttenuation: true }),
    );
    root.add(particles);

    let raf = 0;
    const start = performance.now();

    // Interactive drag state (mouse + touch)
    let rotY = 0;
    let rotX = 0.08;
    let velY = reducedMotion ? 0.04 : 0.18;
    let velX = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let lastMoveAt = 0;
    let autoSpin = !reducedMotion;

    const canvas = renderer.domElement;
    canvas.style.touchAction = "none";
    canvas.style.cursor = "grab";
    canvas.style.userSelect = "none";
    canvas.setAttribute("aria-label", "Interactive Eco Groot globe — drag to rotate");
    canvas.setAttribute("role", "img");

    const getPoint = (e: PointerEvent) => ({ x: e.clientX, y: e.clientY });

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      autoSpin = false;
      canvas.setPointerCapture(e.pointerId);
      const p = getPoint(e);
      lastX = p.x;
      lastY = p.y;
      lastMoveAt = performance.now();
      velY = 0;
      velX = 0;
      canvas.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const p = getPoint(e);
      const now = performance.now();
      const dt = Math.max(8, now - lastMoveAt);
      const dx = p.x - lastX;
      const dy = p.y - lastY;
      // Sensitivity scales with viewport so desktop/mobile feel similar
      const sens = 0.005;
      rotY += dx * sens;
      rotX += dy * sens;
      rotX = Math.max(-1.1, Math.min(1.1, rotX));
      velY = (dx * sens) / (dt / 16);
      velX = (dy * sens) / (dt / 16);
      lastX = p.x;
      lastY = p.y;
      lastMoveAt = now;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      canvas.style.cursor = "grab";
      // If almost still, ease back into gentle auto-spin
      if (Math.abs(velY) < 0.002 && Math.abs(velX) < 0.002 && !reducedMotion) {
        autoSpin = true;
        velY = 0.18;
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    const onPointerLeave = (e: PointerEvent) => {
      if (dragging) onPointerUp(e);
    };
    canvas.addEventListener("pointerleave", onPointerLeave);

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = (performance.now() - start) / 1000;

      if (!dragging) {
        if (autoSpin && !reducedMotion) {
          // Blend toward a steady auto-spin on Y
          velY += (0.18 - velY) * 0.02;
          velX *= 0.95;
        } else {
          // Inertia after drag
          velY *= 0.95;
          velX *= 0.92;
          if (Math.abs(velY) < 0.0008) velY = 0;
          if (Math.abs(velX) < 0.0008) velX = 0;
          if (
            !reducedMotion &&
            velY === 0 &&
            velX === 0 &&
            performance.now() - lastMoveAt > 1800
          ) {
            autoSpin = true;
            velY = 0.18;
          }
        }
        rotY += velY * 0.016;
        rotX += velX * 0.016;
        rotX = Math.max(-1.1, Math.min(1.1, rotX));
      }

      root.rotation.y = rotY;
      root.rotation.x = rotX + (autoSpin && !dragging ? Math.sin(t * 0.15) * 0.04 : 0);
      particles.rotation.y = -rotY * 0.35;
      aura.scale.setScalar(1 + Math.sin(t * 0.8) * 0.015);

      for (let i = 0; i < sprites.length; i++) {
        const sprite = sprites[i];
        if (!sprite) continue;
        const baseW = sprite.userData.labelWidth ?? 0.95;
        const pulse = 1 + Math.sin(t * 1.6 + i) * 0.03;
        sprite.scale.set(baseW * pulse, 0.24 * pulse, 1);
      }

      try {
        renderer.render(scene, camera);
      } catch {
        cancelAnimationFrame(raf);
        setUseFallback(true);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      renderer.dispose();
      wire.geometry.dispose();
      fine.geometry.dispose();
      core.geometry.dispose();
      aura.geometry.dispose();
      equator.geometry.dispose();
      particles.geometry.dispose();
      (particles.material as THREE.Material).dispose();
      nodeMat.dispose();
      ringMat.dispose();
      lineMat.dispose();
      for (const sprite of sprites) {
        const mat = sprite.material as THREE.SpriteMaterial;
        mat.map?.dispose();
        mat.dispose();
      }
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (useFallback) return <FallbackGlobe />;

  return (
    <div
      ref={mountRef}
      className="eco-globe relative h-[min(58vw,380px)] w-full max-w-[400px] touch-none select-none lg:h-[400px]"
      role="img"
      aria-label="Interactive Eco Groot globe — drag or swipe to rotate"
    >
      <div className="pointer-events-none absolute inset-8 rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.18),transparent_68%)] blur-2xl" />
      <p className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 text-[10px] tracking-[0.16em] text-emerald-100/45 uppercase">
        Drag to explore
      </p>
    </div>
  );
}
