import {
    NUMBER2_BG_ROLLS_PER_SEC,
    NUMBER2_ASCENSION_READY_TOTAL,
    NUMBER_2_MILESTONES,
    computeNumber2ActiveRollsPerSec,
    computeNumber2EffectivePDouble,
    formatNumber2BigIntDisplay,
    isPrimeInt
} from "./number2-rules.js";

export function createNumber2State() {
    return {
        totalStr: "2",
        luck: 0,
        boomTokens: 0,
        bustTokens: 0,
        tokenGainCarry: 0,
        streakDouble: 0,
        streakNothing: 0,
        lifetimeDoubles: 0,
        lifetimeNothings: 0,
        upgradeLevels: {},
        started: false,
        autoTickCarry: 0,
        bgTickCarry: 0,
        lastDieA: 1,
        lastDieB: 1,
        lastOutcome: "",
        playingFairActive: false,
        runTheTableUntilMs: 0,
        runTheTableReadyAtMs: 0,
        sandbagReadyAtMs: 0,
        forceNextNothing: false,
        hotStreakEnabled: true,
        gamblersParadoxEnabled: true,
        number2SaveVersion: 4,
        ascensionEssence: 0,
        ascensionNodeIds: [],
        /** Legacy stub fields (migrated once). */
        totalTwos: 0,
        tickCarry: 0
    };
}

