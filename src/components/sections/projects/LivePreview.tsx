"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRightIcon } from "@/components/ui/Icons";
import { projectScreenshot, type Project } from "@/content/site";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";

const MODES = [
  { id: "desktop", label: "NAMIZNI" },
  { id: "mobile", label: "MOBILNI" },
] as const;

type Mode = (typeof MODES)[number]["id"];

/**
 * Consistent interactive desktop/mobile preview frame for every case study.
 * Uses full-resolution captured screenshots so previews never break behind
 * third-party iframe overlays, and defaults cleanly to mobile on narrow viewports.
 */
export function LivePreview({ project }: { project: Project }) {
  const isDesktop = useMediaQuery("(min-width: 720px)");
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const mode: Mode = selectedMode ?? (isDesktop ? "desktop" : "mobile");
  const host = new URL(project.url).host.replace(/^www\./, "");
  const desktopSrc =
    project.cardView === "desktop"
      ? projectScreenshot(project.slug, "card")
      : projectScreenshot(project.slug, "cover");
  const phoneSrc = projectScreenshot(project.slug, "phone");

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/12 bg-black">
      <div className="eyebrow-sm flex h-12 shrink-0 items-center gap-3 border-b border-white/[0.08] bg-[#0e0e0e] px-4 text-muted">
        <div className="hidden items-center gap-1.5 sm:flex">
          <span className="size-2 rounded-full bg-white/20" />
          <span className="size-2 rounded-full bg-white/20" />
          <span className="size-2 rounded-full bg-white/20" />
        </div>
        <span className="size-1.5 shrink-0 rounded-full bg-brand" />
        <span className="min-w-0 flex-1 truncate tracking-[.08em] text-white/80">{host}</span>
        <div role="group" aria-label="Velikost predogleda" className="flex gap-1">
          {MODES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={mode === id}
              onClick={() => setSelectedMode(id)}
              data-cursor="link"
              className={cn(
                "cursor-pointer rounded-full px-3 py-1.5 transition-colors",
                mode === id ? "bg-white text-black" : "text-subtle hover:text-white",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="link"
          className="hidden items-center gap-1 transition-colors hover:text-brand sm:inline-flex"
        >
          <span>ODPRI</span>
          <ArrowUpRightIcon size={13} />
        </a>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[#060606] p-4 sm:p-7">
        {mode === "desktop" ? (
          <div
            className={cn(
              "relative max-h-full w-full max-w-[1120px] overflow-hidden rounded-[6px] border border-white/[0.12] bg-black shadow-[0_24px_60px_rgba(0,0,0,0.8)]",
              project.cardView === "phone" ? "aspect-[2/1]" : "aspect-[1440/990]",
            )}
          >
            <Image
              src={desktopSrc}
              alt={`Namizni prikaz spletne strani ${project.title}`}
              fill
              sizes="(min-width: 900px) 88vw, 96vw"
              className="object-contain object-center"
            />
          </div>
        ) : (
          <div className="relative flex aspect-[390/844] h-full max-h-[620px] overflow-hidden rounded-[26px] border-[3px] border-white/20 bg-black p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.9)]">
            <div className="relative flex-1 overflow-hidden rounded-[20px] bg-black">
              <Image
                src={phoneSrc}
                alt={`Mobilni prikaz spletne strani ${project.title}`}
                fill
                sizes="340px"
                className="object-cover object-top"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
