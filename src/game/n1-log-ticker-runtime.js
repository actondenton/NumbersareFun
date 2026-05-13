/**
 * Ambient marquee ticker + action log UI + adaptive tip timing + periodic random tips.
 */
import {
    getLogEntrySig,
    getVisibleLogEntries,
    isLogCategoryVisible as isLogCategoryVisibleForSettings,
    logCategoryTag,
    normalizeLogCategory as normalizeLogCategoryForLog,
    renderMessageLogLineHtml as renderMessageLogLineHtmlForEntry,
    renderMessageLogPageHtml as renderMessageLogPageHtmlForEntries
} from "./n1-log.js";

const ACTION_LOG_MAX = 50;
const ACTION_LOG_VISIBLE = 3;
const ACTION_LOG_EXPANDED = 15;
const TICKER_SPEED_PX_PER_SEC = 92;
const TICKER_ITEM_GAP_PX = 28;
const TICKER_QUEUE_MAX = 50;
/** Shown on the ambient ticker when the pending queue hits {@link TICKER_QUEUE_MAX}; not added to action log scrollback. */
const TICKER_QUEUE_OVERLOAD_NOTICE =
    "Wow, over 50 purchases and other updates are queued. Skipping that old and busted info and only reporting the breaking news!";
const RECENT_RANDOM_LOG_COUNT = 3;

const LOG_MESSAGE_ENTRIES = [
    { text: "Keep counting!", category: "tip" },
    { text: "How fast can you count?", category: "tip" },
    { text: "Have you ever counted on your fingers? What about counting with multiple hands?", category: "tip" },
    { text: "Every number counts.", category: "tip" },
    { text: "Speed is key.", category: "tip" },
    { text: "Counting is fun.", category: "tip" },
    { text: "Counting is addictive.", category: "tip" },
    { text: "Counting is rewarding.", category: "tip" },
    { text: "Counting is satisfying.", category: "tip" },
    { text: "Counting is relaxing.", category: "tip" },
    { text: "You can always count to one more.", category: "tip" },
    { text: "Counting is a skill that can be improved.", category: "tip" },
    { text: "At one point we counted from zero to one for the very first time.", category: "fact" },
    { text: "We don't know the biggest number someone or something has counted to.", category: "fact" },
    { text: "This game will have exponents in the hundreds but the universe only has 10e80 atoms. However, the universe is infinitely more complex than this game. Explain that to me.", category: "fact" },
    { text: "Most people can identify 4-5 objects without counting. Some people are better than others, this is called subitizing.  ", category: "fact" },
    { text: "I wanted to add subtraction but I came up with nothing.", category: "humor" },
    { text: "If machines do all the counting what will we use our fingers for?", category: "humor" }
];

const ADAPTIVE_TIP_FIRST_STALL_MS = 360000;
const ADAPTIVE_TIP_REPEAT_STALL_MS = 600000;

/**
 * @param {{
 *   getAmbientTickerEl: () => HTMLElement | null | undefined,
 *   getActionLogEl: () => HTMLElement | null | undefined,
 *   getActionLogContainer: () => HTMLElement | null | undefined,
 *   getActionLogToggle: () => HTMLElement | null | undefined,
 *   pagePanelEl: HTMLElement | null | undefined,
 *   pagePanelBodyEl: HTMLElement | null | undefined,
 *   pagePanelTitleEl: HTMLElement | null | undefined,
 *   escapeHtml: function(string): string,
 *   getSettings: () => { humorEnabled?: boolean, adaptiveTipsEnabled?: boolean },
 *   getAdaptiveTipMessage: () => string,
 *   logPanelRefreshDeps: { renderMessagesAndStory?: () => string },
 * }} deps
 */
