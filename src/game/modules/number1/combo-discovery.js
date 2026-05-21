// Number 1 Combo Discovery Module
// Merged from: n1-combo-discovery-ui-loop.js, n1-combo-discovery-milestone-ui.js

import { COMBOS, comboDiscoverySortCombos } from "./combo.js";
import { getBlackHolePhase2PhotonHideComboDiscovery } from "../../number1-black-hole.js";

// ==================== COMBO DISCOVERY UI LOOP (from n1-combo-discovery-ui-loop.js) ====================

/** Combo discovery milestone queue + per-tick combo UI; boot owns persisted state via deps. */
export function createComboDiscoveryUiLoop(deps) {
    function enqueueComboDiscoveryMilestones(activeCombos) {
        const earnedComboNames = deps.getEarnedComboNames();
        const pendingQueue = deps.getMilestonePendingQueue();
        const pendingSet = new Set(pendingQueue);
        activeCombos
            .filter(c => earnedComboNames.indexOf(c.name) === -1 && !pendingSet.has(c.name))
            .sort(comboDiscoverySortCombos)
            .forEach(c => {
                pendingQueue.push(c.name);
            });
    }

    function tryProcessOneComboDiscoveryMilestone(nowMs) {
        const now = nowMs || Date.now();
        const pendingQueue = deps.getMilestonePendingQueue();
        if (pendingQueue.length === 0) return;
        const readyAt = deps.getMilestoneReadyAtMs();
        if (readyAt !== 0 && now < readyAt) return;
        const earnedComboNames = deps.getEarnedComboNames();
        while (pendingQueue.length > 0) {
            const name = pendingQueue.shift();
            if (earnedComboNames.indexOf(name) !== -1) continue;
            const c = COMBOS.find(x => x.name === name);
            if (!c) continue;
            const catalogBefore = deps.getPatternCatalogMultiplier();
            earnedComboNames.push(c.name);
            const silentDiscovery =
                typeof deps.getBlackHoleState === "function" &&
                getBlackHolePhase2PhotonHideComboDiscovery(deps.getBlackHoleState());
            if (!silentDiscovery) {
                deps.addToLog("Discovered combo: " + c.name + " (x" + c.bonus.toFixed(2) + ")", "milestone");
                deps.markMeaningfulProgress();
                deps.showComboBubble([c]);
                deps.pulseCombinationsPageButtonForNewBonus();
                const catalogAfter = deps.getPatternCatalogMultiplier();
                requestAnimationFrame(() => {
                    deps.playLedgerBeamBonus(catalogBefore, catalogAfter, c.name + " ×" + c.bonus.toFixed(2));
                });
            }
            deps.updateEarnedBonusesUI();
            deps.updateRateDisplay({ throttleCpsHeadline: false });
            const span = deps.getComboDiscoveryMilestoneCooldownMs();
            deps.setMilestoneCooldownSpanMs(span);
            deps.setMilestoneReadyAtMs(now + span);
            return;
        }
    }

    function updateComboUI() {
        if (deps.getUnlockedHands() < 2) {
            deps.setLastComboUiInputDigest("");
            return;
        }
        const digestNow = deps.computeComboUiInputDigest();
        if (!deps.isCombinationsPageOpen() && digestNow === deps.getLastComboUiInputDigest()) {
            tryProcessOneComboDiscoveryMilestone(Date.now());
            return;
        }
        deps.setLastComboUiInputDigest(digestNow);

        const active = deps.getActiveCombos();
        const prev = deps.getPreviousTickActiveComboNames();
        const newlyPulsingEdge = active.filter(c => !prev.has(c.name));
        const comboActivationCounts = deps.getComboActivationCounts();
        newlyPulsingEdge.forEach(c => {
            comboActivationCounts[c.name] = (comboActivationCounts[c.name] || 0) + 1;
        });
        if (newlyPulsingEdge.length > 0) deps.applyAscensionComboTimeWarpDelayReduction(newlyPulsingEdge.length);
        const nowCombo = Date.now();
        enqueueComboDiscoveryMilestones(active);
        tryProcessOneComboDiscoveryMilestone(nowCombo);
        if (deps.getTurboBoostUnlocked() && active.length > 0) {
            const activeNames = new Set(active.map(c => c.name));
            const comboTurboFillOn =
                typeof deps.isComboTurboFillFromCombosEnabled !== "function" ||
                deps.isComboTurboFillFromCombosEnabled();
            active.forEach(c => {
                if (!prev.has(c.name)) {
                    if (comboTurboFillOn) {
                        deps.addTurboBoostMeter(deps.getTurboComboPoints(c.minHands));
                    }
                }
            });
            deps.setPreviousTickActiveComboNames(activeNames);
        } else {
            deps.setPreviousTickActiveComboNames(new Set(active.map(c => c.name)));
        }
        deps.refreshCombinationsPanelIfOpen();
    }

    return { tryProcessOneComboDiscoveryMilestone, updateComboUI };
}

