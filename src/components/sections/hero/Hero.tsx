"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { useIntro } from "@/components/intro/IntroProvider";
import { ArrowRightIcon } from "@/components/ui/Icons";
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
import { OriginStage, type OriginStageHandle } from "./OriginStage";

const HEADLINE: ReactNode[] = [
  "Spletna stran,",
  "ki si jo vaša",
  <>
    znamka <span className="text-brand">zasluži.</span>
  </>,
];

/**
 * Scroll timeline of the pinned hero, as fractions of its pinned distance.
 *
 *  message → deconstruction → koda → struktura → oblika → izkušnja
 *  → merge → result (hold) → origin statement
 */
const TIMELINE = {
  /** Headline separates; its baselines become guides; the mesh lies down. */
  open: [0.02, 0.15],
  /** When each layer starts landing on the stack. */
  layers: [0.12, 0.26, 0.39, 0.52],
  /** How long a layer takes to land. */
  arrival: 0.06,
  /** Code is typed into the first layer. */
  code: [0.14, 0.24],
  /** Layers align, merge and the site turns to face the viewer. */
  merge: [0.65, 0.75],
  /** The site lays down into the floor of the closing scene. */
  outro: [0.82, 0.89],
  /** Buildings turn from physical into digital structures. */
  digitize: [0.88, 0.97],
} as const;

/** After this long without pointer movement the lens starts wandering. */
const IDLE_AFTER_MS = 4500;

type Simulation = {
  startedAt: number | null;
  progress: number;
  mouse: { x: number; y: number };
  lens: LensState;
  pulse: number;
  /** Layer whose caption is shown. */
  captionLayer: number;
  /** Baseline of each headline line, relative to the stage (cached on resize). */
  baselines: number[];
};

const range = (P: number, [from, to]: readonly [number, number]) => smoothstep(from, to, P);

/**
 * Pinned, scroll-driven hero: a lens reveals the code under the headline,
 * then a website is built layer by layer, merges into the finished site and
 * hands over to the closing statement about PG's origin.
 */
