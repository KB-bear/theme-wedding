# Art credits - Theme Wedding

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

### `body/bodies/male` (spellcast, walk, hurt, idle, sit)
* Authors: bluecarrot16,JaidynReiman,Benjamin K. Smith (BenCreating),Evert,Eliza Wyatt (ElizaWy),TheraHedwig,MuffinElZangano,Durrani,Johannes Sjölund (wulax),Stephen Challener (Redshrike)
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Notes: see details at https://opengameart.org/content/lpc-character-bases; 'Thick' Male Revised Run/Climb by JaidynReiman (based on ElizaWy's LPC Revised)
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-medieval-fantasy-character-sprites, https://opengameart.org/content/lpc-male-jumping-animation-by-durrani, https://opengameart.org/content/lpc-runcycle-and-diagonal-walkcycle, https://opengameart.org/content/lpc-revised-character-basics, https://opengameart.org/content/lpc-be-seated, https://opengameart.org/content/lpc-runcycle-for-male-muscular-and-pregnant-character-bases-with-modular-heads, https://opengameart.org/content/lpc-jump-expanded, https://opengameart.org/content/lpc-character-bases

### `body/bodies/female` (spellcast, walk, hurt, idle, sit)
* Authors: Benjamin K. Smith (BenCreating),bluecarrot16,TheraHedwig,Evert,MuffinElZangano,Durrani,Pierre Vigier (pvigier),ElizaWy,Matthew Krohn (makrohn),Johannes Sjölund (wulax),Stephen Challener (Redshrike)
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Notes: see details at https://opengameart.org/content/lpc-character-bases
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-medieval-fantasy-character-sprites, https://opengameart.org/content/lpc-ladies, https://opengameart.org/content/lpc-7-womens-shirts, https://opengameart.org/content/lpc-jump-expanded, https://opengameart.org/content/lpc-be-seated, https://opengameart.org/content/lpc-revised-character-basics, https://gitlab.com/vagabondgame/lpc-characters, https://opengameart.org/content/lpc-male-jumping-animation-by-durrani, https://opengameart.org/content/lpc-runcycle-and-diagonal-walkcycle

### `body/bodies/muscular` (spellcast, walk, hurt, idle, sit)
* Authors: bluecarrot16,JaidynReiman,Evert,TheraHedwig,MuffinElZangano,Durrani,Sander Frenken (castelonia),Benjamin K. Smith (BenCreating),Eliza Wyatt (ElizaWy),dalonedrau,Stephen Challener (Redshrike)
* Licences: CC-BY-SA 3.0,GPL 3.0
* Notes: see details at https://opengameart.org/content/lpc-character-bases
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-barbarian-sprite-base, https://opengameart.org/content/lpc-muscular-swing-animation, https://opengameart.org/content/lpc-muscular-hurt-animation, https://opengameart.org/content/lpc-jump-expanded, https://opengameart.org/content/lpc-revised-character-basics, https://opengameart.org/content/lpc-be-seated, https://opengameart.org/content/lpc-jump-expanded, https://opengameart.org/content/lpc-character-bases, https://opengameart.org/content/lpc-male-jumping-animation-by-durrani

### `body/bodies/child` (walk, hurt, idle, sit)
* Authors: bluecarrot16,Benjamin K. Smith (BenCreating),ElizaWy,MuffinElZangano,Durrani,Nila122,kheftel,Stephen Challener (Redshrike)
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-child-standing-template, https://opengameart.org/content/lpc-children-walk-animation, https://opengameart.org/content/lpc-male-jumping-animation-by-durrani, https://opengameart.org/content/lpc-male-jumping-animation-by-durrani, https://opengameart.org/content/lpc-jump-expanded, https://opengameart.org/content/lpc-jump-expanded

### `shadow/adult` (spellcast, walk, hurt, idle, sit)
* Authors: drjamgo@hotmail.com,JaidynReiman
* Licences: CC0
* Notes: Original by Dr. Jamgo, jump/sit/emote/run/revised combat by JaidynReiman
* Sources: https://opengameart.org/content/shadow-for-lpc-sprite

### `shadow/child` (walk, hurt, idle, sit)
* Authors: drjamgo@hotmail.com,JaidynReiman
* Licences: CC0
* Notes: Original by Dr. Jamgo, jump/sit/emote/run/revised combat by JaidynReiman
* Sources: https://opengameart.org/content/shadow-for-lpc-sprite

### `head/wrinkles` (spellcast, walk, hurt, idle, sit)
* Authors: bluecarrot16
* Licences: CC0
* Sources: 

### `head/heads/human/child` (spellcast, walk, hurt, idle, sit)
* Authors: Stephen Challener (Redshrike),kheftel,bluecarrot16
* Licences: OGA-BY 3.0,CC-BY 3.0,GPL 3.0
* Sources: https://opengameart.org/content/, https://opengameart.org/content/lpc-child-standing-template, https://opengameart.org/content/lpc-character-bases

### `head/heads/human/female_elderly` (spellcast, walk, hurt, idle, sit)
* Authors: Benjamin K. Smith (BenCreating),Eliza Wyatt (ElizaWy),Stephen Challener (Redshrike)
* Licences: OGA-BY 3.0,CC-BY 3.0
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-revised-elders, https://opengameart.org/content/lpc-character-bases

### `head/heads/human/female` (spellcast, walk, hurt, idle, sit)
* Authors: bluecarrot16,Benjamin K. Smith (BenCreating),Stephen Challener (Redshrike)
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Notes: original head by Redshrike, tweaks by BenCreating, modular version by bluecarrot16
* Sources: https://opengameart.org/content/, https://opengameart.org/content/lpc-character-bases

