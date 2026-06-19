import { SongForm } from "@/components/song-form";

export default function UploadSongPage() {
  return (
    <main className="page-shell max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--accent)]">Library Intake</p>
      <h1 className="mb-6 mt-3 text-4xl font-black md:text-5xl">Upload song</h1>
      <SongForm />
    </main>
  );
}
