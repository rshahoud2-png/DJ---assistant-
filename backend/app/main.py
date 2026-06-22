from __future__ import annotations

import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.analysis import analyze_audio_file, average_energy, phrase_distance, transition_type
from app.schemas import (
    AnalyzeTransitionRequest,
    AnalyzeTransitionResponse,
    CuePoint,
    GenerateCuesRequest,
    GenerateCuesResponse,
    GenerateSetAnalysisRequest,
    GenerateSetAnalysisResponse,
    LoopSuggestion,
    SetTrackPlan,
    TrackAnalysis,
)

SUPPORTED_SUFFIXES = {".mp3", ".wav", ".aiff", ".aif", ".flac", ".m4a", ".aac", ".ogg"}

app = FastAPI(title="DJ Agent Analysis Backend", version="0.2.0")

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
    return {"status": "ok", "service": "dj-agent-analysis-backend", "analysis_engine": "librosa-structure-v2"}


@app.post("/analyze-track", response_model=TrackAnalysis)
async def analyze_track(file: UploadFile = File(...)) -> TrackAnalysis:
    suffix = Path(file.filename or "upload.wav").suffix.lower() or ".wav"
    if suffix not in SUPPORTED_SUFFIXES:
        raise HTTPException(status_code=415, detail=f"Unsupported audio type '{suffix}'. Upload MP3, WAV, AIFF, FLAC, M4A, AAC, or OGG.")
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
            downbeat_timestamps=result.downbeat_timestamps,
            phrase_boundaries=result.phrase_boundaries,
            intro_cue=result.intro_cue,
            mix_in_cue=result.mix_in_cue,
            mix_out_cue=result.mix_out_cue,
            drop_cue=result.drop_cue,
            loop_cue=result.loop_cue,
            energy_curve=result.energy_curve,
            onset_strength=result.onset_strength,
            spectral_flux=result.spectral_flux,
            novelty_curve=result.novelty_curve,
            structure=result.structure,
            confidence_scores=result.confidence_scores,
            analysis_confidence=result.analysis_confidence,
            warnings=result.warnings,
            metadata={"filename": file.filename, "content_type": file.content_type},
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Audio analysis failed: {exc}") from exc
    finally:
        if temp_path and temp_path.exists():
            temp_path.unlink(missing_ok=True)


def _structure_conf(track: TrackAnalysis, key: str, fallback: float) -> float:
    if track.structure:
        value = getattr(track.structure, key, None)
        if value:
            return float(value.confidence)
    return float(track.confidence_scores.get(key, fallback))


@app.post("/generate-cues", response_model=GenerateCuesResponse)
def generate_cues(request: GenerateCuesRequest) -> GenerateCuesResponse:
    track = request.track
    warnings = list(track.warnings)
    intro_conf = _structure_conf(track, "intro_start", 0.65)
    mix_conf = _structure_conf(track, "vocal_start", track.analysis_confidence * 0.8)
    drop_conf = _structure_conf(track, "first_drop", track.confidence_scores.get("drop", 0.5))
    out_conf = _structure_conf(track, "outro_start", track.confidence_scores.get("outro", 0.5))
    loop_conf = float(track.loop_cue.get("confidence", track.confidence_scores.get("loop", 0.45)))
    if min(intro_conf, mix_conf, drop_conf, out_conf) < 0.4:
        warnings.append("One or more cue estimates are low confidence; verify in DJ software before performance.")
    hot_cues = [
        CuePoint(label="Hot Cue A", name="Intro Start", timestamp=track.intro_cue, reason="First stable beat / intro phrase detected.", confidence=intro_conf),
        CuePoint(label="Hot Cue B", name="Mix In / Vocal Start", timestamp=track.mix_in_cue, reason="Estimated first main phrase, vocal, or build after intro.", confidence=mix_conf),
        CuePoint(label="Hot Cue C", name="Drop / Hook", timestamp=track.drop_cue, reason="Largest early RMS/onset novelty increase after intro.", confidence=drop_conf),
        CuePoint(label="Hot Cue D", name="Mix Out / Outro", timestamp=track.mix_out_cue, reason="Lower-complexity phrase region in the final third.", confidence=out_conf),
    ]
    loop = LoopSuggestion(
        start=float(track.loop_cue.get("start", 0.0)),
        end=float(track.loop_cue.get("end", 0.0)),
        bars=int(track.loop_cue.get("bars", 16)),
        reason=str(track.loop_cue.get("reason", "Stable beat and energy region.")),
        confidence=loop_conf,
    )
    transition_bars = 32 if track.estimated_bpm >= 118 else 16
    notes = [
        f"Estimated BPM is {track.estimated_bpm} with {round(track.analysis_confidence * 100)}% overall confidence.",
        f"Use Hot Cue B for a phrase-safe mix-in and Hot Cue D for mix-out planning.",
        f"Suggested loop is {loop.bars} bars from {loop.start}s to {loop.end}s.",
    ]
    return GenerateCuesResponse(hot_cues=hot_cues, loop_suggestion=loop, suggested_transition_length_bars=transition_bars, dj_notes=notes, warnings=warnings)


