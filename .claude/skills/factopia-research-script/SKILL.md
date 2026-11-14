---
name: factopia-research-script
description: Research a topic and write the script for a History Oops / Factopia animated Short - landscape scan of existing videos, audience questions, verified facts with sources, 3-5 angles for the user to pick from, then a shot-by-shot script scored against the channel's retention rules. Use whenever the user wants a new video idea, research on a topic, or a script for the channel.
---

# Factopia: research -> angles -> script

The channel makes 30-60 s vertical animated Shorts with a recurring host (orange cap, round
glasses, teal top). Our engine draws 2D cartoon characters inside detailed 3D sets (see
`cartoon-audio-short`). This skill covers everything BEFORE the scenes are built: what the
video is about, why it will hold people, and the exact words. Talk to the user in Hebrew
(masculine forms); scripts are in English.

Work in five stages and stop for the user's choice after Stage 3 and after Stage 4.

## Stage 1 - Landscape scan (what already exists)

Goal: know what the audience has already seen, so our angle is new.

1. Search YouTube for the topic (Composio `YOUTUBE_SEARCH_YOU_TUBE`, `order: viewCount`,
   recent `publishedAfter`, then `YOUTUBE_GET_VIDEO_DETAILS_BATCH` for real views, likes,
   comments, duration). Keep Shorts (<= 180 s). Use 3-6 query variants: the plain topic,
   the topic + "shorts", the "sounds fake but true" framing, the "what if" framing.
2. Record the top 10: views, length, title pattern, the first line or hook if visible.
3. Write down the **gap**: what every top video does the same way, and what none of them do
   (a fact they skip, a person nobody names, a twist, a number nobody shows).

Never copy a specific video: not its title, script, characters or voice. Topics and formats
are free; a specific execution is not.

## Stage 2 - Facts and audience

1. **Facts.** Find the core facts with at least two independent sources each (WebSearch).
   Prefer primary sources (journals, archives, official records, reputable outlets). Note
   dates, numbers and names exactly. If a famous story is unproven, say so - "unproven
   legend" is itself a great twist (the Einstein 9x10 video).
2. **Audience mining.** Look for what people ask or argue about: top comments on the big
   videos (when available), "is it true that...", "why does...", forum threads. The most
   argued point is usually the best hook or the best final question.
3. **Negative space.** List the facts that are often stated wrongly. Our script must not
   repeat a myth unless the video is about the myth.

Output of Stages 1-2: a short research brief (bullets, with source links) saved to
`youtube/history-oops/<slug>/research.md`.

## Stage 3 - Angles (user picks one)

Write 3-5 angles. Each angle = one line title + a 1-2 sentence pitch + why it can hold
viewers, judged against the rules below. Mark one as recommended. Present them to the user
and wait for a pick.

What has worked for this channel and the niche (from our own analytics and research):
- **One clear question in the first 2 seconds, one climax near the end** (Vasa: ~70% viewed).
- A string of separate jokes without one climax keeps fewer people (Emu: ~51%).
- **Famous subject + paradox** pulls clicks fastest (Einstein: 311 views/hour on day one).
- Big niche patterns: "sounds fake but true", the human body ("why does your body..."),
  "what if" questions, a countdown to one moment, money/treasure, famous people.
- Ask a question the viewer answers in their head instantly - that is what drives comments.

## Stage 4 - Script (user approves)

Write the script as a table: `# | narration | on screen`. Then the stats line: word count,
estimated length (about 2.6 words per second for Ethan), where the climax lands.

Hard rules (check every one before showing the user):
1. **Hook in the first sentence**: the strangest true thing, said plainly, within 2-3 s.
   The first visual must show it (no empty establishing shot while the hook is spoken).
2. **A bridge** right after the hook into the story (e.g. "So he walked up to the board…").
3. **One build that escalates** - each beat bigger than the last; cut every 1-2 s visually.
4. **Climax at 60-75% of the runtime**, not in the middle.
5. **Short ending**: at most 2-3 short lines after the climax. End on the punch or on the
   comment question - never on an explanation or an outro.
6. **Comment question** at the end (or pinned) that everyone can answer in one word or one
   name. Write it in our own words, not the user's draft wording.
7. **Recurring host** appears: at least one reaction mid-video and one close-up at the end.
8. **Facts are sourced** (from the brief). Mark any line that simplifies a fact.
9. No gore, no real private people, nothing that targets a real person in a hurtful way.
   Dark premises (e.g. a death notebook) stay cartoon: characters fall out of frame, a ghost
   with a halo floats up.
10. 30-45 s is the sweet spot; over 60 s needs a reason.

## Stage 5 - Self-review, then hand off

Score the approved script 1-10 on: hook strength, curiosity held to the climax, ending
tightness, comment pull, originality vs the landscape scan. Fix anything under 7 before
recording. Then give the upload package (title with the hook phrase + #shorts, description
with the source in one line, the pinned comment question, 5-8 tags) and save
`script.txt` + `tts_prompt.txt` (Ethan tags: [excited] [calm] [playful] [softly] [warm]
[laughs]) in the video's folder. The build itself continues with `cartoon-audio-short`.

## While producing

Re-check any number or date that changed while editing the script (fact drift happens late).
If the user changes a line, re-run the hard rules on the new version and say which rule it
affects.
