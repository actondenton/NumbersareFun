import { getSpeedMultiplierForLevel } from "./n1-upgrades.js";

const UPGRADE_SCROLL_HINT_TOP_MARGIN = 72;
const UPGRADE_SCROLL_HINT_BOTTOM_MARGIN = 32;
const SCROLL_HINT_PULSE_COOLDOWN_MS = 5000;
const SPEED_AUTOBUY_SUPPRESS_COUNTDOWN_SEC = 5;

/**
 * Speed upgrade row DOM paint + off-screen scroll hints.
 *
 * @param {object} dep
 */
export function createSpeedUpgradeUiBoot(dep) {
    let handUpgradeDetailTipLogged = false;
    let lastScrollHintPulseUpAt = 0;
    let lastScrollHintPulseDownAt = 0;
    let upgradeScrollHintLastStateKey = "";
    let handUpgradeScrollHintRaf = 0;
    let pulseShellClearTimer = 0;

    if (dep.upgradeScrollHintEl && dep.upgradeScrollHintEl.dataset.jumpBound !== "1") {
        dep.upgradeScrollHintEl.dataset.jumpBound = "1";
        dep.upgradeScrollHintEl.addEventListener("click", function(e) {
            const btn = e.target.closest("[data-jump-hand]");
            if (!btn) return;
            const i = parseInt(btn.getAttribute("data-jump-hand"), 10);
            if (isNaN(i) || i < 0 || i >= dep.getUnlockedHands()) return;
            const row = dep.getSpeedRowRefs()[i] && dep.getSpeedRowRefs()[i].handUpgradeRowEl;
            if (row) scrollHandUpgradeRowFullyIntoView(row);
        });
    }

    function handHasSpeedAffordableNext(handIndex) {
        if (handIndex < 0 || handIndex >= dep.getUnlockedHands() || dep.getTotalChanges() < 10) return false;
        const bal = dep.getHandEarnings(handIndex);
        const nextLevel = dep.getSpeedLevel()[handIndex] + 1;
        return bal >= dep.getUpgradeCost(handIndex, nextLevel);
    }

    function handHasCheapenAffordableNext(handIndex) {
        if (handIndex < 0 || handIndex >= dep.getUnlockedHands() || !dep.getCheapenSectionUnlocked()) return false;
        const bal = dep.getHandEarnings(handIndex);
        const cl = dep.getCheapenLevel()[handIndex] ?? 0;
        const cap = dep.getMaxCheapenLevel();
        if (cl >= cap) return false;
        const c = dep.getCheapenUpgradeCost(handIndex, cl + 1);
        return c !== null && bal >= c;
    }

    function handHasSlowdownAffordableNext(handIndex) {
        if (handIndex < 0 || handIndex >= dep.getUnlockedHands() || !dep.isSlowdownUnlocked()) return false;
        const bal = dep.getHandEarnings(handIndex);
        const sl = dep.getSlowdownLevel()[handIndex] ?? 0;
        const cap = dep.getMaxSlowdownLevelCap();
        if (sl >= cap) return false;
        const c = dep.getSlowdownUpgradeCost(sl + 1);
        return c !== null && bal >= c;
    }

    function handHasAffordableUpgradeWaiting(handIndex) {
        return handHasSpeedAffordableNext(handIndex) || handHasCheapenAffordableNext(handIndex) || handHasSlowdownAffordableNext(handIndex);
    }

    function handSuppressedForImminentSpeedAutobuy(handIndex) {
        if (!dep.getAutoBuyUnlocked() || !dep.getAutoBuyEnabledByHand(handIndex)) return false;
        const cd = dep.getAutoBuyCountdownSecondsByHand(handIndex) || 0;
        if (cd <= 0 || cd > SPEED_AUTOBUY_SUPPRESS_COUNTDOWN_SEC) return false;
        if (!handHasSpeedAffordableNext(handIndex)) return false;
        if (handHasCheapenAffordableNext(handIndex) || handHasSlowdownAffordableNext(handIndex)) return false;
        return true;
    }

    function handScrollHintHasUpgradeReason(handIndex) {
        if (!handHasAffordableUpgradeWaiting(handIndex)) return false;
        if (handSuppressedForImminentSpeedAutobuy(handIndex)) return false;
        return true;
    }

    function handUpgradeRowIntersectsViewportComfort(el) {
        if (!el) return true;
        const r = el.getBoundingClientRect();
        const vTop = UPGRADE_SCROLL_HINT_TOP_MARGIN;
        const vBot = window.innerHeight - UPGRADE_SCROLL_HINT_BOTTOM_MARGIN;
        return r.bottom > vTop && r.top < vBot;
    }

    function classifyOffScreenScrollHintHands() {
        const above = [];
        const below = [];
        const vTop = UPGRADE_SCROLL_HINT_TOP_MARGIN;
        const vBot = window.innerHeight - UPGRADE_SCROLL_HINT_BOTTOM_MARGIN;
        const speedRowRefs = dep.getSpeedRowRefs();
        for (let i = 0; i < dep.getUnlockedHands(); i++) {
            if (!dep.handContributesToScrollHint(i)) continue;
            const row = speedRowRefs[i] && speedRowRefs[i].handUpgradeRowEl;
            if (!row) continue;
            if (handUpgradeRowIntersectsViewportComfort(row)) continue;
            const r = row.getBoundingClientRect();
            if (r.bottom <= vTop) above.push({ handIndex: i, row: row, r: r });
            else if (r.top >= vBot) below.push({ handIndex: i, row: row, r: r });
        }
        above.sort((a, b) => {
            const pa = dep.handContributesTimeWarpPriority(a.handIndex);
            const pb = dep.handContributesTimeWarpPriority(b.handIndex);
            if (pa !== pb) return pb - pa;
            return b.r.bottom - a.r.bottom;
        });
        below.sort((a, b) => {
            const pa = dep.handContributesTimeWarpPriority(a.handIndex);
            const pb = dep.handContributesTimeWarpPriority(b.handIndex);
            if (pa !== pb) return pb - pa;
            return a.r.top - b.r.top;
        });
        return { above: above, below: below };
    }

    function pulseUpgradeScrollHintShell() {
        if (!dep.upgradeScrollHintEl) return;
        dep.upgradeScrollHintEl.classList.remove("upgrade-scroll-hint--pulse");
        void dep.upgradeScrollHintEl.offsetWidth;
        dep.upgradeScrollHintEl.classList.add("upgrade-scroll-hint--pulse");
        window.clearTimeout(pulseShellClearTimer);
        pulseShellClearTimer = window.setTimeout(() => {
            dep.upgradeScrollHintEl.classList.remove("upgrade-scroll-hint--pulse");
        }, 750);
    }

    function pulseHandUpgradeRowForScrollHint(rowEl) {
        if (!rowEl) return;
        rowEl.classList.remove("hand-upgrade-row--scroll-pulse");
        void rowEl.offsetWidth;
        rowEl.classList.add("hand-upgrade-row--scroll-pulse");
        window.setTimeout(() => rowEl.classList.remove("hand-upgrade-row--scroll-pulse"), 750);
    }

    function scrollHandUpgradeRowFullyIntoView(rowEl) {
        if (!rowEl) return;
        const padTop = UPGRADE_SCROLL_HINT_TOP_MARGIN;
        const padBot = UPGRADE_SCROLL_HINT_BOTTOM_MARGIN;
        const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        const rect = rowEl.getBoundingClientRect();
        const available = vh - padTop - padBot;
        let delta = 0;
        if (rect.height <= available) {
            if (rect.top < padTop) {
                delta = rect.top - padTop;
            } else if (rect.bottom > vh - padBot) {
                delta = rect.bottom - (vh - padBot);
            }
        } else {
            const bandMidY = padTop + available / 2;
            const idealTop = bandMidY - rect.height / 2;
            delta = rect.top - idealTop;
        }
        if (Math.abs(delta) > 2) {
            window.scrollBy({ top: delta, left: 0, behavior: "smooth" });
        }
    }

    function updateHandUpgradeScrollHint() {
        if (!dep.upgradeScrollHintEl || !dep.upgradeScrollHintMessagesEl || !dep.upgradeScrollHintJumpsEl) return;
        const { above, below } = classifyOffScreenScrollHintHands();
        const needUp = above.length > 0;
        const needDown = below.length > 0;
        if (!needUp) lastScrollHintPulseUpAt = 0;
        if (!needDown) lastScrollHintPulseDownAt = 0;
        if (!needUp && !needDown) {
            dep.upgradeScrollHintMessagesEl.textContent = "";
            dep.upgradeScrollHintJumpsEl.innerHTML = "";
            dep.upgradeScrollHintEl.classList.remove("upgrade-scroll-hint--down-only");
            dep.upgradeScrollHintEl.hidden = true;
            upgradeScrollHintLastStateKey = "";
            return;
        }
        dep.upgradeScrollHintEl.hidden = false;
        dep.upgradeScrollHintEl.classList.toggle("upgrade-scroll-hint--down-only", needDown && !needUp);
        const upTwAny = needUp && above.some(e => dep.handHasActiveTimeWarpAura(e.handIndex));
        const upGrAny = needUp && above.some(e => handScrollHintHasUpgradeReason(e.handIndex));
        const downTwAny = needDown && below.some(e => dep.handHasActiveTimeWarpAura(e.handIndex));
        const downGrAny = needDown && below.some(e => handScrollHintHasUpgradeReason(e.handIndex));
        const upPri = above[0] ? above[0].handIndex : "x";
        const downPri = below[0] ? below[0].handIndex : "x";
        const upPriTw = above[0] && dep.handHasActiveTimeWarpAura(above[0].handIndex) ? "1" : "0";
        const downPriTw = below[0] && dep.handHasActiveTimeWarpAura(below[0].handIndex) ? "1" : "0";
        const stateKey =
            (needUp ? "1" : "0") +
            "|" +
            (needDown ? "1" : "0") +
            "|" +
            upPri +
            "|" +
            downPri +
            "|" +
            (upTwAny ? "1" : "0") +
            (upGrAny ? "1" : "0") +
            (downTwAny ? "1" : "0") +
            (downGrAny ? "1" : "0") +
            "|" +
            upPriTw +
            "|" +
            downPriTw;
        if (stateKey !== upgradeScrollHintLastStateKey) {
            upgradeScrollHintLastStateKey = stateKey;
            lastScrollHintPulseUpAt = 0;
            lastScrollHintPulseDownAt = 0;
            dep.upgradeScrollHintMessagesEl.innerHTML = "";
            if (needUp) {
                const line = document.createElement("div");
                line.className = "upgrade-scroll-hint-line";
                if (upTwAny && upGrAny) line.textContent = "Scroll up, hand upgrades or a Time Warp are available!";
                else if (upTwAny) line.textContent = "Scroll up, a Time Warp is waiting!";
                else line.textContent = "Scroll up, hand upgrades are available!";
                dep.upgradeScrollHintMessagesEl.appendChild(line);
            }
            if (needDown) {
                const line = document.createElement("div");
                line.className = "upgrade-scroll-hint-line";
                if (downTwAny && downGrAny) line.textContent = "Scroll down, hand upgrades or a Time Warp are available!";
                else if (downTwAny) line.textContent = "Scroll down, a Time Warp is waiting!";
                else line.textContent = "Scroll down, hand upgrades are available!";
                dep.upgradeScrollHintMessagesEl.appendChild(line);
            }
            dep.upgradeScrollHintJumpsEl.innerHTML = "";
            if (needUp && above[0]) {
                const hi = above[0].handIndex;
                const b = document.createElement("button");
                b.type = "button";
                b.className = "upgrade-scroll-hint-jump-btn";
                b.setAttribute("data-jump-hand", String(hi));
                b.textContent = dep.handHasActiveTimeWarpAura(hi) ? "Jump to Hand " + (hi + 1) + " (Time Warp)" : "Jump to Hand " + (hi + 1);
                dep.upgradeScrollHintJumpsEl.appendChild(b);
            }
            if (needDown && below[0]) {
                const hi = below[0].handIndex;
                const b = document.createElement("button");
                b.type = "button";
                b.className = "upgrade-scroll-hint-jump-btn";
                b.setAttribute("data-jump-hand", String(hi));
                b.textContent = dep.handHasActiveTimeWarpAura(hi) ? "Jump to Hand " + (hi + 1) + " (Time Warp)" : "Jump to Hand " + (hi + 1);
                dep.upgradeScrollHintJumpsEl.appendChild(b);
            }
        }
        const now = Date.now();
        const upDue = needUp && (lastScrollHintPulseUpAt === 0 || now - lastScrollHintPulseUpAt >= SCROLL_HINT_PULSE_COOLDOWN_MS);
        const downDue = needDown && (lastScrollHintPulseDownAt === 0 || now - lastScrollHintPulseDownAt >= SCROLL_HINT_PULSE_COOLDOWN_MS);
        if (upDue || downDue) {
            if (upDue) lastScrollHintPulseUpAt = now;
            if (downDue) lastScrollHintPulseDownAt = now;
            pulseUpgradeScrollHintShell();
            if (upDue && above[0]) pulseHandUpgradeRowForScrollHint(above[0].row);
            if (downDue && below[0]) {
                if (upDue) window.setTimeout(() => pulseHandUpgradeRowForScrollHint(below[0].row), 160);
                else pulseHandUpgradeRowForScrollHint(below[0].row);
            }
        }
    }

    function scheduleHandUpgradeScrollHintUpdate() {
        if (handUpgradeScrollHintRaf) return;
        handUpgradeScrollHintRaf = requestAnimationFrame(() => {
            handUpgradeScrollHintRaf = 0;
            updateHandUpgradeScrollHint();
        });
    }

    function updateSpeedUpgradeUI() {
        dep.bumpUpgradeEtaSmoothPass();
        if (dep.getTotalChanges() >= 10) {
            dep.upgradeContainer.classList.add("show-upgrade-content");
            if (!handUpgradeDetailTipLogged) {
                handUpgradeDetailTipLogged = true;
                dep.addToLog("Hover or focus a hand to see count and CPS detail.", "tip");
            }
        }
        const speedUpgradesContainerEl = dep.speedUpgradesContainerEl;
        if (speedUpgradesContainerEl) {
            dep.ensureSpeedRows();
            const speedLevel = dep.getSpeedLevel();
            const speedBonusLevel = dep.getSpeedBonusLevel();
            const speedRowRefs = dep.getSpeedRowRefs();
            for (let i = 0; i < dep.getUnlockedHands(); i++) {
                const ref = speedRowRefs[i];
                if (!ref) continue;
                const nextLevel = speedLevel[i] + 1;
                const cost = dep.getUpgradeCost(i, nextLevel);
                const balance = dep.getHandEarnings(i);
                const canAfford = balance >= cost;
                const bonusB = speedBonusLevel[i] || 0;
                const effLv = dep.getEffectiveSpeedLevel(i);
                const currentMult = getSpeedMultiplierForLevel(effLv);
                const nextMult = getSpeedMultiplierForLevel(effLv + 1);
                const percent = currentMult > 0 ? (nextMult / currentMult - 1) * 100 : 0;
                const sl = speedLevel[i] ?? 0;
                if (ref.speedLevelEl) {
                    if (sl === 0 && bonusB === 0) {
                        ref.speedLevelEl.innerHTML = "";
                        ref.speedLevelEl.classList.add("upgrade-btn-level--hidden");
                    } else {
                        ref.speedLevelEl.classList.remove("upgrade-btn-level--hidden");
                        ref.speedLevelEl.innerHTML = String(sl) + (bonusB > 0 ? " <span class=\"speed-level-bonus\" title=\"Clap bonus\">+" + bonusB + "</span>" : "");
                    }
                }
                const labelEl = ref.btn && ref.btn.querySelector(".upgrade-btn-label");
                if (labelEl) labelEl.textContent = sl > 0 || bonusB > 0 ? "" : "Upgrade";
                ref.btn.disabled = !canAfford;
                const progress = cost > 0 ? Math.max(0, Math.min(1, balance / cost)) : 1;
                dep.setUpgradeButtonProgress(ref.btn, progress);
                ref.btn.classList.toggle("upgrade-btn--afford-pulse", canAfford);
                ref.btn.classList.remove("upgrade-btn-maxed");
                dep.setUpgradeTooltipText(ref.btn, "Base level: " + speedLevel[i] + "\nBonus (clap): " + bonusB + "\nEffective: " + effLv + "\nBalance/Cost: " + dep.formatCount(balance) + " / " + dep.formatCount(cost) + "\nEffect next: +" + percent.toFixed(1) + "%" + dep.formatUpgradeAffordEtaLine(balance, cost, i));
                if (ref.autobuyToggleEl) {
                    ref.autobuyToggleEl.disabled = !dep.getAutoBuyUnlocked();
                    const autobuyStack = ref.autobuyToggleEl.closest(".speed-autobuy-stack");
                    if (autobuyStack) autobuyStack.style.visibility = (dep.getTotalChanges() >= 100 || dep.getAutoBuyUnlocked()) ? "visible" : "hidden";
                }
                if (ref.autobuyMessageEl) {
                    if (!dep.getAutoBuyUnlocked() || !dep.getAutoBuyEnabledByHand(i)) {
                        ref.autobuyMessageEl.textContent = "";
                        ref.autobuyMessageEl.classList.remove("speed-autobuy-message--urgent");
                    } else if ((dep.getAutoBuyCountdownSecondsByHand(i) || 0) > 0) {
                        const secLeft = Math.ceil(dep.getAutoBuyCountdownSecondsByHand(i));
                        ref.autobuyMessageEl.textContent = secLeft + "s";
                        ref.autobuyMessageEl.classList.toggle("speed-autobuy-message--urgent", secLeft <= 3);
                    } else {
                        ref.autobuyMessageEl.textContent = "Unaffordable";
                        ref.autobuyMessageEl.classList.remove("speed-autobuy-message--urgent");
                    }
                }
            }
        }

        if (dep.getTotalChanges() >= 100) dep.setAutoBuyUnlocked(true);
        scheduleHandUpgradeScrollHintUpdate();
    }

    return {
        updateSpeedUpgradeUI,
        updateHandUpgradeScrollHint,
        scheduleHandUpgradeScrollHintUpdate,
        handScrollHintHasUpgradeReason
    };
}
