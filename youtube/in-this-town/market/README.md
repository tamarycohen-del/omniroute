# "The New Guy" — blocky 3D supermarket comedy short (39.4 s, 9:16, no voice, no on-screen text)

Original designs in a Roblox-inspired blocky style (no Roblox assets, faces or logos).
- `web/market.html`: whole short in three.js (needs three@0.160.0 unpacked as `web/package/` and a node_modules link with playwright).
- `web/rend3d.mjs market.html fr A B`: render frames A..B (SwiftShader WebGL). ~1.4 s/frame; run 3 in parallel.
- `web/sheet.mjs market.html out.jpg t1 t2 ...`: contact sheet for checking shots.
- `audio/sfx_market.py out.wav`: synthesized music + SFX matching the shot timeline.
Scenes: arrive 0-3.6, manager 3.6-7.6, melon 7.6-12, cans 12-16.4, eggs 16.4-20.4, boss 20.4-24.4, brag 24.4-28.6, reveal 28.6-32.6, fired 32.6-36.6, end 36.6-39.4.