### `head/heads/human/male_elderly` (spellcast, walk, hurt, idle, sit)
* Authors: Benjamin K. Smith (BenCreating),Eliza Wyatt (ElizaWy),Stephen Challener (Redshrike)
* Licences: OGA-BY 3.0,CC-BY 3.0
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-revised-elders, https://opengameart.org/content/lpc-character-bases

### `head/heads/human/male_gaunt` (spellcast, walk, hurt, idle, sit)
* Authors: Stephen Challener (Redshrike),bluecarrot16
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Notes: original head by Redshrike, gaunt version by bluecarrot16
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-folk

### `head/heads/human/male_plump` (spellcast, walk, hurt, idle, sit)
* Authors: Stephen Challener (Redshrike),??
* Licences: CC-BY-SA 3.0,GPL 3.0
* Notes: original head by Redshrike, plump version by ??
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-folk

### `head/heads/human/male` (spellcast, walk, hurt, idle, sit)
* Authors: bluecarrot16,Benjamin K. Smith (BenCreating),Stephen Challener (Redshrike)
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Notes: original head by Redshrike, tweaks by BenCreating, modular version by bluecarrot16
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-character-bases

### `eyes/eyebrows/thin/adult` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy
* Licences: OGA-BY 3.0
* Sources: https://github.com/ElizaWy/LPC/tree/main/Characters/Hair, https://opengameart.org/content/lpc-expanded-sit-run-jump-more

### `eyes/eyebrows/thin/child` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy
* Licences: OGA-BY 3.0
* Sources: https://github.com/ElizaWy/LPC/tree/main/Characters/Hair, https://opengameart.org/content/lpc-expanded-sit-run-jump-more

### `beards/beard/5oclock_shadow` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Thane Brimhall (pennomi),laetissima
* Licences: CC-BY-SA 3.0,GPL 3.0
* Notes: Original by Pennomi, repositioning by JaidynReiman.
* Sources: https://opengameart.org/content/lpc-base-character-expressions

### `beards/beard/basic` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Carlo Enrico Victoria (Nemisys)
* Licences: CC-BY-SA 3.0,GPL 3.0
* Notes: Original by Nemisys, repositioning by JaidynReiman.
* Sources: https://opengameart.org/content/lpc-white-beard

### `beards/beard/medium` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy
* Licences: OGA-BY 3.0
* Sources: https://github.com/ElizaWy/LPC/tree/main/Characters/Hair, https://opengameart.org/content/lpc-expanded-sit-run-jump-more

### `beards/beard/trimmed` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy
* Licences: OGA-BY 3.0
* Sources: https://github.com/ElizaWy/LPC/tree/main/Characters/Hair, https://opengameart.org/content/lpc-expanded-sit-run-jump-more

### `beards/mustache/bigstache` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Thane Brimhall (pennomi),laetissima
* Licences: CC-BY-SA 3.0,GPL 3.0
* Notes: Original by Pennomi, repositioning by JaidynReiman.
* Sources: https://opengameart.org/content/lpc-base-character-expressions

### `beards/mustache/basic` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Carlo Enrico Victoria (Nemisys)
* Licences: CC-BY-SA 3.0,GPL 3.0
* Notes: Original by Nemisys, repositioning by JaidynReiman.
* Sources: https://opengameart.org/content/lpc-brunet-mustache

### `beards/mustache/walrus` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy
* Licences: OGA-BY 3.0
* Sources: https://github.com/ElizaWy/LPC/tree/main/Characters/Hair, https://opengameart.org/content/lpc-expanded-sit-run-jump-more

### `hair/extensions/ties/high_bun/adult` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman
* Licences: OGA-BY 3.0
* Notes: Custom by JaidynReiman
* Sources: https://opengameart.org/content/lpc-expanded-xlong-hair

### `hair/afro/adult` (spellcast, walk, hurt, idle, sit)
* Authors: bluecarrot16
* Licences: CC0
* Sources: https://opengameart.org/content/lpc-hair

### `hair/cornrows/adult` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy,bluecarrot16
* Licences: CC0
* Notes: Original by bluecarrot16, animated by ElizaWy.
* Sources: https://opengameart.org/content/lpc-hair, https://github.com/ElizaWy/LPC/blob/main/Characters/Hair, https://opengameart.org/content/lpc-expanded-sit-run-jump-more

### `hair/dreadlocks_short/adult` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy,bluecarrot16
* Licences: CC0
* Notes: Original by bluecarrot16. Animated by ElizaWy.
* Sources: https://opengameart.org/content/lpc-hair, https://github.com/ElizaWy/LPC/blob/main/Characters/Hair, https://opengameart.org/content/lpc-expanded-sit-run-jump-more

### `hair/natural/adult` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy,bluecarrot16
* Licences: CC0
* Notes: Original by bluecarrot16, animations by ElizaWy.
* Sources: https://opengameart.org/content/lpc-hair, https://github.com/ElizaWy/LPC/blob/main/Characters/Hair, https://opengameart.org/content/lpc-expanded-sit-run-jump-more

### `hair/twists_fade/adult` (spellcast, walk, hurt, idle, sit)
* Authors: bluecarrot16
* Licences: CC0
* Sources: https://opengameart.org/content/lpc-hair

### `hair/curls_large/adult/fg` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman
* Licences: OGA-BY 3.0+,CC-BY 3.0+,GPL 3.0+
* Sources: https://opengameart.org/content/lpc-expanded-xlong-hair

### `hair/curls_large/adult/bg` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman
* Licences: OGA-BY 3.0+,CC-BY 3.0+,GPL 3.0+
* Sources: https://opengameart.org/content/lpc-expanded-xlong-hair

