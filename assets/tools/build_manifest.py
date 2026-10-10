"""Regenerate assets/manifest.json (sprite paths, rects, sizes, anchors, projections).

Usage: python -I build_manifest.py
Hand-named rects for the hawkbirdtree sheets live in this file; sizes of the LPC sheets,
composed characters and pixelized Kenney sprites are read from disk.
"""
import json, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))


def rel(p):
    return os.path.relpath(p, ROOT).replace(os.sep, "/")


def size(p):
    with Image.open(os.path.join(ROOT, p)) as im:
        return list(im.size)


def bbox(sheet, x, y, w, h):
    with Image.open(os.path.join(ROOT, sheet)) as im:
        b = im.convert("RGBA").crop((x, y, x + w, y + h)).getbbox()
    return [x + b[0], y + b[1], b[2] - b[0], b[3] - b[1]] if b else [x, y, w, h]


# --------------------------------------------------------------------------- hawkbirdtree furniture
HB_F = "vendor/hawkbirdtree-iso-furniture-walls/furnitureandwalls.png"
# name: [x, y, w, h]  (tight bounding boxes, found with slice_sprites.py)
HB_F_SPRITES = {
    "bed_teal": [4, 9, 57, 45], "bed_striped": [68, 15, 55, 39], "bookcases_pair": [128, 3, 64, 57],
    "counter_corner_L": [198, 12, 50, 42], "market_stall_awning": [261, 7, 54, 77],
    "canopy_blue": [6, 77, 53, 38], "canopy_purple": [69, 76, 53, 39],
    "banner_purple": [136, 64, 16, 60], "banner_red": [168, 64, 16, 60],
    "barrel_a": [194, 65, 27, 29], "barrel_b": [226, 65, 27, 29], "barrel_water": [194, 97, 27, 29],
    "coins": [233, 108, 14, 9], "book_blue": [267, 105, 9, 14], "open_book": [291, 105, 25, 14],
    "bucket": [7, 133, 18, 23], "small_box": [7, 169, 17, 14], "chest_of_drawers_low": [45, 143, 36, 33],
    "wardrobe": [110, 133, 34, 54], "dresser": [172, 139, 36, 41], "wardrobe_narrow": [228, 138, 23, 49],
    "glass_cabinet": [270, 133, 34, 54], "glass_cabinet_narrow": [4, 200, 23, 49],
    "chair_wood_facing_SW": [39, 193, 18, 30], "chair_wood_facing_SE": [72, 193, 17, 30],
    "grandfather_clock": [101, 200, 23, 48], "chest_purple": [131, 195, 26, 26], "bed_green": [164, 202, 57, 45],
    "cauldron": [229, 197, 21, 22], "lantern": [265, 196, 14, 23], "stool_orange": [294, 199, 18, 18],
    "chest_wood": [35, 227, 26, 26], "chest_red": [67, 227, 26, 26], "mantel_clock": [136, 231, 16, 19],
    "pot_water": [229, 227, 21, 26], "stool_red": [265, 231, 14, 18], "stool_wood": [297, 231, 14, 18],
    "bed_red": [3, 265, 57, 45],
    "table_square_cloth_cream": [69, 273, 51, 33], "table_round_cloth_peach": [132, 273, 51, 33],
    "table_round_wood": [198, 273, 51, 33], "table_round_cloth_lightblue": [262, 273, 51, 33],
    "table_round_cloth_lilac": [6, 337, 51, 33],
    "side_table": [129, 320, 30, 31], "stove_brick_chimney": [205, 325, 37, 51], "vase_blue": [264, 325, 17, 22],
    "vase_flowers": [295, 333, 20, 40], "bowl_blue": [263, 361, 18, 14], "sink_cabinet": [77, 338, 36, 33],
    "bench_low": [129, 358, 30, 20], "footstool": [163, 358, 26, 21],
    "table_long_wood": [4, 399, 56, 42], "table_long_runner": [66, 399, 56, 42],
    "table_long_cloth_peach": [129, 399, 57, 42], "table_long_cloth_white": [194, 399, 57, 42],
    "potted_tree": [256, 394, 32, 44], "curtains_blue_red": [294, 391, 20, 49],
    "brick_block": [108, 463, 37, 36], "hand_cart": [163, 460, 55, 37], "pennant_flag": [239, 458, 35, 44],
    "stone_well_small": [288, 463, 32, 33], "rug_draped_striped": [101, 526, 53, 39],
    "stone_block_a": [165, 515, 22, 27], "stone_block_b": [164, 546, 23, 28],
    "runner_rug_green_yellow": [193, 522, 93, 48], "runner_rug_pastel_stripes": [1, 584, 93, 48],
    "runner_rug_pink": [97, 584, 93, 48], "rug_red_ornate_long": [193, 585, 91, 47],
    "rug_red_ornate": [2, 649, 91, 47], "rug_lilac_ornate": [97, 648, 94, 49],
}
HB_F_MISC = {"misc_block_curtain_fireplace_well_crates": [6, 448, 90, 128]}
HB_F_FLOORS = {  # 64x32 diamonds, cell top-left
    "floor_wood_planks_light": [192, 640], "floor_wood_planks_dark": [192, 672],
    "floor_tiles_cream_gold": [192, 704], "floor_tiles_mint": [192, 736], "floor_tiles_lilac": [192, 768],
    "grass_lime": [256, 640], "grass_green": [256, 672], "sand_yellow": [256, 704], "dirt_orange": [256, 736],
    "water_light": [256, 768], "water_deep": [256, 800],
}
HB_F_WALLS = {  # 64x64 cells, each a back-corner pair: left 32px = wall on the tile's NW edge, right 32px = NE edge
    "wall_brick_orange": [0, 704], "wall_brick_pink": [64, 704], "wall_brick_teal": [128, 704],
    "wall_brick_brown": [0, 768], "wall_brick_mauve": [64, 768], "wall_brick_olive": [128, 768],
    "wall_brick_orange_dark_top": [0, 832], "wall_brick_pink_dark_top": [64, 832], "wall_brick_teal_dark_top": [128, 832],
    "wall_stone": [192, 832],
    "wall_brick_brown_dark_top": [0, 896], "wall_brick_mauve_dark_top": [64, 896], "wall_brick_olive_dark_top": [128, 896],
    "wall_stone_dark_top": [192, 896],
}

