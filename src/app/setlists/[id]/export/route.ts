import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "json" ? "json" : "csv";
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.redirect(new URL("/auth", request.url), 303);

  const [{ data: setlist }, { data: tracks }, { data: transitions }] = await Promise.all([
    supabase.from("setlists").select("*, gigs(*)").eq("id", id).single(),
    supabase.from("setlist_tracks").select("*, songs(*)").eq("setlist_id", id).order("position"),
    supabase.from("transitions").select("*").eq("setlist_id", id).order("position"),
  ]);
  if (!setlist) return NextResponse.json({ error: "Set not found." }, { status: 404 });

  const payload = { setlist, tracks: tracks ?? [], transitions: transitions ?? [] };

  await supabase.from("set_exports").insert({
    user_id: userData.user.id,
    setlist_id: id,
    format,
    payload,
  });

  if (format === "json") {
    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        "content-type": "application/json",
        "content-disposition": `attachment; filename="${setlist.name}.json"`,
      },
    });
  }

  const header = [
    "Position",
    "Section",
    "Title",
    "Artist",
    "BPM",
    "Key",
    "Energy",
    "Intro Cue",
    "Mix-In Cue",
    "Mix-Out Cue",
    "Drop Cue",
    "Loop Cue",
    "Transition Type",
    "Transition Bars",
    "Transition Instruction",
    "Performance Instructions",
  ];
  const rows = (tracks ?? []).map((track) => [
    track.position,
    track.section,
    track.songs?.title,
    track.songs?.artist,
    track.songs?.bpm,
    track.songs?.camelot_key || track.songs?.musical_key,
    track.songs?.energy_level,
    track.intro_cue,
    track.mix_in_cue,
    track.mix_out_cue,
    track.drop_cue,
    track.loop_cue,
    track.transition_type,
    track.transition_bars,
    track.transition_instruction,
    track.performance_instructions,
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv",
      "content-disposition": `attachment; filename="${setlist.name}.csv"`,
    },
  });
}
