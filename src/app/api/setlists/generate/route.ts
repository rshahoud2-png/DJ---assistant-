import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildSetlist, type GigRequirements, type Song } from "@/lib/recommendation";

export async function POST(request: Request) {
  const form = await request.formData();
  const gigId = String(form.get("gig_id"));
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) return NextResponse.redirect(new URL("/auth", request.url), 303);

  const [{ data: gig, error: gigError }, { data: req, error: reqError }, { data: songs, error: songsError }] = await Promise.all([
    supabase.from("gigs").select("*").eq("id", gigId).single(),
    supabase.from("gig_requirements").select("*").eq("gig_id", gigId).single(),
    supabase.from("songs").select("*").order("created_at", { ascending: true }),
  ]);

  if (gigError || reqError || songsError || !gig || !req || !songs) {
    return NextResponse.json({ error: "Unable to load gig requirements or songs." }, { status: 400 });
  }

  const result = buildSetlist(songs as Song[], req as GigRequirements);
  const { data: setlist, error: setlistError } = await supabase
    .from("setlists")
    .insert({
      user_id: userData.user.id,
      gig_id: gigId,
      name: `${gig.name} generated setlist`,
      energy_curve_explanation: result.energyCurveExplanation,
      warnings: result.warnings,
      suggestions: result.suggestions,
      dj_notes: result.djNotes,
    })
    .select("id")
    .single();

  if (setlistError) return NextResponse.json({ error: setlistError.message }, { status: 400 });

  if (result.tracks.length) {
    const { error } = await supabase.from("setlist_tracks").insert(result.tracks.map((track) => ({
      setlist_id: setlist.id,
      user_id: userData.user.id,
      song_id: track.song.id,
      position: track.position,
      score: track.score,
      selected_reason: track.reasons.join(" "),
      bpm_transition_note: track.bpmTransitionNote,
      key_compatibility_note: track.keyCompatibilityNote,
      moment: track.moment ?? null,
    })));
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.redirect(new URL(`/setlists/${setlist.id}`, request.url), 303);
}
