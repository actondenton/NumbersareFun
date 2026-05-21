// Number 1 Ascension Module
// Merged from: n1-ascension.js, n1-ascension-perform.js, n1-ascension-flow-ui.js, n1-ascension-page-shell.js, n1-ascension-map-ui.js

import { formatCount as formatCountDefault } from "./format.js";
import {
    formatAscensionRunTimeBreakdownLine,
    getNumber1AscensionRunTimeMultPct
} from "./ascension-run-time.js";

export const ASCENSION_1_MIN_HANDS = 10;
export const ASCENSION_1_REQUIRED_TOTAL = 1e35;

const ASC_ESSENCE_ANCHOR_X0 = 35;
const ASC_ESSENCE_ANCHOR_Y0 = 35;
const ASC_ESSENCE_ANCHOR_X1 = 42;
const ASC_ESSENCE_ANCHOR_Y1 = 75;
const ASC_ESSENCE_ANCHOR_X2 = 100;
const ASC_ESSENCE_ANCHOR_Y2 = 1000;
const ASC_ESSENCE_SEGMENT1_POWER = 1.08;
const ASC_ESSENCE_SEGMENT2_POWER = 1.22;

export function getNumber1AscensionPendingBonusEssence(value) {
    const b = Math.floor(Number(value) || 0);
    return b > 0 ? b : 0;
}

export function getNumber1AscensionClapEssenceMultiplier(value) {
    const m = Number(value);
    return Number.isFinite(m) && m >= 1 ? m : 1;
}

/**
 * Base ascension essence scaling on log10(total count).
 * Anchors: 1e35 -> ~35, 1e42 -> ~75, 1e100 -> ~1000.
 */
export function computeNumber1AscensionBaseGain(fromTotal) {
    const t = Math.max(1, Number(fromTotal) || 1);
    const x = Math.max(0, Math.log10(t));
    let y;
    if (x <= ASC_ESSENCE_ANCHOR_X0) {
        y = Math.max(1, x);
    } else if (x <= ASC_ESSENCE_ANCHOR_X1) {
        const u = (x - ASC_ESSENCE_ANCHOR_X0) / (ASC_ESSENCE_ANCHOR_X1 - ASC_ESSENCE_ANCHOR_X0);
        y = ASC_ESSENCE_ANCHOR_Y0 + (ASC_ESSENCE_ANCHOR_Y1 - ASC_ESSENCE_ANCHOR_Y0) * Math.pow(Math.max(0, Math.min(1, u)), ASC_ESSENCE_SEGMENT1_POWER);
    } else if (x <= ASC_ESSENCE_ANCHOR_X2) {
        const u = (x - ASC_ESSENCE_ANCHOR_X1) / (ASC_ESSENCE_ANCHOR_X2 - ASC_ESSENCE_ANCHOR_X1);
        y = ASC_ESSENCE_ANCHOR_Y1 + (ASC_ESSENCE_ANCHOR_Y2 - ASC_ESSENCE_ANCHOR_Y1) * Math.pow(Math.max(0, Math.min(1, u)), ASC_ESSENCE_SEGMENT2_POWER);
    } else {
        const over = x - ASC_ESSENCE_ANCHOR_X2;
        y = ASC_ESSENCE_ANCHOR_Y2 + 80 * Math.pow(over, 0.72);
    }
    return Math.max(1, Math.floor(y));
}

export function computeNumber1AscensionGainBreakdown(fromTotal, opts) {
    const options = opts || {};
    const baseGain = computeNumber1AscensionBaseGain(fromTotal);
    const pendingBonus = getNumber1AscensionPendingBonusEssence(options.pendingBonus);
    const blackHolePhase1Mult = Number(options.blackHolePhase1Mult) || 1;
    const blackHoleParallelBonus = Number(options.blackHoleParallelBonus) || 0;
    const blackHoleFurnaceBonus = Number(options.blackHoleFurnaceBonus) || 0;
    const phaseMult = blackHolePhase1Mult + blackHoleParallelBonus + blackHoleFurnaceBonus;
    const beforeMultRaw = (baseGain + pendingBonus) * Math.max(1, phaseMult);
    const beforeMult = Math.max(baseGain + pendingBonus, Math.floor(beforeMultRaw));
    const clapMult = getNumber1AscensionClapEssenceMultiplier(options.clapMult);
    const runDurationSec = Math.max(0, Math.floor(Number(options.runDurationSec) || 0));
    const runTimeMultPct = Number(options.runTimeMultPct);
    const runTimeMultPctResolved =
        Number.isFinite(runTimeMultPct) && runTimeMultPct >= 0
            ? runTimeMultPct
            : getNumber1AscensionRunTimeMultPct(runDurationSec);
    const afterTimeMult = Math.max(0, Math.floor(beforeMult * (runTimeMultPctResolved / 100)));
    const runTimeMultBonus = afterTimeMult - beforeMult;
    const finalGain = Math.max(afterTimeMult, Math.floor(afterTimeMult * clapMult));
    return {
        baseGain,
        pendingBonus,
        blackHolePhase1Mult,
        blackHoleParallelBonus,
        blackHoleFurnaceBonus,
        blackHolePhaseMult: phaseMult,
        blackHoleMultiplierBonus: Math.max(0, beforeMult - (baseGain + pendingBonus)),
        beforeMult,
        runDurationSec,
        runTimeMultPct: runTimeMultPctResolved,
        afterTimeMult,
        runTimeMultBonus,
        clapMult,
        multiplierBonus: Math.max(0, finalGain - afterTimeMult),
        finalGain
    };
}

