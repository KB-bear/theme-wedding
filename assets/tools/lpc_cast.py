"""Define the Theme Wedding cast and write lpc_characters.json (input of lpc_compose.py).

Usage:  python -E -P lpc_cast.py            -> writes lpc_characters.json next to this script

Groups (also written as "groups" into the json; lpc_index.py turns them into CHAR_INDEX.pools):
    named  - story characters (bride, groom, family, guests with roles)
    staff  - venue staff
    legacy - the first 16 test characters kept for compatibility (some double as named ones)
    pool m / f / om / of / kb / kg - interchangeable guests (adult men / women, older men / women,
                                     boys / girls)
Colours: cloth ramps from the ULPC palette + tools/lpc_palettes_custom.json.
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
CHARS, GROUPS = [], {}


def add(group, name, body, skin, eyes, layers):
    CHARS.append({"name": name, "body": body, "skin": skin, "eyes": eyes, "layers": layers})
    GROUPS.setdefault(group, []).append(name)


def hair_layers(hair, col, beard=None, brows=True):
    out = [["eyebrows", col]] if brows else []
    if isinstance(hair, str):
        hair = [hair]
    for h in hair or []:
        out.append([h, col])
    for b in ([beard] if isinstance(beard, str) else beard or []):
        out.append([b, col])
    return out


def suited(group, name, skin, eyes, hair, haircol, suit, *, pants=None, shirt="white", vest=None,
           tie=("necktie", "red"), jacket="jacket_collared", shoes="black", head="head_male",
           beard=None, beardcol=None, old=False, extra=(), pants_layer="pants_formal", face=None):
    L = [["shadow"], ["body"], ["shoes", shoes], [pants_layer, pants or suit] if pants_layer != "pants_striped" else ["pants_striped"]]
    if shirt:
        L.append(["shirt_formal", shirt])
    if vest:
        L.append(["vest", vest])
    if jacket:
        L.append([jacket, suit] if jacket != "jacket_trench" else [jacket])
    if tie:
        L.append(list(tie))
    L.append([head] if not face else [head, face])
    if old:
        L.append(["wrinkles"] if not face else ["wrinkles", face])
    L += hair_layers(hair, haircol)
    if beard:
        L += [[b, beardcol or haircol] for b in ([beard] if isinstance(beard, str) else beard)]
    L += [list(e) for e in extra]
    add(group, name, "male", skin, eyes, L)


def dressed(group, name, skin, eyes, hair, haircol, outfit, *, shoes="black", head="head_female",
            old=False, extra=()):
    """outfit: list of [layer, colour] (dress / top + skirt ...)."""
    L = [["shadow"], ["body"], ["shoes", shoes]] + [list(o) for o in outfit]
    L.append([head])
    if old:
        L.append(["wrinkles"])
    L += hair_layers(hair, haircol)
    L += [list(e) for e in extra]
    add(group, name, "female", skin, eyes, L)


def kid(group, name, skin, eyes, hair, haircol, shirt, bottom, bottomcol, shoes="black"):
    L = [["shadow"], ["body"], [bottom, bottomcol], ["shirt_child", shirt], ["head_child"],
         ["eyebrows", haircol], [hair, haircol]]
    add(group, name, "child", skin, eyes, L)
    CHARS[-1]["child_shoes"] = shoes  # painted onto the bare LPC child feet by lpc_compose.py


def hat(kind, col, band):
    return [("sunhat", col), ("sunhat_band", band)] if kind == "sunhat" else [(kind,)]


# =================================================================== legacy 16 (unchanged looks)
suited("legacy", "groom", "light", "green", "hair_parted2", "orange", "suit_green", vest="beige", tie=("necktie", "emerald"), beard="beard_trimmed")
suited("legacy", "groom_frock", "light", "green", "hair_parted2", "orange", "suit_green", vest="beige", tie=("necktie", "emerald"), jacket="jacket_frock", beard="beard_trimmed")
dressed("legacy", "bride", "light", "brown", "hair_lob", "dark_brown", [("skirt_belle", "ivory"), ("dress_slit", "ivory")], shoes="pink", extra=[("tiara",)])
dressed("legacy", "bride_updo", "light", "brown", ["hair_bangs_bun", "hair_high_bun"], "dark_brown", [("skirt_belle", "ivory"), ("dress_slit", "ivory")], shoes="pink")
dressed("legacy", "guest_woman_blue", "amber", "blue", "hair_bob", "blonde", [("dress_slit", "dusty_blue")], shoes="navy")
dressed("legacy", "guest_woman_red", "brown", "brown", "hair_ponytail", "black", [("skirt_straight", "maroon"), ("shirt_longsleeve", "red")])
suited("legacy", "guest_man_navy", "olive", "brown", "hair_plain", "chestnut", "navy", shirt="sky", shoes="brown")
suited("legacy", "grandpa", "light", "gray", "hair_balding", "white", "gray", pants="charcoal", tie=("necktie", "maroon"),
       head="head_male_elderly", old=True, beard="mustache", shoes="brown")
dressed("legacy", "grandma", "light", "blue", ["hair_bangs_bun", "hair_high_bun"], "gray", [("skirt_plain", "lilac"), ("blouse_longsleeve", "lavender")],
        head="head_female_elderly", old=True)
kid("legacy", "kid_boy", "light", "blue", "hair_child_side", "blonde", "sky", "pants_child", "navy")
kid("legacy", "kid_girl", "bronze", "brown", "hair_child_wavy", "dark_brown", "white", "skirt_child", "pink", shoes="pink")
# staff (re-checked: white shirt + black waistcoat + bow tie; bartender in white shirt, black waistcoat-apron)
suited("staff", "waiter", "taupe", "brown", "hair_plain", "black", "black", vest="black", tie=("bowtie", "black"), jacket=None)
dressed("staff", "bartender", "light", "green", "hair_ponytail", "red", [("pants", "black"), ("shirt_longsleeve", "white"), ("apron", "black")],
        extra=[("bowtie", "black")])
add("staff", "cleaner", "male", "bronze", "brown", [["shadow"], ["body"], ["shoes", "brown"], ["pants", "gray"], ["tshirt_vneck", "gray"],
                                                    ["overalls", "teal"], ["head_male"], ["eyebrows", "dark_gray"], ["hair_curly_short", "dark_gray"]])
suited("staff", "bouncer", "brown", "brown", "hair_buzzcut", "black", "jet", shirt="jet", tie=("necktie", "jet"), head="head_male_plump",
       extra=[("sunglasses",)], beard="stubble")
add("staff", "dj", "male", "black", "brown", [["shadow"], ["body"], ["shoes", "white"], ["pants", "charcoal"], ["tshirt_vneck", "purple"],
                                              ["head_male"], ["hair_afro", "black"], ["sunglasses"]])

# =================================================================== named characters
suited("named", "bestman", "olive", "brown", "hair_swoop", "dark_brown", "navy", vest="silver_grey", tie=("necktie", "suit_green"))
dressed("named", "moh", "light", "blue", "hair_half_up", "chestnut", [("dress_slit", "dark_pink")], shoes="dark_pink",
        extra=[("necklace_silver",)])
# the influencer (id kept as "jess" so the game finds the sheet): a lad in a pink tee, bleached swoop and shades
add("named", "jess", "male", "light", "blue", [["shadow"], ["body"], ["shoes", "white"], ["pants", "charcoal"], ["tshirt_vneck", "hot_pink"],
                                               ["head_male"]] + hair_layers("hair_swoop", "platinum", beard="stubble") + [["sunglasses"]])
suited("named", "bestman2", "light", "blue", "hair_parted", "light_brown", "navy", vest="silver_grey", tie=("necktie", "suit_green"),
       beard="stubble")
dressed("named", "bridesmaid1", "light", "blue", "hair_half_up", "chestnut", [("dress_slit", "dark_pink")], shoes="dark_pink",
        extra=[("necklace_silver",)])
dressed("named", "bridesmaid2", "light", "green", "hair_long_straight", "blonde", [("dress_slit", "dark_pink")], shoes="dark_pink",
        extra=[("necklace_silver",)])
dressed("named", "bridesmaid3", "light", "brown", "hair_high_ponytail", "dark_brown", [("dress_slit", "dark_pink")], shoes="dark_pink",
        extra=[("necklace_silver",)])
suited("named", "fob", "light", "blue", "hair_parted2", "gray", "charcoal", tie=("necktie", "maroon"), head="head_male_elderly",
       old=True, shoes="black")
dressed("named", "mob", "light", "blue", "hair_bob_side", "light_brown", [("dress_sash", "plum")], head="head_female_elderly", old=True,
        extra=hat("sunhat", "plum", "cream") + [("necklace_gold",)])
dressed("named", "gmum", "light", "green", "hair_lob", "sandy", [("dress_slit", "emerald")], head="head_female_elderly", old=True,
        extra=hat("sunhat", "cream", "emerald"))
suited("named", "gdad", "light", "green", "hair_parted", "ginger_grey", "silver_grey", vest="silver_grey", tie=("necktie", "suit_green"),
       head="head_male_elderly", old=True, beard="mustache", shoes="brown")
suited("named", "gerald", "light", "blue", "hair_balding", "gray", "tweed", vest="mustard", tie=("necktie", "burgundy"),
       head="head_male_plump", face="ruddy", old=True, beard="walrus", shoes="brown")
dressed("named", "gran", "light", "blue", ["hair_bangs_bun", "hair_high_bun"], "white", [("dress_slit", "lilac"), ("cardigan", "lavender")],
        head="head_female_elderly", old=True, extra=[("glasses_half",)])
dressed("named", "babushka", "light", "gray", None, "gray", [("skirt_belle", "navy"), ("blouse_longsleeve", "navy")],
        head="head_female_elderly", old=True, extra=[("headscarf", "red")])
suited("named", "dmitri", "light", "blue", "hair_buzzcut", "dark_brown", "jet", tie=("necktie", "maroon"), head="head_male_plump",
       beard="beard_medium")
suited("named", "kyle", "amber", "blue", "hair_bedhead", "light_brown", "gray", jacket=None, vest="slate", tie=("necktie", "red"),
       pants="slate", shoes="brown", beard="stubble")
kid("named", "flowergirl", "light", "blue", "hair_child_wavy", "blonde", "white", "skirt_child", "white", shoes="white")
kid("named", "pageboy", "light", "green", "hair_child_side2", "orange", "suit_green", "pants_child", "suit_green", shoes="brown")
dressed("named", "registrar", "light", "brown", "hair_bob", "dark_brown", [("robe", None)],
        extra=[("glasses",)])
suited("named", "magician", "light", "brown", "hair_plain", "black", "jet", vest="jet", tie=("necktie", "red"), jacket="jacket_frock",
       beard="mustache", extra=[("tophat",)])
suited("named", "celebchef", "bronze", "brown", "hair_spiked", "platinum", "white", shirt="jet", tie=None, shoes="white",
       extra=[("sunglasses",)], beard="stubble", beardcol="dark_brown")
dressed("named", "hen1", "light", "blue", "hair_high_ponytail", "blonde", [("dress_slit", "hot_pink")], shoes="hot_pink",
        extra=[("tiara",)])
dressed("named", "hen2", "brown", "brown", "hair_curly_long", "black", [("skirt_slit", "hot_pink"), ("top_scoop", "hot_pink")],
        shoes="white", extra=[("necklace_silver",)])
dressed("named", "rival1", "light", "gray", "hair_long_straight", "raven", [("dress_slit", "lilac")], shoes="purple",
        extra=[("necklace_silver",)])
suited("named", "rival2", "olive", "brown", "hair_parted2", "black", "plum", vest="lilac", tie=("bowtie", "lilac"))
dressed("named", "rival3", "amber", "blue", "hair_xlong_wavy", "platinum", [("skirt_belle", "lilac"), ("corset", "purple")],
        shoes="purple", extra=hat("sunhat", "lilac", "plum"))
dressed("named", "planner", "light", "brown", ["hair_bangs_bun", "hair_high_bun"], "chestnut",
        [("skirt_straight", "hot_pink"), ("shirt_longsleeve", "hot_pink")], shoes="black", extra=[("glasses_cat_red",)])

# =================================================================== guest pool
M = [  # skin, eyes, hair, haircol, suit, kw
    ("light", "blue", "hair_parted", "blonde", "navy", dict(tie=("necktie", "red"))),
    ("brown", "brown", "hair_buzzcut", "black", "charcoal", dict(vest="burgundy", tie=("bowtie", "burgundy"), beard="beard_trimmed")),
    ("light", "green", "hair_curtains", "ginger", "silver_grey", dict(shirt="sky", tie=("necktie", "navy"), beard="stubble")),
    ("olive", "brown", "hair_swoop", "dark_brown", "tan", dict(tie=("necktie", "deep_teal"), shoes="brown")),
    ("black", "brown", "hair_natural", "black", "burgundy", dict(tie=("bowtie", "jet"))),
    ("bronze", "brown", "hair_parted2", "black", "deep_teal", dict(tie=("necktie", "mustard"), beard="mustache")),
    ("light", "gray", "hair_messy", "light_brown", "navy", dict(vest="silver_grey", tie=("necktie", "rose"), beard="beard_medium")),
    ("taupe", "brown", "hair_plain", "raven", "jet", dict(tie=("bowtie", "jet"))),
    ("amber", "blue", "hair_spiked", "blonde", "royal", dict(tie=("necktie", "silver_grey"))),
    ("brown", "brown", "hair_cornrows", "black", "charcoal", dict(shirt="pink", vest="charcoal", tie=("necktie", "burgundy"))),
    ("light", "blue", None, "dark_brown", "charcoal", dict(tie=("necktie", "maroon"), beard="beard_medium")),
    ("olive", "green", "hair_bedhead", "chestnut", "navy", dict(jacket=None, vest="navy", tie=("necktie", "sky"))),
    ("black", "brown", "hair_twists_fade", "black", "gray", dict(tie=("bowtie", "rose"))),
    ("light", "blue", "hair_curly_short", "carrot", "tweed", dict(pants="charcoal", tie=("necktie", "forest"), shoes="brown",
                                                                extra=[("bowler_brown",)])),
    ("bronze", "brown", "hair_dreads", "black", "burgundy", dict(pants="jet", jacket="jacket_frock", tie=("bowtie", "jet"))),
    ("taupe", "brown", "hair_idol", "dark_brown", "charcoal", dict(jacket="jacket_frock", pants_layer="pants_striped", vest="silver_grey",
                                                                 tie=("necktie", "silver_grey"), extra=[("tophat_gray",)])),
]
for i, (skin, eyes, hair, hc, suit, kw) in enumerate(M, 1):
    suited("m", f"g_m_{i:02d}", skin, eyes, hair, hc, suit, **kw)
# extra light-skinned guests (names contain "_w"): sprites.js weights the pools towards these
MW = [
    ("light", "brown", "hair_plain", "dark_brown", "charcoal", dict(tie=("necktie", "burgundy"))),
    ("light", "blue", "hair_bedhead", "sandy", "tan", dict(jacket=None, vest="slate", tie=("necktie", "navy"))),
    ("light", "green", "hair_parted2", "light_brown", "royal", dict(tie=("necktie", "silver_grey"), beard="stubble")),
    ("light", "blue", "hair_swoop", "blonde", "forest", dict(tie=("necktie", "mustard"))),
    ("light", "brown", "hair_messy", "chestnut", "gray", dict(tie=("bowtie", "navy"))),
    ("light", "blue", "hair_buzzcut", "sandy", "charcoal", dict(tie=("necktie", "red"), beard="beard_trimmed")),
]
for i, (skin, eyes, hair, hc, suit, kw) in enumerate(MW, 1):
    suited("m", f"g_m_w{i:02d}", skin, eyes, hair, hc, suit, **kw)

F = [  # skin, eyes, hair, haircol, outfit, kw
    ("light", "blue", "hair_long_straight", "blonde", [("dress_slit", "red")], dict(shoes="red")),
    ("brown", "brown", "hair_curly_long", "black", [("dress_sash", "emerald")], dict(extra=[("necklace_gold",)])),
    ("amber", "green", "hair_bob_side", "chestnut", [("skirt_belle", "lemon"), ("blouse", "lemon")], dict(shoes="white")),
    ("black", "brown", "hair_natural", "black", [("dress_slit", "coral")], dict(shoes="white", extra=hat("sunhat", "coral", "cream"))),
    ("light", "green", "hair_half_up", "ginger", [("dress_sash", "deep_teal")], dict()),
    ("olive", "brown", "hair_wavy", "dark_brown", [("skirt_belle", "mustard"), ("corset", "mustard")], dict(extra=[("necklace_gold",)])),
    ("taupe", "brown", "hair_high_ponytail", "raven", [("skirt_slit", "jet"), ("top_scoop", "jet")], dict(extra=[("necklace_silver",)])),
    ("bronze", "brown", "hair_lob", "dark_brown", [("dress_slit", "lilac")], dict(shoes="purple", extra=hat("sunhat", "lilac", "plum"))),
    ("light", "blue", "hair_pixie", "platinum", [("skirt_straight", "royal"), ("blouse", "sky")], dict(shoes="navy")),
    ("brown", "brown", "hair_braid", "black", [("dress_sash", "royal")], dict(shoes="white")),
    ("light", "gray", "hair_xlong_wavy", "strawberry", [("dress_slit", "dusty_blue")], dict(shoes="navy", extra=[("necklace_silver",)])),
    ("amber", "blue", "hair_page", "light_brown", [("skirt_belle", "burgundy"), ("corset", "burgundy")], dict(extra=[("necklace_gold",)])),
    ("black", "brown", "hair_afro", "black", [("dress_sash", "mustard")], dict(shoes="white")),
    ("olive", "brown", "hair_shoulder", "black", [("skirt_belle", "mint"), ("top_scoop", "mint")], dict(shoes="white")),
    ("light", "blue", "hair_bangslong", "blonde", [("dress_slit", "sky")], dict(shoes="white", extra=hat("sunhat", "sky", "white"))),
    ("bronze", "green", "hair_curls_large", "dark_brown", [("skirt_straight", "emerald"), ("blouse", "white")], dict(extra=hat("sunhat", "cream", "emerald"))),
]
for i, (skin, eyes, hair, hc, outfit, kw) in enumerate(F, 1):
    dressed("f", f"g_f_{i:02d}", skin, eyes, hair, hc, outfit, **kw)
FW = [
    ("light", "blue", "hair_bob", "light_brown", [("dress_slit", "emerald")], dict(shoes="black")),
    ("light", "brown", "hair_loose", "dark_brown", [("dress_sash", "burgundy")], dict(extra=[("necklace_silver",)])),
    ("light", "green", "hair_ponytail", "blonde", [("skirt_belle", "dusty_blue"), ("blouse", "white")], dict(shoes="white")),
    ("light", "blue", "hair_wavy", "sandy", [("dress_slit", "plum")], dict()),
    ("light", "brown", "hair_shoulder", "chestnut", [("dress_sash", "coral")], dict(shoes="white")),
    ("light", "blue", "hair_curly_long", "carrot", [("dress_slit", "teal")], dict()),
]
for i, (skin, eyes, hair, hc, outfit, kw) in enumerate(FW, 1):
    dressed("f", f"g_f_w{i:02d}", skin, eyes, hair, hc, outfit, **kw)

OM = [
    ("light", "blue", "hair_balding", "white", "silver_grey", dict(tie=("necktie", "burgundy"), beard="mustache")),
    ("brown", "brown", "hair_buzzcut", "gray", "charcoal", dict(vest="charcoal", tie=("bowtie", "jet"), beard="beard_trimmed",
                                                               extra=[("glasses",)])),
    ("light", "gray", "hair_parted", "gray", "navy", dict(tie=("necktie", "forest"), extra=[("glasses_brown",)])),
    ("olive", "brown", None, "white", "tweed", dict(tie=("necktie", "mustard"), beard="walrus", shoes="brown", extra=[("bowler_gray",)])),
    ("taupe", "brown", "hair_swoop", "gray", "jet", dict(vest="silver_grey", tie=("bowtie", "burgundy"), beard="mustache_big")),
]
for i, (skin, eyes, hair, hc, suit, kw) in enumerate(OM, 1):
    suited("om", f"g_om_{i:02d}", skin, eyes, hair, hc, suit, head="head_male_elderly", old=True, **kw)

OF = [
    ("light", "blue", "hair_bob", "white", [("dress_sash", "navy")], dict(shoes="navy", extra=hat("sunhat", "navy", "white"))),
    ("brown", "brown", ["hair_bangs_bun", "hair_high_bun"], "gray", [("dress_slit", "mustard"), ("cardigan", "cream")], dict()),
    ("light", "green", "hair_curly_short", "platinum", [("skirt_straight", "teal"), ("blouse", "teal")], dict(extra=[("glasses_round",)])),
    ("olive", "brown", "hair_lob", "gray", [("dress_slit", "maroon")], dict(extra=[("necklace_gold",)])),
    ("light", "blue", "hair_pixie", "white", [("dress_sash", "sage")], dict(extra=[("glasses_cat_red",)] + hat("sunhat", "sage", "cream"))),
]
for i, (skin, eyes, hair, hc, outfit, kw) in enumerate(OF, 1):
    dressed("of", f"g_of_{i:02d}", skin, eyes, hair, hc, outfit, head="head_female_elderly", old=True, **kw)

KB = [("light", "blue", "hair_child_side", "light_brown", "white", "navy"),
      ("brown", "brown", "hair_child_curly", "black", "sky", "charcoal"),
      ("light", "green", "hair_child_swoop", "carrot", "white", "gray")]
for i, (skin, eyes, hair, hc, shirt, pants) in enumerate(KB, 1):
    kid("kb", f"g_kb_{i:02d}", skin, eyes, hair, hc, shirt, "pants_child", pants)
KG = [("bronze", "brown", "hair_child_wavy", "dark_brown", "white", "lilac"),
      ("light", "blue", "hair_child_relm", "blonde", "sky", "dusty_blue"),
      ("black", "brown", "hair_child_curly", "black", "lemon", "lemon")]
for i, (skin, eyes, hair, hc, shirt, skirt) in enumerate(KG, 1):
    kid("kg", f"g_kg_{i:02d}", skin, eyes, hair, hc, shirt, "skirt_child", skirt, shoes="white" if i != 2 else "navy")

# =================================================================== modern makeover (applied to everyone)
# Everyone gets a light skin tone, and the period costume (frock coats, top hats, bowlers, corsets,
# ball-gown skirts, bonnet sun hats, robes) is swapped for modern wedding-guest clothes.
KEEP_COSTUME = {"groom", "groom_frock", "bride", "bride_updo"}
WAISTCOATS = {"groom", "groom_frock", "bestman", "bestman2", "waiter", "bartender", "dj"}


def modernize(c):
    c["skin"] = "light"
    if c["name"] in KEEP_COSTUME:
        return
    h = sum(map(ord, c["name"]))
    out = []
    for L in c["layers"]:
        k = L[0]
        col = L[1] if len(L) > 1 else None
        if k in ("tophat", "tophat_gray", "bowler", "bowler_brown", "bowler_gray", "sunhat", "sunhat_band", "headscarf"):
            continue
        if k == "jacket_frock":
            L = ["jacket_collared", col or "charcoal"]
        elif k == "pants_striped":
            L = ["pants_formal", "charcoal"]
        elif k == "skirt_belle":
            L = ["skirt_slit" if h % 2 else "skirt_straight", col or "navy"]
        elif k == "corset":
            L = ["top_scoop", col or "navy"]
        elif k == "robe":
            out += [["skirt_straight", "navy"], ["blouse_longsleeve", "navy"]]
            continue
        elif k == "vest" and c["name"] not in WAISTCOATS:
            continue
        elif k in ("bowtie", "necktie") and c["name"] not in WAISTCOATS:
            if h % 3 == 0:
                continue  # open collar, no tie
            L = ["necktie", col]  # slim tie rather than a dickie bow
        out.append(L)
    c["layers"] = out


for _c in CHARS:
    modernize(_c)


def main():
    out = {"_comment": "Generated by lpc_cast.py - edit that file, not this one.", "out_dir": "../characters",
           "groups": GROUPS, "characters": CHARS}
    with open(os.path.join(HERE, "lpc_characters.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, indent=1)
    print(len(CHARS), "characters;", {k: len(v) for k, v in GROUPS.items()})


if __name__ == "__main__":
    main()
