import { Disc3, FolderKanban, Music2, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createCrate } from "./actions";
import { HoverCard } from "@/components/motion";

const examples = ["Arabic Wedding", "Club Bangers", "Dinner Lounge", "Peak Hour", "Closing Songs"];

export default async function CratesPage() {
  const { supabase } = await requireUser();
  const { data: crates } = await supabase.from("crates").select("*").order("created_at", { ascending: false });
  const displayCrates = crates?.length ? crates : examples.map((name, index) => ({ id: name, name, description: index === 0 ? "Suggested starter crate" : "Create this crate when ready" }));

  return (
    <main className="page-shell">
      <section className="glass-card rounded-lg p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--accent)]">Smart Crates</p>
        <h1 className="mt-3 text-4xl font-black md:text-6xl">Organize the room.</h1>
        <p className="mt-3 max-w-2xl text-[var(--muted-foreground)]">Build focused playlists for moments, energy levels, venues, and crowd profiles.</p>
        <form action={createCrate} className="mt-8 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input className="field" name="name" placeholder="Crate name" required />
          <input className="field" name="description" placeholder="Description" />
          <button className="btn btn-primary gap-2"><Plus className="h-4 w-4" /> Create crate</button>
        </form>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayCrates.map((crate, index) => (
          <HoverCard key={crate.id} className="glass-card rounded-lg p-6">
            <div className="flex items-start justify-between">
              <span className="grid h-14 w-14 place-items-center rounded-md bg-gradient-to-br from-[var(--accent)] to-[#7b5b13] text-black">
                {index % 2 ? <Music2 className="h-7 w-7" /> : <Disc3 className="h-7 w-7" />}
              </span>
              <FolderKanban className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <h2 className="mt-8 text-2xl font-black">{crate.name}</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{crate.description || "No description"}</p>
            <div className="mt-6 flex h-16 items-end gap-1">
              {Array.from({ length: 18 }).map((_, bar) => (
                <span key={bar} className="flex-1 rounded-t bg-[var(--accent)]/70" style={{ height: `${20 + ((bar + index) * 13) % 70}%` }} />
              ))}
            </div>
          </HoverCard>
        ))}
      </section>
    </main>
  );
}
