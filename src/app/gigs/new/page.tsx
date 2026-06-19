import type { InputHTMLAttributes } from "react";
import { CalendarDays, CheckCircle2, Headphones, Music2, RadioTower, SlidersHorizontal, Users } from "lucide-react";
import { createGig } from "../actions";

const curves = [
  "dinner_to_party",
  "slow_build",
  "high_energy_all_night",
  "peak_then_cool_down",
  "chill_lounge",
  "wedding_flow",
  "arabic_wedding_flow",
];

const steps = [
  ["Event Details", CalendarDays],
  ["Audience", Users],
  ["Music Preferences", Music2],
  ["Energy Curve", SlidersHorizontal],
  ["Review", CheckCircle2],
];

export default function NewGigPage() {
  return (
    <main className="page-shell">
      <div className="glass-card overflow-hidden rounded-lg">
        <div className="border-b border-[var(--border)] bg-[radial-gradient(circle_at_top_right,rgba(245,197,66,.2),transparent_24rem)] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--accent)]">Guided Gig Wizard</p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">Design the night.</h1>
          <p className="mt-3 max-w-2xl text-[var(--muted-foreground)]">Fill the flow from event context to energy curve, then generate a setlist from your actual library.</p>
          <div className="mt-8 grid gap-3 md:grid-cols-5">
            {steps.map(([label, Icon], index) => (
              <div key={label as string} className="rounded-md border border-white/10 bg-black/35 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Icon className="h-5 w-5 text-[var(--accent)]" />
                  <span className="text-xs font-bold text-[var(--muted-foreground)]">0{index + 1}</span>
                </div>
                <p className="text-sm font-semibold">{label as string}</p>
                <div className="mt-3 h-1 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${(index + 1) * 20}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <form action={createGig} className="grid gap-6 p-5 md:p-8">
          <WizardSection step="01" title="Event Details" icon={CalendarDays}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field name="name" label="Gig name" required />
              <Field name="event_date" label="Event date" type="date" />
              <Field name="venue" label="Venue" />
              <Field name="event_type" label="Event type" placeholder="wedding, corporate, club, Arabic wedding" required />
              <Field name="event_duration" label="Event duration minutes" type="number" />
              <Field name="dj_set_duration" label="DJ set duration minutes" type="number" />
            </div>
          </WizardSection>

          <WizardSection step="02" title="Audience" icon={Users}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field name="crowd_age_range" label="Crowd age range" placeholder="25-45" />
              <Field name="culture_language_preferences" label="Culture/language preferences" placeholder="Arabic, English" />
              <label className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] p-4 text-sm">
                <input type="checkbox" name="explicit_content_allowed" />
                Explicit content allowed
              </label>
            </div>
          </WizardSection>

          <WizardSection step="03" title="Music Preferences" icon={Headphones}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field name="desired_vibe" label="Desired vibe" placeholder="elegant, hype, chill" />
              <Field name="requested_styles" label="Requested styles" placeholder="Arabic, Dabke, pop" />
              <Field name="styles_to_avoid" label="Styles to avoid" placeholder="explicit rap, hard techno" />
              <Field name="must_play_songs" label="Must-play songs" placeholder="title or artist, comma-separated" />
              <Field name="do_not_play_songs" label="Do-not-play songs" placeholder="title or artist, comma-separated" />
            </div>
          </WizardSection>

          <WizardSection step="04" title="Energy Curve" icon={RadioTower}>
            <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
              <label className="grid gap-1">
                <span className="label">Energy curve</span>
                <select className="field" name="energy_curve" defaultValue="slow_build">
                  {curves.map((curve) => <option key={curve}>{curve}</option>)}
                </select>
              </label>
              <div className="flex h-28 items-end gap-2 rounded-md border border-white/10 bg-black/35 p-4">
                {[22, 34, 45, 58, 70, 84, 96, 78, 62].map((height, index) => (
                  <span key={index} className="flex-1 rounded-t-md bg-gradient-to-t from-[#8a6517] to-[var(--accent)]" style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
          </WizardSection>

          <WizardSection step="05" title="Review Notes" icon={CheckCircle2}>
            <div className="grid gap-4">
              <label className="grid gap-1">
                <span className="label">Special moments</span>
                <textarea className="field min-h-24" name="special_moments" placeholder={"Entrance | entrance | couple walks in\nFirst dance | first dance | keep it clean"} />
              </label>
              <label className="grid gap-1">
                <span className="label">Customer notes</span>
                <textarea className="field min-h-24" name="customer_notes" />
              </label>
            </div>
          </WizardSection>

          <button className="btn btn-primary w-fit gap-2"><CheckCircle2 className="h-4 w-4" /> Save questionnaire</button>
        </form>
      </div>
    </main>
  );
}

function WizardSection({ step, title, icon: Icon, children }: { step: string; title: string; icon: typeof CalendarDays; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-[var(--accent)] text-sm font-black text-black">{step}</span>
        <Icon className="h-5 w-5 text-[var(--accent)]" />
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field(props: { name: string; label: string } & InputHTMLAttributes<HTMLInputElement>) {
  const { label, ...input } = props;
  return (
    <label className="grid gap-1">
      <span className="label">{label}</span>
      <input className="field" {...input} />
    </label>
  );
}
