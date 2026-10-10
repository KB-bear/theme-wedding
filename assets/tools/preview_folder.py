"""Contact sheet of every PNG in a folder (labelled), for eyeballing sprite sets.

Usage: python -I preview_folder.py <folder> <out.png> [scale=3] [cols=8] [bg=#5a8a50]
"""
import os, sys
from PIL import Image, ImageDraw


def main(folder, out, scale=3, cols=8, bg="#5a8a50"):
    files = sorted(f for f in os.listdir(folder) if f.lower().endswith(".png"))
    ims = [(f[:-4], Image.open(os.path.join(folder, f)).convert("RGBA")) for f in files]
    cw = max(i.width for _, i in ims) * scale + 8
    ch = max(i.height for _, i in ims) * scale + 20
    rows = (len(ims) + cols - 1) // cols
    sheet = Image.new("RGBA", (cols * cw, rows * ch), bg)
    d = ImageDraw.Draw(sheet)
    for k, (name, im) in enumerate(ims):
        x, y = (k % cols) * cw, (k // cols) * ch
        big = im.resize((im.width * scale, im.height * scale), Image.NEAREST)
        sheet.alpha_composite(big, (x + (cw - big.width) // 2, y + ch - 14 - big.height))
        d.text((x + 3, y + ch - 13), f"{name} {im.width}x{im.height}", fill=(255, 255, 255, 255))
    sheet.save(out)
    print("wrote", out, sheet.size)


if __name__ == "__main__":
    a = sys.argv
    main(a[1], a[2], int(a[3]) if len(a) > 3 else 3, int(a[4]) if len(a) > 4 else 8, a[5] if len(a) > 5 else "#5a8a50")
