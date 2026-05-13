import { computeEarnedBonusesUiDigestFromState } from "./n1-combos.js";

const COMBO_BUBBLE_DURATION_MS = 3500;
const COMBO_PAGE_BTN_PULSE_MS = 2600;
const EARNED_BONUSES_UI_AUTO_MIN_MS = 350;

/**
 * Combo discovery bubbles, Combinations nav pulse, and the Combo Catalog breakdown list (#earned-bonuses-list).
 *
 * @param {{
 *   comboBubbleContainerEl: HTMLElement | null | undefined,
 *   combinationsPageBtn: HTMLElement | null | undefined,
 *   computeAscensionGrantTotals: () => Record<string, unknown>,
 *   getUnlockedHands: () => number,
 *   getEarnedComboNames: () => string[],
 *   getComboDiscoveryPendingQueue: () => string[],
 *   getPatternCatalogMultiplier: () => number,
 *   getAscensionComboPatternMult: () => number,
 *   getComboMultiplier: () => number,
 *   getTimeWarpComboMultiplier: () => number,
 *   getCombosByMinHands: () => Record<number, Array<{ name: string, bonus: number }>>,
 * }} deps
 */
export function createComboFeedbackUi(deps) {
    let combinationsBonusPulseClearT = 0;
    let lastEarnedBonusesUiRebuildAtMs = 0;
    let lastEarnedBonusesUiDigest = "";

    function pulseCombinationsPageButtonForNewBonus() {
        const btn = deps.combinationsPageBtn;
        if (!btn || btn.style.display === "none") return;
        window.clearTimeout(combinationsBonusPulseClearT);
        btn.classList.remove("page-btn--new-bonus-pulse");
        void btn.offsetWidth;
        btn.classList.add("page-btn--new-bonus-pulse");
        combinationsBonusPulseClearT = window.setTimeout(() => {
            btn.classList.remove("page-btn--new-bonus-pulse");
        }, COMBO_PAGE_BTN_PULSE_MS);
    }

    function showComboBubble(newlyEarned) {
        const comboBubbleContainerEl = deps.comboBubbleContainerEl;
        if (!comboBubbleContainerEl || newlyEarned.length === 0) return;
        const tierProduct = newlyEarned.reduce((m, c) => m * c.bonus, 1);
        const text = newlyEarned.map(c => c.name + " ×" + c.bonus.toFixed(2)).join(" · ");
        const totalText =
            "New this tick: ×" +
            tierProduct.toFixed(2) +
            " within tier(s) — tiers add toward your Combo Catalog (patterns still multiply inside each tier)";
        const bubble = document.createElement("div");
        bubble.className = "combo-bubble";
        bubble.innerHTML = "<span class=\"combo-bubble-names\">" + text + "</span><span class=\"combo-bubble-total\">" + totalText + "</span>";
        comboBubbleContainerEl.appendChild(bubble);
        requestAnimationFrame(() => bubble.classList.add("combo-bubble-visible"));
        setTimeout(() => {
            if (bubble.parentNode) bubble.parentNode.removeChild(bubble);
        }, COMBO_BUBBLE_DURATION_MS);
    }

    function computeEarnedBonusesUiDigest() {
        const totals = deps.computeAscensionGrantTotals();
        return computeEarnedBonusesUiDigestFromState({
            unlockedHands: deps.getUnlockedHands(),
            earnedComboNames: deps.getEarnedComboNames(),
            pendingComboNames: deps.getComboDiscoveryPendingQueue(),
            totals,
            catalogMult: deps.getPatternCatalogMultiplier(),
            ascPatternMult: deps.getAscensionComboPatternMult(),
            cpsComboMult: deps.getComboMultiplier(),
            warpComboMult: deps.getTimeWarpComboMultiplier()
        });
    }

    /**
     * @param {boolean} [forceRebuild=true] When false, throttles and skips identical rebuilds for scroll stability.
     */
    function updateEarnedBonusesUI(forceRebuild) {
        const listEl = document.getElementById("earned-bonuses-list");
        if (!listEl) return;
        const force = forceRebuild !== false;
        const now = Date.now();
        if (!force && listEl.childElementCount > 0 && now - lastEarnedBonusesUiRebuildAtMs < EARNED_BONUSES_UI_AUTO_MIN_MS) {
            return;
        }
        if (!force) {
            const digest = computeEarnedBonusesUiDigest();
            if (digest === lastEarnedBonusesUiDigest) {
                return;
            }
        }
        lastEarnedBonusesUiRebuildAtMs = now;
        listEl.innerHTML = "";
        const unlockedHands = deps.getUnlockedHands();
        if (unlockedHands < 2) {
            const placeLi = document.createElement("li");
            placeLi.className = "earned-bonuses-placeholder";
            placeLi.textContent =
                "Unlock a second hand to discover combos and grow your Combo Catalog. Full achievement-style integration with the Achievements page — coming soon.";
            listEl.appendChild(placeLi);
            lastEarnedBonusesUiDigest = computeEarnedBonusesUiDigest();
            return;
        }
        const earnedComboNames = deps.getEarnedComboNames();
        const earnedSet = new Set(earnedComboNames);
        const pendingDiscovery = new Set(deps.getComboDiscoveryPendingQueue());
        const byMinHands = deps.getCombosByMinHands();
        const totals = deps.computeAscensionGrantTotals();
        const catalogMult = deps.getPatternCatalogMultiplier();
        const flatAdd = 1 + (totals.comboMultAdd || 0);
        const ascPatMult = deps.getAscensionComboPatternMult();
        const cpsComboMult = deps.getComboMultiplier();
        const warpComboMult = deps.getTimeWarpComboMultiplier();
        const combinedLi = document.createElement("li");
        combinedLi.className = "earned-bonuses-combined";
        combinedLi.id = "ledger-sink-catalog-combined";
        combinedLi.setAttribute("data-ledger-sink", "catalog");
        combinedLi.textContent =
            "Combo Catalog ×" +
            catalogMult.toFixed(2) +
            " (discovered patterns; tiers add). Tick multiplier ×" +
            cpsComboMult.toFixed(2) +
            " (= Combo Catalog ×" +
            catalogMult.toFixed(2) +
            " × Ascended Combo ×" +
            ascPatMult.toFixed(2) +
            "). Time Warp ×" +
            warpComboMult.toFixed(2) +
            " (= tick stack ×" +
            cpsComboMult.toFixed(2) +
            " × index ×" +
            flatAdd.toFixed(2) +
            ").";
        listEl.appendChild(combinedLi);
        for (let n = 2; n <= 10; n++) {
            if (unlockedHands < n) continue;
            const group = byMinHands[n] || [];
            if (group.length === 0) continue;
            const earnedInGroup = group.filter(c => earnedSet.has(c.name));
            const allEarned = earnedInGroup.length === group.length;
            if (allEarned) {
                const totalMult = earnedInGroup.reduce((m, c) => m * c.bonus, 1);
                const li = document.createElement("li");
                li.className = "earned-bonuses-summary";
                li.textContent = "All " + n + "-hand patterns discovered · tier product ×" + totalMult.toFixed(2);
                listEl.appendChild(li);
            } else {
                group.forEach(c => {
                    const li = document.createElement("li");
                    const isEarned = earnedSet.has(c.name);
                    const isQueued = !isEarned && pendingDiscovery.has(c.name);
                    if (isEarned) li.className = "earned-bonus-item-earned";
                    else if (isQueued) li.className = "earned-bonus-item-queued";
                    else li.className = "earned-bonus-undiscovered";
                    let suffix = "";
                    if (isEarned) suffix = "";
                    else if (isQueued) suffix = " — Queued";
                    else suffix = " — undiscovered";
                    li.textContent = c.name + " (×" + c.bonus.toFixed(2) + ")" + suffix;
                    listEl.appendChild(li);
                });
            }
        }
        lastEarnedBonusesUiDigest = computeEarnedBonusesUiDigest();
    }

    return {
        pulseCombinationsPageButtonForNewBonus,
        showComboBubble,
        computeEarnedBonusesUiDigest,
        updateEarnedBonusesUI
    };
}
