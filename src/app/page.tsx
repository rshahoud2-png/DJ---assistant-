import Link from "next/link";
import { AudioLines, CalendarDays, Disc3, Gauge, KeyRound, Library, ListMusic, Music2, RadioTower, Sparkles, Upload } from "lucide-react";
import { FadeIn, HoverCard } from "@/components/motion";
import { Turntable, VisualizerCard, Waveform } from "@/components/dj-visuals";

const how = [
  ["Upload Music", "Add songs, tags, BPM, key, mood, and best-use moments.", Upload],
  ["Describe Gig", "Capture crowd, culture, event flow, and client notes.", CalendarDays],
  ["Generate Setlist", "Build an ordered set with transition notes and warnings.", Sparkles],
];

const events = ["Arabic Wedding", "Club", "Corporate", "Hookah Lounge", "Birthday", "Festival", "Private Event"];
const features = [
  ["BPM Matching", Gauge],
  ["Key Compatibility", KeyRound],
  ["Energy Curves", AudioLines],
  ["Smart Crates", Library],
  ["Gig Planning", CalendarDays],
  ["Setlist Generation", ListMusic],
];

export default function LandingPage() {
  return (
    <main className="overflow-hidden">
      <section className="page-shell relative grid min-h-[calc(100vh-96px)] gap-10 py-14 md:grid-cols-[1fr_0.95fr] md:items-center">
        <div className="absolute left-1/2 top-8 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--accent)]/20 blur-3xl" />
        <FadeIn>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
            <RadioTower className="h-4 w-4" />
            Premium rule-based DJ planning
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
            Build Perfect DJ Sets <span className="gold-text">In Seconds</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted-foreground)]">
            Analyze your music library, plan events, and generate intelligent setlists for weddings, clubs, lounges, festivals, and private events.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn btn-primary gap-2" href="/auth"><Sparkles className="h-4 w-4" /> Start planning</Link>
            <Link className="btn btn-secondary gap-2" href="/dashboard"><Disc3 className="h-4 w-4" /> View dashboard</Link>
          </div>
          <div className="mt-10">
            <Waveform />
          </div>
        </FadeIn>
        <FadeIn delay={0.15} className="relative">
          <div className="absolute -left-8 top-10 h-32 w-32 rounded-full bg-[var(--accent)]/20 blur-2xl" />
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1fr] lg:items-center">
            <Turntable />
            <VisualizerCard />
          </div>
        </FadeIn>
      </section>

      <section className="page-shell">
        <SectionHeading kicker="Workflow" title="How It Works" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {how.map(([title, copy, Icon], index) => (
            <HoverCard key={title as string} className="glass-card rounded-lg p-6">
              <div className="mb-6 flex items-center justify-between">
                <Icon className="h-8 w-8 text-[var(--accent)]" />
                <span className="text-4xl font-black text-white/10">0{index + 1}</span>
              </div>
              <h3 className="text-xl font-bold">{title as string}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{copy as string}</p>
            </HoverCard>
          ))}
        </div>
      </section>

      <section className="page-shell">
        <SectionHeading kicker="Events" title="Built For Every Room" />
        <div className="mt-8 flex flex-wrap gap-3">
          {events.map((event) => (
            <span key={event} className="rounded-full border border-[var(--border)] bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(245,197,66,.06)]">
              {event}
            </span>
          ))}
        </div>
      </section>

      <section className="page-shell">
        <SectionHeading kicker="Features" title="Music-Tech Intelligence, No Paid AI" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(([feature, Icon]) => (
            <HoverCard key={feature as string} className="glass-card rounded-lg p-5">
              <Icon className="mb-5 h-7 w-7 text-[var(--accent)]" />
              <h3 className="font-bold">{feature as string}</h3>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">Rule-based scoring with transparent DJ reasoning.</p>
            </HoverCard>
          ))}
        </div>
      </section>

      <section className="page-shell pb-16">
        <SectionHeading kicker="Preview" title="Dashboard Control Center" />
        <div className="glass-card mt-8 rounded-lg p-5 md:p-8">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-[var(--accent)]">Tonight</p>
                  <h3 className="mt-2 text-3xl font-black">Wedding Flow Builder</h3>
                </div>
                <Music2 className="h-10 w-10 text-[var(--accent)]" />
              </div>
              <div className="mt-8 grid gap-3">
                {["Dinner warmup", "Entrance cue", "Open dance peak", "Dabke run", "Closing anthem"].map((item, index) => (
                  <div key={item} className="flex items-center gap-4 rounded-md border border-white/10 bg-black/40 p-4">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--accent)] text-sm font-bold text-black">{index + 1}</span>
                    <span className="font-semibold">{item}</span>
                    <span className="ml-auto text-sm text-[var(--muted-foreground)]">{92 + index * 8} BPM</span>
                  </div>
                ))}
              </div>
            </div>
            <VisualizerCard />
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--accent)]">{kicker}</p>
      <h2 className="mt-3 text-3xl font-black md:text-5xl">{title}</h2>
    </div>
  );
}
