"""Mock-up of a wedding venue built only from the downloaded/composed assets, to judge
scale and style consistency (64x32 iso tiles, LPC characters at 1x).

Usage: python -I preview_scene.py <out.png> [zoom=2]
Reads ../manifest.json.  Tile (i, j): diamond bbox top-left = (OX + (i-j)*32, OY + (i+j)*16).
"""
import json, os, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
M = json.load(open(os.path.join(ROOT, "manifest.json"), encoding="utf-8"))
HBF, HBT = M["environment_hawkbirdtree"]
KEN = M["props_kenney_pixelized"]["sprites"]
CH = M["characters_lpc"]["composed_characters"]
_cache = {}


def img(path):
    if path not in _cache:
        _cache[path] = Image.open(os.path.join(ROOT, path)).convert("RGBA")
    return _cache[path]


def crop(path, r):
    return img(path).crop((r[0], r[1], r[0] + r[2], r[1] + r[3]))


def hb(name):
    for group in ("sprites", "floors_64x32"):
        if name in HBF.get(group, {}):
            e = HBF[group][name]; return crop(HBF["path"], e["rect"]), e.get("anchor")
    for group in ("objects", "flat_tiles", "blocks_64x64"):
        if name in HBT.get(group, {}):
            e = HBT[group][name]; return crop(HBT["path"], e["rect"]), e.get("anchor")
    raise KeyError(name)


def ken(name):
    e = KEN[name]; return img(e["path"]), e["anchor"]


def char(name, row=2, col=0):
    sheet = img(CH[name]["walk"])
    return sheet.crop((col * 64, row * 64, col * 64 + 64, row * 64 + 64)), [32, 60]


W_T, H_T = 14, 12
OX, OY = W_T * 32 + 16, 120


def tpos(i, j):
    return OX + (i - j) * 32, OY + (i + j) * 16


def main(out, zoom=2):
    canvas = Image.new("RGBA", (W_T * 64 + 96, (W_T + H_T) * 16 + 220), (32, 36, 48, 255))
    room = lambda i, j: 2 <= i <= 9 and 2 <= j <= 7
    loo = lambda i, j: 10 <= i <= 12 and 2 <= j <= 4
    path_tiles = {(i, 9) for i in range(0, W_T)} | {(6, 8)}
    flowers = {(1, 10): "block_grass_flowers_red", (3, 10): "block_grass_flowers_purple", (12, 9): "block_grass_flowers_yellow",
               (0, 3): "block_grass_flowers_yellow", (13, 7): "block_grass_flowers_red"}
    # ground, back to front
    for s in range(W_T + H_T):
        for i in range(W_T):
            j = s - i
            if not 0 <= j < H_T:
                continue
            tx, ty = tpos(i, j)
            if room(i, j):
                t, _ = hb("floor_wood_planks_light")
            elif loo(i, j):
                t, _ = hb("floor_tiles_mint")
            elif (i, j) in path_tiles:
                t, _ = hb("block_dirt_path_grass_edges_a" if i % 2 else "block_dirt_path_grass_edges_b")
            elif (i, j) in flowers:
                t, _ = hb(flowers[(i, j)])
            else:
                t, _ = hb(["block_grass_plain_e", "block_grass_plain", "block_grass_speckled"][(i * 7 + j * 3) % 3])
            canvas.alpha_composite(t, (tx, ty))
    # back walls of the hall (+ toilets)
    wall = crop(HBF["path"], HBF["walls_64x64"]["wall_brick_teal"]["rect"])
    wall2 = crop(HBF["path"], HBF["walls_64x64"]["wall_brick_pink"]["rect"])
    for i in range(2, 13):
        tx, ty = tpos(i, 2)
        canvas.alpha_composite((wall2 if i >= 10 else wall).crop((32, 0, 64, 64)), (tx + 32, ty - 48))
    for j in range(2, 8):
        tx, ty = tpos(2, j)
        canvas.alpha_composite(wall.crop((0, 0, 32, 64)), (tx, ty - 48))
    for j in range(2, 5):  # wall between hall and toilets (NW edge of i=10)
        tx, ty = tpos(10, j)
        if j != 3:
            canvas.alpha_composite(wall2.crop((0, 0, 32, 64)), (tx, ty - 48))
    # objects + characters, depth sorted by (i + j)
    objs = []
    def put(i, j, spr, dx=0, dy=0):
        im, anc = spr
        objs.append((i + j, i, im, anc, dx, dy, (i, j)))
    for (i, j) in [(4, 4), (7, 4), (4, 6), (7, 6)]:
        put(i, j, hb(["table_round_cloth_peach", "table_round_cloth_lightblue", "table_round_cloth_lilac", "table_round_cloth_peach"][(i + j) % 4]))
        put(i, j - 1, hb("chair_wood_facing_SW"), 0, 6)
        put(i - 1, j, hb("chair_wood_facing_SE"), 6, 0)
    put(5, 2, hb("table_long_cloth_white")); put(6, 2, hb("table_long_cloth_white"))
    put(5, 2, hb("vase_flowers"), 0, -10)
    put(3, 2, hb("potted_tree")); put(9, 2, hb("potted_tree"))
    put(8, 2, ken("speaker_SW")); put(9, 3, ken("speaker_SW"))
    put(2, 6, ken("kitchenBar_SE"), 4, 0); put(2, 7, ken("kitchenBar_SE"), 4, 0)
    put(3, 6, ken("stoolBar_SE")); put(3, 7, ken("stoolBar_SE"))
    put(11, 2, ken("toilet_SW")); put(12, 2, ken("toilet_SW")); put(12, 4, ken("bathroomSink_SW"))
    put(10, 4, ken("trashcan_SE"))
    put(0, 1, hb("tree_round_green")); put(13, 1, hb("tree_round_autumn")); put(0, 6, hb("bush_green"))
    put(12, 7, hb("tree_round_teal")); put(1, 11, hb("bush_green")); put(9, 11, hb("tree_round_green"))
    put(10, 9, hb("lantern")); put(4, 9, hb("lantern"))
    put(6, 2, char("groom", 2), 0, -2); put(5, 3, char("bride", 2), 0, 0)
    put(4, 5, char("grandpa", 1)); put(7, 5, char("grandma", 3)); put(8, 6, char("guest_woman_red", 2))
    put(6, 5, char("waiter", 3, 3)); put(3, 7, char("bartender", 3)); put(8, 3, char("dj", 2))
    put(6, 8, char("bouncer", 2)); put(5, 10, char("kid_boy", 1, 4)); put(3, 11, char("kid_girl", 3, 2))
    put(11, 3, char("cleaner", 1)); put(9, 5, char("guest_man_navy", 1, 2)); put(5, 7, char("guest_woman_blue", 0, 5))
    objs.sort(key=lambda o: (o[0], o[1]))
    for _, _, im, anc, dx, dy, (i, j) in objs:
        tx, ty = tpos(i, j)
        cx, cy = tx + 32, ty + 16
        canvas.alpha_composite(im, (cx - anc[0] + dx, cy - anc[1] + dy))
    canvas = canvas.resize((canvas.width * zoom, canvas.height * zoom), Image.NEAREST)
    canvas.save(out)
    print("wrote", out, canvas.size)


if __name__ == "__main__":
    main(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 2)
