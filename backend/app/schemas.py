from typing import Any, Literal

from pydantic import BaseModel, Field


class CuePoint(BaseModel):
    label: str
    name: str
    timestamp: float
    note: str


class TrackAnalysis(BaseModel):
    title: str | None = None
    artist: str | None = None
    estimated_bpm: float
    duration: float
    beat_timestamps: list[float]
    intro_cue: float
    mix_in_cue: float
    mix_out_cue: float
    drop_cue: float
    loop_cue: dict[str, float | int]
    energy_curve: list[float]
    analysis_confidence: float
    metadata: dict[str, Any] = Field(default_factory=dict)


class GenerateCuesRequest(BaseModel):
    track: TrackAnalysis


class GenerateCuesResponse(BaseModel):
    hot_cues: list[CuePoint]
    suggested_loop_region: dict[str, float | int]
    dj_notes: list[str]


class AnalyzeTransitionRequest(BaseModel):
    current_track: TrackAnalysis
    next_track: TrackAnalysis


class AnalyzeTransitionResponse(BaseModel):
    transition_compatibility_score: int
    bpm_difference: float
    recommended_transition_type: Literal["Blend", "Echo Out", "Loop Transition", "Fade", "Cut", "Drop Swap"]
    transition_bars: int
    mix_out_instruction: str
    mix_in_instruction: str
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
    song_by_song_set_order: list[SetTrackPlan]
    event_sections: list[str]
    warnings_for_bad_transitions: list[str]
