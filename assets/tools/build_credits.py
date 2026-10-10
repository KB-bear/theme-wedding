"""Regenerate assets/CREDITS.md (static pack credits + per-layer LPC credits from CREDITS-used.csv).

Usage: python -I build_credits.py
"""
import csv, os
from collections import OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))

HEADER = """# Art credits - Theme Wedding

All art below is third-party and used under the licence stated. Keep this file (or an
equivalent in-game credits screen) with any build you share.

## Summary

| Pack (folder under `assets/vendor/`) | Author(s) | Licence | Attribution | Source |
|---|---|---|---|---|
| `lpc-characters` - Universal LPC Spritesheet Character Generator layers (+ composed sheets in `assets/characters/`) | many LPC artists, per layer below | per layer: CC-BY-SA 3.0 / OGA-BY 3.0 / CC-BY 3.0 / GPL 2.0/3.0 / CC0 | **required** (list every author below) | https://github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator |
| `hawkbirdtree-iso-furniture-walls` - "Isometric Furniture and Walls" | hawkbirdtree | CC0 1.0 | not required (appreciated) | https://opengameart.org/content/isometric-furniture-and-walls |
| `hawkbirdtree-iso-tileset-32x32` - "32x32 Isometric Tileset Version 0_1" | hawkbirdtree | CC0 1.0 | not required (appreciated) | https://opengameart.org/content/32x32-isometric-tileset-version-01 |
| `kenney-furniture-kit` - "Furniture Kit" 2.0 isometric renders (+ pixelized copies in `assets/derived/kenney-furniture-pixelized/`) | Kenney (www.kenney.nl) | CC0 1.0 | not required (appreciated) | https://kenney.nl/assets/furniture-kit |
| `lpc-cakes` - "LPC cakes" | WhitePaperChan, based on a cake from "[LPC] Food" by bluecarrot16 (CC0) | CC0 1.0 | not required | https://opengameart.org/content/lpc-cakes |

Licence texts: CC0 https://creativecommons.org/publicdomain/zero/1.0/ - CC-BY-SA 3.0 https://creativecommons.org/licenses/by-sa/3.0/ -
CC-BY 3.0 https://creativecommons.org/licenses/by/3.0/ - OGA-BY 3.0 https://static.opengameart.org/OGA-BY-3.0.txt -
GPL 3.0 https://www.gnu.org/licenses/gpl-3.0.html

### What the LPC licences mean for this game
* Every LPC layer used offers at least one of CC-BY-SA 3.0, OGA-BY 3.0, CC-BY 3.0 or CC0, so a free personal
  browser game is fine **as long as all authors below are credited** (e.g. an in-game "Credits" page linking here).
* The composed character sheets in `assets/characters/` are derivative works: share them under **CC-BY-SA 3.0**
  (and OGA-BY for the OGA-BY-only layers), with this credit list. Your own game code is not affected.
* Layers marked only "OGA-BY 3.0" or "CC0" carry no share-alike requirement.
* The `*_idle.png`/`*_sit.png` sheets of `hair/wavy/child` have no row of their own in the upstream CREDITS.csv;
  they are by the same author as its walk sheet (Nila122, see below).

### Derived files made here (no new art, just processing)
* `assets/characters/*.png` - composed from the LPC layers by `tools/lpc_compose.py` (recoloured with the ULPC palettes
  + `tools/lpc_palettes_custom.json`); cast defined in `tools/lpc_cast.py`, index in `assets/characters/index.js`.
  Processing beyond layering/recolouring (all derived from the credited layers, same licences):
  - children's `*_cast.png` / `*_hurt.png` are synthesised from their composed walk frames (offset "hop" / squash +
    rotation "fall"), because the LPC child clothes only have walk art and the child body has no spellcast;
  - children's feet are recoloured to shoe colours (the LPC child base has no footwear layer);
  - `*_sit.png` of outfits whose dress/jacket/skirt layer has no sit art draw a plain LPC top/skirt in the same colour instead;
  - isolated single stray pixels are removed from every composed sheet.
* `assets/derived/kenney-furniture-pixelized/*.png` - Kenney renders downscaled, colour-reduced and outlined by
  `tools/pixelize.py` (still CC0).

## LPC character layers - per-file credits

Generated from `vendor/lpc-characters/CREDITS-used.csv` (subset of the upstream CREDITS.csv). One entry per layer
folder; the walk/idle/sit/spellcast/hurt sheets of a layer share the credits shown unless noted.

"""


def main():
    rows = list(csv.reader(open(os.path.join(ROOT, "vendor", "lpc-characters", "CREDITS-used.csv"), encoding="utf-8"),
                           skipinitialspace=True))[1:]
    groups = OrderedDict()
    for r in rows:
        f, notes, authors, lic, urls = [x.strip() for x in r[:5]]
        layer, anim = f.rsplit("/", 1)
        key = (layer, authors, lic, urls, notes)
        groups.setdefault(key, []).append(anim.replace(".png", ""))
    all_authors = set()
    lines = [HEADER]
    for (layer, authors, lic, urls, notes), anims in groups.items():
        for a in authors.split(","):
            if a.strip():
                all_authors.add(a.strip())
        lines.append(f"### `{layer}` ({', '.join(anims)})\n")
        lines.append(f"* Authors: {authors}\n* Licences: {lic}\n")
        if notes:
            lines.append(f"* Notes: {notes}\n")
        lines.append("* Sources: " + ", ".join(u.strip() for u in urls.split(",") if u.strip()) + "\n\n")
    lines.append("## All LPC authors (for a short credits screen)\n\n")
    lines.append(", ".join(sorted(all_authors, key=str.lower)) + "\n")
    with open(os.path.join(ROOT, "CREDITS.md"), "w", encoding="utf-8") as fh:
        fh.write("".join(lines))
    print("wrote CREDITS.md;", len(groups), "LPC layer groups,", len(all_authors), "authors")


if __name__ == "__main__":
    main()