### `hair/curly_long/adult` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy
* Licences: OGA-BY 3.0
* Sources: https://opengameart.org/content/lpc-hair

### `hair/curly_short/adult` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy
* Licences: OGA-BY 3.0
* Sources: https://opengameart.org/content/lpc-hair, https://opengameart.org/content/lpc-expanded-sit-run-jump-more

### `hair/jewfro/child` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman
* Licences: OGA-BY 3.0+,CC-BY 3.0+,CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/lpc-1-hairstyle-2-hair-extensions-3-previously-unofficially-released-hairstyles, https://github.com/jrconway3/Universal-LPC-spritesheet/commit/46ddcf05a0e43e7aa6ffd47d350eef0eb529ac24

### `hair/balding/adult` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy
* Licences: OGA-BY 3.0
* Sources: https://opengameart.org/content/lpc-hair

### `hair/buzzcut/adult` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy
* Licences: OGA-BY 3.0
* Sources: https://opengameart.org/content/lpc-hair

### `hair/bedhead/adult` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Manuel Riecke (MrBeast)
* Licences: CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-expanded-hair

### `hair/curtains/adult` (spellcast, walk, hurt, idle, sit)
* Authors: Mandi Paugh,bluecarrot16
* Licences: GPL 2.0,GPL 3.0,CC-BY 3.0
* Notes: (star)
* Sources: https://opengameart.org/content/star-overland, https://opengameart.org/content/lpc-hair

### `hair/idol/adult` (spellcast, walk, hurt, idle, sit)
* Authors: thecilekli,bluecarrot16
* Licences: CC0
* Notes: Original CC0 by Thecilekli. Edited by bluecarrot16 and ElizaWy. Animated by ElizaWy.
* Sources: https://opengameart.org/content/lpc-korean-idol-hairstyle-male-with-12-colors, https://opengameart.org/content/lpc-hair, https://github.com/ElizaWy/LPC/tree/main/Characters/Hair, https://opengameart.org/content/lpc-expanded-sit-run-jump-more

### `hair/messy1/adult` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Manuel Riecke (MrBeast)
* Licences: CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-expanded-hair

### `hair/page/adult` (spellcast, walk, hurt, idle, sit)
* Authors: Page,Johannes Sjölund (wulax)
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/lpc-medieval-fantasy-character-sprites, https://opengameart.org/content/lpc-expanded-hair

### `hair/parted_side_bangs/child` (spellcast, walk, hurt, idle, sit, spellcast, walk, hurt, idle, sit, spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman
* Licences: OGA-BY 3.0+,CC-BY 3.0+,CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/lpc-1-hairstyle-2-hair-extensions-3-previously-unofficially-released-hairstyles, https://github.com/jrconway3/Universal-LPC-spritesheet/commit/46ddcf05a0e43e7aa6ffd47d350eef0eb529ac24

### `hair/parted_side_bangs2/child` (spellcast, walk, hurt, idle, sit, spellcast, walk, hurt, idle, sit, spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman
* Licences: OGA-BY 3.0+,CC-BY 3.0+,CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/lpc-1-hairstyle-2-hair-extensions-3-previously-unofficially-released-hairstyles, https://github.com/jrconway3/Universal-LPC-spritesheet/commit/46ddcf05a0e43e7aa6ffd47d350eef0eb529ac24

### `hair/parted/adult` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Joe White,Manuel Riecke (MrBeast)
* Licences: CC-BY-SA 3.0,GPL 3.0
* Notes: down 4 and 5 added by JaidynReiman; recolors by Joe White; original by Manuel Riecke (MrBeast)
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://github.com/jrconway3/Universal-LPC-spritesheet/commit/46ddcf05a0e43e7aa6ffd47d350eef0eb529ac24, https://opengameart.org/content/lpc-expanded-hair

### `hair/parted2/adult` (spellcast, walk, hurt, idle, sit)
* Authors: Skorpio,bluecarrot16
* Licences: CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/lpc-skorpios-scifi-sprite-pack, https://opengameart.org/content/lpc-hair

### `hair/pixie/adult` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Manuel Riecke (MrBeast)
* Licences: CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-expanded-hair

### `hair/plain/adult` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Manuel Riecke (MrBeast),Joe White
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/ponytail-and-plain-hairstyles, https://opengameart.org/content/lpc-expanded-hair

### `hair/swoop_side/child` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman
* Licences: OGA-BY 3.0+,CC-BY 3.0+,CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/lpc-1-hairstyle-2-hair-extensions-3-previously-unofficially-released-hairstyles, https://github.com/jrconway3/Universal-LPC-spritesheet/commit/46ddcf05a0e43e7aa6ffd47d350eef0eb529ac24

### `hair/swoop/adult` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Manuel Riecke (MrBeast)
* Licences: CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-expanded-hair

### `hair/unkempt/adult` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Manuel Riecke (MrBeast)
* Licences: CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-expanded-hair

### `hair/spiked/adult` (spellcast, walk, hurt, idle, sit)
* Authors: kcilds/Rocetti/Eredah
* Licences: CC-BY 4.0
* Sources: https://opengameart.org/content/eredah-rpg-character-base-48x64-ongoing, https://opengameart.org/content/lpc-hair

### `hair/bob_side_part/adult` (spellcast, walk, hurt, idle, sit)
* Authors: thecilekli,bluecarrot16,ElizaWy
* Licences: CC0
* Notes: Original by Thecilekli. Touchups by BlueCarrot16. Edited and animated by ElizaWy.
* Sources: https://opengameart.org/content/lpc-pink-short-hair, https://opengameart.org/content/lpc-hair, https://github.com/ElizaWy/LPC/blob/main/Characters/Hair, https://opengameart.org/content/lpc-expanded-sit-run-jump-more