# --------------------------------------------------------------------------- hawkbirdtree terrain
HB_T = "vendor/hawkbirdtree-iso-tileset-32x32/big_isometric_tileset64x32.png"
HB_T_BLOCKS = {  # 64x64 cells; a 64x32 top face sits at y 0..32 of the cell, earth sides below
    "block_grass_plain": [0, 128], "block_grass_plain_b": [64, 128], "block_grass_plain_c": [128, 128],
    "block_grass_plain_d": [192, 128], "block_grass_plain_e": [0, 192],
    "block_grass_flowers_red": [64, 192], "block_grass_flowers_purple": [128, 192], "block_grass_flowers_yellow": [192, 192],
    "block_grass_speckled": [0, 256], "block_grass_rocks_a": [64, 256], "block_grass_boulder": [128, 256],
    "block_grass_rocks_b": [192, 256],
    "block_dirt_path_grass_edges_a": [0, 64], "block_dirt_path_grass_edges_b": [64, 64],
    "block_dirt_path_grass_edges_c": [128, 64], "block_dirt_path_grass_edges_d": [192, 64],
    "block_grass_with_path_edge_a": [0, 320], "block_grass_with_path_edge_b": [64, 320],
    "block_grass_with_path_edge_c": [128, 320], "block_grass_with_path_edge_d": [192, 320],
    "block_sand_plain": [256, 320], "block_sand_speckled": [320, 320], "block_dirt_pebbles": [384, 320],
    "block_dirt_plain": [448, 320],
    "block_path_grass_border_a": [0, 384], "block_path_grass_border_b": [64, 384],
    "block_path_grass_border_c": [128, 384], "block_path_grass_border_d": [192, 384],
    "block_sand_pond": [64, 0], "block_sand_grass_patch": [0, 0], "gravestone_light": [128, 0], "gravestone_dark": [192, 0],
}
HB_T_FLAT = {  # thin slabs / flat diamonds (64 wide)
    "slab_sand_a": [768, 512], "slab_sand_b": [832, 512], "slab_grey_green": [896, 512], "slab_pink": [960, 512],
    "slab_lavender": [768, 576], "slab_mint": [832, 576], "slab_rose": [896, 576], "block_cobble_sandstone": [960, 576],
    "slab_lilac": [768, 640], "slab_peach": [832, 640], "slab_sky": [896, 640], "slab_taupe": [960, 640],
    "flat_sand": [832, 1152], "flat_water": [896, 1152], "flat_water_deep": [960, 1152],
    "flat_grass_dark": [832, 1216], "flat_dirt": [896, 1216],
}
HB_T_OBJECTS = {
    "bush_green": [778, 6, 46, 38], "bush_autumn": [842, 10, 46, 38], "rock_small": [912, 22, 36, 22],
    "stone_pillar_tall": [960, 0, 64, 192], "signpost_a": [908, 68, 40, 60], "signpost_b": [908, 132, 40, 60],
    "stump_a": [772, 82, 58, 46], "stump_b": [836, 90, 58, 38], "stump_c": [772, 146, 58, 46], "stump_d": [836, 154, 58, 38],
    "tree_round_green": [768, 208, 64, 94], "tree_round_teal": [832, 200, 64, 102],
    "tree_round_autumn": [896, 200, 64, 102], "tree_thin_sapling": [960, 200, 64, 100],
    "tree_big_oak_crown": [796, 320, 142, 128], "tree_big_oak_trunk": [854, 448, 30, 64],
    "crate_wood": [896, 832, 64, 64], "barrel_wood": [960, 1088, 64, 64],
}
HB_T_CELLS64 = {  # objects on 64x64 cells (tight box computed at build time)
    "fence_post_cross_a": [768, 704], "fence_post_cross_b": [832, 704], "fence_post_cross_c": [896, 704],
    "fence_post_cross_d": [960, 704], "fence_post_a": [768, 768], "fence_post_stump": [832, 768],
    "fence_post_cross_e": [896, 768], "fence_post_cross_f": [960, 768],
    "rope_fence_post_left": [768, 896], "rope_fence_post": [832, 896], "post_short": [896, 896], "rope_fence_pair": [960, 896],
    "notice_board_a": [768, 960], "notice_board_b": [832, 960], "lamp_post_stub": [896, 960], "sign_board": [960, 960],
    "sign_board_b": [896, 1024], "stone_pedestal": [960, 1024], "stone_column_short": [768, 1088],
    "stone_column": [832, 1088], "stone_bench_block": [896, 1088],
}


