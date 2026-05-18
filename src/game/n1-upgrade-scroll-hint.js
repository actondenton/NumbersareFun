/**
 * Off-screen upgrade row scroll nudge (Time Warp + affordable upgrades).
 * Time-warp predicates are supplied via {@link N1UpgradeScrollHintTimeWarpApiRef} patched after `createNumber1TimeWarpBoot`.
 */

/**
 * @typedef {object} N1UpgradeScrollHintTimeWarpApiRef
 * @property {(handIndex: number) => boolean} handContributesToScrollHint
 * @property {(handIndex: number) => number} handContributesTimeWarpPriority
 * @property {(handIndex: number) => boolean} handHasActiveTimeWarpAura
 */

/**
 * @param {object} deps
 * @param {HTMLElement | null} deps.upgradeScrollHintEl
 * @param {HTMLElement | null} deps.upgradeScrollHintMessagesEl
 * @param {HTMLElement | null} deps.upgradeScrollHintJumpsEl
 * @param {() => number} deps.getUnlockedHands
 * @param {() => number} deps.getTotalChanges
 * @param {(i: number) => number} deps.getHandEarning
 * @param {() => number[]} deps.getSpeedLevel
 * @param {(handIndex: number, nextLevel: number) => number} deps.getUpgradeCost
 * @param {() => boolean} deps.getCheapenSectionUnlocked
 * @param {() => number[]} deps.getCheapenLevel
 * @param {() => number} deps.getMaxCheapenLevel
 * @param {(handIndex: number, nextLevel: number) => number | null} deps.getCheapenUpgradeCost
 * @param {() => boolean} deps.isSlowdownUnlocked
 * @param {() => number[]} deps.getSlowdownLevel
 * @param {() => number} deps.getMaxSlowdownLevelCap
 * @param {(nextLevel: number) => number | null} deps.getSlowdownUpgradeCost
 * @param {() => boolean} deps.getAutoBuyUnlocked
 * @param {(i: number) => boolean} deps.getAutoBuyEnabledByHand
 * @param {(i: number) => number} deps.getAutoBuyCountdownSecondsByHand
 * @param {() => Record<number, { handUpgradeRowEl?: HTMLElement | null }>} deps.getSpeedRowRefs
 * @param {() => N1UpgradeScrollHintTimeWarpApiRef} deps.getTimeWarpScrollHintApi
 */
