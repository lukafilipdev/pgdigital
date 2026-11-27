"use client";

import Image from "next/image";
import { useEffect, useRef, type RefObject } from "react";
import { useIntro } from "@/components/intro/IntroProvider";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  EyeIcon,
  SparkIcon,
} from "@/components/ui/Icons";
import { Kicker } from "@/components/ui/Kicker";
import { HERO_LAYERS, PROJECTS, projectScreenshot } from "@/content/site";
import { useFrame } from "@/hooks/useFrame";
import { useInViewport } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { usePointer } from "@/hooks/usePointer";
import { approach, clamp, easeOutQuart, padNumber, smoothstep } from "@/lib/math";
import { getPinProgress } from "@/lib/scroll";
import { HeroScene, type HeroPhases } from "./engine/HeroScene";
import type { LensState } from "./engine/lens";
import { resolveCanvasFonts } from "./engine/pen";
import { HeroLayerStack, type HeroLayerStackHandle } from "./HeroLayerStack";

/**
 * Scroll timeline of the pinned hero, as fractions of its pinned distance.
 *
 *  message → deconstruction → koda → struktura → oblika → izkušnja
 *  → merge → result (hold) → clean handoff into O nas
 */
const TIMELINE = {
  /** Headline separates; its baselines become guides; the mesh lies down. */
  open: [0.02, 0.12],
  /** When each layer starts landing on the stack. */
  layers: [0.1, 0.21, 0.33, 0.45],
  /** How long a layer takes to land. */
  arrival: 0.055,
  /** Code is typed into the first layer. */
  code: [0.12, 0.21],
  /** Layers align, merge and the site turns to face the viewer. */
  merge: [0.54, 0.63],
  /** Finished site recedes softly right as O nas materializes directly over it. */
  outro: [0.69, 0.86],
  /** Final phase placeholder for HeroScene interface compatibility. */
  digitize: [0.72, 0.9],
} as const;

/** After this long without pointer movement the lens starts wandering. */
const IDLE_AFTER_MS = 3800;

type Simulation = {
  startedAt: number | null;
  progress: number;
  mouse: { x: number; y: number };
  lens: LensState;
  lensRadius: number;
  pressed: boolean;
  pulse: number;
  /** Layer whose caption is shown. */
  captionLayer: number;
  /** Baseline of each visible headline line, relative to the stage. */
  baselines: number[];
};

const range = (P: number, [from, to]: readonly [number, number]) => smoothstep(from, to, P);

/**
 * Pinned, scroll-driven hero: full-width auto-fitted editorial typography with
 * live X-ray wireframe & spec lens synced to the underlying 3D spring mesh and
 * source-code canvas, transitioning smoothly into the 4-layer build and O nas.
 */
