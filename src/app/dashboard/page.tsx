import Link from "next/link";
import { CalendarClock, Disc3, FolderKanban, Library, ListMusic, Plus, Sparkles, Upload } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { AnimatedCounter, HoverCard } from "@/components/motion";
import { Waveform } from "@/components/dj-visuals";

export default async function DashboardPage() {
  const { supabase } = await requireUser();
  const [{ count: songCount }, { count: gigCount }, { count: crateCount }, { count: setlistCount }, { data: setlists }, { data: gigs }, { data: songs }] = await Promise.all([
    supabase.from("songs").select("*", { count: "exact", head: true }),
    supabase.from("gigs").select("*", { count: "exact", head: true }),
    supabase.from("crates").select("*", { count: "exact", head: true }),
    supabase.from("setlists").select("*", { count: "exact", head: true }),
    supabase.from("setlists").select("id,name,created_at").order("created_at", { ascending: false }).limit(4),
    supabase.from("gigs").select("id,name,event_date,venue").order("created_at", { ascending: false }).limit(5),
    supabase.from("songs").select("id,title,artist,bpm,camelot_key,genre,created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  return (
    <main className="page-shell">
      <section className="glass-card relative overflow-hidden rounded-lg p-6 md:p-8">
        <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-[var(--accent)]/20 blur-3xl" />
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--accent)]">DJ Control Center</p>
        <div className="mt-3 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-4xl font-black md:text-6xl">Tonight starts here.</h1>
            <p className="mt-3 max-w-2xl text-[var(--muted-foreground)]">Plan gigs, shape energy curves, manage crates, and generate clean setlists from your music library.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/library/upload" className="btn btn-secondary gap-2"><Upload className="h-4 w-4" /> Upload song</Link>
            <Link href="/gigs/new" className="btn btn-primary gap-2"><Sparkles className="h-4 w-4" /> New gig</Link>
          </div>
        </div>
        <div className="mt-8">
          <Waveform bars={34} />
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total Songs" value={songCount ?? 0} icon={Library} />
        <Metric label="Total Gigs" value={gigCount ?? 0} icon={CalendarClock} />
        <Metric label="Total Crates" value={crateCount ?? 0} icon={FolderKanban} />
        <Metric label="Generated Setlists" value={setlistCount ?? 0} icon={ListMusic} />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Recent gigs" action={<Link href="/gigs/new" className="text-sm font-semibold text-[var(--accent)]">Create gig</Link>}>
          <ListEmpty items={gigs} empty="No gigs yet. Create a gig questionnaire to unlock setlists." render={(gig) => (
            <Link href={`/gigs/${gig.id}`} className="flex items-center gap-4 rounded-md border border-white/10 bg-white/[0.04] p-4 hover:border-[var(--accent)]/60">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-[var(--accent)]/15 text-[var(--accent)]"><CalendarClock className="h-5 w-5" /></span>
              <span>
                <span className="block font-semibold">{gig.name}</span>
                <span className="text-sm text-[var(--muted-foreground)]">{gig.venue || "Venue TBD"} {gig.event_date ? `- ${gig.event_date}` : ""}</span>
              </span>
            </Link>
          )} />
        </Panel>

        <Panel title="Quick actions">
          <div className="grid gap-3">
            <Quick href="/library/upload" icon={Upload} label="Upload music" copy="Add tracks and metadata." />
            <Quick href="/gigs/new" icon={Plus} label="Plan new gig" copy="Build event requirements." />
            <Quick href="/crates" icon={FolderKanban} label="Open crates" copy="Organize your library." />
          </div>
        </Panel>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Recently uploaded songs">
          <ListEmpty items={songs} empty="No songs uploaded yet." render={(song) => (
            <Link href={`/library/song/${song.id}`} className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.04] p-4 hover:border-[var(--accent)]/60">
              <span>
                <span className="block font-semibold">{song.title}</span>
                <span className="text-sm text-[var(--muted-foreground)]">{song.artist} - {song.genre || "No genre"}</span>
              </span>
              <span className="rounded-full bg-[var(--accent)]/15 px-3 py-1 text-xs font-bold text-[var(--accent)]">{song.bpm || "--"} BPM</span>
            </Link>
          )} />
        </Panel>
        <Panel title="Generated setlists">
          <ListEmpty items={setlists} empty="No generated setlists yet." render={(setlist) => (
            <Link href={`/setlists/${setlist.id}`} className="flex items-center gap-4 rounded-md border border-white/10 bg-white/[0.04] p-4 hover:border-[var(--accent)]/60">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-[var(--accent)]/15 text-[var(--accent)]"><Disc3 className="h-5 w-5" /></span>
              <span className="font-semibold">{setlist.name}</span>
            </Link>
          )} />
        </Panel>
      </section>
    </main>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Library }) {
  return (
    <HoverCard className="glass-card rounded-lg p-5">
      <div className="flex items-center justify-between">
        <Icon className="h-7 w-7 text-[var(--accent)]" />
        <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted-foreground)]">Live</span>
      </div>
      <p className="mt-6 text-sm text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-2 text-4xl font-black"><AnimatedCounter value={value} /></p>
    </HoverCard>
  );
}

function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="glass-card rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ListEmpty<T>({ items, empty, render }: { items: T[] | null; empty: string; render: (item: T) => React.ReactNode }) {
  if (!items?.length) return <p className="rounded-md border border-white/10 bg-white/[0.04] p-4 text-sm text-[var(--muted-foreground)]">{empty}</p>;
  return <div className="grid gap-3">{items.map(render)}</div>;
}

function Quick({ href, icon: Icon, label, copy }: { href: string; icon: typeof Upload; label: string; copy: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 rounded-md border border-white/10 bg-white/[0.04] p-4 hover:border-[var(--accent)]/60 hover:bg-[var(--accent)]/10">
      <span className="grid h-11 w-11 place-items-center rounded-md bg-[var(--accent)] text-black"><Icon className="h-5 w-5" /></span>
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="text-sm text-[var(--muted-foreground)]">{copy}</span>
      </span>
    </Link>
  );
}
