"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";

export async function createCrate(formData: FormData) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("crates").insert({
    user_id: user.id,
    name: String(formData.get("name")),
    description: String(formData.get("description") || ""),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/crates");
}
