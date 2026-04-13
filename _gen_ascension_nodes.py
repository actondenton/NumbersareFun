# Obsolete one-off: used to emit a flat ASCENSION_NODES array. Current data is ASCENSION_ROUTE_SEEDS + braid expander.
ROMAN = [
    "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
    "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
    "XXI", "XXII", "XXIII", "XXIV", "XXV",
]
FINGER_META = {
    "index": {"route": "velocity", "prefix": "asc_ix"},
    "middle": {"route": "combo", "prefix": "asc_md"},
    "ring": {"route": "turbo", "prefix": "asc_rg"},
    "pinky": {"route": "warp", "prefix": "asc_pk"},
    "thumb": {"route": "clap", "prefix": "asc_th"},
}


def pad2(n):
    return f"{n:02d}"


def gv(i):
    m = i % 4
    if m == 0:
        return {"speedCostMult": 0.99}
    if m == 1:
        return {"cheapenCap": 1}
    if m == 2:
        return {"autoBuyDelayMult": 0.97}
    return {"slowdownCostMult": 0.94}


def gc(i):
    m = i % 3
    if m == 0:
        return {"comboMultAdd": 0.004}
    if m == 1:
        return {"comboTriggerProductionFrac": 0.004}
    return {"comboMultAdd": 0.003}


def gt(i):
    return {"turboScaling": 1} if i % 2 == 0 else {"comboTurboPointsMult": 0.07}


def gw(i):
    return {"warpOverflow": 1} if i % 2 == 0 else {"warpSpawnIntervalMult": 0.965}


def gcl(i):
    return {"clapCooldownMult": 0.987} if i % 2 == 0 else {"clapBonusChanceAdd": 0.006}


def eff(g):
    parts = []
    if "speedCostMult" in g:
        parts.append(f"Speed upgrades cost {(1 - g['speedCostMult']) * 100:.1f}% less (multiplicative)")
    if "cheapenCap" in g:
        parts.append(f"+{g['cheapenCap']} max Cheapen level")
    if "autoBuyDelayMult" in g:
        parts.append(f"Speed autobuy delay ×{g['autoBuyDelayMult']:.3f}")
    if "slowdownCostMult" in g:
        parts.append(f"Slowdown upgrades cost {(1 - g['slowdownCostMult']) * 100:.1f}% less (multiplicative)")
    if "comboMultAdd" in g:
        parts.append(f"+{g['comboMultAdd'] * 100:.2f}% combo multiplier")
    if "comboTriggerProductionFrac" in g:
        parts.append(f"+{g['comboTriggerProductionFrac'] * 100:.2f}% of 1s global CPS on combo pulse (split)")
    if "turboScaling" in g:
        parts.append("+25 turbo meter & ×1.25 turbo cap stack")
    if "comboTurboPointsMult" in g:
        parts.append(f"+{g['comboTurboPointsMult'] * 100:.1f}% turbo points from combos")
    if "warpOverflow" in g:
        parts.append(f"+{g['warpOverflow'] * 5}% Time Warp overflow (toward 90% cap)")
    if "warpSpawnIntervalMult" in g:
        parts.append(f"Time Warp aura spawn span ×{g['warpSpawnIntervalMult']:.3f} (min 1s)")
    if "clapCooldownMult" in g:
        parts.append(f"Clap cooldown ×{g['clapCooldownMult']:.3f}")
    if "clapBonusChanceAdd" in g:
        parts.append(f"+{g['clapBonusChanceAdd'] * 100:.2f}% clap bonus chance")
    return " · ".join(parts) if parts else "Minor resonance"


def js_escape(s):
    return s.replace("\\", "\\\\").replace("'", "\\'")


def grants_to_js(g):
    pairs = []
    for k, v in g.items():
        if isinstance(v, float):
            pairs.append(f"{k}: {repr(v)}")
        else:
            pairs.append(f"{k}: {v}")
    return "{ " + ", ".join(pairs) + " }"


def main():
    out = []
    out.append("    var ASCENSION_NODES = [")
    first = True
    for finger in ["index", "middle", "ring", "pinky", "thumb"]:
        meta = FINGER_META[finger]
        base = 7 if finger == "ring" else (6 if finger == "pinky" else 5)
        for i in range(25):
            pid = meta["prefix"] + "_" + pad2(i)
            if i == 0:
                parents_js = "[]"
            else:
                parents_js = "['" + meta["prefix"] + "_" + pad2(i - 1) + "']"
            if finger == "index":
                g = gv(i)
            elif finger == "middle":
                g = gc(i)
            elif finger == "ring":
                g = gt(i)
            elif finger == "pinky":
                g = gw(i)
            else:
                g = gcl(i)
            route = meta["route"]
            title = route[0].upper() + route[1:] + " " + ROMAN[i + 1]
            cost = max(1, int(base * (1.104**i)))
            effs = js_escape(eff(g))
            title_esc = js_escape(title)
            if not first:
                out.append(",")
            first = False
            out.append("        {")
            out.append(f"            id: '{pid}',")
            out.append(f"            finger: '{finger}',")
            out.append(f"            parents: {parents_js},")
            out.append(f"            route: '{route}',")
            out.append(f"            tags: ['{route}', '{finger}'],")
            out.append(f"            title: '{title_esc}',")
            out.append(f"            effect: '{effs}',")
            out.append(f"            cost: {cost},")
            out.append(f"            grants: {grants_to_js(g)},")
            out.append(f"            branchIndex: {i}")
            out.append("        }")
    out.append("    ];")
    print("\n".join(out))


if __name__ == "__main__":
    main()
