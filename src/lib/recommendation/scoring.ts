import { eventTypeTags, titleArtistMatch, tokenMatch } from "./compatibility";
import { targetEnergy } from "./energy-curve";
import type { GigRequirements, ScoredSong, Song } from "./types";

function clampScore(score: number) {
  return Math.max(0, Math.round(score));
}

export function scoreSong(song: Song, requirements: GigRequirements, position: number, total: number): ScoredSong | null {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let score = 40;

  if (titleArtistMatch(song, requirements.do_not_play_songs ?? [])) return null;
  if (song.explicit && !requirements.explicit_content_allowed) return null;

  const requestedMatches = tokenMatch(song, requirements.requested_styles ?? []);
  if (requestedMatches.length) {
    score += requestedMatches.length * 12;
    reasons.push(`Matches requested style: ${requestedMatches.join(", ")}.`);
  }

  const blockedMatches = tokenMatch(song, requirements.styles_to_avoid ?? []);
  if (blockedMatches.length) {
    score -= blockedMatches.length * 25;
    warnings.push(`Touches avoided style: ${blockedMatches.join(", ")}.`);
  }

  const cultureMatches = tokenMatch(song, requirements.culture_language_preferences ?? []);
  if (cultureMatches.length) {
    score += cultureMatches.length * 10;
    reasons.push(`Fits culture/language preference: ${cultureMatches.join(", ")}.`);
  }

  if (requirements.desired_vibe && tokenMatch(song, [requirements.desired_vibe]).length) {
    score += 10;
    reasons.push(`Fits desired vibe: ${requirements.desired_vibe}.`);
  }

  const momentTags = (requirements.special_moments ?? []).flatMap((moment) => [moment.name, moment.targetUse ?? ""]);
  const momentMatches = tokenMatch(song, momentTags);
  if (momentMatches.length) {
    score += momentMatches.length * 10;
    reasons.push(`Matches special moment best-use tag: ${momentMatches.join(", ")}.`);
  }

  const eventMatches = tokenMatch(song, eventTypeTags(requirements.event_type));
  if (eventMatches.length) {
    score += eventMatches.length * 8;
    reasons.push(`Fits ${requirements.event_type} context.`);
  }

  const target = targetEnergy(requirements.energy_curve, position, total);
  const energy = song.energy_level ?? target;
  const energyDiff = Math.abs(energy - target);
  score += Math.max(0, 14 - energyDiff * 4);
  reasons.push(`Energy ${energy}/10 fits target ${target}/10 for this point in the set.`);

  if (titleArtistMatch(song, requirements.must_play_songs ?? [])) {
    score += 100;
    reasons.push("Must-play song found in the library.");
  }

  return { song, score: clampScore(score), reasons, warnings };
}
