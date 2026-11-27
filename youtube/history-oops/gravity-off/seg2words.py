"""Hand-checked speech segments of voice.mp3 (from silencedetect) -> work/words.json + work/phrases.json"""
import json
SEG = [
 (0.00, 1.557, "What if gravity turned off..."), (1.80, 3.19, "for just five seconds?"), (3.61, 4.11, "Second one."),
 (4.61, 7.19, "Everything that isn't tied down starts to float."), (7.67, 9.12, "Your coffee. Your cat."), (9.48, 9.83, "You."),
 (10.41, 11.98, "Cars lift off the highway."), (12.46, 13.98, "The drivers are still holding the wheel."), (14.33, 14.99, "Still honking."),
 (15.60, 16.15, "Second two."), (16.66, 20.14, "The ocean rises into giant wobbling blobs."), (20.57, 21.56, "The fish look around,"),
 (21.89, 22.73, "very confused."), (23.21, 23.78, "Second three."), (24.26, 27.41, "Eight billion people drift slowly into the sky."),
 (27.98, 29.19, "Most of them in pajamas."), (29.72, 31.18, "Astronauts on the space station"), (31.40, 32.45, "finally feel normal."),
 (33.05, 33.71, "Second four."), (34.13, 36.59, "One guy is still trying to finish his sandwich."), (36.90, 37.81, "Second five."),
 (38.03, 39.30, "Gravity comes back."), (39.47, 40.98, "And everything comes down."), (41.30, 42.50, "At the same time."),
 (42.79, 45.17, "Eight billion people land on their butts."), (45.48, 46.83, "Cars land on cars."), (47.15, 48.69, "The ocean lands on the beach."),
 (49.02, 50.32, "The cat lands on its feet."), (50.56, 51.07, "Of course."), (51.57, 53.72, "And the only person on Earth who didn't fall?"),
 (54.15, 54.59, "This guy."), (55.00, 56.82, "He was asleep in bed the whole time."), (57.08, 58.09, "He didn't even notice."),
 (58.39, 60.47, "Follow, before gravity turns off again."),
]
words, phrases = [], []
for s, e, t in SEG:
    ws = t.split(); L = [len(w) + 1 for w in ws]; tot = sum(L); c = s
    for w, l in zip(ws, L):
        d = (e - s) * l / tot; words.append({"w": w, "s": round(c, 3), "e": round(c + d - 0.02, 3)}); c += d
    phrases.append({"text": t, "s": s, "e": e})
json.dump(words, open("work/words.json", "w"), indent=1)
json.dump({"duration": 60.72, "phrases": phrases}, open("work/phrases.json", "w"), indent=1)
for p in phrases: print(f"f{round(p['s']*30):5d}-{round(p['e']*30):5d}  {p['text']}")