### `hair/bob/adult` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy,bluecarrot16
* Licences: CC0
* Notes: Original by bluecarrot16. Edited and animated by ElizaWy.
* Sources: https://opengameart.org/content/lpc-hair, https://github.com/ElizaWy/LPC/blob/main/Characters/Hair, https://opengameart.org/content/lpc-expanded-sit-run-jump-more

### `hair/lob/adult` (spellcast, walk, hurt, idle, sit)
* Authors: bluecarrot16
* Licences: CC0
* Sources: https://opengameart.org/content/lpc-hair

### `hair/relm_short/child` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman
* Licences: OGA-BY 3.0+,CC-BY 3.0+,GPL 3.0
* Sources: https://opengameart.org/content/lpc-relm-hair-xlong-ponytail

### `hair/bangs_bun/adult` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy,bluecarrot16
* Licences: CC0
* Notes: Original by bluecarrot16, animated by ElizaWy.
* Sources: https://opengameart.org/content/lpc-hair, https://github.com/ElizaWy/LPC/blob/main/Characters/Hair, https://opengameart.org/content/lpc-expanded-sit-run-jump-more

### `hair/braid/adult/fg` (spellcast, walk, hurt, idle, sit)
* Authors: Nila122,ElizaWy
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0,GPL 2.0
* Sources: https://opengameart.org/content/3-hairs-for-lpc, https://opengameart.org/content/lpc-hair

### `hair/braid/adult/bg` (spellcast, walk, hurt, idle, sit)
* Authors: Nila122,ElizaWy
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0,GPL 2.0
* Sources: https://opengameart.org/content/3-hairs-for-lpc, https://opengameart.org/content/lpc-hair

### `hair/half_up/adult` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy
* Licences: OGA-BY 3.0
* Sources: https://opengameart.org/content/lpc-hair

### `hair/high_ponytail/adult/fg` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,ElizaWy,bluecarrot16
* Licences: OGA-BY 3.0
* Sources: https://opengameart.org/content/lpc-hair, https://opengameart.org/content/lpc-expanded-hair

### `hair/high_ponytail/adult/bg` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,ElizaWy,bluecarrot16
* Licences: OGA-BY 3.0
* Sources: https://opengameart.org/content/lpc-hair, https://opengameart.org/content/lpc-expanded-hair

### `hair/long_tied/adult/fg` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,thecilekli,bluecarrot16
* Licences: CC0
* Sources: https://opengameart.org/content/lpc-long-tied-hair-with-12-colors, https://opengameart.org/content/lpc-hair, https://opengameart.org/content/lpc-expanded-hair

### `hair/long_tied/adult/bg` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,thecilekli,bluecarrot16
* Licences: CC0
* Sources: https://opengameart.org/content/lpc-long-tied-hair-with-12-colors, https://opengameart.org/content/lpc-hair, https://opengameart.org/content/lpc-expanded-hair

### `hair/ponytail/adult/fg` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Manuel Riecke (MrBeast)
* Licences: CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-expanded-hair

### `hair/ponytail/adult/bg` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Manuel Riecke (MrBeast)
* Licences: CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-expanded-hair

### `hair/shoulderl/adult/fg` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Lanea Zimmerman (Sharm),Manuel Riecke (MrBeast)
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://github.com/jrconway3/Universal-LPC-spritesheet/commit/c32ce8a7edd9fc7fe7daa62a39cf64e5946020a2, https://opengameart.org/content/lpc-expanded-hair

### `hair/shoulderl/adult/bg` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Lanea Zimmerman (Sharm),Manuel Riecke (MrBeast)
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://github.com/jrconway3/Universal-LPC-spritesheet/commit/c32ce8a7edd9fc7fe7daa62a39cf64e5946020a2, https://opengameart.org/content/lpc-expanded-hair

### `hair/bangslong/adult` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Manuel Riecke (MrBeast)
* Licences: CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/lpc-medieval-fantasy-character-sprites, https://opengameart.org/content/lpc-expanded-hair

### `hair/long_straight/adult` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,thecilekli,bluecarrot16
* Licences: CC0
* Sources: https://opengameart.org/content/lpc-long-straight-hair-with-12-colors, https://opengameart.org/content/lpc-hair, https://opengameart.org/content/lpc-expanded-hair

### `hair/loose/adult` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Manuel Riecke (MrBeast)
* Licences: CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-expanded-hair

### `hair/wavy/child` (spellcast, walk, hurt)
* Authors: Nila122
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 2.0,GPL 3.0
* Sources: https://opengameart.org/content/3-hairs-for-lpc

### `hair/wavy/adult/fg` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Nila122
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 2.0,GPL 3.0
* Sources: https://opengameart.org/content/3-hairs-for-lpc, https://opengameart.org/content/lpc-expanded-hair

### `hair/wavy/adult/bg` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Nila122
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 2.0,GPL 3.0
* Sources: https://opengameart.org/content/3-hairs-for-lpc, https://opengameart.org/content/lpc-expanded-hair

### `hair/princess/adult/fg` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Lanea Zimmerman (Sharm)
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-expanded-hair

### `hair/princess/adult/bg` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Lanea Zimmerman (Sharm)
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-expanded-hair

### `hair/xlong_wavy/adult/fg` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Nila122
* Licences: OGA-BY 3.0
* Notes: Custom by JaidynReiman; inspiration for spellcast frames from Nila122's XLong
* Sources: https://opengameart.org/content/lpc-expanded-xlong-hair

