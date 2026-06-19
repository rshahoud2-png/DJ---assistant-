const camelotRegex = /^([1-9]|1[0-2])([AB])$/i;

export function keyCompatibility(previous?: string | null, next?: string | null) {
  if (!previous || !next) return { points: 0, note: "No Camelot comparison available." };
  const a = previous.match(camelotRegex);
  const b = next.match(camelotRegex);
  if (!a || !b) return { points: 0, note: "Camelot keys are not in a comparable format." };

  const prevNum = Number(a[1]);
  const nextNum = Number(b[1]);
  const prevMode = a[2].toUpperCase();
  const nextMode = b[2].toUpperCase();
  const wrappedDistance = Math.min(Math.abs(prevNum - nextNum), 12 - Math.abs(prevNum - nextNum));

  if (prevNum === nextNum && prevMode === nextMode) return { points: 12, note: "Same Camelot key for a very smooth mix." };
  if (wrappedDistance === 1 && prevMode === nextMode) return { points: 9, note: "Adjacent Camelot key keeps harmonic movement smooth." };
  if (prevNum === nextNum && prevMode !== nextMode) return { points: 7, note: "Relative major/minor Camelot match works harmonically." };
  if (wrappedDistance <= 2) return { points: 2, note: "Key shift is usable but may need a quicker transition." };
  return { points: -4, note: "Key clash risk; use an echo out, drop mix, or percussion bridge." };
}
