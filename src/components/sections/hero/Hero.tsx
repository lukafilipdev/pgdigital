"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { useIntro } from "@/components/intro/IntroProvider";
import { Kicker } from "@/components/ui/Kicker";
import { HERO_LAYERS } from "@/content/site";
import { useFrame } from "@/hooks/useFrame";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { usePointer } from "@/hooks/usePointer";
import { approach, clamp, easeOutQuart, padNumber, smoothstep } from "@/lib/math";
import { getPinProgress } from "@/lib/scroll";
import { HeroScene, type HeroPhases } from "./engine/HeroScene";
import type { LensState } from "./engine/lens";
import { resolveCanvasFonts } from "./engine/pen";

const HEADLINE: ReactNode[] = [
  "Spletna stran,",
  "ki si jo vaša",
  <>
    znamka <span className="text-brand">zasluži.</span>
  </>,
];

/** After this long without pointer movement the lens starts wandering. */
const IDLE_AFTER_MS = 4500;

type Simulation = {
  startedAt: number | null;
  progress: number;
  mouse: { x: number; y: number };
  lens: LensState;
  pulse: number;
};

/**
 * Pinned, scroll-driven hero: a lens reveals a website and its code, the page
 * then separates into four layers and finally settles into a closing statement.
 */
export function Hero() {
  const { startedAt: introStartedAt } = useIntro();
  const reducedMotion = useReducedMotion();
  const pointer = usePointer();

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const kickerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lineInnerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const captionRef = useRef<HTMLDivElement>(null);
  const captionIndexRef = useRef<HTMLSpanElement>(null);
  const captionNameRef = useRef<HTMLDivElement>(null);
  const captionTextRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const coordXRef = useRef<HTMLSpanElement>(null);
  const coordYRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);

  const sceneRef = useRef<HeroScene | null>(null);
  const sim = useRef<Simulation>({
    startedAt: null,
    progress: 0,
    mouse: { x: 0, y: 0 },
    lens: { x: 0, y: 0, vx: 0, vy: 0 },
    pulse: 0,
  });

  useEffect(() => {
    const stage = stageRef.current!;
    const scene = new HeroScene(canvasRef.current!, resolveCanvasFonts());
    sceneRef.current = scene;

    const resize = () => scene.resize(stage.clientWidth, stage.clientHeight);
    resize();
    Object.assign(sim.current.lens, { x: scene.width / 2, y: scene.height / 2 });

    const observer = new ResizeObserver(resize);
    observer.observe(stage);

    let disposed = false;
    document.fonts.ready.then(() => !disposed && scene.refreshTextures());

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
    const phases: HeroPhases = {
      open: smoothstep(0, 0.2, P),
      assemble: smoothstep(0.16, 0.38, P),
      collapse: smoothstep(0.74, 0.9, P),
      outro: smoothstep(0.84, 0.96, P),
    };
    const { open, collapse, outro } = phases;

    s.mouse.x = approach(s.mouse.x, (pointer.x / window.innerWidth) * 2 - 1, 0.05);
    s.mouse.y = approach(s.mouse.y, (pointer.y / window.innerHeight) * 2 - 1, 0.05);

    // Lens follows the pointer, or wanders on its own when idle.
    const cx = W / 2;
    const cy = H / 2;
    const idle = now - pointer.lastMoveAt > IDLE_AFTER_MS;
    let targetX = cx;
    let targetY = cy;
    if (pointer.active && !idle) {
      targetX = pointer.x;
      targetY = pointer.y - stage.getBoundingClientRect().top;
    } else if (!reducedMotion) {
      targetX = cx + W * (scene.mobile ? 0.2 : 0.24) * Math.sin(t * 0.31);
      targetY = cy + H * 0.16 * Math.sin(t * 0.47 + 1.2);
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
    const lensRadius =
      Math.min(W, H) * (scene.mobile ? 0.3 : 0.25) * grow * breathe * (1 - open) * (1 + s.pulse * 0.22);

    const activeLayer =
      collapse > 0 ? 3 : P < 0.4 ? -1 : Math.min(3, Math.floor((P - 0.4) / 0.085));

    if (window.scrollY < section.offsetTop + section.offsetHeight) {
      scene.render({
        t,
        progress: P,
        phases,
        lens,
        lensRadius,
        mouse: s.mouse,
        pointer,
        activeLayer,
        reducedMotion,
      });
    }

    // Headline: staggered reveal, mouse parallax, velocity skew, then split apart.
    const motion = reducedMotion ? 0 : 1;
    const skew = clamp(lens.vx * 0.04, -2, 2) * (1 - open);
    const headlineOpacity = String(1 - smoothstep(0.06, 0.19, P));
    for (let i = 0; i < HEADLINE.length; i++) {
      const line = lineRefs.current[i];
      const inner = lineInnerRefs.current[i];
      if (!line || !inner) continue;
      const reveal = reducedMotion ? 1 : easeOutQuart((introT - 0.15 - i * 0.09) / 1.1);
      const depth = 6 + i * 5;
      const spread = (i - 1) * open * H * 0.3;
      inner.style.transform = `translate3d(0,${(1 - reveal) * 112}%,0)`;
      line.style.transform =
        `translate3d(${-s.mouse.x * depth * motion}px,${spread - s.mouse.y * depth * 0.6 * motion}px,0) ` +
        `skewX(${-skew}deg) scale(${1 - open * (i === 1 ? 0.06 : 0)})`;
      line.style.opacity = headlineOpacity;
    }

    const introElapsed = Math.max(0, introT);
    setStyle(kickerRef, "opacity", smoothstep(0.5, 1.3, introElapsed) * (1 - smoothstep(0, 0.08, P)));
    setStyle(metaRef, "opacity", smoothstep(0.9, 1.6, introElapsed) * (1 - outro));
    setStyle(hintRef, "opacity", 1 - smoothstep(0.01, 0.08, P));

    // HUD readouts
    setText(coordXRef, `X ${padNumber(lens.x)}`);
    setText(coordYRef, `Y ${padNumber(lens.y)}`);
    setText(percentRef, padNumber(P * 100, 3));
    if (barRef.current) barRef.current.style.transform = `scaleX(${P})`;

    const status =
      P < 0.16
        ? lensRadius > 1 ? "STRUKTURA / OBLIKA" : ""
        : activeLayer < 0 ? "SESTAVLJANJE" : HERO_LAYERS[activeLayer].label;
    setText(statusRef, status);

    // Layer caption (keeps showing the last layer while fading out)
    if (activeLayer >= 0) {
      const layer = HERO_LAYERS[activeLayer];
      setText(captionIndexRef, `0${activeLayer + 1} / 0${HERO_LAYERS.length}`);
      setText(captionNameRef, layer.name);
      setText(captionTextRef, layer.description);
    }
    const captionOpacity = smoothstep(0.37, 0.42, P) * (1 - smoothstep(0.72, 0.78, P));
    setStyle(captionRef, "opacity", captionOpacity);
    setStyle(captionRef, "transform", `translate3d(0,${(1 - captionOpacity) * 14}px,0)`);
    setStyle(statementRef, "opacity", outro);
    setStyle(statementRef, "transform", `translate3d(0,${(1 - outro) * 30}px,0)`);

    // Label for the custom cursor while hovering the stage.
    const cursorLabel = P < 0.16 ? "RAZIŠČI" : P < 0.74 ? "VRTI" : "";
    if (stage.dataset.cursorLabel !== cursorLabel) stage.dataset.cursorLabel = cursorLabel;
  });

  return (
    <section id="domov" ref={sectionRef} aria-label="Uvod" className="relative h-[520vh]">
      {/* "O nas" anchor: lands on the closing statement of the hero. */}
      <div id="o-nas" aria-hidden className="pointer-events-none absolute top-[392vh] left-0 size-px" />

      <div
        ref={stageRef}
        data-cursor="explore"
        className="sticky top-0 h-svh touch-pan-y overflow-hidden bg-black"
      >
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 block size-full" />

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4">
          <Kicker
            ref={kickerRef}
            left="PG INŽENIRING"
            right="SPLETNO OBLIKOVANJE IN RAZVOJ"
            className="mb-[clamp(20px,3.2vh,36px)] opacity-0"
          />
          <h1
            aria-label="Spletna stran, ki si jo vaša znamka zasluži."
            className="text-center text-[clamp(44px,8.4vw,168px)] leading-[.93] font-bold tracking-[-.058em]"
          >
            {HEADLINE.map((line, i) => (
              <span
                key={i}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                aria-hidden
                className="block overflow-hidden px-[.04em] pb-[.06em] will-change-transform"
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
        </div>

        <div
          ref={captionRef}
          aria-live="polite"
          className="pointer-events-none absolute inset-x-0 bottom-[clamp(62px,8vh,84px)] mx-auto flex w-[min(92vw,560px)] flex-col items-center gap-2 text-center opacity-0"
        >
          <div className="flex items-center gap-3 font-mono text-[10.5px] tracking-[.18em] text-muted">
            <span ref={captionIndexRef} className="text-brand">
              01 / 04
            </span>
            <span aria-hidden className="h-px w-6 bg-edge" />
            <span>PLASTI SPLETNE STRANI</span>
          </div>
          <div
            ref={captionNameRef}
            className="text-[clamp(24px,2.4vw,34px)] leading-none font-bold tracking-[-.045em]"
          >
            {HERO_LAYERS[0].name}
          </div>
          <div ref={captionTextRef} className="text-sm leading-[1.4] text-pretty text-subtle">
            {HERO_LAYERS[0].description}
          </div>
        </div>

        <div
          ref={statementRef}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-[22px] text-center opacity-0"
        >
          <Kicker left="IZVOR" right="PG INŽENIRING" className="mb-7" />
          <p className="text-[clamp(34px,5.6vw,104px)] leading-[.98] font-bold tracking-[-.055em] text-balance">
            Gradimo v fizičnem svetu.
            <br />
            Zdaj gradimo tudi <span className="text-brand">digitalno.</span>
          </p>
          <p className="mt-[30px] max-w-[460px] text-base leading-normal text-pretty text-subtle">
            Ista natančnost pri načrtovanju, isti sistemi pri izvedbi in ista odgovornost za
            rezultat — prevedeni v splet.
          </p>
        </div>

        <div
          ref={metaRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 flex h-14 items-center justify-between px-[clamp(18px,3vw,40px)] font-mono text-[10px] tracking-[.16em] text-[#6f6f6f] opacity-0"
        >
          <div className="flex min-w-[120px] gap-[18px]">
            <span ref={coordXRef}>X 0000</span>
            <span ref={coordYRef}>Y 0000</span>
          </div>
          <div
            ref={hintRef}
            className="absolute bottom-3.5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
          >
            <span>POMAKNI</span>
            <span className="h-[26px] w-px animate-scroll-hint bg-brand motion-reduce:animate-none" />
          </div>
          <div className="flex min-w-[120px] items-center justify-end gap-3.5">
            <span ref={statusRef}>STRUKTURA</span>
            <span className="relative h-px w-12 overflow-hidden bg-line-strong">
              <span
                ref={barRef}
                className="absolute inset-0 origin-left bg-brand"
                style={{ transform: "scaleX(0)" }}
              />
            </span>
            <span ref={percentRef} className="text-[#bdbdbd]">
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
