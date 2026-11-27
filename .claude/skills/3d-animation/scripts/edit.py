#!/usr/bin/env python3
"""Apply punch zoom-ins and screen shakes to a video.

Usage: python3 edit.py --in concat.mp4 --map edit_map.json --out edited.mp4
       python3 edit.py --map edit_map.json --print-vf   # emit -vf only
edit_map.json: {"punches":[{"t":5.9,"dur":0.45}...],"shakes":[{"t":10.0,"dur":0.3}...]}
Video-only transform; audio stream is copied through untouched. --print-vf mode
prints the filter expression so it can be folded into a single combined ffmpeg
pass (see scripts/assemble.sh).
"""
import argparse, json, subprocess, sys

PUNCH_AMT = 0.08   # max extra zoom
SHAKE_ZOOM = 0.025 # margin so jitter never shows edges
SHAKE_PX = 12      # jitter amplitude in px (at 1080 wide)

def expr_zoom(punches, shakes):
    terms = ["1"]
    for p in punches:
        t0, d = p["t"], p.get("dur", 0.45)
        # ease out: fast in (40% of dur), ease back (60%)
        up, down = t0 + 0.4 * d, t0 + d
        terms.append(
            f"if(between(t,{t0:.3f},{up:.3f}),{PUNCH_AMT}*(t-{t0:.3f})/{0.4*d:.3f},0)"
            f"+if(between(t,{up:.3f},{down:.3f}),{PUNCH_AMT}*(1-(t-{up:.3f})/{0.6*d:.3f}),0)")
    for s in shakes:
        t0, d = s["t"], s.get("dur", 0.3)
        terms.append(f"if(between(t,{t0:.3f},{t0+d:.3f}),{SHAKE_ZOOM},0)")
    return "(" + "+".join(terms) + ")"

def expr_jitter(shakes, freq):
    terms = ["0"]
    for s in shakes:
        t0, d = s["t"], s.get("dur", 0.3)
        terms.append(f"if(between(t,{t0:.3f},{t0+d:.3f}),{SHAKE_PX}*sin(t*{freq}),0)")
    return "(" + "+".join(terms) + ")"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp")
    ap.add_argument("--map", dest="mp", required=True)
    ap.add_argument("--out", dest="out")
    ap.add_argument("--w", type=int, default=1080)
    ap.add_argument("--h", type=int, default=1920)
    ap.add_argument("--print-vf", action="store_true")
    a = ap.parse_args()
    m = json.load(open(a.mp))
    z = expr_zoom(m.get("punches", []), m.get("shakes", []))
    jx = expr_jitter(m.get("shakes", []), 137.7)
    jy = expr_jitter(m.get("shakes", []), 251.3)
    vf = (
        f"scale=w='trunc(iw*{z}/2)*2':h='trunc(ih*{z}/2)*2':eval=frame,"
        f"crop={a.w}:{a.h}:"
        f"x='(in_w-{a.w})/2+{jx}':y='(in_h-{a.h})/2+{jy}'"
    )
    if a.print_vf:
        print(vf)
        return
    if not a.inp or not a.out:
        ap.error("--in and --out are required unless --print-vf is set")
    cmd = ["ffmpeg", "-y", "-i", a.inp, "-vf", vf,
           "-c:v", "libx264", "-preset", "medium", "-crf", "18",
           "-pix_fmt", "yuv420p", "-c:a", "copy", a.out]
    print(" ".join(cmd), file=sys.stderr)
    sys.exit(subprocess.call(cmd))

if __name__ == "__main__":
    main()
