import type { Song } from "./types";

function norm(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

export function tokenMatch(song: Song, tokens: string[] = []) {
  const haystack = [
    song.genre,
    song.subgenre,
    song.mood,
    song.language,
    ...(song.culture_tags ?? []),
    ...(song.best_use ?? []),
  ]
    .map(norm)
    .filter(Boolean);

  return tokens.filter((token) => haystack.some((value) => value.includes(norm(token)) || norm(token).includes(value)));
}

export function titleArtistMatch(song: Song, names: string[] = []) {
  const full = `${song.title} ${song.artist}`.toLowerCase();
  return names.some((name) => full.includes(name.toLowerCase().trim()));
}

export function eventTypeTags(eventType: string) {
  const event = norm(eventType);
  if (event.includes("arabic") || event.includes("dabke")) return ["arabic", "dabke", "party", "family-friendly"];
  if (event.includes("corporate")) return ["clean", "familiar", "pop", "medium"];
  if (event.includes("hookah") || event.includes("lounge") || event.includes("restaurant") || event.includes("bar")) {
    return ["chill", "lounge", "smooth", "r&b", "afrobeats"];
  }
  if (event.includes("club")) return ["club", "dance", "high-energy"];
  if (event.includes("wedding")) return ["wedding", "party", "slow dance", "family-friendly"];
  return [];
}
