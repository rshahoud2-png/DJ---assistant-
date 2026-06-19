import { Activity, AudioWaveform, Disc3, Music2, RadioTower, SlidersHorizontal } from "lucide-react";

export function Waveform({ bars = 42 }: { bars?: number }) {
  return (
    <div className="flex h-24 items-center gap-1 overflow-hidden rounded-lg border border-[var(--border)] bg-black/40 px-4">
      {Array.from({ length: bars }).map((_, index) => (
        <span
          key={index}
          className="w-full min-w-1 rounded-full bg-[var(--accent)]"
          style={{
            height: `${18 + ((index * 19) % 70)}%`,
            animation: `pulse-bars ${0.9 + (index % 7) * 0.08}s ease-in-out infinite`,
            animationDelay: `${index * 34}ms`,
            boxShadow: "0 0 18px rgba(245,197,66,.35)",
          }}
        />
      ))}
    </div>
  );
}

export function Turntable() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm rounded-full border border-[var(--border)] bg-[radial-gradient(circle,#1b1b1b_0,#090909_58%,#000_100%)] p-8 shadow-[0_0_90px_rgba(245,197,66,.14)]">
      <div className="absolute inset-8 rounded-full border border-white/10" style={{ animation: "spin-slow 16s linear infinite" }}>
        <div className="absolute left-1/2 top-3 h-3 w-3 rounded-full bg-[var(--accent)] shadow-[0_0_24px_rgba(245,197,66,.8)]" />
      </div>
      <div className="absolute inset-20 rounded-full border border-[var(--border)] bg-black" />
      <div className="absolute inset-[43%] rounded-full bg-[var(--accent)]" />
      <div className="absolute right-8 top-12 h-28 w-2 rotate-45 rounded-full bg-white/30" />
      <Disc3 className="absolute bottom-10 left-10 h-8 w-8 text-[var(--accent)]" />
    </div>
  );
}

export function VisualizerCard() {
  const metrics = [
    ["BPM Flow", "124 -> 128", Activity],
    ["Key Lock", "8A / 9A", Music2],
    ["Energy", "Rising", AudioWaveform],
    ["Crowd", "Peak", RadioTower],
  ];

  return (
    <div className="glass-card rounded-lg p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">Live setlist demo</p>
          <h3 className="mt-2 text-xl font-bold">Saturday Night Mix</h3>
        </div>
        <SlidersHorizontal className="h-6 w-6 text-[var(--accent)]" />
      </div>
      <div className="mt-5">
        <Waveform bars={26} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {metrics.map(([label, value, Icon]) => (
          <div key={label as string} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
            <Icon className="mb-3 h-4 w-4 text-[var(--accent)]" />
            <p className="text-xs text-[var(--muted-foreground)]">{label as string}</p>
            <p className="font-semibold">{value as string}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EnergyMeter({ value = 5 }: { value?: number | null }) {
  const safe = Math.max(1, Math.min(10, value ?? 5));
  return (
    <div className="flex items-end gap-1" aria-label={`Energy ${safe} out of 10`}>
      {Array.from({ length: 10 }).map((_, index) => (
        <span
          key={index}
          className={`w-1.5 rounded-full ${index < safe ? "bg-[var(--accent)]" : "bg-white/15"}`}
          style={{ height: `${8 + index * 2}px` }}
        />
      ))}
    </div>
  );
}

export function MiniGraph({ values, label }: { values: number[]; label: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="glass-card rounded-lg p-5">
      <p className="text-sm font-semibold text-[var(--muted-foreground)]">{label}</p>
      <div className="mt-5 flex h-28 items-end gap-2">
        {values.map((value, index) => (
          <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-[#8a6517] to-[var(--accent)] shadow-[0_0_18px_rgba(245,197,66,.25)]"
              style={{ height: `${Math.max(10, (value / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
