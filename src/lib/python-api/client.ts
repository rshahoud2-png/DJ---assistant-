export type TrackAnalysis = {
  title?: string | null;
  artist?: string | null;
  estimated_bpm: number;
  duration: number;
  beat_timestamps: number[];
  intro_cue: number;
  mix_in_cue: number;
  mix_out_cue: number;
  drop_cue: number;
  loop_cue: Record<string, number>;
  energy_curve: number[];
  analysis_confidence: number;
  metadata?: Record<string, unknown>;
};

export type TransitionAnalysis = {
  transition_compatibility_score: number;
  bpm_difference: number;
  recommended_transition_type: "Blend" | "Echo Out" | "Loop Transition" | "Fade" | "Cut" | "Drop Swap";
  transition_bars: number;
  mix_out_instruction: string;
  mix_in_instruction: string;
  dj_performance_instruction: string;
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
  return requestJson<{ status: string; service: string }>("/health");
}

export async function analyzeTrackWithPython(file: File) {
  const form = new FormData();
  form.append("file", file);
  return requestJson<TrackAnalysis>("/analyze-track", { method: "POST", body: form });
}

export async function generateCuesWithPython(track: TrackAnalysis) {
  return requestJson("/generate-cues", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ track }),
  });
}

export async function analyzeTransitionWithPython(currentTrack: TrackAnalysis, nextTrack: TrackAnalysis) {
  return requestJson<TransitionAnalysis>("/analyze-transition", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ current_track: currentTrack, next_track: nextTrack }),
  });
}

export async function generateSetAnalysisWithPython(eventProfile: Record<string, unknown>, tracks: TrackAnalysis[]) {
  return requestJson("/generate-set-analysis", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ event_profile: eventProfile, tracks }),
  });
}
