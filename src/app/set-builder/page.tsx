import Link from "next/link";
import { AudioLines, Disc3, FileDown, ListMusic, Route, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";

const priorities = [
  ["Set Builder Engine", "Scores tracks by BPM, key, genre, energy progression, event type, and crowd demographics.", ListMusic],
  ["Transition Engine", "Chooses blend, echo out, loop transition, fade, cut, or drop swap with DJ reasoning.", Route],
  ["Cue Point Engine", "Estimates intro, mix-in, mix-out, drop, loop, and transition length from metadata.", AudioLines],
  ["Performance View", "Displays a live-event roadmap with song-by-song instructions.", Disc3],
];

export default async function SetBuilderPage() {
  const { supabase } = await requireUser();
  const [{ data: gigs }, { data: setlists }] = await Promise.all([
    supabase.from("gigs").select("id,name,venue,event_date").order("created_at", { ascending: false }).limit(5),
    supabase.from("setlists").select("id,name,created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  return (
    <main className="page-shell">
      <section className="glass-card rounded-lg p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--accent)]">Set Builder</p>
        <h1 className="mt-3 text-4xl font-black md:text-6xl">Generate the performance roadmap.</h1>
        <p className="mt-4 max-w-3xl text-[var(--muted-foreground)]">DJ Agent does not create a basic playlist. It creates warmup, build-up, peak-time, cooldown, and closing sections with cue notes and transition instructions.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="btn btn-primary gap-2" href="/gigs/new"><Sparkles className="h-4 w-4" /> Create event</Link>
          <Link className="btn btn-secondary gap-2" href="/import"><FileDown className="h-4 w-4" /> Import library</Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {priorities.map(([title, copy, Icon]) => (
          <div key={title as string} className="glass-card rounded-lg p-5">
            <Icon className="mb-4 h-7 w-7 text-[var(--accent)]" />
            <h2 className="font-bold">{title as string}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{copy as string}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Events ready for building">
          {gigs?.length ? gigs.map((gig) => (
            <Link key={gig.id} className="rounded-md border border-white/10 bg-white/[0.04] p-4 hover:border-[var(--accent)]/60" href={`/gigs/${gig.id}`}>{gig.name}</Link>
          )) : <p className="text-sm text-[var(--muted-foreground)]">Create an event first.</p>}
        </Panel>
        <Panel title="Generated sets">
          {setlists?.length ? setlists.map((setlist) => (
            <Link key={setlist.id} className="rounded-md border border-white/10 bg-white/[0.04] p-4 hover:border-[var(--accent)]/60" href={`/setlists/${setlist.id}`}>{setlist.name}</Link>
          )) : <p className="text-sm text-[var(--muted-foreground)]">No generated sets yet.</p>}
        </Panel>
      </section>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="glass-card grid gap-3 rounded-lg p-5"><h2 className="text-xl font-bold">{title}</h2>{children}</section>;
}