export function createNumber2Controller(state, deps) {
    const d = deps || {};
    const formatCount = d.formatCount || (n => String(n));
    const addToLog = d.addToLog || function () {};
    const autosaveNow = d.autosaveNow || function () {};
    const refreshOverviewAndAscensionPanelsIfOpen = d.refreshOverviewAndAscensionPanelsIfOpen || function () {};
    const refreshGlobalOverviewPanelIfOpen = d.refreshGlobalOverviewPanelIfOpen || function () {};
    const renderAscensionPageHtml = d.renderAscensionPageHtml || function () { return ""; };
    const getPagePanelBodyEl = d.getPagePanelBodyEl || function () { return null; };
    const getCurrentNumberMode = d.getCurrentNumberMode || function () { return 1; };
    const isUnlocked = d.isUnlocked || function () { return true; };
    const getUpgrades = d.getUpgrades || function () { return []; };
    const getAscension2Export = d.getAscension2Export || function () { return null; };
    const getBasePDouble = d.getBasePDouble || function () { return 0.48; };
    const getMinPDouble = d.getMinPDouble || function () { return 0.05; };
    const getMaxPDouble = d.getMaxPDouble || function () { return 0.95; };

    function totalBig() {
        try {
            return BigInt(state.totalStr || "2");
        } catch (_) {
            return 2n;
        }
    }
    function setTotalBig(b) {
        state.totalStr = b.toString();
    }
    function formatTotalBig(b) {
        return formatNumber2BigIntDisplay(b, formatCount);
    }
    function getUpgradeLevel(id) {
        const n = state.upgradeLevels[id];
        return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    }
    function getUpgradeDef(id) {
        return getUpgrades().find(u => u.id === id) || null;
    }
    function getUpgradeCost(u, level) {
        if (!u || !Array.isArray(u.cost)) return 0;
        const idx = Math.max(0, Math.min(u.cost.length - 1, level));
        return u.cost[idx];
    }
    function getPlayingFairTokenMultiplier() {
        if (!(state.playingFairActive && getUpgradeLevel("playing_fair") > 0)) return 1;
        const L = getUpgradeLevel("playing_fair");
        return L <= 1 ? 2 : L === 2 ? 2.5 : 3;
    }
    function addTokens(kind, rawAmount, opts) {
        const amount = Math.max(0, Number(rawAmount) || 0);
        if (amount <= 0) return 0;
        const mult = getPlayingFairTokenMultiplier();
        let banked = amount * mult + (state.tokenGainCarry || 0);
        const whole = Math.floor(banked);
        state.tokenGainCarry = Math.max(0, banked - whole);
        if (whole <= 0) return 0;
        if (kind === "boom") state.boomTokens = Math.min(Number.MAX_SAFE_INTEGER, (state.boomTokens || 0) + whole);
        else if (kind === "bust") state.bustTokens = Math.min(Number.MAX_SAFE_INTEGER, (state.bustTokens || 0) + whole);
        if (!(opts && opts.silent)) {
            const reason = opts && opts.reason ? " (" + opts.reason + ")" : "";
            addToLog("Number 2: +" + formatCount(whole) + " " + (kind === "boom" ? "Boom" : "Bust") + " token" + (whole === 1 ? "" : "s") + reason + ".", "milestone");
        }
        return whole;
    }
    function hasChanceModByUpgrade(id) {
        return id === "hot_streak" || id === "gamblers_paradox" || id === "run_the_table";
    }
    function isUpgradeToggleEnabled(id) {
        if (id === "hot_streak") return state.hotStreakEnabled !== false;
        if (id === "gamblers_paradox") return state.gamblersParadoxEnabled !== false;
        return true;
    }
    function setExclusiveToggle(activeId, on) {
        const enable = !!on;
        const ids = ["hot_streak", "gamblers_paradox", "playing_fair"];
        if (!enable) {
            if (activeId === "hot_streak") state.hotStreakEnabled = false;
            else if (activeId === "gamblers_paradox") state.gamblersParadoxEnabled = false;
            else if (activeId === "playing_fair") state.playingFairActive = false;
            return;
        }
        ids.forEach(id => {
            const isActive = id === activeId;
            if (id === "hot_streak") state.hotStreakEnabled = isActive;
            else if (id === "gamblers_paradox") state.gamblersParadoxEnabled = isActive;
            else if (id === "playing_fair") state.playingFairActive = isActive;
        });
    }
    function areChanceModsEnabled() {
        return !state.playingFairActive;
    }
    function getAsc2Totals() {
        const asc2 = getAscension2Export();
        if (!asc2 || !asc2.computeAscension2GrantTotals) {
            return { pDoubleAdd: 0, luckPerDouble: 0, activeRollMult: 0 };
        }
        return asc2.computeAscension2GrantTotals(state.ascensionNodeIds);
    }
    function getEffectivePDouble() {
        const runL = getUpgradeLevel("run_the_table");
        return computeNumber2EffectivePDouble({
            basePDouble: getBasePDouble(),
            minPDouble: getMinPDouble(),
            maxPDouble: getMaxPDouble(),
            chanceModsEnabled: areChanceModsEnabled(),
            hotStreakLevel: getUpgradeLevel("hot_streak"),
            hotStreakEnabled: isUpgradeToggleEnabled("hot_streak"),
            gamblersParadoxLevel: getUpgradeLevel("gamblers_paradox"),
            gamblersParadoxEnabled: isUpgradeToggleEnabled("gamblers_paradox"),
            runTheTableLevel: runL,
            runTheTableActive: runL > 0 && (state.runTheTableUntilMs || 0) > Date.now(),
            ascensionPDoubleAdd: getAsc2Totals().pDoubleAdd || 0
        });
    }
    function getLuckPerNothing() {
        return 1;
    }
    function getActiveRollsPerSec() {
        return computeNumber2ActiveRollsPerSec(getAsc2Totals().activeRollMult || 0);
    }
    function canTick() {
        return isUnlocked() && !!state.started;
    }
    function reconcileLockState() {
        if (!isUnlocked()) {
            state.started = false;
            resetNumber2State(state);
            return;
        }
        if (!state.started) {
            resetNumber2State(state);
        }
    }
    function handleModeSwitched(mode) {
        if (mode !== 2 || !isUnlocked() || state.started) return false;
        state.started = true;
        addToLog("Number 2 — Double or Nothing is live. Rolls run faster here; slower in the background on Number 1.", "milestone");
        refreshOverviewAndAscensionPanelsIfOpen();
        autosaveNow();
        return true;
    }
    function resolveRoll() {
        if (state.forceNextNothing) {
            state.forceNextNothing = false;
            let a = 1 + Math.floor(Math.random() * 6);
            let b = 1 + Math.floor(Math.random() * 6);
            if (a === b) b = (a % 6) + 1;
            return { isDouble: false, dieA: a, dieB: b, p: getEffectivePDouble() };
        }
        const p = getEffectivePDouble();
        const isDouble = Math.random() < p;
        let a = 1 + Math.floor(Math.random() * 6);
        let b = 1 + Math.floor(Math.random() * 6);
        if (isDouble) {
            a = 1 + Math.floor(Math.random() * 6);
            b = a;
        } else if (a === b) {
            b = (a % 6) + 1;
        }
        return { isDouble, dieA: a, dieB: b, p };
    }
    function applyRollOutcome(res, opts) {
        const silent = opts && opts.silent;
        const prevNothingStreak = state.streakNothing || 0;
        state.lastDieA = res.dieA;
        state.lastDieB = res.dieB;
        state.lastOutcome = res.isDouble ? "double" : "nothing";
        if (res.isDouble) {
            setTotalBig(totalBig() * 2n);
            state.streakDouble = (state.streakDouble || 0) + 1;
            state.streakNothing = 0;
            state.lifetimeDoubles++;
            state.luck += 2;
            state.luck += getAsc2Totals().luckPerDouble || 0;
            if (isPrimeInt(state.streakDouble || 0)) {
                addTokens("boom", 1, { silent, reason: "prime Double streak " + formatCount(state.streakDouble || 0) });
            }
            const insuranceL = getUpgradeLevel("cold_hand_insurance");
            if (insuranceL > 0 && prevNothingStreak >= 3) {
                const u = getUpgradeDef("cold_hand_insurance");
                const gain = u && Array.isArray(u.boomBonusByLevel) ? (u.boomBonusByLevel[insuranceL - 1] || 0) : insuranceL;
                addTokens("boom", gain, { silent, reason: "Cold Hand Insurance" });
            }
            const winL = getUpgradeLevel("all_i_do_is_win");
            const winU = getUpgradeDef("all_i_do_is_win");
            if (winL > 0 && winU && Array.isArray(winU.bonusDoubleChanceByLevel)) {
                const procChance = winU.bonusDoubleChanceByLevel[winL - 1] || 0;
                if (Math.random() < procChance) {
                    setTotalBig(totalBig() * 2n);
                    if (!silent) addToLog("All I Do Is Win triggered: bonus Double!", "milestone");
                }
            }
            if (!silent) addToLog("Number 2: Double! Total is now " + formatTotalBig(totalBig()) + ".", "milestone");
        } else {
            const pennyL = getUpgradeLevel("in_for_a_penny");
            const pennyU = getUpgradeDef("in_for_a_penny");
            let floorVal = (pennyL > 0 && pennyU && Array.isArray(pennyU.nothingFloorByLevel))
                ? BigInt(Math.max(0, pennyU.nothingFloorByLevel[pennyL - 1] || 0))
                : 0n;
            const poundL = getUpgradeLevel("in_for_a_pound");
            if (poundL > 1 && floorVal > 0n) {
                floorVal = floorVal ** BigInt(poundL);
            }
            setTotalBig(floorVal);
            state.streakNothing = (state.streakNothing || 0) + 1;
            state.streakDouble = 0;
            state.lifetimeNothings++;
            state.luck += getLuckPerNothing();
            if (isPrimeInt(state.streakNothing || 0)) {
                addTokens("bust", 1, { silent, reason: "prime Nothing streak " + formatCount(state.streakNothing || 0) });
            }
            if (!silent) addToLog("Number 2: Nothing — total reset to " + formatTotalBig(totalBig()) + ".", "tip");
        }
        if (state.lifetimeDoubles > 0 && state.lifetimeDoubles % 25 === 0 && res.isDouble) {
            state.ascensionEssence = Math.min(Number.MAX_SAFE_INTEGER, (state.ascensionEssence || 0) + 1);
        }
    }
    function commitRoll(opts) {
        if (!canTick()) return;
        const res = resolveRoll();
        applyRollOutcome(res, opts);
        if (!opts || !opts.skipAutosave) autosaveNow();
        updateStageUI();
        if (!opts || !opts.silent) refreshOverviewAndAscensionPanelsIfOpen();
    }
    const maxRollsPerStep = 400;
    function tickBackground(dtSec) {
        if (!canTick()) return;
        if (!(dtSec > 0)) return;
        if (getCurrentNumberMode() === 2) return;
        state.bgTickCarry += dtSec * NUMBER2_BG_ROLLS_PER_SEC;
        let guard = 0;
        while (state.bgTickCarry >= 1 && guard < maxRollsPerStep) {
            state.bgTickCarry -= 1;
            guard++;
            commitRoll({ silent: true, skipAutosave: true });
        }
        if (guard > 0) refreshOverviewAndAscensionPanelsIfOpen();
    }
    function runGameLoopStep(dtSec) {
        if (!canTick()) return;
        if (!(dtSec > 0)) return;
        state.autoTickCarry += dtSec * getActiveRollsPerSec();
        let guard = 0;
        while (state.autoTickCarry >= 1 && guard < maxRollsPerStep) {
            state.autoTickCarry -= 1;
            guard++;
            commitRoll({ silent: true, skipAutosave: true });
        }
        if (state.autoTickCarry > 0) {
            const now = Date.now();
            if (!state._lastN2AutosaveMs) state._lastN2AutosaveMs = 0;
            if (now - state._lastN2AutosaveMs > 4000) {
                state._lastN2AutosaveMs = now;
                autosaveNow();
            }
        }
        if (guard > 0) {
            updateStageUI();
            refreshOverviewAndAscensionPanelsIfOpen();
        }
    }
    function tokenBadgeHtml(kind, amount) {
        const n = formatCount(Math.max(0, Math.floor(Number(amount) || 0)));
        if (kind === "boom") return "<span class=\"n2-token n2-token--boom\" title=\"Boom tokens\">✦ Boom " + n + "</span>";
        if (kind === "bust") return "<span class=\"n2-token n2-token--bust\" title=\"Bust tokens\">✖ Bust " + n + "</span>";
        return "<span class=\"n2-token\">" + n + "</span>";
    }
    function updateStageUI() {
        const totalEl = document.getElementById("number2-total-display");
        const dieA = document.getElementById("number2-die-a");
        const dieB = document.getElementById("number2-die-b");
        const resEl = document.getElementById("number2-roll-result");
        const statsEl = document.getElementById("number2-inline-stats");
        const hintEl = document.getElementById("number2-bg-hint");
        const listEl = document.getElementById("number2-upgrade-list");
        if (totalEl) totalEl.textContent = formatTotalBig(totalBig());
        if (dieA) {
            dieA.textContent = String(state.lastDieA || 1);
            dieA.setAttribute("data-face", String(state.lastDieA || 1));
        }
        if (dieB) {
            dieB.textContent = String(state.lastDieB || 1);
            dieB.setAttribute("data-face", String(state.lastDieB || 1));
        }
        if (resEl) {
            if (state.lastOutcome === "double") resEl.textContent = "Double";
            else if (state.lastOutcome === "nothing") resEl.textContent = "Nothing";
            else resEl.textContent = "";
        }
        if (statsEl) {
            statsEl.innerHTML = "p(Double) " + (getEffectivePDouble() * 100).toFixed(1) + "% · Luck " + formatCount(state.luck || 0) +
                " · " + tokenBadgeHtml("bust", state.bustTokens || 0) + " / " + tokenBadgeHtml("boom", state.boomTokens || 0) +
                " · Streak D" + (state.streakDouble || 0) + " / N" + (state.streakNothing || 0) +
                " · Life ×2 " + formatCount(state.lifetimeDoubles || 0) + " / Nothing " + formatCount(state.lifetimeNothings || 0);
        }
        if (hintEl) {
            const mode = getCurrentNumberMode();
            hintEl.textContent = mode === 1 && canTick()
                ? "While you play Number 1, Number 2 keeps rolling in the background at a slower rate."
                : "";
        }
        if (listEl) {
            const ups = getUpgrades();
            const now = Date.now();
            const rendered = ups.map(u => {
                const L = getUpgradeLevel(u.id);
                const maxed = L >= u.maxLevel;
                const st = {
                    streakDouble: state.streakDouble,
                    streakNothing: state.streakNothing,
                    lifetimeDoubles: state.lifetimeDoubles,
                    lifetimeNothings: state.lifetimeNothings
                };
                const unlocked = !u.isUnlocked || u.isUnlocked(st);
                const cost = getUpgradeCost(u, L);
                let canBuy = unlocked && !maxed;
                let costText = "";
                if (typeof cost === "number") {
                    if (u.category === "boom") {
                        costText = tokenBadgeHtml("boom", cost);
                        canBuy = canBuy && (state.boomTokens || 0) >= cost;
                    } else if (u.category === "bust") {
                        costText = tokenBadgeHtml("bust", cost);
                        canBuy = canBuy && (state.bustTokens || 0) >= cost;
                    } else {
                        costText = formatCount(cost) + " Luck";
                        canBuy = canBuy && (state.luck || 0) >= cost;
                    }
                } else if (cost && typeof cost === "object") {
                    const boomNeed = Math.max(0, Math.floor(cost.boom || 0));
                    const bustNeed = Math.max(0, Math.floor(cost.bust || 0));
                    costText = tokenBadgeHtml("boom", boomNeed) + " · " + tokenBadgeHtml("bust", bustNeed);
                    canBuy = canBuy && (state.boomTokens || 0) >= boomNeed && (state.bustTokens || 0) >= bustNeed;
                } else {
                    costText = "Free";
                }
                const cls = "number2-upgrade-item" + (maxed ? " number2-upgrade-item--owned" : "") + (!unlocked ? " number2-upgrade-item--locked" : "");
                const hasAction = u.id === "run_the_table" || u.id === "sandbagging" || u.id === "playing_fair" ||
                    u.id === "hot_streak" || u.id === "gamblers_paradox";
                let actionHtml = "";
                if (u.id === "run_the_table") {
                    const cd = Math.max(0, Math.ceil(((state.runTheTableReadyAtMs || 0) - now) / 1000));
                    const active = Math.max(0, Math.ceil(((state.runTheTableUntilMs || 0) - now) / 1000));
                    const enabled = L > 0 && cd <= 0 && active <= 0;
                    actionHtml = "<button type=\"button\" class=\"page-btn number2-action-btn\" data-n2-action=\"run_the_table\"" + (enabled ? "" : " disabled") + ">" +
                        (active > 0 ? "Running (" + active + "s)" : cd > 0 ? "Cooldown (" + cd + "s)" : "Activate") + "</button>";
                } else if (u.id === "sandbagging") {
                    const cd = Math.max(0, Math.ceil(((state.sandbagReadyAtMs || 0) - now) / 1000));
                    const enabled = L > 0 && cd <= 0 && !state.forceNextNothing;
                    const label = state.forceNextNothing ? "Primed" : cd > 0 ? "Cooldown (" + cd + "s)" : "Force Nothing";
                    actionHtml = "<button type=\"button\" class=\"page-btn number2-action-btn\" data-n2-action=\"sandbagging\"" + (enabled ? "" : " disabled") + ">" + label + "</button>";
                } else if (u.id === "playing_fair") {
                    const enabled = L > 0;
                    const on = !!state.playingFairActive;
                    const label = "Playing Fair: " + (on ? "ON" : "OFF");
                    const activeCls = on ? " number2-action-btn--active" : "";
                    actionHtml = "<button type=\"button\" class=\"page-btn number2-action-btn" + activeCls + "\" data-n2-action=\"playing_fair\"" + (enabled ? "" : " disabled") + ">" + label + "</button>";
                } else if (u.id === "hot_streak") {
                    const enabled = L > 0;
                    const on = isUpgradeToggleEnabled("hot_streak");
                    const label = "Hot Streak: " + (on ? "ON" : "OFF");
                    const activeCls = on ? " number2-action-btn--active" : "";
                    actionHtml = "<button type=\"button\" class=\"page-btn number2-action-btn" + activeCls + "\" data-n2-action=\"hot_streak_toggle\"" + (enabled ? "" : " disabled") + ">" + label + "</button>";
                } else if (u.id === "gamblers_paradox") {
                    const enabled = L > 0;
                    const on = isUpgradeToggleEnabled("gamblers_paradox");
                    const label = "Gambler's Paradox: " + (on ? "ON" : "OFF");
                    const activeCls = on ? " number2-action-btn--active" : "";
                    actionHtml = "<button type=\"button\" class=\"page-btn number2-action-btn" + activeCls + "\" data-n2-action=\"gamblers_paradox_toggle\"" + (enabled ? "" : " disabled") + ">" + label + "</button>";
                }
                return "<li class=\"" + cls + "\"><div class=\"number2-upgrade-item__head\"><strong>" + u.name + "</strong>" +
                    (maxed ? " <span class=\"number2-tag\">Max</span>" : "") + "</div>" +
                    "<p class=\"number2-upgrade-item__desc\">" + u.description + "</p>" +
                    "<div class=\"number2-upgrade-item__meta\">Level " + L + "/" + u.maxLevel + " · Cost " + costText + (hasAction ? " · Active utility" : "") + "</div>" +
                    (maxed ? "" : "<button type=\"button\" class=\"page-btn number2-buy-btn\" data-n2-upgrade=\"" + u.id + "\"" + (canBuy ? "" : " disabled") + ">Buy</button>") +
                    actionHtml +
                    "</li>";
            });
            const bustItems = [];
            const hybridItems = [];
            const boomItems = [];
            getUpgrades().forEach((u, idx) => {
                const itemHtml = rendered[idx];
                if (u.category === "bust") bustItems.push(itemHtml);
                else if (u.category === "hybrid") hybridItems.push(itemHtml);
                else boomItems.push(itemHtml);
            });
            function colHtml(title, items, mod) {
                return "<section class=\"number2-upgrade-col number2-upgrade-col--" + mod + "\">" +
                    "<h4 class=\"number2-upgrade-col__title\">" + title + "</h4>" +
                    "<ul class=\"number2-upgrade-col__list\">" + items.join("") + "</ul>" +
                    "</section>";
            }
            listEl.innerHTML =
                "<div class=\"number2-upgrade-columns\">" +
                colHtml("Bust", bustItems, "bust") +
                colHtml("Combined", hybridItems, "hybrid") +
                colHtml("Boom", boomItems, "boom") +
                "</div>";
        }
    }
    function tryBuyUpgrade(id) {
        const u = getUpgradeDef(id);
        if (!u) return;
        const L = getUpgradeLevel(id);
        if (L >= u.maxLevel) return;
        const st = {
            streakDouble: state.streakDouble,
            streakNothing: state.streakNothing,
            lifetimeDoubles: state.lifetimeDoubles,
            lifetimeNothings: state.lifetimeNothings
        };
        if (u.isUnlocked && !u.isUnlocked(st)) return;
        const cost = getUpgradeCost(u, L);
        if (typeof cost === "number") {
            if (u.category === "boom") {
                if ((state.boomTokens || 0) < cost) return;
                state.boomTokens -= cost;
            } else if (u.category === "bust") {
                if ((state.bustTokens || 0) < cost) return;
                state.bustTokens -= cost;
            } else {
                if ((state.luck || 0) < cost) return;
                state.luck -= cost;
            }
        } else if (cost && typeof cost === "object") {
            const boomNeed = Math.max(0, Math.floor(cost.boom || 0));
            const bustNeed = Math.max(0, Math.floor(cost.bust || 0));
            if ((state.boomTokens || 0) < boomNeed) return;
            if ((state.bustTokens || 0) < bustNeed) return;
            state.boomTokens -= boomNeed;
            state.bustTokens -= bustNeed;
        }
        state.upgradeLevels[id] = L + 1;
        addToLog("Number 2 upgrade: " + u.name + " → level " + (L + 1) + ".", "milestone");
        updateStageUI();
        autosaveNow();
        refreshOverviewAndAscensionPanelsIfOpen();
    }
    function tryActivateUpgradeAction(actionId) {
        const now = Date.now();
        if (actionId === "run_the_table") {
            const L = getUpgradeLevel("run_the_table");
            if (L <= 0) return;
            if ((state.runTheTableUntilMs || 0) > now) return;
            if ((state.runTheTableReadyAtMs || 0) > now) return;
            const durationMs = (L === 1 ? 20 : L === 2 ? 24 : 28) * 1000;
            const cooldownMs = (L === 1 ? 120 : L === 2 ? 110 : 95) * 1000;
            state.runTheTableUntilMs = now + durationMs;
            state.runTheTableReadyAtMs = now + cooldownMs;
            addToLog("Run the Table activated for " + Math.round(durationMs / 1000) + "s.", "milestone");
        } else if (actionId === "sandbagging") {
            const L = getUpgradeLevel("sandbagging");
            if (L <= 0) return;
            if ((state.sandbagReadyAtMs || 0) > now) return;
            if (state.forceNextNothing) return;
            const cooldownMs = (L === 1 ? 90 : L === 2 ? 75 : L === 3 ? 62 : 50) * 1000;
            state.forceNextNothing = true;
            state.sandbagReadyAtMs = now + cooldownMs;
            addToLog("Sandbagging primed: next roll is forced Nothing.", "tip");
        } else if (actionId === "playing_fair") {
            if (getUpgradeLevel("playing_fair") <= 0) return;
            setExclusiveToggle("playing_fair", !state.playingFairActive);
            addToLog("Playing Fair " + (state.playingFairActive ? "enabled" : "disabled") + ".", "milestone");
        } else if (actionId === "hot_streak_toggle") {
            if (getUpgradeLevel("hot_streak") <= 0) return;
            setExclusiveToggle("hot_streak", !isUpgradeToggleEnabled("hot_streak"));
            addToLog("Hot Streak " + (state.hotStreakEnabled ? "enabled" : "disabled") + ".", "tip");
        } else if (actionId === "gamblers_paradox_toggle") {
            if (getUpgradeLevel("gamblers_paradox") <= 0) return;
            setExclusiveToggle("gamblers_paradox", !isUpgradeToggleEnabled("gamblers_paradox"));
            addToLog("Gambler's Paradox " + (state.gamblersParadoxEnabled ? "enabled" : "disabled") + ".", "tip");
        } else {
            return;
        }
        updateStageUI();
        autosaveNow();
    }
    function renderAscensionShell() {
        const asc2 = getAscension2Export();
        if (!asc2 || !asc2.NODES) {
            return "<section class=\"asc2-shell\" aria-label=\"Number 2 ascension\"><p class=\"coming-soon-note\">Ascension 2 data not loaded.</p></section>";
        }
        const owned = new Set(state.ascensionNodeIds || []);
        const nodes = asc2.NODES.map(n => {
            const has = owned.has(n.id);
            const parentsOk = !n.parentIds || n.parentIds.length === 0 || n.parentIds.every(pid => owned.has(pid));
            const canBuy = !has && parentsOk && (state.ascensionEssence || 0) >= n.cost;
            const st = has ? "asc2-node--owned" : canBuy ? "asc2-node--buyable" : "asc2-node--locked";
            return "<div class=\"asc2-node " + st + "\" data-asc2-node=\"" + n.id + "\">" +
                "<div class=\"asc2-node__title\">" + n.title + "</div>" +
                "<div class=\"asc2-node__cost\">Cost " + n.cost + " Luck essence</div>" +
                "<div class=\"asc2-node__fx\">" + asc2.describeGrants(n.grants || {}) + "</div>" +
                (has ? "<span class=\"asc2-node__badge\">Owned</span>" : "<button type=\"button\" class=\"page-btn asc2-buy\" data-asc2-buy=\"" + n.id + "\"" + (canBuy ? "" : " disabled") + ">Buy</button>") +
                "</div>";
        }).join("");
        return (
            "<section class=\"asc2-shell\" aria-label=\"Number 2 ascension — Luck table\">" +
            "<header class=\"asc2-shell__header\"><h4 class=\"asc2-shell__title\">Luck table</h4>" +
            "<p class=\"asc2-shell__sub\">Separate from Number 1 — spend <strong>Luck essence</strong> (from milestone doubles) on felt-edge upgrades. Respec for Number 2 only is planned.</p>" +
            "<p class=\"asc2-shell__stat\">Essence: " + formatCount(state.ascensionEssence || 0) +
            " · Ready for ascend gate: " + (totalBig() >= BigInt(NUMBER2_ASCENSION_READY_TOTAL) ? "yes" : "not yet") + "</p></header>" +
            "<div class=\"asc2-node-grid\">" + nodes + "</div></section>"
        );
    }
    function tryBuyAscensionNode(nid) {
        const pagePanelBodyEl = getPagePanelBodyEl();
        const asc2 = getAscension2Export();
        if (!pagePanelBodyEl) return;
        if (!nid || !asc2 || !asc2.NODES) return;
        const node = asc2.NODES.find(n => n.id === nid);
        if (!node) return;
        const owned = new Set(state.ascensionNodeIds || []);
        if (owned.has(nid)) return;
        const parentsOk = !node.parentIds || node.parentIds.length === 0 || node.parentIds.every(pid => owned.has(pid));
        if (!parentsOk) return;
        const cost = node.cost;
        if ((state.ascensionEssence || 0) < cost) {
            addToLog("Number 2 ascension: not enough Luck essence (" + formatCount(cost) + " required).", "warning");
            return;
        }
        state.ascensionEssence -= cost;
        state.ascensionNodeIds.push(nid);
        addToLog("Number 2 ascension: purchased \"" + node.title + "\".", "milestone");
        pagePanelBodyEl.innerHTML = renderAscensionPageHtml();
        autosaveNow();
        refreshGlobalOverviewPanelIfOpen();
    }
    function getMilestone() {
        if (!isUnlocked()) return { text: "Number 2 is not available on this save", pct: 0 };
        if (!state.started) return { text: "Unlocked — switch to Number 2 to begin counting", pct: 0 };
        const tb = totalBig();
        let next = null;
        for (let i = 0; i < NUMBER_2_MILESTONES.length; i++) {
            const g = BigInt(NUMBER_2_MILESTONES[i].goalStr);
            if (tb < g) {
                next = NUMBER_2_MILESTONES[i];
                break;
            }
        }
        if (!next) return { text: "Complete", pct: 100 };
        const nextIndex = NUMBER_2_MILESTONES.indexOf(next);
        const prevGoal = nextIndex > 0 ? BigInt(NUMBER_2_MILESTONES[nextIndex - 1].goalStr) : 2n;
        const goal = BigInt(next.goalStr);
        const span = Number(goal - prevGoal);
        const progressed = Math.min(span, Math.max(0, Number(tb - prevGoal)));
        const pct = span > 0 ? Math.max(0, Math.min(100, (progressed / span) * 100)) : 100;
        return { text: next.text, pct };
    }
    function bindUI() {
        const rollBtn = document.getElementById("number2-roll-btn");
        if (rollBtn) rollBtn.addEventListener("click", () => { commitRoll({}); });
        const stage = document.getElementById("number2-stage");
        if (stage) {
            stage.addEventListener("click", e => {
                const b = e.target.closest("[data-n2-upgrade]");
                if (b && !b.disabled) {
                    e.preventDefault();
                    tryBuyUpgrade(b.getAttribute("data-n2-upgrade"));
                    return;
                }
                const actionBtn = e.target.closest("[data-n2-action]");
                if (actionBtn && !actionBtn.disabled) {
                    e.preventDefault();
                    tryActivateUpgradeAction(actionBtn.getAttribute("data-n2-action"));
                }
            });
        }
        updateStageUI();
    }

    return {
        totalBig,
        setTotalBig,
        formatTotalBig,
        getUpgradeLevel,
        getUpgradeDef,
        getUpgradeCost,
        getPlayingFairTokenMultiplier,
        addTokens,
        hasChanceModByUpgrade,
        isUpgradeToggleEnabled,
        setExclusiveToggle,
        areChanceModsEnabled,
        getAsc2Totals,
        getEffectivePDouble,
        getLuckPerNothing,
        getActiveRollsPerSec,
        canTick,
        reconcileLockState,
        handleModeSwitched,
        reset: () => resetNumber2State(state),
        resolveRoll,
        applyRollOutcome,
        commitRoll,
        tickBackground,
        runGameLoopStep,
        updateStageUI,
        renderAscensionShell,
        tryBuyUpgrade,
        tryActivateUpgradeAction,
        tryBuyAscensionNode,
        getMilestone,
        bindUI
    };
}

