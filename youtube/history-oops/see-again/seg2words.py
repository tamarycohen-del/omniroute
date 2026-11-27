"""Hand-checked speech segments of voice.mp3 (ElevenLabs Ethan, 70.16 s) -> work/words.json + work/phrases.json"""
import json
SEG = [
 (0.00, 4.38, "What if you woke up tomorrow... and above everyone's head, you could see a number?"),
 (4.90, 5.74, "Not their age."), (5.90, 6.66, "Not their height."), (7.10, 10.10, "The exact number of times you will ever see them again."),
 (10.67, 11.76, "A stranger on the bus:"), (12.06, 12.45, "zero."), (12.95, 13.45, "Another one:"), (13.80, 14.32, "zero."),
 (14.78, 15.83, "The guy at the gas station:"), (16.26, 16.74, "zero."), (17.21, 19.98, "Most people you pass today, you will never pass again."),
 (20.50, 20.80, "Ever."), (21.41, 22.80, "Your coworker at the next desk:"), (23.23, 24.53, "two thousand four hundred."),
 (25.16, 26.34, "And then you see him."), (26.93, 27.35, "Your neighbor."), (27.87, 30.63, "The one who mows his lawn at seven a.m. every Saturday."),
 (31.16, 32.29, "Two thousand nine hundred."), (33.49, 33.99, "You laugh."), (34.63, 36.00, "The person you like the least..."),
 (36.26, 38.48, "you'll see almost three thousand more times."), (38.89, 40.23, "So you video call your mom."),
 (40.70, 42.14, "Her face pops up on the screen..."), (42.52, 43.55, "Two hundred eighty-eight."), (44.32, 44.86, "You freeze."),
 (45.50, 46.60, "She lives in another city."), (47.16, 48.76, "You visit her three times a year,"), (48.94, 50.34, "for about four days each time."),
 (50.87, 52.23, "That's twelve days a year."), (52.64, 54.11, "And it actually makes sense."), (54.43, 55.53, "Here's the weird part."),
 (55.87, 56.96, "This isn't magic."), (57.15, 57.76, "It's math."), (58.05, 59.26, "And anyone can do it."),
 (59.75, 62.86, "How often you see someone, times the years you have left together."), (63.32, 64.36, "The only difference is..."),
 (64.58, 65.76, "now you know your number."), (66.21, 66.91, "And the best part?"), (67.25, 67.96, "You can change it."),
 (68.45, 68.81, "So..."), (69.13, 69.88, "when are you visiting?"),
]
words, phrases = [], []
for s, e, t in SEG:
    ws = t.split(); L = [len(w) + 1 for w in ws]; tot = sum(L); c = s
    for w, l in zip(ws, L):
        d = (e - s) * l / tot; words.append({"w": w, "s": round(c, 3), "e": round(c + d - 0.02, 3)}); c += d
    phrases.append({"text": t, "s": s, "e": e})
json.dump(words, open("work/words.json", "w"), indent=1)
json.dump({"duration": 70.16, "phrases": phrases}, open("work/phrases.json", "w"), indent=1)
for p in phrases: print(f"f{round(p['s']*30):5d}-{round(p['e']*30):5d}  {p['text']}")
