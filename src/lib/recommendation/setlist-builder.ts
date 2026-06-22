import { bpmTransition } from "./bpm-transition";
import { titleArtistMatch } from "./compatibility";
import { cuePlan } from "./cue-points";
import { energyCurveExplanation } from "./energy-curve";
import { missingStyleWarnings, specialMomentNotes } from "./explanations";
import { keyCompatibility } from "./key-matching";
import { scoreSong } from "./scoring";
import { transitionInstruction, transitionTypeFor } from "./transition-engine";
import type { GigRequirements, SetlistResult, SetlistTrack, Song } from "./types";

function desiredTrackCount(requirements: GigRequirements) {
  const minutes = requirements.dj_set_duration || requirements.event_duration || 60;
  return Math.max(5, Math.min(60, Math.round(minutes / 4)));
}

function artistPenalty(candidate: Song, selected: SetlistTrack[]) {
  const recent = selected.slice(-4).filter((track) => track.song.artist.toLowerCase() === candidate.artist.toLowerCase());
  return recent.length * 18;
}

function sectionFor(position: number, total: number, eventType: string) {
  const ratio = position / Math.max(1, total);
  if (ratio <= 0.2) return eventType.toLowerCase().includes("wedding") ? "Warmup / guest arrival" : "Warmup";
  if (ratio <= 0.45) return "Build-up";
  if (ratio <= 0.75) return eventType.toLowerCase().includes("arabic") ? "Peak-time Dabke / party" : "Peak-time";
  if (ratio <= 0.9) return "Cooldown";
  return "Closing";
}

function enrichTrack(track: Omit<SetlistTrack, "section" | "introCue" | "mixInCue" | "mixOutCue" | "dropCue" | "loopCue" | "transitionType" | "transitionBars" | "transitionInstruction" | "performanceInstructions">, previous: Song | undefined, total: number, requirements: GigRequirements): SetlistTrack {
  const cues = cuePlan(track.song);
  const transitionType = transitionTypeFor(previous, track.song);
  const instruction = transitionInstruction(previous, track.song, transitionType, cues.transitionBars);
  return {
    ...track,
    section: sectionFor(track.position, total, requirements.event_type),
    introCue: cues.introCue,
    mixInCue: cues.mixInCue,
    mixOutCue: cues.mixOutCue,
    dropCue: cues.dropCue,
    loopCue: cues.loopCue,
    transitionType,
    transitionBars: cues.transitionBars,
    transitionInstruction: instruction,
    performanceInstructions: previous
      ? `Current song: ${previous.title}. Mix out at the estimated mix-out cue. Next song: ${track.song.title}. Begin at intro cue ${cues.introCue}, introduce over ${cues.transitionBars} bars, and follow the transition instruction.`
      : `Opening track. Start clean at intro cue ${cues.introCue}, set the room tone, and prepare the next track on phrase.`,
  };
}

export function buildSetlist(songs: Song[], requirements: GigRequirements): SetlistResult {
  const count = desiredTrackCount(requirements);
  const warnings: string[] = [];
  const selected: SetlistTrack[] = [];
  const pool = songs.filter((song) => !titleArtistMatch(song, requirements.do_not_play_songs ?? []));
  const mustPlays = pool.filter((song) => titleArtistMatch(song, requirements.must_play_songs ?? []));

  for (const song of mustPlays) {
    const scored = scoreSong(song, requirements, selected.length, count);
    if (scored && !selected.some((track) => track.song.id === song.id)) {
      selected.push({
        ...scored,
        position: selected.length + 1,
        section: "Must-play",
        bpmTransitionNote: "Must-play placement; adjust manually if the client requested a specific moment.",
        keyCompatibilityNote: "Must-play song included regardless of harmonic fit.",
        introCue: "0:00",
        mixInCue: "0:16",
        mixOutCue: "Final chorus",
        dropCue: "Estimated first chorus/drop",
        loopCue: "16 bars from intro",
        transitionType: "Blend",
        transitionBars: 16,
        transitionInstruction: "Must-play included first; adjust manually if the client requested a specific moment.",
        performanceInstructions: "Treat this must-play as a priority cue and protect the requested moment.",
      });
    }
  }

  while (selected.length < count && selected.length < pool.length) {
    const previous = selected.at(-1)?.song;
    const candidates = pool
      .filter((song) => !selected.some((track) => track.song.id === song.id))
      .map((song) => {
        const scored = scoreSong(song, requirements, selected.length, count);
        if (!scored) return null;
        const bpm = bpmTransition(previous?.bpm, song.bpm);
        const key = keyCompatibility(previous?.camelot_key, song.camelot_key);
        return {
          ...scored,
          score: scored.score + bpm.points + key.points - artistPenalty(song, selected),
          bpmTransitionNote: bpm.note,
          keyCompatibilityNote: key.note,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score);

    const best = candidates[0];
    if (!best) break;
    selected.push(enrichTrack({ ...best, score: Math.max(0, Math.round(best.score)), position: selected.length + 1 }, previous, count, requirements));
  }

  const mustPlayNames = requirements.must_play_songs ?? [];
  for (const name of mustPlayNames) {
    const found = mustPlays.find((song) => titleArtistMatch(song, [name]));
    if (!found) {
      warnings.push(`Must-play not found in library: ${name}.`);
    } else if (found.explicit && !requirements.explicit_content_allowed) {
      warnings.push(`Must-play found but excluded by explicit-content rule: ${name}.`);
    }
  }

  const gaps = missingStyleWarnings(songs, requirements);

  return {
    tracks: selected,
    warnings: [...warnings, ...gaps.warnings],
    suggestions: gaps.suggestions,
    energyCurveExplanation: energyCurveExplanation(requirements.energy_curve),
    djNotes: specialMomentNotes(requirements),
  };
}
