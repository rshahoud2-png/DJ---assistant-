import Link from "next/link";
import { Disc3 } from "lucide-react";

const links = [
  ["Dashboard", "/dashboard"],
  ["Library", "/library"],
  ["New Gig", "/gigs/new"],
  ["Crates", "/crates"],
  ["Settings", "/settings"],
];

export function Nav() {
  return (
    <header className="border-b border-[var(--border)] bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Disc3 className="h-5 w-5 text-[var(--accent)]" />
          AI DJ Assistant
        </Link>
        <div className="flex flex-wrap gap-3 text-sm">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="text-[var(--muted-foreground)] hover:text-black">
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
