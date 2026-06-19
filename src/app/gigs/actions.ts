"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import type { EnergyCurve, SpecialMoment } from "@/lib/recommendation";

function list(value: FormDataEntryValue | null) {
  return String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
}

function specialMoments(value: FormDataEntryValue | null): SpecialMoment[] {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, targetUse, notes] = line.split("|").map((part) => part.trim());
      return { name, targetUse, notes };
    });
}

export async function createGig(formData: FormData) {
  const { supabase, user } = await requireUser();
  const { data: gig, error: gigError } = await supabase
    .from("gigs")
    .insert({
      user_id: user.id,
      name: String(formData.get("name")),
      event_date: String(formData.get("event_date") || "") || null,
      venue: String(formData.get("venue") || ""),
    })
    .select("id")
    .single();

  if (gigError) throw new Error(gigError.message);

  const { error } = await supabase.from("gig_requirements").insert({
    gig_id: gig.id,
    user_id: user.id,
    event_type: String(formData.get("event_type")),
    crowd_age_range: String(formData.get("crowd_age_range") || ""),
    requested_styles: list(formData.get("requested_styles")),
    styles_to_avoid: list(formData.get("styles_to_avoid")),
    culture_language_preferences: list(formData.get("culture_language_preferences")),
    event_duration: Number(formData.get("event_duration")) || null,
    dj_set_duration: Number(formData.get("dj_set_duration")) || null,
    desired_vibe: String(formData.get("desired_vibe") || ""),
    explicit_content_allowed: formData.get("explicit_content_allowed") === "on",
    must_play_songs: list(formData.get("must_play_songs")),
    do_not_play_songs: list(formData.get("do_not_play_songs")),
    special_moments: specialMoments(formData.get("special_moments")),
    energy_curve: String(formData.get("energy_curve")) as EnergyCurve,
    customer_notes: String(formData.get("customer_notes") || ""),
  });

  if (error) throw new Error(error.message);
  redirect(`/gigs/${gig.id}`);
}