export function createNumber2ModuleDefinition(controller, state, deps) {
    const d = deps || {};
    const isUnlocked = d.isUnlocked || function () { return true; };
    const formatCount = d.formatCount || function (n) { return String(n); };
    return {
        getLabel: () => "Number 2 — Double or Nothing",
        getRatePerSec: () => (controller.canTick() ? controller.getActiveRollsPerSec() + NUMBER2_BG_ROLLS_PER_SEC * 0.25 : 0),
        getMilestone: () => controller.getMilestone(),
        isAscensionReady: () => controller.canTick() && controller.totalBig() >= BigInt(NUMBER2_ASCENSION_READY_TOTAL),
        tickBackground: (dtSec) => controller.tickBackground(dtSec),
        getSaveData: () => getNumber2SaveData(state),
        applySaveData: (data) => applyNumber2SaveData(state, data),
        getOverviewDetails: () => {
            if (!isUnlocked()) return "Number 2 is not available.";
            if (!state.started) return "Unlocked but inactive — switch to Number 2 to begin rolling.";
            return "Total " + controller.formatTotalBig(controller.totalBig()) + " · Boom " + formatCount(state.boomTokens || 0) +
                " · Bust " + formatCount(state.bustTokens || 0) + " · Luck " + formatCount(state.luck || 0);
        }
    };
}

