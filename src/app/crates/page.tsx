import { requireUser } from "@/lib/auth";
import { createCrate } from "./actions";

export default async function CratesPage() {
  const { supabase } = await requireUser();
  const { data: crates } = await supabase.from("crates").select("*").order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold">Saved crates/playlists</h1>
      <form action={createCrate} className="mt-6 grid gap-3 rounded-lg border border-[var(--border)] bg-white p-5 md:grid-cols-[1fr_1fr_auto]">
        <input className="field" name="name" placeholder="Crate name" required />
        <input className="field" name="description" placeholder="Description" />
        <button className="btn btn-primary">Create crate</button>
      </form>
      <div className="mt-6 grid gap-3">
        {crates?.length ? crates.map((crate) => (
          <article key={crate.id} className="rounded-lg border border-[var(--border)] bg-white p-4">
            <h2 className="font-semibold">{crate.name}</h2>
            <p className="text-sm text-[var(--muted-foreground)]">{crate.description || "No description"}</p>
          </article>
        )) : <p className="rounded-lg border border-[var(--border)] bg-white p-5 text-sm text-[var(--muted-foreground)]">No crates yet.</p>}
      </div>
    </main>
  );
}