@app.post("/analyze-transition", response_model=AnalyzeTransitionResponse)
def analyze_transition(request: AnalyzeTransitionRequest) -> AnalyzeTransitionResponse:
    current = request.current_track
    nxt = request.next_track
    bpm_diff = abs(current.estimated_bpm - nxt.estimated_bpm)
    current_energy = average_energy(current.energy_curve)
    next_energy = average_energy(nxt.energy_curve)
    energy_delta = next_energy - current_energy
    phrase_gap = phrase_distance(current.mix_out_cue, nxt.mix_in_cue, max(current.estimated_bpm, nxt.estimated_bpm, 60.0))
    structure_score = max(0.0, min(1.0, 1.0 - phrase_gap)) * min(current.analysis_confidence, nxt.analysis_confidence)
    next_has_drop = _structure_conf(nxt, "first_drop", 0.5) >= 0.45
    recommended = transition_type(current.estimated_bpm, nxt.estimated_bpm, current_energy, next_energy, structure_score, next_has_drop)
    bpm_score = max(0, 100 - bpm_diff * 4)
    energy_score = max(0, 100 - abs(energy_delta) * 80)
    compatibility = int(max(0, min(100, bpm_score * 0.35 + energy_score * 0.25 + structure_score * 40)))
    bars = 32 if recommended in {"Blend", "Loop Transition"} else 16
    if recommended in {"Cut", "Drop Swap", "Slam Mix"}:
        bars = 8
    warnings: list[str] = []
    if current.analysis_confidence < 0.45 or nxt.analysis_confidence < 0.45:
        warnings.append("Structure confidence is low for at least one track; verify cues manually.")
    if bpm_diff > 18:
        warnings.append("Large BPM difference; avoid a long transparent blend unless tempo-adjusted.")
    if request.desired_energy_direction == "up" and energy_delta < -0.1:
        warnings.append("Requested energy should rise, but next track appears lower energy.")
    energy_text = "energy rises" if energy_delta > 0.08 else "energy drops" if energy_delta < -0.08 else "energy stays steady"
    bpm_text = "BPMs are close" if bpm_diff <= 4 else "BPMs are workable" if bpm_diff <= 10 else "BPM jump is large"
    structure_text = "phrases align well" if structure_score > 0.65 else "phrase alignment is usable" if structure_score > 0.4 else "phrase alignment is uncertain"
    instruction = (
        f"Start the next track from Hot Cue A or B on a {bars}-bar phrase. "
        f"Bring in highs and mids first. Keep bass out until the final 8 bars, then swap bass on the downbeat. "
        f"Recommended transition: {recommended}."
    )
    return AnalyzeTransitionResponse(
        compatibility_score=compatibility,
        bpm_difference=round(bpm_diff, 2),
        recommended_transition_type=recommended,
        suggested_transition_length_bars=bars,
        current_track_mix_out_cue=current.mix_out_cue,
        next_track_mix_in_cue=nxt.mix_in_cue,
        current_track_phrase_alignment_notes=f"Mix out near {current.mix_out_cue}s; {structure_text} against the next mix-in.",
        next_track_phrase_alignment_notes=f"Start next track near {nxt.mix_in_cue}s or intro {nxt.intro_cue}s depending on section energy.",
        energy_compatibility=f"{energy_text}; current {round(current_energy, 2)} to next {round(next_energy, 2)}.",
        bpm_compatibility=f"{bpm_text}; difference {round(bpm_diff, 2)} BPM.",
        structure_compatibility=f"Structure score {round(structure_score, 2)}; {structure_text}.",
        warnings=warnings,
        dj_performance_instruction=instruction,
    )


def event_sections(event_type: str) -> list[str]:
    key = event_type.lower()
    if "arabic" in key and "wedding" in key:
        return ["Dinner", "Entrance", "First Dance", "Arabic Warmup", "Dabke", "Arabic Peak", "English / Latin Peak", "Slow Dance", "Closing"]
    if "wedding" in key:
        return ["Dinner", "Entrance", "First Dance", "Open Dance", "Throwbacks", "Peak Party", "Slow Dance", "Closing"]
    if "club" in key:
        return ["Warmup", "Build Up", "Peak", "Reset", "Peak 2", "Closing"]
    if any(word in key for word in ["lounge", "cafe", "restaurant", "bar"]):
        return ["Background", "Warm Groove", "Social Energy", "Cooldown"]
    return ["Warmup", "Build-up", "Peak-time", "Cooldown", "Closing"]


