import { Database, FileJson, FileSpreadsheet, PlugZap } from "lucide-react";

const platforms = [
  ["Serato DJ", "Import Serato crate/export text now. Future: crate generation, direct sync, desktop agent support."],
  ["rekordbox", "Import rekordbox XML now. Future: playlist generation, cue export, direct library synchronization."],
  ["VirtualDJ", "Import VirtualDJ database/export XML now. Future: playlist generation and direct sync."],
];

export default function IntegrationsPage() {
  return (
    <main className="page-shell">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--accent)]">DJ Software Integrations</p>
      <h1 className="mt-3 text-4xl font-black md:text-6xl">The AI layer above your DJ library.</h1>
      <p className="mt-4 max-w-3xl text-[var(--muted-foreground)]">DJ Agent is designed to sit on top of Serato DJ, rekordbox, and VirtualDJ. The MVP imports metadata exports and exports generated sets as CSV or JSON.</p>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {platforms.map(([name, copy]) => (
          <div key={name} className="glass-card rounded-lg p-6">
            <PlugZap className="mb-5 h-8 w-8 text-[var(--accent)]" />
            <h2 className="text-xl font-black">{name}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{copy}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 glass-card rounded-lg p-6">
        <h2 className="text-2xl font-black">MVP support</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
            <Database className="mb-3 h-6 w-6 text-[var(--accent)]" />
            <h3 className="font-bold">Import</h3>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">Serato exports, rekordbox XML, VirtualDJ XML, CSV, and manual paste lists.</p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
            <FileSpreadsheet className="mb-3 h-6 w-6 text-[var(--accent)]" />
            <h3 className="font-bold">Export</h3>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">Generated performance roadmaps export as CSV or JSON with order, cues, transitions, and event context.</p>
          </div>
        </div>
        <div className="mt-5 rounded-md border border-[var(--accent)]/20 bg-[var(--accent)]/10 p-4 text-sm text-[var(--accent)]">
          <FileJson className="mr-2 inline h-4 w-4" /> Future-ready structures support Serato crate generation, rekordbox playlist generation, VirtualDJ playlist generation, plugins, synchronization, and desktop agents.
        </div>
      </section>
    </main>
  );
}
