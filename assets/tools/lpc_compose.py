"""Compose layered Universal-LPC sprites into ready-to-use character spritesheets.

Usage (run from anywhere):
    python -E -P lpc_compose.py <characters.json> [--only name1,name2] [--report report.json]

Inputs (all paths relative to this script's folder unless absolute):
    lpc_layers.json            layer catalog (z-order, material, paths per body type, per-anim substitutes)
    lpc_palettes_custom.json   extra colour ramps merged over the ULPC palettes
    ../vendor/lpc-characters/  downloaded layers + palette_definitions (see lpc_fetch.py)

characters.json format:
    {"out_dir": "../characters",
     "characters": [
        {"name": "groom", "body": "male", "skin": "light", "eyes": "green",
         "layers": [["shadow"], ["body"], ["shoes", "black"], ["pants_formal", "suit_green"],
                    ["head_male"], ["hair_parted", "ginger"], ...]}]}
    - body: male | female | child | muscular
    - child_shoes (children only, optional): cloth colour painted on the bare LPC child feet
    - skin: a body palette name (light, amber, olive, taupe, bronze, brown, black, + custom ramps)
    - each layer: [key] or [key, colour] or [key, colour, {"omit": ["sit", ...]}]
      colour = palette name for the layer's material (cloth / hair / body).  Body-material layers
      (body, heads, wrinkles) use the character's "skin" unless a colour is given explicitly
      (e.g. a ruddier head).

Output per character (frames are 64x64; rows 0=up/north, 1=left/west, 2=down/south, 3=right/east):
    <name>_walk.png  576x256 (9x4)  col 0 = standing, cols 1-8 = walk cycle
    <name>_idle.png  128x256 (2x4)  breathing idle; if any layer lacks idle art, walk col 0 is repeated
    <name>_cast.png  448x256 (7x4)  LPC "spellcast" (arms raised) - dancing / cheering
    <name>_hurt.png  384x64  (6x1)  LPC "hurt" (falls to the ground; last frame = lying)
    <name>_sit.png   192x256 (3x4)  when every layer has sit art (after substitutes, see below)

Fallbacks for layers that lack an animation (catalog key "subst": {"<anim>": [keys] | []}):
    - the layer is replaced, for that animation only, by the listed catalog items drawn in the
      same colour and at the original layer's z (e.g. jacket -> plain long-sleeve top for "sit");
      an empty list means the layer is simply left out for that animation.
    - per-character {"omit": [...]} drops a layer for the listed animations.
    - cast/hurt that still cannot be built from real art (children: the LPC child clothes only
      have walk art, and the child body has no spellcast) are synthesised from the composed walk
      sheet: cast = a cheering hop in place, hurt = crumple + fall over (rotated) to lying.
    - idle that cannot be built -> static (walk col 0); sit that cannot be built -> not written.
"""
import json, os, sys
from array import array
from PIL import Image, ImageChops, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
VENDOR = os.path.join(HERE, "..", "vendor", "lpc-characters")
SHEETS = os.path.join(VENDOR, "spritesheets")
MATERIAL_BASE = {"body": "light", "hair": "orange", "cloth": "white", "eye": "blue"}
PALETTE_FILES = {"body": "body/body_ulpc.json", "hair": "hair/hair_ulpc.json",
                 "cloth": "cloth/cloth_ulpc.json", "eye": "eye/eye_ulpc.json"}
# out name -> (LPC anim name, cols, rows)
ANIMS = {"walk": ("walk", 9, 4), "idle": ("idle", 2, 4), "cast": ("spellcast", 7, 4),
         "hurt": ("hurt", 6, 1), "sit": ("sit", 3, 4)}
FRAME = 64
FEET_Y = 60  # feet point inside a frame (shadow centre ~58)


def hex2rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def load_palettes():
    pals = {}
    for mat, rel in PALETTE_FILES.items():
        p = os.path.join(VENDOR, "palette_definitions", rel)
        pals[mat] = json.load(open(p, encoding="utf-8")) if os.path.exists(p) else {}
    custom = json.load(open(os.path.join(HERE, "lpc_palettes_custom.json"), encoding="utf-8"))
    for mat, ramps in custom.items():
        if mat.startswith("_"):
            continue
        pals.setdefault(mat, {}).update(ramps)
    return pals


