import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.1fr_0.9fr] md:items-center">
      <section>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">100% rule-based MVP</p>
        <h1 className="text-4xl font-bold leading-tight md:text-6xl">Build better DJ sets without paid AI.</h1>
        <p className="mt-5 max-w-2xl text-lg text-[var(--muted-foreground)]">
          Upload or enter your music metadata, answer a gig questionnaire, and generate an ordered setlist with transition notes, warnings, and explanations.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="btn btn-primary" href="/auth">Start free</Link>
          <Link className="btn btn-secondary" href="/dashboard">Open dashboard</Link>
        </div>
      </section>
      <section className="rounded-lg border border-[var(--border)] bg-white p-6">
        <h2 className="text-xl font-semibold">No hosted AI models</h2>
        <ul className="mt-4 space-y-3 text-sm text-[var(--muted-foreground)]">
          <li>Runs on Vercel free tier, Supabase free tier, and GitHub.</li>
          <li>Uses manual metadata for BPM, key, mood, culture tags, and best-use moments.</li>
          <li>Scores songs with deterministic DJ rules, not paid APIs.</li>
          <li>Saves private setlists and private song files with Supabase RLS and Storage policies.</li>
        </ul>
      </section>
    </main>
  );
}
