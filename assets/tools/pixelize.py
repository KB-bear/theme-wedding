"""Turn smooth pre-rendered isometric sprites (e.g. Kenney Furniture Kit renders) into
chunky outlined pixel art that sits next to hand-pixelled iso sprites.

Usage:
  python -I pixelize.py <in.png> <out.png> [scale=0.32] [colors=12] [saturation=1.25]
  python -I pixelize.py --batch <list.json>
     list.json: {"src_dir": "...", "out_dir": "...", "scale": 0.32, "colors": 12,
                 "items": ["toilet_SE", "speaker_SW", ...]}   (paths relative to the json)

Steps: box-downscale (premultiplied) -> hard alpha (>=50%) -> saturation/contrast boost ->
median-cut quantise -> 1px outline in a darkened version of the neighbouring colour.
Kenney floor tiles are ~208px wide, so scale 0.32 maps them onto 64x32 tiles (0.16 for 32x16).
"""
import json, os, sys
from PIL import Image, ImageEnhance


def pixelize(img, scale=0.32, colors=12, sat=1.25):
    img = img.convert("RGBA")
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    w, h = max(1, round(img.width * scale)), max(1, round(img.height * scale))
    small = img.resize((w, h), Image.BOX, reducing_gap=None)
    alpha = small.getchannel("A").point(lambda a: 255 if a >= 128 else 0)
    rgb = small.convert("RGB")
    rgb = ImageEnhance.Color(rgb).enhance(sat)
    rgb = ImageEnhance.Contrast(rgb).enhance(1.1)
    q = rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")
    out = Image.new("RGBA", (w + 2, h + 2))
    core = q.convert("RGBA"); core.putalpha(alpha)
    out.paste(core, (1, 1))
    px = out.load()
    W, H = out.size
    add = []
    for y in range(H):
        for x in range(W):
            if px[x, y][3]:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                xx, yy = x + dx, y + dy
                if 0 <= xx < W and 0 <= yy < H and px[xx, yy][3]:
                    r, g, b, _ = px[xx, yy]
                    add.append((x, y, (int(r * 0.35), int(g * 0.3), int(b * 0.35), 255)))
                    break
    for x, y, c in add:
        px[x, y] = c
    return out


def main():
    a = sys.argv[1:]
    if a and a[0] == "--batch":
        cfg_path = a[1]
        base = os.path.dirname(os.path.abspath(cfg_path))
        cfg = json.load(open(cfg_path, encoding="utf-8"))
        src = os.path.join(base, cfg["src_dir"]); dst = os.path.join(base, cfg["out_dir"])
        os.makedirs(dst, exist_ok=True)
        for it in cfg["items"]:
            name = it if isinstance(it, str) else it["name"]
            sc = cfg.get("scale", 0.32) if isinstance(it, str) else it.get("scale", cfg.get("scale", 0.32))
            im = pixelize(Image.open(os.path.join(src, name + ".png")), sc, cfg.get("colors", 12), cfg.get("saturation", 1.25))
            im.save(os.path.join(dst, name + ".png"))
        print(f"pixelized {len(cfg['items'])} sprites -> {dst}")
        return
    if len(a) < 2:
        print(__doc__); return
    im = pixelize(Image.open(a[0]), float(a[2]) if len(a) > 2 else 0.32,
                  int(a[3]) if len(a) > 3 else 12, float(a[4]) if len(a) > 4 else 1.25)
    im.save(a[1])


if __name__ == "__main__":
    main()
