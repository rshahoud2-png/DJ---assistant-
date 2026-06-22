export type EnergyCurve =
  | "dinner_to_party"
  | "slow_build"
  | "high_energy_all_night"
  | "peak_then_cool_down"
  | "chill_lounge"
  | "wedding_flow"
  | "arabic_wedding_flow";

export type SpecialMoment = {
  name: string;
  targetUse?: string;
  notes?: string;
};

export type TransitionType = "Blend" | "Echo Out" | "Loop Transition" | "Fade" | "Cut" | "Drop Swap";

export type Song = {
  id: string;
  user_id?: string;
  title: string;
  artist: string;
  genre?: string | null;
  subgenre?: string | null;
  bpm?: number | null;
  musical_key?: string | null;
  camelot_key?: string | null;
  energy_level?: number | null;
  mood?: string | null;
  language?: string | null;
  culture_tags?: string[] | null;
  explicit?: boolean | null;
  best_use?: string[] | null;
  file_path?: string | null;
  duration?: number | null;
  notes?: string | null;
  album?: string | null;
  rating?: number | null;
  comments?: string | null;
  source_software?: string | null;
  existing_playlist?: string | null;
  existing_crate?: string | null;
  intro_cue?: string | null;
  mix_in_cue?: string | null;
  mix_out_cue?: string | null;
  drop_cue?: string | null;
  loop_cue?: string | null;
};

export type GigRequirements = {
  event_type: string;
  crowd_age_range?: string | null;
  requested_styles?: string[] | null;
  styles_to_avoid?: string[] | null;
  culture_language_preferences?: string[] | null;
  event_duration?: number | null;
  dj_set_duration?: number | null;
  desired_vibe?: string | null;
  explicit_content_allowed: boolean;
  must_play_songs?: string[] | null;
  do_not_play_songs?: string[] | null;
  special_moments?: SpecialMoment[] | null;
  energy_curve: EnergyCurve;
  customer_notes?: string | null;
};

export type ScoredSong = {
  song: Song;
  score: number;
  reasons: string[];
  warnings: string[];
};

export type SetlistTrack = ScoredSong & {
  position: number;
  section: string;
  bpmTransitionNote: string;
  keyCompatibilityNote: string;
  moment?: string;
  introCue: string;
  mixInCue: string;
  mixOutCue: string;
  dropCue: string;
  loopCue: string;
  transitionType: TransitionType;
  transitionBars: number;
  transitionInstruction: string;
  performanceInstructions: string;
};

export type SetlistResult = {
  tracks: SetlistTrack[];
  warnings: string[];
  suggestions: string[];
  energyCurveExplanation: string;
  djNotes: string[];
};
