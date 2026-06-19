import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function GigsPage() {
  const { supabase } = await requireUser();
  const { data: gigs } = await supabase.from("gigs").select("*").order("created_at", { ascending: false });
  return (
    <main className="page-shell">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--accent)]">Event Plans</p>
          <h1 className="mt-3 text-4xl font-black md:text-5xl">Gigs</h1>
        </div>
        <Link className="btn btn-primary" href="/gigs/new">New gig</Link>
      </div>
      <div className="mt-6 grid gap-3">
        {gigs?.length ? gigs.map((gig) => (
          <Link key={gig.id} href={`/gigs/${gig.id}`} className="glass-card rounded-lg p-4 hover:border-[var(--accent)]/60">
            <p className="font-semibold">{gig.name}</p>
            <p className="text-sm text-[var(--muted-foreground)]">{gig.venue || "No venue"} {gig.event_date ? `· ${gig.event_date}` : ""}</p>
          </Link>
        )) : <p className="glass-card rounded-lg p-5 text-sm text-[var(--muted-foreground)]">No gigs yet.</p>}
      </div>
    </main>
  );
}