### `hair/xlong_wavy/adult/bg` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Nila122
* Licences: OGA-BY 3.0
* Notes: Custom by JaidynReiman; inspiration for spellcast frames from Nila122's XLong
* Sources: https://opengameart.org/content/lpc-expanded-xlong-hair

### `hat/cloth/hijab/thin` (spellcast, walk, hurt, idle, sit)
* Authors: thecilekli
* Licences: CC0
* Sources: https://opengameart.org/content/lpc-hijab, https://opengameart.org/content/lpc-expanded-hats-facial-helmets

### `hat/pirate/bonnie/trim/adult` (spellcast, walk, hurt, idle, sit)
* Authors: bluecarrot16,JaidynReiman
* Licences: OGA-BY 3.0
* Notes: Bonnie Hat by Bluecarrot16, layers and added animations by JaidynReiman
* Sources: https://opengameart.org/content/lpc-pirates, https://opengameart.org/content/lpc-expanded-hats-facial-helmets

### `hat/pirate/bonnie/adult` (spellcast, walk, hurt, idle, sit)
* Authors: bluecarrot16,JaidynReiman
* Licences: OGA-BY 3.0
* Notes: Bonnie Hat by Bluecarrot16, layers and added animations by JaidynReiman
* Sources: https://opengameart.org/content/lpc-pirates, https://opengameart.org/content/lpc-expanded-hats-facial-helmets

### `hat/formal/bowler/adult` (spellcast, walk, hurt, idle, sit)
* Authors: bluecarrot16
* Licences: CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/lpc-gentleman, https://opengameart.org/content/lpc-expanded-hats-facial-helmets

### `hat/formal/tiara/adult` (spellcast, walk, hurt, idle, sit)
* Authors: Luke Mehl
* Licences: CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/female-mage-clothing-set, https://opengameart.org/content/lpc-expanded-hats-facial-helmets

### `hat/formal/tophat/adult` (spellcast, walk, hurt, idle, sit)
* Authors: bluecarrot16
* Licences: CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/lpc-gentleman, https://opengameart.org/content/lpc-expanded-hats-facial-helmets

### `facial/glasses/halfmoon/adult` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy
* Licences: OGA-BY 3.0
* Sources: https://github.com/ElizaWy/LPC/tree/main/Characters/Head%20Accessories, https://opengameart.org/content/lpc-expanded-sit-run-jump-more

### `facial/glasses/round/adult` (spellcast, walk, hurt, idle, sit)
* Authors: bluecarrot16,Thane Brimhall (pennomi),laetissima
* Licences: CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/clothing-facial-features-and-ui-elements, https://opengameart.org/content/lpc-gentleman

### `facial/glasses/secretary/adult` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Thane Brimhall (pennomi),laetissima
* Licences: CC-BY-SA 3.0,GPL 3.0
* Notes: Original by Pennomi, repositioning and recolors by JaidynReiman.
* Sources: https://opengameart.org/content/lpc-base-character-expressions

### `facial/glasses/sunglasses/adult` (spellcast, walk, hurt, idle, sit)
* Authors: Michael Whitlock (bigbeargames),Thane Brimhall (pennomi),laetissima
* Licences: CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/lpc-base-character-expressions, https://opengameart.org/content/lpc-expanded-hats-facial-helmets

### `facial/glasses/glasses/adult` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy
* Licences: OGA-BY 3.0
* Sources: https://github.com/ElizaWy/LPC/tree/main/Characters/Head%20Accessories, https://opengameart.org/content/lpc-expanded-sit-run-jump-more

### `neck/tie/bowtie/adult` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,bluecarrot16,Thane Brimhall (pennomi),laetissima,Makrohn
* Licences: CC-BY-SA 3.0,GPL 3.0
* Notes: Originally by pennomi/laetissima/Makrohn, edited by bluecarrot16, recolors by JaidynReiman
* Sources: https://opengameart.org/content/lpc-2-characters, https://opengameart.org/content/lpc-gentleman

### `neck/necklace/simple/female` (spellcast, walk, hurt, idle)
* Authors: bluecarrot16
* Licences: CC0
* Sources: https://opengameart.org/content/lpc-jewelry

### `neck/tie/necktie/male` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,bluecarrot16,Thane Brimhall (pennomi),laetissima,Makrohn
* Licences: CC-BY-SA 3.0,GPL 3.0
* Notes: Originally by pennomi/laetissima/Makrohn, edited by bluecarrot16, animations and recolors by JaidynReiman
* Sources: https://opengameart.org/content/lpc-2-characters, https://opengameart.org/content/lpc-gentleman

### `dress/bodice/female` (spellcast, walk, hurt, idle)
* Authors: bluecarrot16,Matthew Krohn (makrohn),Lanea Zimmerman (Sharm)
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Notes: original princess.xcf by Sharm, extended to all poses by makrohn, edited to v3 bases and animation cleanup by bluecarrot16
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-dress-in-combat-poses, http://opengameart.org/content/lpc-clothing-updates

### `dress/sash/female` (spellcast, walk, hurt, idle)
* Authors: bluecarrot16,Thane Brimhall (pennomi),laetissima,Matthew Krohn (makrohn)
* Licences: CC-BY-SA 3.0,GPL 3.0
* Notes: adapted to v3 bases and recolored by bluecarrot16
* Sources: https://opengameart.org/content/lpc-2-characters

### `dress/slit/female` (spellcast, walk, hurt, idle)
* Authors: Nila122,ElizaWy,bluecarrot16
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 2.0,GPL 3.0
* Notes: original **TightDress** by Nila122, by ElizaWy, extended to all animation frames and edited for v3 bases by bluecarrot16
* Sources: https://opengameart.org/content/lpc-clothes-and-hair, http://opengameart.org/content/lpc-clothing-updates

