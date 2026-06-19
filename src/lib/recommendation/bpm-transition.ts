export function bpmTransition(previous?: number | null, next?: number | null) {
  if (!previous || !next) return { points: 0, note: "No BPM comparison available." };
  const diff = Math.abs(previous - next);

  if (diff <= 4) return { points: 12, note: `Smooth BPM move (${previous} to ${next}).` };
  if (diff <= 8) return { points: 7, note: `Moderate BPM move (${previous} to ${next}); blend should be comfortable.` };
  if (diff <= 14) return { points: 1, note: `Noticeable BPM jump (${previous} to ${next}); use a short transition.` };
  return { points: -8, note: `Large BPM jump (${previous} to ${next}); consider a reset, break, or special moment.` };
}