export function computeNumber1AscensionGain(fromTotal, opts) {
    return computeNumber1AscensionGainBreakdown(fromTotal, opts).finalGain;
}

export function getNumber1AscensionRequiredHands(phase, minHands = ASCENSION_1_MIN_HANDS) {
    return phase >= 5 && phase < 7 ? 1 : minHands;
}

export function isNumber1AscensionReady(opts) {
    const options = opts || {};
    if (options.phase === 7) return false;
    const requiredHands = getNumber1AscensionRequiredHands(options.phase, options.minHands);
    return options.unlockedHands >= requiredHands &&
        options.totalChanges >= (options.requiredTotal || ASCENSION_1_REQUIRED_TOTAL);
}

// Alias for backward compatibility with legacy-boot.js
export const isNumber1AscensionReadyFromState = isNumber1AscensionReady;

// Ascension Perform
export function createNumber1AscensionPerform(deps) {
    function performNumber1Ascension() {
        if (!deps.isNumber1AscensionReady()) return;
        deps.clearActionLogBacklogOnAscension();
        const gainInfo = deps.getAscensionGainBreakdown();
        const baseGain = gainInfo.baseGain;
        const bonusGain = gainInfo.pendingBonus;
        const blackHoleBonusGain = gainInfo.blackHoleMultiplierBonus;
        const runTimeBonusGain = gainInfo.runTimeMultBonus;
        const multBonusGain = gainInfo.multiplierBonus;
        const gain = gainInfo.finalGain;

        deps.applyAscensionEssenceGrantAndResetWarpClapBonuses(gain);
        deps.shrinkHandsUiToSingleHandKeepingFirst();
        deps.bootstrapLanesArraysAutobuyTimeWarpCheapenFlagsForAscension();
        deps.resetTurboAfterAscension();
        deps.resetCombosDiscoveryAndObjectivesAfterAscension();
        deps.rebindPrimaryHandIntoFirstMountAndRender();
        deps.recalculateTotalsHideUpgradeStripeIfBare();
        deps.refreshAllStaleUiAfterAscension();

        const formatCount = deps.formatCount || formatCountDefault;
        const gainParts =
            bonusGain > 0
                ? formatCount(baseGain) + " base + " + formatCount(bonusGain) + " bonus"
                : formatCount(baseGain) + " base";
        const bhPart =
            blackHoleBonusGain > 0
                ? " + " + formatCount(blackHoleBonusGain) + " " + deps.getArcEssenceMultiplierBonusPhraseTitle()
                : "";
        const multPart = multBonusGain > 0 ? " + " + formatCount(multBonusGain) + " clap multiplier" : "";
        const runTimePart =
            runTimeBonusGain !== 0
                ? " + " + formatCount(runTimeBonusGain) + " run-time multiplier (" + gainInfo.runTimeMultPct.toFixed(1) + "%)"
                : "";
        deps.addToLog(
            "Ascended Number 1 — +" +
                formatCount(gain) +
                " Ascension Essence (" +
                gainParts +
                bhPart +
                runTimePart +
                multPart +
                "; total " +
                formatCount(deps.getNumber1AscensionEssence()) +
                ")",
            "milestone"
        );
        deps.markMeaningfulProgress();
        deps.autosaveNow();
    }
    return { performNumber1Ascension };
}

// Ascension Flow UI
export function consumeAscendNumber1Button(eventTarget, beginNumber1AscensionFlow) {
    const btn =
        eventTarget && typeof eventTarget.closest === "function"
            ? eventTarget.closest(".ascend-number-btn")
            : null;
    if (!btn || typeof beginNumber1AscensionFlow !== "function") return false;
    if (btn.disabled || btn.getAttribute("aria-disabled") === "true") return false;
    const n = parseInt(btn.getAttribute("data-number"), 10);
    if (n !== 1) return false;
    beginNumber1AscensionFlow();
    return true;
}

