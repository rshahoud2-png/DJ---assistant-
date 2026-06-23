from __future__ import annotations

import gc
import os
from dataclasses import dataclass
from pathlib import Path

import librosa
import numpy as np

ANALYSIS_SAMPLE_RATE = int(os.getenv("ANALYSIS_SAMPLE_RATE", "22050"))
MAX_ANALYSIS_SECONDS = int(os.getenv("MAX_ANALYSIS_SECONDS", "480"))
HOP_LENGTH = int(os.getenv("ANALYSIS_HOP_LENGTH", "1024"))
MAX_BEAT_TIMESTAMPS = 512
MAX_DOWNBEAT_TIMESTAMPS = 128
MAX_PHRASE_BOUNDARIES = 96
CURVE_BUCKETS = 64


@dataclass
class AnalysisResult:
    estimated_bpm: float
    duration: float
    beat_timestamps: list[float]
    downbeat_timestamps: list[float]
    phrase_boundaries: list[float]
    intro_cue: float
    mix_in_cue: float
    mix_out_cue: float
    drop_cue: float
    loop_cue: dict[str, float | int | str]
    energy_curve: list[float]
    onset_strength: list[float]
    spectral_flux: list[float]
    novelty_curve: list[float]
    structure: dict
    confidence_scores: dict[str, float]
    analysis_confidence: float
    warnings: list[str]


def _safe_float(value: float, digits: int = 2) -> float:
    if np.isnan(value) or np.isinf(value):
        return 0.0
    return round(float(value), digits)


def _clip01(value: float) -> float:
    return _safe_float(float(np.clip(value, 0.0, 1.0)), 3)


def _nearest(values: np.ndarray, target: float) -> float:
    if values.size == 0:
        return _safe_float(max(0.0, target))
    return _safe_float(values[np.argmin(np.abs(values - target))])


def _bucket(values: np.ndarray, count: int = CURVE_BUCKETS) -> list[float]:
    if values.size == 0:
        return []
    values = values.astype(np.float32, copy=False)
    normalized = values / max(float(np.max(np.abs(values))), 1e-9)
    buckets = np.array_split(normalized, min(count, max(1, normalized.size)))
    return [_safe_float(float(np.mean(bucket)), 3) for bucket in buckets]


def _rms_energy(y: np.ndarray, hop_length: int) -> tuple[np.ndarray, list[float]]:
    rms = librosa.feature.rms(y=y, hop_length=hop_length)[0].astype(np.float32, copy=False)
    if rms.size == 0:
        return rms, []
    normalized = rms / max(float(np.max(rms)), 1e-9)
    return normalized.astype(np.float32, copy=False), _bucket(normalized, CURVE_BUCKETS)


def _spectral_flux(y: np.ndarray, hop_length: int) -> np.ndarray:
    # Keep this intentionally lightweight: 1024 FFT, complex64, and only a 64-value bucket is returned.
    spec = np.abs(librosa.stft(y, n_fft=1024, hop_length=hop_length, dtype=np.complex64)).astype(np.float32, copy=False)
    if spec.shape[1] < 2:
        return np.array([], dtype=np.float32)
    diff = np.diff(spec, axis=1)
    flux = np.sqrt(np.sum(np.maximum(diff, 0.0) ** 2, axis=0)).astype(np.float32, copy=False)
    del spec, diff
    if flux.size == 0:
        return flux
    return flux / max(float(np.max(flux)), 1e-9)


def _phrase_boundaries(beats: np.ndarray, phrase_beats: int = 32) -> list[float]:
    if beats.size == 0:
        return []
    return [_safe_float(beats[index]) for index in range(0, len(beats), phrase_beats)][:MAX_PHRASE_BOUNDARIES]


def _timestamp(timestamp: float, confidence: float, reason: str) -> dict[str, float | str]:
    return {"timestamp": _safe_float(timestamp), "confidence": _clip01(confidence), "reason": reason}


def _first_major_increase(times: np.ndarray, signal: np.ndarray, beats: np.ndarray, duration: float, start_ratio: float, end_ratio: float) -> tuple[float, float]:
    if signal.size < 8 or times.size < 8:
        return _nearest(beats, duration * start_ratio), 0.35
    smoothed = np.convolve(signal, np.ones(8, dtype=np.float32) / 8, mode="same")
    delta = np.diff(smoothed, prepend=smoothed[0])
    start = int(len(delta) * start_ratio)
    end = max(start + 1, int(len(delta) * end_ratio))
    segment = delta[start:end]
    if segment.size == 0:
        return _nearest(beats, duration * start_ratio), 0.35
    local = int(np.argmax(segment)) + start
    confidence = _clip01(float(delta[local]) * 4 + float(smoothed[local]) * 0.4)
    return _nearest(beats, float(times[min(local, len(times) - 1)])), confidence


