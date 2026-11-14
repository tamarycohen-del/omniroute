"""Render EP01 'Pick One to Survive: Prison Escape' as a 1080x1920 Short."""
import json, math, subprocess, sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

BASE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(BASE, "dl")
OUT = os.path.join(BASE, "out"); os.makedirs(OUT, exist_ok=True)
W, H, FPS = 1080, 1920, 30
FONT = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
def font(s): return ImageFont.truetype(FONT, s)

words = json.load(open(f"{A}/vo/words.json"))["words"]
def speech(k): return words[k][-1][2]

# ---------- timeline ----------
# (key, vo_line, images, badge, extra_after_speech, stamp, overlay_text)
plan = [
    ("grid",  "L01", ["GRID"],          None, 0.25, None, "hook"),
    ("pick",  "L02", ["GRID"],          None, 0.45, None, "pick"),
    ("o1",    "L03", ["vent"],          1,    0.10, None, None),
    ("r1",    "L04", ["duct"],          1,    1.00, "CAUGHT", None),
    ("o2",    "L05", ["cart"],          2,    0.10, None, None),
    ("r2",    "L06", ["truck"],         2,    1.00, "CAUGHT", None),
    ("o3",    "L07", ["uniform"],       3,    0.10, None, None),
    ("r3",    "L08", ["warden"],        3,    1.00, "CAUGHT", None),
    ("o4",    "L09", ["sit"],           4,    0.45, None, None),
    ("r4",    "L10", ["alarm", "nod"],  4,    1.20, "SURVIVED", None),
    ("twist", "L11", ["monitors"],      None, 0.60, None, "217"),
    ("end",   "L12", ["cell"],          None, 0.90, None, "comment"),
]
segs, t = [], 0.0
for key, line, imgs, badge, extra, stamp, ov in plan:
    d = speech(line) + extra
    segs.append(dict(key=key, line=line, imgs=imgs, badge=badge, t0=t, t1=t + d,
                     sp_end=t + speech(line), stamp=stamp, ov=ov))
    t += d
TOTAL = t
print(f"total {TOTAL:.2f}s", file=sys.stderr)

# ---------- images ----------
def cover(im, w, h):
    r = max(w / im.width, h / im.height)
    im = im.resize((math.ceil(im.width * r), math.ceil(im.height * r)), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))

ZOOM = 1.12
src = {}
for n in ["cell", "vent", "cart", "uniform", "duct", "truck", "warden", "sit", "alarm", "nod", "monitors"]:
    im = Image.open(f"{A}/img/{n}.jpg").convert("RGB")
    if n == "monitors":
        im = ImageEnhance.Color(im).enhance(1.15)
    src[n] = cover(im, int(W * ZOOM), int(H * ZOOM))

def badge_img(n, r=62):
    s = r * 2 + 16
    b = Image.new("RGBA", (s, s), (0, 0, 0, 0)); d = ImageDraw.Draw(b)
    d.ellipse((8, 12, s - 8, s - 4), fill=(0, 0, 0, 140))
    d.ellipse((8, 8, s - 8, s - 8), fill=(255, 210, 0, 255), outline=(0, 0, 0, 255), width=6)
    f = font(int(r * 1.15)); tw = d.textlength(str(n), font=f)
    d.text(((s - tw) / 2, s / 2 - r * 0.72), str(n), font=f, fill=(0, 0, 0, 255))
    return b
BADGES = {i: badge_img(i) for i in range(1, 5)}
BADGES_SMALL = {i: badge_img(i, 48) for i in range(1, 5)}

