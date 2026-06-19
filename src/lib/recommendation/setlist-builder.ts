import { bpmTransition } from "./bpm-transition";
import { titleArtistMatch } from "./compatibility";
import { energyCurveExplanation } from "./energy-curve";
import { missingStyleWarnings, specialMomentNotes } from "./explanations";
import { keyCompatibility } from "./key-matching";
import { scoreSong } from "./scoring";
import type { GigRequirements, SetlistResult, SetlistTrack, Song } from "./types";

function desiredTrackCount(requirements: GigRequirements) {
  const minutes = requirements.dj_set_duration || requirements.event_duration || 60;
  return Math.max(5, Math.min(60, Math.round(minutes / 4)));
}

function artistPenalty(candidate: Song, selected: SetlistTrack[]) {
  const recent = selected.slice(-4).filter((track) => track.song.artist.toLowerCase() === candidate.artist.toLowerCase());
  return recent.length * 18;
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
        bpmTransitionNote: "Must-play placement; adjust manually if the client requested a specific moment.",
        keyCompatibilityNote: "Must-play song included regardless of harmonic fit.",
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
    selected.push({ ...best, score: Math.max(0, Math.round(best.score)), position: selected.length + 1 });
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