def _low_complexity_region(times: np.ndarray, energy: np.ndarray, novelty: np.ndarray, duration: float, start_ratio: float, end_ratio: float) -> tuple[float, float]:
    if energy.size < 8 or times.size < 8:
        return duration * start_ratio, 0.3
    start = int(len(energy) * start_ratio)
    end = max(start + 1, int(len(energy) * end_ratio))
    best_idx = start
    best_score = float("inf")
    window = max(4, int(len(energy) * 0.03))
    for idx in range(start, max(start + 1, end - window)):
        energy_var = float(np.var(energy[idx:idx + window]))
        novelty_slice = novelty[idx:min(len(novelty), idx + window)] if novelty.size else np.array([0.0], dtype=np.float32)
        score = energy_var + float(np.mean(novelty_slice)) * 0.2
        if score < best_score:
            best_score = score
            best_idx = idx
    confidence = _clip01(0.8 - best_score * 3)
    return float(times[min(best_idx, len(times) - 1)]), confidence


def _loop_region(beats: np.ndarray, energy: np.ndarray, duration: float) -> dict[str, float | int | str]:
    if beats.size < 16:
        start = max(0.0, duration * 0.1)
        return {"start": _safe_float(start), "end": _safe_float(min(duration, start + 16.0)), "bars": 8, "reason": "Limited beat data; fallback loop region.", "confidence": 0.25}
    best = {"score": float("inf"), "start": float(beats[0]), "bars": 8}
    for bars in (8, 16, 32):
        beat_count = bars * 4
        if len(beats) <= beat_count:
            continue
        for idx in range(0, len(beats) - beat_count, 4):
            start_t = float(beats[idx])
            end_t = float(beats[idx + beat_count - 1])
            if start_t < 8 or end_t > duration * 0.78:
                continue
            start_frame = int(idx / max(1, len(beats)) * max(1, len(energy) - 1))
            end_frame = int((idx + beat_count) / max(1, len(beats)) * max(1, len(energy) - 1))
            region = energy[start_frame:max(start_frame + 1, end_frame)]
            beat_spacing = np.diff(beats[idx:idx + beat_count])
            score = float(np.var(region)) + float(np.var(beat_spacing))
            if score < best["score"]:
                best = {"score": score, "start": start_t, "bars": bars}
    interval = float(np.median(np.diff(beats))) if beats.size > 1 else 0.5
    confidence = _clip01(0.9 - float(best["score"]) * 4)
    return {"start": _safe_float(float(best["start"])), "end": _safe_float(float(best["start"]) + interval * int(best["bars"]) * 4), "bars": int(best["bars"]), "reason": "Stable energy and consistent beat spacing region.", "confidence": confidence}


