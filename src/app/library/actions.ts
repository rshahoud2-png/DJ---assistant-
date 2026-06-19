"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

function list(value: FormDataEntryValue | null) {
  return String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
}

export async function saveSong(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const payload = {
    user_id: user.id,
    title: String(formData.get("title")),
    artist: String(formData.get("artist")),
    genre: String(formData.get("genre") ?? ""),
    subgenre: String(formData.get("subgenre") ?? ""),
    bpm: Number(formData.get("bpm")) || null,
    musical_key: String(formData.get("musical_key") ?? ""),
    camelot_key: String(formData.get("camelot_key") ?? ""),
    energy_level: Number(formData.get("energy_level")) || null,
    mood: String(formData.get("mood") ?? ""),
    language: String(formData.get("language") ?? ""),
    culture_tags: list(formData.get("culture_tags")),
    explicit: formData.get("explicit") === "on",
    best_use: list(formData.get("best_use")),
    duration: Number(formData.get("duration")) || null,
    notes: String(formData.get("notes") ?? ""),
  };

  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("song-files").upload(path, file, { upsert: false });
    if (error) throw new Error(error.message);
    Object.assign(payload, { file_path: path });
  }

  const query = id ? supabase.from("songs").update(payload).eq("id", id) : supabase.from("songs").insert(payload);
  const { error } = await query;
  if (error) throw new Error(error.message);
  revalidatePath("/library");
  redirect("/library");
}
