import { Logo } from "@/components/ui/Logo";
import { CONTACT_EMAIL, NAV_LINKS } from "@/content/site";

export function Footer() {
  return (
    <footer className="eyebrow mt-auto flex flex-wrap items-center justify-between gap-6 border-t border-white/[0.08] py-7 text-muted">
      <div className="flex items-center gap-4">
        <Logo height={28} />
        <span>© {new Date().getFullYear()} PG INŽENIRING</span>
      </div>

      <nav aria-label="Hitre povezave" className="hidden items-center gap-6 nav:flex">
        {NAV_LINKS.slice(0, 5).map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            data-cursor="link"
            className="text-dim transition-colors hover:text-white"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-6">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          data-cursor="link"
          className="hidden text-subtle transition-colors hover:text-brand sm:inline"
        >
          {CONTACT_EMAIL}
        </a>
        <a href="#domov" data-cursor="link" className="text-white transition-colors hover:text-brand">
          NA VRH ↑
        </a>
      </div>
    </footer>
  );
}
