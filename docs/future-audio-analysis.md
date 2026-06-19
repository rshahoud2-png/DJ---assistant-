# Future Audio Analysis

This MVP intentionally requires manual metadata entry. It does not use paid AI APIs, hosted AI models, stem separation, or mashup rendering.

Future free/local options:

- Mixxx-style analysis: inspect BPM, key, replay gain, and cue metadata locally before uploading metadata.
- Essentia: run open-source audio feature extraction on a local machine or private worker controlled by the DJ.
- librosa: use a local Python script for tempo estimation, beat tracking, duration, and spectral features.
- Local Python worker: process files on the DJ's own computer, then upload only derived metadata to Supabase.

Suggested future architecture:

1. DJ drops files into a local folder.
2. A local Python worker analyzes audio using librosa or Essentia.
3. The worker asks the DJ to confirm BPM, key, mood, explicit flag, and best-use tags.
4. The app uploads metadata and optionally the private audio file to Supabase Storage.

Keep all future analysis optional and transparent. The DJ should always be able to edit metadata manually.
