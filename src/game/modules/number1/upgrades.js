// Number 1 Upgrades Module
// Merged from: n1-upgrades.js, n1-upgrade-eta.js, n1-upgrade-ui-controller.js

// ==================== UPGRADE COST CALCULATIONS (from n1-upgrades.js) ====================

export const BASE_MAX_CHEAPEN_LEVEL = 10;
export const DEV_CHEAPEN_AUTOBUY_DELAY = 0.1;
export const DEV_SLOWDOWN_AUTOBUY_DELAY = 0.1;
export const SLOWDOWN_UNLOCK_COUNT = 1e15;
export const MAX_SLOWDOWN_LEVEL = 4;

const CHEAPEN_EXTENDED_COST_BASE = 1e9;
const CHEAPEN_LEGACY_MAX_NEXT_LEVEL = 6;
const CHEAPEN_EXTENDED_START_NEXT_LEVEL = 7;
const CHEAPEN_COST_LEVEL_10_RAW = 1.5e24;
const CHEAPEN_COST_RAW_BY_NEXT_LEVEL = [
    1.5e27,
    1.5e30,
    1.5e33,
    1.5e36,
    1.5e39,
    1.5e42
];

const SLOWDOWN_COSTS = [1e16, 1e19, 1e22];
const SLOWDOWN_COST_LEVEL_4_RAW = 10e24;

export function getEffectiveUpgradeLevel(baseLevel, bonusLevel) {
    return Math.max(0, (baseLevel ?? 0) + (bonusLevel ?? 0));
}

export function getSpeedMultiplierForLevel(level) {
    if (level === 0) return 1;
    return Math.pow(2, level);
}

/** Exact 2^level for tick math (float Math.pow loses integers past ~2^53). */
export function getSpeedMultiplierBigForLevel(level) {
    const lv = level | 0;
    if (lv <= 0) return 1n;
    return 1n << BigInt(lv);
}

export function getSpeedUpgradeCost(nextLevel, cheapenMultiplier, ascensionSpeedCostMultiplier) {
    const baseCost = 10 + Math.floor(Math.pow(4, nextLevel));
    return Math.max(1, Math.floor(baseCost * cheapenMultiplier * ascensionSpeedCostMultiplier));
}

export function getCheapenMultiplierForLevel(level) {
    return level === 0 ? 1 : Math.pow(10, -(level + 1));
}

export function getCheapenUpgradeCost(nextLevel) {
    const n = Math.max(1, Math.floor(Number(nextLevel) || 1));
    if (n <= CHEAPEN_LEGACY_MAX_NEXT_LEVEL) {
        return 1000 * Math.pow(10, n - 1);
    }
    if (n === 10) {
        return Math.floor(CHEAPEN_COST_LEVEL_10_RAW);
    }
    if (n > 10) {
        const idx = n - 11;
        if (idx >= 0 && idx < CHEAPEN_COST_RAW_BY_NEXT_LEVEL.length) {
            return Math.floor(CHEAPEN_COST_RAW_BY_NEXT_LEVEL[idx]);
        }
        const last = CHEAPEN_COST_RAW_BY_NEXT_LEVEL[CHEAPEN_COST_RAW_BY_NEXT_LEVEL.length - 1];
        const extraTiers = idx - CHEAPEN_COST_RAW_BY_NEXT_LEVEL.length + 1;
        return Math.floor(last * Math.pow(1000, extraTiers));
    }
    return Math.floor(CHEAPEN_EXTENDED_COST_BASE * Math.pow(1000, n - CHEAPEN_EXTENDED_START_NEXT_LEVEL));
}

/** Discount / wording for a given achieved Cheapen level (1...cap). */
export function getCheapenEffectTextForAchievedLevel(level) {
    if (level <= 0) return "";
    if (level === 1) return "99% off speed upgrade cost";
    const decimals = level - 1;
    return "99." + "9".repeat(decimals) + "% off speed upgrade cost";
}

export function getSlowdownMultiplierForLevel(level) {
    if (level <= 0) return 1;
    return Math.pow(10, level);
}

export function getSlowdownUpgradeCost(nextLevel, cap, ascensionCostMultiplier) {
    if (nextLevel <= 0 || nextLevel > cap) return null;
    let raw;
    if (nextLevel === 4) {
        raw = SLOWDOWN_COST_LEVEL_4_RAW;
    } else {
        const idx = Math.min(SLOWDOWN_COSTS.length - 1, nextLevel - 1);
        raw = SLOWDOWN_COSTS[idx] * Math.pow(10, Math.max(0, nextLevel - SLOWDOWN_COSTS.length));
    }
    return Math.max(1, Math.floor(raw * (ascensionCostMultiplier || 1)));
}

// ==================== UPGRADE ETA CALCULATIONS (from n1-upgrade-eta.js) ====================

export const UPGRADE_ETA_CPS_SMOOTH_ALPHA = 0.08;

/** Human-readable duration for upgrade ETA: seconds if <60s, else whole minutes until multi-day/year. */
export function formatUpgradeAffordEtaDuration(secRaw) {
    if (!Number.isFinite(secRaw) || secRaw < 0) return "—";
    if (secRaw > 1e15) return "very long at current rate";
    if (secRaw < 60) {
        const s = Math.max(1, Math.ceil(secRaw));
        return "~" + s + "s at current rate";
    }
    if (secRaw < 86400 * 2) {
        const min = Math.max(1, Math.round(secRaw / 60));
        return "~" + min + " min at current rate";
    }
    if (secRaw < 86400 * 365) {
        const d = Math.max(1, Math.round(secRaw / 86400));
        return "~" + d + " d at current rate";
    }
    const y = secRaw / (86400 * 365);
    return "~" + (y >= 100 ? Math.round(y) + " yr" : Math.round(y * 10) / 10 + " yr") + " at current rate";
}

/**
 * @param {{ getHandEffectiveCps: (handIndex: number) => number }} deps
 */
export function createUpgradeEtaSmoother(deps) {
    const { getHandEffectiveCps } = deps;
    let passId = 0;
    /** @type {number[]} */
    const smoothedCpsByHand = [];
    /** @type {number[]} */
    const lastPassByHand = [];

    function bumpPass() {
        passId++;
    }

    function getSmoothedHandCpsForUpgradeEta(handIndex) {
        while (lastPassByHand.length <= handIndex) {
            lastPassByHand.push(-1);
            smoothedCpsByHand.push(0);
        }
        const pass = passId;
        const instant = getHandEffectiveCps(handIndex);
        if (lastPassByHand[handIndex] !== pass) {
            lastPassByHand[handIndex] = pass;
            const prev = smoothedCpsByHand[handIndex];
            /** @type {number} */
            let next;
            if (!(instant > 0)) {
                next = prev > 0 ? Math.max(0, prev * (1 - UPGRADE_ETA_CPS_SMOOTH_ALPHA * 2.5)) : 0;
            } else if (!(prev > 0)) {
                next = instant;
            } else {
                next = prev + UPGRADE_ETA_CPS_SMOOTH_ALPHA * (instant - prev);
            }
            smoothedCpsByHand[handIndex] = next;
        }
        return smoothedCpsByHand[handIndex];
    }

    /** ETA line for upgrade tooltips: covers cost shortfall at smoothed CPS for this hand. */
    function formatAffordEtaLine(balance, cost, handIndex) {
        const c = Number(cost);
        if (!Number.isFinite(c) || c <= 0) return "";
        const bal = Number(balance) || 0;
        const need = c - bal;
        if (need <= 0) return "\nEst.: ready now";
        const cps = getSmoothedHandCpsForUpgradeEta(handIndex);
        if (!(cps > 0)) return "\nEst.: — (no count/s on this hand right now)";
        const secRaw = need / cps;
        if (!Number.isFinite(secRaw)) return "\nEst.: —";
        return "\nEst.: " + formatUpgradeAffordEtaDuration(secRaw);
    }

    return { bumpPass, getSmoothedHandCpsForUpgradeEta, formatAffordEtaLine };
}

// ==================== UPGRADE UI CONTROLLER (from n1-upgrade-ui-controller.js) ====================

import { GAME_LOOP_MS } from "./core.js";
import { TIME_WARP_MANUAL_CLICK_SCALE } from "./time-warp.js";
import { applyAffordableUpgradeBurstForHand, isCollapseAutobuyBurstUnlocked } from "./autobuy-burst.js";

export { applyAffordableUpgradeBurstForHand, isCollapseAutobuyBurstUnlocked } from "./autobuy-burst.js";

