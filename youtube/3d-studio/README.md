# 3D Animation

Make a narrated 3D animated myth-busting short with Claude Code.

1. Open this folder in Claude Code.
2. Say **"let's make a video."**
3. Follow the guided steps — Claude writes everything, you run the prompts
   in your own generator, Claude voices and cuts the final video.

New here? Read **EXPLAINER.md** — one page, tells you everything.

---
Installed into omniroute (2026-11-24): the skill lives at `.claude/skills/3d-animation`, this folder holds the studio docs and `projects/` (example: trojan-horse).
Cloud note: edge-tts needs the proxy here; `scripts/voice.py` was patched to pass HTTPS_PROXY. The image/video prompts are run by the user in their own generator (the skill never spends anything).
