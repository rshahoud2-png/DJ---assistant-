import { SongForm } from "@/components/song-form";

export default function UploadSongPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Upload song</h1>
      <SongForm />
    </main>
  );
}