/** Per-hand upgrade column DOM, tooltips, hold-repeat, and pointer listeners. Buy + UI refresh stay in boot. */
export function createUpgradeUiController(coreDeps) {
    const {
        speedUpgradesContainerEl,
        turboScensionPanelEl,
        getUnlockedHands,
        ascensionAutobuyDefaultOnForNewHands,
        autoBuyEnabledByHand,
        autoBuyCountdownSecondsByHand,
        getTimeWarpProductionSecondsBonus
    } = coreDeps;

    const speedRowRefs = [];
    const SPEED_AUTOBUY_TOAST_MS = 720;
    const speedAutobuyToastClearTimers = [];
    const UPGRADE_HOLD_REPEAT_MS = 100;
    /** Hover-only: detail tooltip waits this long before showing (focus / tap-to-pin stay immediate). */
    const UPGRADE_TOOLTIP_HOVER_DELAY_MS = 1500;
    const upgradeTooltipHoverTimers = new WeakMap();
    const handStatusTooltipHoverTimers = new WeakMap();

    function clearUpgradeTooltipHoverTimer(btn) {
        const id = upgradeTooltipHoverTimers.get(btn);
        if (id) clearTimeout(id);
        upgradeTooltipHoverTimers.delete(btn);
    }
    function cancelUpgradeTooltipHoverShow(btn) {
        clearUpgradeTooltipHoverTimer(btn);
        if (btn) btn.classList.remove("upgrade-tooltip-hover-show");
    }
    function scheduleUpgradeTooltipHoverShow(btn) {
        cancelUpgradeTooltipHoverShow(btn);
        const id = setTimeout(function() {
            upgradeTooltipHoverTimers.delete(btn);
            if (!btn || !btn.isConnected) return;
            btn.classList.add("upgrade-tooltip-hover-show");
            requestAnimationFrame(function() {
                positionTooltipForHost(btn);
            });
        }, UPGRADE_TOOLTIP_HOVER_DELAY_MS);
        upgradeTooltipHoverTimers.set(btn, id);
    }
    function clearHandStatusTooltipHoverTimer(slot) {
        const id = handStatusTooltipHoverTimers.get(slot);
        if (id) clearTimeout(id);
        handStatusTooltipHoverTimers.delete(slot);
    }
    function cancelHandStatusTooltipHoverShow(slot) {
        clearHandStatusTooltipHoverTimer(slot);
        if (slot) slot.classList.remove("hand-status-tooltip-hover-show");
    }
    /** Drop mouse-click focus so :focus-visible tooltips do not stay open after pointer leave. */
    function blurHandSlotPointerFocus(slot) {
        if (!slot || typeof slot.matches !== "function") return;
        const ae = document.activeElement;
        if (!ae || !(ae === slot || slot.contains(ae))) return;
        if (ae === slot) {
            if (slot.matches(":focus:not(:focus-visible)")) slot.blur();
            return;
        }
        if (typeof ae.matches === "function" && ae.matches(":focus:not(:focus-visible)")) ae.blur();
    }
    function scheduleHandStatusTooltipHoverShow(slot) {
        cancelHandStatusTooltipHoverShow(slot);
        const id = setTimeout(function() {
            handStatusTooltipHoverTimers.delete(slot);
            if (!slot || !slot.isConnected) return;
            slot.classList.add("hand-status-tooltip-hover-show");
        }, UPGRADE_TOOLTIP_HOVER_DELAY_MS);
        handStatusTooltipHoverTimers.set(slot, id);
    }
    /** Per-hand-slot hover delay (matches upgrade button tooltips); keyboard :focus-visible stays immediate via CSS. */
    function bindHandStatusTooltipHover(handSlot) {
        if (!handSlot || handSlot.dataset.handStatusTooltipHoverBound === "1") return;
        handSlot.dataset.handStatusTooltipHoverBound = "1";
        function onPointerIn(e) {
            const pt = e && e.pointerType;
            if (pt && pt !== "mouse" && pt !== "pen") return;
            scheduleHandStatusTooltipHoverShow(handSlot);
        }
        handSlot.addEventListener("pointerenter", onPointerIn);
        function onPointerOut(e) {
            const pt = e && e.pointerType;
            if (pt && pt !== "mouse" && pt !== "pen") return;
            cancelHandStatusTooltipHoverShow(handSlot);
            blurHandSlotPointerFocus(handSlot);
        }
        handSlot.addEventListener("pointerleave", onPointerOut);
    }

    function positionTooltipForHost(host) {
        const tip = host && host.querySelector(".upgrade-details-tooltip");
        if (!tip) return;
        const prevDisplay = tip.style.display;
        const prevVisibility = tip.style.visibility;
        const hiddenByCss = getComputedStyle(tip).display === "none";
        if (hiddenByCss) {
            tip.style.visibility = "hidden";
            tip.style.display = "block";
        }
        const margin = 8;
        const btnRect = host.getBoundingClientRect();
        const tipRect = tip.getBoundingClientRect();
        let left = btnRect.left;
        if (left + tipRect.width > window.innerWidth - margin) left = window.innerWidth - margin - tipRect.width;
        if (left < margin) left = margin;
        let top = btnRect.bottom + 8;
        if (top + tipRect.height > window.innerHeight - margin) {
            top = btnRect.top - tipRect.height - 8;
        }
        if (top < margin) top = margin;
        tip.style.left = Math.round(left) + "px";
        tip.style.top = Math.round(top) + "px";
        if (hiddenByCss) {
            tip.style.display = prevDisplay;
            tip.style.visibility = prevVisibility;
        }
    }

    function dismissAllHandStatusHoverTooltips() {
        if (!speedUpgradesContainerEl) return;
        speedUpgradesContainerEl.querySelectorAll(".hand-slot").forEach(function(slot) {
            cancelHandStatusTooltipHoverShow(slot);
            blurHandSlotPointerFocus(slot);
        });
    }
    /** Clear delayed hover tooltips only (not pinned `tooltip-open`). */
    function dismissAllHoverOnlyTooltips() {
        dismissAllHandStatusHoverTooltips();
        if (speedUpgradesContainerEl) {
            speedUpgradesContainerEl.querySelectorAll(".upgrade-btn.upgrade-tooltip-hover-show").forEach(cancelUpgradeTooltipHoverShow);
        }
        if (turboScensionPanelEl) {
            turboScensionPanelEl.querySelectorAll(".turbo-scension-tooltip-host.upgrade-tooltip-hover-show").forEach(cancelUpgradeTooltipHoverShow);
        }
    }
    function pointerEventInsideTooltipHoverHost(el) {
        if (!el || typeof el.closest !== "function") return false;
        return !!(
            el.closest(".hand-slot") ||
            el.closest(".upgrade-btn") ||
            el.closest(".turbo-scension-tooltip-host")
        );
    }

    /** When the mouse/pen moves anywhere not over a tooltip host, drop hover-only tooltips (fixes stuck overlays). */
    function bindGlobalPointerMoveDismissHoverTooltips() {
        if (document.documentElement.dataset.nafTooltipGlobalMoveDismissBound === "1") return;
        document.documentElement.dataset.nafTooltipGlobalMoveDismissBound = "1";
        let tooltipGlobalPointerMoveFlushRaf = 0;
        let tooltipGlobalPointerMoveX = 0;
        let tooltipGlobalPointerMoveY = 0;
        document.addEventListener(
            "pointermove",
            function (e) {
                const pt = e.pointerType;
                if (pt && pt !== "mouse" && pt !== "pen") return;
                tooltipGlobalPointerMoveX = e.clientX;
                tooltipGlobalPointerMoveY = e.clientY;
                if (tooltipGlobalPointerMoveFlushRaf) return;
                tooltipGlobalPointerMoveFlushRaf = requestAnimationFrame(function () {
                    tooltipGlobalPointerMoveFlushRaf = 0;
                    let el = null;
                    try {
                        el = document.elementFromPoint(tooltipGlobalPointerMoveX, tooltipGlobalPointerMoveY);
                    } catch (_) {
                        return;
                    }
                    if (pointerEventInsideTooltipHoverHost(el)) return;
                    dismissAllHoverOnlyTooltips();
                });
            },
            true
        );
    }
    /** Dismiss floating hand details when the user presses in the upgrade column (avoids hover/focus tooltip blocking clicks). */
    function bindHandStatusDismissOnUpgradeColumnPointerDown() {
        if (!speedUpgradesContainerEl || speedUpgradesContainerEl.dataset.handStatusUpgradeColDismissBound === "1") return;
        speedUpgradesContainerEl.dataset.handStatusUpgradeColDismissBound = "1";
        speedUpgradesContainerEl.addEventListener(
            "pointerdown",
            function (e) {
                const t = e.target;
                if (!t || typeof t.closest !== "function") return;
                if (t.closest(".hand-upgrades-column")) dismissAllHoverOnlyTooltips();
            },
            true
        );
    }

    function positionTooltipForButton(btn) {
        positionTooltipForHost(btn);
    }
    function positionVisibleTooltips() {
        if (speedUpgradesContainerEl) {
            speedUpgradesContainerEl.querySelectorAll(".upgrade-btn.tooltip-open, .upgrade-btn.upgrade-tooltip-hover-show, .upgrade-btn:focus-within").forEach(positionTooltipForHost);
        }
        if (turboScensionPanelEl) {
            turboScensionPanelEl.querySelectorAll(".turbo-scension-tooltip-host.upgrade-tooltip-hover-show, .turbo-scension-tooltip-host:focus-within, .turbo-scension-tooltip-host.tooltip-open").forEach(positionTooltipForHost);
        }
    }

    /** Per-button mouseenter/leave avoids delegated mouseout false positives (e.g. sibling Autobuy, layout) that reset the hover timer. */
    function bindUpgradeTooltipHoverOnRow(row) {
        if (!row) return;
        row.querySelectorAll(".upgrade-btn").forEach(function(b) {
            if (b.dataset.tooltipHoverBound === "1") return;
            b.dataset.tooltipHoverBound = "1";
            function onPointerIn() {
                scheduleUpgradeTooltipHoverShow(b);
                requestAnimationFrame(function() {
                    if (b.classList.contains("upgrade-tooltip-hover-show") || b.classList.contains("tooltip-open")) {
                        positionTooltipForHost(b);
                    }
                });
            }
            b.addEventListener("mouseenter", onPointerIn);
            b.addEventListener("pointerenter", onPointerIn);
            function onPointerOut() {
                cancelUpgradeTooltipHoverShow(b);
            }
            b.addEventListener("mouseleave", onPointerOut);
            b.addEventListener("pointerleave", onPointerOut);
        });
    }
    function bindTurboScensionTooltipHovers() {
        if (!turboScensionPanelEl) return;
        turboScensionPanelEl.querySelectorAll(".turbo-scension-tooltip-host").forEach(function(host) {
            if (host.dataset.turboScensionTooltipHoverBound === "1") return;
            host.dataset.turboScensionTooltipHoverBound = "1";
            function onPointerIn() {
                scheduleUpgradeTooltipHoverShow(host);
                requestAnimationFrame(function() {
                    if (host.classList.contains("upgrade-tooltip-hover-show") || host.classList.contains("tooltip-open")) {
                        positionTooltipForHost(host);
                    }
                });
            }
            host.addEventListener("mouseenter", onPointerIn);
            host.addEventListener("pointerenter", onPointerIn);
            function onPointerOut() {
                cancelUpgradeTooltipHoverShow(host);
            }
            host.addEventListener("mouseleave", onPointerOut);
            host.addEventListener("pointerleave", onPointerOut);
        });
    }

    bindTurboScensionTooltipHovers();
    bindHandStatusDismissOnUpgradeColumnPointerDown();
    bindGlobalPointerMoveDismissHoverTooltips();

    let upgradeHoldRepeatState = null;
    let upgradeHoldSuppressClickBtn = null;
    let upgradeHoldRepeatTipLogged = false;

    function stopUpgradeHoldRepeat(setSuppressForClick) {
        if (!upgradeHoldRepeatState) return;
        clearInterval(upgradeHoldRepeatState.intervalId);
        if (setSuppressForClick) upgradeHoldSuppressClickBtn = upgradeHoldRepeatState.buttonEl;
        upgradeHoldRepeatState = null;
    }

    function flashSpeedAutobuyToast(handIndex, text) {
        if (handIndex < 0) return;
        const t = String(text || "").trim();
        if (!t) return;
        const ref = speedRowRefs[handIndex];
        if (!ref || !ref.autobuyToastEl) return;
        const el = ref.autobuyToastEl;
        const prevId = speedAutobuyToastClearTimers[handIndex];
        if (prevId) window.clearTimeout(prevId);
        el.textContent = t;
        el.classList.remove("speed-autobuy-toast--flash");
        void el.offsetWidth;
        el.classList.add("speed-autobuy-toast--flash");
        speedAutobuyToastClearTimers[handIndex] = window.setTimeout(() => {
            speedAutobuyToastClearTimers[handIndex] = 0;
            if (el.isConnected) {
                el.classList.remove("speed-autobuy-toast--flash");
                el.textContent = "";
            }
        }, SPEED_AUTOBUY_TOAST_MS);
    }

    function ensureSpeedRows() {
        if (!speedUpgradesContainerEl) return;
        const unlockedHands = getUnlockedHands();
        while (autoBuyEnabledByHand.length < unlockedHands) {
            autoBuyEnabledByHand.push(ascensionAutobuyDefaultOnForNewHands());
        }
        while (autoBuyCountdownSecondsByHand.length < unlockedHands) autoBuyCountdownSecondsByHand.push(0);
        const twBonus = String(getTimeWarpProductionSecondsBonus());
        while (speedRowRefs.length < unlockedHands) {
            const i = speedRowRefs.length;
            const handNum = i + 1;
            const wrapper = document.createElement("div");
            wrapper.className = "hand-upgrade-row";
            wrapper.setAttribute("data-hand-index", String(i));
            const handCol = document.createElement("div");
            handCol.className = "hand-left-column";
            const handSlot = document.createElement("div");
            handSlot.className = "hand-slot";
            handSlot.setAttribute("tabindex", "0");
            handSlot.setAttribute("aria-label", "Hand " + handNum + " — hover or focus for production details");
            const auraBtn = document.createElement("button");
            auraBtn.type = "button";
            auraBtn.className = "time-warp-aura-btn";
            auraBtn.setAttribute("data-hand-index", String(i));
            auraBtn.setAttribute("aria-label", "Activate Time Warp aura for hand " + handNum + " (" + TIME_WARP_MANUAL_CLICK_SCALE + "× " + twBonus + " seconds of effective production)");
            auraBtn.title = "Grants " + TIME_WARP_MANUAL_CLICK_SCALE + "× " + twBonus + "s of this hand's effective rate";
            auraBtn.style.display = "none";
            auraBtn.textContent = "Time Warp";
            const handSlotMain = document.createElement("div");
            handSlotMain.className = "hand-slot-main";
            handSlotMain.appendChild(auraBtn);
            const handHeadingLabel = document.createElement("span");
            handHeadingLabel.className = "speed-upgrade-label hand-slot-hand-label";
            handHeadingLabel.textContent = "Hand " + handNum;
            handHeadingLabel.setAttribute("aria-hidden", "true");
            handSlotMain.appendChild(handHeadingLabel);
            const statusBlock = document.createElement("div");
            statusBlock.className = "hand-status-block";
            statusBlock.setAttribute("role", "group");
            statusBlock.setAttribute("aria-label", "Hand " + handNum + " production");
            statusBlock.innerHTML = "<div class=\"hand-status-expanded\">" +
                "<div class=\"hand-status-line\"><span class=\"hand-status-k\">Count</span> <span class=\"hand-status-v hand-status-count\"></span></div>" +
                "<div class=\"hand-status-line\"><span class=\"hand-status-k\">Base CPS</span> <span class=\"hand-status-v hand-status-base\"></span></div>" +
                "<div class=\"hand-status-line\"><span class=\"hand-status-k\">Effective CPS</span> <span class=\"hand-status-v hand-status-effective\"></span></div>" +
                "<div class=\"hand-status-formula\" aria-hidden=\"true\"></div></div>" +
                "<div class=\"hand-status-compact\" aria-hidden=\"true\"></div>";
            handSlot.appendChild(handSlotMain);
            handSlot.appendChild(statusBlock);
            handCol.appendChild(handSlot);
            bindHandStatusTooltipHover(handSlot);
            const row = document.createElement("div");
            row.className = "speed-upgrade-row";
            row.setAttribute("data-hand-index", String(i));
            row.innerHTML = "<span class=\"upgrade-pillar upgrade-pillar--speed\">" +
                "<span class=\"upgrade-pillar-heading\">Speed</span>" +
                "<button type=\"button\" class=\"upgrade-btn speed-upgrade-btn\" data-hand-index=\"" + i + "\">" +
                "<span class=\"upgrade-btn-fill\"></span>" +
                "<span class=\"upgrade-btn-body\"><span class=\"upgrade-btn-level\"></span><span class=\"upgrade-btn-label\">Upgrade</span></span>" +
                "<span class=\"upgrade-details-tooltip\" role=\"tooltip\"></span>" +
                "</button></span>" +
                "<span class=\"speed-autobuy-stack\"><span class=\"speed-autobuy-head\"><label class=\"speed-autobuy-wrap\"><input type=\"checkbox\" class=\"speed-autobuy-toggle\" data-hand-index=\"" + i + "\"><span class=\"speed-autobuy-switch\"><span class=\"speed-autobuy-knob\"></span></span><span class=\"speed-autobuy-label\">Autobuy</span></label></span><span class=\"speed-autobuy-foot\"><span class=\"speed-autobuy-message\"></span><span class=\"speed-autobuy-toast\" aria-live=\"polite\"></span></span></span>" +
                "<span class=\"upgrade-row-cheapen\" style=\"display: none;\">" +
                "<span class=\"upgrade-pillar upgrade-pillar--cheapen\">" +
                "<span class=\"upgrade-pillar-heading\">Cheapen</span>" +
                "<button type=\"button\" class=\"upgrade-btn cheapen-upgrade-btn\" data-hand-index=\"" + i + "\">" +
                "<span class=\"upgrade-btn-fill\"></span>" +
                "<span class=\"upgrade-btn-body\"><span class=\"upgrade-btn-level\"></span><span class=\"upgrade-btn-label\">Cheapen</span></span>" +
                "<span class=\"upgrade-details-tooltip\" role=\"tooltip\"></span>" +
                "</button></span></span>" +
                "<span class=\"upgrade-row-slowdown\" style=\"display: none;\">" +
                "<span class=\"upgrade-pillar upgrade-pillar--slowdown\">" +
                "<span class=\"upgrade-pillar-heading\">Compaction</span>" +
                "<button type=\"button\" class=\"upgrade-btn slowdown-upgrade-btn\" data-hand-index=\"" + i + "\">" +
                "<span class=\"upgrade-btn-fill\"></span>" +
                "<span class=\"upgrade-btn-body\"><span class=\"upgrade-btn-level\"></span><span class=\"upgrade-btn-label\">Compaction</span></span>" +
                "<span class=\"upgrade-details-tooltip\" role=\"tooltip\"></span>" +
                "</button></span></span>";
            const upgradesCol = document.createElement("div");
            upgradesCol.className = "hand-upgrades-column";
            upgradesCol.appendChild(row);
            wrapper.appendChild(handCol);
            wrapper.appendChild(upgradesCol);
            speedUpgradesContainerEl.appendChild(wrapper);
            bindUpgradeTooltipHoverOnRow(row);
            const cheapenWrap = row.querySelector(".upgrade-row-cheapen");
            const slowdownWrap = row.querySelector(".upgrade-row-slowdown");
            speedRowRefs.push({
                handUpgradeRowEl: wrapper,
                handSlotEl: handSlot,
                handMountEl: handSlotMain,
                speedLevelEl: row.querySelector(".speed-upgrade-btn .upgrade-btn-level"),
                btn: row.querySelector(".speed-upgrade-btn"),
                autobuyToggleEl: row.querySelector(".speed-autobuy-toggle"),
                autobuyToastEl: row.querySelector(".speed-autobuy-toast"),
                autobuyMessageEl: row.querySelector(".speed-autobuy-message"),
                cheapenWrapEl: cheapenWrap,
                cheapenLevelEl: row.querySelector(".cheapen-upgrade-btn .upgrade-btn-level"),
                cheapenBtn: row.querySelector(".cheapen-upgrade-btn"),
                slowdownWrapEl: slowdownWrap,
                slowdownLevelEl: row.querySelector(".slowdown-upgrade-btn .upgrade-btn-level"),
                slowdownBtn: row.querySelector(".slowdown-upgrade-btn"),
                timeWarpAuraBtn: auraBtn,
                statusCountEl: statusBlock.querySelector(".hand-status-count"),
                statusBaseEl: statusBlock.querySelector(".hand-status-base"),
                statusEffectiveEl: statusBlock.querySelector(".hand-status-effective"),
                statusFormulaEl: statusBlock.querySelector(".hand-status-formula"),
                statusCompactEl: statusBlock.querySelector(".hand-status-compact")
            });
        }
    }

    function shrinkSpeedRowsTo(keepCount) {
        if (!speedUpgradesContainerEl) return;
        const k = Math.max(0, keepCount | 0);
        while (speedRowRefs.length > k) {
            const removedIdx = speedRowRefs.length - 1;
            const tId = speedAutobuyToastClearTimers[removedIdx];
            if (tId) {
                window.clearTimeout(tId);
                speedAutobuyToastClearTimers[removedIdx] = 0;
            }
            const ref = speedRowRefs.pop();
            const wrapper = ref && ref.handUpgradeRowEl ? ref.handUpgradeRowEl : null;
            if (wrapper && wrapper.parentNode === speedUpgradesContainerEl) {
                speedUpgradesContainerEl.removeChild(wrapper);
            }
        }
    }

    function setUpgradeTooltipText(btn, text) {
        if (!btn) return;
        const tip = btn.querySelector(".upgrade-details-tooltip");
        if (tip) tip.textContent = text || "";
    }
    function setUpgradeButtonProgress(btn, progress01) {
        if (!btn) return;
        const fill = btn.querySelector(".upgrade-btn-fill");
        const p = Math.max(0, Math.min(1, Number(progress01) || 0));
        const pct = (p * 100).toFixed(2) + "%";
        if (fill) fill.style.width = pct;
        let tint = "rgba(72, 98, 220, 0.58)";
        if (btn.classList.contains("cheapen-upgrade-btn")) tint = "rgba(56, 175, 95, 0.58)";
        else if (btn.classList.contains("slowdown-upgrade-btn")) tint = "rgba(235, 130, 48, 0.58)";
        else if (btn.classList.contains("turbo-scension-upgrade-btn")) tint = "rgba(118, 124, 230, 0.58)";
        if (p <= 0) {
            btn.style.backgroundImage = "";
        } else {
            btn.style.backgroundImage = "linear-gradient(90deg, " + tint + " 0 " + pct + ", transparent " + pct + " 100%)";
        }
    }

    function attachUpgradeInteractionListeners(ix) {
        const {
            addToLog,
            buySpeedUpgradeForHand,
            buyCheapenUpgradeForHand,
            buySlowdownUpgradeForHand,
            activateTimeWarpAuraForHand,
            ensureTimeWarpArrays,
            isTimeWarpUnlocked
        } = ix;

        if (speedUpgradesContainerEl) {
            speedUpgradesContainerEl.addEventListener("focusin", function(e) {
                const btn = e.target.closest(".upgrade-btn");
                if (!btn) return;
                clearUpgradeTooltipHoverTimer(btn);
                requestAnimationFrame(() => positionTooltipForHost(btn));
            });
            window.addEventListener("resize", ix.onWindowScrollResizeForUpgrades);
            window.addEventListener("scroll", ix.onWindowScrollResizeForUpgrades, true);
            window.addEventListener("pointerup", function () {
                stopUpgradeHoldRepeat(true);
            }, true);
            window.addEventListener("pointercancel", function () {
                stopUpgradeHoldRepeat(true);
            }, true);
            speedUpgradesContainerEl.addEventListener("pointerdown", function (e) {
                if (e.button != null && e.button !== 0) return;
                const speedBtn = e.target.closest(".speed-upgrade-btn");
                const cheapenBtn = e.target.closest(".cheapen-upgrade-btn");
                const slowdownBtn = e.target.closest(".slowdown-upgrade-btn");
                const btn = speedBtn || cheapenBtn || slowdownBtn;
                if (!btn) return;
                if (btn.disabled) return;
                const handIndex = parseInt(btn.getAttribute("data-hand-index"), 10);
                if (isNaN(handIndex) || handIndex < 0 || handIndex >= getUnlockedHands()) return;
                e.preventDefault();
                stopUpgradeHoldRepeat(false);
                upgradeHoldSuppressClickBtn = null;
                let buyFn;
                let buyFnHoldRepeat;
                if (speedBtn) {
                    buyFn = function () {
                        buySpeedUpgradeForHand(handIndex, { confettiOrigin: btn });
                    };
                    buyFnHoldRepeat = function () {
                        buySpeedUpgradeForHand(handIndex, { confettiOrigin: btn, confettiHoldRepeatCoalesce: true });
                    };
                } else if (cheapenBtn) {
                    buyFn = function () {
                        buyCheapenUpgradeForHand(handIndex, btn);
                    };
                    buyFnHoldRepeat = function () {
                        buyCheapenUpgradeForHand(handIndex, btn, { confettiHoldRepeatCoalesce: true });
                    };
                } else {
                    buyFn = function () {
                        buySlowdownUpgradeForHand(handIndex, btn);
                    };
                    buyFnHoldRepeat = function () {
                        buySlowdownUpgradeForHand(handIndex, btn, { confettiHoldRepeatCoalesce: true });
                    };
                }
                buyFn();
                let firstTick = true;
                const intervalId = setInterval(function () {
                    if (firstTick) {
                        firstTick = false;
                        if (!upgradeHoldRepeatTipLogged) {
                            upgradeHoldRepeatTipLogged = true;
                            addToLog("Hold the mouse (or finger) on Speed, Cheapen, or Compaction to buy upgrades one after another while you have enough currency.", "tip");
                        }
                    }
                    buyFnHoldRepeat();
                }, UPGRADE_HOLD_REPEAT_MS);
                upgradeHoldRepeatState = { intervalId: intervalId, buttonEl: btn };
            }, true);
            speedUpgradesContainerEl.addEventListener("click", function(e) {
                const suppressSpeed = e.target.closest(".speed-upgrade-btn");
                const suppressCheap = e.target.closest(".cheapen-upgrade-btn");
                const suppressSlow = e.target.closest(".slowdown-upgrade-btn");
                const suppressBtn = suppressSpeed || suppressCheap || suppressSlow;
                if (suppressBtn && upgradeHoldSuppressClickBtn === suppressBtn) {
                    upgradeHoldSuppressClickBtn = null;
                    return;
                }
                const auraBtn = e.target.closest(".time-warp-aura-btn");
                if (auraBtn) {
                    const handIndex = parseInt(auraBtn.getAttribute("data-hand-index"), 10);
                    if (!isNaN(handIndex)) {
                        ensureTimeWarpArrays();
                        const willActivate = isTimeWarpUnlocked() && !!(ix.timeWarpAuraActiveByHand && ix.timeWarpAuraActiveByHand[handIndex]);
                        if (willActivate && ix.playTimeWarpScreenEffect) ix.playTimeWarpScreenEffect(auraBtn);
                        activateTimeWarpAuraForHand(handIndex);
                    }
                    return;
                }
                const btn = e.target.closest(".speed-upgrade-btn");
                if (btn) {
                    if (btn.disabled) {
                        const wasOpen = btn.classList.contains("tooltip-open");
                        speedUpgradesContainerEl.querySelectorAll(".upgrade-btn.tooltip-open").forEach(el => el.classList.remove("tooltip-open"));
                        if (!wasOpen) {
                            btn.classList.add("tooltip-open");
                            requestAnimationFrame(() => positionTooltipForButton(btn));
                        }
                        return;
                    }
                    const handIndex = parseInt(btn.getAttribute("data-hand-index"), 10);
                    if (!isNaN(handIndex)) buySpeedUpgradeForHand(handIndex, { confettiOrigin: btn });
                    return;
                }
                const cheapenBtn = e.target.closest(".cheapen-upgrade-btn");
                if (cheapenBtn) {
                    if (cheapenBtn.disabled) {
                        const wasOpen = cheapenBtn.classList.contains("tooltip-open");
                        speedUpgradesContainerEl.querySelectorAll(".upgrade-btn.tooltip-open").forEach(el => el.classList.remove("tooltip-open"));
                        if (!wasOpen) {
                            cheapenBtn.classList.add("tooltip-open");
                            requestAnimationFrame(() => positionTooltipForButton(cheapenBtn));
                        }
                        return;
                    }
                    const handIndex = parseInt(cheapenBtn.getAttribute("data-hand-index"), 10);
                    if (!isNaN(handIndex)) buyCheapenUpgradeForHand(handIndex, cheapenBtn);
                    return;
                }
                const slowdownBtn = e.target.closest(".slowdown-upgrade-btn");
                if (slowdownBtn) {
                    if (slowdownBtn.disabled) {
                        const wasOpen = slowdownBtn.classList.contains("tooltip-open");
                        speedUpgradesContainerEl.querySelectorAll(".upgrade-btn.tooltip-open").forEach(el => el.classList.remove("tooltip-open"));
                        if (!wasOpen) {
                            slowdownBtn.classList.add("tooltip-open");
                            requestAnimationFrame(() => positionTooltipForButton(slowdownBtn));
                        }
                        return;
                    }
                    const handIndex = parseInt(slowdownBtn.getAttribute("data-hand-index"), 10);
                    if (!isNaN(handIndex)) buySlowdownUpgradeForHand(handIndex, slowdownBtn);
                }
            });
            speedUpgradesContainerEl.addEventListener("change", function(e) {
                const cb = e.target.closest(".speed-autobuy-toggle");
                if (!cb) return;
                const i = parseInt(cb.getAttribute("data-hand-index"), 10);
                if (!isNaN(i) && i >= 0 && i < getUnlockedHands()) autoBuyEnabledByHand[i] = cb.checked;
            });
        }
        if (turboScensionPanelEl) {
            turboScensionPanelEl.addEventListener("focusin", function(e) {
                const host = e.target.closest(".turbo-scension-tooltip-host");
                if (!host || !turboScensionPanelEl.contains(host)) return;
                clearUpgradeTooltipHoverTimer(host);
                requestAnimationFrame(() => positionTooltipForHost(host));
            });
        }
        document.addEventListener("click", function(e) {
            if (!speedUpgradesContainerEl) return;
            if (e.target.closest(".upgrade-btn")) return;
            speedUpgradesContainerEl.querySelectorAll(".upgrade-btn.tooltip-open").forEach(el => el.classList.remove("tooltip-open"));
        });
    }

    return {
        speedRowRefs,
        flashSpeedAutobuyToast,
        ensureSpeedRows,
        shrinkSpeedRowsTo,
        setUpgradeTooltipText,
        setUpgradeButtonProgress,
        positionTooltipForHost,
        positionTooltipForButton,
        positionVisibleTooltips,
        dismissAllHoverOnlyTooltips,
        stopUpgradeHoldRepeat,
        clearUpgradeTooltipHoverTimer,
        cancelUpgradeTooltipHoverShow,
        bindTurboScensionTooltipHovers,
        attachUpgradeInteractionListeners
    };
}

