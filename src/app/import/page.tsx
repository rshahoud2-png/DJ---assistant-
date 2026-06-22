import { ImportClient } from "./import-client";

export default function ImportPage() {
  return (
    <main className="page-shell">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--accent)]">Universal Library Importer</p>
      <h1 className="mt-3 text-4xl font-black md:text-6xl">Build your DJ library from metadata.</h1>
      <p className="mt-4 max-w-3xl text-[var(--muted-foreground)]">Upload Serato, rekordbox, VirtualDJ, CSV, JSON, or text exports. DJ Agent parses metadata only, then lets you review every row before saving.</p>
      <div className="mt-8"><ImportClient /></div>
    </main>
  );
}