def build_map(pals, material, target, source_map=None):
    """Source colour -> target colour mapping for one material (exact match +-2 tolerance).
    source_map: optional {"#rrggbb": index_into_target_ramp} for layers whose art is not
    drawn in the material's base palette (e.g. ULPC legs/formal/male, the child clothes)."""
    if target is None:
        return {}
    src = pals[material].get(MATERIAL_BASE[material])
    dst = pals[material].get(target)
    if dst is None:
        raise SystemExit(f"unknown {material} colour '{target}'. Known: {sorted(pals[material])}")
    pairs = list(zip(src, dst))
    for hx, idx in (source_map or {}).items():
        pairs.append((hx, dst[idx]))
    m = {}
    for s, d in pairs:
        s, d = hex2rgb(s), hex2rgb(d)
        for dr in (-2, -1, 0, 1, 2):
            for dg in (-2, -1, 0, 1, 2):
                for db in (-2, -1, 0, 1, 2):
                    m.setdefault((s[0] + dr, s[1] + dg, s[2] + db), d)
    return m


def recolor(img, cmap):
    """Fast recolour: map each distinct RGBA value once, then translate the pixel array."""
    if not cmap:
        return img
    colors = img.getcolors(1 << 20) or []
    lut = {}
    for _, (r, g, b, a) in colors:
        if a and (r, g, b) in cmap:
            nr, ng, nb = cmap[(r, g, b)]
            src = array("I", bytes((r, g, b, a)))[0]
            lut[src] = array("I", bytes((nr, ng, nb, a)))[0]
    if not lut:
        return img
    px = array("I")
    px.frombytes(img.tobytes())
    get = lut.get
    out = array("I", [get(v, v) for v in px])
    return Image.frombytes("RGBA", img.size, out.tobytes())


def layer_file(path, anim, variant):
    p = os.path.join(SHEETS, path, anim + ".png")
    if os.path.exists(p):
        return p
    p = os.path.join(SHEETS, path, anim, (variant or "white") + ".png")
    return p if os.path.exists(p) else None


def item_parts(key, item, body, char_name):
    subs = item.get("layers") or [{"z": item["z"], "paths": item["paths"]}]
    out = []
    for sub in subs:
        path = sub["paths"].get(body) or sub["paths"].get("*")
        if not path:
            raise SystemExit(f"{char_name}: layer '{key}' has no art for body type '{body}'")
        out.append((sub["z"], path))
    return out


def resolve_layers(char, catalog):
    body = char["body"]
    parts = []
    for order, spec in enumerate(char["layers"]):
        key = spec[0]
        colour = spec[1] if len(spec) > 1 else None
        opts = spec[2] if len(spec) > 2 else {}
        item = catalog[key]
        mat = item.get("material")
        if mat == "body" and colour is None:
            colour = char.get("skin", "light")
        for z, path in item_parts(key, item, body, char["name"]):
            parts.append({"key": key, "z": z, "order": order, "path": path, "variant": item.get("variant"),
                          "material": mat, "colour": colour, "extra": item.get("materials", []),
                          "source_map": item.get("source_map"), "subst": item.get("subst", {}),
                          "omit": set(opts.get("omit", []))})
    parts.sort(key=lambda p: (p["z"], p["order"]))
    return parts


_cache = {}


def load_layer(pals, char, part, lpc_anim):
    f = layer_file(part["path"], lpc_anim, part["variant"])
    if f is None:
        return None
    shoes = char.get("child_shoes") if part["key"] == "body" and char["body"] == "child" else None
    ck = (f, part["material"], part["colour"], tuple(part["extra"]), char.get("eyes"), json.dumps(part["source_map"]), shoes)
    if ck not in _cache:
        img = Image.open(f).convert("RGBA")
        if part["material"]:
            img = recolor(img, build_map(pals, part["material"], part["colour"], part["source_map"]))
        for m in part["extra"]:  # e.g. eye colour on heads
            img = recolor(img, build_map(pals, m, char.get("eyes")))
        if shoes:
            img = paint_child_shoes(img, pals, part["colour"], shoes)
        _cache[ck] = img
    return _cache[ck]


def paint_child_shoes(img, pals, skin, shoe_colour, top=57):
    """The LPC child base has no footwear layer: recolour the skin of the feet (frame rows >= top,
    below the child trousers/skirt hem) with a cloth ramp so children are not barefoot."""
    src, dst = pals["body"][skin], pals["cloth"][shoe_colour]
    m = {hex2rgb(s): hex2rgb(d) for s, d in zip(src, dst)}
    for y0 in range(0, img.height, FRAME):
        box = (0, y0 + top, img.width, y0 + FRAME)
        img.paste(recolor(img.crop(box), {k: v for k, v in m.items()}), box[:2])
    return img


