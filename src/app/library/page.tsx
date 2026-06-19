import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function LibraryPage() {
  const { supabase } = await requireUser();
  const { data: songs, error } = await supabase.from("songs").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Music library</h1>
        <Link className="btn btn-primary" href="/library/upload">Upload song</Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-lg border border-[var(--border)] bg-white">
        {songs?.length ? songs.map((song) => (
          <Link key={song.id} href={`/library/song/${song.id}`} className="grid gap-1 border-b border-[var(--border)] p-4 last:border-0 hover:bg-[var(--muted)]">
            <span className="font-semibold">{song.title} - {song.artist}</span>
            <span className="text-sm text-[var(--muted-foreground)]">{song.genre || "No genre"} · {song.bpm || "No BPM"} BPM · {song.camelot_key || "No key"}</span>
          </Link>
        )) : <p className="p-5 text-sm text-[var(--muted-foreground)]">No songs yet. Manual metadata entry is required for the MVP.</p>}
      </div>
    </main>
  );
}
