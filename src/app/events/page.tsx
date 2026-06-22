import Link from "next/link";
import { CalendarClock, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";

export default async function EventsPage() {
  const { supabase } = await requireUser();
  const { data: gigs } = await supabase.from("gigs").select("*").order("created_at", { ascending: false });

  return (
    <main className="page-shell">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--accent)]">Events</p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">Plan the room before doors open.</h1>
          <p className="mt-3 max-w-3xl text-[var(--muted-foreground)]">Create event requirements for weddings, Arabic weddings, clubs, lounges, bars, restaurants, corporate events, birthdays, and private events.</p>
        </div>
        <Link className="btn btn-primary gap-2" href="/gigs/new"><Sparkles className="h-4 w-4" /> Create event</Link>
      </div>

      <section className="mt-8 grid gap-4">
        {gigs?.length ? gigs.map((gig) => (
          <Link key={gig.id} href={`/gigs/${gig.id}`} className="glass-card flex items-center gap-4 rounded-lg p-5 hover:border-[var(--accent)]/60">
            <span className="grid h-12 w-12 place-items-center rounded-md bg-[var(--accent)]/15 text-[var(--accent)]"><CalendarClock className="h-6 w-6" /></span>
            <span>
              <span className="block text-lg font-bold">{gig.name}</span>
              <span className="text-sm text-[var(--muted-foreground)]">{gig.venue || "Venue TBD"} {gig.event_date ? `- ${gig.event_date}` : ""}</span>
            </span>
          </Link>
        )) : (
          <div className="glass-card rounded-lg p-8 text-center text-[var(--muted-foreground)]">No events yet. Create one to generate a performance roadmap.</div>
        )}
      </section>
    </main>
  );
}