### `torso/clothes/blouse_longsleeve/female` (spellcast, walk, hurt)
* Authors: bluecarrot16,ElizaWy,Lanea Zimmerman (Sharm)
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Notes: original princess.xcf by Sharm, edited to blouse by ElizaWy; blouse + longsleeve adapted to v3 bases by bluecarrot16
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-7-womens-shirts

### `torso/clothes/blouse/female` (spellcast, walk, hurt)
* Authors: bluecarrot16,ElizaWy,Lanea Zimmerman (Sharm)
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Notes: original princess.xcf by Sharm, edited to blouse by ElizaWy; adapted to v3 bases by bluecarrot16
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-7-womens-shirts

### `torso/clothes/shirt/child` (walk)
* Authors: Nila122
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/lpc-clothes-for-children

### `torso/clothes/corset/female` (spellcast, walk, hurt)
* Authors: ElizaWy,Nila122
* Licences: OGA-SA 3.0,CC-BY-SA 3.0,GPL 3.0
* Notes: original by Nila122, recolored by ElizaWy
* Sources: https://opengameart.org/content/lpc-clothes-and-hair, https://opengameart.org/content/lpc-7-womens-shirts

### `torso/clothes/robe/female` (spellcast, walk, hurt)
* Authors: Luke Mehl
* Licences: CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/female-mage-clothing-set

### `torso/clothes/longsleeve/formal/male` (spellcast, walk, hurt)
* Authors: bluecarrot16,Thane Brimhall (pennomi),laetissima,Stephen Challener (Redshrike),Johannes Sjölund (wulax)
* Licences: CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/lpc-medieval-fantasy-character-sprites, https://opengameart.org/content/lpc-2-characters, https://opengameart.org/content/lpc-gentleman

### `torso/clothes/longsleeve/longsleeve2_buttoned/male` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy,JaidynReiman,Stephen Challener (Redshrike),Johannes Sjölund (wulax)
* Licences: OGA-BY 3.0
* Notes: original by ElizaWy; spellcast/thrust/shoot/hurt/male adapted from original by JaidynReiman
* Sources: http://opengameart.org/content/lpc-revised-character-basics, https://github.com/ElizaWy/LPC/tree/main/Characters/Clothing, https://opengameart.org/content/lpc-expanded-sit-run-jump-more, https://opengameart.org/content/lpc-expanded-simple-shirts

### `torso/clothes/longsleeve/longsleeve2_cardigan/female` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy,JaidynReiman,Stephen Challener (Redshrike),Johannes Sjölund (wulax)
* Licences: OGA-BY 3.0
* Notes: original by ElizaWy; spellcast/thrust/shoot/hurt/male adapted from original by JaidynReiman
* Sources: http://opengameart.org/content/lpc-revised-character-basics, https://github.com/ElizaWy/LPC/tree/main/Characters/Clothing, https://opengameart.org/content/lpc-expanded-sit-run-jump-more, https://opengameart.org/content/lpc-expanded-simple-shirts

### `torso/clothes/longsleeve/longsleeve2/male` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy,JaidynReiman,Stephen Challener (Redshrike),Johannes Sjölund (wulax)
* Licences: OGA-BY 3.0
* Notes: original by ElizaWy; spellcast/thrust/shoot/hurt/male adapted from original by JaidynReiman
* Sources: https://opengameart.org/content/lpc-revised-character-basics, https://github.com/ElizaWy/LPC/tree/main/Characters/Clothing, https://opengameart.org/content/lpc-expanded-sit-run-jump-more, https://opengameart.org/content/lpc-expanded-simple-shirts

### `torso/clothes/longsleeve/longsleeve2/female` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy,JaidynReiman,Stephen Challener (Redshrike),Johannes Sjölund (wulax)
* Licences: OGA-BY 3.0
* Notes: original by ElizaWy; spellcast/thrust/shoot/hurt/male adapted from original by JaidynReiman
* Sources: https://opengameart.org/content/lpc-revised-character-basics, https://github.com/ElizaWy/LPC/tree/main/Characters/Clothing, https://opengameart.org/content/lpc-expanded-sit-run-jump-more, https://opengameart.org/content/lpc-expanded-simple-shirts

### `torso/clothes/shortsleeve/tshirt_vneck/male` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy,JaidynReiman,Stephen Challener (Redshrike),Johannes Sjölund (wulax)
* Licences: OGA-BY 3.0
* Notes: original by ElizaWy; spellcast/thrust/shoot/hurt/male adapted from original by JaidynReiman
* Sources: https://opengameart.org/content/lpc-revised-character-basics, https://github.com/ElizaWy/LPC/tree/main/Characters/Clothing, https://opengameart.org/content/lpc-expanded-sit-run-jump-more, https://opengameart.org/content/lpc-expanded-simple-shirts

### `torso/clothes/shortsleeve/tshirt_vneck/female` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy,JaidynReiman,Stephen Challener (Redshrike),Johannes Sjölund (wulax)
* Licences: OGA-BY 3.0
* Notes: original by ElizaWy; spellcast/thrust/shoot/hurt/male adapted from original by JaidynReiman
* Sources: https://opengameart.org/content/lpc-revised-character-basics, https://github.com/ElizaWy/LPC/tree/main/Characters/Clothing, https://opengameart.org/content/lpc-expanded-sit-run-jump-more, https://opengameart.org/content/lpc-expanded-simple-shirts