// ==================== UPGRADE BOOT FILES (from n1-cheapen-boot.js, n1-slowdown-boot.js, n1-speed-upgrade-boot.js) ====================

/** Cheapen column UI, purchase, and autobuy; arrays + unlock flag live in boot via deps. */
export function createNumber1CheapenBoot(deps) {
    const {
        getBlackHolePhase,
        getUnlockedHands,
        getHandEarnings,
        getCheapenLevel,
        getCheapenBonusLevel,
        getCheapenSectionUnlocked,
        setCheapenSectionUnlocked,
        getCheapenAutoBuyCountdownByHand,
        setCheapenAutoBuyCountdown,
        getMaxCheapenLevel,
        getCheapenUpgradeCost,
        devCheapenAutobuyOn,
        ascensionAutobuyIncludesCheapen,
        getAutoBuyUnlocked,
        getAutoBuyEnabledByHand,
        setHandEarningBalance,
        markMeaningfulProgress,
        markAutobuyDeferredTotalsPending,
        refreshTotalFromHandEarnings,
        getIncrementalCountEl,
        formatCount,
        getTotalChanges,
        addToLog,
        getCheapenEffectText,
        setCheapenBaseLevel,
        getSpeedRowRefs,
        sprayConfettiFrom,
        setUpgradeTooltipText,
        setUpgradeButtonProgress,
        formatUpgradeAffordEtaLine,
        flashSpeedAutobuyToast,
        setBatchedUpgradeUiFlush,
        updateSpeedUpgradeUI,
        updateSlowdownUpgradeUI,
        updateRateDisplay,
        ensureSpeedRows,
        updateHandUpgradeScrollHint,
        getAutoBuyDelaySeconds
    } = deps;

    function updateCheapenUpgradeUI() {
        const hand1Balance = getHandEarnings(0);
        if (!getCheapenSectionUnlocked() && hand1Balance >= 1000) {
            setCheapenSectionUnlocked(true);
            ensureSpeedRows();
        }
        if (!getCheapenSectionUnlocked()) {
            const speedRowRefs = getSpeedRowRefs();
            for (let i = 0; i < speedRowRefs.length; i++) {
                const ref = speedRowRefs[i];
                if (ref && ref.cheapenWrapEl) ref.cheapenWrapEl.style.display = "none";
                if (ref && ref.cheapenBtn) ref.cheapenBtn.classList.remove("upgrade-btn--afford-pulse");
            }
            updateHandUpgradeScrollHint();
            return;
        }
        const unlockedHands = getUnlockedHands();
        const cheapenLevel = getCheapenLevel();
        const cheapenBonusLevel = getCheapenBonusLevel();
        for (let i = 0; i < unlockedHands; i++) {
            const ref = getSpeedRowRefs()[i];
            if (!ref || !ref.cheapenWrapEl) continue;
            ref.cheapenWrapEl.style.display = "";
            const level = cheapenLevel[i] ?? 0;
            const bonusLevel = cheapenBonusLevel[i] ?? 0;
            const effectiveLevel = getEffectiveUpgradeLevel(level, bonusLevel);
            const nextLevel = level + 1;
            const cap = getMaxCheapenLevel();
            const cost = level >= cap ? null : getCheapenUpgradeCost(i, nextLevel);
            const balance = getHandEarnings(i);
            const canAfford = cost !== null && balance >= cost;
            if (level >= cap) {
                if (ref.cheapenLevelEl) {
                    ref.cheapenLevelEl.innerHTML =
                        level > 0 || bonusLevel > 0
                            ? level +
                              "/" +
                              cap +
                              (bonusLevel > 0
                                  ? " <span class=\"speed-level-bonus\" title=\"Clap bonus\">+" + bonusLevel + "</span>"
                                  : "")
                            : "";
                    ref.cheapenLevelEl.classList.toggle("upgrade-btn-level--hidden", level <= 0 && bonusLevel <= 0);
                }
                ref.cheapenBtn.style.display = "";
                ref.cheapenBtn.disabled = true;
                setUpgradeButtonProgress(ref.cheapenBtn, 1);
                ref.cheapenBtn.classList.add("upgrade-btn-maxed");
                ref.cheapenBtn.classList.remove("upgrade-btn--afford-pulse");
                setUpgradeTooltipText(
                    ref.cheapenBtn,
                    "Base level: " +
                        level +
                        "/" +
                        cap +
                        "\nBonus (clap): " +
                        bonusLevel +
                        "\nEffective: " +
                        effectiveLevel +
                        "\nBalance/Cost: MAX\nEffect: " +
                        getCheapenEffectTextForAchievedLevel(effectiveLevel)
                );
                const cheapenLbl = ref.cheapenBtn && ref.cheapenBtn.querySelector(".upgrade-btn-label");
                if (cheapenLbl) cheapenLbl.textContent = level > 0 ? "" : "Cheapen";
            } else {
                if (ref.cheapenLevelEl) {
                    ref.cheapenLevelEl.innerHTML =
                        level > 0 || bonusLevel > 0
                            ? level +
                              "/" +
                              cap +
                              (bonusLevel > 0
                                  ? " <span class=\"speed-level-bonus\" title=\"Clap bonus\">+" + bonusLevel + "</span>"
                                  : "")
                            : "";
                    ref.cheapenLevelEl.classList.toggle("upgrade-btn-level--hidden", level <= 0 && bonusLevel <= 0);
                }
                const cheapenLbl = ref.cheapenBtn && ref.cheapenBtn.querySelector(".upgrade-btn-label");
                if (cheapenLbl) cheapenLbl.textContent = level > 0 ? "" : "Cheapen";
                ref.cheapenBtn.style.display = "";
                ref.cheapenBtn.disabled = !canAfford;
                const progress = cost > 0 ? Math.max(0, Math.min(1, balance / cost)) : 1;
                setUpgradeButtonProgress(ref.cheapenBtn, progress);
                ref.cheapenBtn.classList.remove("upgrade-btn-maxed");
                ref.cheapenBtn.classList.toggle("upgrade-btn--afford-pulse", canAfford);
                setUpgradeTooltipText(
                    ref.cheapenBtn,
                    "Base level: " +
                        level +
                        "/" +
                        cap +
                        "\nBonus (clap): " +
                        bonusLevel +
                        "\nEffective: " +
                        effectiveLevel +
                        "\nBalance/Cost: " +
                        formatCount(balance) +
                        " / " +
                        formatCount(cost) +
                        "\nEffect next base: " +
                        getCheapenEffectText(nextLevel) +
                        formatUpgradeAffordEtaLine(balance, cost, i)
                );
            }
        }
        updateHandUpgradeScrollHint();
    }

    function buyCheapenUpgradeForHand(handIndex, confettiOriginEl, opts) {
        const unlockedHands = getUnlockedHands();
        if (getBlackHolePhase() === 7) return;
        if (handIndex < 0 || handIndex >= unlockedHands) return;
        const cheapenLevelArr = getCheapenLevel();
        const level = cheapenLevelArr[handIndex] ?? 0;
        if (level >= getMaxCheapenLevel()) return;
        const nextLevel = level + 1;
        const cost = getCheapenUpgradeCost(handIndex, nextLevel);
        const balance = getHandEarnings(handIndex);
        if (balance < cost) return;
        setHandEarningBalance(handIndex, balance - cost);
        if (!(opts && opts.burstInnerBuy)) markMeaningfulProgress();
        if (opts && opts.skipUpgradeDom) markAutobuyDeferredTotalsPending();
        else refreshTotalFromHandEarnings();
        setCheapenBaseLevel(handIndex, level + 1);
        const handNum = handIndex + 1;
        const lvlNow = getCheapenLevel()[handIndex];
        if (!(opts && opts.silentLog)) addToLog("Speed cheapen purchased for Hand " + handNum + " (level " + lvlNow + ")", "system");
        if (!(opts && opts.skipUpgradeDom)) {
            const el = getIncrementalCountEl();
            if (el) el.textContent = formatCount(getTotalChanges());
        }
        const rowRefs = getSpeedRowRefs();
        const origin =
            confettiOriginEl ||
            (rowRefs[handIndex] && rowRefs[handIndex].cheapenBtn && rowRefs[handIndex].cheapenBtn.closest(".speed-upgrade-row"));
        if (origin && !(opts && opts.fromAutobuy)) {
            sprayConfettiFrom(origin, opts && opts.confettiHoldRepeatCoalesce ? { holdRepeatCoalesce: true } : undefined);
        }
        if (opts && opts.skipUpgradeDom) {
            setBatchedUpgradeUiFlush(true);
        } else {
            updateSpeedUpgradeUI();
            updateCheapenUpgradeUI();
            updateSlowdownUpgradeUI();
            updateRateDisplay();
        }
    }

    function maybeAutoBuyCheapen() {
        const useDev = devCheapenAutobuyOn();
        const useAsc = !useDev && ascensionAutobuyIncludesCheapen() && getAutoBuyUnlocked();
        if (!useDev && !useAsc) return;
        const unlockedHands = getUnlockedHands();
        const cheapenAutoBuyCountdownByHand = getCheapenAutoBuyCountdownByHand();
        while (cheapenAutoBuyCountdownByHand.length < unlockedHands) cheapenAutoBuyCountdownByHand.push(0);
        const dtSec = GAME_LOOP_MS / 1000;
        const tickDelay = useDev ? DEV_CHEAPEN_AUTOBUY_DELAY : getAutoBuyDelaySeconds();
        const cheapenLevelArr = getCheapenLevel();
        for (let i = 0; i < unlockedHands; i++) {
            if (useAsc) {
                if (!getAutoBuyEnabledByHand(i)) continue;
                if (!getCheapenSectionUnlocked()) continue;
            }
            const level = cheapenLevelArr[i] ?? 0;
            if (level >= getMaxCheapenLevel()) continue;
            const nextLevel = level + 1;
            const cost = getCheapenUpgradeCost(i, nextLevel);
            const canAfford = getHandEarnings(i) >= cost;
            let countdown = cheapenAutoBuyCountdownByHand[i] || 0;
            if (countdown > 0) {
                setCheapenAutoBuyCountdown(i, countdown - dtSec);
                const nextCd = cheapenAutoBuyCountdownByHand[i] || 0;
                if (nextCd <= 0) {
                    if (canAfford) {
                        buyCheapenUpgradeForHand(i, null, { fromAutobuy: true, silentLog: true, skipUpgradeDom: true });
                        flashSpeedAutobuyToast(i, "Cheapen " + (getCheapenLevel()[i] | 0));
                        const stillCanAfford = getHandEarnings(i) >= getCheapenUpgradeCost(i, getCheapenLevel()[i] + 1);
                        setCheapenAutoBuyCountdown(
                            i,
                            stillCanAfford && getCheapenLevel()[i] < getMaxCheapenLevel() ? tickDelay : 0
                        );
                    } else {
                        setCheapenAutoBuyCountdown(i, 0);
                    }
                }
            } else if (canAfford) {
                setCheapenAutoBuyCountdown(i, tickDelay);
            }
        }
    }

    return {
        buyCheapenUpgradeForHand,
        maybeAutoBuyCheapen,
        updateCheapenUpgradeUI
    };
}

