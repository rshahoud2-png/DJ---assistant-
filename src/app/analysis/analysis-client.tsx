"use client";

import { useState } from "react";
import { Activity, AlertTriangle, AudioLines, FileAudio, GitCompare, Loader2, Radio } from "lucide-react";
import { analyzeTrackWithPython, analyzeTransitionWithPython, generateCuesWithPython, type CueResponse, type TrackAnalysis, type TransitionAnalysis } from "@/lib/python-api/client";

function seconds(value?: number) {
  if (typeof value !== "number") return "--";
  const minutes = Math.floor(value / 60);
  return `${minutes}:${String(Math.round(value % 60)).padStart(2, "0")}`;
}

export function AnalysisClient() {
  const [trackA, setTrackA] = useState<TrackAnalysis | null>(null);
  const [trackB, setTrackB] = useState<TrackAnalysis | null>(null);
  const [cues, setCues] = useState<CueResponse | null>(null);
  const [transition, setTransition] = useState<TransitionAnalysis | null>(null);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  async function analyze(file: File, slot: "a" | "b") {
    setError("");
    setLoading(`Analyzing ${file.name}...`);
    try {
      const result = await analyzeTrackWithPython(file);
      if (slot === "a") {
        setTrackA(result);
        setCues(await generateCuesWithPython(result));
      } else {
        setTrackB(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading("");
    }
  }

  async function compare() {
    if (!trackA || !trackB) return;
    setError("");
    setLoading("Analyzing transition...");
    try {
      setTransition(await analyzeTransitionWithPython(trackA, trackB));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transition analysis failed.");
    } finally {
      setLoading("");
    }
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-5 lg:grid-cols-2">
        <Uploader label="Track A" onFile={(file) => void analyze(file, "a")} analysis={trackA} />
        <Uploader label="Track B" onFile={(file) => void analyze(file, "b")} analysis={trackB} />
      </section>

      {loading ? <div className="glass-card flex items-center gap-3 rounded-lg p-4 text-[var(--accent)]"><Loader2 className="h-5 w-5 animate-spin" />{loading}</div> : null}
      {error ? <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div> : null}

      {trackA ? <TrackPanel title="Track A Structure" track={trackA} /> : null}
      {cues ? <CuePanel cues={cues} /> : null}

      <section className="glass-card rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-black"><GitCompare className="h-6 w-6 text-[var(--accent)]" /> Transition Analysis</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">Compare Track A into Track B using BPM, energy, structure, phrase, and cue compatibility.</p>
          </div>
          <button className="btn btn-primary" type="button" onClick={() => void compare()} disabled={!trackA || !trackB}>Compare tracks</button>
        </div>
        {transition ? (
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Metric label="Score" value={`${transition.compatibility_score}/100`} />
            <Metric label="Type" value={transition.recommended_transition_type} />
            <Metric label="Bars" value={`${transition.suggested_transition_length_bars}`} />
            <Note title="Mix-out" text={`${seconds(transition.current_track_mix_out_cue)} - ${transition.current_track_phrase_alignment_notes}`} />
            <Note title="Mix-in" text={`${seconds(transition.next_track_mix_in_cue)} - ${transition.next_track_phrase_alignment_notes}`} />
            <Note title="Performance" text={transition.dj_performance_instruction} />
          </div>
        ) : null}
      </section>
    </div>
  );
}

function Uploader({ label, onFile, analysis }: { label: string; onFile: (file: File) => void; analysis: TrackAnalysis | null }) {
  return (
    <label className="glass-card grid cursor-pointer gap-3 rounded-lg p-6 hover:border-[var(--accent)]/60">
      <FileAudio className="h-8 w-8 text-[var(--accent)]" />
      <span className="text-xl font-black">{label}</span>
      <span className="text-sm text-[var(--muted-foreground)]">Upload MP3, WAV, AIFF, FLAC, M4A, AAC, or OGG for real audio analysis.</span>
      <input className="sr-only" type="file" accept="audio/*" onChange={(event) => event.target.files?.[0] && onFile(event.target.files[0])} />
      {analysis ? <span className="rounded-full bg-[var(--accent)]/15 px-3 py-1 text-sm font-bold text-[var(--accent)]">{analysis.estimated_bpm} BPM - {seconds(analysis.duration)}</span> : null}
    </label>
  );
}

function TrackPanel({ title, track }: { title: string; track: TrackAnalysis }) {
  const structure = track.structure as Record<string, { timestamp?: number; confidence?: number; reason?: string }> | null;
  const points = ["intro_start", "intro_end", "vocal_start", "first_drop", "breakdown", "build_up", "outro_start", "outro_end"];
  return (
    <section className="glass-card rounded-lg p-5">
      <h2 className="flex items-center gap-2 text-2xl font-black"><AudioLines className="h-6 w-6 text-[var(--accent)]" /> {title}</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <Metric label="BPM" value={`${track.estimated_bpm}`} />
        <Metric label="Duration" value={seconds(track.duration)} />
        <Metric label="Beats" value={`${track.beat_timestamps.length}`} />
        <Metric label="Confidence" value={`${Math.round(track.analysis_confidence * 100)}%`} />
      </div>
      <div className="mt-5 grid gap-2 md:grid-cols-2">
        {points.map((point) => <Note key={point} title={point.replaceAll("_", " ")} text={`${seconds(structure?.[point]?.timestamp)} - ${Math.round((structure?.[point]?.confidence ?? 0) * 100)}% confidence`} />)}
      </div>
      {track.warnings.length ? <p className="mt-4 text-sm text-yellow-200"><AlertTriangle className="mr-1 inline h-4 w-4" />{track.warnings.join(" ")}</p> : null}
    </section>
  );
}

function CuePanel({ cues }: { cues: CueResponse }) {
  return (
    <section className="glass-card rounded-lg p-5">
      <h2 className="flex items-center gap-2 text-2xl font-black"><Radio className="h-6 w-6 text-[var(--accent)]" /> Cue View</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {cues.hot_cues.map((cue) => <Note key={cue.label} title={`${cue.label}: ${cue.name}`} text={`${seconds(cue.timestamp)} - ${cue.reason} (${Math.round(cue.confidence * 100)}%)`} />)}
      </div>
      <div className="mt-4 rounded-md border border-[var(--accent)]/20 bg-[var(--accent)]/10 p-4 text-sm text-[var(--accent)]">
        Loop: {seconds(cues.loop_suggestion.start)} to {seconds(cues.loop_suggestion.end)} - {cues.loop_suggestion.bars} bars. {cues.loop_suggestion.reason}
      </div>
      <ul className="mt-4 grid gap-2 text-sm text-[var(--muted-foreground)]">{cues.dj_notes.map((note) => <li key={note}>- {note}</li>)}</ul>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-white/10 bg-white/[0.04] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>;
}

function Note({ title, text }: { title: string; text: string }) {
  return <div className="rounded-md border border-white/10 bg-black/30 p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">{title}</p><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{text}</p></div>;
}
