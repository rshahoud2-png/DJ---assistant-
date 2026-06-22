import { notFound } from "next/navigation";
import { AudioLines, Disc3, Download, Gauge, KeyRound, Mic2, Music2, Route } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { EnergyMeter, MiniGraph } from "@/components/dj-visuals";

export default async function SetlistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const [{ data: setlist }, { data: tracks }] = await Promise.all([
    supabase.from("setlists").select("*").eq("id", id).single(),
    supabase.from("setlist_tracks").select("*, songs(*)").eq("setlist_id", id).order("position"),
  ]);
  if (!setlist) notFound();

  const energyValues = tracks?.map((track) => track.songs?.energy_level ?? 5) ?? [3, 5, 7, 8, 6];
  const bpmValues = tracks?.map((track) => track.songs?.bpm ?? 100) ?? [90, 104, 118, 126, 120];

  return (
    <main className="page-shell">
      <section className="glass-card overflow-hidden rounded-lg p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--accent)]">Generated Set</p>
        <div className="mt-3 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-4xl font-black md:text-6xl">{setlist.name}</h1>
            <p className="mt-3 max-w-3xl text-[var(--muted-foreground)]">{setlist.energy_curve_explanation}</p>
          </div>
          <div className="rounded-md border border-[var(--border)] bg-[var(--accent)]/10 px-4 py-3 text-sm font-semibold text-[var(--accent)]">
            {tracks?.length ?? 0} roadmap tracks
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <a className="btn btn-primary gap-2" href={`/setlists/${id}/export?format=csv`}><Download className="h-4 w-4" /> Export CSV</a>
          <a className="btn btn-secondary gap-2" href={`/setlists/${id}/export?format=json`}><Download className="h-4 w-4" /> Export JSON</a>
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <MiniGraph label="Energy curve graph" values={energyValues} />
        <MiniGraph label="BPM progression graph" values={bpmValues} />
      </section>

      <section className="mt-6 glass-card rounded-lg p-5">
        <div className="mb-6 flex items-center gap-3">
          <Route className="h-6 w-6 text-[var(--accent)]" />
          <h2 className="text-2xl font-bold">DJ Performance View</h2>
        </div>
        <div className="relative grid gap-4">
          <div className="absolute left-6 top-0 hidden h-full w-px bg-gradient-to-b from-[var(--accent)] via-white/20 to-transparent md:block" />
          {tracks?.map((track) => (
            <article key={track.id} className="relative grid gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-5 hover:border-[var(--accent)]/60 md:grid-cols-[auto_1fr]">
              <span className="z-10 grid h-12 w-12 place-items-center rounded-full bg-[var(--accent)] text-lg font-black text-black shadow-[0_0_30px_rgba(245,197,66,.25)]">
                {track.position}
              </span>
              <div>
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">{track.section || "Roadmap"}</p>
                    <h3 className="text-xl font-bold">{track.songs?.title ?? "Deleted song"}</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">{track.songs?.artist ?? ""}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Pill icon={Gauge}>{track.songs?.bpm ?? "--"} BPM</Pill>
                    <Pill icon={KeyRound}>{track.songs?.camelot_key ?? track.songs?.musical_key ?? "No key"}</Pill>
                    <Pill icon={AudioLines}>Score {track.score}</Pill>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <EnergyMeter value={track.songs?.energy_level} />
                  <span className="text-sm text-[var(--muted-foreground)]">{track.songs?.genre ?? "No genre"} - {track.songs?.mood ?? "No mood"}</span>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <Note title="Reason selected" icon={Music2} text={track.selected_reason} />
                  <Note title="Cue notes" icon={Disc3} text={`Intro: ${track.intro_cue || "0:00"}. Mix in: ${track.mix_in_cue || "estimated"}. Mix out: ${track.mix_out_cue || "estimated"}. Drop: ${track.drop_cue || "estimated"}. Loop: ${track.loop_cue || "16 bars"}.`} />
                  <Note title="Transition" icon={KeyRound} text={`${track.transition_type || "Blend"} over ${track.transition_bars || 16} bars. ${track.transition_instruction || track.bpm_transition_note || "Follow phrase timing."}`} />
                </div>
                <div className="mt-3">
                  <Note title="Performance instructions" icon={Route} text={track.performance_instructions || "Use intro and mix-out cues to preserve phrase timing."} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <Info title="Warnings" items={setlist.warnings} />
        <Info title="Suggested songs or tags" items={setlist.suggestions} />
        <Info title="DJ microphone notes" items={setlist.dj_notes} icon={Mic2} />
      </section>
    </main>
  );
}

function Pill({ icon: Icon, children }: { icon: typeof Gauge; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--accent)]/10 px-3 py-1 text-xs font-bold text-[var(--accent)]">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

function Note({ title, text, icon: Icon }: { title: string; text: string; icon: typeof Music2 }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/35 p-4">
      <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]"><Icon className="h-4 w-4" /> {title}</p>
      <p className="text-sm leading-6 text-[var(--muted-foreground)]">{text}</p>
    </div>
  );
}

function Info({ title, items, icon: Icon = AudioLines }: { title: string; items: string[]; icon?: typeof AudioLines }) {
  return (
    <section className="glass-card rounded-lg p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold"><Icon className="h-5 w-5 text-[var(--accent)]" /> {title}</h2>
      {items?.length ? (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
          {items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      ) : <p className="mt-3 text-sm text-[var(--muted-foreground)]">No notes for this section.</p>}
    </section>
  );
}
