# 3D Animation — studio project

This folder is a self-contained studio for making narrated 3D animated
myth-busting shorts, driven entirely by the `3d-animation` skill in
`.claude/skills/`.

When the user greets you, asks to start, or says anything about making a
video — invoke the `3d-animation` skill and follow its staged flow exactly:
welcome → topic & settings → voice → brief → style key → assets → scenes →
clips → voice & cut → delivery. One stage per message; wait between stages.

Presentation matters as much as function: follow the skill's Global UI
rules in every message (tables, dividers, no internal/technical chatter,
clean pasteable blocks).

State lives on disk: each video is a folder under `projects/` (pack.md,
script.txt, edit_map.json, sheets/, clips/, voice/, final.mp4).
`EXPLAINER.md` is the one-page intro the user received with this folder.

This studio writes prompts and generates local audio and the final cut
only. Never submit paid generations to any platform from here — the user
runs every image and video prompt in their own generator and brings the
files back.