def section_for(index: int, total: int, sections: list[str]) -> str:
    if total <= 1:
        return sections[0]
    section_index = min(len(sections) - 1, int(index / max(1, total) * len(sections)))
    return sections[section_index]


def section_target_energy(section: str) -> float:
    lower = section.lower()
    if any(word in lower for word in ["dinner", "background", "first dance", "slow", "cooldown"]):
        return 0.28
    if any(word in lower for word in ["warm", "entrance", "throwback", "social"]):
        return 0.48
    if any(word in lower for word in ["dabke", "peak", "party", "open dance"]):
        return 0.82
    if "closing" in lower:
        return 0.62
    return 0.55


@app.post("/generate-set-analysis", response_model=GenerateSetAnalysisResponse)
def generate_set_analysis(request: GenerateSetAnalysisRequest) -> GenerateSetAnalysisResponse:
    sections = event_sections(request.event_profile.event_type)
    target_count = max(1, min(len(request.tracks), round(request.event_profile.event_duration / 4)))
    remaining = list(request.tracks)
    selected: list[TrackAnalysis] = []
    warnings: list[str] = []
    for index in range(target_count):
        section = section_for(index, target_count, sections)
        target_energy = section_target_energy(section)
        def score(track: TrackAnalysis) -> float:
            energy = average_energy(track.energy_curve)
            energy_fit = 1 - abs(energy - target_energy)
            confidence = track.analysis_confidence
            artist_penalty = 0.2 if track.artist and any(prev.artist == track.artist for prev in selected[-3:]) else 0
            transition_fit = 0.0
            if selected:
                transition = analyze_transition(AnalyzeTransitionRequest(current_track=selected[-1], next_track=track, event_section=section))
                transition_fit = transition.compatibility_score / 100
            return energy_fit * 0.45 + confidence * 0.25 + transition_fit * 0.25 - artist_penalty
        best = max(remaining, key=score)
        remaining.remove(best)
        selected.append(best)
    plans: list[SetTrackPlan] = []
    cue_notes_all: list[str] = []
    transition_notes_all: list[str] = []
    for index, track in enumerate(selected):
        section = section_for(index, len(selected), sections)
        cue_notes = [
            f"Hot Cue A intro at {track.intro_cue}s.",
            f"Hot Cue B mix-in/vocal start at {track.mix_in_cue}s.",
            f"Hot Cue C drop/hook at {track.drop_cue}s.",
            f"Hot Cue D mix-out/outro at {track.mix_out_cue}s.",
            f"Loop suggestion: {track.loop_cue.get('start')}s to {track.loop_cue.get('end')}s for {track.loop_cue.get('bars')} bars.",
        ]
        cue_notes_all.extend([f"Track {index + 1}: {note}" for note in cue_notes])
        transition_notes: list[str] = []
        track_warnings = list(track.warnings)
        if index > 0:
            transition = analyze_transition(AnalyzeTransitionRequest(current_track=selected[index - 1], next_track=track, event_section=section))
            note = transition.dj_performance_instruction
            transition_notes.append(note)
            transition_notes_all.append(f"Track {index} to {index + 1}: {note}")
            if transition.compatibility_score < 55:
                warning = f"Track {index + 1} has weak transition compatibility ({transition.compatibility_score})."
                warnings.append(warning)
                track_warnings.append(warning)
            warnings.extend(transition.warnings)
        energy = average_energy(track.energy_curve)
        if section_target_energy(section) > 0.7 and energy < 0.45:
            track_warnings.append("This track may be too low-energy for a peak section.")
        if section_target_energy(section) < 0.35 and energy > 0.7:
            track_warnings.append("This track may be too high-energy for a dinner/background section.")
        plans.append(SetTrackPlan(position=index + 1, section=section, track=track, cue_notes=cue_notes, transition_notes=transition_notes, warnings=track_warnings))
    confidence = round(sum(track.analysis_confidence for track in selected) / max(1, len(selected)), 3)
    return GenerateSetAnalysisResponse(
        ordered_setlist=plans,
        event_sections=sections,
        song_by_song_cue_notes=cue_notes_all,
        transition_notes=transition_notes_all,
        warnings=sorted(set(warnings)),
        confidence_score=confidence,
    )
