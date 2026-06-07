import { ASCENSION_1_REQUIRED_TOTAL } from "./n1-ascension.js";
import { HandCounter } from "./n1-hand-counter.js";
import { HAND_BASE_SPEED } from "./n1-hands.js";
import { createNumber1BlackHoleDevPhasePreset } from "./number1-black-hole.js";

const DEV_SESSION_N1_STAGE_BG_STATIC = "numbersarefun_dev_n1_stage_bg_static";

/** @param {object | null | undefined} raw */
function expandLegacyBootDevToolsDeps(raw) {
    const g = raw && raw.n1Gameplay;
    if (!g) return raw;
    return {
        devToolsLoadTimeMs: raw.devToolsLoadTimeMs,
        els: raw.els,
        ...g
    };
}

/** Dev-tools panel listeners and cheats. Boot passes accessors + side-effect closures only (or `{ n1Gameplay }` façade from legacy-boot). */
export function attachN1DevTools(depsRaw) {
    const deps = expandLegacyBootDevToolsDeps(depsRaw);
    const els = deps.els;
    let devSecondsIntervalId = null;

    function applyDevN1StageBackgroundMotionStatic(off) {
        const rootEl = typeof document !== "undefined" ? document.documentElement : null;
        if (!rootEl) return;
        if (off) rootEl.setAttribute("data-dev-n1-stage-bg-motion", "off");
        else rootEl.removeAttribute("data-dev-n1-stage-bg-motion");
    }

    function syncDevN1StageBackgroundMotionFromSession() {
        let off = false;
        try {
            off =
                typeof sessionStorage !== "undefined" &&
                sessionStorage.getItem(DEV_SESSION_N1_STAGE_BG_STATIC) === "1";
        } catch (_) {
            off = false;
        }
        applyDevN1StageBackgroundMotionStatic(off);
        const cb = els.devN1StageBgStaticCheckbox;
        if (cb) cb.checked = off;
    }

    function updateDevToolsTimeLabels() {
        if (els.devSecondsElapsed) {
            let elapsedMs;
            try {
                const perf = typeof globalThis.performance !== "undefined" ? globalThis.performance : undefined;
                elapsedMs =
                    perf && typeof perf.now === "function"
                        ? perf.now()
                        : Date.now() - deps.devToolsLoadTimeMs;
            } catch (_) {
                elapsedMs = Date.now() - deps.devToolsLoadTimeMs;
            }
            if (!Number.isFinite(elapsedMs) || elapsedMs < 0) elapsedMs = 0;
            els.devSecondsElapsed.textContent = String(Math.round(elapsedMs / 1000));
        }
        if (els.devSaveTotalSecondsEl) {
            const displayMs = deps.displayTotalPlaySeconds();
            els.devSaveTotalSecondsEl.textContent = String(Math.round(displayMs / 1000));
        }
    }

    function updateDevBlackHolePhaseSelect() {
        const sel = els.blackHolePhaseSelect;
        if (sel) sel.value = String(deps.getBlackHolePhase());
    }

    function devEnsureBlackHoleUnlockedForPhase(phase) {
        if (phase <= 0) return;
        deps.ascending.setHasAscended(true);
        const mapNodes = deps.getAscensionMapNodes();
        if (Array.isArray(mapNodes) && mapNodes.length > 0) {
            deps.ascending.setAscensionNodeIds(mapNodes.map(n => n.id));
        }
        deps.ascending.clampEssenceForDevUnlock();
    }

    function devSetUnlockedHandsCount(count) {
        const dm = deps.getDevHandsRuntime();
        const target = Math.max(1, Math.min(dm.maxHands, Math.floor(Number(count) || 1)));
        dm.setUnlockedCapAndHands(target);
        for (let i = 0; i < dm.maxHands; i++) {
            const e = dm.getHandEarning(i);
            if (i < target && !(e > 0)) dm.setHandEarning(i, 1);
            if (i >= target) dm.clearHandSideForDev(i);
        }
        deps.shrinkSpeedRowsTo(target);
        deps.ensureSpeedRows();
        while (dm.hands.length > target) {
            const h = dm.hands.pop();
            if (h && h.el && h.el.parentNode) h.el.parentNode.removeChild(h.el);
        }
        while (dm.hands.length < target) {
            const handNum = dm.hands.length + 1;
            const slot = dm.speedRowRefs[handNum - 1]?.handMountEl;
            dm.hands.push(new HandCounter(handNum, HAND_BASE_SPEED, slot));
        }
    }

    function panelEl() {
        return els.devToolsPanel || null;
    }

    function isDevToolsPanelHidden() {
        const p = els.devToolsPanel;
        if (!p) return true;
        if (p.style.display === "none") return true;
        try {
            if (typeof window === "undefined" || !window.getComputedStyle) return false;
            return window.getComputedStyle(p).display === "none";
        } catch (_) {
            return true;
        }
    }

    function devApplyBlackHolePhase() {
        const bhSel = els.blackHolePhaseSelect;
        if (!bhSel) return;
        const phase = Math.max(0, Math.min(7, parseInt(bhSel.value, 10) || 0));

        devEnsureBlackHoleUnlockedForPhase(phase);

        const st = deps.ascending.getBlackHoleMutableState();
        Object.assign(st, createNumber1BlackHoleDevPhasePreset(phase, { currentState: st, nowMs: Date.now() }));

        if (phase === 0) {
            deps.ascending.setHasAscended(false);
            deps.ascending.setAscensionNodeIds([]);
            st.phase = 0;
            st.phase1EssenceSpent = 0;
        }

        devSetUnlockedHandsCount(phase >= 6 ? 1 : 10);
        const dm = deps.getDevHandsRuntime();

        if (phase === 0) {
            dm.setHandEarning(0, Math.max(dm.getHandEarning(0), 1e36));
        }
        if (phase === 6) {
            dm.setHandEarning(0, Math.max(dm.getHandEarning(0), ASCENSION_1_REQUIRED_TOTAL));
        }
        if (phase === 7) {
            deps.setTotalChanges(0);
            dm.setHandEarning(0, 0);
        }

        if (phase > 0 && phase < 7) deps.maybeApplyMidPhaseHandFloor();

        deps.refreshAfterBhDevJumpAndSelectUpdated();
        updateDevBlackHolePhaseSelect();
        deps.addToLog("Dev: jumped to Black Hole Phase " + phase + ".", "warning");
        deps.autosaveNow();
    }

    if (els.devToolsToggle && els.devToolsPanel) {
        els.devToolsToggle.addEventListener("click", () => {
            const panel = els.devToolsPanel;
            const show = isDevToolsPanelHidden();
            if (panel) panel.style.display = show ? "block" : "none";
            if (show) {
                updateDevToolsTimeLabels();
                updateDevBlackHolePhaseSelect();
                if (els.devPauseGameCheckbox) els.devPauseGameCheckbox.checked = deps.freeze.get();
                if (els.devTurboComboMeterOffCheckbox) {
                    els.devTurboComboMeterOffCheckbox.checked =
                        typeof deps.turboComboMeterGainDisabledFlag?.get === "function" &&
                        deps.turboComboMeterGainDisabledFlag.get();
                }
                syncDevN1StageBackgroundMotionFromSession();
                if (!devSecondsIntervalId) devSecondsIntervalId = setInterval(updateDevToolsTimeLabels, 1000);
            } else if (devSecondsIntervalId) {
                clearInterval(devSecondsIntervalId);
                devSecondsIntervalId = null;
            }
        });
    }

    if (els.devBlackHolePhaseApplyBtn) {
        els.devBlackHolePhaseApplyBtn.addEventListener("click", devApplyBlackHolePhase);
    }

    if (els.devPauseGameCheckbox) {
        els.devPauseGameCheckbox.addEventListener("change", () => {
            deps.freeze.set(!!els.devPauseGameCheckbox.checked);
        });
    }

    if (els.devTurboComboMeterOffCheckbox && deps.turboComboMeterGainDisabledFlag) {
        els.devTurboComboMeterOffCheckbox.addEventListener("change", () => {
            deps.turboComboMeterGainDisabledFlag.set(!!els.devTurboComboMeterOffCheckbox.checked);
            if (typeof deps.addToLog === "function") {
                deps.addToLog(
                    els.devTurboComboMeterOffCheckbox.checked
                        ? "Dev: Turbo combo meter gain disabled (passive fill only)."
                        : "Dev: Turbo combo meter gain re-enabled.",
                    "warning"
                );
            }
        });
    }

    if (els.devN1StageBgStaticCheckbox) {
        els.devN1StageBgStaticCheckbox.addEventListener("change", () => {
            const off = !!els.devN1StageBgStaticCheckbox.checked;
            try {
                sessionStorage.setItem(DEV_SESSION_N1_STAGE_BG_STATIC, off ? "1" : "0");
            } catch (_) {}
            applyDevN1StageBackgroundMotionStatic(off);
        });
    }

    syncDevN1StageBackgroundMotionFromSession();

    function applyDevAllAutobuyers(on) {
        if (on) deps.setAutoBuyUnlockedDev(true);
        deps.ensureSpeedRows();
        const unlocked = deps.unlockedHandsGetter();
        const autoEn = deps.autoBuyEnabledByHandMutable;
        for (let i = 0; i < unlocked; i++) {
            if (typeof deps.setAutoBuyEnabledForHand === "function") {
                deps.setAutoBuyEnabledForHand(i, on);
            } else {
                autoEn[i] = on;
            }
        }
        if (typeof deps.syncAllAutobuyTogglesFromState === "function") deps.syncAllAutobuyTogglesFromState();
        deps.updateSpeedUpgradeUI();
    }

    if (els.devAllAutobuyCheckbox) {
        els.devAllAutobuyCheckbox.addEventListener("change", () => {
            applyDevAllAutobuyers(!!els.devAllAutobuyCheckbox.checked);
        });
        els.devAllAutobuyCheckbox.addEventListener("click", () => {
            queueMicrotask(function () {
                if (els.devAllAutobuyCheckbox && els.devAllAutobuyCheckbox.checked) applyDevAllAutobuyers(true);
            });
        });
    }

    if (els.devAutobuyDelay01Checkbox) {
        els.devAutobuyDelay01Checkbox.addEventListener("change", () => {
            const useFast = els.devAutobuyDelay01Checkbox.checked;
            deps.autoBuyDelayOverrideSeconds.set(useFast ? 0.1 : null);
            const delay = useFast ? 0.1 : deps.autoBuyDelayStandardSeconds();
            const autoCd = deps.autoBuyCountdownSecondsByHandMutable;
            const uh = deps.unlockedHandsGetter();
            for (let i = 0; i < uh; i++) {
                if (deps.autoBuyEnabledByHandMutable[i] && (autoCd[i] || 0) > 0) {
                    autoCd[i] = delay;
                }
            }
        });
    }

    if (els.devAutobuyCheapenCheckbox) {
        els.devAutobuyCheapenCheckbox.addEventListener("change", () => {
            deps.cheapenAutobuyFlag.set(els.devAutobuyCheapenCheckbox.checked);
            if (deps.cheapenAutobuyFlag.get()) deps.flushCheapenAutobuySeedsDev();
        });
    }

    if (els.devAutobuySlowdownCheckbox) {
        els.devAutobuySlowdownCheckbox.addEventListener("change", () => {
            deps.slowdownAutobuyFlag.set(els.devAutobuySlowdownCheckbox.checked);
            if (deps.slowdownAutobuyFlag.get()) deps.flushSlowdownAutobuySeedsDev();
        });
    }

    if (els.devDeleteSaveBtn) {
        els.devDeleteSaveBtn.addEventListener("click", () => {
            const pn = panelEl();
            if (pn) pn.style.display = "none";
            deps.onDeleteSaveClick();
        });
    }

    if (els.devAddCountBtn && els.devAddCountInput) {
        els.devAddCountBtn.addEventListener("click", () => {
            const val = parseInt(els.devAddCountInput.value, 10) || 0;
            deps.bumpHand0EarningsDev(val);
        });
    }

    if (els.devAddAscensionEssenceBtn && els.devAddAscensionEssenceInput) {
        els.devAddAscensionEssenceBtn.addEventListener("click", () => {
            const val = parseInt(els.devAddAscensionEssenceInput.value, 10) || 0;
            deps.addAscensionEssenceDev(val);
        });
    }
}
