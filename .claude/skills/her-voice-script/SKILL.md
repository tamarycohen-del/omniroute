---
name: her-voice-script
description: Write the next part of the HER VOICE horror series ("Would You Open the Door?", History Oops). Uses the series brief, the real comment vote, and the channel's retention/growth rules. Use when asked for a HER VOICE script or the next part.
---

# Write a HER VOICE part

Read first: `youtube/horror/it-knows-her-voice/SERIES_BRIEF.md` (characters, full plot, open mysteries, rules) and the previous part's script/words (`partN/script.txt`, `web/wordsN.json`).

## Inputs to collect
1. The vote: pull comments + likes on the last part (YouTube `YOUTUBE_LIST_COMMENT_THREADS2`, Instagram `INSTAGRAM_GET_IG_MEDIA_COMMENTS`). Winner = most total likes; ignore the channel's own pinned comment.
2. Stats of the last parts (views, avg watch time, saves, shares) to decide what to fix.

## Fixed structure (keep the length: 80-90 s, ~200-230 words; viewers asked for long parts)
1. Cold open on a NEW scary image + hook line ("Imagine…") that works for someone who never saw earlier parts.
2. A PROMISE in the first 8 s that pays off later ("And tonight… she finally speaks").
3. "In the comments, you said: <choice>." + 4 REAL viewer comments on screen + a 2-word reaction ("Bold call.").
4. 8-12 short beats, a new scary image every 2-3 s.
5. RE-HOOK at ~25-30 s (where viewers leave): sudden change + "But that wasn't the scary part" style line.
6. A PAUSE CLUE (something visible for ~1 s that is explained later) → saves/rewatches.
7. A "that's my mom" moment (something every kid knows) → shares.
8. A twist near the end that reuses an old clue (Mom never says "honey"; Mom always texts "love you"; Biscuit growls at fakes).
9. "So… do you <A>? Or <B>?" + "Comment your choice. Part N follows you." Two RED cards, short caps; Biscuit in the scene; both options risky; one option includes Biscuit.

## Growth checklist (problem → cause → fix)
no views → bad hook → promise something · no saves → no value → give a clue worth rewatching · no comments → no excitement → a bold, hard choice · no likes → not relevant → say it differently · no shares → not relatable → make them feel seen · no followers → not unique → lean on Biscuit and "your comments decide".

## Rules
Simple English, short present-tense sentences, no gore. Never solve all mysteries. The narrator never says "the voice". Character lines (Mom, Mrs. Hale) are recorded in separate takes, never in the same take as "X said:". Keep continuity (3:3x-3:4x AM clock, Mom's stretching arms, Mrs. Hale's too-wide smile, Biscuit). Ask the user before any plot decision that changes the series rules; list those decisions at the end of the script.

## Output
`partN/script.txt`: header (vote result, stats lessons, time card, word count) + table `# | narration | on screen` + recording notes + pinned comment + "plot decisions to confirm".
