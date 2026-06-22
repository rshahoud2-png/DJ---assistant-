"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Save } from "lucide-react";
import { savePlaylistImport } from "../actions";
import type { ImportedTrackDraft, PlaylistParseResult } from "@/lib/playlist-import";

const confidenceClass = {
  high: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  medium: "border-yellow-400/40 bg-yellow-400/10 text-yellow-100",
  low: "border-red-400/40 bg-red-400/10 text-red-200",
};

export function ReviewClient() {
  const [result, setResult] = useState<PlaylistParseResult | null>(null);
  const [tracks, setTracks] = useState<ImportedTrackDraft[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("dj-agent-import-review");
    if (!stored) return;
    const parsed = JSON.parse(stored) as PlaylistParseResult;
    window.setTimeout(() => { setResult(parsed); setTracks(parsed.tracks); }, 0);
  }, []);

  const warnings = useMemo(() => tracks.filter((track) => track.warnings.length).length, [tracks]);
  const payload = result ? JSON.stringify({ ...result, tracks }) : "";

  function update(index: number, field: keyof ImportedTrackDraft, value: string) {
    setTracks((current) => current.map((track, row) => row === index ? { ...track, [field]: field === "bpm" || field === "duration" ? Number(value) || null : value } : track));
  }

  if (!result) {
    return (
      <main className="page-shell">
        <div className="glass-card rounded-lg p-8">
          <h1 className="text-3xl font-black">No import waiting for review</h1>
          <p className="mt-2 text-[var(--muted-foreground)]">Upload a library export or paste a track list first.</p>
          <Link className="btn btn-primary mt-5" href="/import">Start import</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--accent)]">Review Import</p>
          <h1 className="mt-3 text-4xl font-black md:text-5xl">{result.sourceName}</h1>
          <p className="mt-2 text-[var(--muted-foreground)]">{tracks.length} parsed tracks - {warnings} rows need attention</p>
        </div>
        <form action={savePlaylistImport}>
          <input type="hidden" name="payload" value={payload} />
          <button className="btn btn-primary gap-2"><Save className="h-4 w-4" /> Save to library</button>
        </form>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-[var(--border)] bg-black/50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
              <tr><th className="px-4 py-3">Confidence</th><th className="px-4 py-3">Title</th><th className="px-4 py-3">Artist</th><th className="px-4 py-3">Album</th><th className="px-4 py-3">Genre</th><th className="px-4 py-3">BPM</th><th className="px-4 py-3">Key</th><th className="px-4 py-3">Path / URL</th><th className="px-4 py-3">Warnings</th></tr>
            </thead>
            <tbody>
              {tracks.map((track, index) => (
                <tr key={`${track.rowIndex}-${index}`} className="border-t border-white/10">
                  <td className="px-4 py-3"><span className={`rounded-full border px-2 py-1 text-xs font-bold ${confidenceClass[track.confidence]}`}>{track.confidence}</span></td>
                  <td className="px-4 py-3"><input className="field min-w-40" value={track.title} onChange={(event) => update(index, "title", event.target.value)} /></td>
                  <td className="px-4 py-3"><input className="field min-w-36" value={track.artist} onChange={(event) => update(index, "artist", event.target.value)} /></td>
                  <td className="px-4 py-3"><input className="field min-w-32" value={track.album ?? ""} onChange={(event) => update(index, "album", event.target.value)} /></td>
                  <td className="px-4 py-3"><input className="field min-w-28" value={track.genre ?? ""} onChange={(event) => update(index, "genre", event.target.value)} /></td>
                  <td className="px-4 py-3"><input className="field w-24" value={track.bpm ?? ""} onChange={(event) => update(index, "bpm", event.target.value)} /></td>
                  <td className="px-4 py-3"><input className="field w-28" value={track.musical_key ?? ""} onChange={(event) => update(index, "musical_key", event.target.value)} /></td>
                  <td className="px-4 py-3"><input className="field min-w-56" value={track.file_path || track.external_url || ""} onChange={(event) => update(index, "file_path", event.target.value)} /></td>
                  <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">{track.warnings.length ? <span><AlertTriangle className="mr-1 inline h-3 w-3 text-yellow-300" />{track.warnings.join(", ")}</span> : <span><CheckCircle2 className="mr-1 inline h-3 w-3 text-emerald-300" />Ready</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
