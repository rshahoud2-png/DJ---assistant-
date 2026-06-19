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
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Edit song metadata</h1>
      {signed?.data?.signedUrl ? (
        <section className="mb-6 rounded-lg border border-[var(--border)] bg-white p-5">
          <h2 className="font-semibold">Private playback</h2>
          <p className="mb-3 text-sm text-[var(--muted-foreground)]">This audio uses a 10-minute signed Supabase Storage URL.</p>
          <audio className="w-full" controls src={signed.data.signedUrl} />
        </section>
      ) : null}
      <SongForm song={song} />
    </main>
  );
}