export function resetNumber2State(state) {
    if (!state) return;
    state.totalStr = "2";
    state.luck = 0;
    state.boomTokens = 0;
    state.bustTokens = 0;
    state.tokenGainCarry = 0;
    state.streakDouble = 0;
    state.streakNothing = 0;
    state.lifetimeDoubles = 0;
    state.lifetimeNothings = 0;
    state.upgradeLevels = {};
    state.autoTickCarry = 0;
    state.bgTickCarry = 0;
    state.lastDieA = 1;
    state.lastDieB = 1;
    state.lastOutcome = "";
    state.playingFairActive = false;
    state.runTheTableUntilMs = 0;
    state.runTheTableReadyAtMs = 0;
    state.sandbagReadyAtMs = 0;
    state.forceNextNothing = false;
    state.hotStreakEnabled = true;
    state.gamblersParadoxEnabled = true;
    state.totalTwos = 0;
    state.tickCarry = 0;
}

export function getNumber2SaveData(state) {
    return {
        number2SaveVersion: 4,
        totalStr: state.totalStr,
        luck: state.luck,
        boomTokens: state.boomTokens,
        bustTokens: state.bustTokens,
        tokenGainCarry: state.tokenGainCarry,
        streakDouble: state.streakDouble,
        streakNothing: state.streakNothing,
        lifetimeDoubles: state.lifetimeDoubles,
        lifetimeNothings: state.lifetimeNothings,
        upgradeLevels: { ...state.upgradeLevels },
        started: !!state.started,
        ascensionEssence: state.ascensionEssence,
        ascensionNodeIds: [...(state.ascensionNodeIds || [])],
        autoTickCarry: state.autoTickCarry,
        bgTickCarry: state.bgTickCarry,
        lastDieA: state.lastDieA,
        lastDieB: state.lastDieB,
        lastOutcome: state.lastOutcome,
        playingFairActive: !!state.playingFairActive,
        runTheTableUntilMs: state.runTheTableUntilMs || 0,
        runTheTableReadyAtMs: state.runTheTableReadyAtMs || 0,
        sandbagReadyAtMs: state.sandbagReadyAtMs || 0,
        forceNextNothing: !!state.forceNextNothing,
        hotStreakEnabled: state.hotStreakEnabled !== false,
        gamblersParadoxEnabled: state.gamblersParadoxEnabled !== false
    };
}