// ==================== COMBO DISCOVERY MILESTONE UI (from n1-combo-discovery-milestone-ui.js) ====================

/**
 * Combinations page: Combo Catalog discovery milestone queue + countdown bar.
 */

export function formatComboDiscoveryMilestoneCountdown(remainMs) {
    const sec = Math.max(0, Math.ceil(remainMs / 1000));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
}

/**
 * @param {{
 *   pagePanelEl: HTMLElement | null | undefined,
 *   pagePanelTitleEl: HTMLElement | null | undefined,
 *   unlockedHands: number,
 *   milestoneCooldownMinMs: number,
 *   milestone: {
 *     pendingQueue: { readonly length: number },
 *     readyAtMs: number,
 *     cooldownSpanMs: number,
 *   },
 *   getDefaultCooldownMs: () => number,
 *   nowMs?: number,
 * }} d
 */
export function updateComboDiscoveryMilestonePanelIfOpen(d) {
    if (!d.pagePanelEl || d.pagePanelEl.style.display === "none" || !d.pagePanelTitleEl) return;
    if (d.pagePanelTitleEl.textContent !== "Combinations") return;
    if (d.unlockedHands < 2) return;
    const wrap = document.getElementById("combo-discovery-milestone-ui");
    const line = document.getElementById("combo-discovery-milestone-line");
    const track = document.getElementById("combo-discovery-milestone-bar-track");
    const fill = document.getElementById("combo-discovery-milestone-bar-fill");
    if (!wrap || !line || !track || !fill) return;
    const q = d.milestone.pendingQueue.length;
    if (q === 0) {
        wrap.hidden = true;
        return;
    }
    wrap.hidden = false;
    const now = Number.isFinite(d.nowMs) ? Number(d.nowMs) : Date.now();
    const waiting =
        d.milestone.readyAtMs !== 0 && now < d.milestone.readyAtMs;
    let spanEff =
        d.milestone.cooldownSpanMs > 0 ? d.milestone.cooldownSpanMs : d.getDefaultCooldownMs();
    spanEff = Math.max(d.milestoneCooldownMinMs, spanEff);
    let remainMs = 0;
    let pct = 100;
    if (waiting) {
        remainMs = d.milestone.readyAtMs - now;
        pct = Math.max(0, Math.min(100, (remainMs / spanEff) * 100));
    }
    let text;
    if (waiting) {
        const cd = formatComboDiscoveryMilestoneCountdown(remainMs);
        if (q > 1) {
            text = q + " discoveries queued — showing the next in " + cd + ".";
        } else {
            text = "Next unlock ready in " + cd + ".";
        }
    } else {
        text =
            q > 1
                ? q + " discoveries queued — applying the next Combo Catalog unlock now."
                : "Next Combo Catalog unlock is ready — applying now.";
    }
    line.textContent = text;
    fill.style.width = pct + "%";
    track.setAttribute("aria-valuenow", String(Math.round(pct)));
    track.setAttribute(
        "aria-valuetext",
        waiting ? formatComboDiscoveryMilestoneCountdown(remainMs) + " remaining" : "Ready"
    );
}
