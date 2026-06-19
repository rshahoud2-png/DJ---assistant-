import type { GigRequirements, Song } from "./types";

export function missingStyleWarnings(songs: Song[], requirements: GigRequirements) {
  const requested = requirements.requested_styles ?? [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  const libraryText = songs
    .flatMap((song) => [song.genre, song.subgenre, song.language, song.mood, ...(song.culture_tags ?? [])])
    .join(" ")
    .toLowerCase();

  for (const style of requested) {
    if (!libraryText.includes(style.toLowerCase())) {
      warnings.push(`Library appears light on requested style: ${style}.`);
      suggestions.push(`Add more tracks or tags for ${style}.`);
    }
  }

  if (requirements.event_type.toLowerCase().includes("arabic") && !libraryText.includes("dabke")) {
    warnings.push("Arabic wedding flow requested but Dabke-tagged songs are missing or sparse.");
    suggestions.push("Add Dabke, Arabic party, and family-friendly high-energy tags.");
  }

  return { warnings, suggestions };
}

export function specialMomentNotes(requirements: GigRequirements) {
  return (requirements.special_moments ?? []).map((moment) => {
    const target = moment.targetUse ? ` Target best_use tag: ${moment.targetUse}.` : "";
    return `${moment.name}: ${moment.notes ?? "Plan a clean cue and confirm timing with the client."}${target}`;
  });
}
