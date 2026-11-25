"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { HERO_LAYERS } from "@/content/site";
import type { HeroPhases } from "./engine/HeroScene";
import { resolveCanvasFonts } from "./engine/pen";
import { WebGLLayerStack } from "./engine/WebGLLayerStack";

export type LayerStackFrame = {
  t: number;
  phases: HeroPhases;
  mouse: { x: number; y: number };
  activeLayer: number;
  width: number;
  height: number;
  mobile: boolean;
  reducedMotion: boolean;
};

export type HeroLayerStackHandle = {
  update: (frame: LayerStackFrame) => void;
  refreshTextures: () => void;
};

/**
 * Hardware-accelerated WebGL2 layer stack (Koda → Struktura → Oblika → Izkušnja)
 * with trilinear mipmapping, up to 16× anisotropic texture filtering, MSAA, and
 * fwidth-antialiased borders — plus razor-sharp DOM leader labels & dimension bar.
 */
export const HeroLayerStack = forwardRef<HeroLayerStackHandle>(function HeroLayerStack(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stackRef = useRef<WebGLLayerStack | null>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelLineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const labelIndexRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const labelNameRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const dimBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const stack = new WebGLLayerStack(canvas, resolveCanvasFonts());
    stackRef.current = stack;
    return () => {
      stack.dispose();
      stackRef.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    refreshTextures() {
      stackRef.current?.refreshTextures();
    },
    update(frame) {
      const stack = stackRef.current;
      if (!stack || !stack.supported) return;

      stack.resize(frame.width, frame.height, frame.mobile);
      const { visible, labels, dimension } = stack.render(frame);

      for (let i = 0; i < 4; i++) {
        const el = labelRefs.current[i];
        if (!el) continue;
        const anchor = labels[i];
        if (!visible || !anchor || anchor.alpha < 0.01) {
          if (el.style.opacity !== "0") el.style.opacity = "0";
          continue;
        }
        const on = anchor.highlight;
        el.style.opacity = (anchor.alpha * (0.68 + on * 0.32)).toFixed(3);
        el.style.transform = `translate3d(${(anchor.x - 10).toFixed(2)}px, ${anchor.y.toFixed(2)}px, 0) translate3d(-100%, -50%, 0)`;

        const color = on > 0.5 ? "#F5751E" : "#FFFFFF";
        const lineEl = labelLineRefs.current[i];
        const idxEl = labelIndexRefs.current[i];
        const nameEl = labelNameRefs.current[i];
        if (lineEl) lineEl.style.backgroundColor = color;
        if (idxEl) idxEl.style.color = color;
        if (nameEl) {
          nameEl.style.opacity = on.toFixed(3);
          nameEl.style.transform = `translate3d(${((1 - on) * 8).toFixed(2)}px, 0, 0)`;
        }
      }

      const dimEl = dimBarRef.current;
      if (dimEl) {
        if (!visible || dimension.alpha < 0.01) {
          if (dimEl.style.opacity !== "0") dimEl.style.opacity = "0";
        } else {
          const len = Math.hypot(dimension.x1 - dimension.x0, dimension.y1 - dimension.y0);
          const midX = (dimension.x0 + dimension.x1) / 2;
          const midY = (dimension.y0 + dimension.y1) / 2;
          dimEl.style.opacity = dimension.alpha.toFixed(3);
          dimEl.style.width = `${len.toFixed(1)}px`;
          dimEl.style.transform = `translate3d(${midX.toFixed(2)}px, ${midY.toFixed(2)}px, 0) translate3d(-50%, -50%, 0) rotate(${dimension.angleDeg.toFixed(2)}deg)`;
        }
      }
    },
  }));

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 block size-full" />

      {/* Crisp native DOM leader callouts ("KODA 01 ——") anchored to each plane's left edge */}
      {HERO_LAYERS.map((layer, i) => (
        <div
          key={layer.label}
          ref={(el) => {
            labelRefs.current[i] = el;
          }}
          className="pointer-events-none absolute top-0 left-0 hidden items-center justify-end gap-2.5 font-mono text-[10.5px] tracking-[0.16em] whitespace-nowrap will-change-transform nav:flex"
          style={{ opacity: 0 }}
        >
          <span
            ref={(el) => {
              labelNameRefs.current[i] = el;
            }}
            className="font-semibold text-white"
            style={{ opacity: 0 }}
          >
            {layer.label}
          </span>
          <span
            ref={(el) => {
              labelIndexRefs.current[i] = el;
            }}
            className="font-semibold tabular-nums"
          >
            0{i + 1}
          </span>
          <span
            ref={(el) => {
              labelLineRefs.current[i] = el;
            }}
            className="inline-block h-px w-7 bg-white"
          />
        </div>
      ))}

      {/* Layer 02 outer architectural dimension callout ("1440 PX") */}
      <div
        ref={dimBarRef}
        className="pointer-events-none absolute top-0 left-0 flex items-center will-change-transform"
        style={{ opacity: 0 }}
      >
        <span className="h-2.5 w-px bg-brand/85" />
        <span className="h-px flex-1 bg-brand/80" />
        <span className="px-2.5 font-mono text-[10px] font-semibold tracking-[0.16em] text-brand">
          1440 PX
        </span>
        <span className="h-px flex-1 bg-brand/80" />
        <span className="h-2.5 w-px bg-brand/85" />
      </div>
    </div>
  );
});
