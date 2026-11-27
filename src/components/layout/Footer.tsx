import { ArrowUpIcon } from "@/components/ui/Icons";
import { Logo } from "@/components/ui/Logo";
import { NAV_LINKS } from "@/content/site";

export function Footer() {
  return (
    <footer className="mt-[clamp(16px,4vh,48px)] flex flex-wrap items-center justify-between gap-x-8 gap-y-5 border-t border-white/10 pt-6 font-mono text-[11px] tracking-[.16em] text-white/55">
      <div className="flex items-center gap-4">
        <Logo height={28} />
        <span>© {new Date().getFullYear()} PG INŽENIRING</span>
      </div>

      <nav aria-label="Hitre povezave" className="hidden flex-wrap items-center gap-6 nav:flex">
        {NAV_LINKS.slice(0, 5).map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            data-cursor="link"
            className="text-white/55 transition-colors duration-200 hover:text-brand"
          >
            {label}
          </a>
        ))}
      </nav>

      <a
        href="#domov"
        data-cursor="link"
        className="inline-flex items-center gap-1.5 font-bold text-white transition-colors duration-200 hover:text-brand"
      >
        <span>NA VRH</span>
        <ArrowUpIcon size={14} className="text-brand" />
      </a>
    </footer>
  );
}
