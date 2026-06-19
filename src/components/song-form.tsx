import type { InputHTMLAttributes } from "react";
import { saveSong } from "@/app/library/actions";

type Song = Record<string, unknown>;

export function SongForm({ song }: { song?: Song }) {
  return (
    <form action={saveSong} className="grid gap-4 rounded-lg border border-[var(--border)] bg-white p-5">
      {song?.id ? <input type="hidden" name="id" value={String(song.id)} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="title" label="Title" value={song?.title} required />
        <Field name="artist" label="Artist" value={song?.artist} required />
        <Field name="genre" label="Genre" value={song?.genre} />
        <Field name="subgenre" label="Subgenre" value={song?.subgenre} />
        <Field name="bpm" label="BPM" type="number" value={song?.bpm} />
        <Field name="camelot_key" label="Camelot key" value={song?.camelot_key} placeholder="8A" />
        <Field name="musical_key" label="Musical key" value={song?.musical_key} placeholder="A minor" />
        <Field name="energy_level" label="Energy 1-10" type="number" min="1" max="10" value={song?.energy_level} />
        <Field name="mood" label="Mood" value={song?.mood} />
        <Field name="language" label="Language" value={song?.language} />
        <Field name="culture_tags" label="Culture tags" value={(song?.culture_tags as string[] | undefined)?.join(", ")} placeholder="Arabic, Dabke" />
        <Field name="best_use" label="Best use" value={(song?.best_use as string[] | undefined)?.join(", ")} placeholder="dinner, entrance, open dance" />
        <Field name="duration" label="Duration seconds" type="number" value={song?.duration} />
      </div>
      <label className="grid gap-1">
        <span className="label">Notes</span>
        <textarea className="field min-h-24" name="notes" defaultValue={String(song?.notes ?? "")} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input name="explicit" type="checkbox" defaultChecked={Boolean(song?.explicit)} />
        Explicit lyrics
      </label>
      <label className="grid gap-1">
        <span className="label">Private audio file</span>
        <input className="field" name="file" type="file" accept="audio/*" />
      </label>
      <button className="btn btn-primary w-fit">Save song</button>
    </form>
  );
}

function Field({
  name,
  label,
  value,
  ...props
}: { name: string; label: string; value?: unknown } & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "name">) {
  return (
    <label className="grid gap-1">
      <span className="label">{label}</span>
      <input className="field" name={name} defaultValue={value == null ? "" : String(value)} {...props} />
    </label>
  );
}
