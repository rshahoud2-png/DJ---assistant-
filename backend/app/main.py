from __future__ import annotations

import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.analysis import analyze_audio_file, average_energy, transition_type
from app.schemas import (
    AnalyzeTransitionRequest,
    AnalyzeTransitionResponse,
    CuePoint,
    GenerateCuesRequest,
    GenerateCuesResponse,
    GenerateSetAnalysisRequest,
    GenerateSetAnalysisResponse,
    SetTrackPlan,
    TrackAnalysis,
)

app = FastAPI(title="DJ Agent Analysis Backend", version="0.1.0")

allowed_origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "dj-agent-analysis-backend"}


@app.post("/analyze-track", response_model=TrackAnalysis)
async def analyze_track(file: UploadFile = File(...)) -> TrackAnalysis:
    suffix = Path(file.filename or "upload.wav").suffix or ".wav"
    temp_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_path = Path(temp_file.name)
            while chunk := await file.read(1024 * 1024):
                temp_file.write(chunk)
        result = analyze_audio_file(temp_path)
        return TrackAnalysis(
            title=file.filename,
            estimated_bpm=result.estimated_bpm,
            duration=result.duration,
            beat_timestamps=result.beat_timestamps,
            intro_cue=result.intro_cue,
            mix_in_cue=result.mix_in_cue,
            mix_out_cue=result.mix_out_cue,
            drop_cue=result.drop_cue,
            loop_cue=result.loop_cue,
            energy_curve=result.energy_curve,
            analysis_confidence=result.analysis_confidence,
            metadata={"filename": file.filename, "content_type": file.content_type},
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Audio analysis failed: {exc}") from exc
    finally:
        if temp_path and temp_path.exists():
            temp_path.unlink(missing_ok=True)


@app.post("/generate-cues", response_model=GenerateCuesResponse)
def generate_cues(request: GenerateCuesRequest) -> GenerateCuesResponse:
    track = request.track
    hot_cues = [
        CuePoint(label="Hot Cue A", name="Intro", timestamp=track.intro_cue, note="Start here for a clean phrase-aligned intro."),
        CuePoint(label="Hot Cue B", name="Vocal / Build", timestamp=track.mix_in_cue, note="Use this as the mix-in or vocal/build reference."),
        CuePoint(label="Hot Cue C", name="Drop / Hook", timestamp=track.drop_cue, note="Primary energy moment for crowd impact."),
        CuePoint(label="Hot Cue D", name="Mix-Out", timestamp=track.mix_out_cue, note="Prepare the outgoing transition here."),
    ]
    notes = [
        f"Estimated BPM is {track.estimated_bpm} with {round(track.analysis_confidence * 100)}% confidence.",
        "Use the suggested loop region when the next track needs more phrase time.",
        "Cue estimates come from beats, RMS energy changes, and common DJ song structure.",
    ]
    return GenerateCuesResponse(hot_cues=hot_cues, suggested_loop_region=track.loop_cue, dj_notes=notes)


@app.post("/analyze-transition", response_model=AnalyzeTransitionResponse)
def analyze_transition(request: AnalyzeTransitionRequest) -> AnalyzeTransitionResponse:
    current = request.current_track
    nxt = request.next_track
    bpm_diff = abs(current.estimated_bpm - nxt.estimated_bpm)
    current_energy = average_energy(current.energy_curve)
    next_energy = average_energy(nxt.energy_curve)
    recommended = transition_type(current.estimated_bpm, nxt.estimated_bpm, current_energy, next_energy)
    score = max(0, min(100, int(100 - bpm_diff * 3 - abs(next_energy - current_energy) * 35)))
    bars = 32 if recommended in {"Blend", "Loop Transition"} else 16
    if recommended in {"Cut", "Drop Swap"}:
        bars = 8
    return AnalyzeTransitionResponse(
        transition_compatibility_score=score,
        bpm_difference=round(bpm_diff, 2),
        recommended_transition_type=recommended,
        transition_bars=bars,
        mix_out_instruction=f"Begin leaving the current track near {current.mix_out_cue}s and protect phrase timing for {bars} bars.",
        mix_in_instruction=f"Start the next track near intro cue {nxt.intro_cue}s or mix-in cue {nxt.mix_in_cue}s depending on crowd energy.",
        dj_performance_instruction=f"Use {recommended}. BPM difference is {round(bpm_diff, 2)}; energy moves from {round(current_energy, 2)} to {round(next_energy, 2)}.",
    )


def section_for(index: int, total: int, event_type: str) -> str:
    ratio = (index + 1) / max(1, total)
    if ratio <= 0.2:
        return "Warmup / Arrival" if "wedding" in event_type.lower() else "Warmup"
    if ratio <= 0.45:
        return "Build-up"
    if ratio <= 0.75:
        return "Peak-time Dabke / Party" if "arabic" in event_type.lower() else "Peak-time"
    if ratio <= 0.9:
        return "Cooldown"
    return "Closing"


@app.post("/generate-set-analysis", response_model=GenerateSetAnalysisResponse)
def generate_set_analysis(request: GenerateSetAnalysisRequest) -> GenerateSetAnalysisResponse:
    tracks = sorted(request.tracks, key=lambda track: (average_energy(track.energy_curve), track.estimated_bpm))
    if request.event_profile.energy_preference.lower() in {"high", "high_energy", "party"}:
        tracks = sorted(request.tracks, key=lambda track: (track.estimated_bpm, average_energy(track.energy_curve)))
    target_count = max(1, min(len(tracks), round(request.event_profile.event_duration / 4)))
    selected = tracks[:target_count]
    plans: list[SetTrackPlan] = []
    warnings: list[str] = []
    for index, track in enumerate(selected):
        cue_notes = [
            f"Intro cue at {track.intro_cue}s.",
            f"Mix-in cue at {track.mix_in_cue}s.",
            f"Drop/hook cue at {track.drop_cue}s.",
            f"Mix-out cue at {track.mix_out_cue}s.",
        ]
        transition_notes: list[str] = []
        if index > 0:
            transition = analyze_transition(AnalyzeTransitionRequest(current_track=selected[index - 1], next_track=track))
            transition_notes.append(transition.dj_performance_instruction)
            if transition.transition_compatibility_score < 55:
                warnings.append(f"Track {index + 1} has a weaker transition score: {transition.transition_compatibility_score}.")
        plans.append(SetTrackPlan(position=index + 1, section=section_for(index, len(selected), request.event_profile.event_type), track=track, cue_notes=cue_notes, transition_notes=transition_notes))
    return GenerateSetAnalysisResponse(
        song_by_song_set_order=plans,
        event_sections=["Warmup", "Build-up", "Peak-time", "Cooldown", "Closing"],
        warnings_for_bad_transitions=warnings,
    )
