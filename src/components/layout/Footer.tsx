import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="eyebrow mt-auto flex flex-wrap items-center justify-between gap-[18px] border-t border-[#171717] py-7 text-muted">
      <div className="flex items-center gap-4">
        <Logo height={20} />
        <span>© {new Date().getFullYear()} PG INŽENIRING</span>
      </div>
      <a href="#domov" data-cursor="link" className="text-white">
        NA VRH ↑
      </a>
    </footer>
  );
}