export function createNumber1AscensionFlowUi(deps) {
    const {
        ascensionConfirmOverlayEl,
        ascensionConfirmBodyEl,
        ascensionIntroOverlayEl,
        ascensionIntroContinueBtn,
        ascensionConfirmCancelBtn,
        ascensionConfirmAscendBtn,
        ascensionReadyCtaEl,
        getAscensionGainBreakdown,
        getTotalChanges,
        getNumber1AscensionEssence,
        getArcEssenceMultiplierBonusPhraseTitle,
        isNumber1AscensionReady,
        setGamePaused,
        gameplaySimFrozen,
        hasSeenAscNumber1Intro,
        markAscNumber1IntroSeen,
        autosaveNow,
        performNumber1Ascension
    } = deps;

    const formatCount = deps.formatCount || formatCountDefault;

    function showAscensionConfirmDialog() {
        if (!ascensionConfirmOverlayEl || !ascensionConfirmBodyEl) return;
        const gainInfo = getAscensionGainBreakdown();
        const baseGain = gainInfo.baseGain;
        const bonusGain = gainInfo.pendingBonus;
        const blackHoleBonusGain = gainInfo.blackHoleMultiplierBonus;
        const runTimeBonusGain = gainInfo.runTimeMultBonus;
        const multBonusGain = gainInfo.multiplierBonus;
        const gain = gainInfo.finalGain;
        const nextTotal = getNumber1AscensionEssence() + gain;
        const gainBits = ["base " + formatCount(baseGain)];
        if (bonusGain > 0) gainBits.push("warp bonus " + formatCount(bonusGain));
        if (blackHoleBonusGain > 0) {
            gainBits.push(
                getArcEssenceMultiplierBonusPhraseTitle() +
                    " +" +
                    formatCount(blackHoleBonusGain) +
                    " (" +
                    gainInfo.blackHolePhaseMult.toFixed(3) +
                    "x)"
            );
        }
        if (gainInfo.blackHoleFurnaceBonus > 0) {
            gainBits.push("furnace +" + gainInfo.blackHoleFurnaceBonus.toFixed(2) + "x");
        }
        gainBits.push(formatAscensionRunTimeBreakdownLine(gainInfo.runDurationSec, gainInfo.runTimeMultPct));
        if (runTimeBonusGain > 0) gainBits.push("time bonus +" + formatCount(runTimeBonusGain));
        else if (runTimeBonusGain < 0) gainBits.push("early ascend " + formatCount(runTimeBonusGain));
        if (multBonusGain > 0) {
            gainBits.push(
                "clap mult +" + formatCount(multBonusGain) + " (" + gainInfo.clapMult.toFixed(3) + "x)"
            );
        }
        const bonusLine = gainBits.length > 1 ? " (" + gainBits.join(" + ") + ")" : "";
        ascensionConfirmBodyEl.textContent =
            "Your total count is " +
            formatCount(getTotalChanges()) +
            ". Ascending now grants " +
            formatCount(gain) +
            " Ascension Essence" +
            bonusLine +
            " (you will have " +
            formatCount(nextTotal) +
            " total).\n\nThis resets Number 1 only: one hand, no upgrades, no combo bonuses, objectives unchecked, turbo reset.\n\nSpend Essence on permanent skill branches in Ascension. Respec is always free.";
        ascensionConfirmOverlayEl.style.display = "flex";
    }

    function beginNumber1AscensionFlow() {
        if (!isNumber1AscensionReady()) return;
        setGamePaused(true);
        showAscensionConfirmDialog();
    }

    function maybeShowFirstAscensionIntroOnUnlock() {
        if (hasSeenAscNumber1Intro()) return;
        if (!isNumber1AscensionReady()) return;
        if (!ascensionIntroOverlayEl) return;
        if (gameplaySimFrozen()) return;
        markAscNumber1IntroSeen();
        setGamePaused(true);
        ascensionIntroOverlayEl.style.display = "flex";
        autosaveNow();
    }

    function attachAscensionFlowDomListeners() {
        if (ascensionReadyCtaEl) {
            ascensionReadyCtaEl.addEventListener("click", () => beginNumber1AscensionFlow());
        }
        if (ascensionIntroContinueBtn && ascensionIntroOverlayEl) {
            ascensionIntroContinueBtn.addEventListener("click", () => {
                ascensionIntroOverlayEl.style.display = "none";
                setGamePaused(false);
            });
        }
        if (ascensionConfirmCancelBtn && ascensionConfirmOverlayEl) {
            ascensionConfirmCancelBtn.addEventListener("click", () => {
                ascensionConfirmOverlayEl.style.display = "none";
                setGamePaused(false);
            });
        }
        if (ascensionConfirmAscendBtn && ascensionConfirmOverlayEl) {
            ascensionConfirmAscendBtn.addEventListener("click", () => {
                ascensionConfirmOverlayEl.style.display = "none";
                performNumber1Ascension();
                setGamePaused(false);
            });
        }
    }

    return {
        showAscensionConfirmDialog,
        beginNumber1AscensionFlow,
        maybeShowFirstAscensionIntroOnUnlock,
        attachAscensionFlowDomListeners
    };
}

