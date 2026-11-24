# 🎬 3D Animation — make a 3D animated short with Claude

**What this is.** A studio-in-a-folder. You bring an idea; Claude turns it
into a finished ~30-second narrated 3D animated short in the myth-busting
style: the story everyone believes, the twist, the real mechanism — glossy
stylized 3D, glowing annotations, zoom-ins and screen shakes.

**How it works** — about 30 minutes of your time:

| Step | What happens | Who does it |
|---|---|---|
| 1 | You give an idea (or ask for a trending one). Claude researches it, writes the script and a shot-by-shot scene plan. | Claude |
| 2 | **Style key** — one image prompt; you run it in your image generator. It locks the look of the whole video. | You (1 generation) |
| 3 | **Assets** — one image prompt per character, location and prop; you run each with the style key attached and save them as `sheets/<name>.png`. These keep every scene consistent. | You (~8–10 generations) |
| 4 | **Scenes** — one timed prompt per 10-second block; you run each in your video generator with the named sheets attached and save them as `clips/block01.mp4`, `block02.mp4`, … | You (3 generations for 30s) |
| 5 | **Voice + cut** — you pick a narrator. Claude generates the narration on your machine, free, and cuts the final video with zoom-ins and shakes. | Claude |

**What you need:**
- Claude Code, with this folder opened as a project
- An AI image model and a video model that accept reference images
  (Seedream and Gemini Omni are the proven pair; Veo, Kling and others work
  too) — about 12 generations per 30-second video
- Two small free tools (ffmpeg, edge-tts) — Claude checks and offers to
  install them for you

**To start:** open this folder in Claude Code and say **"let's make a
video."** Claude guides every step; you never need to touch anything
technical.

Every video you make is kept in `projects/<name>/` — script, prompts,
sheets, clips, and the finished `final.mp4`.