### `torso/clothes/sleeveless/sleeveless2_scoop/female` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy,JaidynReiman,Stephen Challener (Redshrike),Johannes Sjölund (wulax)
* Licences: OGA-BY 3.0
* Notes: original by ElizaWy; sleeveless adapted from original by JaidynReiman
* Sources: http://opengameart.org/content/lpc-revised-character-basics, https://github.com/ElizaWy/LPC/tree/main/Characters/Clothing, https://opengameart.org/content/lpc-expanded-sit-run-jump-more, https://opengameart.org/content/lpc-expanded-simple-shirts

### `torso/clothes/sleeveless/sleeveless2/male` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy,JaidynReiman,Stephen Challener (Redshrike),Johannes Sjölund (wulax)
* Licences: OGA-BY 3.0
* Notes: original by ElizaWy; sleeveless adapted from original by JaidynReiman
* Sources: http://opengameart.org/content/lpc-revised-character-basics, https://github.com/ElizaWy/LPC/tree/main/Characters/Clothing, https://opengameart.org/content/lpc-expanded-sit-run-jump-more, https://opengameart.org/content/lpc-expanded-simple-shirts

### `torso/clothes/sleeveless/sleeveless2/female` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy,JaidynReiman,Stephen Challener (Redshrike),Johannes Sjölund (wulax)
* Licences: OGA-BY 3.0
* Notes: original by ElizaWy; sleeveless adapted from original by JaidynReiman
* Sources: http://opengameart.org/content/lpc-revised-character-basics, https://github.com/ElizaWy/LPC/tree/main/Characters/Clothing, https://opengameart.org/content/lpc-expanded-sit-run-jump-more, https://opengameart.org/content/lpc-expanded-simple-shirts

### `torso/aprons/apron/male` (spellcast, walk, hurt)
* Authors: Nila122
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 2.0,GPL 3.0
* Sources: https://opengameart.org/content/lpc-aprons

### `torso/aprons/apron/female` (spellcast, walk, hurt)
* Authors: Nila122
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 2.0,GPL 3.0
* Sources: https://opengameart.org/content/lpc-aprons

### `torso/aprons/overalls/male` (spellcast, walk, hurt, idle, sit)
* Authors: ElizaWy,bluecarrot16,JaidynReiman
* Licences: OGA-BY 3.0,GPL 3.0
* Notes: original overalls by ElizaWy, extended to all animation frames, adapted from teen to male base, and edited for v3 bases by bluecarrot16; extended to combat animations by JaidynReiman
* Sources: https://opengameart.org/content/lpc-revised-character-basics, http://opengameart.org/content/lpc-clothing-updates

### `torso/jacket/collared/male` (spellcast, walk, hurt)
* Authors: bluecarrot16
* Licences: CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/lpc-gentleman, https://opengameart.org/content/lpc-pirates

### `torso/jacket/frock/male` (spellcast, walk, hurt)
* Authors: bluecarrot16
* Licences: CC-BY-SA 3.0
* Sources: https://opengameart.org/content/lpc-pirates

### `torso/jacket/trench/male` (spellcast, walk, hurt)
* Authors: bluecarrot16
* Licences: CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/lpc-gentleman

### `torso/clothes/vest_open/male` (spellcast, walk, hurt, idle)
* Authors: bluecarrot16,Thane Brimhall (pennomi),laetissima
* Licences: CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/lpc-2-characters, https://opengameart.org/content/lpc-gentleman, https://opengameart.org/content/lpc-pirates

### `torso/clothes/vest/male` (spellcast, walk, hurt, idle)
* Authors: bluecarrot16,Thane Brimhall (pennomi),laetissima,Stephen Challener (Redshrike),Johannes Sjölund (wulax)
* Licences: CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/lpc-2-characters, https://opengameart.org/content/lpc-gentleman, https://opengameart.org/content/lpc-pirates

### `legs/pants/child` (walk)
* Authors: Nila122
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/lpc-clothes-for-children

### `legs/formal_striped/male` (spellcast, walk, hurt, idle, sit)
* Authors: bluecarrot16,JaidynReiman,ElizaWy,Johannes Sjölund (wulax),Stephen Challener (Redshrike)
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Notes: Original pants by Stephen Challener (Redshrike), thrust/shoot bases by Wulax, Striped Formal Pants by Bluecarrot16, climb/jump/run/sit/emotes/revised combat by JaidynReiman
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-medieval-fantasy-character-sprites, https://opengameart.org/content/lpc-2-characters, https://opengameart.org/content/lpc-gentleman, https://opengameart.org/content/lpc-expanded-pants

### `legs/formal/male` (spellcast, walk, hurt, idle, sit)
* Authors: bluecarrot16,JaidynReiman,ElizaWy,Johannes Sjölund (wulax),Stephen Challener (Redshrike)
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Notes: Original pants by Stephen Challener (Redshrike), thrust/shoot bases by Wulax, Formal Pants by Bluecarrot16, climb/jump/run/sit/emotes/revised combat by JaidynReiman
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-medieval-fantasy-character-sprites, https://opengameart.org/content/lpc-2-characters, https://opengameart.org/content/lpc-gentleman, https://opengameart.org/content/lpc-expanded-pants

### `legs/formal/thin` (spellcast, walk, hurt, idle, sit)
* Authors: bluecarrot16,JaidynReiman,ElizaWy,Johannes Sjölund (wulax),Stephen Challener (Redshrike)
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Notes: Original pants by Stephen Challener (Redshrike), thrust/shoot bases by Wulax, Formal Pants by Bluecarrot16, Female/Thin version by JaidynReiman
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-medieval-fantasy-character-sprites, https://opengameart.org/content/lpc-2-characters, https://opengameart.org/content/lpc-gentleman, https://opengameart.org/content/lpc-expanded-pants

