from typing import Any, Literal

from pydantic import BaseModel, Field


TransitionType = Literal["Blend", "Echo Out", "Loop Transition", "Fade", "Cut", "Drop Swap", "Slam Mix"]


class TimestampConfidence(BaseModel):
    timestamp: float
    confidence: float
    reason: str


class LoopSuggestion(BaseModel):
    start: float
    end: float
    bars: int
    reason: str = "Stable beat and energy region."
    confidence: float = 0.5


class TrackStructure(BaseModel):
    intro_start: TimestampConfidence
    intro_end: TimestampConfidence
    vocal_start: TimestampConfidence
    first_drop: TimestampConfidence
    breakdown: TimestampConfidence
    build_up: TimestampConfidence
    peak_energy_section: dict[str, float]
    outro_start: TimestampConfidence
    outro_end: TimestampConfidence
    phrase_boundaries: list[float]
    novelty_curve: list[float]
    onset_strength: list[float]
    spectral_flux: list[float]


class CuePoint(BaseModel):
    label: str
    name: str
    timestamp: float
    reason: str
    confidence: float


class TrackAnalysis(BaseModel):
    title: str | None = None
    artist: str | None = None
    estimated_bpm: float
    duration: float
    beat_timestamps: list[float]
    downbeat_timestamps: list[float] = Field(default_factory=list)
    phrase_boundaries: list[float] = Field(default_factory=list)
    intro_cue: float
    mix_in_cue: float
    mix_out_cue: float
    drop_cue: float
    loop_cue: dict[str, float | int | str]
    energy_curve: list[float]
    onset_strength: list[float] = Field(default_factory=list)
    spectral_flux: list[float] = Field(default_factory=list)
    novelty_curve: list[float] = Field(default_factory=list)
    structure: TrackStructure | None = None
    confidence_scores: dict[str, float] = Field(default_factory=dict)
    analysis_confidence: float
    warnings: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class GenerateCuesRequest(BaseModel):
    track: TrackAnalysis


class GenerateCuesResponse(BaseModel):
    hot_cues: list[CuePoint]
    loop_suggestion: LoopSuggestion
    suggested_transition_length_bars: int
    dj_notes: list[str]
    warnings: list[str]


class AnalyzeTransitionRequest(BaseModel):
    current_track: TrackAnalysis
    next_track: TrackAnalysis
    event_section: str | None = None
    desired_energy_direction: Literal["up", "down", "maintain"] | None = None


class AnalyzeTransitionResponse(BaseModel):
    compatibility_score: int
    bpm_difference: float
    recommended_transition_type: TransitionType
    suggested_transition_length_bars: int
    current_track_mix_out_cue: float
    next_track_mix_in_cue: float
    current_track_phrase_alignment_notes: str
    next_track_phrase_alignment_notes: str
    energy_compatibility: str
    bpm_compatibility: str
    structure_compatibility: str
    warnings: list[str]
    dj_performance_instruction: str


class EventProfile(BaseModel):
    event_name: str | None = None
    event_type: str
    event_duration: int
    crowd_age_range: str | None = None
    music_preferences: list[str] = Field(default_factory=list)
    energy_preference: str = "balanced"


class GenerateSetAnalysisRequest(BaseModel):
    event_profile: EventProfile
    tracks: list[TrackAnalysis]


class SetTrackPlan(BaseModel):
    position: int
    section: str
    track: TrackAnalysis
    cue_notes: list[str]
    transition_notes: list[str]
    warnings: list[str] = Field(default_factory=list)


class GenerateSetAnalysisResponse(BaseModel):
    ordered_setlist: list[SetTrackPlan]
    event_sections: list[str]
    song_by_song_cue_notes: list[str]
    transition_notes: list[str]
    warnings: list[str]
    confidence_score: float