def analyze_audio_file(path: Path) -> AnalysisResult:
    warnings: list[str] = []
    y: np.ndarray | None = None
    try:
        y, sr = librosa.load(path, sr=ANALYSIS_SAMPLE_RATE, mono=True, duration=MAX_ANALYSIS_SECONDS)
        y = y.astype(np.float32, copy=False)
        if y.size == 0:
            raise ValueError("Uploaded file contains no decodable audio.")

        duration = float(librosa.get_duration(y=y, sr=sr))
        if duration < 5:
            raise ValueError("Track is too short for DJ structure analysis.")
        if duration >= MAX_ANALYSIS_SECONDS - 0.5:
            warnings.append(f"Only the first {MAX_ANALYSIS_SECONDS // 60} minutes were analyzed to keep memory usage low on Fly.io.")

        tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr, hop_length=HOP_LENGTH)
        estimated_bpm = float(np.ravel(tempo)[0]) if np.size(tempo) else 0.0
        beat_times = librosa.frames_to_time(beat_frames, sr=sr, hop_length=HOP_LENGTH).astype(np.float32, copy=False)
        downbeats = beat_times[::4]
        phrases = _phrase_boundaries(beat_times, 32)

        energy, energy_curve = _rms_energy(y, HOP_LENGTH)
        onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=HOP_LENGTH).astype(np.float32, copy=False)
        onset_norm = onset_env / max(float(np.max(onset_env)), 1e-9) if onset_env.size else onset_env
        flux = _spectral_flux(y, HOP_LENGTH)
        min_len = min(len(onset_norm), len(flux)) if len(flux) else len(onset_norm)
        novelty = (onset_norm[:min_len] * 0.55 + flux[:min_len] * 0.45).astype(np.float32, copy=False) if min_len else onset_norm
        frame_times = librosa.frames_to_time(np.arange(len(energy)), sr=sr, hop_length=HOP_LENGTH).astype(np.float32, copy=False) if len(energy) else np.array([], dtype=np.float32)

        padded_novelty = np.pad(novelty, (0, max(0, len(energy) - len(novelty))))[:len(energy)] if len(energy) else np.array([], dtype=np.float32)
        energy_plus_novelty = (energy + padded_novelty).astype(np.float32, copy=False) if len(energy) else padded_novelty

        intro_start = _nearest(beat_times, beat_times[0] if beat_times.size else 0.0)
        intro_end, intro_conf = _first_major_increase(frame_times, energy_plus_novelty, beat_times, duration, 0.04, 0.28)
        vocal_start = _nearest(beat_times, max(intro_end, duration * 0.12))
        drop, drop_conf = _first_major_increase(frame_times, energy_plus_novelty, beat_times, duration, 0.15, 0.62)
        breakdown, breakdown_conf = _low_complexity_region(frame_times, energy, novelty, duration, 0.35, 0.72)
        build_up = _nearest(beat_times, max(intro_end, drop - 16.0))
        peak_idx = int(np.argmax(energy)) if energy.size else 0
        peak_time = float(frame_times[min(peak_idx, len(frame_times) - 1)]) if frame_times.size else duration * 0.5
        outro_start, outro_conf = _low_complexity_region(frame_times, energy, novelty, duration, 0.65, 0.92)
        outro_end = duration
        loop = _loop_region(beat_times, energy, duration)

        beat_density = min(1.0, len(beat_times) / max(1.0, duration / 60.0 * max(estimated_bpm, 60.0)))
        confidence_scores = {
            "tempo": _clip01(beat_density),
            "intro": intro_conf,
            "drop": drop_conf,
            "breakdown": breakdown_conf,
            "outro": outro_conf,
            "loop": float(loop.get("confidence", 0.4)),
        }
        if estimated_bpm <= 0 or confidence_scores["tempo"] < 0.45:
            warnings.append("Tempo confidence is low; verify BPM manually.")
        if drop_conf < 0.4:
            warnings.append("Drop/hook estimate is uncertain.")
        if outro_conf < 0.35:
            warnings.append("Outro estimate is uncertain; check mix-out cue before performance.")
        analysis_confidence = _clip01(float(np.mean(list(confidence_scores.values()))))

        structure = {
            "intro_start": _timestamp(intro_start, 0.8, "First stable beat detected."),
            "intro_end": _timestamp(intro_end, intro_conf, "First phrase boundary with rising energy/onset activity."),
            "vocal_start": _timestamp(vocal_start, intro_conf * 0.85, "Estimated start of main section after intro."),
            "first_drop": _timestamp(drop, drop_conf, "First major RMS/novelty increase after intro."),
            "breakdown": _timestamp(breakdown, breakdown_conf, "Lower-complexity phrase region after the first half."),
            "build_up": _timestamp(build_up, drop_conf * 0.8, "Phrase region leading into the estimated drop."),
            "peak_energy_section": {"start": _safe_float(max(0.0, peak_time - 8.0)), "end": _safe_float(min(duration, peak_time + 16.0)), "confidence": confidence_scores["drop"]},
            "outro_start": _timestamp(outro_start, outro_conf, "Final lower-complexity phrase region in the last third."),
            "outro_end": _timestamp(outro_end, 0.9, "End of analyzed audio."),
            "phrase_boundaries": phrases,
            "novelty_curve": _bucket(novelty, CURVE_BUCKETS),
            "onset_strength": _bucket(onset_norm, CURVE_BUCKETS),
            "spectral_flux": _bucket(flux, CURVE_BUCKETS),
        }

        return AnalysisResult(
            estimated_bpm=_safe_float(estimated_bpm),
            duration=_safe_float(duration),
            beat_timestamps=[_safe_float(value) for value in beat_times[:MAX_BEAT_TIMESTAMPS]],
            downbeat_timestamps=[_safe_float(value) for value in downbeats[:MAX_DOWNBEAT_TIMESTAMPS]],
            phrase_boundaries=phrases,
            intro_cue=_safe_float(intro_start),
            mix_in_cue=_safe_float(vocal_start),
            mix_out_cue=_safe_float(outro_start),
            drop_cue=_safe_float(drop),
            loop_cue=loop,
            energy_curve=energy_curve,
            onset_strength=_bucket(onset_norm, CURVE_BUCKETS),
            spectral_flux=_bucket(flux, CURVE_BUCKETS),
            novelty_curve=_bucket(novelty, CURVE_BUCKETS),
            structure=structure,
            confidence_scores=confidence_scores,
            analysis_confidence=analysis_confidence,
            warnings=warnings,
        )
    finally:
        del y
        gc.collect()


def average_energy(curve: list[float]) -> float:
    return float(np.mean(curve)) if curve else 0.5


def phrase_distance(a: float, b: float, bpm: float) -> float:
    phrase_seconds = (60.0 / max(bpm, 60.0)) * 4 * 16
    if phrase_seconds <= 0:
        return 1.0
    return abs((a - b) % phrase_seconds) / phrase_seconds


def transition_type(current_bpm: float, next_bpm: float, current_energy: float, next_energy: float, structure_score: float, next_has_drop: bool) -> str:
    bpm_diff = abs(current_bpm - next_bpm)
    energy_diff = next_energy - current_energy
    if bpm_diff <= 4 and structure_score > 0.65:
        return "Blend"
    if bpm_diff <= 8 and structure_score > 0.5:
        return "Loop Transition"
    if next_has_drop and energy_diff > 0.15:
        return "Drop Swap"
    if bpm_diff >= 22 and energy_diff > -0.2:
        return "Slam Mix"
    if bpm_diff >= 16:
        return "Cut"
    if energy_diff < -0.25:
        return "Fade"
    return "Echo Out"