/** Compaction (slowdown) column UI, purchase, and autobuy; arrays live in boot via deps. */
export function createNumber1SlowdownBoot(deps) {
    const {
        getBlackHolePhase,
        getUnlockedHands,
        getHandEarnings,
        getSlowdownLevel,
        getSlowdownBonusLevel,
        getSlowdownAutoBuyCountdownByHand,
        setSlowdownAutoBuyCountdown,
        getMaxSlowdownLevelCap,
        getSlowdownUpgradeCost,
        isSlowdownUnlocked,
        devSlowdownAutobuyOn,
        ascensionAutobuyIncludesSlowdown,
        getAutoBuyUnlocked,
        getAutoBuyEnabledByHand,
        setHandEarningBalance,
        markMeaningfulProgress,
        markAutobuyDeferredTotalsPending,
        refreshTotalFromHandEarnings,
        getIncrementalCountEl,
        formatCount,
        getTotalChanges,
        addToLog,
        setSlowdownBaseLevel,
        resetSpeedLevelForCompaction,
        getHands,
        getSpeedRowRefs,
        sprayConfettiFrom,
        setUpgradeTooltipText,
        setUpgradeButtonProgress,
        formatUpgradeAffordEtaLine,
        flashSpeedAutobuyToast,
        setBatchedUpgradeUiFlush,
        updateSpeedUpgradeUI,
        updateCheapenUpgradeUI,
        updateRateDisplay,
        updateHandUpgradeScrollHint,
        getAutoBuyDelaySeconds,
        onSlowdownUnlockedFirstUi
    } = deps;

    function getSlowdownEffectText(level) {
        if (level <= 0) return "No Compaction";
        return (
            "+" +
            formatCount(getSlowdownMultiplierForLevel(level)) +
            "× tick value; digit speed scales with Speed upgrades"
        );
    }

    function updateSlowdownUpgradeUIFn() {
        const unlocked = isSlowdownUnlocked();
        if (unlocked) onSlowdownUnlockedFirstUi();
        const unlockedHands = getUnlockedHands();
        const slowdownLevel = getSlowdownLevel();
        const slowdownBonusLevel = getSlowdownBonusLevel();
        for (let i = 0; i < unlockedHands; i++) {
            const ref = getSpeedRowRefs()[i];
            if (!ref || !ref.slowdownWrapEl) continue;
            if (!unlocked) {
                ref.slowdownWrapEl.style.display = "none";
                if (ref.slowdownBtn) ref.slowdownBtn.classList.remove("upgrade-btn--afford-pulse");
                continue;
            }
            ref.slowdownWrapEl.style.display = "";
            const level = slowdownLevel[i] ?? 0;
            const bonusLevel = slowdownBonusLevel[i] ?? 0;
            const effectiveLevel = getEffectiveUpgradeLevel(level, bonusLevel);
            const nextLevel = level + 1;
            const cap = getMaxSlowdownLevelCap();
            const cost = level >= cap ? null : getSlowdownUpgradeCost(nextLevel);
            const balance = getHandEarnings(i);
            const canAfford = cost !== null && balance >= cost;
            if (level >= cap) {
                if (ref.slowdownLevelEl) {
                    ref.slowdownLevelEl.innerHTML =
                        level > 0 || bonusLevel > 0
                            ? level +
                              "/" +
                              cap +
                              (bonusLevel > 0
                                  ? " <span class=\"speed-level-bonus\" title=\"Clap bonus\">+" + bonusLevel + "</span>"
                                  : "")
                            : "";
                    ref.slowdownLevelEl.classList.toggle("upgrade-btn-level--hidden", level <= 0 && bonusLevel <= 0);
                }
                ref.slowdownBtn.style.display = "";
                ref.slowdownBtn.disabled = true;
                setUpgradeButtonProgress(ref.slowdownBtn, 1);
                ref.slowdownBtn.classList.add("upgrade-btn-maxed");
                ref.slowdownBtn.classList.remove("upgrade-btn--afford-pulse");
                setUpgradeTooltipText(
                    ref.slowdownBtn,
                    "Base level: " +
                        level +
                        "/" +
                        cap +
                        "\nBonus (clap): " +
                        bonusLevel +
                        "\nEffective: " +
                        effectiveLevel +
                        "\nBalance/Cost: MAX\nEffect: " +
                        getSlowdownEffectText(effectiveLevel)
                );
                const slowLbl = ref.slowdownBtn && ref.slowdownBtn.querySelector(".upgrade-btn-label");
                if (slowLbl) slowLbl.textContent = level > 0 ? "" : "Compaction";
            } else {
                if (ref.slowdownLevelEl) {
                    ref.slowdownLevelEl.innerHTML =
                        level > 0 || bonusLevel > 0
                            ? level +
                              "/" +
                              cap +
                              (bonusLevel > 0
                                  ? " <span class=\"speed-level-bonus\" title=\"Clap bonus\">+" + bonusLevel + "</span>"
                                  : "")
                            : "";
                    ref.slowdownLevelEl.classList.toggle("upgrade-btn-level--hidden", level <= 0 && bonusLevel <= 0);
                }
                const slowLbl = ref.slowdownBtn && ref.slowdownBtn.querySelector(".upgrade-btn-label");
                if (slowLbl) slowLbl.textContent = level > 0 ? "" : "Compaction";
                ref.slowdownBtn.style.display = "";
                ref.slowdownBtn.disabled = !canAfford;
                const progress = cost > 0 ? Math.max(0, Math.min(1, balance / cost)) : 1;
                setUpgradeButtonProgress(ref.slowdownBtn, progress);
                ref.slowdownBtn.classList.remove("upgrade-btn-maxed");
                ref.slowdownBtn.classList.toggle("upgrade-btn--afford-pulse", canAfford);
                setUpgradeTooltipText(
                    ref.slowdownBtn,
                    "Base level: " +
                        level +
                        "/" +
                        cap +
                        "\nBonus (clap): " +
                        bonusLevel +
                        "\nEffective: " +
                        effectiveLevel +
                        "\nBalance/Cost: " +
                        formatCount(balance) +
                        " / " +
                        formatCount(cost) +
                        "\nEffect next base: " +
                        getSlowdownEffectText(nextLevel) +
                        formatUpgradeAffordEtaLine(balance, cost, i)
                );
            }
        }
        updateHandUpgradeScrollHint();
    }

    function buySlowdownUpgradeForHand(handIndex, originEl, opts) {
        const unlockedHands = getUnlockedHands();
        if (getBlackHolePhase() === 7) return;
        if (handIndex < 0 || handIndex >= unlockedHands) return;
        if (!isSlowdownUnlocked()) return;
        const slowdownLevelArr = getSlowdownLevel();
        const level = slowdownLevelArr[handIndex] ?? 0;
        const cap = getMaxSlowdownLevelCap();
        if (level >= cap) return;
        const nextLevel = level + 1;
        const cost = getSlowdownUpgradeCost(nextLevel);
        if (cost === null) return;
        const balance = getHandEarnings(handIndex);
        if (balance < cost) return;
        setHandEarningBalance(handIndex, balance - cost);
        if (!(opts && opts.burstInnerBuy)) markMeaningfulProgress();
        if (opts && opts.skipUpgradeDom) markAutobuyDeferredTotalsPending();
        else refreshTotalFromHandEarnings();
        setSlowdownBaseLevel(handIndex, nextLevel);
        resetSpeedLevelForCompaction(handIndex);
        const handNum = handIndex + 1;
        if (!(opts && opts.silentLog)) {
            addToLog("Compaction purchased for Hand " + handNum + " (level " + nextLevel + "). Speed level reset.", "system");
        }
        if (!(opts && opts.skipUpgradeDom)) {
            const el = getIncrementalCountEl();
            if (el) el.textContent = formatCount(getTotalChanges());
        }
        const targetHand = getHands()[handIndex];
        if (targetHand) targetHand.tickAccBig = 0n;
        const rowRefs = getSpeedRowRefs();
        const origin =
            originEl ||
            (rowRefs[handIndex] && rowRefs[handIndex].slowdownBtn && rowRefs[handIndex].slowdownBtn.closest(".speed-upgrade-row"));
        if (origin && !(opts && opts.fromAutobuy)) {
            sprayConfettiFrom(origin, opts && opts.confettiHoldRepeatCoalesce ? { holdRepeatCoalesce: true } : undefined);
        }
        if (opts && opts.skipUpgradeDom) {
            setBatchedUpgradeUiFlush(true);
        } else {
            updateSpeedUpgradeUI();
            updateCheapenUpgradeUI();
            updateSlowdownUpgradeUIFn();
            updateRateDisplay();
        }
    }

    function maybeAutoBuySlowdown() {
        if (!isSlowdownUnlocked()) return;
        const useDev = devSlowdownAutobuyOn();
        const useAsc = !useDev && ascensionAutobuyIncludesSlowdown() && getAutoBuyUnlocked();
        if (!useDev && !useAsc) return;
        const unlockedHands = getUnlockedHands();
        const slowdownAutoBuyCountdownByHand = getSlowdownAutoBuyCountdownByHand();
        while (slowdownAutoBuyCountdownByHand.length < unlockedHands) slowdownAutoBuyCountdownByHand.push(0);
        const dtSec = GAME_LOOP_MS / 1000;
        const tickDelay = useDev ? DEV_SLOWDOWN_AUTOBUY_DELAY : getAutoBuyDelaySeconds();
        for (let i = 0; i < unlockedHands; i++) {
            if (useAsc) {
                if (!getAutoBuyEnabledByHand(i)) continue;
            }
            const slowdownLevelArr = getSlowdownLevel();
            const level = slowdownLevelArr[i] ?? 0;
            const cap = getMaxSlowdownLevelCap();
            if (level >= cap) continue;
            const nextLevel = level + 1;
            const cost = getSlowdownUpgradeCost(nextLevel);
            const canAfford = cost !== null && getHandEarnings(i) >= cost;
            let countdown = slowdownAutoBuyCountdownByHand[i] || 0;
            if (countdown > 0) {
                setSlowdownAutoBuyCountdown(i, countdown - dtSec);
                const nextCd = slowdownAutoBuyCountdownByHand[i] || 0;
                if (nextCd <= 0) {
                    if (canAfford) {
                        buySlowdownUpgradeForHand(i, null, { fromAutobuy: true, silentLog: true, skipUpgradeDom: true });
                        flashSpeedAutobuyToast(i, "Compact " + (getSlowdownLevel()[i] | 0));
                        const lv = getSlowdownLevel()[i] ?? 0;
                        const nextCost = lv >= cap ? null : getSlowdownUpgradeCost(lv + 1);
                        const stillCanAfford = nextCost !== null && getHandEarnings(i) >= nextCost;
                        setSlowdownAutoBuyCountdown(i, stillCanAfford ? tickDelay : 0);
                    } else {
                        setSlowdownAutoBuyCountdown(i, 0);
                    }
                }
            } else if (canAfford) {
                setSlowdownAutoBuyCountdown(i, tickDelay);
            }
        }
    }

    return {
        buySlowdownUpgradeForHand,
        maybeAutoBuySlowdown,
        updateSlowdownUpgradeUI: updateSlowdownUpgradeUIFn
    };
}

