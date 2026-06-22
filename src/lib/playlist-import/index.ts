import { normalizeTrack } from "./normalize-track";
import type { PlaylistParseResult, PlaylistSource, RawTrackInput } from "./types";

export function detectPlaylistSource(fileName: string, content: string): PlaylistSource {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".csv")) return "csv";
  if (lower.endsWith(".m3u8")) return "m3u8";
  if (lower.endsWith(".m3u")) return "m3u";
  if (lower.endsWith(".pls")) return "pls";
  if (lower.endsWith(".xspf")) return "xspf";
  if (lower.endsWith(".json")) return "json";
  if (content.includes("<DJ_PLAYLISTS")) return "rekordbox";
  if (content.includes("<VirtualDJ_Database") || content.includes("<Song FilePath=")) return "virtualdj";
  if (/serato/i.test(fileName)) return "serato";
  return "txt";
}

function splitCsv(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index++) {
    const char = line[index];
    if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else current += char;
  }
  cells.push(current.trim());
  return cells;
}

function parseCsv(content: string) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  const header = splitCsv(lines[0] ?? "").map((cell) => cell.toLowerCase().replace(/\s+/g, "_"));
  const known = ["title", "track", "name", "artist", "album", "genre", "bpm", "key", "camelot", "duration", "path", "file", "url", "comments", "notes"];
  const hasHeader = header.some((cell) => known.includes(cell));
  return (hasHeader ? lines.slice(1) : lines).map((line, index) => {
    const cells = splitCsv(line);
    const raw: RawTrackInput = { raw: { line }, source_platform: "CSV" };
    if (hasHeader) {
      header.forEach((key, cellIndex) => {
        const value = cells[cellIndex];
        if (["title", "track", "name"].includes(key)) raw.title = value;
        if (key === "artist") raw.artist = value;
        if (key === "album") raw.album = value;
        if (key === "genre") raw.genre = value;
        if (key === "bpm") raw.bpm = Number(value);
        if (key === "key") raw.musical_key = value;
        if (key === "camelot") raw.camelot_key = value;
        if (["duration", "length"].includes(key)) raw.duration = Number(value);
        if (["path", "file", "location"].includes(key)) raw.file_path = value;
        if (key === "url") raw.external_url = value;
        if (["comments", "notes"].includes(key)) raw.notes = value;
      });
    } else {
      raw.artist = cells[0];
      raw.title = cells[1] ?? cells[0];
      raw.bpm = Number(cells[2]) || undefined;
      raw.musical_key = cells[3];
    }
    return normalizeTrack(raw, index);
  });
}

function parseText(content: string, source: string) {
  return content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line, index) => {
    const parts = line.split(/\t+/);
    const raw: RawTrackInput = { raw: { line }, source_platform: source };
    if (parts.length >= 2) {
      raw.artist = parts[0];
      raw.title = parts[1];
      raw.bpm = Number(parts.find((part) => /^\d{2,3}(\.\d+)?$/.test(part)));
      raw.musical_key = parts.find((part) => /^[A-G][#b]?\s?(m|minor|maj|major)?$/i.test(part));
    } else {
      raw.title = line;
      raw.file_path = line.includes("/") || line.includes("\\") ? line : undefined;
    }
    return normalizeTrack(raw, index);
  });
}

function parseJson(content: string) {
  const parsed = JSON.parse(content);
  const rows = Array.isArray(parsed) ? parsed : parsed.tracks ?? parsed.songs ?? parsed.items ?? [];
  return rows.map((row: Record<string, unknown>, index: number) => normalizeTrack({
    title: String(row.title ?? row.name ?? row.track ?? ""),
    artist: String(row.artist ?? row.creator ?? row.artists ?? ""),
    album: String(row.album ?? ""),
    genre: String(row.genre ?? ""),
    bpm: Number(row.bpm),
    musical_key: String(row.key ?? row.musical_key ?? ""),
    camelot_key: String(row.camelot ?? row.camelot_key ?? ""),
    duration: Number(row.duration ?? row.length),
    file_path: String(row.path ?? row.file ?? row.location ?? ""),
    external_url: String(row.url ?? row.external_url ?? ""),
    source_platform: String(row.source ?? row.platform ?? "JSON"),
    notes: String(row.notes ?? row.comments ?? ""),
    raw: row,
  }, index));
}

function parseXmlTracks(content: string, source: string) {
  const nodes = content.match(/<TRACK\b[^>]*\/?>|<Song\b[\s\S]*?<\/Song>|<Song\b[^>]*\/>/gi) ?? [];
  return nodes.map((node, index) => {
    const attrs: Record<string, string> = {};
    for (const match of node.matchAll(/(\w+)="([^"]*)"/g)) attrs[match[1]] = match[2];
    return normalizeTrack({
      title: attrs.Name || attrs.Title,
      artist: attrs.Artist || attrs.Author,
      album: attrs.Album,
      genre: attrs.Genre,
      bpm: Number(attrs.AverageBpm || attrs.Bpm),
      musical_key: attrs.Tonality || attrs.Key,
      duration: Number(attrs.TotalTime || attrs.SongLength),
      file_path: decodeURIComponent(attrs.Location || attrs.FilePath || ""),
      source_platform: source,
      raw: attrs,
    }, index);
  });
}

export function parsePlaylist(content: string, sourceName = "manual paste", forcedType?: PlaylistSource): PlaylistParseResult {
  const type = forcedType ?? detectPlaylistSource(sourceName, content);
  let tracks = [] as ReturnType<typeof normalizeTrack>[];
  if (type === "csv") tracks = parseCsv(content);
  else if (type === "json") tracks = parseJson(content);
  else if (type === "rekordbox") tracks = parseXmlTracks(content, "Rekordbox");
  else if (type === "virtualdj") tracks = parseXmlTracks(content, "VirtualDJ");
  else tracks = parseText(content, type === "serato" ? "Serato" : type.toUpperCase());
  return { sourceType: type, sourceName, tracks, warnings: tracks.length ? [] : ["No tracks found in this import."] };
}

export type { ImportedTrackDraft, PlaylistParseResult, PlaylistSource } from "./types";
