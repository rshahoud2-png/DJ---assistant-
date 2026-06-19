import { notFound } from "next/navigation";
import { SongForm } from "@/components/song-form";
import { requireUser } from "@/lib/auth";

export default async function EditSongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const { data: song } = await supabase.from("songs").select("*").eq("id", id).single();
  if (!song) notFound();
  const signed = song.file_path
    ? await supabase.storage.from("song-files").createSignedUrl(song.file_path, 60 * 10)
    : null;

  return (
    <main className="page-shell max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--accent)]">Track Metadata</p>
      <h1 className="mb-6 mt-3 text-4xl font-black md:text-5xl">Edit song metadata</h1>
      {signed?.data?.signedUrl ? (
        <section className="glass-card mb-6 rounded-lg p-5">
          <h2 className="font-semibold">Private playback</h2>
          <p className="mb-3 text-sm text-[var(--muted-foreground)]">This audio uses a 10-minute signed Supabase Storage URL.</p>
          <audio className="w-full" controls src={signed.data.signedUrl} />
        </section>
      ) : null}
      <SongForm song={song} />
    </main>
  );
}
