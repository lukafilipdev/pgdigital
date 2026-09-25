"use client";

import Image from "next/image";
import { useState } from "react";
import { projectScreenshot, type Project } from "@/content/site";
import { cn } from "@/lib/cn";

const MODES = [
  { id: "desktop", label: "NAMIZNI" },
  { id: "mobile", label: "MOBILNI" },
] as const;

type Mode = (typeof MODES)[number]["id"];

/**
 * The project's live website in a browser frame. The screenshot is shown
 * until the iframe has loaded, so the header is never empty.
 */
export function LivePreview({ project }: { project: Project }) {
  const [mode, setMode] = useState<Mode>("desktop");
  const [loaded, setLoaded] = useState(false);
  const host = new URL(project.url).host;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-line-strong bg-[#050505]">
      <div className="eyebrow-sm flex h-11 shrink-0 items-center gap-3 border-b border-line px-4 text-muted">
        <span className={cn("size-1.5 rounded-full", loaded ? "bg-brand" : "bg-[#444]")} />
        <span className="min-w-0 flex-1 truncate tracking-[.08em] text-[#bdbdbd]">{host}</span>
        <div role="group" aria-label="Velikost predogleda" className="hidden gap-1 sm:flex">
          {MODES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={mode === id}
              onClick={() => setMode(id)}
              data-cursor="link"
              className={cn(
                "cursor-pointer rounded-full px-3 py-1.5 transition-colors",
                mode === id ? "bg-white text-black" : "hover:text-white",
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
          className="transition-colors hover:text-brand"
        >
          ODPRI ↗
        </a>
      </div>

      <div className="relative flex min-h-0 flex-1 justify-center bg-[#0b0b0b]">
        <Image
          src={projectScreenshot(project.slug, "cover")}
          alt=""
          fill
          sizes="100vw"
          className={cn("object-cover object-top transition-opacity duration-500", loaded && "opacity-0")}
        />
        <iframe
          src={project.url}
          title={`Predogled spletne strani ${project.title}`}
          // The page's custom cursor can't follow the pointer inside the frame.
          data-cursor="none"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setLoaded(true)}
          className={cn(
            "relative h-full border-0 transition-[width,opacity] duration-500 ease-smooth",
            mode === "mobile" ? "w-[390px] max-w-full border-x border-line-strong" : "w-full",
            !loaded && "opacity-0",
          )}
        />
      </div>
    </div>
  );
}
