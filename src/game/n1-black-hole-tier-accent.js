/** Tier accent classes for Phase 2 collapse tracks that buff Turbo UI (Photon shell, Ergosphere). */
export const BH_TIER_ACCENT_CLASSES = ["bh-tier-accent--1", "bh-tier-accent--2", "bh-tier-accent--3"];

/** @param {number} tier Owned collapse tier (1–3). */
export function getBlackHoleTierAccentClass(tier) {
    const t = Math.floor(Number(tier) || 0);
    if (t <= 0) return "";
    if (t === 1) return "bh-tier-accent--1";
    if (t === 2) return "bh-tier-accent--2";
    return "bh-tier-accent--3";
}

/** @param {Element | null | undefined} el */
export function applyBlackHoleTierAccentClass(el, tier) {
    if (!el) return;
    for (let i = 0; i < BH_TIER_ACCENT_CLASSES.length; i++) el.classList.remove(BH_TIER_ACCENT_CLASSES[i]);
    const next = getBlackHoleTierAccentClass(tier);
    if (next) el.classList.add(next);
}
