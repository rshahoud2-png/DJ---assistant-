import type { ConfidenceLevel, RawTrackInput } from "./types";

export function confidenceForTrack(track: RawTrackInput): { confidence: ConfidenceLevel; score: number; warnings: string[] } {
  const warnings: string[] = [];
  const hasTitle = Boolean(track.title?.trim());
  const hasArtist = Boolean(track.artist?.trim());
  const hasBpm = typeof track.bpm === "number" && track.bpm > 0;
  const hasKey = Boolean(track.musical_key?.trim() || track.camelot_key?.trim());
  if (!hasTitle) warnings.push("Missing title");
  if (!hasArtist) warnings.push("Missing artist");
  if (!hasBpm) warnings.push("Missing BPM");
  if (!hasKey) warnings.push("Missing key");
  if (hasTitle && hasArtist && hasBpm && hasKey) return { confidence: "high", score: 92, warnings };
  if (hasTitle && hasArtist) return { confidence: "medium", score: 68, warnings };
  return { confidence: "low", score: 35, warnings };
}
