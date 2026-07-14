import { TIME_WARP_MANUAL_CLICK_SCALE } from "./n1-time-warp.js";

/** Per-hand upgrade column DOM, tooltips, hold-repeat, and pointer listeners. Buy + UI refresh stay in boot. */
export function createUpgradeUiController(coreDeps) {
    const {
        speedUpgradesContainerEl,
        turboScensionPanelEl,
        getUnlockedHands,
        ascensionAutobuyDefaultOnForNewHands,
        autoBuyEnabledByHand,
        autoBuyCountdownSecondsByHand,
        getTimeWarpProductionSecondsBonus,
        setAutoBuyEnabledForHand
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
    function scheduleHandStatusTooltipHoverShow(slot) {
        cancelHandStatusTooltipHoverShow(slot);
        const id = setTimeout(function() {
            handStatusTooltipHoverTimers.delete(slot);
            if (!slot || !slot.isConnected) return;
            slot.classList.add("hand-status-tooltip-hover-show");
        }, UPGRADE_TOOLTIP_HOVER_DELAY_MS);
        handStatusTooltipHoverTimers.set(slot, id);
    }
    /** Per-hand-slot hover delay (matches upgrade button tooltips); focus-within stays immediate via CSS. */
    function bindHandStatusTooltipHover(handSlot) {
        if (!handSlot || handSlot.dataset.handStatusTooltipHoverBound === "1") return;
        handSlot.dataset.handStatusTooltipHoverBound = "1";
        function onPointerIn() {
            scheduleHandStatusTooltipHoverShow(handSlot);
        }
        handSlot.addEventListener("mouseenter", onPointerIn);
        handSlot.addEventListener("pointerenter", onPointerIn);
        function onPointerOut() {
            cancelHandStatusTooltipHoverShow(handSlot);
        }
        handSlot.addEventListener("mouseleave", onPointerOut);
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
        speedUpgradesContainerEl.querySelectorAll(".hand-slot").forEach(slot => cancelHandStatusTooltipHoverShow(slot));
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
    /** True when at least one hold-repeat purchase skipped upgrade DOM (flush on release). */
    let upgradeHoldSkippedDom = false;
    /** @type {null | (() => void)} */
    let upgradeHoldFlushUi = null;

    function stopUpgradeHoldRepeat(setSuppressForClick) {
        if (!upgradeHoldRepeatState) return;
        clearInterval(upgradeHoldRepeatState.intervalId);
        if (setSuppressForClick) upgradeHoldSuppressClickBtn = upgradeHoldRepeatState.buttonEl;
        upgradeHoldRepeatState = null;
        if (upgradeHoldSkippedDom) {
            upgradeHoldSkippedDom = false;
            if (typeof upgradeHoldFlushUi === "function") upgradeHoldFlushUi();
        }
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
            const newRef = speedRowRefs[speedRowRefs.length - 1];
            if (newRef && newRef.autobuyToggleEl) {
                newRef.autobuyToggleEl.checked = !!autoBuyEnabledByHand[i];
            }
        }
    }

    function toggleAutobuyForHandFromWrap(wrap) {
        const cb = wrap && wrap.querySelector(".speed-autobuy-toggle");
        if (!cb || cb.disabled) return;
        const i = parseInt(cb.getAttribute("data-hand-index"), 10);
        if (isNaN(i) || i < 0 || i >= getUnlockedHands()) return;
        const nextEnabled = !autoBuyEnabledByHand[i];
        if (typeof setAutoBuyEnabledForHand === "function") {
            setAutoBuyEnabledForHand(i, nextEnabled);
        } else {
            autoBuyEnabledByHand[i] = nextEnabled;
            cb.checked = nextEnabled;
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
        upgradeHoldFlushUi = typeof ix.flushHoldUpgradeUi === "function" ? ix.flushHoldUpgradeUi : null;

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
                upgradeHoldSkippedDom = false;
                let buyFn;
                let buyFnHoldRepeat;
                // Hold repeats skip log + full upgrade DOM; game loop paints at most every UI throttle,
                // and release flushes once via flushHoldUpgradeUi.
                const holdOpts = {
                    silentLog: true,
                    skipUpgradeDom: true,
                    confettiHoldRepeatCoalesce: true
                };
                if (speedBtn) {
                    buyFn = function () {
                        buySpeedUpgradeForHand(handIndex, { confettiOrigin: btn });
                    };
                    buyFnHoldRepeat = function () {
                        buySpeedUpgradeForHand(handIndex, Object.assign({ confettiOrigin: btn }, holdOpts));
                        upgradeHoldSkippedDom = true;
                    };
                } else if (cheapenBtn) {
                    buyFn = function () {
                        buyCheapenUpgradeForHand(handIndex, btn);
                    };
                    buyFnHoldRepeat = function () {
                        buyCheapenUpgradeForHand(handIndex, btn, holdOpts);
                        upgradeHoldSkippedDom = true;
                    };
                } else {
                    buyFn = function () {
                        buySlowdownUpgradeForHand(handIndex, btn);
                    };
                    buyFnHoldRepeat = function () {
                        buySlowdownUpgradeForHand(handIndex, btn, holdOpts);
                        upgradeHoldSkippedDom = true;
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
            speedUpgradesContainerEl.addEventListener("click", function (e) {
                const wrap = e.target.closest(".speed-autobuy-wrap");
                if (!wrap) return;
                e.preventDefault();
                toggleAutobuyForHandFromWrap(wrap);
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
