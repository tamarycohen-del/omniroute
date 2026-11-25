HINTERKAIFECK - YouTube Short (1080x1920, 30 fps, 68.7 s, English)
Title:      THE FARMHOUSE THAT HID A HORRIFYING SECRET
Alt title:  HINTERKAIFECK: THE UNSOLVED MURDERS
End card:   HINTERKAIFECK - 1922 / UNSOLVED.

FILES
  final_video.mp4   the finished short (H.264 + AAC, -14.3 LUFS, true peak -1.9 dB)
  thumbnail.png     1080x1920: farmhouse in a dark snowy forest, one lit attic window, "WHO WAS INSIDE?"
  narration.wav     the voiceover alone (48 kHz)
  subtitles.srt     subtitles from word timings (short phrases)
  assets/           raw narration + per-line timings, music/SFX mix (mix.wav, mix_final.wav)
  source_code/      everything needed to rebuild it

HOW IT WAS MADE (free, local, no paid generation or credits)
  Voice:   OmniVoice (k2-fsa, open model, via VoiceStudio) on CPU, one line at a time, each line with its own
           emotion reference (tense / curious / whisper / calm / dread) - see source_code/narration_script.txt
           and youtube/tools/vstts.py. Sped up 1.1x (ffmpeg atempo) for a slightly fast, suspenseful read.
  Timing:  faster-whisper word timestamps (source_code/words.py -> words.json); lines.json = sentence times.
  Picture: source_code/hk.html - every frame drawn in code (HTML canvas 2D): inked comic outlines, flat
           navy / muted green / black palette, hatching, grain, vignette. One farmhouse design used in every
           shot. Frames rendered with Playwright (Chromium), encoded with ffmpeg.
  Sound:   source_code/mix.py - original music synthesised in numpy (low F drone, rising pulse, dissonant pad,
           and a detuned music box playing "Tonight You Belong to Me" (Lee David / Billy Rose, 1926; the
           composition is public domain in the US since 2022) that slowly winds down at the end. The melody was
           transcribed by pitch-tracking the 1927 Gene Austin record (archive.org) as a reference only; no
           recording is in the mix. Note: outside the US (e.g. EU) the composition may still be protected.
           Music box alone: assets/musicbox_only.wav) + CC0 effects from youtube/sfx/sfx-kit and youtube/sfx/earshot (wind, snow steps,
           creaks, distant thunder, paper, impacts). Music ducks under the voice; loudnorm to -14 LUFS.
  Rebuild: python source_code/words.py narration.wav ; python source_code/mix.py narration.wav source_code/lines.json assets/mix.wav
           serve source_code/ and call window.renderFrame(f) for f = 0..2061 (see youtube scratch r2d.mjs);
           node source_code/thumb.mjs source_code thumbnail.png

SCENES (artistic reconstructions - not photographs, not evidence)
  1 farmhouse + "1922. BAVARIA, GERMANY."   2 footprints in snow from the forest   3 untouched snow, "NO TRACKS BACK"
  4 the attic   5 Andreas Gruber searching with a lantern   6 storm night, one lit window, "MARCH 31, 1922."
  7 the last window goes dark (no crime shown)   8 calendar Mar 31 -> Apr 4   9 three neighbours approach
  10 empty hallway   11 barn with livestock   12 smoke from the chimney   13 a faint glow in the attic window
  14 an unidentified silhouette near the forest (not presented as the killer)   15 detective + police files,
  "100+ INVESTIGATIONS"   16 "UNSOLVED" stamp   17 demolition, "1923"   18-19 empty site in fog,
  "THE CASE REMAINS UNSOLVED."   end card

ACCURACY NOTES
  - Confirmed facts used: six people killed on the night of 31 March - 1 April 1922 (the Gruber/Gabriel family
    and the maid Maria Baumgartner); found on 4 April 1922; over 100 investigations/suspects questioned by 1930;
    the house was demolished in 1923 (a weapon was found during demolition - not shown/claimed in the video);
    the case is unsolved.
  - Reported, not proven: the footprints in the snow, the attic footsteps, and the farm being tended (animals fed,
    chimney smoke) after the murders come from witness and investigation accounts. The script says "reported",
    "reportedly", "may have" and "appeared"; the video never says the footprints belonged to the killer, never
    names or suggests a killer, and the silhouette is anonymous.
  - No victims, bodies, injuries or weapons are drawn. No invented dialogue, motives or evidence.
    No fabricated "photos": everything is a drawn reconstruction.
  - Wording note: the script line "Four days passed before their disappearance was discovered" is kept as written;
    historically, it was the deaths that were discovered on 4 April.
