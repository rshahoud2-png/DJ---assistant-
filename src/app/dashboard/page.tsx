import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const { supabase } = await requireUser();
  const [{ count: songCount }, { count: gigCount }, { data: setlists }] = await Promise.all([
    supabase.from("songs").select("*", { count: "exact", head: true }),
    supabase.from("gigs").select("*", { count: "exact", head: true }),
    supabase.from("setlists").select("id,name,created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric label="Songs" value={songCount ?? 0} />
        <Metric label="Gigs" value={gigCount ?? 0} />
        <Metric label="Recent setlists" value={setlists?.length ?? 0} />
      </div>
      <section className="mt-8 rounded-lg border border-[var(--border)] bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Recent generated setlists</h2>
          <Link href="/gigs/new" className="btn btn-primary">Plan a gig</Link>
        </div>
        <div className="mt-4 grid gap-2">
          {setlists?.length ? setlists.map((setlist) => (
            <Link key={setlist.id} href={`/setlists/${setlist.id}`} className="rounded-md border border-[var(--border)] p-3 hover:bg-[var(--muted)]">
              {setlist.name}
            </Link>
          )) : <p className="text-sm text-[var(--muted-foreground)]">No setlists yet. Add songs, create a gig, then generate one.</p>}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-5">
      <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