export function Hero() {
  const { startedAt: introStartedAt } = useIntro();
  const reducedMotion = useReducedMotion();
  const pointer = usePointer();

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const kickerRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const visualCardRef = useRef<HTMLDivElement>(null);
  const introWrapRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lineInnerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const ruleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const captionRef = useRef<HTMLDivElement>(null);
  const captionIndexRef = useRef<HTMLSpanElement>(null);
  const captionSpecRef = useRef<HTMLSpanElement>(null);
  const captionNameRef = useRef<HTMLDivElement>(null);
  const captionTextRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const xrayLabelRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);

  const visible = useInViewport(sectionRef);
  const sceneRef = useRef<HeroScene | null>(null);
  const layerStackRef = useRef<HeroLayerStackHandle>(null);
  const originStageRef = useRef<OriginStageHandle>(null);
  const sim = useRef<Simulation>({
    startedAt: null,
    progress: 0,
    mouse: { x: 0, y: 0 },
    lens: { x: 0, y: 0, vx: 0, vy: 0 },
    pulse: 0,
    captionLayer: -1,
    baselines: [],
  });

  useEffect(() => {
    const stage = stageRef.current!;
    const scene = new HeroScene(canvasRef.current!, resolveCanvasFonts());
    sceneRef.current = scene;

    const measureBaselines = () => {
      sim.current.baselines = lineRefs.current.map((line) => {
        if (!line) return 0;
        const fontSize = parseFloat(getComputedStyle(line).fontSize);
        return line.offsetTop + line.offsetHeight - fontSize * 0.17;
      });
    };
    const resize = () => {
      scene.resize(stage.clientWidth, stage.clientHeight);
      measureBaselines();
    };
    resize();
    Object.assign(sim.current.lens, { x: scene.width / 2, y: scene.height / 2 });

    const observer = new ResizeObserver(resize);
    observer.observe(stage);

    let disposed = false;
    document.fonts.ready.then(() => {
      if (disposed) return;
      scene.refreshTextures();
      layerStackRef.current?.refreshTextures();
      measureBaselines();
    });

    const onPointerDown = () => (sim.current.pulse = 1);
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("pointerdown", onPointerDown);
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
    const { open, outro } = phases;

    let activeLayer = -1;
    if (P < TIMELINE.merge[0]) {
      TIMELINE.layers.forEach((start, i) => {
        if (P >= start + TIMELINE.arrival * 0.5) activeLayer = i;
      });
    }

    s.mouse.x = approach(s.mouse.x, (pointer.x / window.innerWidth) * 2 - 1, 0.05);
    s.mouse.y = approach(s.mouse.y, (pointer.y / window.innerHeight) * 2 - 1, 0.05);

    // Lens follows the pointer, or wanders on its own when idle.
    const cx = W / 2;
    const cy = H * 0.5;
    const idle = now - pointer.lastMoveAt > IDLE_AFTER_MS;
    let targetX = cx;
    let targetY = cy;
    if (pointer.active && !idle && !scene.mobile) {
      targetX = pointer.x;
      targetY = pointer.y - stage.getBoundingClientRect().top;
    } else if (!reducedMotion) {
      // Phones always follow this orbit, independently of touch/scroll events.
      targetX = cx + W * 0.24 * Math.sin(t * (scene.mobile ? 0.5 : 0.31));
      targetY = cy + H * (scene.mobile ? 0.16 : 0.11) * Math.sin(t * (scene.mobile ? 0.37 : 0.47) + 1.2);
    }
    const lens = s.lens;
    const prevX = lens.x;
    const prevY = lens.y;
    lens.x = approach(lens.x, targetX, 0.075);
    lens.y = approach(lens.y, targetY, 0.075);
    lens.vx = approach(lens.vx, lens.x - prevX, 0.2);
    lens.vy = approach(lens.vy, lens.y - prevY, 0.2);
    s.pulse *= 0.93;

    const grow = reducedMotion ? 1 : introT < 0 ? 0 : easeOutQuart((introT + 0.25) / 1.6);
    const breathe = reducedMotion ? 1 : 1 + 0.035 * Math.sin(t * 1.1);
    // Active behind Hero and returns behind O nas (staying clear during the 4-layer build animations).
    const lensPresence = Math.max(1 - open, outro * 0.92);
    const lensRadius =
      (scene.mobile ? Math.min(W * 0.25, H * 0.14) : Math.min(W, H) * 0.25) * grow * breathe * lensPresence * (1 + s.pulse * 0.22);

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

    // Headline: staggered reveal, mouse parallax, velocity skew, then split
    // apart — its baselines stay behind as guides that dissolve into the grid.
    const motion = reducedMotion || scene.mobile ? 0 : 1;
    const skew = clamp(lens.vx * 0.04, -2, 2) * (1 - open) * motion;
    const headlineOpacity = String(1 - smoothstep(0.05, 0.13, P));
    const ruleGrow = smoothstep(0.015, 0.08, P);
    const ruleOpacity = String(clamp(ruleGrow * 3) * (1 - smoothstep(0.1, 0.17, P)));
    for (let i = 0; i < HEADLINE.length; i++) {
      const line = lineRefs.current[i];
      const inner = lineInnerRefs.current[i];
      const rule = ruleRefs.current[i];
      if (!line || !inner) continue;
      const reveal = reducedMotion ? 1 : easeOutQuart((introT - 0.15 - i * 0.09) / 1.1);
      const depth = 6 + i * 5;
      const offsetY = (i - 1) * open * H * 0.3 - s.mouse.y * depth * 0.6 * motion;
      inner.style.transform = `translate3d(0,${(1 - reveal) * 112}%,0)`;
      line.style.transform =
        `translate3d(${-s.mouse.x * depth * motion}px,${offsetY}px,0) ` +
        `skewX(${-skew}deg) scale(${1 - open * (i === 1 ? 0.06 : 0)})`;
      line.style.opacity = headlineOpacity;
      if (rule) {
        rule.style.transform = `translate3d(0,${(s.baselines[i] ?? 0) + offsetY}px,0) scaleX(${ruleGrow})`;
        rule.style.opacity = ruleOpacity;
      }
    }

    const introElapsed = Math.max(0, introT);
    const introIn = (from: number, to: number) => (reducedMotion ? 1 : smoothstep(from, to, introElapsed));
    const introExit = 1 - smoothstep(0.015, 0.08, P);
    setStyle(kickerRef, "opacity", introIn(0.4, 1.1) * (1 - smoothstep(0, 0.06, P)));
    const description = introIn(0.85, 1.55);
    setStyle(descriptionRef, "opacity", description * introExit);
    setStyle(descriptionRef, "transform", `translate3d(0,${(1 - description) * 10}px,0)`);
    const actionsIn = introIn(1.0, 1.7);
    setStyle(actionsRef, "opacity", actionsIn * introExit);
    setStyle(actionsRef, "transform", `translate3d(0,${(1 - actionsIn) * 12}px,0)`);
    const visualIn = introIn(0.75, 1.6);
    const visualOpacity = visualIn * (1 - smoothstep(0.02, 0.11, P));
    setStyle(visualCardRef, "opacity", visualOpacity);
    setStyle(
      visualCardRef,
      "transform",
      `translate3d(${(-s.mouse.x * 10 * motion).toFixed(2)}px,${((1 - visualIn) * 26 + open * -34 - s.mouse.y * 8 * motion).toFixed(2)}px,0)`,
    );
    if (introWrapRef.current) {
      introWrapRef.current.style.pointerEvents = P > 0.07 ? "none" : "";
    }
    setStyle(metaRef, "opacity", introIn(0.9, 1.6) * (1 - outro));
    setStyle(hintRef, "opacity", 1 - smoothstep(0.01, 0.06, P));
    setStyle(xrayLabelRef, "opacity", introIn(0.5, 1.3) * (1 - smoothstep(0, 0.1, P)));

    // Progress readout
    setText(percentRef, padNumber(P * 100, 3));
    if (barRef.current) barRef.current.style.transform = `scaleX(${P})`;
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
      setText(captionIndexRef, `0${activeLayer + 1} / 0${HERO_LAYERS.length}`);
      setText(captionSpecRef, layer.spec);
      setText(captionNameRef, layer.name);
      setText(captionTextRef, layer.description);
      const direction = activeLayer > s.captionLayer ? "animate-slide-in-up" : "animate-slide-in-down";
      if (s.captionLayer >= 0 && !reducedMotion) restartAnimation(captionNameRef.current, direction);
      s.captionLayer = activeLayer;
    }
    const captionStart = TIMELINE.layers[0] + TIMELINE.arrival * 0.5;
    const captionOpacity = smoothstep(captionStart, captionStart + 0.03, P) * (1 - smoothstep(TIMELINE.merge[0], TIMELINE.merge[0] + 0.03, P));
    setStyle(captionRef, "opacity", captionOpacity);
    setStyle(captionRef, "transform", `translate3d(0,${(1 - captionOpacity) * 14}px,0)`);

    // The finished site gets a quiet moment, labelled once.
    const result = smoothstep(TIMELINE.merge[1] - 0.02, TIMELINE.merge[1] + 0.02, P) * (1 - smoothstep(TIMELINE.outro[0], TIMELINE.outro[0] + 0.025, P));
    setStyle(resultRef, "opacity", result);

    // Closing "O nas" showcase: monumental headline + architectural scale models.
    originStageRef.current?.update({
      progress: P,
      outro,
      digitize: phases.digitize,
      mouseX: s.mouse.x,
      reducedMotion,
    });

    // Label for the custom cursor while hovering the stage.
    const cursorLabel = P < 0.06 ? "RAZIŠČI" : activeLayer === 3 ? "VRTI" : "";
    if (stage.dataset.cursorLabel !== cursorLabel) stage.dataset.cursorLabel = cursorLabel;
  }, visible);

  return (
    <section id="domov" ref={sectionRef} aria-label="Uvod" className="relative h-[440vh]">
      {/* "O nas" anchor: lands on the closing statement of the hero. */}
      <div id="o-nas" aria-hidden className="pointer-events-none absolute top-[330vh] left-0 size-px" />

      <div
        ref={stageRef}
        data-cursor="explore"
        className="sticky top-0 h-svh touch-pan-y overflow-hidden bg-black"
      >
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 block size-full" />
        <HeroLayerStack ref={layerStackRef} />

        <div
          ref={introWrapRef}
          className="hero-intro pointer-events-none absolute inset-0 flex items-center px-[clamp(18px,3.6vw,56px)] pt-[82px] pb-[64px]"
        >
          <div aria-hidden className="absolute inset-x-0 top-0">
            {HEADLINE.map((_, i) => (
              <span
                key={i}
                ref={(el) => {
                  ruleRefs.current[i] = el;
                }}
                className={
                  "absolute inset-x-0 top-0 h-px opacity-0 " +
                  (i === HEADLINE.length - 1
                    ? "bg-[linear-gradient(90deg,transparent,rgba(245,117,30,.55)_30%,rgba(245,117,30,.55)_70%,transparent)]"
                    : "bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.2)_25%,rgba(255,255,255,.2)_75%,transparent)]")
                }
                style={{ transform: "scaleX(0)" }}
              />
            ))}
          </div>

          <div className="relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-10 nav:grid-cols-[minmax(0,1.2fr)_minmax(0,0.92fr)] nav:gap-[clamp(36px,4.5vw,76px)]">
            {/* Left Column: Pulsing studio kicker, monumental display H1, subtitle, and dual CTA pills */}
            <div className="flex min-w-0 flex-col items-start gap-[clamp(18px,2.8vh,30px)]">
              <div
                ref={kickerRef}
                className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/68 px-4 py-2 font-mono text-[11px] font-medium tracking-[.14em] uppercase text-white/85 opacity-0 backdrop-blur-[8px]"
              >
                <span
                  aria-hidden
                  className="size-2 shrink-0 rounded-full bg-brand animate-pg-pulse motion-reduce:animate-none"
                />
                <span>PG INŽENIRING — DIGITALNI STUDIO</span>
              </div>

              <h1
                aria-label="Spletna stran, ki si jo vaša znamka zasluži."
                className="text-left text-[clamp(44px,11.5vw,66px)] leading-[.92] font-extrabold tracking-[-.048em] drop-shadow-[0_4px_26px_rgba(0,0,0,0.96)] nav:text-[clamp(56px,6.2vw,112px)]"
              >
                {HEADLINE.map((line, i) => (
                  <span
                    key={i}
                    ref={(el) => {
                      lineRefs.current[i] = el;
                    }}
                    aria-hidden
                    className="block overflow-hidden pr-[.06em] pb-[.06em] will-change-transform"
                  >
                    <span
                      ref={(el) => {
                        lineInnerRefs.current[i] = el;
                      }}
                      className="block"
                      style={{ transform: "translateY(110%)" }}
                    >
                      {line}
                    </span>
                  </span>
                ))}
              </h1>

              <p
                ref={descriptionRef}
                className="hero-description max-w-[500px] rounded-xl bg-black/62 px-4 py-2.5 text-[clamp(15px,1.35vw,19.5px)] leading-[1.5] text-pretty text-white/82 opacity-0 backdrop-blur-[6px]"
              >
                Oblikujemo in razvijamo spletne strani za podjetja, ki želijo izstopati — od prve
                skice do lansiranja.
              </p>

              <div
                ref={actionsRef}
                className="pointer-events-auto flex flex-wrap items-center gap-3 pt-1 opacity-0"
              >
                <a
                  href="#kontakt"
                  data-cursor="link"
                  className="group inline-flex h-[52px] items-center gap-2.5 rounded-full bg-brand px-7 font-display text-[15px] font-extrabold text-[#08080c] transition-colors duration-300 hover:bg-white"
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
                  className="inline-flex h-[52px] items-center gap-2 rounded-full border border-white/24 bg-black/55 px-7 font-display text-[15px] font-bold text-white backdrop-blur-[6px] transition-colors duration-300 hover:border-white hover:bg-white/10"
                >
                  Oglejte si projekte
                </a>
              </div>
            </div>

            {/* Right Column (Desktop): Featured project browser preview + floating <Hero /> code snippet */}
            <div
              ref={visualCardRef}
              className="pointer-events-auto relative hidden pb-11 pl-6 opacity-0 will-change-transform nav:block"
            >
              <a
                href="#projekti"
                data-cursor="view"
                data-cursor-label="PROJEKTI"
                aria-label={`Oglejte si izbrani projekt ${PROJECTS[0].title}`}
                className="group relative block overflow-hidden rounded-[16px] border border-white/14 bg-[#141418] shadow-[0_38px_80px_rgba(0,0,0,0.62)] transition-[border-color,box-shadow] duration-500 hover:border-brand/50"
              >
                <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-white/18" />
                    <span className="size-2.5 rounded-full bg-white/18" />
                    <span className="size-2.5 rounded-full bg-white/18" />
                  </div>
                  <div className="flex flex-1 justify-center">
                    <span className="rounded-full bg-[#08080c] px-3.5 py-1 font-mono text-[11px] text-white/60">
                      midnightautostudio.com
                    </span>
                  </div>
                  <span className="w-10" />
                </div>
                <div className="relative aspect-[4/2.9] overflow-hidden bg-black">
                  <Image
                    src={projectScreenshot(PROJECTS[0].slug, "card")}
                    alt={`Predogled projekta ${PROJECTS[0].title}`}
                    fill
                    priority
                    sizes="42vw"
                    className="object-cover object-top transition-transform duration-700 ease-smooth group-hover:scale-[1.03]"
                  />
                </div>
              </a>

              {/* Floating orange pill tag */}
              <div className="pointer-events-none absolute -top-3.5 right-5 flex items-center gap-2 rounded-full bg-brand px-3.5 py-1.5 font-mono text-[10.5px] font-semibold tracking-[.12em] uppercase text-[#08080c] shadow-[0_12px_28px_rgba(245,117,30,0.35)]">
                IZBRANI PROJEKT · 01
              </div>

              {/* Floating frosted JSX code card with blinking cursor */}
              <div
                aria-hidden
                className="pointer-events-none absolute bottom-0 left-0 w-[min(295px,82%)] rounded-[12px] border border-white/14 bg-[#0d0d10]/92 px-5 py-4 font-mono text-[12.5px] leading-[1.75] shadow-[0_24px_48px_rgba(0,0,0,0.65)] backdrop-blur-[12px]"
              >
                <div className="flex gap-3.5">
                  <span className="text-white/28">1</span>
                  <span className="text-white">&lt;Hero</span>
                </div>
                <div className="flex gap-3.5">
                  <span className="text-white/28">2</span>
                  <span className="pl-4 text-muted">
                    naslov=<span className="text-brand">&quot;Vaša znamka&quot;</span>
                  </span>
                </div>
                <div className="flex gap-3.5">
                  <span className="text-white/28">3</span>
                  <span className="pl-4 text-muted">
                    cilj=<span className="text-brand">&quot;izstopati&quot;</span>
                  </span>
                </div>
                <div className="flex items-center gap-3.5">
                  <span className="text-white/28">4</span>
                  <span className="inline-flex items-center text-white">
                    /&gt;
                    <span className="ml-1.5 inline-block h-[14px] w-[7px] bg-brand animate-pg-blink motion-reduce:animate-none" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={xrayLabelRef} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[12%] text-center font-mono text-[10px] tracking-[.2em] text-brand opacity-0 nav:hidden">
          POD POVRŠJEM / KODA
        </div>

        <div
          ref={captionRef}
          aria-live="polite"
          className="pointer-events-none absolute inset-x-0 bottom-[max(62px,env(safe-area-inset-bottom))] mx-auto flex w-[min(92vw,560px)] flex-col items-center gap-2 border-t border-brand/40 bg-black/95 px-4 py-4 text-center opacity-0 nav:bottom-[clamp(62px,8vh,84px)] nav:border-0 nav:bg-transparent nav:p-0"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[11px] tracking-[.16em] text-subtle">
            <span ref={captionIndexRef} className="whitespace-nowrap text-brand">
              01 / 04
            </span>
            <span aria-hidden className="hidden h-px w-6 bg-edge nav:block" />
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

        <OriginStage ref={originStageRef} />

        <div
          ref={metaRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 flex h-14 items-center justify-between px-[clamp(18px,3vw,40px)] font-mono text-[10.5px] tracking-[.16em] text-subtle opacity-0"
        >
          <div
            ref={hintRef}
            className="absolute bottom-3.5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
          >
            <span className="text-soft">POMAKNI</span>
            <span className="h-[26px] w-px animate-scroll-hint bg-brand motion-reduce:animate-none" />
          </div>
          <div className="ml-auto flex items-center justify-end gap-2 nav:gap-3.5">
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