### `legs/pants/male` (spellcast, walk, hurt, idle, sit)
* Authors: bluecarrot16,JaidynReiman,ElizaWy,Matthew Krohn (makrohn),Johannes Sjölund (wulax),Stephen Challener (Redshrike)
* Licences: OGA-BY 3.0,GPL 3.0,CC-BY-SA 3.0
* Notes: original male pants by wulax, recolors and edits to v3 base by bluecarrot16, climb/jump/run/sit/emotes/revised combat by JaidynReiman based on ElizaWy's LPC Revised
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-medieval-fantasy-character-sprites, https://opengameart.org/content/lpc-expanded-pants

### `legs/pants/thin` (spellcast, walk, hurt, idle, sit)
* Authors: bluecarrot16,JaidynReiman,ElizaWy,Joe White,Matthew Krohn (makrohn),Johannes Sjölund (wulax),Stephen Challener (Redshrike)
* Licences: OGA-BY 3.0,GPL 3.0,CC-BY-SA 3.0
* Notes: original male pants by wulax, edited for female by Joe White, recolors and edits to v3 base by bluecarrot16, teen legs by ElizaWy derived from base, climb/jump/run/sit/emotes/revised combat by JaidynReiman based on ElizaWy's LPC Revised
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-medieval-fantasy-character-sprites, http://opengameart.org/content/lpc-clothing-updates, https://opengameart.org/content/lpc-expanded-pants

### `legs/skirts/child` (walk)
* Authors: Nila122
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Sources: https://opengameart.org/content/lpc-clothes-for-children

### `legs/skirts/belle/thin` (spellcast, walk, hurt, idle)
* Authors: bluecarrot16,Matthew Krohn (makrohn),Lanea Zimmerman (Sharm)
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Notes: extended to all poses by makrohn, edited to v3 bases and animation cleanup by bluecarrot16
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-dress-in-combat-poses, http://opengameart.org/content/lpc-clothing-updates

### `legs/skirts/overskirt/thin` (spellcast, walk, hurt, idle)
* Authors: bluecarrot16,Matthew Krohn (makrohn),Lanea Zimmerman (Sharm)
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Notes: original princess.xcf by Sharm, extended to all poses by makrohn, edited to v3 bases and animation cleanup by bluecarrot16
* Sources: https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles, https://opengameart.org/content/lpc-dress-in-combat-poses, http://opengameart.org/content/lpc-clothing-updates

### `legs/skirts/straight/thin` (spellcast, walk, hurt, idle)
* Authors: bluecarrot16,ElizaWy
* Licences: OGA-BY 3.0,GPL 3.0
* Notes: original skirt by ElizaWy, extended to all animation frames and edited for v3 bases by bluecarrot16
* Sources: http://opengameart.org/content/lpc-clothing-updates

### `legs/skirts/plain/thin` (spellcast, walk, hurt, idle, sit)
* Authors: bluecarrot16,Pierre Vigier (pvigier),Johannes Sjölund (wulax),Ahmad3366,JaidynReiman
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Notes: original by wulax, edited for female base by pvigier, edited for v3 base by bluecarrot16, idle & sit by Ahmad3366, color reduced & female sit/emote by JaidynReiman
* Sources: https://opengameart.org/content/lpc-medieval-fantasy-character-sprites

### `legs/skirts/slit/thin` (spellcast, walk, hurt, idle)
* Authors: Nila122,ElizaWy,bluecarrot16
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 2.0,GPL 3.0
* Notes: original **TightDress** by Nila122, edited to skirt by ElizaWy, extended to all animation frames and edited for v3 bases by bluecarrot16
* Sources: https://opengameart.org/content/lpc-clothes-and-hair, http://opengameart.org/content/lpc-clothing-updates

### `feet/shoes/basic/male` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,bluecarrot16,Johannes Sjölund (wulax)
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Notes: original by wulax, edited for v3 base by bluecarrot16, Jump/Sit/Emote/Run/Revised Combat by JaidynReiman
* Sources: https://opengameart.org/content/lpc-medieval-fantasy-character-sprites, http://opengameart.org/content/lpc-clothing-updates, https://opengameart.org/content/lpc-expanded-socks-shoes

### `feet/shoes/basic/thin` (spellcast, walk, hurt, idle, sit)
* Authors: JaidynReiman,Joe White,Johannes Sjölund (wulax)
* Licences: OGA-BY 3.0,CC-BY-SA 3.0,GPL 3.0
* Notes: original by wulax, edited for female base by Joe White, edited for v3 base by bluecarrot16, Jump/Sit/Emote/Run/Revised Combat by JaidynReiman
* Sources: https://opengameart.org/content/lpc-medieval-fantasy-character-sprites, http://opengameart.org/content/lpc-clothing-updates, https://opengameart.org/content/lpc-expanded-socks-shoes

## All LPC authors (for a short credits screen)

??, Ahmad3366, Benjamin K. Smith (BenCreating), bluecarrot16, Carlo Enrico Victoria (Nemisys), dalonedrau, drjamgo@hotmail.com, Durrani, Eliza Wyatt (ElizaWy), ElizaWy, Evert, JaidynReiman, Joe White, Johannes Sjölund (wulax), kcilds/Rocetti/Eredah, kheftel, laetissima, Lanea Zimmerman (Sharm), Luke Mehl, Makrohn, Mandi Paugh, Manuel Riecke (MrBeast), Matthew Krohn (makrohn), Michael Whitlock (bigbeargames), MuffinElZangano, Nila122, Page, Pierre Vigier (pvigier), Sander Frenken (castelonia), Skorpio, Stephen Challener (Redshrike), Thane Brimhall (pennomi), thecilekli, TheraHedwig