/** Speed purchase + speed autobuy loop; sim/state lives in boot via deps. */
export function createNumber1SpeedUpgradeBoot(deps) {
    const {
        getBlackHolePhase,
        getUnlockedHands,
        getSpeedLevel,
        getCheapenLevel,
        getSlowdownLevel,
        getUpgradeCost,
        getHandEarnings,
        setHandEarningBalance,
        markMeaningfulProgress,
        markAutobuyDeferredTotalsPending,
        refreshTotalFromHandEarnings,
        incrementSpeedLevel,
        getHands,
        addToLog,
        getIncrementalCountEl,
        formatCount,
        getTotalChanges,
        restartAllHandTimers,
        getAutoBuyUnlocked,
        setSpeedAutobuyCountdown,
        getAutoBuyEnabledByHand,
        getAutoBuyCountdownSecondsByHand,
        getAutoBuyDelaySeconds,
        getSpeedRowRefs,
        sprayConfettiFrom,
        setBatchedUpgradeUiFlush,
        updateSpeedUpgradeUI,
        updateCheapenUpgradeUI,
        updateSlowdownUpgradeUI,
        updateRateDisplay,
        flashSpeedAutobuyToast,
        getMaxCheapenLevel,
        getCheapenUpgradeCost,
        getSlowdownUpgradeCost,
        getMaxSlowdownLevelCap,
        isSlowdownUnlocked,
        buyCheapenUpgradeForHand,
        buySlowdownUpgradeForHand,
        flushAutobuyDeferredTotalsIfAny
    } = deps;

    const affordableBurstDeps = {
        getUnlockedHands,
        getSpeedLevel,
        getCheapenLevel,
        getSlowdownLevel,
        getHandEarnings,
        getMaxCheapenLevel,
        getCheapenUpgradeCost,
        getUpgradeCost,
        getSlowdownUpgradeCost,
        getMaxSlowdownLevelCap,
        isSlowdownUnlocked,
        buyCheapenUpgradeForHand,
        buySlowdownUpgradeForHand,
        flushAutobuyDeferredTotalsIfAny,
        markMeaningfulProgress
    };

    function buySpeedUpgradeForHand(handIndex, opts) {
        const unlockedHands = getUnlockedHands();
        if (getBlackHolePhase() === 7) return;
        if (handIndex < 0 || handIndex >= unlockedHands) return;
        const speedLevel = getSpeedLevel();
        const nextLevel = speedLevel[handIndex] + 1;
        const cost = getUpgradeCost(handIndex, nextLevel);
        const balance = getHandEarnings(handIndex);
        if (balance < cost) return;
        setHandEarningBalance(handIndex, balance - cost);
        if (!(opts && opts.burstInnerBuy)) markMeaningfulProgress();
        if (opts && opts.skipUpgradeDom) markAutobuyDeferredTotalsPending();
        else refreshTotalFromHandEarnings();
        incrementSpeedLevel(handIndex);
        const handNum = handIndex + 1;
        const upgradedHand = getHands()[handIndex];
        if (upgradedHand && !(opts && opts.burstInnerBuy)) upgradedHand.tickAccBig = 0n;
        const lvlNow = getSpeedLevel()[handIndex];
        if (!(opts && opts.silentLog)) addToLog("Speed upgrade purchased for Hand " + handNum + " (level " + lvlNow + ")", "system");
        if (!(opts && opts.skipUpgradeDom)) {
            const el = getIncrementalCountEl();
            if (el) el.textContent = formatCount(getTotalChanges());
        }
        getHands().forEach(h => h.restartTimer());
        if (getAutoBuyUnlocked()) {
            const nextCost = getUpgradeCost(handIndex, getSpeedLevel()[handIndex] + 1);
            if (getHandEarnings(handIndex) < nextCost) setSpeedAutobuyCountdown(handIndex, 0);
        }
        if (!(opts && opts.fromAutobuy)) {
            const rowRefs = getSpeedRowRefs();
            const origin =
                (opts && opts.confettiOrigin) ||
                (rowRefs[handIndex] && rowRefs[handIndex].btn && rowRefs[handIndex].btn.closest(".speed-upgrade-row"));
            if (origin) {
                sprayConfettiFrom(origin, opts && opts.confettiHoldRepeatCoalesce ? { holdRepeatCoalesce: true } : undefined);
            }
        }
        if (opts && opts.skipUpgradeDom) {
            setBatchedUpgradeUiFlush(true);
        } else {
            updateSpeedUpgradeUI();
            updateCheapenUpgradeUI();
            updateSlowdownUpgradeUI();
            updateRateDisplay();
        }
    }
    affordableBurstDeps.buySpeedUpgradeForHand = buySpeedUpgradeForHand;

    function runCollapseAutobuyBurstForHand(handIndex) {
        const result = applyAffordableUpgradeBurstForHand(handIndex, affordableBurstDeps, {
            flushDeferredTotals: false
        });
        if (result.speedDelta > 0) {
            const upgradedHand = getHands()[handIndex];
            if (upgradedHand) upgradedHand.tickAccBig = 0n;
        }
        if (result.any) setBatchedUpgradeUiFlush(true);
        if (typeof flushAutobuyDeferredTotalsIfAny === "function") flushAutobuyDeferredTotalsIfAny();
        return result;
    }

    function maybeAutoBuySpeedUpgrade() {
        if (!getAutoBuyUnlocked()) return;
        const dtSec = GAME_LOOP_MS / 1000;
        const unlockedHands = getUnlockedHands();
        for (let i = 0; i < unlockedHands; i++) {
            if (!getAutoBuyEnabledByHand(i)) continue;
            const countdown = getAutoBuyCountdownSecondsByHand(i) || 0;
            const speedLevel = getSpeedLevel();
            const nextLevel = speedLevel[i] + 1;
            const cost = getUpgradeCost(i, nextLevel);
            const canAfford = getHandEarnings(i) >= cost;
            if (countdown > 0) {
                setSpeedAutobuyCountdown(i, countdown - dtSec);
                const nextCd = getAutoBuyCountdownSecondsByHand(i) || 0;
                if (nextCd <= 0) {
                    if (canAfford) {
                        if (isCollapseAutobuyBurstUnlocked(getBlackHolePhase)) {
                            const burstResult = runCollapseAutobuyBurstForHand(i);
                            let toast = "Speed " + (getSpeedLevel()[i] | 0);
                            if (burstResult.speedDelta > 1) toast += " (+" + burstResult.speedDelta + ")";
                            flashSpeedAutobuyToast(i, toast);
                        } else {
                            buySpeedUpgradeForHand(i, { fromAutobuy: true, silentLog: true, skipUpgradeDom: true });
                            flashSpeedAutobuyToast(i, "Speed " + (getSpeedLevel()[i] | 0));
                        }
                        const stillCanAfford = getHandEarnings(i) >= getUpgradeCost(i, getSpeedLevel()[i] + 1);
                        setSpeedAutobuyCountdown(i, stillCanAfford ? getAutoBuyDelaySeconds() : 0);
                    } else {
                        setSpeedAutobuyCountdown(i, 0);
                    }
                }
            } else if (canAfford) {
                setSpeedAutobuyCountdown(i, getAutoBuyDelaySeconds());
            }
        }
    }

    return { buySpeedUpgradeForHand, maybeAutoBuySpeedUpgrade };
}
