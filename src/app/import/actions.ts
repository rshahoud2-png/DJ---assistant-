"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import type { ImportedTrackDraft } from "@/lib/playlist-import";

type ImportPayload = {
  sourceName: string;
  sourceType: string;
  tracks: ImportedTrackDraft[];
  warnings: string[];
};

export async function savePlaylistImport(formData: FormData) {
  const { supabase, user } = await requireUser();
  const payload = JSON.parse(String(formData.get("payload") ?? "{}")) as ImportPayload;
  const tracks = payload.tracks.filter((track) => track.title?.trim());

  const { data: importRow, error: importError } = await supabase
    .from("playlist_imports")
    .insert({
      user_id: user.id,
      source_name: payload.sourceName,
      source_type: payload.sourceType,
      source_software: payload.sourceType,
      status: "imported",
      total_tracks: payload.tracks.length,
      imported_tracks: tracks.length,
      warnings: payload.warnings,
    })
    .select("id")
    .single();
  if (importError) throw new Error(importError.message);

  const songRows = tracks.map((track) => ({
    user_id: user.id,
    import_id: importRow.id,
    title: track.title,
    artist: track.artist || "Unknown artist",
    album: track.album || null,
    genre: track.genre || null,
    bpm: track.bpm || null,
    musical_key: track.musical_key || null,
    camelot_key: track.camelot_key || null,
    duration: track.duration || null,
    file_path: track.file_path || null,
    external_url: track.external_url || null,
    source_platform: track.source_platform || payload.sourceType,
    source_software: track.source_platform || payload.sourceType,
    comments: track.notes || null,
    notes: [track.notes, track.warnings?.length ? `Import warnings: ${track.warnings.join(", ")}` : ""].filter(Boolean).join("\n"),
  }));

  const { data: songs, error: songsError } = await supabase.from("songs").insert(songRows).select("id");
  if (songsError) throw new Error(songsError.message);

  const auditRows = tracks.map((track, index) => ({
    import_id: importRow.id,
    user_id: user.id,
    song_id: songs?.[index]?.id ?? null,
    row_index: track.rowIndex,
    raw_data: track.raw,
    normalized_data: track,
    confidence: track.confidence,
    confidence_score: track.confidence_score,
    warnings: track.warnings,
  }));
  const { error: auditError } = await supabase.from("imported_tracks").insert(auditRows);
  if (auditError) throw new Error(auditError.message);

  revalidatePath("/library");
  redirect("/library");
}
