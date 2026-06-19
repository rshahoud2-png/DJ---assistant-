import Link from "next/link";
import { Disc3, Music2, Plus, Search } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { EnergyMeter } from "@/components/dj-visuals";

export default async function LibraryPage() {
  const { supabase } = await requireUser();
  const { data: songs, error } = await supabase.from("songs").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (
    <main className="page-shell">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--accent)]">Music Library</p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">Your sonic arsenal.</h1>
          <p className="mt-3 text-[var(--muted-foreground)]">Manual metadata powers accurate BPM flow, key matching, energy curves, and special moments.</p>
        </div>
        <Link className="btn btn-primary gap-2" href="/library/upload"><Plus className="h-4 w-4" /> Upload song</Link>
      </div>

      <div className="glass-card mt-8 rounded-lg p-4">
        <div className="mb-4 flex items-center gap-3 rounded-md border border-white/10 bg-black/40 px-4 py-3 text-[var(--muted-foreground)]">
          <Search className="h-4 w-4" />
          <span className="text-sm">Library overview - add search/filter controls later without changing schema.</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-separate border-spacing-y-2 text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                <th className="px-3 py-2">Track</th>
                <th className="px-3 py-2">BPM</th>
                <th className="px-3 py-2">Key</th>
                <th className="px-3 py-2">Genre</th>
                <th className="px-3 py-2">Energy</th>
                <th className="px-3 py-2">Mood</th>
              </tr>
            </thead>
            <tbody>
              {songs?.length ? songs.map((song) => (
                <tr key={song.id} className="group">
                  <td className="rounded-l-lg border-y border-l border-white/10 bg-white/[0.04] px-3 py-3 group-hover:border-[var(--accent)]/50">
                    <Link href={`/library/song/${song.id}`} className="flex items-center gap-4">
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-gradient-to-br from-[var(--accent)]/80 to-white/10 text-black shadow-[0_0_30px_rgba(245,197,66,.16)]">
                        <Disc3 className="h-7 w-7" />
                      </span>
                      <span>
                        <span className="block font-bold text-white">{song.title}</span>
                        <span className="text-sm text-[var(--muted-foreground)]">{song.artist}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="border-y border-white/10 bg-white/[0.04] px-3 py-3 group-hover:border-[var(--accent)]/50">
                    <Badge tone={bpmTone(song.bpm)}>{song.bpm || "--"} BPM</Badge>
                  </td>
                  <td className="border-y border-white/10 bg-white/[0.04] px-3 py-3 group-hover:border-[var(--accent)]/50">
                    <Badge tone="gold">{song.camelot_key || song.musical_key || "No key"}</Badge>
                  </td>
                  <td className="border-y border-white/10 bg-white/[0.04] px-3 py-3 group-hover:border-[var(--accent)]/50">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-white">{song.genre || "No genre"}</span>
                  </td>
                  <td className="border-y border-white/10 bg-white/[0.04] px-3 py-3 group-hover:border-[var(--accent)]/50">
                    <EnergyMeter value={song.energy_level} />
                  </td>
                  <td className="rounded-r-lg border-y border-r border-white/10 bg-white/[0.04] px-3 py-3 group-hover:border-[var(--accent)]/50">
                    <span className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)]"><Music2 className="h-4 w-4 text-[var(--accent)]" /> {song.mood || "No mood"}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="rounded-lg border border-white/10 bg-white/[0.04] p-8 text-center text-[var(--muted-foreground)]">
                    No songs yet. Upload your first track and add manual metadata.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "low" | "mid" | "high" | "gold" }) {
  const tones = {
    low: "bg-cyan-400/15 text-cyan-200 border-cyan-300/20",
    mid: "bg-emerald-400/15 text-emerald-200 border-emerald-300/20",
    high: "bg-rose-400/15 text-rose-200 border-rose-300/20",
    gold: "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--border)]",
  };
  return <span className={`rounded-full border px-3 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

function bpmTone(bpm?: number | null): "low" | "mid" | "high" {
  if (!bpm || bpm < 100) return "low";
  if (bpm < 128) return "mid";
  return "high";
}