export function createN1UpgradeScrollHint(deps) {
    const {
        upgradeScrollHintEl,
        upgradeScrollHintMessagesEl,
        upgradeScrollHintJumpsEl,
        getUnlockedHands,
        getTotalChanges,
        getHandEarning,
        getSpeedLevel,
        getUpgradeCost,
        getCheapenSectionUnlocked,
        getCheapenLevel,
        getMaxCheapenLevel,
        getCheapenUpgradeCost,
        isSlowdownUnlocked,
        getSlowdownLevel,
        getMaxSlowdownLevelCap,
        getSlowdownUpgradeCost,
        getAutoBuyUnlocked,
        getAutoBuyEnabledByHand,
        getAutoBuyCountdownSecondsByHand,
        getSpeedRowRefs,
        getTimeWarpScrollHintApi
    } = deps;

    const UPGRADE_SCROLL_HINT_TOP_MARGIN = 72;
    const UPGRADE_SCROLL_HINT_BOTTOM_MARGIN = 32;
    const SCROLL_HINT_PULSE_COOLDOWN_MS = 5000;
    const SPEED_AUTOBUY_SUPPRESS_COUNTDOWN_SEC = 5;
    let lastScrollHintPulseUpAt = 0;
    let lastScrollHintPulseDownAt = 0;
    let upgradeScrollHintLastStateKey = "";

    function tw() {
        return getTimeWarpScrollHintApi();
    }

    function handHasSpeedAffordableNext(handIndex) {
        const unlockedHands = getUnlockedHands();
        if (handIndex < 0 || handIndex >= unlockedHands || getTotalChanges() < 10) return false;
        const bal = getHandEarning(handIndex) || 0;
        const speedLevel = getSpeedLevel();
        const nextLevel = speedLevel[handIndex] + 1;
        return bal >= getUpgradeCost(handIndex, nextLevel);
    }
    function handHasCheapenAffordableNext(handIndex) {
        const unlockedHands = getUnlockedHands();
        if (handIndex < 0 || handIndex >= unlockedHands || !getCheapenSectionUnlocked()) return false;
        const bal = getHandEarning(handIndex) || 0;
        const cheapenLevel = getCheapenLevel();
        const cl = cheapenLevel[handIndex] ?? 0;
        const cap = getMaxCheapenLevel();
        if (cl >= cap) return false;
        const c = getCheapenUpgradeCost(handIndex, cl + 1);
        return c !== null && bal >= c;
    }
    function handHasSlowdownAffordableNext(handIndex) {
        const unlockedHands = getUnlockedHands();
        if (handIndex < 0 || handIndex >= unlockedHands || !isSlowdownUnlocked()) return false;
        const bal = getHandEarning(handIndex) || 0;
        const slowdownLevel = getSlowdownLevel();
        const sl = slowdownLevel[handIndex] ?? 0;
        const cap = getMaxSlowdownLevelCap();
        if (sl >= cap) return false;
        const c = getSlowdownUpgradeCost(sl + 1);
        return c !== null && bal >= c;
    }
    function handHasAffordableUpgradeWaiting(handIndex) {
        return handHasSpeedAffordableNext(handIndex) || handHasCheapenAffordableNext(handIndex) || handHasSlowdownAffordableNext(handIndex);
    }
    function handSuppressedForImminentSpeedAutobuy(handIndex) {
        if (!getAutoBuyUnlocked() || !getAutoBuyEnabledByHand(handIndex)) return false;
        const cd = getAutoBuyCountdownSecondsByHand(handIndex) || 0;
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
        const unlockedHands = getUnlockedHands();
        const speedRowRefs = getSpeedRowRefs();
        for (let i = 0; i < unlockedHands; i++) {
            if (!tw().handContributesToScrollHint(i)) continue;
            const row = speedRowRefs[i] && speedRowRefs[i].handUpgradeRowEl;
            if (!row) continue;
            if (handUpgradeRowIntersectsViewportComfort(row)) continue;
            const r = row.getBoundingClientRect();
            if (r.bottom <= vTop) above.push({ handIndex: i, row: row, r: r });
            else if (r.top >= vBot) below.push({ handIndex: i, row: row, r: r });
        }
        above.sort((a, b) => {
            const pa = tw().handContributesTimeWarpPriority(a.handIndex);
            const pb = tw().handContributesTimeWarpPriority(b.handIndex);
            if (pa !== pb) return pb - pa;
            return b.r.bottom - a.r.bottom;
        });
        below.sort((a, b) => {
            const pa = tw().handContributesTimeWarpPriority(a.handIndex);
            const pb = tw().handContributesTimeWarpPriority(b.handIndex);
            if (pa !== pb) return pb - pa;
            return a.r.top - b.r.top;
        });
        return { above: above, below: below };
    }
    function pulseUpgradeScrollHintShell() {
        if (!upgradeScrollHintEl) return;
        upgradeScrollHintEl.classList.remove("upgrade-scroll-hint--pulse");
        void upgradeScrollHintEl.offsetWidth;
        upgradeScrollHintEl.classList.add("upgrade-scroll-hint--pulse");
        window.clearTimeout(pulseUpgradeScrollHintShell._clearT);
        pulseUpgradeScrollHintShell._clearT = window.setTimeout(() => {
            upgradeScrollHintEl.classList.remove("upgrade-scroll-hint--pulse");
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
    if (upgradeScrollHintEl && upgradeScrollHintEl.dataset.jumpBound !== "1") {
        upgradeScrollHintEl.dataset.jumpBound = "1";
        upgradeScrollHintEl.addEventListener("click", function(e) {
            const btn = e.target.closest("[data-jump-hand]");
            if (!btn) return;
            const i = parseInt(btn.getAttribute("data-jump-hand"), 10);
            const unlockedHands = getUnlockedHands();
            if (isNaN(i) || i < 0 || i >= unlockedHands) return;
            const speedRowRefs = getSpeedRowRefs();
            const row = speedRowRefs[i] && speedRowRefs[i].handUpgradeRowEl;
            if (row) scrollHandUpgradeRowFullyIntoView(row);
        });
    }
    let handUpgradeScrollHintRaf = 0;
    function updateHandUpgradeScrollHint() {
        if (!upgradeScrollHintEl || !upgradeScrollHintMessagesEl || !upgradeScrollHintJumpsEl) return;
        const { above, below } = classifyOffScreenScrollHintHands();
        const needUp = above.length > 0;
        const needDown = below.length > 0;
        if (!needUp) lastScrollHintPulseUpAt = 0;
        if (!needDown) lastScrollHintPulseDownAt = 0;
        if (!needUp && !needDown) {
            upgradeScrollHintMessagesEl.textContent = "";
            upgradeScrollHintJumpsEl.innerHTML = "";
            upgradeScrollHintEl.classList.remove("upgrade-scroll-hint--down-only");
            upgradeScrollHintEl.hidden = true;
            upgradeScrollHintLastStateKey = "";
            return;
        }
        upgradeScrollHintEl.hidden = false;
        upgradeScrollHintEl.classList.toggle("upgrade-scroll-hint--down-only", needDown && !needUp);
        const upTwAny = needUp && above.some(e => tw().handHasActiveTimeWarpAura(e.handIndex));
        const upGrAny = needUp && above.some(e => handScrollHintHasUpgradeReason(e.handIndex));
        const downTwAny = needDown && below.some(e => tw().handHasActiveTimeWarpAura(e.handIndex));
        const downGrAny = needDown && below.some(e => handScrollHintHasUpgradeReason(e.handIndex));
        const upPri = above[0] ? above[0].handIndex : "x";
        const downPri = below[0] ? below[0].handIndex : "x";
        const upPriTw = above[0] && tw().handHasActiveTimeWarpAura(above[0].handIndex) ? "1" : "0";
        const downPriTw = below[0] && tw().handHasActiveTimeWarpAura(below[0].handIndex) ? "1" : "0";
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
            upgradeScrollHintMessagesEl.innerHTML = "";
            if (needUp) {
                const line = document.createElement("div");
                line.className = "upgrade-scroll-hint-line";
                if (upTwAny && upGrAny) line.textContent = "Scroll up, hand upgrades or a Time Warp are available!";
                else if (upTwAny) line.textContent = "Scroll up, a Time Warp is waiting!";
                else line.textContent = "Scroll up, hand upgrades are available!";
                upgradeScrollHintMessagesEl.appendChild(line);
            }
            if (needDown) {
                const line = document.createElement("div");
                line.className = "upgrade-scroll-hint-line";
                if (downTwAny && downGrAny) line.textContent = "Scroll down, hand upgrades or a Time Warp are available!";
                else if (downTwAny) line.textContent = "Scroll down, a Time Warp is waiting!";
                else line.textContent = "Scroll down, hand upgrades are available!";
                upgradeScrollHintMessagesEl.appendChild(line);
            }
            upgradeScrollHintJumpsEl.innerHTML = "";
            if (needUp && above[0]) {
                const hi = above[0].handIndex;
                const b = document.createElement("button");
                b.type = "button";
                b.className = "upgrade-scroll-hint-jump-btn";
                b.setAttribute("data-jump-hand", String(hi));
                b.textContent = tw().handHasActiveTimeWarpAura(hi) ? "Jump to Hand " + (hi + 1) + " (Time Warp)" : "Jump to Hand " + (hi + 1);
                upgradeScrollHintJumpsEl.appendChild(b);
            }
            if (needDown && below[0]) {
                const hi = below[0].handIndex;
                const b = document.createElement("button");
                b.type = "button";
                b.className = "upgrade-scroll-hint-jump-btn";
                b.setAttribute("data-jump-hand", String(hi));
                b.textContent = tw().handHasActiveTimeWarpAura(hi) ? "Jump to Hand " + (hi + 1) + " (Time Warp)" : "Jump to Hand " + (hi + 1);
                upgradeScrollHintJumpsEl.appendChild(b);
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

    return {
        updateHandUpgradeScrollHint,
        scheduleHandUpgradeScrollHintUpdate,
        handScrollHintHasUpgradeReason
    };
}
