"""Find the eye position of every character frame facing the camera -> ../characters/faces.js

Used by js/sprites.js to paint facial expressions (the LPC art has none).
Per frame we store [cx, y0, skin] = centre x between the eye whites, the first row of
the eye whites, and the skin colour at the cheek; 0 when no face is found.
Run:  python -E -P lpc_faces.py
"""
import os, json
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
CH = os.path.join(HERE, "..", "characters")
COLS = {"walk": 9, "idle": 2, "cast": 7, "sit": 3}


def find(fr):
    px = fr.load()
    whites = {}
    for y in range(14, 42):
        for x in range(20, 45):
            r, g, b, a = px[x, y]
            if a > 200 and r >= 232 and g >= 238 and b >= 238 and abs(r - b) < 14:
                whites.setdefault(y, []).append(x)
    for y in sorted(whites):
        xs = whites[y]
        L = [x for x in xs if x < 32]; R = [x for x in xs if x >= 32]
        if L and R and 7 <= (max(R) - min(L)) <= 13:
            cx = (min(L) + max(R)) // 2
            sk = px[cx, y + 2]
            if sk[3] < 200:
                return 0
            return [cx, y, "#%02x%02x%02x" % sk[:3]]
    return 0


out = {}
for f in sorted(os.listdir(CH)):
    if not f.endswith(".png"):
        continue
    name, _, anim = f[:-4].rpartition("_")
    if anim not in COLS:
        continue
    im = Image.open(os.path.join(CH, f)).convert("RGBA")
    out.setdefault(name, {})[anim] = [find(im.crop((c * 64, 128, c * 64 + 64, 192))) for c in range(COLS[anim])]
with open(os.path.join(CH, "faces.js"), "w") as fh:
    fh.write("window.FACES=" + json.dumps(out, separators=(",", ":")) + ";\n")
ok = sum(1 for v in out.values() for a in v.values() for e in a if e)
tot = sum(len(a) for v in out.values() for a in v.values())
print("faces found", ok, "/", tot)
bad = [n for n, v in out.items() if not any(v.get('walk', [0])[:1])]
print("no face on standing frame:", bad)
