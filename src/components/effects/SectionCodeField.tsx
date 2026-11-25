"use client";

import { useEffect, useRef } from "react";
import { BRAND, createLayer, Pen, resolveCanvasFonts, TAU } from "@/components/sections/hero/engine/pen";
import { paintCode } from "@/components/sections/hero/engine/textures/code";
import { useFrame } from "@/hooks/useFrame";
import { useInViewport } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { usePointer } from "@/hooks/usePointer";
import { approach } from "@/lib/math";

type SectionCodeFieldProps = {
  tone: "dark" | "light";
};

/**
 * Interactive cursor-tracking X-ray code backdrop for every section below Hero.
 * Viewport-gated so off-screen sections cost zero CPU, letting all content float
 * cleanly above live source code without blurry glow gradients.
 */
export function SectionCodeField({ tone }: SectionCodeFieldProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visible = useInViewport(hostRef);
  const pointer = usePointer();
  const reducedMotion = useReducedMotion();

  const state = useRef({
    width: 0,
    height: 0,
    dpr: 1,
    codeCanvas: null as HTMLCanvasElement | null,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 0,
    initialized: false,
    startedAt: null as number | null,
  });

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const rebuild = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, w < 900 ? 1.25 : 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      // Paint reusable tiled code pattern sized to a single viewport height (capped for fast memory).
      const tileH = Math.min(h, Math.max(960, window.innerHeight * 1.2));
      const fonts = resolveCanvasFonts();
      const layer = createLayer(w, tileH, dpr);
      paintCode(new Pen(layer.ctx, fonts), w, tileH, tone);

      const s = state.current;
      s.width = w;
      s.height = h;
      s.dpr = dpr;
      s.codeCanvas = layer.canvas;
      if (!s.initialized) {
        s.x = w * 0.5;
        s.y = Math.min(h * 0.35, 360);
        s.initialized = true;
      }
    };

    rebuild();
    const observer = new ResizeObserver(rebuild);
    observer.observe(host);

    let disposed = false;
    document.fonts.ready.then(() => {
      if (!disposed) rebuild();
    });

    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, [tone]);

  useFrame((now) => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const s = state.current;
    if (!host || !canvas || !s.codeCanvas || !s.width || !s.height) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    s.startedAt ??= now;
    const t = (now - s.startedAt) / 1000;
    const rect = host.getBoundingClientRect();
    const mobile = s.width < 900;

    // Check if the cursor is currently over this section (with generous vertical margin).
    const localX = pointer.x - rect.left;
    const localY = pointer.y - rect.top;
    const pointerInside =
      pointer.active &&
      !mobile &&
      localX >= -140 &&
      localX <= s.width + 140 &&
      localY >= -140 &&
      localY <= s.height + 140;

    const targetRadius = reducedMotion
      ? 0
      : pointerInside
        ? Math.min(s.width, window.innerHeight) * 0.22
        : mobile
          ? Math.min(s.width * 0.24, 115)
          : 0;

    let targetX = s.x;
    let targetY = s.y;
    if (pointerInside) {
      targetX = localX;
      targetY = localY;
    } else if (mobile && !reducedMotion) {
      const viewCenterY = Math.max(120, Math.min(s.height - 120, -rect.top + window.innerHeight * 0.5));
      targetX = s.width * 0.5 + s.width * 0.24 * Math.sin(t * 0.42);
      targetY = viewCenterY + 70 * Math.cos(t * 0.34);
    }

    const prevX = s.x;
    const prevY = s.y;
    s.x = approach(s.x, targetX, 0.085);
    s.y = approach(s.y, targetY, 0.085);
    s.vx = approach(s.vx, s.x - prevX, 0.2);
    s.vy = approach(s.vy, s.y - prevY, 0.2);
    s.radius = approach(s.radius, targetRadius, 0.085);

    ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
    ctx.clearRect(0, 0, s.width, s.height);

    if (s.radius < 2) return;

    const speed = Math.hypot(s.vx, s.vy);
    const heading = Math.atan2(s.vy, s.vx);
    const stretch = Math.min(0.32, speed * 0.012);
    const radius = s.radius;

    const blobPath = () => {
      ctx.beginPath();
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * TAU;
        const along = Math.cos(theta - heading);
        const wobble =
          0.038 * Math.sin(3 * theta + t * 0.85) + 0.022 * Math.sin(5 * theta - t * 1.3);
        const rr = radius * (1 + wobble) * (1 + stretch * along * along) * (1 - stretch * 0.32);
        const px = s.x + Math.cos(theta) * rr;
        const py = s.y + Math.sin(theta) * rr;
        if (i) ctx.lineTo(px, py);
        else ctx.moveTo(px, py);
      }
      ctx.closePath();
    };

    // Draw tiled code inside clipped organic lens so content floats cleanly above it.
    ctx.save();
    blobPath();
    ctx.clip();

    const tileH = s.codeCanvas.height / s.dpr;
    const parallaxX = -(s.x - s.width / 2) * 0.035;
    const firstTile = Math.floor((s.y - radius * 1.5) / tileH) * tileH;
    const lastY = s.y + radius * 1.5;
    for (let ty = firstTile; ty < lastY; ty += tileH) {
      ctx.drawImage(s.codeCanvas, parallaxX, ty, s.width, tileH);
    }

    // Balanced veil keeps code crisp in open margins while floating cards preserve 100% text contrast.
    ctx.fillStyle = tone === "light" ? "rgba(244,241,236,0.34)" : "rgba(8,8,12,0.56)";
    ctx.fillRect(s.x - radius * 1.6, s.y - radius * 1.6, radius * 3.2, radius * 3.2);
    ctx.restore();

    // Precision architectural lens ring
    ctx.lineWidth = 1;
    ctx.strokeStyle = tone === "light" ? "rgba(245,117,30,0.48)" : "rgba(245,117,30,0.52)";
    blobPath();
    ctx.stroke();

    // Rotating engineering dial ticks
    const rotation = t * 0.075;
    const dialRadius = radius * 1.07;
    ctx.strokeStyle = tone === "light" ? "rgba(11,11,12,0.16)" : "rgba(255,255,255,0.18)";
    ctx.beginPath();
    for (let i = 0; i < 60; i++) {
      const theta = (i / 60) * TAU + rotation;
      const len = i % 5 ? 3.5 : 8;
      ctx.moveTo(s.x + Math.cos(theta) * dialRadius, s.y + Math.sin(theta) * dialRadius);
      ctx.lineTo(
        s.x + Math.cos(theta) * (dialRadius + len),
        s.y + Math.sin(theta) * (dialRadius + len),
      );
    }
    ctx.stroke();

    if (speed > 0.35) {
      ctx.strokeStyle = BRAND;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(s.x, s.y, dialRadius + 4, heading - 0.12, heading + 0.12);
      ctx.stroke();
    }
  }, visible);

  return (
    <div ref={hostRef} aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <canvas ref={canvasRef} className="block size-full" />
    </div>
  );
}
