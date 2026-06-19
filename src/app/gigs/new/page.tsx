import type { InputHTMLAttributes } from "react";
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

export default function NewGigPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">New gig questionnaire</h1>
      <form action={createGig} className="mt-6 grid gap-4 rounded-lg border border-[var(--border)] bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="name" label="Gig name" required />
          <Field name="event_date" label="Event date" type="date" />
          <Field name="venue" label="Venue" />
          <Field name="event_type" label="Event type" placeholder="wedding, corporate, club, Arabic wedding" required />
          <Field name="crowd_age_range" label="Crowd age range" placeholder="25-45" />
          <Field name="event_duration" label="Event duration minutes" type="number" />
          <Field name="dj_set_duration" label="DJ set duration minutes" type="number" />
          <Field name="desired_vibe" label="Desired vibe" placeholder="elegant, hype, chill" />
          <Field name="requested_styles" label="Requested styles" placeholder="Arabic, Dabke, pop" />
          <Field name="styles_to_avoid" label="Styles to avoid" placeholder="explicit rap, hard techno" />
          <Field name="culture_language_preferences" label="Culture/language preferences" placeholder="Arabic, English" />
          <Field name="must_play_songs" label="Must-play songs" placeholder="title or artist, comma-separated" />
          <Field name="do_not_play_songs" label="Do-not-play songs" placeholder="title or artist, comma-separated" />
          <label className="grid gap-1">
            <span className="label">Energy curve</span>
            <select className="field" name="energy_curve" defaultValue="slow_build">
              {curves.map((curve) => <option key={curve}>{curve}</option>)}
            </select>
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="explicit_content_allowed" />
          Explicit content allowed
        </label>
        <label className="grid gap-1">
          <span className="label">Special moments</span>
          <textarea className="field min-h-24" name="special_moments" placeholder={"Entrance | entrance | couple walks in\nFirst dance | first dance | keep it clean"} />
        </label>
        <label className="grid gap-1">
          <span className="label">Customer notes</span>
          <textarea className="field min-h-24" name="customer_notes" />
        </label>
        <button className="btn btn-primary w-fit">Save questionnaire</button>
      </form>
    </main>
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
