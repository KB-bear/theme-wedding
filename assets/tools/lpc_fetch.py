"""Fetch selected Universal-LPC layer PNGs (walk/idle/sit) + their credits.

Usage:  python -I lpc_fetch.py <items.json> <out_dir>
Downloads from raw.githubusercontent.com (no GitHub API -> no rate limit).
For each item dir and anim it tries  <dir>/<anim>.png  (palette-based, single image)
and otherwise  <dir>/<anim>/<color>.png  for each requested colour.
Also downloads CREDITS.csv, LICENSE and palette_definitions/*_ulpc.json, and writes
<out_dir>/CREDITS-used.csv containing only the rows for the files fetched.
"""
import csv, io, json, os, sys, urllib.request, urllib.error

REPO = "https://raw.githubusercontent.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator/master/"


def get(url):
    try:
        with urllib.request.urlopen(url, timeout=60) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise


def save(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(data)


def main(items_path, out):
    cfg = json.load(open(items_path, encoding="utf-8"))
    anims = cfg.get("anims", ["walk"])
    for meta in ["CREDITS.csv", "LICENSE", "palette_definitions/body/body_ulpc.json",
                 "palette_definitions/cloth/cloth_ulpc.json", "palette_definitions/hair/hair_ulpc.json",
                 "palette_definitions/eye/eye_ulpc.json"]:
        data = get(REPO + meta)
        if data:
            save(os.path.join(out, meta), data)
    fetched, missing = [], []
    for it in cfg["items"]:
        d = it["dir"].strip("/")
        for anim in anims:
            rel = f"{d}/{anim}.png"
            dst = os.path.join(out, "spritesheets", rel)
            if not it.get("prefer_variant"):
                if os.path.exists(dst):
                    fetched.append(rel); continue
                data = get(REPO + "spritesheets/" + rel)
                if data:
                    save(dst, data); fetched.append(rel); continue
            got = False
            for col in it.get("colors", ["white"]):
                rel2 = f"{d}/{anim}/{col}.png"
                dst2 = os.path.join(out, "spritesheets", rel2)
                if os.path.exists(dst2):
                    got = True; continue
                data2 = get(REPO + "spritesheets/" + rel2)
                if data2:
                    save(dst2, data2); got = True
            if got:
                fetched.append(rel)
            else:
                missing.append(rel)
    # credits rows for fetched files (credits are keyed '<dir>/<anim>.png')
    text = open(os.path.join(out, "CREDITS.csv"), encoding="utf-8").read()
    rows = list(csv.reader(io.StringIO(text), skipinitialspace=True))
    header, body = rows[0], rows[1:]
    want = set(fetched)
    used = [r for r in body if r and r[0].strip() in want]
    with open(os.path.join(out, "CREDITS-used.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(header); w.writerows(used)
    nocredit = sorted(want - {r[0].strip() for r in used})
    print(f"fetched {len(fetched)} anim sheets; missing (anim not available): {len(missing)}")
    for m in missing: print("  missing", m)
    print("files without a credits row:", nocredit)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
