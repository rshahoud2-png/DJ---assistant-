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
      section: track.section,
      bpm_transition_note: track.bpmTransitionNote,
      key_compatibility_note: track.keyCompatibilityNote,
      moment: track.moment ?? null,
      intro_cue: track.introCue,
      mix_in_cue: track.mixInCue,
      mix_out_cue: track.mixOutCue,
      drop_cue: track.dropCue,
      loop_cue: track.loopCue,
      transition_type: track.transitionType,
      transition_bars: track.transitionBars,
      transition_instruction: track.transitionInstruction,
      performance_instructions: track.performanceInstructions,
    })));
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const transitions = result.tracks.slice(1).map((track, index) => {
      const previous = result.tracks[index];
      return {
        user_id: userData.user.id,
        setlist_id: setlist.id,
        current_song_id: previous.song.id,
        next_song_id: track.song.id,
        position: track.position - 1,
        bpm_difference: Math.abs((previous.song.bpm ?? 0) - (track.song.bpm ?? 0)) || null,
        key_compatibility: track.keyCompatibilityNote,
        energy_difference: (track.song.energy_level ?? 5) - (previous.song.energy_level ?? 5),
        transition_type: track.transitionType,
        transition_bars: track.transitionBars,
        transition_instruction: track.transitionInstruction,
        dj_notes: track.performanceInstructions,
      };
    });
    if (transitions.length) {
      const { error: transitionError } = await supabase.from("transitions").insert(transitions);
      if (transitionError) return NextResponse.json({ error: transitionError.message }, { status: 400 });
    }
  }

  return NextResponse.redirect(new URL(`/setlists/${setlist.id}`, request.url), 303);
}