def save_png(img, path):
    """Save losslessly as an 8-bit palette PNG (with per-index alpha) when the sheet has <= 256
    distinct RGBA values (it always does for LPC art) - about 2.5x smaller than RGBA."""
    cols = img.getcolors(256)
    if cols is None:
        img.save(path, optimize=True)
        return
    pal = [c for _, c in cols]
    idx = {c: i for i, c in enumerate(pal)}
    p = Image.new("P", img.size)
    p.putdata([idx[c] for c in img.getdata()])
    p.putpalette([v for c in pal for v in c[:3]])
    p.save(path, optimize=True, transparency=bytes(c[3] for c in pal))


def despeckle(img):
    """Remove isolated single opaque pixels (stray dots in some upstream sheets)."""
    a = img.getchannel("A").point(lambda v: 255 if v else 0)
    k = ImageFilter.Kernel((3, 3), [1, 1, 1, 1, 0, 1, 1, 1, 1], scale=1)
    nb = a.filter(k)  # >0 where any neighbour is opaque
    lonely = ImageChops.multiply(a, nb.point(lambda v: 0 if v else 255))
    if lonely.getbbox():
        img = img.copy()
        img.putalpha(ImageChops.subtract(img.getchannel("A"), lonely))
    return img


def expand_for_anim(char, parts, catalog, out_anim, notes):
    """Apply omit / subst rules for one animation. Returns the list of parts to draw."""
    lpc_anim = ANIMS[out_anim][0]
    res = []
    for p in parts:
        if out_anim in p["omit"]:
            notes.append(f"{out_anim}: omit {p['key']}")
            continue
        if layer_file(p["path"], lpc_anim, p["variant"]) is not None or out_anim not in p["subst"]:
            res.append(p)
            continue
        repl = p["subst"][out_anim]
        notes.append(f"{out_anim}: {p['key']} -> " + ("(left out)" if not repl else "+".join(repl)))
        for i, rk in enumerate(repl):
            it = catalog[rk]
            for z, path in item_parts(rk, it, char["body"], char["name"]):
                q = dict(p)
                q.update({"key": rk, "z": p["z"] + i * 0.01, "path": path, "variant": it.get("variant"),
                          "material": it.get("material"), "source_map": it.get("source_map"), "subst": {}})
                res.append(q)
    res.sort(key=lambda p: (p["z"], p["order"]))
    return res


def compose_anim(char, parts, pals, out_anim, from_walk=False):
    lpc_anim, cols, rows = ANIMS[out_anim]
    canvas = Image.new("RGBA", (cols * FRAME, rows * FRAME))
    for p in parts:
        img = load_layer(pals, char, p, "walk" if from_walk else lpc_anim)
        if img is None:
            return None, p["key"]
        if from_walk:  # static idle: repeat walk column 0
            frame_col = img.crop((0, 0, FRAME, rows * FRAME))
            img = Image.new("RGBA", canvas.size)
            for c in range(cols):
                img.paste(frame_col, (c * FRAME, 0))
        canvas.alpha_composite(img.crop((0, 0, canvas.width, canvas.height)))
    return canvas, None


# ----------------------------------------------------------------------------- synthesised anims
def _walk_split(char, parts, pals):
    """Composed walk sheet without the shadow, and the shadow sheet alone."""
    shadow = [p for p in parts if p["key"] == "shadow"]
    rest = [p for p in parts if p["key"] != "shadow"]
    body, _ = compose_anim(char, rest, pals, "walk")
    sh, _ = compose_anim(char, shadow, pals, "walk") if shadow else (Image.new("RGBA", (9 * FRAME, 4 * FRAME)), None)
    return body, sh


def _frame(sheet, col, row):
    return sheet.crop((col * FRAME, row * FRAME, col * FRAME + FRAME, row * FRAME + FRAME))


def synth_cast(char, parts, pals):
    """Cheering hop in place: (walk column, lift in px) per frame, shadow stays on the ground."""
    body, sh = _walk_split(char, parts, pals)
    seq = [(0, 0), (0, 2), (2, 4), (0, 5), (6, 4), (0, 2), (0, 0)]
    out = Image.new("RGBA", (7 * FRAME, 4 * FRAME))
    for r in range(4):
        for i, (c, lift) in enumerate(seq):
            out.alpha_composite(_frame(sh, 0, r), (i * FRAME, r * FRAME))
            fr = _frame(body, c, r)
            cell = Image.new("RGBA", (FRAME, FRAME))
            cell.alpha_composite(fr, (0, -lift))
            out.alpha_composite(cell, (i * FRAME, r * FRAME))
    return out


