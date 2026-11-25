# Emotion bank for VoiceStudio / OmniVoice (free local TTS)
OmniVoice takes no emotion commands; the emotion comes from the reference clip it clones.
Each clip here is a line already performed in one emotion (our narrator takes). Pick the emotion per sentence.
Add more: cut a 2-4 s clean clip of a line said with the wanted emotion, add it to bank.json with its exact text.
Used by youtube/tools/vstts.py.

## Setting up the engine in a fresh cloud session (~4 GB)
Hosts needed (already allowed): download.pytorch.org, download-r2.pytorch.org, huggingface.co + cdn-lfs hosts.
    git clone --depth 1 https://github.com/debpalash/VoiceStudio.git <dir>   # AGPL-3.0; the OmniVoice model is Apache-2.0
    python3 -m venv <venv> && <venv>/bin/pip install --index-url https://download.pytorch.org/whl/cpu torch torchaudio
    <venv>/bin/pip install "transformers>=5.10.0" accelerate soundfile pydub numpy safetensors huggingface_hub defusedxml audioop-lts
    HF_HUB_DISABLE_XET=1 (the xet CAS host is blocked; plain LFS works). Model: k2-fsa/OmniVoice (3.1 GB). CPU: ~25 s per sentence.
Supported in-text tags with this engine: [laughter], [sigh]. Not supported: [happy]/[sad]/[excited] (would be read aloud).
