export type CuePoint = {
  label: string;
  name: string;
  timestamp: number;
  reason: string;
  confidence: number;
};

export type LoopSuggestion = {
  start: number;
  end: number;
  bars: number;
  reason: string;
  confidence: number;
};

export type TrackAnalysis = {
  title?: string | null;
  artist?: string | null;
  estimated_bpm: number;
  duration: number;
  beat_timestamps: number[];
  downbeat_timestamps: number[];
  phrase_boundaries: number[];
  intro_cue: number;
  mix_in_cue: number;
  mix_out_cue: number;
  drop_cue: number;
  loop_cue: Record<string, number | string>;
  energy_curve: number[];
  onset_strength: number[];
  spectral_flux: number[];
  novelty_curve: number[];
  structure?: Record<string, unknown> | null;
  confidence_scores: Record<string, number>;
  analysis_confidence: number;
  warnings: string[];
  metadata?: Record<string, unknown>;
};

export type CueResponse = {
  hot_cues: CuePoint[];
  loop_suggestion: LoopSuggestion;
  suggested_transition_length_bars: number;
  dj_notes: string[];
  warnings: string[];
};

export type TransitionAnalysis = {
  compatibility_score: number;
  bpm_difference: number;
  recommended_transition_type: "Blend" | "Echo Out" | "Loop Transition" | "Fade" | "Cut" | "Drop Swap" | "Slam Mix";
  suggested_transition_length_bars: number;
  current_track_mix_out_cue: number;
  next_track_mix_in_cue: number;
  current_track_phrase_alignment_notes: string;
  next_track_phrase_alignment_notes: string;
  energy_compatibility: string;
  bpm_compatibility: string;
  structure_compatibility: string;
  warnings: string[];
  dj_performance_instruction: string;
};

export type SetAnalysisResponse = {
  ordered_setlist: Array<{ position: number; section: string; track: TrackAnalysis; cue_notes: string[]; transition_notes: string[]; warnings: string[] }>;
  event_sections: string[];
  song_by_song_cue_notes: string[];
  transition_notes: string[];
  warnings: string[];
  confidence_score: number;
};

function pythonApiBaseUrl() {
  const viteUrl = typeof process !== "undefined" ? process.env.VITE_PYTHON_API_URL : undefined;
  const nextUrl = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_PYTHON_API_URL : undefined;
  const url = nextUrl || viteUrl;
  if (!url) throw new Error("Missing NEXT_PUBLIC_PYTHON_API_URL or VITE_PYTHON_API_URL");
  return url.replace(/\/$/, "");
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${pythonApiBaseUrl()}${path}`, init);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Python API request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function checkPythonApiHealth() {
  return requestJson<{ status: string; service: string; analysis_engine?: string }>("/health");
}

export async function analyzeTrackWithPython(file: File) {
  const form = new FormData();
  form.append("file", file);
  return requestJson<TrackAnalysis>("/analyze-track", { method: "POST", body: form });
}

export async function generateCuesWithPython(track: TrackAnalysis) {
  return requestJson<CueResponse>("/generate-cues", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ track }),
  });
}

export async function analyzeTransitionWithPython(currentTrack: TrackAnalysis, nextTrack: TrackAnalysis, eventSection?: string, desiredEnergyDirection?: "up" | "down" | "maintain") {
  return requestJson<TransitionAnalysis>("/analyze-transition", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ current_track: currentTrack, next_track: nextTrack, event_section: eventSection, desired_energy_direction: desiredEnergyDirection }),
  });
}

export async function generateSetAnalysisWithPython(eventProfile: Record<string, unknown>, tracks: TrackAnalysis[]) {
  return requestJson<SetAnalysisResponse>("/generate-set-analysis", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ event_profile: eventProfile, tracks }),
  });
}
