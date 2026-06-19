import type { EnergyCurve } from "./types";

export function targetEnergy(curve: EnergyCurve, position: number, total: number) {
  const ratio = total <= 1 ? 1 : position / (total - 1);

  switch (curve) {
    case "dinner_to_party":
      return Math.round(2 + ratio * 7);
    case "slow_build":
      return Math.round(3 + ratio * 6);
    case "high_energy_all_night":
      return ratio < 0.8 ? 8 : 7;
    case "peak_then_cool_down":
      return ratio < 0.65 ? Math.round(5 + ratio * 6) : Math.round(9 - (ratio - 0.65) * 10);
    case "chill_lounge":
      return 3;
    case "wedding_flow":
      if (ratio < 0.2) return 3;
      if (ratio < 0.45) return 5;
      if (ratio < 0.85) return 8;
      return 6;
    case "arabic_wedding_flow":
      if (ratio < 0.2) return 3;
      if (ratio < 0.45) return 6;
      if (ratio < 0.9) return 9;
      return 7;
  }
}

export function energyCurveExplanation(curve: EnergyCurve) {
  const copy: Record<EnergyCurve, string> = {
    dinner_to_party: "Starts low for dinner or mingling, then steadily increases into party energy.",
    slow_build: "Gradually raises intensity so the dance floor has time to form naturally.",
    high_energy_all_night: "Keeps the room hot with only small dips for pacing.",
    peak_then_cool_down: "Builds to a strong peak, then eases the landing near the end.",
    chill_lounge: "Keeps energy relaxed and consistent for a smooth background flow.",
    wedding_flow: "Supports dinner, formal moments, open dance, and a controlled closing.",
    arabic_wedding_flow: "After dinner, prioritizes Arabic, Dabke, family-friendly, high-energy party flow.",
  };

  return copy[curve];
}
