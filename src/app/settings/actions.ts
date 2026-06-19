"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";

export { signOut };

export async function saveProfile(formData: FormData) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: String(formData.get("display_name") || ""),
    dj_name: String(formData.get("dj_name") || ""),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}
