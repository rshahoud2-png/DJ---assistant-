import { confidenceForTrack } from "./confidence-score";
import type { ImportedTrackDraft, RawTrackInput } from "./types";

const AUDIO_EXTENSIONS = /\.(mp3|wav|aiff?|flac|m4a|aac|ogg)$/i;

export function parseTitleArtist(value = "") {
  const cleaned = value.replace(/^file:\/\//i, "").split(/[\\/]/).pop()?.replace(AUDIO_EXTENSIONS, "").replace(/[_]+/g, " ").trim() ?? "";
  const parts = cleaned.split(/\s+-\s+/);
  if (parts.length >= 2) return { artist: parts[0].trim(), title: parts.slice(1).join(" - ").trim() };
  return { artist: "", title: cleaned };
}

export function toNumber(value: unknown) {
  const number = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function normalizeTrack(input: RawTrackInput, rowIndex: number): ImportedTrackDraft {
  const guessed = parseTitleArtist(input.title || input.file_path || input.external_url || "");
  const normalized: RawTrackInput = {
    ...input,
    title: (input.title || guessed.title || "Untitled track").trim(),
    artist: (input.artist || guessed.artist || "Unknown artist").trim(),
    bpm: toNumber(input.bpm),
    duration: toNumber(input.duration),
  };
  const confidence = confidenceForTrack(normalized);
  return {
    rowIndex,
    title: normalized.title ?? "Untitled track",
    artist: normalized.artist ?? "Unknown artist",
    album: normalized.album,
    genre: normalized.genre,
    bpm: normalized.bpm,
    musical_key: normalized.musical_key,
    camelot_key: normalized.camelot_key,
    duration: normalized.duration,
    file_path: normalized.file_path,
    external_url: normalized.external_url,
    source_platform: normalized.source_platform,
    notes: normalized.notes,
    confidence: confidence.confidence,
    confidence_score: confidence.score,
    warnings: confidence.warnings,
    raw: normalized.raw ?? {},
  };
}
