import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";

export default async function GigDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const [{ data: gig }, { data: req }, { data: setlists }] = await Promise.all([
    supabase.from("gigs").select("*").eq("id", id).single(),
    supabase.from("gig_requirements").select("*").eq("gig_id", id).single(),
    supabase.from("setlists").select("id,name,created_at").eq("gig_id", id).order("created_at", { ascending: false }),
  ]);
  if (!gig || !req) notFound();

  return (
    <main className="page-shell max-w-5xl">
      <div className="glass-card flex flex-wrap items-center justify-between gap-4 rounded-lg p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--accent)]">Gig Details</p>
          <h1 className="mt-2 text-4xl font-black">{gig.name}</h1>
          <p className="text-[var(--muted-foreground)]">{gig.venue || "No venue"} {gig.event_date ? `· ${gig.event_date}` : ""}</p>
        </div>
        <form action="/api/setlists/generate" method="post">
          <input type="hidden" name="gig_id" value={gig.id} />
          <button className="btn btn-primary">Generate setlist</button>
        </form>
      </div>
      <section className="glass-card mt-6 rounded-lg p-5">
        <h2 className="text-xl font-semibold">Requirements</h2>
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <Item label="Event type" value={req.event_type} />
          <Item label="Energy curve" value={req.energy_curve} />
          <Item label="Requested styles" value={req.requested_styles?.join(", ")} />
          <Item label="Styles to avoid" value={req.styles_to_avoid?.join(", ")} />
          <Item label="Culture/language" value={req.culture_language_preferences?.join(", ")} />
          <Item label="Desired vibe" value={req.desired_vibe} />
        </dl>
      </section>
      <section className="glass-card mt-6 rounded-lg p-5">
        <h2 className="text-xl font-semibold">Generated setlists</h2>
        <div className="mt-4 grid gap-2">
          {setlists?.length ? setlists.map((setlist) => (
            <Link key={setlist.id} href={`/setlists/${setlist.id}`} className="rounded-md border border-white/10 bg-white/[0.04] p-3 hover:border-[var(--accent)]/60">{setlist.name}</Link>
          )) : <p className="text-sm text-[var(--muted-foreground)]">No setlists generated yet.</p>}
        </div>
      </section>
    </main>
  );
}

function Item({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="label">{label}</dt>
      <dd>{value || "Not specified"}</dd>
    </div>
  );
}
