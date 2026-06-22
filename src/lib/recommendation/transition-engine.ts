import type { Song, TransitionType } from "./types";

export function transitionTypeFor(current?: Song, next?: Song): TransitionType {
  if (!current || !next) return "Blend";
  const bpmDiff = Math.abs((current.bpm ?? 0) - (next.bpm ?? 0));
  const energyDiff = Math.abs((current.energy_level ?? 5) - (next.energy_level ?? 5));
  const genreChange = (current.genre ?? "").toLowerCase() !== (next.genre ?? "").toLowerCase();

  if (bpmDiff <= 4 && energyDiff <= 2) return "Blend";
  if (bpmDiff <= 8 && genreChange) return "Echo Out";
  if (energyDiff >= 4 && (next.energy_level ?? 5) > (current.energy_level ?? 5)) return "Drop Swap";
  if (bpmDiff >= 15) return "Cut";
  if ((current.genre ?? "").toLowerCase().includes("house") || (next.genre ?? "").toLowerCase().includes("club")) return "Loop Transition";
  return "Fade";
}

export function transitionInstruction(current: Song | undefined, next: Song, type: TransitionType, bars: number) {
  if (!current) return `Start with ${next.title}. Use the intro cue and leave headroom for the first transition.`;
  const bpmDiff = Math.abs((current.bpm ?? 0) - (next.bpm ?? 0));
  const energyDiff = (next.energy_level ?? 5) - (current.energy_level ?? 5);
  const reason = `BPM difference is ${bpmDiff || "unknown"} and energy ${energyDiff >= 0 ? "rises" : "drops"} by ${Math.abs(energyDiff)}.`;

  if (type === "Blend") return `Blend over ${bars} bars. Bring in ${next.title} on phrase, swap bass after 8 bars, then let the outgoing hook resolve. ${reason}`;
  if (type === "Echo Out") return `Echo out the last vocal or snare phrase from ${current.title}, start ${next.title} from intro cue, and complete the handoff within ${bars} bars. ${reason}`;
  if (type === "Loop Transition") return `Loop the outgoing groove for ${bars} bars, introduce mids/highs from ${next.title}, then release the loop on the next downbeat. ${reason}`;
  if (type === "Cut") return `Use a clean cut on a strong downbeat. Keep the mic ready if the genre or BPM change needs crowd context. ${reason}`;
  if (type === "Drop Swap") return `Tease ${next.title} for 8 bars, filter out ${current.title}, then swap into the next drop for impact. ${reason}`;
  return `Fade ${current.title} under ${next.title} over ${bars} bars, keeping vocals from clashing. ${reason}`;
}
