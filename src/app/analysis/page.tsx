import { AnalysisClient } from "./analysis-client";

export default function AnalysisPage() {
  return (
    <main className="page-shell">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--accent)]">Audio Analysis Brain</p>
      <h1 className="mt-3 text-4xl font-black md:text-6xl">Analyze real tracks, not just metadata.</h1>
      <p className="mt-4 max-w-3xl text-[var(--muted-foreground)]">Send owned audio files to the Python FastAPI backend for BPM, beats, structure, cue estimates, energy curves, loop suggestions, and transition instructions.</p>
      <div className="mt-8"><AnalysisClient /></div>
    </main>
  );
}
