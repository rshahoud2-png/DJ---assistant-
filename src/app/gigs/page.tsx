import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function GigsPage() {
  const { supabase } = await requireUser();
  const { data: gigs } = await supabase.from("gigs").select("*").order("created_at", { ascending: false });
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Gigs</h1>
        <Link className="btn btn-primary" href="/gigs/new">New gig</Link>
      </div>
      <div className="mt-6 grid gap-3">
        {gigs?.length ? gigs.map((gig) => (
          <Link key={gig.id} href={`/gigs/${gig.id}`} className="rounded-lg border border-[var(--border)] bg-white p-4 hover:bg-[var(--muted)]">
            <p className="font-semibold">{gig.name}</p>
            <p className="text-sm text-[var(--muted-foreground)]">{gig.venue || "No venue"} {gig.event_date ? `· ${gig.event_date}` : ""}</p>
          </Link>
        )) : <p className="rounded-lg border border-[var(--border)] bg-white p-5 text-sm text-[var(--muted-foreground)]">No gigs yet.</p>}
      </div>
    </main>
  );
}