export function Hero() {
  const { startedAt: introStartedAt } = useIntro();
  const reducedMotion = useReducedMotion();
  const pointer = usePointer();

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const introWrapRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const coordRef = useRef<HTMLSpanElement>(null);
  const headWrapRef = useRef<HTMLDivElement>(null);
  const solidDesktopRef = useRef<HTMLHeadingElement>(null);
  const solidMobileRef = useRef<HTMLHeadingElement>(null);
  const xrayDesktopRef = useRef<HTMLDivElement>(null);
  const xrayMobileRef = useRef<HTMLDivElement>(null);
  const desktopActionsRef = useRef<HTMLDivElement>(null);
  const mobileActionsRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const ruleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const captionRef = useRef<HTMLDivElement>(null);
  const captionSpecRef = useRef<HTMLSpanElement>(null);
  const captionNameRef = useRef<HTMLDivElement>(null);
  const captionTextRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);

  const visible = useInViewport(sectionRef);
  const sceneRef = useRef<HeroScene | null>(null);
  const layerStackRef = useRef<HeroLayerStackHandle>(null);
  const sim = useRef<Simulation>({
    startedAt: null,
    progress: 0,
    mouse: { x: 0, y: 0 },
    lens: { x: 0, y: 0, vx: 0, vy: 0 },
    lensRadius: 0,
    pressed: false,
    pulse: 0,
    captionLayer: -1,
    baselines: [],
  });

  useEffect(() => {
    const stage = stageRef.current!;
    const scene = new HeroScene(canvasRef.current!, resolveCanvasFonts());
    sceneRef.current = scene;

    const fitHeadlines = () => {
      const wrap = headWrapRef.current;
      if (!wrap) return;
      const W = wrap.clientWidth;
      const H = stage.clientHeight;
      if (!W || !H) return;

      const isMobile = stage.clientWidth < 900;
      const solidRoot = isMobile ? solidMobileRef.current : solidDesktopRef.current;
      const xrayRoot = isMobile ? xrayMobileRef.current : xrayDesktopRef.current;
      if (!solidRoot || !xrayRoot) return;

      const solidLines = Array.from(solidRoot.querySelectorAll<HTMLElement>("[data-fit]"));
      const xrayLines = Array.from(xrayRoot.querySelectorAll<HTMLElement>("[data-fit]"));
      if (!solidLines.length) return;

      // Measure each line at 100px to compute exact width-filling font sizes.
      const rawSizes = solidLines.map((el) => {
        el.style.fontSize = "100px";
        const measured = el.offsetWidth || 1;
        const ratio = parseFloat(el.dataset.fit || "1");
        return (100 * W * ratio) / measured;
      });

      // Keep total headline height comfortably inside the viewport on short screens and iOS Safari.
      const maxHeadHeight = isMobile ? Math.max(195, H - 310) : Math.max(240, H - 270);
      const totalHeight = rawSizes.reduce((acc, px) => acc + px * 0.92, 0);
      const scale = totalHeight > maxHeadHeight ? maxHeadHeight / totalHeight : 1;
      const finalSizes = rawSizes.map((px) => Math.max(22, px * scale));

      solidLines.forEach((el, i) => {
        el.style.fontSize = `${finalSizes[i].toFixed(2)}px`;
      });
      xrayLines.forEach((el, i) => {
        if (finalSizes[i] != null) el.style.fontSize = `${finalSizes[i].toFixed(2)}px`;
      });

      xrayRoot.querySelectorAll<HTMLElement>("[data-size]").forEach((badge) => {
        const idx = Number(badge.dataset.size);
        badge.textContent = `${Math.round(finalSizes[idx] || 0)}PX`;
      });

      // Measure baselines for scroll-split horizontal guides.
      const stageTop = stage.getBoundingClientRect().top;
      sim.current.baselines = solidLines.map((el) => {
        const rect = el.getBoundingClientRect();
        const fs = finalSizes[solidLines.indexOf(el)] || 60;
        return rect.bottom - stageTop - fs * 0.16;
      });
    };

    const resize = () => {
      scene.resize(stage.clientWidth, stage.clientHeight);
      fitHeadlines();
    };
    resize();
    Object.assign(sim.current.lens, { x: scene.width * 0.58, y: scene.height * 0.45 });

    const observer = new ResizeObserver(resize);
    observer.observe(stage);

    let disposed = false;
    document.fonts.ready.then(() => {
      if (disposed) return;
      scene.refreshTextures();
      layerStackRef.current?.refreshTextures();
      fitHeadlines();
    });

    // Press-and-hold anywhere on the hero stage (outside links/buttons) to expand the X-ray lens.
    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!stage.contains(target) || target?.closest("a, button")) return;
      sim.current.pulse = 1;
      if (e.pointerType === "touch") {
        clearTimeout(holdTimer);
        holdTimer = setTimeout(() => {
          sim.current.pressed = true;
        }, 280);
      } else {
        sim.current.pressed = true;
      }
    };
    const onPointerUp = () => {
      clearTimeout(holdTimer);
      sim.current.pressed = false;
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });

    return () => {
      disposed = true;
      clearTimeout(holdTimer);
      observer.disconnect();
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      sceneRef.current = null;
    };
  }, []);

  useFrame((now) => {
    const scene = sceneRef.current;
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!scene || !section || !stage) return;

    const s = sim.current;
    s.startedAt ??= now;
    const t = (now - s.startedAt) / 1000;
    const introT = introStartedAt == null ? -1 : (now - introStartedAt) / 1000;
    const { width: W, height: H } = scene;

    // Scroll progress through the pinned section, smoothed.
    const target = getPinProgress(section);
    s.progress = reducedMotion ? target : approach(s.progress, target, 0.09);
    const P = s.progress;

    const layers = TIMELINE.layers.map((start) => smoothstep(start, start + TIMELINE.arrival, P));
    const phases: HeroPhases = {
      open: range(P, TIMELINE.open),
      layers,
      build: smoothstep(TIMELINE.layers[0], TIMELINE.merge[0], P),
      code: range(P, TIMELINE.code),
      merge: range(P, TIMELINE.merge),
      outro: range(P, TIMELINE.outro),
      digitize: range(P, TIMELINE.digitize),
    };
    const { open } = phases;

    let activeLayer = -1;
    if (P < TIMELINE.merge[0]) {
      TIMELINE.layers.forEach((start, i) => {
        if (P >= start + TIMELINE.arrival * 0.5) activeLayer = i;
      });
    }

    s.mouse.x = approach(s.mouse.x, (pointer.x / window.innerWidth) * 2 - 1, 0.05);
    s.mouse.y = approach(s.mouse.y, (pointer.y / window.innerHeight) * 2 - 1, 0.05);

    // Lens follows the pointer, or glides organically over the headline when idle.
    const stageRect = stage.getBoundingClientRect();
    const headRect = headWrapRef.current?.getBoundingClientRect();
    const ox = headRect ? headRect.left - stageRect.left : 0;
    const oy = headRect ? headRect.top - stageRect.top : 0;
    const hw = headRect ? headRect.width : W;
    const hh = headRect ? headRect.height : H;

    const idle = now - pointer.lastMoveAt > IDLE_AFTER_MS;
    let targetX = ox + hw * 0.5;
    let targetY = oy + hh * 0.5;
    if (pointer.active && !idle && !scene.mobile) {
      targetX = pointer.x - stageRect.left;
      targetY = pointer.y - stageRect.top;
    } else if (!reducedMotion) {
      targetX = ox + hw * (0.5 + 0.36 * Math.sin(t * (scene.mobile ? 0.5 : 0.42)));
      targetY = oy + hh * (0.5 + 0.34 * Math.sin(t * (scene.mobile ? 0.37 : 0.58) + 1.2));
    }

    const lens = s.lens;
    const prevX = lens.x;
    const prevY = lens.y;
    const followSpeed = pointer.active && !idle && !scene.mobile ? 0.14 : 0.055;
    lens.x = approach(lens.x, targetX, followSpeed);
    lens.y = approach(lens.y, targetY, followSpeed);
    lens.vx = approach(lens.vx, lens.x - prevX, 0.2);
    lens.vy = approach(lens.vy, lens.y - prevY, 0.2);
    s.pulse *= 0.93;

    const grow = reducedMotion ? 1 : introT < 0 ? 0 : easeOutQuart((introT + 0.2) / 1.4);
    const breathe = reducedMotion ? 1 : 1 + 0.025 * Math.sin(t * 1.1);
    const baseRadius = scene.mobile ? Math.min(W * 0.27, 130) : Math.min(205, Math.min(W, H) * 0.25);
    const targetRadius =
      (s.pressed && P < 0.04 ? Math.hypot(W, H) : baseRadius * breathe * (1 + s.pulse * 0.16)) *
      grow *
      (1 - open);
    s.lensRadius = approach(s.lensRadius, targetRadius, s.pressed ? 0.075 : 0.11);
    const lensRadius = s.lensRadius;

    scene.render({
      t,
      phases,
      lens,
      lensRadius,
      mouse: s.mouse,
      pointer,
      activeLayer,
      reducedMotion,
    });

    layerStackRef.current?.update({
      t,
      phases,
      mouse: s.mouse,
      activeLayer,
      width: W,
      height: H,
      mobile: scene.mobile,
      reducedMotion,
    });

    // Sync CSS custom properties on headWrapRef for the X-ray wireframe clip-path & hollow punch-out mask.
    const wrap = headWrapRef.current;
    if (wrap) {
      const lx = lens.x - ox;
      const ly = lens.y - oy;
      wrap.style.setProperty("--lx", `${lx.toFixed(1)}px`);
      wrap.style.setProperty("--ly", `${ly.toFixed(1)}px`);
      wrap.style.setProperty("--lr", `${Math.max(0, lensRadius).toFixed(1)}px`);
    }

    // Staggered intro reveal & scroll-split transition for headline rows.
    const introElapsed = Math.max(0, introT);
    const introIn = (from: number, to: number) => (reducedMotion ? 1 : smoothstep(from, to, introElapsed));
    const introExit = 1 - smoothstep(0.015, 0.08, P);
    const headlineOpacity = 1 - smoothstep(0.05, 0.13, P);
    const ruleGrow = smoothstep(0.015, 0.08, P);
    const ruleOpacity = String(clamp(ruleGrow * 3) * (1 - smoothstep(0.1, 0.17, P)));

    const activeSolid = scene.mobile ? solidMobileRef.current : solidDesktopRef.current;
    const activeXray = scene.mobile ? xrayMobileRef.current : xrayDesktopRef.current;
    const solidRows = activeSolid ? Array.from(activeSolid.querySelectorAll<HTMLElement>("[data-row]")) : [];
    const xrayRows = activeXray ? Array.from(activeXray.querySelectorAll<HTMLElement>("[data-row]")) : [];

    solidRows.forEach((row, i) => {
      const reveal = reducedMotion ? 1 : easeOutQuart((introT - 0.12 - i * 0.11) / 1.1);
      const offsetY = (i - (solidRows.length - 1) / 2) * open * H * 0.24;
      const y = (1 - reveal) * 44 + offsetY;
      const tx = `translate3d(0,${y.toFixed(2)}px,0)`;
      const op = String(reveal * headlineOpacity);
      row.style.transform = tx;
      row.style.opacity = op;
      if (xrayRows[i]) {
        xrayRows[i].style.transform = tx;
        xrayRows[i].style.opacity = op;
      }
      const rule = ruleRefs.current[i];
      if (rule) {
        rule.style.transform = `translate3d(0,${(s.baselines[i] ?? 0) + offsetY}px,0) scaleX(${ruleGrow})`;
        rule.style.opacity = ruleOpacity;
      }
    });

    setStyle(topBarRef, "opacity", introIn(0.3, 1.0) * introExit);
    setText(
      coordRef,
      `X ${padNumber(clamp(lens.x, 0, W), 4)} · Y ${padNumber(clamp(lens.y, 0, H), 4)} · R ${padNumber(lensRadius, 3)}`,
    );

    const actIn = introIn(0.65, 1.4);
    setStyle(desktopActionsRef, "opacity", actIn * introExit);
    setStyle(desktopActionsRef, "transform", `translate3d(0,${(1 - actIn) * 14}px,0)`);
    setStyle(mobileActionsRef, "opacity", actIn * introExit);
    setStyle(mobileActionsRef, "transform", `translate3d(0,${(1 - actIn) * 14}px,0)`);

    const bottomIn = introIn(0.8, 1.5);
    setStyle(bottomBarRef, "opacity", bottomIn * introExit);
    setStyle(bottomBarRef, "transform", `translate3d(0,${(1 - bottomIn) * 10}px,0)`);

    if (introWrapRef.current) {
      introWrapRef.current.style.pointerEvents = P > 0.07 ? "none" : "";
    }

    // Scroll progress HUD appears cleanly while scrolling through the 4-layer stack.
    const scrollHud = smoothstep(0.02, 0.06, P) * (1 - smoothstep(0.67, 0.73, P));
    setStyle(metaRef, "opacity", scrollHud);
    setText(percentRef, padNumber(clamp(P / 0.7) * 100, 3));
    if (barRef.current) barRef.current.style.transform = `scaleX(${clamp(P / 0.7)})`;
    const status =
      P >= TIMELINE.outro[0]
        ? "IZVOR"
        : P >= TIMELINE.merge[0]
          ? "REZULTAT"
          : activeLayer >= 0
            ? HERO_LAYERS[activeLayer].label
            : lensRadius > 1
              ? "POD POVRŠJEM"
              : "";
    setText(statusRef, status);

    // Layer caption: each new layer's name slides in from below.
    if (activeLayer >= 0 && activeLayer !== s.captionLayer) {
      const layer = HERO_LAYERS[activeLayer];
      setText(captionSpecRef, layer.spec);
      setText(captionNameRef, layer.name);
      setText(captionTextRef, layer.description);
      const direction = activeLayer > s.captionLayer ? "animate-slide-in-up" : "animate-slide-in-down";
      if (s.captionLayer >= 0 && !reducedMotion) restartAnimation(captionNameRef.current, direction);
      s.captionLayer = activeLayer;
    }
    const captionStart = TIMELINE.layers[0] + TIMELINE.arrival * 0.5;
    const captionOpacity =
      smoothstep(captionStart, captionStart + 0.03, P) *
      (1 - smoothstep(TIMELINE.merge[0], TIMELINE.merge[0] + 0.03, P));
    setStyle(captionRef, "opacity", captionOpacity);
    setStyle(captionRef, "transform", `translate3d(0,${(1 - captionOpacity) * 14}px,0)`);

    // The finished site gets a quiet moment, then hands off seamlessly as O nas materializes.
    const result =
      smoothstep(TIMELINE.merge[1] - 0.02, TIMELINE.merge[1] + 0.02, P) *
      (1 - smoothstep(TIMELINE.outro[0], TIMELINE.outro[0] + 0.035, P));
    setStyle(resultRef, "opacity", result);

    const cursorLabel = P < 0.06 ? "PRIDRŽI" : activeLayer === 3 ? "VRTI" : "";
    if (stage.dataset.cursorLabel !== cursorLabel) stage.dataset.cursorLabel = cursorLabel;
  }, visible);

  return (
    <section id="domov" ref={sectionRef} aria-label="Uvod" className="relative z-10 h-[420vh]">
      <div
        ref={stageRef}
        data-cursor="explore"
        className="sticky top-0 h-svh touch-pan-y select-none overflow-hidden bg-black"
      >
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 block size-full" />
        <HeroLayerStack ref={layerStackRef} />

        <div
          ref={introWrapRef}
          className="hero-intro pointer-events-none absolute inset-0 flex flex-col px-[clamp(18px,3vw,64px)] pt-[clamp(86px,11vh,114px)] pb-[max(24px,env(safe-area-inset-bottom))]"
        >
          {/* Scroll-split baseline rules */}
          <div aria-hidden className="absolute inset-x-0 top-0">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                ref={(el) => {
                  ruleRefs.current[i] = el;
                }}
                className={
                  "absolute inset-x-0 top-0 h-px opacity-0 " +
                  (i >= 2
                    ? "bg-[linear-gradient(90deg,transparent,rgba(245,117,30,.55)_30%,rgba(245,117,30,.55)_70%,transparent)]"
                    : "bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.2)_25%,rgba(255,255,255,.2)_75%,transparent)]")
                }
                style={{ transform: "scaleX(0)" }}
              />
            ))}
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-[1480px] flex-1 flex-col">
            {/* Top studio label + desktop lens readout */}
            <div
              ref={topBarRef}
              className="flex flex-wrap items-center justify-between gap-2 pb-[1.5vh] font-mono text-[clamp(10px,1.2vw,12px)] tracking-[.18em] uppercase text-white/60 opacity-0"
            >
              <div className="inline-flex items-center gap-2.5">
                <SparkIcon size={13} className="shrink-0 text-brand" />
                <span>PG INŽENIRING · DIGITALNI STUDIO</span>
              </div>
              <span ref={coordRef} aria-hidden className="hidden tabular-nums text-white/40 nav:inline">
                X 0000 · Y 0000 · R 000
              </span>
            </div>

            {/* Centerpiece: Edge-to-Edge Auto-Fitted Typography + Live X-Ray Wireframe Overlay */}
            <div className="flex flex-1 flex-col justify-center gap-6 nav:gap-0">
              <div
                ref={headWrapRef}
                className="relative w-full font-display font-extrabold leading-[.94] tracking-[-.052em]"
              >
                {/* ================= DESKTOP HEADLINE (>= 900px) ================= */}
                <div className="relative hidden nav:block">
                  {/* Solid Layer — cleanly masked out inside the live X-ray lens circle */}
                  <h1
                    ref={solidDesktopRef}
                    aria-label="Spletna stran, ki si jo vaša znamka zasluži."
                    className="relative z-10 m-0 text-white"
                    style={{
                      WebkitMaskImage:
                        "radial-gradient(circle at var(--lx, -999px) var(--ly, -999px), transparent calc(var(--lr, 0px) - 1px), #000 var(--lr, 0px))",
                      maskImage:
                        "radial-gradient(circle at var(--lx, -999px) var(--ly, -999px), transparent calc(var(--lr, 0px) - 1px), #000 var(--lr, 0px))",
                    }}
                  >
                    <div data-row="" className="opacity-0 will-change-transform">
                      <span
                        data-fit="1"
                        className="inline-block pt-[0.06em] pb-[0.04em] whitespace-nowrap text-[12.5vw]"
                      >
                        Spletna stran,
                      </span>
                    </div>
                    <div data-row="" className="opacity-0 will-change-transform">
                      <span
                        data-fit="1"
                        className="inline-block pt-[0.06em] pb-[0.04em] whitespace-nowrap text-[8vw]"
                      >
                        ki si jo vaša znamka
                      </span>
                    </div>
                    <div
                      data-row=""
                      className="flex items-end gap-[3vw] opacity-0 will-change-transform"
                    >
                      <span
                        data-fit="0.64"
                        className="inline-block shrink-0 pt-[0.08em] pb-[0.06em] whitespace-nowrap text-[17.5vw] text-brand"
                      >
                        zasluži.
                      </span>
                    </div>
                  </h1>

                  {/* Desktop Subtitle & Pill CTAs — sits cleanly above the X-ray mask beside "zasluži." */}
                  <div
                    ref={desktopActionsRef}
                    className="pointer-events-auto absolute right-0 bottom-0 z-30 flex w-[calc(36%-3vw)] flex-col gap-5 pb-[1.4vw] font-sans font-normal tracking-normal leading-[1.5] opacity-0"
                  >
                    <p className="m-0 max-w-[440px] text-[clamp(15px,1.15vw,19px)] text-pretty text-white/82 drop-shadow-[0_2px_18px_rgba(0,0,0,0.95)]">
                      Oblikujemo in razvijamo spletne strani za podjetja, ki želijo izstopati.{" "}
                      <span className="text-white">Od prve skice do lansiranja.</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <a
                        href="#kontakt"
                        data-cursor="link"
                        className="group inline-flex h-[52px] items-center gap-2.5 rounded-full bg-brand px-6 font-display text-[15px] font-extrabold tracking-[-.01em] text-black transition-colors duration-300 hover:bg-white"
                      >
                        <span>Začnimo projekt</span>
                        <ArrowRightIcon
                          size={16}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </a>
                      <a
                        href="#projekti"
                        data-cursor="link"
                        className="inline-flex h-[52px] items-center rounded-full border border-white/22 bg-transparent px-6 font-display text-[15px] font-bold tracking-[-.01em] text-white transition-colors duration-300 hover:border-brand hover:text-brand"
                      >
                        Oglejte si projekte
                      </a>
                    </div>
                  </div>

                  {/* Desktop X-Ray Wireframe & Architectural Spec Overlay (clipped strictly to live lens) */}
                  <div
                    ref={xrayDesktopRef}
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-20 text-transparent [-webkit-text-stroke:1.4px_#F5751E]"
                    style={{
                      clipPath:
                        "circle(var(--lr, 0px) at var(--lx, -999px) var(--ly, -999px))",
                    }}
                  >
                    <div data-row="" className="relative opacity-0 will-change-transform">
                      <span className="absolute -inset-x-16 top-[0.2em] border-t border-dashed border-white/25" />
                      <span className="absolute -inset-x-16 bottom-[0.16em] border-t border-brand/55" />
                      <span className="absolute -top-6 left-0 font-mono text-[12px] font-medium tracking-[.04em] text-brand [-webkit-text-stroke:0]">
                        &lt;h1 class=&quot;naslov&quot;&gt;
                      </span>
                      <span className="absolute -top-6 right-0 font-mono text-[11px] font-medium tracking-[.12em] text-white/70 [-webkit-text-stroke:0]">
                        FONT-SIZE <span data-size="0" className="text-brand">—</span> · FIT 100 %
                      </span>
                      <span
                        data-fit="1"
                        className="inline-block pt-[0.06em] pb-[0.04em] whitespace-nowrap text-[12.5vw]"
                      >
                        Spletna stran,
                      </span>
                    </div>

                    <div data-row="" className="relative opacity-0 will-change-transform">
                      <span className="absolute -inset-x-16 bottom-[0.16em] border-t border-brand/55" />
                      <span className="absolute top-1 right-0 font-mono text-[11px] font-medium tracking-[.12em] text-white/70 [-webkit-text-stroke:0]">
                        FONT-SIZE <span data-size="1" className="text-brand">—</span> · TRACKING −0.052EM
                      </span>
                      <span
                        data-fit="1"
                        className="inline-block pt-[0.06em] pb-[0.04em] whitespace-nowrap text-[8vw]"
                      >
                        ki si jo vaša znamka
                      </span>
                    </div>

                    <div
                      data-row=""
                      className="relative flex items-end gap-[3vw] opacity-0 will-change-transform"
                    >
                      <span className="absolute -inset-x-16 bottom-[0.16em] border-t border-brand/55" />
                      <span className="relative inline-block shrink-0">
                        <span
                          data-fit="0.64"
                          className="inline-block pt-[0.08em] pb-[0.06em] whitespace-nowrap text-[17.5vw] [-webkit-text-stroke:1.4px_#FFFFFF]"
                        >
                          zasluži.
                        </span>
                        <span className="absolute -bottom-5 left-0 font-mono text-[11px] font-medium tracking-[.12em] text-white/70 [-webkit-text-stroke:0]">
                          FONT-SIZE <span data-size="2" className="text-brand">—</span> · BARVA #F5751E
                        </span>
                      </span>
                      <div className="invisible min-w-0 flex-1 pb-[1.8vw]" />
                    </div>
                  </div>
                </div>

                {/* ================= MOBILE & TABLET HEADLINE (< 900px) ================= */}
                <div className="relative leading-[.9] tracking-[-.055em] nav:hidden">
                  {/* Solid Mobile Layer — cleanly masked out inside the live X-ray lens circle */}
                  <h1
                    ref={solidMobileRef}
                    aria-label="Spletna stran, ki si jo vaša znamka zasluži."
                    className="relative z-10 m-0 text-white"
                    style={{
                      WebkitMaskImage:
                        "radial-gradient(circle at var(--lx, -999px) var(--ly, -999px), transparent calc(var(--lr, 0px) - 1px), #000 var(--lr, 0px))",
                      maskImage:
                        "radial-gradient(circle at var(--lx, -999px) var(--ly, -999px), transparent calc(var(--lr, 0px) - 1px), #000 var(--lr, 0px))",
                    }}
                  >
                    <div data-row="" className="opacity-0 will-change-transform">
                      <span
                        data-fit="1"
                        className="inline-block whitespace-nowrap text-[15vw]"
                      >
                        Spletna stran,
                      </span>
                    </div>
                    <div data-row="" className="opacity-0 will-change-transform">
                      <span
                        data-fit="1"
                        className="inline-block whitespace-nowrap text-[15vw]"
                      >
                        ki si jo vaša
                      </span>
                    </div>
                    <div data-row="" className="opacity-0 will-change-transform">
                      <span
                        data-fit="1"
                        className="inline-block whitespace-nowrap text-[30vw]"
                      >
                        znamka
                      </span>
                    </div>
                    <div data-row="" className="opacity-0 will-change-transform">
                      <span
                        data-fit="1"
                        className="inline-block pt-[0.06em] pb-[0.04em] whitespace-nowrap text-[27vw] text-brand"
                      >
                        zasluži.
                      </span>
                    </div>
                  </h1>

                  {/* Mobile X-Ray Wireframe & Architectural Spec Overlay */}
                  <div
                    ref={xrayMobileRef}
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-20 text-transparent [-webkit-text-stroke:1.1px_#F5751E]"
                    style={{
                      clipPath:
                        "circle(var(--lr, 0px) at var(--lx, -999px) var(--ly, -999px))",
                    }}
                  >
                    <div data-row="" className="relative opacity-0 will-change-transform">
                      <span className="absolute -inset-x-6 bottom-[0.17em] border-t border-brand/55" />
                      <span className="absolute -top-4 left-0 font-mono text-[10px] font-medium tracking-[.04em] text-brand [-webkit-text-stroke:0]">
                        &lt;h1 class=&quot;naslov&quot;&gt;
                      </span>
                      <span
                        data-fit="1"
                        className="inline-block whitespace-nowrap text-[15vw]"
                      >
                        Spletna stran,
                      </span>
                    </div>
                    <div data-row="" className="relative opacity-0 will-change-transform">
                      <span className="absolute -inset-x-6 bottom-[0.17em] border-t border-brand/55" />
                      <span
                        data-fit="1"
                        className="inline-block whitespace-nowrap text-[15vw]"
                      >
                        ki si jo vaša
                      </span>
                    </div>
                    <div data-row="" className="relative opacity-0 will-change-transform">
                      <span className="absolute -inset-x-6 top-[0.2em] border-t border-dashed border-white/25" />
                      <span className="absolute -inset-x-6 bottom-[0.17em] border-t border-brand/55" />
                      <span className="absolute top-0.5 right-0 font-mono text-[10px] font-medium tracking-[.12em] text-white/70 [-webkit-text-stroke:0]">
                        FONT-SIZE <span data-size="2" className="text-brand">—</span>
                      </span>
                      <span
                        data-fit="1"
                        className="inline-block whitespace-nowrap text-[30vw]"
                      >
                        znamka
                      </span>
                    </div>
                    <div data-row="" className="relative opacity-0 will-change-transform">
                      <span className="absolute -inset-x-6 bottom-[0.17em] border-t border-brand/55" />
                      <span
                        data-fit="1"
                        className="inline-block pt-[0.06em] pb-[0.04em] whitespace-nowrap text-[27vw] [-webkit-text-stroke:1.1px_#FFFFFF]"
                      >
                        zasluži.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile & Tablet Subtitle + Full-Height Pill CTAs */}
              <div
                ref={mobileActionsRef}
                className="pointer-events-auto relative z-20 flex flex-col gap-5 opacity-0 nav:hidden"
              >
                <p className="hero-description m-0 max-w-[440px] text-[16.5px] leading-[1.5] text-pretty text-white/80">
                  Oblikujemo in razvijamo spletne strani za podjetja, ki želijo izstopati.{" "}
                  <span className="text-white">Od prve skice do lansiranja.</span>
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <a
                    href="#kontakt"
                    data-cursor="link"
                    className="group inline-flex min-h-[54px] flex-1 items-center justify-center gap-2 rounded-full bg-brand px-6 font-display text-[15.5px] font-extrabold whitespace-nowrap text-black transition-colors active:bg-white"
                  >
                    <span>Začnimo projekt</span>
                    <ArrowRightIcon size={16} />
                  </a>
                  <a
                    href="#projekti"
                    data-cursor="link"
                    className="inline-flex min-h-[54px] flex-1 items-center justify-center rounded-full border border-white/22 bg-transparent px-6 font-display text-[15.5px] font-extrabold whitespace-nowrap text-white transition-colors active:border-brand active:text-brand"
                  >
                    Oglejte si projekte
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Architectural Bar: Desktop Latest Published + Scroll Cue + X-Ray Hint */}
            <div
              ref={bottomBarRef}
              className="pointer-events-auto mt-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-white/10 pt-4 font-mono text-[clamp(10px,1.2vw,11.5px)] tracking-[.15em] uppercase text-white/55 opacity-0 nav:mt-[2.5vh] nav:justify-between nav:pt-5"
            >
              <a
                href="#projekti"
                data-cursor="view"
                data-cursor-label="PROJEKTI"
                className="group hidden items-center gap-3.5 transition-colors hover:text-brand nav:inline-flex"
              >
                <span className="relative h-[44px] w-[74px] shrink-0 overflow-hidden rounded-md border border-white/14 bg-[#0a0a0a]">
                  <Image
                    src={projectScreenshot(PROJECTS[0].slug, "card")}
                    alt={`Predogled projekta ${PROJECTS[0].title}`}
                    fill
                    priority
                    sizes="80px"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[10.5px] text-brand">NAZADNJE OBJAVLJENO</span>
                  <span className="inline-flex items-center gap-1.5 font-display text-[15.5px] font-extrabold tracking-[-.01em] normal-case text-white transition-colors group-hover:text-brand">
                    <span>{PROJECTS[0].title}</span>
                    <ArrowUpRightIcon size={14} className="text-brand" />
                  </span>
                </span>
              </a>

              <div aria-hidden className="hidden items-center gap-2 text-white/65 nav:flex">
                <ArrowDownIcon size={13} className="text-brand" />
                <span>POMAKNI</span>
              </div>

              <div aria-hidden className="flex items-center gap-2">
                <EyeIcon size={14} className="shrink-0 text-brand" />
                <span>
                  <span className="text-white">POD POVRŠJEM</span>{" "}
                  <span className="text-white/55 nav:hidden">· tapnite in pridržite</span>
                  <span className="hidden text-white/55 nav:inline">· pridržite za rentgen</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={captionRef}
          aria-live="polite"
          className="pointer-events-none absolute inset-x-0 bottom-[max(62px,env(safe-area-inset-bottom))] mx-auto flex w-[min(92vw,560px)] flex-col items-center gap-2 border-t border-brand/40 bg-black/95 px-4 py-4 text-center opacity-0 nav:bottom-[clamp(62px,8vh,84px)] nav:border-0 nav:bg-transparent nav:p-0"
        >
          <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[11px] tracking-[.16em] text-subtle">
            <span aria-hidden className="size-1.5 rounded-full bg-brand" />
            <span ref={captionSpecRef} className="whitespace-nowrap">
              {HERO_LAYERS[0].spec}
            </span>
          </div>
          <div className="overflow-hidden pb-[.08em]">
            <div
              ref={captionNameRef}
              className="text-[clamp(26px,2.5vw,36px)] leading-none font-bold tracking-[-.045em] motion-reduce:animate-none"
            >
              {HERO_LAYERS[0].name}
            </div>
          </div>
          <div ref={captionTextRef} className="text-sm leading-[1.4] text-pretty text-soft">
            {HERO_LAYERS[0].description}
          </div>
        </div>

        <div
          ref={resultRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-[max(62px,env(safe-area-inset-bottom))] flex justify-center opacity-0 nav:bottom-[clamp(56px,7vh,76px)]"
        >
          <Kicker left="REZULTAT" right="ŠTIRI PLASTI · EN SISTEM" />
        </div>

        {/* Scroll progress HUD (appears cleanly while scrolling through the 4-layer stack) */}
        <div
          ref={metaRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 flex h-14 items-center justify-end px-[clamp(18px,3vw,64px)] font-mono text-[10.5px] tracking-[.16em] text-subtle opacity-0"
        >
          <div className="flex items-center justify-end gap-2 nav:gap-3.5">
            <span ref={statusRef} className="hidden text-soft nav:inline" />
            <span className="relative h-px w-6 overflow-hidden bg-line-strong nav:w-12">
              <span
                ref={barRef}
                className="absolute inset-0 origin-left bg-brand"
                style={{ transform: "scaleX(0)" }}
              />
            </span>
            <span ref={percentRef} className="text-white/85 tabular-nums">
              000
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Writes text only when it changed, to avoid needless DOM work every frame. */
function setText(ref: RefObject<HTMLElement | null>, text: string) {
  if (ref.current && ref.current.textContent !== text) ref.current.textContent = text;
}

function setStyle(
  ref: RefObject<HTMLElement | null>,
  property: "opacity" | "transform",
  value: number | string,
) {
  if (ref.current) ref.current.style[property] = String(value);
}

/** Replays a one-shot CSS animation (forces a single reflow). */
function restartAnimation(element: HTMLElement | null, className: string) {
  if (!element) return;
  element.classList.remove("animate-slide-in-up", "animate-slide-in-down");
  void element.offsetWidth;
  element.classList.add(className);
}