export function applyNumber2SaveData(state, data) {
    if (!state || !data || typeof data !== "object") return;
    const ver = Number(data.number2SaveVersion);
    if (ver >= 2 && typeof data.totalStr === "string" && /^[0-9]+$/.test(data.totalStr)) {
        state.totalStr = data.totalStr;
    } else if (Number.isFinite(data.totalTwos) && data.totalTwos >= 0) {
        state.totalStr = "2";
        state.totalTwos = Math.floor(data.totalTwos);
    } else {
        state.totalStr = "2";
    }
    if (Number.isFinite(data.luck) && data.luck >= 0) state.luck = Math.floor(data.luck);
    if (Number.isFinite(data.boomTokens) && data.boomTokens >= 0) state.boomTokens = Math.floor(data.boomTokens);
    if (Number.isFinite(data.bustTokens) && data.bustTokens >= 0) state.bustTokens = Math.floor(data.bustTokens);
    if (Number.isFinite(data.tokenGainCarry) && data.tokenGainCarry >= 0) state.tokenGainCarry = data.tokenGainCarry;
    if (Number.isFinite(data.streakDouble) && data.streakDouble >= 0) state.streakDouble = Math.floor(data.streakDouble);
    if (Number.isFinite(data.streakNothing) && data.streakNothing >= 0) state.streakNothing = Math.floor(data.streakNothing);
    if (Number.isFinite(data.lifetimeDoubles) && data.lifetimeDoubles >= 0) state.lifetimeDoubles = Math.floor(data.lifetimeDoubles);
    if (Number.isFinite(data.lifetimeNothings) && data.lifetimeNothings >= 0) state.lifetimeNothings = Math.floor(data.lifetimeNothings);
    if (data.upgradeLevels && typeof data.upgradeLevels === "object") state.upgradeLevels = { ...data.upgradeLevels };
    state.started = !!data.started;
    if (Number.isFinite(data.ascensionEssence) && data.ascensionEssence >= 0) {
        state.ascensionEssence = Math.min(Number.MAX_SAFE_INTEGER, Math.floor(data.ascensionEssence));
    }
    if (Array.isArray(data.ascensionNodeIds)) {
        state.ascensionNodeIds = data.ascensionNodeIds.filter(id => typeof id === "string");
    }
    if (Number.isFinite(data.autoTickCarry) && data.autoTickCarry >= 0) state.autoTickCarry = data.autoTickCarry;
    if (Number.isFinite(data.bgTickCarry) && data.bgTickCarry >= 0) state.bgTickCarry = data.bgTickCarry;
    if (Number.isFinite(data.lastDieA)) state.lastDieA = Math.min(6, Math.max(1, Math.floor(data.lastDieA)));
    if (Number.isFinite(data.lastDieB)) state.lastDieB = Math.min(6, Math.max(1, Math.floor(data.lastDieB)));
    if (data.lastOutcome === "double" || data.lastOutcome === "nothing") state.lastOutcome = data.lastOutcome;
    if (typeof data.playingFairActive === "boolean") state.playingFairActive = data.playingFairActive;
    if (Number.isFinite(data.runTheTableUntilMs) && data.runTheTableUntilMs >= 0) state.runTheTableUntilMs = data.runTheTableUntilMs;
    if (Number.isFinite(data.runTheTableReadyAtMs) && data.runTheTableReadyAtMs >= 0) state.runTheTableReadyAtMs = data.runTheTableReadyAtMs;
    if (Number.isFinite(data.sandbagReadyAtMs) && data.sandbagReadyAtMs >= 0) state.sandbagReadyAtMs = data.sandbagReadyAtMs;
    if (typeof data.forceNextNothing === "boolean") state.forceNextNothing = data.forceNextNothing;
    if (typeof data.hotStreakEnabled === "boolean") state.hotStreakEnabled = data.hotStreakEnabled;
    if (typeof data.gamblersParadoxEnabled === "boolean") state.gamblersParadoxEnabled = data.gamblersParadoxEnabled;
    state.number2SaveVersion = 4;
    try {
        let t = BigInt(state.totalStr || "0");
        if (t < 0n) t = 0n;
        state.totalStr = t.toString();
    } catch (_) {
        state.totalStr = "0";
    }
}