// Ascension Page Shell
export function renderAscensionPageShellHtml(deps) {
    const { activeTabNumber, number2TabsUnlocked, renderNumber1AscensionBody, renderNumber2AscensionBody, renderAscensionFallbackBody } = deps;
    const n = activeTabNumber;
    let tabsHtml = "";
    if (number2TabsUnlocked) {
        tabsHtml =
            "<div class=\"ascension-page-tabs\" role=\"tablist\" aria-label=\"Ascension by number\">" +
            "<button type=\"button\" class=\"page-btn ascension-number-tab" + (n === 1 ? " ascension-number-tab--active" : "") + "\" data-asc-tab=\"1\" role=\"tab\" aria-selected=\"" + (n === 1 ? "true" : "false") + "\">Number 1</button>" +
            "<button type=\"button\" class=\"page-btn ascension-number-tab" + (n === 2 ? " ascension-number-tab--active" : "") + "\" data-asc-tab=\"2\" role=\"tab\" aria-selected=\"" + (n === 2 ? "true" : "false") + "\">Number 2</button>" +
            "</div>";
    }
    let body = "";
    if (n === 1) body = renderNumber1AscensionBody();
    else if (n === 2 && number2TabsUnlocked) body = renderNumber2AscensionBody();
    else body = renderAscensionFallbackBody();
    return "<div class=\"ascension-page\">" + tabsHtml + "<div class=\"ascension-page-body\">" + body + "</div></div>";
}

