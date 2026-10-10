"""Find individual sprites on a packed sheet (connected opaque regions) and write
a JSON list of rects plus a labelled preview so you can name them.

Usage: python -I slice_sprites.py <sheet.png> <out.json> <preview.png> [merge_gap=2] [min_px=12] [region=x,y,w,h]
(region limits the search to part of the sheet; rects stay in full-sheet coordinates)

Regions whose bounding boxes are within merge_gap px of each other are merged (keeps
small detached bits such as a vase's flowers with their sprite).  Rects are listed in
reading order (top-to-bottom, left-to-right) as {"id", "x", "y", "w", "h"}.
"""
import json, sys
from PIL import Image, ImageDraw


def components(alpha, w, h):
    seen = bytearray(w * h)
    data = alpha.tobytes()
    boxes = []
    for start in range(w * h):
        if seen[start] or not data[start]:
            continue
        stack = [start]; seen[start] = 1
        x0 = x1 = start % w; y0 = y1 = start // w; n = 0
        while stack:
            p = stack.pop(); n += 1
            x, y = p % w, p // w
            x0, x1, y0, y1 = min(x0, x), max(x1, x), min(y0, y), max(y1, y)
            for dy in (-1, 0, 1):
                yy = y + dy
                if yy < 0 or yy >= h:
                    continue
                for dx in (-1, 0, 1):
                    xx = x + dx
                    if 0 <= xx < w:
                        q = yy * w + xx
                        if not seen[q] and data[q]:
                            seen[q] = 1; stack.append(q)
        boxes.append([x0, y0, x1 + 1, y1 + 1, n])
    return boxes


def merge(boxes, gap):
    changed = True
    while changed:
        changed = False
        out = []
        while boxes:
            b = boxes.pop()
            i = 0
            while i < len(boxes):
                c = boxes[i]
                if b[0] - gap <= c[2] and c[0] - gap <= b[2] and b[1] - gap <= c[3] and c[1] - gap <= b[3]:
                    b = [min(b[0], c[0]), min(b[1], c[1]), max(b[2], c[2]), max(b[3], c[3]), b[4] + c[4]]
                    boxes.pop(i); changed = True
                else:
                    i += 1
            out.append(b)
        boxes = out
    return boxes


def main(sheet, out_json, preview, gap=2, min_px=12, region=None):
    im = Image.open(sheet).convert("RGBA")
    w, h = im.size
    rx, ry = 0, 0
    work = im
    if region:
        rx, ry, rw, rh = region
        work = im.crop((rx, ry, rx + rw, ry + rh))
    boxes = merge(components(work.getchannel("A"), work.width, work.height), gap)
    boxes = [[b[0] + rx, b[1] + ry, b[2] + rx, b[3] + ry, b[4]] for b in boxes]
    boxes = [b for b in boxes if b[4] >= min_px]
    boxes.sort(key=lambda b: (b[1] // 16, b[0]))
    rects = [{"id": i, "x": b[0], "y": b[1], "w": b[2] - b[0], "h": b[3] - b[1]} for i, b in enumerate(boxes)]
    json.dump({"sheet": sheet.replace("\\", "/").split("/assets/")[-1], "rects": rects}, open(out_json, "w"), indent=0)
    s = 2
    pv = Image.new("RGBA", (w * s, h * s), (70, 70, 80, 255))
    pv.alpha_composite(im.resize((w * s, h * s), Image.NEAREST))
    d = ImageDraw.Draw(pv)
    for r in rects:
        d.rectangle([r["x"] * s, r["y"] * s, (r["x"] + r["w"]) * s - 1, (r["y"] + r["h"]) * s - 1], outline=(255, 0, 255, 255))
        d.text((r["x"] * s + 2, r["y"] * s + 1), str(r["id"]), fill=(255, 255, 0, 255), stroke_width=2, stroke_fill=(0, 0, 0, 255))
    pv.save(preview)
    print(f"{len(rects)} sprites -> {out_json}, {preview}")


if __name__ == "__main__":
    a = sys.argv
    main(a[1], a[2], a[3], int(a[4]) if len(a) > 4 else 2, int(a[5]) if len(a) > 5 else 12,
         [int(v) for v in a[6].split(",")] if len(a) > 6 else None)
