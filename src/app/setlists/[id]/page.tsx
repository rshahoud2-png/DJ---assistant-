import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";

export default async function SetlistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const [{ data: setlist }, { data: tracks }] = await Promise.all([
    supabase.from("setlists").select("*").eq("id", id).single(),
    supabase.from("setlist_tracks").select("*, songs(*)").eq("setlist_id", id).order("position"),
  ]);
  if (!setlist) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold">{setlist.name}</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">{setlist.energy_curve_explanation}</p>
      <div className="mt-6 grid gap-3">
        {tracks?.map((track) => (
          <article key={track.id} className="rounded-lg border border-[var(--border)] bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{track.position}. {track.songs?.title ?? "Deleted song"} - {track.songs?.artist ?? ""}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{track.songs?.bpm ?? "No BPM"} BPM · {track.songs?.camelot_key ?? "No key"} · Score {track.score}</p>
              </div>
            </div>
            <p className="mt-3 text-sm">{track.selected_reason}</p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{track.bpm_transition_note}</p>
            <p className="text-sm text-[var(--muted-foreground)]">{track.key_compatibility_note}</p>
          </article>
        ))}
      </div>
      <Info title="Warnings" items={setlist.warnings} />
      <Info title="Suggested tags or songs to add later" items={setlist.suggestions} />
      <Info title="DJ notes for special moments" items={setlist.dj_notes} />
    </main>
  );
}

function Info({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <section className="mt-6 rounded-lg border border-[var(--border)] bg-white p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <ul className="mt-3 list-disc pl-5 text-sm text-[var(--muted-foreground)]">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}