# 2x2 grid with small badges
grid = Image.new("RGB", (int(W * ZOOM), int(H * ZOOM)))
gw, gh = grid.width // 2, grid.height // 2
for i, n in enumerate(["vent", "cart", "uniform", "cell"]):
    p = cover(Image.open(f"{A}/img/{n}.jpg").convert("RGB"), gw - 6, gh - 6)
    x, y = (i % 2) * gw + 3, (i // 2) * gh + 3
    grid.paste(p, (x, y))
    bd = BADGES_SMALL[i + 1]
    grid.paste(bd, (x + 105, y + (230 if i < 2 else 60)), bd)
src["GRID"] = grid

# vignette + grain
yy, xx = np.mgrid[0:H, 0:W]
vig = 1 - 0.55 * np.clip(((xx - W / 2) / (W / 1.3)) ** 2 + ((yy - H / 2) / (H / 1.25)) ** 2, 0, 1)
vig = vig[..., None].astype(np.float32)
rng = np.random.default_rng(7)
GRAIN = [rng.normal(0, 7, (H // 2, W // 2, 1)).astype(np.float32).repeat(2, 0).repeat(2, 1) for _ in range(6)]

# ---------- text helpers ----------
def outlined(d, xy, text, f, fill, stroke=8, anchor="mm"):
    d.text(xy, text, font=f, fill=fill, stroke_width=stroke, stroke_fill=(0, 0, 0), anchor=anchor)

def stamp_img(text, color):
    f = font(118)
    tmp = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    tw = int(tmp.textlength(text, font=f))
    im = Image.new("RGBA", (tw + 100, 215), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((10, 10, im.width - 10, im.height - 10), 26, outline=color, width=16, fill=(0, 0, 0, 120))
    d.text((im.width / 2, im.height / 2), text, font=f, fill=color, anchor="mm")
    return im.rotate(8, expand=True, resample=Image.BICUBIC)
STAMPS = {"CAUGHT": stamp_img("CAUGHT", (235, 40, 40, 255)), "SURVIVED": stamp_img("SURVIVED", (40, 220, 90, 255))}

# caption chunks: max 3 words, global times
chunks = []
for s in segs:
    ws = words[s["line"]]
    for i in range(0, len(ws), 3):
        grp = ws[i:i + 3]
        chunks.append(dict(t0=s["t0"] + grp[0][1], t1=s["t0"] + (ws[i + 3][1] if i + 3 < len(ws) else grp[-1][2] + 0.25),
                           words=[(w[0].upper().replace("TWO-SEVENTEEN", "217").replace("TWO-SEVENTEEN.", "217"), s["t0"] + w[1], s["t0"] + w[2]) for w in grp]))
CAP_F = font(92)

def draw_caption(d, t, y):
    for c in chunks:
        if c["t0"] <= t < c["t1"]:
            parts = [w[0] for w in c["words"]]
            f = CAP_F
            for size in (92, 84, 76, 68, 60):
                f = font(size); widths = [d.textlength(p, font=f) for p in parts]
                sp = 24; total = sum(widths) + sp * (len(parts) - 1)
                if total <= W - 140: break
            x = (W - total) / 2
            for (txt, a, b), wd in zip(c["words"], widths):
                col = (255, 214, 0) if a <= t < max(b, a + 0.12) else (255, 255, 255)
                outlined(d, (x, y), txt, f, col, stroke=9, anchor="lm")
                x += wd + sp
            return

def ease(x): return 1 - (1 - min(max(x, 0), 1)) ** 3

# ---------- frame ----------
def frame(t):
    s = next(sg for sg in segs if sg["t0"] <= t < sg["t1"]) if t < TOTAL else segs[-1]
    lt, dur = t - s["t0"], s["t1"] - s["t0"]
    k = 0
    if len(s["imgs"]) > 1:
        k = 0 if lt < dur * 0.45 else 1
    name = s["imgs"][k]
    im = src[name]
    p = lt / dur
    if s["key"] == "pick":  # freeze, slow pulse
        z = 1.0 + 0.015 * math.sin(lt * 6)
    elif s["key"] == "grid":
        z = 1.0 + 0.04 * p
    else:
        z = 1.0 + 0.09 * p if (hash(s["key"]) % 2) else 1.09 - 0.09 * p
    # visible window: at z=1 show W x H out of the ZOOM-enlarged source (room to pan/shake)
    cw, ch = W / z, H / z
    pan = 0.5 + (0.08 * (p - 0.5) if s["key"] not in ("grid", "pick") else 0)
    shake = (0, 0)
    if name == "alarm":
        shake = (math.sin(t * 47) * 10, math.cos(t * 39) * 10)
    x0 = (im.width - cw) * pan + shake[0]; y0 = (im.height - ch) * 0.5 + shake[1]
    x0 = min(max(x0, 0), im.width - cw); y0 = min(max(y0, 0), im.height - ch)
    fr = im.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((W, H), Image.BILINEAR)

    if s["key"] == "pick":
        fr = ImageEnhance.Brightness(fr).enhance(0.55)
    if s["key"] in ("r1", "r2", "r3") and t > s["sp_end"]:
        fr = ImageEnhance.Color(fr).enhance(0.25)
    if s["key"] == "end":  # match frame 1 for loop: crossfade into grid
        g = src["GRID"].crop(((src["GRID"].width - W) // 2, (src["GRID"].height - H) // 2,
                              (src["GRID"].width + W) // 2, (src["GRID"].height + H) // 2))
        a = ease((lt - (dur - 0.7)) / 0.7)
        if a > 0: fr = Image.blend(fr, g, a)

    arr = np.asarray(fr).astype(np.float32) * vig + GRAIN[int(t * FPS) % 6]
    # white flash on stamp and on cuts
    flash = 0
    if lt < 0.07 and s["key"] not in ("pick",): flash = 0.35 * (1 - lt / 0.07)
    if s["stamp"] and 0 <= t - s["sp_end"] < 0.08: flash = 0.6
    if flash: arr = arr + (255 - arr) * flash
    fr = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).convert("RGBA")
    d = ImageDraw.Draw(fr)

    # overlays
    if s["ov"] == "hook":
        a = ease(lt / 0.25)
        d.rounded_rectangle((90, 860, W - 90, 1060), 30, fill=(0, 0, 0, int(200 * a)))
        outlined(d, (W / 2, 960), "ONLY ONE SURVIVES", font(88), (255, 214, 0), stroke=6)
    if s["ov"] == "pick":
        outlined(d, (W / 2, 820), "PICK ONE", font(170), (255, 255, 255), stroke=10)
        rem = max(0, 1 - lt / dur)
        d.rounded_rectangle((190, 960, W - 190, 1000), 20, fill=(255, 255, 255, 90))
        d.rounded_rectangle((190, 960, 190 + (W - 380) * rem, 1000), 20, fill=(255, 214, 0, 255))
    if s["ov"] == "217":
        a = ease((lt - 1.0) / 0.4)
        if a > 0:
            outlined(d, (W / 2, 520), "217 ?", font(int(200 * (0.8 + 0.2 * a))), (120, 255, 170), stroke=10)
    if s["ov"] == "comment" and lt > 0.15:
        sc = 1 + 0.04 * math.sin(lt * 10)
        f = font(int(66 * sc))
        d.rounded_rectangle((70, 700, W - 70, 900), 36, fill=(255, 214, 0, 240))
        d.text((W / 2, 800), "COMMENT YOUR NUMBER", font=f, fill=(0, 0, 0), anchor="mm")
        ax, ay = W / 2, 950 + 18 * abs(math.sin(lt * 6))
        d.polygon([(ax - 50, ay), (ax + 50, ay), (ax, ay + 60)], fill=(255, 214, 0), outline=(0, 0, 0), width=5)

    if s["badge"]:
        b = BADGES[s["badge"]]
        sc = 0.6 + 0.4 * ease(lt / 0.2) if s["key"].startswith("o") else 1
        bb = b.resize((int(b.width * sc), int(b.height * sc)), Image.BICUBIC)
        fr.alpha_composite(bb, (70 + (b.width - bb.width) // 2, 230 + (b.height - bb.height) // 2))

    if s["stamp"] and t >= s["sp_end"]:
        st = STAMPS[s["stamp"]]
        q = ease((t - s["sp_end"]) / 0.18)
        sc = 1.8 - 0.8 * q
        sm = st.resize((int(st.width * sc), int(st.height * sc)), Image.BICUBIC)
        fr.alpha_composite(sm, ((W - sm.width) // 2, 1450 - sm.height // 2))

    cap_y = 1180 if s["ov"] not in ("pick",) else 1140
    if s["ov"] not in ("comment",) or lt < 0.15:
        draw_caption(d, t, cap_y)
    return fr.convert("RGB")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "still":
        for tt in map(float, sys.argv[2:]):
            frame(tt).save(f"{OUT}/still_{tt:05.2f}.jpg", quality=88)
        sys.exit()
    json.dump([{k: v for k, v in s.items()} for s in segs], open(f"{OUT}/timeline.json", "w"), indent=1)
    n = int(TOTAL * FPS)
    p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                          "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium",
                          "-crf", "18", "-pix_fmt", "yuv420p", f"{OUT}/video_noaudio.mp4"], stdin=subprocess.PIPE)
    for i in range(n):
        p.stdin.write(frame(i / FPS).tobytes())
        if i % 150 == 0: print(f"frame {i}/{n}", file=sys.stderr)
    p.stdin.close(); p.wait()
    print("done", file=sys.stderr)
