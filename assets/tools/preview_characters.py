"""Contact sheet of composed LPC characters.

Usage: python -I preview_characters.py <characters_dir> <out.png> [scale]
For each <name>_walk.png: the 4 standing directions (up, left, down, right) followed by
the 8 walk-cycle frames facing down, on a grass-green background, labelled.
"""
import os, sys
from PIL import Image, ImageDraw

F = 64


def main(src, out, scale=2):
    names = sorted(f[:-9] for f in os.listdir(src) if f.endswith("_walk.png"))
    cols = 4 + 8
    lab_h = 12
    W, H = cols * F, len(names) * (F + lab_h)
    sheet = Image.new("RGBA", (W, H), (96, 150, 84, 255))
    d = ImageDraw.Draw(sheet)
    for i, n in enumerate(names):
        walk = Image.open(os.path.join(src, n + "_walk.png")).convert("RGBA")
        y = i * (F + lab_h)
        extras = [a for a in ("idle", "sit") if os.path.exists(os.path.join(src, f"{n}_{a}.png"))]
        d.text((2, y), n + "   [" + ", ".join(["walk"] + extras) + "]", fill=(255, 255, 255, 255))
        for r in range(4):
            sheet.alpha_composite(walk.crop((0, r * F, F, r * F + F)), (r * F, y + lab_h))
        for c in range(1, 9):
            sheet.alpha_composite(walk.crop((c * F, 2 * F, c * F + F, 3 * F)), ((3 + c) * F, y + lab_h))
        d.line([(4 * F - 1, y + lab_h), (4 * F - 1, y + lab_h + F)], fill=(60, 100, 50, 255))
    sheet = sheet.resize((W * scale, H * scale), Image.NEAREST)
    sheet.save(out)
    print("wrote", out, sheet.size)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 2)
