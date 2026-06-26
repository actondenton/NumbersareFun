const ASCENSION_LEGACY_NODE_ID_RE = /^(?:tempo_cheapen_|boost_turbo_|boost_warp_|asc_(?:chp|cmb|spd|tur|wrp|syn)_)/;
const ASCENSION_NODE_AUTOBUY_DEFAULT_ON_ID = "asc_ix_00";
const ASCENSION_MAP_COLLAPSE_DURATION_MS = 3100;
const ASCENSION_FINGER_KEYS = ["pinky", "ring", "middle", "index", "thumb"];
const ASCENSION_FINGER_RESPEC_LABELS = {
    index: "Index (velocity)",
    middle: "Middle (combo)",
    ring: "Ring (turbo)",
    pinky: "Pinky (warp)",
    thumb: "Thumb (clap)"
};

/** Node purchase, respec, and map-collapse orchestration (Phase 21c). */
export function wireNumber1AscensionNodeActions(dep) {
    function normalizeAscensionNodeIds() {
        const nodeIds = dep.getNumber1AscensionNodeIds();
        if (nodeIds.some(id => typeof id === "string" && ASCENSION_LEGACY_NODE_ID_RE.test(id))) {
            dep.setNumber1AscensionNodeIds([]);
            return;
        }
        const nodeById = dep.getAscensionMapNodeById();
        const seen = new Set();
        const out = [];
        nodeIds.forEach(id => {
            if (typeof id !== "string" || !nodeById[id]) return;
            if (seen.has(id)) return;
            seen.add(id);
            out.push(id);
        });
        dep.setNumber1AscensionNodeIds(out);
    }

    function isAscensionMapCollapseTransitionActive() {
        return dep.getAscensionMapCollapseActiveUntilMs() > Date.now();
    }

    function queueAscensionMapCollapseTransition() {
        if (dep.getPhase1MapCollapseSeen() || dep.getAscensionMapCollapsePending()) return;
        dep.setAscensionMapCollapsePending(true);
        dep.addToLog("Final ascension node owned. Confirm the story modal to collapse the map.", "milestone");
        const overlay = dep.getStoryBannerOverlayEl();
        if (!overlay || overlay.style.display !== "flex") {
            dep.ensureBlackHoleArcStarted();
            const gravityBanner = dep.getStoryBannerById("black-hole-mass-accumulator-intro");
            const collapseBanner = dep.getStoryBannerById("ascension-map-collapse-ready");
            if (gravityBanner && collapseBanner) {
                dep.showStoryBanner(gravityBanner, {
                    onClose() {
                        dep.showStoryBanner(collapseBanner);
                    }
                });
            } else if (collapseBanner) {
                dep.showStoryBanner(collapseBanner);
            }
        }
    }

    function startAscensionMapCollapseTransition() {
        if (dep.getPhase1MapCollapseSeen()) return;
        dep.setAscensionMapCollapsePending(false);
        dep.setPhase1MapCollapseSeen(true);
        let durationMs = ASCENSION_MAP_COLLAPSE_DURATION_MS;
        try {
            if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                durationMs = 260;
            }
        } catch (_) {}
        dep.setAscensionMapCollapseActiveUntilMs(Date.now() + durationMs);
        dep.addToLog("Final ascension node owned. The map collapses into the singularity.", "milestone");
        const prevTimer = dep.getAscensionMapCollapseTimerId();
        if (prevTimer) clearTimeout(prevTimer);
        dep.setAscensionMapCollapseTimerId(setTimeout(function () {
            dep.setAscensionMapCollapseTimerId(0);
            dep.setAscensionMapCollapseActiveUntilMs(0);
            dep.refreshAscensionPanelIfOpen();
        }, durationMs + 30));
        dep.refreshAscensionPanelIfOpen();
    }

    function tryBuyAscensionNode(id) {
        if (!dep.getNumber1HasAscended()) return;
        const chain = dep.getAscensionPurchaseChainInfoToNode(id);
        if (chain.targetOwned) return;
        const spend = chain.missingCost;
        if (!(spend > 0) || dep.getNumber1AscensionEssence() < spend) {
            dep.addToLog("Ascension skill: " + dep.ascensionNodeDisplayName(id) + " requires " + dep.formatCount(spend) + " Essence to buy-to-here.", "warning");
            return;
        }
        dep.addNumber1AscensionEssence(-spend);
        const nodeIds = dep.getNumber1AscensionNodeIds();
        chain.missingOrdered.forEach(function (nid) {
            nodeIds.push(nid);
        });
        dep.setNumber1AscensionNodeIds(nodeIds);
        normalizeAscensionNodeIds();
        const buyCount = chain.missingOrdered.length;
        const boughtLabel = buyCount > 1 ? ("buy-to-here " + buyCount + " nodes") : "single node";
        dep.addToLog("Ascension skill: " + dep.ascensionNodeDisplayName(id) + " (" + boughtLabel + ", " + dep.formatCount(spend) + " Essence)", "milestone");
        dep.applyAscensionHandUnlockStartingCountFloorToUnlockedHands();
        if (chain.missingOrdered.indexOf(ASCENSION_NODE_AUTOBUY_DEFAULT_ON_ID) >= 0) {
            dep.applyAscensionAutobuyGrantToUnlockedHands();
        }
        dep.updateCheapenUpgradeUI();
        dep.updateTurboBoostUI({ force: true });
        dep.updateRateDisplay();
        dep.updateTimeWarpAuraUI();
        if (!dep.getPhase1MapCollapseSeen() && dep.isNumber1AscensionTreeFullyPurchased()) {
            queueAscensionMapCollapseTransition();
        }
        dep.refreshOverviewAndAscensionPanelsIfOpen();
        if (chain.missingOrdered.some(function (nid) {
            const bought = dep.getAscensionMapNodeById()[nid];
            return bought && bought.grants && bought.grants.turboLeveler === true;
        })) {
            dep.tryTurboLevelerPurchases();
        }
        dep.checkStoryBanners();
        dep.autosaveNow();
    }

    function respecNumber1AscensionSkillTrees() {
        if (!dep.getNumber1HasAscended() || dep.getNumber1AscensionNodeIds().length === 0) return;
        if (dep.hasBlackHoleProgressLockingRespec()) {
            dep.addToLog("Ascension respec is blocked once you've spent Essence on post-map progression.", "warning");
            return;
        }
        let refund = 0;
        dep.getNumber1AscensionNodeIds().forEach(nodeId => {
            const c = dep.getAscensionNodePurchaseCost(nodeId);
            if (Number.isFinite(c) && c > 0 && c < Number.MAX_SAFE_INTEGER / 4) refund += c;
        });
        dep.setNumber1AscensionNodeIds([]);
        if (!dep.isBlackHoleArcUnlocked()) dep.resetBlackHolePhaseToZero();
        dep.addNumber1AscensionEssence(refund);
        dep.resetTurboLevelerBank();
        dep.addToLog("Ascension trees reset — " + dep.formatCount(refund) + " Essence refunded (free respec).", "milestone");
        dep.updateCheapenUpgradeUI();
        dep.updateTurboBoostUI({ force: true });
        dep.updateRateDisplay();
        dep.updateTimeWarpAuraUI();
        dep.refreshOverviewAndAscensionPanelsIfOpen();
        dep.autosaveNow();
    }

    function respecNumber1AscensionFinger(finger) {
        if (!dep.getNumber1HasAscended()) return;
        if (dep.hasBlackHoleProgressLockingRespec()) {
            dep.addToLog("Ascension respec is blocked once you've spent Essence on post-map progression.", "warning");
            return;
        }
        if (ASCENSION_FINGER_KEYS.indexOf(finger) < 0) return;
        const nodeById = dep.getAscensionMapNodeById();
        const kept = [];
        let refund = 0;
        dep.getNumber1AscensionNodeIds().forEach(nodeId => {
            const def = nodeById[nodeId];
            if (def && def.finger === finger) {
                const c = dep.getAscensionNodePurchaseCost(nodeId);
                if (Number.isFinite(c) && c > 0 && c < Number.MAX_SAFE_INTEGER / 4) refund += c;
            } else {
                kept.push(nodeId);
            }
        });
        if (refund <= 0) return;
        dep.setNumber1AscensionNodeIds(kept);
        normalizeAscensionNodeIds();
        if (!dep.isBlackHoleArcUnlocked()) dep.resetBlackHolePhaseToZero();
        dep.addNumber1AscensionEssence(refund);
        dep.addToLog((ASCENSION_FINGER_RESPEC_LABELS[finger] || finger) + " reset — " + dep.formatCount(refund) + " Essence refunded.", "milestone");
        dep.updateCheapenUpgradeUI();
        dep.updateTurboBoostUI({ force: true });
        dep.updateRateDisplay();
        dep.refreshOverviewAndAscensionPanelsIfOpen();
        dep.autosaveNow();
    }

    return {
        normalizeAscensionNodeIds,
        tryBuyAscensionNode,
        isAscensionMapCollapseTransitionActive,
        queueAscensionMapCollapseTransition,
        startAscensionMapCollapseTransition,
        respecNumber1AscensionSkillTrees,
        respecNumber1AscensionFinger
    };
}