// Ascension Map UI
export function createAscensionMapUi(deps) {
    const getNodes = deps.getAscensionMapNodes;
    const getNodeById = deps.getAscensionMapNodeById;
    const formatCount = deps.formatCount || formatCountDefault;
    let ascensionMapViewBoxHeight = 100;

    function ascensionPurchasedSet() {
        return deps.ascensionPurchasedSet();
    }

    function getAscensionNodePurchaseCost(id) {
        const def = getNodeById()[id];
        return def && typeof def.cost === "number" ? def.cost : Number.MAX_SAFE_INTEGER;
    }

    function ascensionNodePrereqsMet(id) {
        const def = getNodeById()[id];
        if (!def) return false;
        const s = ascensionPurchasedSet();
        return def.parents.every(p => s.has(p));
    }

    function ascensionNodeDisplayName(id) {
        const def = getNodeById()[id];
        return def && def.title ? def.title : id;
    }

    function collectAscensionChainToNode(id, purchased, visited, outOrdered) {
        const def = getNodeById()[id];
        if (!def) return;
        if (visited.has(id)) return;
        visited.add(id);
        (def.parents || []).forEach(function (pid) {
            collectAscensionChainToNode(pid, purchased, visited, outOrdered);
        });
        outOrdered.push(id);
    }

    function getAscensionPurchaseChainInfoToNode(id) {
        const purchased = ascensionPurchasedSet();
        const visited = new Set();
        const ordered = [];
        collectAscensionChainToNode(id, purchased, visited, ordered);
        const missingOrdered = ordered.filter(function (nid) {
            return !purchased.has(nid);
        });
        let missingCost = 0;
        missingOrdered.forEach(function (nid) {
            const c = getAscensionNodePurchaseCost(nid);
            if (Number.isFinite(c) && c > 0 && c < Number.MAX_SAFE_INTEGER / 4) missingCost += c;
        });
        const targetOwned = purchased.has(id);
        return {
            ordered,
            missingOrdered,
            missingCost,
            totalCount: ordered.length,
            ownedCount: ordered.length - missingOrdered.length,
            targetOwned
        };
    }

    function computeAscensionHandLayout() {
        const COL_FINGERS = ["pinky", "ring", "middle", "index", "thumb"];
        const vbH = 100;
        ascensionMapViewBoxHeight = vbH;
        const marginX = 2.4;
        const marginY = 5.5;
        const MIN_DIST = 4.62;
        const numCols = COL_FINGERS.length;
        const colWidth = (100 - 2 * marginX) / numCols;

        function nodeCost(n) {
            const c = n.cost;
            if (typeof c === "number" && isFinite(c)) return c;
            const parsed = Number(c);
            return isFinite(parsed) ? parsed : 0;
        }

        const byFinger = {};
        COL_FINGERS.forEach(function (fk) { byFinger[fk] = []; });
        getNodes().forEach(function (node) {
            let fk = node.finger || "middle";
            if (COL_FINGERS.indexOf(fk) < 0) fk = "middle";
            byFinger[fk].push(node);
        });

        const pts = [];
        COL_FINGERS.forEach(function (fk, c) {
            const list = (byFinger[fk] || []).slice().sort(function (a, b) {
                const ia = a.branchIndex != null ? a.branchIndex : 0;
                const ib = b.branchIndex != null ? b.branchIndex : 0;
                if (ia !== ib) return ia - ib;
                const ca = nodeCost(a);
                const cb = nodeCost(b);
                if (ca !== cb) return ca - cb;
                return String(a.id).localeCompare(String(b.id));
            });
            const n = list.length;
            if (!n) return;
            const xMin = marginX + c * colWidth + 0.45;
            const xMax = marginX + (c + 1) * colWidth - 0.45;
            const xc = (xMin + xMax) / 2;
            const xAmp = Math.min(2.95, (xMax - xMin) * 0.22);
            const usableY = vbH - 2 * marginY;
            const dy = n <= 1 ? 0 : usableY / (n - 1);
            const diagSpan = (xMax - xMin) * 0.42;
            let i;
            for (i = 0; i < n; i++) {
                const frac = n <= 1 ? 0.5 : i / (n - 1);
                const zig = (i % 2 === 0 ? -1 : 1) * xAmp;
                const diag = -diagSpan * 0.5 + frac * diagSpan;
                const x0 = xc + zig + diag * 0.55;
                const y0 = vbH - marginY - frac * usableY;
                pts.push({
                    id: list[i].id,
                    finger: fk,
                    x: x0,
                    y: y0,
                    xMin: xMin,
                    xMax: xMax
                });
            }
        });

        let iter;
        for (iter = 0; iter < 88; iter++) {
            const relax = iter < 40 ? 0.32 : 0.18;
            let i;
            for (i = 0; i < pts.length; i++) {
                let j;
                for (j = i + 1; j < pts.length; j++) {
                    const a = pts[i];
                    const b = pts[j];
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const d = Math.hypot(dx, dy) || 1e-6;
                    if (d >= MIN_DIST) continue;
                    const push = ((MIN_DIST - d) / MIN_DIST) * relax;
                    const ux = dx / d;
                    const uy = dy / d;
                    a.x -= ux * push;
                    a.y -= uy * push;
                    b.x += ux * push;
                    b.y += uy * push;
                }
            }
            for (i = 0; i < pts.length; i++) {
                const p = pts[i];
                p.x = Math.min(p.xMax, Math.max(p.xMin, p.x));
                p.y = Math.min(vbH - marginY * 0.45, Math.max(marginY * 0.45, p.y));
            }
        }

        const out = {};
        let wi;
        for (wi = 0; wi < pts.length; wi++) {
            out[pts[wi].id] = { x: pts[wi].x, y: pts[wi].y };
        }
        return out;
    }

    function ascensionColumnEdgePath(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy) || 1;
        const bend = Math.min(2.8, Math.max(0.65, len * 0.12));
        const nx = (-dy / len) * bend;
        const ny = (dx / len) * bend;
        const mx = (x1 + x2) / 2 + nx;
        const my = (y1 + y2) / 2 + ny;
        return "M " + x1.toFixed(3) + " " + y1.toFixed(3) +
            " Q " + mx.toFixed(3) + " " + my.toFixed(3) + " " + x2.toFixed(3) + " " + y2.toFixed(3);
    }

    function ascensionEdgePathActive(parentId, childId, purchased) {
        const childDef = getNodeById()[childId];
        if (!childDef) return false;
        const childOwned = purchased.has(childId);
        const childReachable = childOwned || ascensionNodePrereqsMet(childId);
        if (!childReachable) return false;
        if (!parentId) return true;
        return purchased.has(parentId);
    }

    function ascensionMergePointForChild(node, L, np) {
        const parents = node.parents;
        if (!parents.length) return null;
        let ax = 0;
        let ay = 0;
        let n = 0;
        parents.forEach(function (pid) {
            const p = L[pid];
            if (p) {
                ax += p.x;
                ay += p.y;
                n++;
            }
        });
        if (!n) return null;
        ax /= n;
        ay /= n;
        const vx = np.x - ax;
        const vy = np.y - ay;
        const vlen = Math.hypot(vx, vy) || 1;
        const px = -vy / vlen;
        const py = vx / vlen;
        const spread = parents.length > 1 ? 1.5 + Math.min(2.6, parents.length * 0.28) : 0;
        return { x: (ax + np.x) / 2 + px * spread * 0.38, y: (ay + np.y) / 2 + py * spread * 0.38 };
    }

    function renderAscensionMapColumnGuidesSvg(vbH) {
        const lineH = typeof vbH === "number" && isFinite(vbH) ? vbH : ascensionMapViewBoxHeight;
        const marginX = 2.4;
        const colWidth = (100 - 2 * marginX) / 5;
        const parts = [];
        let c;
        for (c = 1; c < 5; c++) {
            const gx = marginX + c * colWidth;
            parts.push("<line class=\"asc-map-col-rule\" x1=\"" + gx.toFixed(3) + "\" y1=\"0\" x2=\"" + gx.toFixed(3) + "\" y2=\"" + lineH + "\"/>");
        }
        return "<g class=\"asc-map-col-guides\" aria-hidden=\"true\">" + parts.join("") + "</g>";
    }

    function renderAscensionMapEdgesSvg(layout) {
        const L = layout || computeAscensionHandLayout();
        const purchased = ascensionPurchasedSet();
        const parts = [];
        getNodes().forEach(node => {
            const r = node.route || "combo";
            const np = L[node.id];
            if (!np) return;
            const merge = node.parents.length > 1 ? ascensionMergePointForChild(node, L, np) : null;
            node.parents.forEach(pid => {
                const pp = L[pid];
                if (!pp) return;
                const active = ascensionEdgePathActive(pid, node.id, purchased);
                const stateClass = active ? " asc-map-edge--active" : " asc-map-edge--muted";
                let d;
                if (merge) {
                    d = ascensionColumnEdgePath(pp.x, pp.y, merge.x, merge.y) + " " +
                        ascensionColumnEdgePath(merge.x, merge.y, np.x, np.y);
                } else {
                    d = ascensionColumnEdgePath(pp.x, pp.y, np.x, np.y);
                }
                parts.push(
                    "<path class=\"asc-map-edge asc-map-edge--" + r + stateClass + "\" d=\"" + d + "\" />"
                );
            });
        });
        return parts.join("");
    }

    let ascensionMapPanZoomCleanup = null;
    let ascensionMapResizeObserver = null;
    const ascensionMapPanZoomState = { scale: 1, tx: 0, ty: 0 };

    function updateAscensionMapDetailPanel() {
        const titleEl = document.getElementById("ascension-map-detail-title");
        const effectEl = document.getElementById("ascension-map-detail-effect");
        const metaEl = document.getElementById("ascension-map-detail-meta");
        const kickerEl = document.getElementById("ascension-map-detail-kicker");
        if (!titleEl || !effectEl || !metaEl) return;
        const id = getAscensionMapDetailPanelSourceNodeId();
        if (kickerEl) kickerEl.textContent = "";
        if (!id || !getNodeById()[id]) {
            titleEl.textContent = "Ascension node";
            effectEl.textContent = "Hover or click a skill gem on the map to inspect it. Click also attempts purchase when affordable.";
            metaEl.textContent = "";
            return;
        }
        const def = getNodeById()[id];
        const owned = ascensionPurchasedSet().has(id);
        const prereqOk = ascensionNodePrereqsMet(id);
        const cost = getAscensionNodePurchaseCost(id);
        const chain = getAscensionPurchaseChainInfoToNode(id);
        let status = owned ? "Owned" : (prereqOk ? "Available" : "Locked");
        if (kickerEl) kickerEl.textContent = (def.route || "").charAt(0).toUpperCase() + (def.route || "").slice(1) + " · " + (def.finger || "");
        titleEl.textContent = def.title || id;
        effectEl.textContent = def.effect || "";
        let meta = "Essence cost: " + formatCount(cost) +
            " · Cost to here: " + formatCount(chain.missingCost) +
            " · Chain: " + chain.ownedCount + "/" + chain.totalCount + " owned" +
            " · " + status;
        if (!owned) meta += " · Your pool: " + formatCount(deps.getNumber1AscensionEssence());
        metaEl.textContent = meta;
    }

    const ASCENSION_MAP_PICK_RADIUS_VB = 0.78;
    let ascensionMapSelectedNodeId = null;
    let ascensionMapHoverNodeId = null;

    function getAscensionMapDetailPanelSourceNodeId() {
        return ascensionMapHoverNodeId || ascensionMapSelectedNodeId;
    }

    function syncAscensionMapNodeDomPositions() {
        const viewport = document.getElementById("ascension-map-viewport");
        if (!viewport) return;
        const svg = viewport.querySelector(".ascension-map-svg");
        const world = viewport.querySelector(".ascension-map-world");
        if (!svg || !world) return;
        const W = svg.clientWidth;
        const H = svg.clientHeight;
        if (!Number.isFinite(W) || !Number.isFinite(H) || W < 2 || H < 2) return;
        const rect = viewport.getBoundingClientRect();
        const ctm = svg.getScreenCTM();
        if (!ctm || typeof svg.createSVGPoint !== "function") return;
        function toViewportPoint(vbX, vbY) {
            const pt = svg.createSVGPoint();
            pt.x = vbX;
            pt.y = vbY;
            const sp = pt.matrixTransform(ctm);
            return { x: sp.x - rect.left, y: sp.y - rect.top };
        }
        world.querySelectorAll(".asc-map-node[data-asc-vbx]").forEach(function (el) {
            const nx = parseFloat(el.getAttribute("data-asc-vbx"));
            const ny = parseFloat(el.getAttribute("data-asc-vby"));
            if (!Number.isFinite(nx) || !Number.isFinite(ny)) return;
            const p = toViewportPoint(nx, ny);
            el.style.left = p.x + "px";
            el.style.top = p.y + "px";
        });
        const handEl = world.querySelector(".ascension-hand-backdrop");
        if (handEl) {
            const exp = deps.getAscensionTreeExport && deps.getAscensionTreeExport();
            const hub = (exp && exp.HUB_CENTER) ? exp.HUB_CENTER : { x: 50, y: 51 };
            const hp = toViewportPoint(Number(hub.x) || 50, Number(hub.y) || 51);
            handEl.style.left = hp.x + "px";
            handEl.style.top = hp.y + "px";
        }
        updateAscensionMapDetailPanel();
    }

    function ascensionMapDebugEnabled() {
        try {
            if (typeof localStorage !== "undefined" && localStorage.getItem("ascensionMapDebug") === "1") return true;
        } catch (e) {}
        try {
            return typeof location !== "undefined" && /(?:\?|&)ascdev=1(?:&|$)/.test(String(location.search || ""));
        } catch (e2) {
            return false;
        }
    }

    function ascensionClientToViewBox(svgEl, clientX, clientY) {
        if (!svgEl || typeof svgEl.createSVGPoint !== "function") return null;
        const pt = svgEl.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const ctm = svgEl.getScreenCTM();
        if (!ctm) return null;
        let inv;
        try {
            inv = ctm.inverse();
        } catch (e) {
            return null;
        }
        const loc = pt.matrixTransform(inv);
        return { x: loc.x, y: loc.y };
    }

    function ascensionPickNearestNodeId(vbX, vbY) {
        const L = computeAscensionHandLayout();
        let best = null;
        let bestD = ASCENSION_MAP_PICK_RADIUS_VB;
        getNodes().forEach(function (node) {
            const p = L[node.id];
            if (!p) return;
            const d = Math.hypot(p.x - vbX, p.y - vbY);
            if (d < bestD) {
                bestD = d;
                best = node.id;
            }
        });
        return best;
    }

    function ascensionResolveNodeIdAtClient(clientX, clientY) {
        const viewport = document.getElementById("ascension-map-viewport");
        if (!viewport) return null;
        const svg = viewport.querySelector(".ascension-map-svg");
        if (!svg) return null;
        const vb = ascensionClientToViewBox(svg, clientX, clientY);
        if (!vb) return null;
        return ascensionPickNearestNodeId(vb.x, vb.y);
    }

    function setAscensionMapSelectedNode(id, skipIfSame) {
        if (skipIfSame && id === ascensionMapSelectedNodeId) return;
        ascensionMapSelectedNodeId = id || null;
        document.querySelectorAll(".asc-map-node.asc-map-node--selected").forEach(function (el) {
            el.classList.remove("asc-map-node--selected");
        });
        if (id) {
            const nodeEl = document.querySelector(".asc-map-node[data-asc-node-id=\"" + String(id).replace(/"/g, "") + "\"]");
            if (nodeEl) nodeEl.classList.add("asc-map-node--selected");
        }
        updateAscensionMapDetailPanel();
    }

    function teardownAscensionMapPanZoom() {
        if (ascensionMapResizeObserver) {
            ascensionMapResizeObserver.disconnect();
            ascensionMapResizeObserver = null;
        }
        if (typeof ascensionMapPanZoomCleanup === "function") {
            ascensionMapPanZoomCleanup();
            ascensionMapPanZoomCleanup = null;
        }
    }

    function initAscensionMapPanZoom() {
        teardownAscensionMapPanZoom();
        const viewport = document.getElementById("ascension-map-viewport");
        const layer = document.getElementById("ascension-map-pan-zoom");
        if (!viewport || !layer) return;
        ascensionMapHoverNodeId = null;
        const nodesLayer = viewport.querySelector(".ascension-map-nodes-layer");
        function onAscensionNodesPointerOver(e) {
            if (!deps.hasAscended() || !nodesLayer) return;
            const node = e.target && typeof e.target.closest === "function" ? e.target.closest(".asc-map-node") : null;
            if (!node || !nodesLayer.contains(node)) return;
            const hid = ascensionResolveNodeIdAtClient(e.clientX, e.clientY) || node.getAttribute("data-asc-node-id");
            if (!hid) return;
            if (ascensionMapHoverNodeId !== hid) {
                ascensionMapHoverNodeId = hid;
                updateAscensionMapDetailPanel();
            }
        }
        function onAscensionNodesPointerOut(e) {
            if (!deps.hasAscended() || !nodesLayer) return;
            const node = e.target && typeof e.target.closest === "function" ? e.target.closest(".asc-map-node") : null;
            if (!node || !nodesLayer.contains(node)) return;
            const related = e.relatedTarget;
            if (related && typeof related.closest === "function") {
                const nextNode = related.closest(".asc-map-node");
                if (nextNode && nodesLayer.contains(nextNode)) return;
            }
            ascensionMapHoverNodeId = null;
            updateAscensionMapDetailPanel();
        }
        if (nodesLayer) {
            nodesLayer.addEventListener("pointerover", onAscensionNodesPointerOver);
            nodesLayer.addEventListener("pointerout", onAscensionNodesPointerOut);
        }
        ascensionMapPanZoomState.scale = 1;
        ascensionMapPanZoomState.tx = 0;
        ascensionMapPanZoomState.ty = 0;
        layer.style.transform = "none";
        function scheduleAscensionNodeLayoutSync() {
            syncAscensionMapNodeDomPositions();
            requestAnimationFrame(syncAscensionMapNodeDomPositions);
        }
        let ascensionResizeSyncRaf = 0;
        function requestDebouncedAscensionNodeLayoutSync() {
            if (ascensionResizeSyncRaf) return;
            ascensionResizeSyncRaf = requestAnimationFrame(function () {
                ascensionResizeSyncRaf = 0;
                scheduleAscensionNodeLayoutSync();
            });
        }
        scheduleAscensionNodeLayoutSync();
        if (ascensionMapSelectedNodeId) {
            setAscensionMapSelectedNode(ascensionMapSelectedNodeId, false);
        } else {
            updateAscensionMapDetailPanel();
        }
        if (typeof ResizeObserver !== "undefined") {
            ascensionMapResizeObserver = new ResizeObserver(requestDebouncedAscensionNodeLayoutSync);
            ascensionMapResizeObserver.observe(viewport);
        }
        ascensionMapPanZoomCleanup = function () {
            if (ascensionResizeSyncRaf) {
                cancelAnimationFrame(ascensionResizeSyncRaf);
                ascensionResizeSyncRaf = 0;
            }
            ascensionMapHoverNodeId = null;
            if (nodesLayer) {
                nodesLayer.removeEventListener("pointerover", onAscensionNodesPointerOver);
                nodesLayer.removeEventListener("pointerout", onAscensionNodesPointerOut);
            }
        };
    }

    function renderAscensionMapDebugOverlaySvg() {
        if (!ascensionMapDebugEnabled()) return "";
        const exp = deps.getAscensionTreeExport && deps.getAscensionTreeExport();
        const H = (exp && exp.HUB_CENTER) || { x: 50, y: 51 };
        const tips = (exp && exp.FINGERTIP_TARGETS) || {};
        const vbH = ascensionMapViewBoxHeight;
        const lines = [];
        let g;
        for (g = 0; g <= 100; g += 10) {
            lines.push("<line class=\"asc-map-debug-line\" x1=\"" + g + "\" y1=\"0\" x2=\"" + g + "\" y2=\"" + vbH + "\" />");
            lines.push("<line class=\"asc-map-debug-line\" x1=\"0\" y1=\"" + g + "\" x2=\"100\" y2=\"" + g + "\" />");
        }
        let dots = "<circle class=\"asc-map-debug-hub\" cx=\"" + H.x + "\" cy=\"" + H.y + "\" r=\"0.85\" />";
        Object.keys(tips).forEach(function (k) {
            const t = tips[k];
            if (t && typeof t.x === "number" && typeof t.y === "number") {
                dots += "<circle class=\"asc-map-debug-tip\" cx=\"" + t.x + "\" cy=\"" + t.y + "\" r=\"0.6\" />";
            }
        });
        return "<svg class=\"ascension-map-debug-svg\" viewBox=\"0 0 100 " + vbH + "\" preserveAspectRatio=\"xMidYMid meet\" aria-hidden=\"true\">" + lines.join("") + dots + "</svg>";
    }

    return {
        ascensionPickNearestNodeId,
        ascensionResolveNodeIdAtClient,
        ascensionClientToViewBox,
        ascensionMapDebugEnabled,
        ascensionNodeDisplayName,
        ascensionNodePrereqsMet,
        computeAscensionHandLayout,
        getAscensionMapViewBoxHeight: () => ascensionMapViewBoxHeight,
        getAscensionNodePurchaseCost,
        getAscensionPurchaseChainInfoToNode,
        initAscensionMapPanZoom,
        renderAscensionMapColumnGuidesSvg,
        renderAscensionMapDebugOverlaySvg,
        renderAscensionMapEdgesSvg,
        setAscensionMapSelectedNode,
        syncAscensionMapNodeDomPositions,
        teardownAscensionMapPanZoom,
        updateAscensionMapDetailPanel,
        getAscensionMapDetailPanelSourceNodeId,
    };
}