export function createLogTickerRuntime(deps) {
    const {
        getAmbientTickerEl,
        getActionLogEl,
        getActionLogContainer,
        getActionLogToggle,
        pagePanelEl,
        pagePanelBodyEl,
        pagePanelTitleEl,
        escapeHtml: escapeHtmlDep,
        getSettings,
        getAdaptiveTipMessage,
        logPanelRefreshDeps
    } = deps;

    const actionLogEntries = [];
    const tickerQueue = [];
    const activeTickerItems = [];
    let tickerReducedMotionQuery = null;
    let tickerSpawnTimerId = 0;
    let tickerNextSpawnAtMs = 0;
    let actionLogExpanded = false;
    let messageLogLastRenderedVisibleCount = -1;
    let messageLogLastRenderedHeadSig = "";
    let messageLogLastRenderedTailSig = "";
    const recentRandomLogMessages = [];
    let adaptiveLastProgressAtMs = Date.now();
    let adaptiveLastHintAtMs = 0;

    function normalizeLogCategory(category) {
        return normalizeLogCategoryForLog(category);
    }
    function isLogCategoryVisible(category) {
        return isLogCategoryVisibleForSettings(category, getSettings().humorEnabled);
    }
    function prefersReducedTickerMotion() {
        try {
            if (!tickerReducedMotionQuery && window.matchMedia) {
                tickerReducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
            }
            return !!(tickerReducedMotionQuery && tickerReducedMotionQuery.matches);
        } catch (_) {
            return false;
        }
    }
    function createTickerItem(entry) {
        const cat = normalizeLogCategory(entry.category);
        const item = document.createElement("span");
        item.className = "ambient-message-ticker__item ambient-message-ticker__item--" + cat;
        item.textContent = "[" + logCategoryTag(cat) + "] " + entry.text;
        return item;
    }
    function cleanupTickerItem(item) {
        const idx = activeTickerItems.indexOf(item);
        if (idx !== -1) activeTickerItems.splice(idx, 1);
        if (item && item.parentNode) item.parentNode.removeChild(item);
        if (activeTickerItems.length === 0 && tickerQueue.length > 0 && !tickerSpawnTimerId) {
            spawnTickerItem();
        }
    }
    function scheduleTickerSpawn(delayMs) {
        if (tickerSpawnTimerId || tickerQueue.length === 0) return;
        tickerSpawnTimerId = window.setTimeout(() => {
            tickerSpawnTimerId = 0;
            spawnTickerItem();
        }, Math.max(0, delayMs));
    }
    function spawnTickerItem() {
        const ambientMessageTickerEl = getAmbientTickerEl();
        if (!ambientMessageTickerEl || tickerQueue.length === 0) return;
        const containerWidth = ambientMessageTickerEl.clientWidth || 600;
        const entry = tickerQueue.shift();
        const item = createTickerItem(entry);
        ambientMessageTickerEl.appendChild(item);
        const width = item.getBoundingClientRect().width || Math.max(80, item.textContent.length * 8);
        const startX = containerWidth;
        const endX = -width - TICKER_ITEM_GAP_PX;
        const durationMs = Math.max(4500, ((startX - endX) / TICKER_SPEED_PX_PER_SEC) * 1000);
        const nextDelayMs = Math.max(240, ((width + TICKER_ITEM_GAP_PX) / TICKER_SPEED_PX_PER_SEC) * 1000);
        item.style.transform = "translate3d(" + startX + "px, 0, 0)";
        activeTickerItems.push(item);
        tickerNextSpawnAtMs = Date.now() + nextDelayMs;
        if (typeof item.animate === "function") {
            const animation = item.animate([
                { transform: "translate3d(" + startX + "px, 0, 0)" },
                { transform: "translate3d(" + endX + "px, 0, 0)" }
            ], {
                duration: durationMs,
                easing: "linear",
                fill: "forwards"
            });
            animation.onfinish = () => cleanupTickerItem(item);
            animation.oncancel = () => cleanupTickerItem(item);
        } else {
            item.style.transition = "transform " + durationMs + "ms linear";
            window.requestAnimationFrame(() => {
                item.style.transform = "translate3d(" + endX + "px, 0, 0)";
            });
            window.setTimeout(() => cleanupTickerItem(item), durationMs);
        }
        scheduleTickerSpawn(nextDelayMs);
    }
    function startTickerLoop() {
        const ambientMessageTickerEl = getAmbientTickerEl();
        if (!ambientMessageTickerEl) return;
        if (prefersReducedTickerMotion()) {
            const latest = tickerQueue.pop();
            tickerQueue.length = 0;
            activeTickerItems.length = 0;
            if (tickerSpawnTimerId) {
                window.clearTimeout(tickerSpawnTimerId);
                tickerSpawnTimerId = 0;
            }
            ambientMessageTickerEl.replaceChildren();
            if (latest) ambientMessageTickerEl.appendChild(createTickerItem(latest));
            return;
        }
        if (activeTickerItems.length === 0) {
            spawnTickerItem();
            return;
        }
        scheduleTickerSpawn(Math.max(0, tickerNextSpawnAtMs - Date.now()));
    }
    /** Drop queued + in-flight ticker items (same as ascension wipe, scrollback only). */
    function clearAmbientTickerPipeline() {
        tickerQueue.length = 0;
        if (tickerSpawnTimerId) {
            window.clearTimeout(tickerSpawnTimerId);
            tickerSpawnTimerId = 0;
        }
        tickerNextSpawnAtMs = 0;
        const items = activeTickerItems.slice();
        items.forEach(function (item) {
            if (item && typeof item.getAnimations === "function") {
                item.getAnimations().forEach(a => {
                    try {
                        a.cancel();
                    } catch (_) { /* noop */ }
                });
            }
            if (item && item.parentNode) item.parentNode.removeChild(item);
        });
        activeTickerItems.length = 0;
        const ambientMessageTickerEl = getAmbientTickerEl();
        if (ambientMessageTickerEl) {
            ambientMessageTickerEl.replaceChildren();
            ambientMessageTickerEl.className = "ambient-message-ticker";
        }
    }
    function setAmbientMessage(entry) {
        const ambientMessageTickerEl = getAmbientTickerEl();
        if (!ambientMessageTickerEl || !entry) return;
        const cat = normalizeLogCategory(entry.category);
        if (!isLogCategoryVisible(cat)) return;
        if (tickerQueue.length >= TICKER_QUEUE_MAX) {
            clearAmbientTickerPipeline();
            tickerQueue.push({ text: TICKER_QUEUE_OVERLOAD_NOTICE, category: "system" });
        }
        tickerQueue.push({ text: entry.text, category: cat });
        ambientMessageTickerEl.className = "ambient-message-ticker";
        startTickerLoop();
    }
    function renderActionLog() {
        const actionLogEl = getActionLogEl();
        if (!actionLogEl) return;
        const prevTop = actionLogEl.scrollTop;
        const prevLeft = actionLogEl.scrollLeft;
        const prevHeight = actionLogEl.scrollHeight;
        const prevWidth = actionLogEl.scrollWidth;
        const wasPinnedToBottom = (prevTop + actionLogEl.clientHeight) >= (prevHeight - 2);
        const wasPinnedToRight = (prevLeft + actionLogEl.clientWidth) >= (prevWidth - 2);
        const n = actionLogExpanded ? ACTION_LOG_EXPANDED : ACTION_LOG_VISIBLE;
        const visible = getVisibleLogEntries(actionLogEntries, getSettings().humorEnabled);
        const toShow = visible.slice(-n);
        actionLogEl.innerHTML = "";
        toShow.forEach(entry => {
            const line = document.createElement("div");
            line.className = "action-log-line action-log-cat-" + entry.category;
            line.setAttribute("data-log-category", entry.category);
            line.textContent = entry.text;
            actionLogEl.appendChild(line);
        });
        if (wasPinnedToBottom) {
            actionLogEl.scrollTop = actionLogEl.scrollHeight;
        } else {
            actionLogEl.scrollTop = prevTop;
        }
        if (wasPinnedToRight) {
            actionLogEl.scrollLeft = actionLogEl.scrollWidth;
        } else {
            actionLogEl.scrollLeft = prevLeft;
        }
    }

    function renderMessageLogPageHtml(escapeHtml) {
        const visible = getVisibleLogEntries(actionLogEntries, getSettings().humorEnabled);
        if (visible.length === 0) {
            messageLogLastRenderedVisibleCount = 0;
            messageLogLastRenderedHeadSig = "";
            messageLogLastRenderedTailSig = "";
            return renderMessageLogPageHtmlForEntries(visible, escapeHtml);
        }
        messageLogLastRenderedVisibleCount = visible.length;
        messageLogLastRenderedHeadSig = getLogEntrySig(visible[0]);
        messageLogLastRenderedTailSig = getLogEntrySig(visible[visible.length - 1]);
        return renderMessageLogPageHtmlForEntries(visible, escapeHtml);
    }

    function refreshMessageLogPanelIfOpen(escapeHtml) {
        if (!pagePanelEl || pagePanelEl.style.display === "none" || !pagePanelBodyEl || !pagePanelTitleEl) return;
        if (pagePanelEl.dataset.openPageId !== "messages") return;
        const visible = getVisibleLogEntries(actionLogEntries, getSettings().humorEnabled);
        const prevBody = document.getElementById("message-log-terminal-body");
        const prevHeader = document.getElementById("message-log-terminal-header");
        const headSig = getLogEntrySig(visible[0]);
        const tailSig = getLogEntrySig(visible[visible.length - 1]);
        if (
            prevBody &&
            prevHeader &&
            messageLogLastRenderedVisibleCount >= 0 &&
            visible.length === messageLogLastRenderedVisibleCount + 1
        ) {
            const prevTop = prevBody.scrollTop;
            const prevLeft = prevBody.scrollLeft;
            const prevHeight = prevBody.scrollHeight;
            const prevWidth = prevBody.scrollWidth;
            const wasPinnedToBottom = (prevTop + prevBody.clientHeight) >= (prevHeight - 2);
            const wasPinnedToRight = (prevLeft + prevBody.clientWidth) >= (prevWidth - 2);
            prevBody.insertAdjacentHTML(
                "beforeend",
                renderMessageLogLineHtmlForEntry(visible[visible.length - 1], escapeHtml)
            );
            prevHeader.textContent = "message_feed // " + visible.length + " line(s) visible";
            messageLogLastRenderedVisibleCount = visible.length;
            messageLogLastRenderedHeadSig = headSig;
            messageLogLastRenderedTailSig = tailSig;
            if (wasPinnedToBottom) prevBody.scrollTop = prevBody.scrollHeight;
            else prevBody.scrollTop = prevTop;
            if (wasPinnedToRight) prevBody.scrollLeft = prevBody.scrollWidth;
            else prevBody.scrollLeft = prevLeft;
            return;
        }
        if (
            prevBody &&
            prevHeader &&
            messageLogLastRenderedVisibleCount > 0 &&
            visible.length === messageLogLastRenderedVisibleCount &&
            visible.length >= ACTION_LOG_MAX &&
            headSig !== messageLogLastRenderedHeadSig &&
            tailSig !== messageLogLastRenderedTailSig
        ) {
            const prevTop = prevBody.scrollTop;
            const prevLeft = prevBody.scrollLeft;
            const prevHeight = prevBody.scrollHeight;
            const prevWidth = prevBody.scrollWidth;
            const wasPinnedToBottom = (prevTop + prevBody.clientHeight) >= (prevHeight - 2);
            const wasPinnedToRight = (prevLeft + prevBody.clientWidth) >= (prevWidth - 2);
            if (prevBody.firstElementChild) prevBody.removeChild(prevBody.firstElementChild);
            prevBody.insertAdjacentHTML(
                "beforeend",
                renderMessageLogLineHtmlForEntry(visible[visible.length - 1], escapeHtml)
            );
            prevHeader.textContent = "message_feed // " + visible.length + " line(s) visible";
            messageLogLastRenderedVisibleCount = visible.length;
            messageLogLastRenderedHeadSig = headSig;
            messageLogLastRenderedTailSig = tailSig;
            if (wasPinnedToBottom) prevBody.scrollTop = prevBody.scrollHeight;
            else prevBody.scrollTop = prevTop;
            if (wasPinnedToRight) prevBody.scrollLeft = prevBody.scrollWidth;
            else prevBody.scrollLeft = prevLeft;
            return;
        }
        let prevTop = 0;
        let prevLeft = 0;
        let prevHeight = 0;
        let prevWidth = 0;
        let wasPinnedToBottom = true;
        let wasPinnedToRight = false;
        if (prevBody) {
            prevTop = prevBody.scrollTop;
            prevLeft = prevBody.scrollLeft;
            prevHeight = prevBody.scrollHeight;
            prevWidth = prevBody.scrollWidth;
            wasPinnedToBottom = (prevTop + prevBody.clientHeight) >= (prevHeight - 2);
            wasPinnedToRight = (prevLeft + prevBody.clientWidth) >= (prevWidth - 2);
        }
        const renderFull = logPanelRefreshDeps.renderMessagesAndStory;
        pagePanelBodyEl.innerHTML = renderFull ? renderFull() : "";
        const nextBody = document.getElementById("message-log-terminal-body");
        if (!nextBody) return;
        if (wasPinnedToBottom) {
            nextBody.scrollTop = nextBody.scrollHeight;
        } else {
            nextBody.scrollTop = prevTop;
        }
        if (wasPinnedToRight) {
            nextBody.scrollLeft = nextBody.scrollWidth;
        } else {
            nextBody.scrollLeft = prevLeft;
        }
        messageLogLastRenderedVisibleCount = visible.length;
        messageLogLastRenderedHeadSig = headSig;
        messageLogLastRenderedTailSig = tailSig;
    }

    function addToLog(msg, category) {
        const cat = normalizeLogCategory(category);
        if (!isLogCategoryVisible(cat)) return;
        actionLogEntries.push({ text: msg, category: cat });
        if (actionLogEntries.length > ACTION_LOG_MAX) actionLogEntries.shift();
        setAmbientMessage({ text: msg, category: cat });
        renderActionLog();
        refreshMessageLogPanelIfOpen(escapeHtmlDep);
    }

    /** Wipe prior-run scrollback and ticker queue when Number 1 ascends so the log starts fresh for the new run. */
    function clearActionLogBacklogOnAscension() {
        actionLogEntries.length = 0;
        clearAmbientTickerPipeline();
        messageLogLastRenderedVisibleCount = -1;
        messageLogLastRenderedHeadSig = "";
        messageLogLastRenderedTailSig = "";
        renderActionLog();
        refreshMessageLogPanelIfOpen(escapeHtmlDep);
    }

    function markMeaningfulProgress() {
        adaptiveLastProgressAtMs = Date.now();
    }

    function maybeEmitAdaptiveTip(nowMs) {
        if (getSettings().adaptiveTipsEnabled === false) return;
        const now = nowMs || Date.now();
        const sinceProgress = now - adaptiveLastProgressAtMs;
        if (adaptiveLastHintAtMs <= 0) {
            if (sinceProgress < ADAPTIVE_TIP_FIRST_STALL_MS) return;
        } else if (now - adaptiveLastHintAtMs < ADAPTIVE_TIP_REPEAT_STALL_MS) {
            return;
        }
        addToLog(getAdaptiveTipMessage(), "tip");
        adaptiveLastHintAtMs = now;
    }

    function wireActionLogToggle() {
        const actionLogToggle = getActionLogToggle();
        if (!actionLogToggle) return;
        actionLogToggle.addEventListener("click", () => {
            actionLogExpanded = !actionLogExpanded;
            actionLogToggle.textContent = actionLogExpanded ? "Show less" : "Show more";
            const actionLogContainer = getActionLogContainer();
            if (actionLogContainer) actionLogContainer.classList.toggle("expanded", actionLogExpanded);
            renderActionLog();
        });
    }
    wireActionLogToggle();

    function restartAdaptiveTipClockAfterSettingsTurnOn() {
        adaptiveLastHintAtMs = Date.now();
        adaptiveLastProgressAtMs = Date.now();
    }

    /** @param {{ shouldSkipAmbientRandomTicker?: function(): boolean }} [runtimeOpts] */
    function startPeriodicAmbientAndAdaptive(runtimeOpts) {
        const skipAmbientRandom =
            runtimeOpts &&
            typeof runtimeOpts.shouldSkipAmbientRandomTicker === "function"
                ? runtimeOpts.shouldSkipAmbientRandomTicker
                : () => false;
        setInterval(() => {
            if (skipAmbientRandom()) return;
            const source = LOG_MESSAGE_ENTRIES.filter(e => isLogCategoryVisible(e.category));
            if (source.length === 0) return;
            const allowed = source.filter(e => !recentRandomLogMessages.includes(e.text));
            const pool = allowed.length > 0 ? allowed : source;
            const pick = pool[Math.floor(Math.random() * pool.length)];
            setAmbientMessage(pick);
            recentRandomLogMessages.push(pick.text);
            if (recentRandomLogMessages.length > RECENT_RANDOM_LOG_COUNT) recentRandomLogMessages.shift();
        }, 20000);

        setTimeout(() => {
            const first = LOG_MESSAGE_ENTRIES[0];
            if (first) setAmbientMessage(first);
        }, 2000);

        setInterval(() => {
            maybeEmitAdaptiveTip(Date.now());
        }, 2000);
    }

    return {
        normalizeLogCategory,
        isLogCategoryVisible,
        addToLog,
        renderActionLog,
        clearActionLogBacklogOnAscension,
        setAmbientMessage,
        clearAmbientTickerPipeline,
        markMeaningfulProgress,
        maybeEmitAdaptiveTip,
        renderMessageLogPageHtml,
        refreshMessageLogPanelIfOpen: () => refreshMessageLogPanelIfOpen(escapeHtmlDep),
        startPeriodicAmbientAndAdaptive,
        getAdaptiveLastProgressAtMs: () => adaptiveLastProgressAtMs,
        getAdaptiveLastHintAtMs: () => adaptiveLastHintAtMs,
        setAdaptiveTipTimestampsFromSave(progressMs, hintMs) {
            adaptiveLastProgressAtMs = progressMs;
            adaptiveLastHintAtMs = hintMs;
        },
        restartAdaptiveTipClockAfterSettingsTurnOn
    };
}
