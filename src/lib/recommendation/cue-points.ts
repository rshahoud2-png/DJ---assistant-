import type { Song } from "./types";

function barsToTime(bars: number, bpm?: number | null) {
  const beatSeconds = bpm ? 60 / bpm : 0.5;
  const seconds = Math.round(bars * 4 * beatSeconds);
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

export function cuePlan(song: Song) {
  const duration = song.duration ?? 240;
  const genre = `${song.genre ?? ""} ${song.subgenre ?? ""}`.toLowerCase();
  const phrase = genre.includes("house") || genre.includes("club") || genre.includes("dance") ? 32 : 16;
  const intro = song.intro_cue || "0:00";
  const mixIn = song.mix_in_cue || barsToTime(phrase === 32 ? 16 : 8, song.bpm);
  const drop = song.drop_cue || barsToTime(phrase === 32 ? 64 : 32, song.bpm);
  const mixOutSeconds = Math.max(45, duration - Math.round((phrase * 4 * 60) / (song.bpm || 120)));
  const mixOut = song.mix_out_cue || `${Math.floor(mixOutSeconds / 60)}:${String(mixOutSeconds % 60).padStart(2, "0")}`;
  const loop = song.loop_cue || `${phrase} bars from intro or final chorus`;

  return {
    introCue: intro,
    mixInCue: mixIn,
    mixOutCue: mixOut,
    dropCue: drop,
    loopCue: loop,
    transitionBars: phrase,
  };
}

export function cueNote(song: Song) {
  const cue = cuePlan(song);
  return `Intro ${cue.introCue}; mix in around ${cue.mixInCue}; prepare the drop near ${cue.dropCue}; start mix-out near ${cue.mixOutCue}; loop ${cue.loopCue} if the floor needs more time.`;
}
