import Link from "next/link";
import { Disc3, Headphones, Sparkles } from "lucide-react";

const links = [
  ["Dashboard", "/dashboard"],
  ["Import", "/import"],
  ["Library", "/library"],
  ["Events", "/events"],
  ["Set Builder", "/set-builder"],
  ["Integrations", "/integrations"],
  ["Crates", "/crates"],
  ["Settings", "/settings"],
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-black/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link href="/" className="group flex items-center gap-3 font-bold">
          <span className="grid h-10 w-10 place-items-center rounded-md border border-[var(--border)] bg-[var(--accent)] text-black shadow-[0_0_32px_rgba(245,197,66,.28)]">
            <Disc3 className="h-5 w-5" />
          </span>
          <span>
            <span className="block leading-none">DJ</span>
            <span className="text-xs font-medium uppercase tracking-[0.32em] text-[var(--accent)]">Agent</span>
          </span>
        </Link>
        <div className="hidden flex-wrap items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 text-sm md:flex">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-full px-4 py-2 text-[var(--muted-foreground)] hover:bg-white/10 hover:text-white">
              {label}
            </Link>
          ))}
        </div>
        <Link href="/import" className="btn btn-primary gap-2">
          <Sparkles className="h-4 w-4" />
          Import
        </Link>
        <div className="flex w-full gap-2 overflow-x-auto pb-1 text-sm md:hidden">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[var(--muted-foreground)]">
              {label}
            </Link>
          ))}
        </div>
        <Headphones className="hidden h-5 w-5 text-[var(--accent)] lg:block" />
      </nav>
    </header>
  );
}
