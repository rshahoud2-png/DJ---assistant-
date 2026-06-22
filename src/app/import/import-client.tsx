"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { FileAudio, FileText, UploadCloud } from "lucide-react";
import { parsePlaylist, type PlaylistSource } from "@/lib/playlist-import";

const supported = ["CSV", "TXT", "M3U", "M3U8", "PLS", "XSPF", "JSON", "Rekordbox XML", "Serato text", "VirtualDJ XML"];

export function ImportClient() {
  const router = useRouter();
  const [paste, setPaste] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const saveAndReview = useCallback((content: string, sourceName: string, forcedType?: PlaylistSource) => {
    try {
      const parsed = parsePlaylist(content, sourceName, forcedType);
      localStorage.setItem("dj-agent-import-review", JSON.stringify(parsed));
      router.push("/import/review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not parse that library file.");
    }
  }, [router]);

  async function handleFile(file?: File) {
    if (!file) return;
    const content = await file.text();
    saveAndReview(content, file.name);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); void handleFile(event.dataTransfer.files?.[0]); }}
        className={`glass-card rounded-lg p-6 transition ${dragging ? "border-[var(--accent)] bg-[var(--accent)]/10" : ""}`}
      >
        <div className="grid min-h-72 place-items-center rounded-lg border border-dashed border-[var(--accent)]/40 bg-black/30 p-8 text-center">
          <div>
            <UploadCloud className="mx-auto h-14 w-14 text-[var(--accent)]" />
            <h2 className="mt-4 text-2xl font-black">Drop a DJ library export</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">Metadata-only import. DJ Agent will not download streaming audio.</p>
            <label className="btn btn-primary mt-6 inline-flex cursor-pointer">
              Choose file
              <input className="sr-only" type="file" accept=".csv,.txt,.m3u,.m3u8,.pls,.xspf,.json,.xml" onChange={(event) => void handleFile(event.target.files?.[0])} />
            </label>
          </div>
        </div>
        {error ? <p className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}
      </section>

      <section className="glass-card rounded-lg p-6">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-[var(--accent)]" />
          <h2 className="text-2xl font-black">Manual paste list</h2>
        </div>
        <textarea className="field mt-4 min-h-56" value={paste} onChange={(event) => setPaste(event.target.value)} placeholder="Artist - Title&#10;Fairuz - Nassam Alayna El Hawa&#10;Daft Punk - One More Time" />
        <button className="btn btn-primary mt-4 w-full" type="button" onClick={() => saveAndReview(paste, "manual paste", "manual")} disabled={!paste.trim()}>
          Parse pasted list
        </button>
        <div className="mt-6 grid grid-cols-2 gap-2 text-xs text-[var(--muted-foreground)]">
          {supported.map((item) => <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2"><FileAudio className="mr-1 inline h-3 w-3 text-[var(--accent)]" />{item}</span>)}
        </div>
      </section>
    </div>
  );
}