def hb_entries():
    sprites = {}
    for n, (x, y, w, h) in HB_F_SPRITES.items():
        sprites[n] = {"rect": [x, y, w, h], "anchor": [w // 2, h - max(4, min(16, h // 3))]}
    for n, r in HB_F_MISC.items():
        sprites[n] = {"rect": r, "note": "several touching sprites (blue curtain, brick fireplace, stone well with roof, 2 crates); crop by hand"}
    floors = {n: {"rect": [x, y, 64, 32], "anchor": [32, 16]} for n, (x, y) in HB_F_FLOORS.items()}
    walls = {n: {"rect": [x, y, 64, 64], "left_half": [x, y, 32, 64], "right_half": [x + 32, y, 32, 64]}
             for n, (x, y) in HB_F_WALLS.items()}
    furniture = {
        "path": HB_F, "pack": "hawkbirdtree-iso-furniture-walls", "size": size(HB_F),
        "projection": "isometric 2:1 pixel art (64x32 floor diamonds)",
        "contains": "beds, wardrobes, round tables with table cloths (peach/light blue/lilac/wood), long tables (white cloth!), wooden chairs (2 facings), stools, barrels, crates, market stall with awning, L-shaped counter, chests, clocks, vases incl. flowers, potted tree, curtains, banners, rugs and long runner carpets (aisle!), brick/stone walls, wooden/tiled floors, grass/sand/water floor tiles",
        "layout": "packed sheet: furniture sits roughly on 64x64 cells (5 cols x 10 rows) but sizes vary, so use the rects; floors are 64x32 diamonds; walls are 64x64 cells",
        "anchor_convention": "anchor = foot point inside the sprite rect (approximate centre of the footprint). For objects that fill a whole tile (tables, beds) put the anchor on the tile centre; small props: tile centre too.",
        "sprites": sprites,
        "floors_64x32": floors,
        "walls_64x64": walls,
        "wall_placement": "A wall cell shows the two BACK walls of one tile as a peak: left 32px = wall standing on the tile's NW edge, right 32px = wall on the NE edge; walls are 48px tall. With (tx, ty) = top-left of the tile's 64x32 diamond bbox on screen: NW wall = cell x 0..31 drawn at (tx, ty-48); NE wall = cell x 32..63 at (tx+32, ty-48); SE (front) wall = cell x 0..31 at (tx+32, ty-32); SW (front) wall = cell x 32..63 at (tx, ty-32). Draw back walls before the tile's contents and front walls after. '_dark_top' variants have a darker cap (good for cut-away/low walls).",
    }
    tblocks = {n: {"rect": [x, y, 64, 64], "anchor": [32, 16], "top_face": [x, y, 64, 32]} for n, (x, y) in HB_T_BLOCKS.items()}
    tflat = {}
    for n, (x, y) in HB_T_FLAT.items():
        r = bbox(HB_T, x, y, 64, 64)
        tflat[n] = {"rect": r, "anchor": [32, 16]}
    tobj = {n: {"rect": [x, y, w, h], "anchor": [w // 2, h - 8]} for n, (x, y, w, h) in HB_T_OBJECTS.items()}
    for n, (x, y) in HB_T_CELLS64.items():
        r = bbox(HB_T, x, y, 64, 64)
        tobj[n] = {"rect": r, "anchor": [r[2] // 2, r[3] - 6]}
    terrain = {
        "path": HB_T, "pack": "hawkbirdtree-iso-tileset-32x32", "size": size(HB_T),
        "projection": "isometric 2:1 pixel art; ground blocks are 64x64 cubes whose top face is a 64x32 diamond",
        "big_oak_note": "the big oak is two parts: draw tree_big_oak_trunk with its top-left at crown.x+58, crown.y+128 (i.e. sheet positions as given), then the crown on top. The other pieces at x 768..1023, y 448..511 are modular crown/trunk bits.",
        "contains": "grass blocks (plain, with red/purple/yellow flowers, rocks), dirt/sand path blocks with grass edges, water/cliff/waterfall blocks (cols 4-11, not listed), slopes, flat paving slabs, trees (round green/teal/autumn, big oak, modular trunks), bushes, stumps, fences/rope posts, notice boards, signs, stone columns, crate, barrel, gravestones",
        "layout": "x 0..767: 64x64 grid (12 cols x 21 rows) of ground blocks; x 768..1023: objects (use rects)",
        "block_placement": "Draw a block cell with its top-left at (tx, ty) where (tx, ty) is the top-left of the tile's 64x32 diamond; draw back-to-front so only top faces show, and the earth sides appear only at the map edge (nice 'diorama' border). Anchor [32,16] = centre of the top face.",
        "blocks_64x64": tblocks, "flat_tiles": tflat, "objects": tobj,
    }
    return [furniture, terrain]


def kenney_entries():
    d = os.path.join(ROOT, "derived", "kenney-furniture-pixelized")
    sprites = {}
    for f in sorted(os.listdir(d)):
        if f.endswith(".png"):
            w, h = size(rel(os.path.join(d, f)))
            sprites[f[:-4]] = {"path": rel(os.path.join(d, f)), "size": [w, h], "anchor": [w // 2, h - max(3, w // 4)]}
    return {
        "folder": "derived/kenney-furniture-pixelized", "pack": "kenney-furniture-kit (CC0), pixelized by tools/pixelize.py",
        "projection": "isometric 2:1 (true iso renders, downscaled ~0.31 so 1 Kenney floor tile = 64x32), 1px dark outline, 12 colours each",
        "facing": "_SE / _SW = front views (towards camera, right/left); _NE / _NW = back views",
        "contains": "toilets, sinks, mirror, bin, floor speakers (DJ), small speakers, radio, bar counter + bar end, bar stools, fridge, coffee machine, floor/wall lamps, potted plant, cushioned chairs (4 facings), bench, sofa, rectangular table with cloth, round table, doors (closed/open frame), plain walls / walls with doorway / walls with window (white/grey), rugs, doormat, coat rack, box",
        "anchor_convention": "anchor ~ bottom-centre of the footprint; tune per sprite in-game",
        "sprites": sprites,
        "originals": "vendor/kenney-furniture-kit/Isometric/<name>.png (4 facings each, ~2-3x larger, smooth-shaded; 140 objects)",
    }


def lpc_entries():
    chars = os.path.join(ROOT, "characters")
    names = sorted({f.rsplit("_", 1)[0] for f in os.listdir(chars) if f.endswith(".png")})
    out = {}
    for n in names:
        out[n] = {a: f"characters/{n}_{a}.png" for a in ("walk", "idle", "cast", "hurt", "sit") if os.path.exists(os.path.join(chars, f"{n}_{a}.png"))}
    return {
        "projection": "3/4 top-down ('RPG Maker' / LPC view), 4 directions - works as-is in an iso game (use row by heading)",
        "frame_size": [64, 64],
        "anchor": [32, 60],
        "anchor_note": "feet touch y~60 inside the 64x64 frame (shadow layer centred at ~(32,58)); place anchor on the character's tile position",
        "body_heights_px": {"adult": "~48-52 px from feet to top of head", "child": "~36 px"},
        "animations": {
            "walk": {"grid": [9, 4], "sheet_size": [576, 256], "fps": 10, "frames": "col 0 = stand, cols 1-8 = walk cycle"},
            "idle": {"grid": [2, 4], "sheet_size": [128, 256], "fps": 2, "frames": "breathing; for characters whose clothes lack idle art the composer repeats walk col 0 (static)"},
            "cast": {"grid": [7, 4], "sheet_size": [448, 256], "fps": 8, "frames": "LPC spellcast: arms raised and lowered (dance / cheer / fight); children: synthesised hop in place"},
            "hurt": {"grid": [6, 1], "sheet_size": [384, 64], "fps": 8, "frames": "LPC hurt, facing the camera only: crumples and falls; last frame = lying (slip / sleep / pass out); children: synthesised topple"},
            "sit": {"grid": [3, 4], "sheet_size": [192, 256], "frames": "3 sitting poses (cols 0-2); outfits whose dress/jacket/skirt has no sit art use a plain top/skirt of the same colour; none for children"},
        },
        "index_js": "characters/index.js defines window.CHAR_INDEX (paths relative to index.html, groups, guest pools m/f/om/of/kb/kg) - the game should load that",
        "rows": {"0": "up / north (back to camera)", "1": "left / west", "2": "down / south (facing camera)", "3": "right / east"},
        "iso_direction_mapping": "iso screen-diagonal headings: NE->row 0 (up) or 3, NW->row 0 or 1, SE->row 2 or 3, SW->row 2 or 1; simplest: pick by sign of screen dx (left/right rows) when |dx| > |dy|, else up/down rows",
        "composed_characters": out,
        "layers_dir": "vendor/lpc-characters/spritesheets (same 64x64 grid; walk / idle / sit / spellcast / hurt .png, or <anim>/<colour>.png)",
        "compose_tool": "tools/lpc_cast.py (cast definition) -> tools/lpc_characters.json -> tools/lpc_compose.py tools/lpc_characters.json -> tools/lpc_index.py (index.js + previews/cast_*.png)  (catalog: tools/lpc_layers.json, colours: vendor/lpc-characters/palette_definitions + tools/lpc_palettes_custom.json)",
    }


def main():
    manifest = {
        "_comment": "Generated by tools/build_manifest.py. All paths are relative to assets/. Rects are [x, y, w, h] in sheet pixels; anchors are [x, y] inside the rect/frame.",
        "recommended_scale": "Use 64x32 iso tiles at 1x (all environment art here is drawn for 64x32). LPC characters are 64x64 frames at 1x (~50px tall people), which matches Theme Hospital proportions on a 64x32 grid. Render with imageSmoothingEnabled = false and integer zoom.",
        "characters_lpc": lpc_entries(),
        "environment_hawkbirdtree": hb_entries(),
        "props_kenney_pixelized": kenney_entries(),
        "props_lpc_cakes": {
            "path": "vendor/lpc-cakes/lpc_food_cakes.png", "size": size("vendor/lpc-cakes/lpc_food_cakes.png"),
            "projection": "3/4 top-down (LPC), 32x32 cells", "grid": [3, 1],
            "sprites": {"cake_white_red_whole": {"rect": [0, 0, 32, 32]}, "cake_chocolate_slice": {"rect": [32, 0, 32, 32]},
                        "cake_white_slice": {"rect": [64, 0, 32, 32]}},
            "note": "small table-top cake; for a tiered wedding cake stack/scale it or draw one",
        },
    }
    with open(os.path.join(ROOT, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=1)
    print("wrote", os.path.join(ROOT, "manifest.json"))


if __name__ == "__main__":
    main()
