export type ConfidenceLevel = "high" | "medium" | "low";
export type PlaylistSource = "csv" | "txt" | "m3u" | "m3u8" | "pls" | "xspf" | "json" | "rekordbox" | "serato" | "virtualdj" | "manual";

export type ImportedTrackDraft = {
  rowIndex: number;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  bpm?: number | null;
  musical_key?: string;
  camelot_key?: string;
  duration?: number | null;
  file_path?: string;
  external_url?: string;
  source_platform?: string;
  notes?: string;
  confidence: ConfidenceLevel;
  confidence_score: number;
  warnings: string[];
  raw: Record<string, unknown>;
};

export type PlaylistParseResult = {
  sourceType: PlaylistSource;
  sourceName: string;
  tracks: ImportedTrackDraft[];
  warnings: string[];
};

export type RawTrackInput = Partial<Omit<ImportedTrackDraft, "rowIndex" | "confidence" | "confidence_score" | "warnings" | "raw">> & {
  raw?: Record<string, unknown>;
};
