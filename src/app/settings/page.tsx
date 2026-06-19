import { requireUser } from "@/lib/auth";
import { saveProfile, signOut } from "./actions";

export default async function SettingsPage() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <form action={saveProfile} className="mt-6 grid gap-4 rounded-lg border border-[var(--border)] bg-white p-5">
        <label className="grid gap-1">
          <span className="label">Display name</span>
          <input className="field" name="display_name" defaultValue={profile?.display_name ?? ""} />
        </label>
        <label className="grid gap-1">
          <span className="label">DJ name</span>
          <input className="field" name="dj_name" defaultValue={profile?.dj_name ?? ""} />
        </label>
        <button className="btn btn-primary w-fit">Save profile</button>
      </form>
      <form action={signOut} className="mt-4">
        <button className="btn btn-secondary">Sign out</button>
      </form>
    </main>
  );
}
