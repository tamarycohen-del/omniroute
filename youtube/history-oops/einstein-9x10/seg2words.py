"""Hand-checked speech segments of voice.mp3 (Ethan, 55.84 s) -> work/words.json + work/phrases.json"""
import json, os
SEG = [
 (0.00, 3.21, "One day, Albert Einstein walked into a classroom..."), (3.47, 4.28, "and wrote on the board."),
 (4.83, 5.81, "Nine times one,"), (6.06, 6.38, "nine."), (6.87, 7.78, "Nine times two,"), (8.04, 8.53, "eighteen."),
 (9.03, 10.02, "Nine times three,"), (10.24, 10.98, "twenty-seven."), (11.57, 13.00, "All the way down to..."),
 (13.27, 14.73, "nine times ten..."), (15.24, 15.99, "ninety-one."), (16.32, 18.64, "The whole class started laughing."),
 (19.12, 22.08, "The smartest man in the world just got basic math wrong!"), (22.92, 23.68, "Einstein waited."),
 (24.35, 25.66, "Then he turned around and said:"), (26.31, 27.31, "\"I got nine of them right."), (27.91, 28.83, "Nobody said a word."),
 (29.44, 30.37, "I got one wrong..."), (30.83, 31.62, "and everyone laughed.\""), (32.75, 33.89, "\"That's how the world works."),
 (34.30, 35.70, "You can do nine things right,"), (35.97, 38.31, "and people will only remember the one you got wrong.\""),
 (38.90, 40.09, "Pretty powerful, right?"), (40.58, 41.31, "Here's the twist."), (41.66, 43.56, "There's no proof this ever happened."),
 (43.95, 44.49, "No date."), (44.79, 45.50, "No school."), (45.67, 46.89, "No student who was there."), (47.31, 48.46, "It's an internet legend."),
 (49.05, 49.66, "But the lesson?"), (50.18, 51.27, "That part is real."), (51.90, 54.23, "So next time someone laughs at your one mistake..."),
 (54.66, 55.56, "remember the other nine."),
]
os.makedirs("work", exist_ok=True); words, phrases = [], []
for s, e, t in SEG:
    ws = t.split(); L = [len(w) + 1 for w in ws]; tot = sum(L); c = s
    for w, l in zip(ws, L):
        d = (e - s) * l / tot; words.append({"w": w, "s": round(c, 3), "e": round(c + d - 0.02, 3)}); c += d
    phrases.append({"text": t, "s": s, "e": e})
json.dump(words, open("work/words.json", "w"), indent=1)
json.dump({"duration": 55.84, "phrases": phrases}, open("work/phrases.json", "w"), indent=1)
for p in phrases: print(f"f{round(p['s']*30):5d}-{round(p['e']*30):5d}  {p['text']}")
