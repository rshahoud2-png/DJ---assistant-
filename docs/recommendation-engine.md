# Rule-Based Recommendation Engine

The recommendation engine is deterministic and lives in `src/lib/recommendation`. It does not call OpenAI, Anthropic, Gemini, Replicate, RunPod, or any hosted model.

Each song starts with a base score, then receives adjustments for:

- requested genre/style matches
- blocked style penalties
- culture and language matches
- mood and desired vibe matches
- event type context
- explicit-content filtering
- energy curve fit
- BPM transition smoothness
- Camelot key compatibility
- must-play boosts
- do-not-play exclusions
- artist repeat penalties
- best-use and special moment tags

Hard rules:

- Explicit songs are excluded when explicit content is not allowed.
- Do-not-play songs are excluded.
- Must-play songs are inserted first when they exist in the user's library.
- Arabic wedding flows favor Arabic, Dabke, party, family-friendly, high-energy songs after dinner.
- Corporate events favor clean, familiar, medium-energy tracks.
- Lounge, hookah, restaurant, and bar events favor smooth flow and avoid sudden BPM jumps.
- Club sets prioritize energy, BPM flow, and harmonic compatibility.
- Wedding flows support special moments such as entrance, first dance, dinner, open dance, cake, Dabke, and closing song.
