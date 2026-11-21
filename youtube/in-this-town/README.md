# In This Town (new channel) — blocky 3D shorts

- `web/style.html`: three.js scene (original blocky style). Needs three@0.160.0 unpacked next to it as `package/` (`npm pack three@0.160.0 && tar xzf three-0.160.0.tgz`) and a `node_modules` link with playwright.
- `web/shot.mjs page.html out.jpg frame` renders one frame (SwiftShader WebGL).
- Narration: the user records it; we pitch it up and speed it up with ffmpeg (no ElevenLabs).
