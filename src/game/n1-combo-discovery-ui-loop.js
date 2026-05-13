import { COMBOS, comboDiscoverySortCombos } from "./n1-combos.js";

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
            deps.addToLog("Discovered combo: " + c.name + " (x" + c.bonus.toFixed(2) + ")", "milestone");
            deps.markMeaningfulProgress();
            deps.showComboBubble([c]);
            deps.pulseCombinationsPageButtonForNewBonus();
            deps.updateEarnedBonusesUI();
            deps.updateRateDisplay({ throttleCpsHeadline: false });
            const catalogAfter = deps.getPatternCatalogMultiplier();
            requestAnimationFrame(() => {
                deps.playLedgerBeamBonus(catalogBefore, catalogAfter, c.name + " ×" + c.bonus.toFixed(2));
            });
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
            active.forEach(c => {
                if (!prev.has(c.name)) {
                    deps.addTurboBoostMeter(deps.getTurboComboPoints(c.minHands));
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
