import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { projectScreenshot, SCREENSHOTS, type CardView, type Project } from "@/content/site";
import { cn } from "@/lib/cn";
import { padNumber } from "@/lib/math";

const IMAGE_SIZES: Record<CardView, string> = {
  desktop: "(min-width: 640px) 46vw, 350px",
  phone: "(min-width: 640px) 15vw, 120px",
};

type ProjectCardProps = {
  project: Project;
  index: number;
  onOpen: (origin: DOMRect) => void;
};

/**
 * All cards share the track's `--card-h` height; the width follows the aspect
 * ratio of the card's screenshot, so the image is always shown in full.
 */
export function ProjectCard({ project, index, onOpen }: ProjectCardProps) {
  const { width, height } = SCREENSHOTS[project.cardView].viewport;
  const phone = project.cardView === "phone";

  return (
    <article className={cn("flex flex-none flex-col gap-[18px]", phone ? "w-max" : "w-min")}>
      <button
        type="button"
        data-cursor="view"
        data-cursor-label="POGLEJ"
        aria-label={`Odpri projekt ${project.title}`}
        onClick={(event) => onOpen(event.currentTarget.getBoundingClientRect())}
        className="relative block h-(--card-h) cursor-pointer overflow-hidden rounded-xl bg-[#111] ring-1 ring-white/10 transition-shadow duration-300 hover:ring-brand"
        style={{ width: `calc(var(--card-h) * ${width / height})` }}
      >
        <ImagePlaceholder
          label={`Spletna stran ${project.title}`}
          src={projectScreenshot(project.slug, "card")}
          sizes={IMAGE_SIZES[project.cardView]}
        />
      </button>

      <div
        className={cn(
          "flex gap-4",
          phone ? "flex-col gap-2.5" : "flex-wrap items-baseline justify-between",
        )}
      >
        <h3
          className={cn(
            "text-[clamp(26px,2.8vw,48px)] leading-none font-bold tracking-[-.05em]",
            // A phone card is narrow; let the caption run wider than the image.
            phone && "whitespace-nowrap",
          )}
        >
          {project.title}
        </h3>
        <span className="eyebrow text-muted">
          <span className="text-brand">{padNumber(index + 1, 2)}</span> · {project.category} ·{" "}
          {project.year}
        </span>
      </div>
    </article>
  );
}
