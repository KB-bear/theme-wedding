"""Named contact sheets of the manifest's environment sprites + a close-up of the main couple.

Usage: python -I preview_manifest.py <previews_dir>
Writes env_hawkbird_furniture_named.png, env_hawkbird_terrain_named.png, characters_groom_bride_4x.png
"""
import json, os, sys
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
M = json.load(open(os.path.join(ROOT, "manifest.json"), encoding="utf-8"))


def sheet(items, out, scale=2, cols=8, bg=(88, 136, 80, 255)):
    cw = max(i.width for _, i in items) * scale + 10
    cw = max(cw, 150)
    ch = max(i.height for _, i in items) * scale + 22
    rows = (len(items) + cols - 1) // cols
    s = Image.new("RGBA", (cols * cw, rows * ch), bg)
    d = ImageDraw.Draw(s)
    for k, (name, im) in enumerate(items):
        x, y = (k % cols) * cw, (k // cols) * ch
        big = im.resize((im.width * scale, im.height * scale), Image.NEAREST)
        s.alpha_composite(big, (x + (cw - big.width) // 2, y + ch - 16 - big.height))
        d.text((x + 3, y + ch - 14), name[:26], fill=(255, 255, 255, 255))
    s.save(out)
    print("wrote", out, s.size)


def main(outdir):
    hbf, hbt = M["environment_hawkbirdtree"]
    src = Image.open(os.path.join(ROOT, hbf["path"])).convert("RGBA")
    cut = lambda im, r: im.crop((r[0], r[1], r[0] + r[2], r[1] + r[3]))
    items = [(n, cut(src, e["rect"])) for n, e in hbf["sprites"].items() if "note" not in e]
    items += [(n, cut(src, e["rect"])) for n, e in hbf["floors_64x32"].items()]
    items += [(n, cut(src, e["rect"])) for n, e in hbf["walls_64x64"].items()]
    sheet(items, os.path.join(outdir, "env_hawkbird_furniture_named.png"), 2, 8)
    src = Image.open(os.path.join(ROOT, hbt["path"])).convert("RGBA")
    items = [(n, cut(src, e["rect"])) for n, e in hbt["blocks_64x64"].items()]
    items += [(n, cut(src, e["rect"])) for n, e in hbt["flat_tiles"].items()]
    items += [(n, cut(src, e["rect"])) for n, e in hbt["objects"].items() if n != "stone_pillar_tall"]
    sheet(items, os.path.join(outdir, "env_hawkbird_terrain_named.png"), 2, 9)
    # couple close-up: all 4 standing directions + 2 walk frames, 4x
    ch = M["characters_lpc"]["composed_characters"]
    frames = []
    for n in ("groom", "bride", "bride_updo", "groom_frock"):
        w = Image.open(os.path.join(ROOT, ch[n]["walk"])).convert("RGBA")
        for r in range(4):
            frames.append((f"{n} r{r}", w.crop((0, r * 64, 64, r * 64 + 64))))
    sheet(frames, os.path.join(outdir, "characters_groom_bride_4x.png"), 4, 8, (110, 150, 100, 255))


if __name__ == "__main__":
    main(sys.argv[1])