def _place(img, cx, bottom):
    """Paste img's opaque bbox into a 64x64 cell so its centre x = cx and bottom y = bottom."""
    bb = img.getbbox()
    cell = Image.new("RGBA", (FRAME, FRAME))
    if not bb:
        return cell
    piece = img.crop(bb)
    x = int(round(cx - piece.width / 2))
    y = bottom - piece.height
    cell.alpha_composite(piece, (max(0, min(FRAME - piece.width, x)), max(0, y)) if piece.width <= FRAME else (0, max(0, y)))
    return cell


def synth_hurt(char, parts, pals):
    """Facing the camera: stand, sag, crouch, topple (45 deg), lying (90 deg) x2."""
    body, sh = _walk_split(char, parts, pals)
    stand = _frame(body, 0, 2)
    shadow = _frame(sh, 0, 2)
    bb = stand.getbbox()
    piece = stand.crop(bb)
    frames = []
    for k in range(6):
        if k == 0:
            f = stand
        elif k in (1, 2):
            s = 0.9 if k == 1 else 0.78
            sq = piece.resize((piece.width + (0 if k == 1 else 2), max(1, int(piece.height * s))), Image.NEAREST)
            f = _place(sq, 32, bb[3])
        elif k == 3:
            rot = piece.rotate(50, resample=Image.NEAREST, expand=True)
            f = _place(rot, 30, FEET_Y + 1)
        else:
            rot = piece.rotate(90, resample=Image.NEAREST, expand=True)
            f = _place(rot, 32, FEET_Y + 2)
        frames.append(f)
    out = Image.new("RGBA", (6 * FRAME, FRAME))
    wide = shadow.resize((int(FRAME * 1.5), FRAME), Image.NEAREST).crop((16, 0, 16 + FRAME, FRAME))
    for i, f in enumerate(frames):
        out.alpha_composite(shadow if i < 3 else wide, (i * FRAME, 0))
        out.alpha_composite(f, (i * FRAME, 0))
    return out


def compose_character(char, catalog, pals, out_dir):
    parts = resolve_layers(char, catalog)
    notes, produced = [], {}
    for anim in ("walk", "idle", "cast", "hurt", "sit"):
        anim_notes = []
        aparts = expand_for_anim(char, parts, catalog, anim, anim_notes) if anim != "walk" else parts
        img, missing = compose_anim(char, aparts, pals, anim)
        if img is not None:
            notes += anim_notes
        elif anim == "idle":
            img, _ = compose_anim(char, parts, pals, anim, from_walk=True)
            notes.append(f"idle: static (no idle art for '{missing}')")
        elif anim == "cast":
            img = synth_cast(char, parts, pals)
            notes.append(f"cast: synthesised hop (no spellcast art for '{missing}')")
        elif anim == "hurt":
            img = synth_hurt(char, parts, pals)
            notes.append(f"hurt: synthesised fall (no hurt art for '{missing}')")
        else:
            notes.append(f"no {anim} (no art for '{missing}')")
            continue
        fn = f"{char['name']}_{anim}.png"
        save_png(despeckle(img), os.path.join(out_dir, fn))
        produced[anim] = fn
    return produced, notes


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__); return
    chars_path = args[0]
    only = None
    if "--only" in args:
        only = set(args[args.index("--only") + 1].split(","))
    report_path = args[args.index("--report") + 1] if "--report" in args else None
    cfg = json.load(open(chars_path, encoding="utf-8"))
    catalog = json.load(open(os.path.join(HERE, "lpc_layers.json"), encoding="utf-8"))
    pals = load_palettes()
    out_dir = cfg.get("out_dir", "../characters")
    if not os.path.isabs(out_dir):
        out_dir = os.path.join(os.path.dirname(os.path.abspath(chars_path)), out_dir)
    os.makedirs(out_dir, exist_ok=True)
    report = {}
    for char in cfg["characters"]:
        if only and char["name"] not in only:
            continue
        produced, notes = compose_character(char, catalog, pals, out_dir)
        report[char["name"]] = {"files": produced, "notes": notes}
        print(f"{char['name']}: {','.join(produced)}" + (" | " + "; ".join(notes) if notes else ""))
    if report_path:
        json.dump(report, open(report_path, "w", encoding="utf-8"), indent=1)


if __name__ == "__main__":
    main()
