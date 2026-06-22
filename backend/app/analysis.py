from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import librosa
import numpy as np


@dataclass
class AnalysisResult:
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


def _safe_float(value: float) -> float:
    if np.isnan(value) or np.isinf(value):
        return 0.0
    return round(float(value), 3)


def _nearest_beat(beats: np.ndarray, target: float) -> float:
    if beats.size == 0:
        return max(0.0, target)
    return _safe_float(beats[np.argmin(np.abs(beats - target))])


def _energy_curve(y: np.ndarray, hop_length: int) -> tuple[np.ndarray, list[float]]:
    rms = librosa.feature.rms(y=y, hop_length=hop_length)[0]
    if rms.size == 0:
        return rms, []
    normalized = rms / max(float(np.max(rms)), 1e-9)
    buckets = np.array_split(normalized, min(32, max(1, normalized.size)))
    return normalized, [_safe_float(float(np.mean(bucket))) for bucket in buckets]


def _estimate_drop(times: np.ndarray, energy: np.ndarray, beats: np.ndarray, duration: float) -> float:
    if energy.size < 4 or times.size < 4:
        return _nearest_beat(beats, duration * 0.3)
    smoothed = np.convolve(energy, np.ones(8) / 8, mode="same") if energy.size >= 8 else energy
    delta = np.diff(smoothed, prepend=smoothed[0])
    search_start = int(len(delta) * 0.08)
    search_end = int(len(delta) * 0.65)
    if search_end <= search_start:
        return _nearest_beat(beats, duration * 0.3)
    local_index = int(np.argmax(delta[search_start:search_end])) + search_start
    return _nearest_beat(beats, float(times[min(local_index, len(times) - 1)]))


def _estimate_loop(beats: np.ndarray, energy: np.ndarray, duration: float) -> dict[str, float | int]:
    if beats.size < 16:
        start = max(0.0, duration * 0.1)
        return {"start": _safe_float(start), "end": _safe_float(min(duration, start + 16.0)), "bars": 8}
    best_start = beats[0]
    best_score = float("inf")
    bars = 16
    beats_per_region = bars * 4
    for idx in range(0, max(1, len(beats) - beats_per_region), 4):
        region_start = beats[idx]
        region_end = beats[min(idx + beats_per_region - 1, len(beats) - 1)]
        if region_start < 8 or region_end > duration * 0.75:
            continue
        start_frame = int((idx / max(1, len(beats))) * max(1, len(energy) - 1))
        end_frame = int(((idx + beats_per_region) / max(1, len(beats))) * max(1, len(energy) - 1))
        region = energy[start_frame:max(start_frame + 1, end_frame)]
        score = float(np.var(region)) if region.size else 1.0
        if score < best_score:
            best_score = score
            best_start = region_start
    beat_interval = float(np.median(np.diff(beats))) if beats.size > 1 else 0.5
    return {"start": _safe_float(best_start), "end": _safe_float(best_start + beat_interval * beats_per_region), "bars": bars}


def analyze_audio_file(path: Path) -> AnalysisResult:
    y, sr = librosa.load(path, sr=None, mono=True)
    duration = float(librosa.get_duration(y=y, sr=sr))
    hop_length = 512
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr, hop_length=hop_length)
    estimated_bpm = float(np.ravel(tempo)[0]) if np.size(tempo) else 0.0
    beat_times = librosa.frames_to_time(beat_frames, sr=sr, hop_length=hop_length)
    energy, curve = _energy_curve(y, hop_length)
    frame_times = librosa.frames_to_time(np.arange(len(energy)), sr=sr, hop_length=hop_length) if len(energy) else np.array([])

    intro = _nearest_beat(beat_times, beat_times[0] if beat_times.size else 0.0)
    mix_in = _nearest_beat(beat_times, min(duration * 0.12, 24.0))
    drop = _estimate_drop(frame_times, energy, beat_times, duration)
    mix_out = _nearest_beat(beat_times, max(0.0, duration * 0.76))
    loop = _estimate_loop(beat_times, energy, duration)

    beat_density = min(1.0, len(beat_times) / max(1.0, duration / 60.0 * max(estimated_bpm, 60.0)))
    energy_variation = float(np.std(energy)) if len(energy) else 0.0
    confidence = min(0.98, max(0.35, 0.45 + beat_density * 0.35 + min(0.2, energy_variation)))

    return AnalysisResult(
        estimated_bpm=_safe_float(estimated_bpm),
        duration=_safe_float(duration),
        beat_timestamps=[_safe_float(value) for value in beat_times[:512]],
        intro_cue=intro,
        mix_in_cue=mix_in,
        mix_out_cue=mix_out,
        drop_cue=drop,
        loop_cue=loop,
        energy_curve=curve,
        analysis_confidence=_safe_float(confidence),
    )


def transition_type(current_bpm: float, next_bpm: float, current_energy: float, next_energy: float) -> str:
    bpm_diff = abs(current_bpm - next_bpm)
    energy_diff = next_energy - current_energy
    if bpm_diff <= 4 and abs(energy_diff) <= 0.2:
        return "Blend"
    if bpm_diff <= 8 and energy_diff > 0.25:
        return "Drop Swap"
    if bpm_diff <= 10:
        return "Loop Transition"
    if bpm_diff >= 18:
        return "Cut"
    if energy_diff < -0.25:
        return "Fade"
    return "Echo Out"


def average_energy(curve: list[float]) -> float:
    return float(np.mean(curve)) if curve else 0.5
