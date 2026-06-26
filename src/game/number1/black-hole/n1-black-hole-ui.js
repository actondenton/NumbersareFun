import {
    BLACK_HOLE_FURNACE_COMPLETION_RITUAL_MS,
    BLACK_HOLE_FURNACE_HOTTER_CORE_BONUS,
    BLACK_HOLE_FURNACE_MULT_PER_POWER,
    BLACK_HOLE_PHASE1_ESSENCE_TARGET,
    BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER,
    BLACK_HOLE_PHASE2_MASS_CAP
} from "./number1-black-hole.js";
import { syncPhase1TesseractCanvasesInRoot } from "../../phase1-tesseract-canvas.js";
import { createBlackHolePreviewUi } from "./n1-black-hole-preview-ui.js";
import { getPhase2CollapseEffectHtml } from "./n1-black-hole-upgrade-preview.js";

/**
 * Stage VFX, lensing, thermal theme, BH panel patching.
 *
 * @param {object} deps
 * @param {object} deps.controller — Number 1 black-hole controller (`createNumber1BlackHoleController`).
 * @param {() => object} deps.getBlackHoleState
 * @param {() => HTMLElement | null} deps.getStageRoot
 * @param {() => HTMLElement | null} deps.getPlayStage
 * @param {() => HTMLElement | null} deps.getIncrementalCountLabel
 * @param {() => void} deps.syncPhase1MassFillCssVars
 * @param {() => void} deps.refreshGlobalOverviewPanelIfOpen
 * @param {() => HTMLElement | null} deps.getPagePanelEl
 * @param {() => HTMLElement | null} deps.getPagePanelBodyEl
 * @param {() => number} deps.getAscensionPageActiveNumber
 * @param {() => void} deps.refreshAscensionPanelIfOpen
 * @param {() => void} deps.patchAscensionHubStatsPillsDomIfChanged
 * @param {() => string} deps.renderNumber1BlackHolePanelHtml
 * @param {() => boolean} deps.isBlackHoleArcUnlocked
 * @param {(n: number | string) => string} deps.formatCount
 * @param {() => void} deps.autosaveNow
 * @param {() => number} deps.getAscensionEssence
 * @param {() => number} deps.getMaxSlowdownLevelCap
 * @param {() => number} deps.getSlowdownCapBase
 * @param {() => boolean} deps.isNumber1AscensionReady
 * @param {() => { finalGain: number }} deps.getAscensionGainBreakdown
 * @param {() => number} deps.getBlackHolePhase
 * @param {(m: number) => string} deps.formatBlackHolePhase1CpsMultForUi
 * @param {() => number} [deps.getJetMult]
 * @param {(s: string) => string} [deps.escapeHtml]
 * @param {(n: number) => string} [deps.formatSeconds]
 * @param {(budget: number) => object | null} [deps.getStokePreviewStats]
 * @param {() => object} [deps.getBlackHoleUxFlags]
 * @param {() => number} [deps.getUnlockedHands]
 * @param {() => number} [deps.getPhase5StokeMinRemainingMs]
 */
export function createNumber1BlackHoleUi(deps) {
    const ctrl = deps.controller;
    const previewUi = createBlackHolePreviewUi({
        getAscensionEssence: deps.getAscensionEssence,
        isNumber1AscensionReady: deps.isNumber1AscensionReady,
        getAscensionGainBreakdown: deps.getAscensionGainBreakdown,
        getBlackHolePhase: deps.getBlackHolePhase,
        getBlackHoleState: deps.getBlackHoleState,
        getSlowdownCapBase: deps.getSlowdownCapBase,
        formatBlackHolePhase1CpsMultForUi: deps.formatBlackHolePhase1CpsMultForUi,
        getJetMult: deps.getJetMult || (() => 1),
        escapeHtml: deps.escapeHtml || (s => String(s)),
        formatCount: deps.formatCount,
        getStokePreviewStats: deps.getStokePreviewStats
    });

    let blackHoleUiRefreshQueued = false;
    let blackHolePhase1CollapsePulseQueued = false;
    let blackHolePhase1SurgeTimerId = 0;
    let blackHoleLensingManualBurstTimerId = 0;
    let blackHoleLensingAutoTickTimerId = 0;
    let blackHoleStageVfxClassDigest = "";
    let blackHoleStageVfxHeavyLastMs = 0;
    let blackHoleStageVfxLastPhaseForLabel = null;
    let blackHoleStageVfxHtmlAttrDone = false;
    const BLACK_HOLE_STAGE_VFX_HEAVY_INTERVAL_MS = 100;
    const PHASE5_STAGE_VFX_INTERVAL_MS = 250;
    let blackHoleStageVfxPhase5LastMs = 0;

    function queueBlackHoleUiRefresh() {
        if (blackHoleUiRefreshQueued) return;
        blackHoleUiRefreshQueued = true;
        requestAnimationFrame(function () {
            blackHoleUiRefreshQueued = false;
            deps.syncPhase1MassFillCssVars();
            deps.refreshGlobalOverviewPanelIfOpen();
            refreshBlackHolePanelLiveDomIfOpen();
            if (typeof deps.syncBhCollapseTurboTierAccents === "function") deps.syncBhCollapseTurboTierAccents();
        });
    }

    function syncBlackHolePhase4LensingRipples() {
        const number1StageRootEl = deps.getStageRoot();
        if (!number1StageRootEl) return;
        const arc = deps.isBlackHoleArcUnlocked();
        const p = ctrl.getBlackHolePhase();
        const lensOn = arc && p === 4;
        number1StageRootEl.classList.toggle("bh-phase4-lensing-cadence", lensOn);
        if (!lensOn) {
            number1StageRootEl.style.removeProperty("--bh-lens-period");
            number1StageRootEl.style.removeProperty("--bh-lens-ripple-delay");
            ctrl.resetPhase4LensingRippleThrottle();
            if (blackHoleLensingManualBurstTimerId) {
                clearTimeout(blackHoleLensingManualBurstTimerId);
                blackHoleLensingManualBurstTimerId = 0;
            }
            if (blackHoleLensingAutoTickTimerId) {
                clearTimeout(blackHoleLensingAutoTickTimerId);
                blackHoleLensingAutoTickTimerId = 0;
            }
            number1StageRootEl.classList.remove("bh-phase4-lensing-manual-burst", "bh-phase4-lensing-auto-tick");
        }
    }

    function pulseBlackHoleLensingManualBurst() {
        const number1StageRootEl = deps.getStageRoot();
        if (!number1StageRootEl) return;
        if (blackHoleLensingManualBurstTimerId) {
            clearTimeout(blackHoleLensingManualBurstTimerId);
            blackHoleLensingManualBurstTimerId = 0;
        }
        number1StageRootEl.classList.remove("bh-phase4-lensing-manual-burst");
        void number1StageRootEl.offsetWidth;
        number1StageRootEl.classList.add("bh-phase4-lensing-manual-burst");
        blackHoleLensingManualBurstTimerId = setTimeout(function () {
            blackHoleLensingManualBurstTimerId = 0;
            const el = deps.getStageRoot();
            if (el) el.classList.remove("bh-phase4-lensing-manual-burst");
        }, 720);
    }

    function pulseBlackHoleLensingAutoTick() {
        const number1StageRootEl = deps.getStageRoot();
        if (!number1StageRootEl) return;
        if (blackHoleLensingAutoTickTimerId) clearTimeout(blackHoleLensingAutoTickTimerId);
        number1StageRootEl.classList.remove("bh-phase4-lensing-auto-tick");
        void number1StageRootEl.offsetWidth;
        number1StageRootEl.classList.add("bh-phase4-lensing-auto-tick");
        blackHoleLensingAutoTickTimerId = setTimeout(function () {
            blackHoleLensingAutoTickTimerId = 0;
            const el = deps.getStageRoot();
            if (el) el.classList.remove("bh-phase4-lensing-auto-tick");
        }, 480);
    }

    const PHASE5_THERMAL_PROP_KEYS = ["--bh-phase5-prime", "--bh-phase5-cool", "--bh-phase5-furnace", "--bh-phase5-wash-mid"];
    let phase5ThermalLastPaletteKey = "";
    function phase5ThermalClearCustomProps(el) {
        if (!el || !el.style) return;
        PHASE5_THERMAL_PROP_KEYS.forEach(function (k) {
            el.style.removeProperty(k);
        });
    }
    function clamp01(v) {
        return Math.max(0, Math.min(1, Number(v)));
    }
    function lerpRgb(c0, c1, t0) {
        const t = clamp01(t0);
        return [
            Math.round(Math.max(0, Math.min(255, c0[0] + (c1[0] - c0[0]) * t))),
            Math.round(Math.max(0, Math.min(255, c0[1] + (c1[1] - c0[1]) * t))),
            Math.round(Math.max(0, Math.min(255, c0[2] + (c1[2] - c0[2]) * t)))
        ];
    }
    /** r,g,b for rgba(..., alpha) shorthand */
    function rgbTripleVar(rgb) {
        return rgb[0] + "," + rgb[1] + "," + rgb[2];
    }
    /**
     * 9 digest acts in three bands: hands 1–3 magnetic→red, 4–6 deep red hot, 7–9 white-hot.
     * heatUnified is 0..1 (fractional digest progress included).
     */
    function getBlackHolePhase5DigestThermalPalette(heatUnified) {
        const hueRaw = clamp01(heatUnified) * 9;
        const capped = Math.min(9, hueRaw);
        const segIdx = Math.min(2, Math.floor(capped / 3));
        let u = (capped - segIdx * 3) / 3;
        u = clamp01(u);
        u *= u * (3 - 2 * u);
        const magPrime = [185, 118, 246];
        const tealCool = [92, 210, 255];
        const redPrime = [236, 64, 108];
        const coralCool = [255, 110, 86];
        const deepPrime = [255, 32, 24];
        const coalsCool = [255, 66, 44];
        const whitePrime = [255, 253, 248];
        const ivoryCool = [255, 244, 220];
        const furnaceA = [255, 92, 112];
        const furnaceB = [255, 54, 48];
        const furnaceC = [255, 22, 16];
        const furnaceD = [255, 248, 232];
        const washA = [56, 18, 98];
        const washB = [98, 24, 86];
        const washC = [154, 20, 32];
        const washD = [112, 86, 98];
        let primeRgb;
        let coolRgb;
        let furnaceRgb;
        let washRgb;
        if (segIdx === 0) {
            primeRgb = lerpRgb(magPrime, redPrime, u);
            coolRgb = lerpRgb(tealCool, coralCool, u);
            furnaceRgb = lerpRgb(furnaceA, furnaceB, u);
            washRgb = lerpRgb(washA, washB, u);
        } else if (segIdx === 1) {
            primeRgb = lerpRgb(redPrime, deepPrime, u);
            coolRgb = lerpRgb(coralCool, coalsCool, u);
            furnaceRgb = lerpRgb(furnaceB, furnaceC, u);
            washRgb = lerpRgb(washB, washC, u);
        } else {
            primeRgb = lerpRgb(deepPrime, whitePrime, u);
            coolRgb = lerpRgb(coalsCool, ivoryCool, u);
            furnaceRgb = lerpRgb(furnaceC, furnaceD, u);
            washRgb = lerpRgb(washC, washD, u);
        }
        return {
            prime: rgbTripleVar(primeRgb),
            cool: rgbTripleVar(coolRgb),
            furnace: rgbTripleVar(furnaceRgb),
            washMid: rgbTripleVar(washRgb)
        };
    }
    function computePhase5DigestHeatUnified(nowMs) {
        const number1BlackHoleState = deps.getBlackHoleState();
        let digested = Math.max(0, Math.floor(Number(number1BlackHoleState.phase5DigestedHands) || 0));
        digested = Math.min(9, digested);
        if (digested >= 9) return 9;
        const end = Number(number1BlackHoleState.phase5DigestEndsAtMs) || 0;
        const start = Number(number1BlackHoleState.phase5DigestStartedAtMs) || 0;
        const handNum = Math.floor(Number(number1BlackHoleState.phase5DigestHandNumber) || 0);
        let frac = 0;
        if (end > nowMs && handNum > 0 && end > start) {
            frac = (nowMs - start) / (end - start);
            frac = clamp01(frac);
            frac *= frac * (3 - 2 * frac);
        }
        return Math.min(9, digested + frac);
    }
    /** Play stage colour ramp (per digest + slow in-digest ease); drives --bh-phase5-* on stage + inner root */
    function syncBlackHolePhase5ThermalTheme(nowMs) {
        const els = [deps.getStageRoot(), deps.getPlayStage()].filter(Boolean);
        const arc = deps.isBlackHoleArcUnlocked();
        const p = ctrl.getBlackHolePhase();
        if (!(arc && p === 5)) {
            els.forEach(phase5ThermalClearCustomProps);
            phase5ThermalLastPaletteKey = "";
            return;
        }
        const heatUnified = clamp01(computePhase5DigestHeatUnified(nowMs) / 9);
        const paletteKey = heatUnified.toFixed(3);
        if (paletteKey === phase5ThermalLastPaletteKey) return;
        phase5ThermalLastPaletteKey = paletteKey;
        const pal = getBlackHolePhase5DigestThermalPalette(heatUnified);
        els.forEach(function (el) {
            el.style.setProperty("--bh-phase5-prime", pal.prime);
            el.style.setProperty("--bh-phase5-cool", pal.cool);
            el.style.setProperty("--bh-phase5-furnace", pal.furnace);
            el.style.setProperty("--bh-phase5-wash-mid", pal.washMid);
        });
    }

    function syncBlackHolePhase1Vfx() {
        const number1StageRootEl = deps.getStageRoot();
        const number1BlackHoleState = deps.getBlackHoleState();
        if (!number1StageRootEl) {
            if (!blackHoleStageVfxHtmlAttrDone) {
                document.documentElement.setAttribute("data-n1-bh-vfx-synced", "");
                blackHoleStageVfxHtmlAttrDone = true;
            }
            return;
        }
        const arc = deps.isBlackHoleArcUnlocked();
        const p = ctrl.getBlackHolePhase();
        const now = Date.now();

        const incrementalCountLabelEl = deps.getIncrementalCountLabel();
        if (incrementalCountLabelEl && blackHoleStageVfxLastPhaseForLabel !== p) {
            blackHoleStageVfxLastPhaseForLabel = p;
            incrementalCountLabelEl.textContent = p === 7 ? "Epilogue Count" : "Total Count";
        }

        if (arc && p === 5) {
            const phase5SingularityMood = true;
            const phase5HawkingActive = now <= (number1BlackHoleState.phase3HawkingActiveUntilMs || 0);
            const phase5WaveActive = now <= (number1BlackHoleState.phase4WaveActiveUntilMs || 0);
            const phase5Digest =
                "1|5|0|0|1|" + (phase5HawkingActive ? 1 : 0) + "|" + (phase5WaveActive ? 1 : 0) + "|0";
            const phase5DigestChanged = phase5Digest !== blackHoleStageVfxClassDigest;
            if (phase5DigestChanged) {
                blackHoleStageVfxClassDigest = phase5Digest;
                number1StageRootEl.classList.toggle("bh-singularity-vfx", phase5SingularityMood);
                number1StageRootEl.classList.toggle("bh-singularity-deep", phase5SingularityMood);
                number1StageRootEl.classList.toggle("bh-phase3-hawking-active", phase5HawkingActive);
                number1StageRootEl.classList.toggle("bh-phase4-wave-active", phase5WaveActive);
                number1StageRootEl.classList.add("bh-phase5-magnetic-furnace");
                number1StageRootEl.classList.remove(
                    "bh-phase1-vfx",
                    "bh-phase2-collapse-vfx",
                    "bh-phase3-accretion-disk",
                    "bh-phase6-jet-beam",
                    "bh-phase6-jet-active",
                    "bh-phase7-stillness"
                );
                syncBlackHolePhase4LensingRipples();
            }
            if (phase5DigestChanged || now - blackHoleStageVfxPhase5LastMs >= PHASE5_STAGE_VFX_INTERVAL_MS) {
                blackHoleStageVfxPhase5LastMs = now;
                syncBlackHolePhase5ThermalTheme(now);
            }
            if (!blackHoleStageVfxHtmlAttrDone) {
                document.documentElement.setAttribute("data-n1-bh-vfx-synced", "");
                blackHoleStageVfxHtmlAttrDone = true;
            }
            return;
        }

        const massMood = arc && p === 1;
        const collapseMood = arc && p === 2;
        const singularityMood = arc && p >= 2 && p <= 6;
        const hawkingActive = arc && p >= 3 && p < 6 && now <= (number1BlackHoleState.phase3HawkingActiveUntilMs || 0);
        const waveActive = arc && p >= 4 && p < 6 && now <= (number1BlackHoleState.phase4WaveActiveUntilMs || 0);
        const jetActive = arc && p === 6 && !!number1BlackHoleState.phase6JetActive;
        const digestParts = [arc ? 1 : 0, p, massMood ? 1 : 0, collapseMood ? 1 : 0, singularityMood ? 1 : 0, hawkingActive ? 1 : 0, waveActive ? 1 : 0, jetActive ? 1 : 0];
        const digest = digestParts.join("|");
        const digestChanged = digest !== blackHoleStageVfxClassDigest;
        if (digestChanged) blackHoleStageVfxClassDigest = digest;
        const heavyDue = digestChanged || now - blackHoleStageVfxHeavyLastMs >= BLACK_HOLE_STAGE_VFX_HEAVY_INTERVAL_MS;
        if (heavyDue) blackHoleStageVfxHeavyLastMs = now;

        if (digestChanged) {
            if (!massMood) {
                if (blackHolePhase1SurgeTimerId) {
                    clearTimeout(blackHolePhase1SurgeTimerId);
                    blackHolePhase1SurgeTimerId = 0;
                }
                number1StageRootEl.classList.remove("bh-phase1-unlock-surge");
            }
            number1StageRootEl.classList.toggle("bh-phase1-vfx", massMood);
            number1StageRootEl.classList.toggle("bh-phase2-collapse-vfx", collapseMood);
            number1StageRootEl.classList.toggle("bh-singularity-vfx", singularityMood);
            number1StageRootEl.classList.toggle("bh-singularity-deep", singularityMood);
            number1StageRootEl.classList.toggle("bh-phase3-accretion-disk", arc && p === 3);
            number1StageRootEl.classList.toggle("bh-phase3-hawking-active", hawkingActive);
            number1StageRootEl.classList.toggle("bh-phase4-wave-active", waveActive);
            number1StageRootEl.classList.toggle("bh-phase5-magnetic-furnace", false);
            number1StageRootEl.classList.toggle("bh-phase6-jet-beam", arc && p === 6);
            number1StageRootEl.classList.toggle("bh-phase6-jet-active", jetActive);
            number1StageRootEl.classList.toggle("bh-phase7-stillness", arc && p === 7);
            syncBlackHolePhase4LensingRipples();
        }

        if (heavyDue && p <= 1) {
            syncPhase1TesseractCanvasesInRoot(number1StageRootEl);
            deps.syncPhase1MassFillCssVars();
        }

        if (massMood && !number1BlackHoleState.phase1VisualUnlockDone) {
            number1BlackHoleState.phase1VisualUnlockDone = true;
            let allowSurge = true;
            try {
                if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) allowSurge = false;
            } catch (_) {}
            if (allowSurge) {
                number1StageRootEl.classList.add("bh-phase1-unlock-surge");
                if (blackHolePhase1SurgeTimerId) clearTimeout(blackHolePhase1SurgeTimerId);
                blackHolePhase1SurgeTimerId = setTimeout(function () {
                    blackHolePhase1SurgeTimerId = 0;
                    const el = deps.getStageRoot();
                    if (el) el.classList.remove("bh-phase1-unlock-surge");
                }, 5200);
            }
            deps.autosaveNow();
        }

        if (digestChanged) syncBlackHolePhase5ThermalTheme(now);

        if (!blackHoleStageVfxHtmlAttrDone) {
            document.documentElement.setAttribute("data-n1-bh-vfx-synced", "");
            blackHoleStageVfxHtmlAttrDone = true;
        }
    }

    function triggerBlackHolePhase1CollapseVfx() {
        const number1StageRootEl = deps.getStageRoot();
        if (!number1StageRootEl || blackHolePhase1CollapsePulseQueued) return;
        blackHolePhase1CollapsePulseQueued = true;
        number1StageRootEl.classList.remove("bh-phase1-collapse-pulse");
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                const el = deps.getStageRoot();
                if (el) el.classList.add("bh-phase1-collapse-pulse");
                blackHolePhase1CollapsePulseQueued = false;
            });
        });
    }

    function patchBlackHolePhase1PanelLiveDom(bhEl) {
        if (!bhEl) return false;
        const number1BlackHoleState = deps.getBlackHoleState();
        const phase = ctrl.getBlackHolePhase();
        if (phase !== 1 || !bhEl.classList.contains("asc-black-hole--phase1")) return false;
        const spent = Math.floor(number1BlackHoleState.phase1EssenceSpent || 0);
        const rem = Math.max(0, BLACK_HOLE_PHASE1_ESSENCE_TARGET - spent);
        const have = Math.max(0, Math.floor(Number(deps.getAscensionEssence()) || 0));
        const pour = Math.min(rem, have);
        const can = rem > 0 && have > 0;
        const fillPct = Math.round(ctrl.getBlackHolePhase1FillRatio() * 100);
        const meterNums = bhEl.querySelector(".asc-black-hole__mass-meter-nums");
        if (meterNums && meterNums.dataset.previewWrapped !== "1") {
            meterNums.innerHTML = "<strong>" + spent + "</strong> / " + BLACK_HOLE_PHASE1_ESSENCE_TARGET + " Essence · " + fillPct + "%";
        } else {
            previewUi.setPreviewStatCurrent(
                bhEl,
                "massMeter",
                "<strong>" + spent + "</strong> / " + BLACK_HOLE_PHASE1_ESSENCE_TARGET + " Essence · " + fillPct + "%",
                true
            );
        }
        const meterTrack = bhEl.querySelector(".asc-black-hole__mass-meter-track");
        if (meterTrack) meterTrack.setAttribute("aria-valuenow", String(spent));
        const meterFill = bhEl.querySelector(".asc-black-hole__mass-meter-fill");
        if (meterFill) meterFill.style.width = fillPct + "%";
        const multStat = bhEl.querySelector(".asc-black-hole__total-mult");
        if (multStat) {
            const mult = ctrl.getNumber1BlackHoleProductionMult();
            const multStr = deps.formatBlackHolePhase1CpsMultForUi(mult);
            const label = ctrl.getTotalProductionMultLabelForPanel();
            if (multStat.querySelector('[data-preview-stat="totalMult"]')) {
                previewUi.setPreviewStatCurrent(bhEl, "totalMult", "×" + multStr, false);
            } else {
                multStat.innerHTML = label + ": <strong>×" + multStr + "</strong>";
            }
        }
        const purse = bhEl.querySelector(".asc-black-hole__purse");
        if (purse) purse.innerHTML = "You hold <strong>" + deps.formatCount(have) + "</strong> Ascension Essence · next pour: <strong>" + deps.formatCount(pour) + "</strong> into mass";
        const btn = bhEl.querySelector(".page-btn--mass-pour");
        if (btn) {
            btn.disabled = !can;
            previewUi.setPreviewButtonLabel(btn, "Pour in all Essence (" + deps.formatCount(pour) + ")");
        }
        let inertialVal = bhEl.querySelector('.asc-black-hole__effect-val[data-asc-p1-effect="inertial"]');
        let essenceVal = bhEl.querySelector('.asc-black-hole__effect-val[data-asc-p1-effect="essence"]');
        let dragVal = bhEl.querySelector('.asc-black-hole__effect-val[data-asc-p1-effect="drag"]');
        if (!inertialVal || !essenceVal || !dragVal) {
            const legacyVals = bhEl.querySelectorAll(".asc-black-hole__effect-list > li > .asc-black-hole__effect-val");
            if (legacyVals.length >= 3) {
                if (!inertialVal) inertialVal = legacyVals[0];
                if (!essenceVal) essenceVal = legacyVals[1];
                if (!dragVal) dragVal = legacyVals[2];
            }
        }
        if (inertialVal) {
            const text = "run CPS ×" + ctrl.formatBlackHolePhase1CpsMultForUi(ctrl.getBlackHolePhase1RunCpsMult());
            if (inertialVal.dataset.previewWrapped === "1") previewUi.setPreviewStatCurrent(bhEl, "inertial", text, false);
            else inertialVal.textContent = text;
        }
        if (essenceVal) {
            const text = "Ascend payout ×" + ctrl.getBlackHolePhase1AscensionEssenceMult().toFixed(2);
            if (essenceVal.dataset.previewWrapped === "1") previewUi.setPreviewStatCurrent(bhEl, "essence", text, false);
            else essenceVal.textContent = text;
        }
        if (dragVal) {
            const text = "Compaction cap " + deps.getMaxSlowdownLevelCap();
            if (dragVal.dataset.previewWrapped === "1") previewUi.setPreviewStatCurrent(bhEl, "drag", text, false);
            else dragVal.textContent = text;
        }
        deps.syncPhase1MassFillCssVars();
        previewUi.refreshActivePreview(bhEl);
        return true;
    }

    let patchBlackHolePhase2LastDataKey = "";
    function patchBlackHolePhase2PanelLiveDom(bhEl) {
        if (!bhEl) return false;
        const phase = ctrl.getBlackHolePhase();
        if (phase !== 2 || !bhEl.classList.contains("asc-black-hole--phase2")) return false;
        if (!bhEl.querySelector(".asc-black-hole__collapse-geometry")) return false;

        const state = deps.getBlackHoleState();
        const L = Math.floor(state.phase2Mass || 0);
        const nextCost = ctrl.getBlackHolePhase2NextCostEssence();
        const bank = Math.floor(state.phase2EssenceBank || 0);
        const have = Math.max(0, Math.floor(Number(deps.getAscensionEssence()) || 0));
        const parallel = Math.max(0, Number(state.phase2ParallelBonusPool) || 0);
        const parallelPct = Math.min(100, Math.round((parallel / 1.5) * 100));
        const tm = ctrl.getBlackHolePhase2CollapseMassTier();
        const tp = ctrl.getBlackHolePhase2CollapsePhotonTier();
        const te = ctrl.getBlackHolePhase2CollapseErgosphereTier();
        const massPourUnlock = ctrl.isBlackHolePhase2MassPourUnlocked();
        const mult = ctrl.getNumber1BlackHoleProductionMult();
        const multStr = deps.formatBlackHolePhase1CpsMultForUi(mult);
        const uxFlags = typeof deps.getBlackHoleUxFlags === "function" ? deps.getBlackHoleUxFlags() : null;
        const feedPulse = uxFlags && Date.now() - (uxFlags.lastPhase2MassFeedAtMs || 0) < 1600;
        const dataKey =
            L +
            "|" +
            nextCost +
            "|" +
            bank +
            "|" +
            have +
            "|" +
            parallelPct +
            "|" +
            tm +
            "|" +
            tp +
            "|" +
            te +
            "|" +
            massPourUnlock +
            "|" +
            multStr +
            "|" +
            feedPulse;
        if (dataKey === patchBlackHolePhase2LastDataKey) {
            previewUi.refreshActivePreview(bhEl);
            return true;
        }
        patchBlackHolePhase2LastDataKey = dataKey;

        bhEl.classList.toggle("asc-black-hole--feed-pulse", !!feedPulse);

        const parallelHtml = "<strong>+" + (parallel * 100).toFixed(1) + "%</strong> / +150.0% Essence";
        const parallelNums = bhEl.querySelector(".asc-black-hole__parallel-meter-wrap .asc-black-hole__mass-meter-nums");
        if (parallelNums) {
            if (parallelNums.dataset.previewWrapped === "1") {
                previewUi.setPreviewStatCurrent(bhEl, "parallelMeter", parallelHtml, true);
            } else {
                parallelNums.innerHTML = parallelHtml;
            }
        }
        const parallelTrack = bhEl.querySelector(".asc-black-hole__parallel-meter-track");
        if (parallelTrack) parallelTrack.setAttribute("aria-valuenow", (parallel * 100).toFixed(1));
        const parallelFill = bhEl.querySelector(".asc-black-hole__parallel-meter-fill");
        if (parallelFill) parallelFill.style.width = parallelPct + "%";

        const multStat = bhEl.querySelector(".asc-black-hole__total-mult");
        if (multStat) {
            const label = ctrl.getTotalProductionMultLabelForPanel();
            if (multStat.querySelector('[data-preview-stat="totalMult"]')) {
                previewUi.setPreviewStatCurrent(bhEl, "totalMult", "×" + multStr, false);
            } else {
                multStat.innerHTML = label + ": <strong>×" + multStr + "</strong>";
            }
        }

        const esc = v => (typeof deps.escapeHtml === "function" ? deps.escapeHtml(String(v)) : String(v));
        const bankLine =
            nextCost > 0 && bank > 0
                ? " · Banked toward next step: <strong>" + esc(deps.formatCount(bank)) + "</strong> / " + esc(deps.formatCount(nextCost))
                : nextCost > 0
                  ? " · Next step: <strong>" + esc(deps.formatCount(nextCost)) + "</strong> Essence"
                  : "";
        const phaseStatsHtml =
            "Phase: <strong>2</strong> · Mass pour: <strong>" +
            (massPourUnlock ? "unlocked" : "locked") +
            "</strong> · Mass: <strong>" +
            L +
            "</strong> · Total gain: <strong>×" +
            esc(multStr) +
            "</strong>" +
            bankLine;
        const phaseStat = bhEl.querySelector("[data-asc-bh-phase-stats]");
        if (phaseStat) {
            if (phaseStat.dataset.previewWrapped === "1") {
                previewUi.setPreviewStatCurrent(bhEl, "phaseStats", phaseStatsHtml, true);
            } else {
                phaseStat.innerHTML = phaseStatsHtml;
            }
        }

        const purse = bhEl.querySelector(".asc-black-hole__purse");
        if (purse) purse.innerHTML = "You hold <strong>" + deps.formatCount(have) + "</strong> Ascension Essence.";

        const p2EffectDeps = {
            escapeHtml: esc,
            formatCount: deps.formatCount,
            getBlackHolePhase: () => 2
        };
        const patchP2Row = function (track, tier, cost, canBuy) {
            const row = bhEl.querySelector('[data-asc-black-hole-p2-row="' + track + '"]');
            if (!row) return;
            const maxed = tier >= BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER;
            const tierLabel = maxed ? "max" : tier + "/" + BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER;
            const tierStrong = row.querySelector(".asc-black-hole__p2-tier strong");
            if (tierStrong) {
                if (tierStrong.dataset.previewWrapped === "1") {
                    previewUi.setPreviewStatCurrent(bhEl, "p2-tier-" + track, tierLabel, false);
                } else {
                    tierStrong.textContent = tierLabel;
                }
            }
            const effect = row.querySelector(".asc-black-hole__p2-effect");
            if (effect) {
                const effectHtml = getPhase2CollapseEffectHtml(track, state, p2EffectDeps);
                if (effect.dataset.previewWrapped === "1") {
                    previewUi.setPreviewStatCurrent(bhEl, "p2-effect-" + track, effectHtml, true);
                } else {
                    effect.innerHTML = effectHtml;
                }
            }
            const btn = row.querySelector("[data-asc-black-hole-p2]");
            if (btn) {
                btn.disabled = !canBuy;
                previewUi.setPreviewButtonLabel(btn, maxed ? "Maxed" : "Buy (" + deps.formatCount(cost) + ")");
            }
        };

        const cMass = ctrl.getBlackHolePhase2CollapseUpgradeCost("mass");
        const cPhoton = ctrl.getBlackHolePhase2CollapseUpgradeCost("photon");
        const cErgo = ctrl.getBlackHolePhase2CollapseUpgradeCost("ergosphere");
        patchP2Row("mass", tm, cMass, tm < BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER && have >= cMass && cMass > 0);
        patchP2Row("photon", tp, cPhoton, tp < BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER && have >= cPhoton && cPhoton > 0);
        patchP2Row("ergosphere", te, cErgo, te < BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER && have >= cErgo && cErgo > 0);

        const pourBtn = bhEl.querySelector('[data-asc-black-hole-buy="1"]');
        const canPourMass = massPourUnlock && have >= 1 && L < BLACK_HOLE_PHASE2_MASS_CAP;
        if (pourBtn) {
            pourBtn.disabled = !canPourMass;
            previewUi.setPreviewButtonLabel(pourBtn, "Pour all Essence into mass (" + deps.formatCount(have) + ")");
        }

        previewUi.refreshActivePreview(bhEl);
        return true;
    }

    let patchBlackHolePhase3LastDataKey = "";
    function patchBlackHolePhase3PanelLiveDom(bhEl) {
        if (!bhEl) return false;
        const phase = ctrl.getBlackHolePhase();
        if (phase !== 3 || !bhEl.classList.contains("asc-black-hole--phase3")) return false;
        if (!bhEl.querySelector(".asc-black-hole__disk-hero")) return false;
        const lum = ctrl.getBlackHolePhase3TrackLevel("luminosity");
        const vis = ctrl.getBlackHolePhase3TrackLevel("viscous");
        const cor = ctrl.getBlackHolePhase3TrackLevel("coronal");
        const have = Math.max(0, Math.floor(Number(deps.getAscensionEssence()) || 0));
        const mult = ctrl.getNumber1BlackHoleProductionMult();
        const multStr = deps.formatBlackHolePhase1CpsMultForUi(mult);
        const dataKey = lum + "|" + vis + "|" + cor + "|" + have + "|" + multStr;
        if (dataKey === patchBlackHolePhase3LastDataKey) return true;
        patchBlackHolePhase3LastDataKey = dataKey;
        const statsBlocks = Array.from(bhEl.querySelectorAll(".asc-black-hole__stats"));
        const multStat = statsBlocks.find(el => el.classList && el.classList.contains("asc-black-hole__total-mult")) || bhEl.querySelector(".asc-black-hole__total-mult");
        if (multStat) {
            multStat.innerHTML = ctrl.getTotalProductionMultLabelForPanel() + ": <strong>×" + multStr + "</strong>";
        }
        const phaseStat = bhEl.querySelector("[data-asc-bh-disk-phase-stats]");
        if (phaseStat) {
            phaseStat.innerHTML = "Phase: <strong>3</strong> · Luminosity: <strong>" + lum + "</strong> · Viscous: <strong>" + vis + "</strong> · Coronal: <strong>" + cor + "</strong>";
        }
        const purse = bhEl.querySelector("[data-asc-bh-disk-purse]");
        if (purse) purse.innerHTML = "You hold <strong>" + deps.formatCount(have) + "</strong> Ascension Essence.";
        const patchP3Row = function (track, tier) {
            const row = bhEl.querySelector(".asc-black-hole__disk-row--" + track);
            if (!row) return;
            const cost = ctrl.getBlackHolePhase3TrackCost(track);
            const maxed = tier >= 6;
            const canBuy = !maxed && have >= cost && cost > 0;
            const tierStrong = row.querySelector(".asc-black-hole__p2-tier strong");
            if (tierStrong) tierStrong.textContent = maxed ? "max" : tier + "/6";
            const pipsWrap = row.querySelector(".asc-black-hole__disk-pips");
            if (pipsWrap) pipsWrap.setAttribute("aria-label", tier + " of 6 tiers lit");
            const pips = row.querySelectorAll(".asc-black-hole__disk-pip");
            for (let idx = 0; idx < pips.length; idx++) {
                const i = idx + 1;
                if (i <= tier) pips[idx].classList.add("asc-black-hole__disk-pip--lit");
                else pips[idx].classList.remove("asc-black-hole__disk-pip--lit");
            }
            const btn = row.querySelector("[data-asc-black-hole-p3]");
            if (btn) {
                btn.disabled = !canBuy;
                previewUi.setPreviewButtonLabel(btn, maxed ? "Maxed" : "Buy (" + deps.formatCount(cost) + ")");
            }
        };
        patchP3Row("luminosity", lum);
        patchP3Row("viscous", vis);
        patchP3Row("coronal", cor);
        previewUi.refreshActivePreview(bhEl);
        return true;
    }

    let patchBlackHolePhase5LastLayoutKey = "";
    let patchBlackHolePhase5LastLiveKey = "";
    function patchBlackHolePhase5PanelLiveDom(bhEl) {
        if (!bhEl) return false;
        const phase = ctrl.getBlackHolePhase();
        if (phase !== 5 || !bhEl.classList.contains("asc-black-hole--phase5")) return false;

        const state = deps.getBlackHoleState();
        const now = Date.now();
        const digestEnd = state.phase5DigestEndsAtMs || 0;
        const lastCompleteAt = Number(state.phase5LastDigestCompletedAtMs) || 0;
        const ritualActive = lastCompleteAt > 0 && now - lastCompleteAt < BLACK_HOLE_FURNACE_COMPLETION_RITUAL_MS;
        bhEl.classList.toggle("asc-black-hole--furnace-ritual", ritualActive);

        const activeHand = Math.max(0, Math.floor(state.phase5DigestHandNumber || 0));
        const canSpeedDigest = digestEnd > now && activeHand > 0;
        const completed = Math.max(0, Math.floor(state.phase5FurnaceLevel || 0));
        const pendingMutationLevel = Math.max(0, Math.floor(Number(state.phase5PendingMutationLevel) || 0));
        const pendingMutationHand = Math.max(0, Math.floor(Number(state.phase5PendingMutationHand) || 0));
        const hasPendingMutation = pendingMutationLevel > 0;
        const nextHand = Math.max(1, Math.floor(state.phase5NextSacrificeHand || 1));
        const hotter = ctrl.getBlackHolePhase5MutationLevel("hotter-core");
        const refinery = ctrl.getBlackHolePhase5MutationLevel("essence-refinery");
        const orbit = ctrl.getBlackHolePhase5MutationLevel("shorter-orbit");
        const multStr = deps.formatBlackHolePhase1CpsMultForUi(ctrl.getNumber1BlackHoleProductionMult());
        const layoutKey =
            completed +
            "|" +
            (hasPendingMutation ? 1 : 0) +
            "|" +
            pendingMutationHand +
            "|" +
            activeHand +
            "|" +
            (canSpeedDigest ? 1 : 0) +
            "|" +
            nextHand +
            "|" +
            hotter +
            "|" +
            refinery +
            "|" +
            orbit;
        if (layoutKey !== patchBlackHolePhase5LastLayoutKey) {
            patchBlackHolePhase5LastLayoutKey = layoutKey;
            patchBlackHolePhase5LastLiveKey = "";
            return false;
        }

        const esc = v => (typeof deps.escapeHtml === "function" ? deps.escapeHtml(String(v)) : String(v));
        const have = Math.max(0, Math.floor(Number(deps.getAscensionEssence()) || 0));
        const speedDigestCost = Math.max(25, Math.floor(50 + 20 * completed));
        const bufferSecCeil = Math.max(
            5,
            Math.ceil(
                ((typeof deps.getPhase5StokeMinRemainingMs === "function" ? deps.getPhase5StokeMinRemainingMs() : 8000) || 8000) /
                    1000
            )
        );
        const stokePreview = canSpeedDigest && have > 0 ? ctrl.getBlackHolePhase5StokePreview(have, now) : null;
        const stokeSpend = stokePreview && stokePreview.spentEssence != null ? Math.max(0, Math.floor(Number(stokePreview.spentEssence))) : 0;
        const canStoke = canSpeedDigest && !hasPendingMutation && stokeSpend >= 1;
        const unlockedHands = typeof deps.getUnlockedHands === "function" ? deps.getUnlockedHands() : 10;
        const nextHandLocked = !canSpeedDigest && nextHand > 1 && unlockedHands < nextHand;
        const progress = canSpeedDigest ? ctrl.getBlackHolePhase5DigestProgressAt(now) : 0;
        const curved = ctrl.getBlackHolePhase5DigestCurve(progress);
        const progressPct = Math.floor(progress * 1000) / 10;
        const curvedPct = Math.floor(curved * 1000) / 10;
        const digestRemainingSec = canSpeedDigest ? Math.max(0, Math.ceil((digestEnd - now) / 1000)) : 0;
        const currentPower = ctrl.getBlackHolePhase5EffectiveFurnacePower();
        const nextFullPower = completed + (canSpeedDigest ? 1 : 0);
        const furnaceMult = ctrl.getBlackHoleFurnaceMult();
        const nextFurnaceMult = Math.pow(BLACK_HOLE_FURNACE_MULT_PER_POWER * ctrl.getBlackHolePhase5HotterCoreMult(), nextFullPower);
        const liveKey =
            progressPct +
            "|" +
            curvedPct +
            "|" +
            digestRemainingSec +
            "|" +
            have +
            "|" +
            multStr +
            "|" +
            (ritualActive ? 1 : 0) +
            "|" +
            furnaceMult.toFixed(2) +
            "|" +
            currentPower.toFixed(2) +
            "|" +
            (canStoke ? 1 : 0) +
            "|" +
            (canSpeedDigest || hasPendingMutation ? 1 : 0) +
            "|" +
            (nextHandLocked ? 1 : 0);
        if (liveKey === patchBlackHolePhase5LastLiveKey) {
            previewUi.refreshActivePreview(bhEl);
            return true;
        }
        patchBlackHolePhase5LastLiveKey = liveKey;
        const furnaceEssenceBonus = ctrl.getBlackHoleFurnaceEssenceBonus();
        const digestLabel = canSpeedDigest
            ? "Hand " + activeHand + " digesting · " + progressPct.toFixed(1) + "% time · " + curvedPct.toFixed(1) + "% power"
            : hasPendingMutation
              ? "Mutation pending for Hand " + pendingMutationHand
              : "Ready for next sacrifice";

        const mutationSummary = bhEl.querySelector(".asc-black-hole__mutation-summary");
        if (mutationSummary) {
            mutationSummary.innerHTML =
                "<span>Echo CPS <strong>×" +
                (furnaceMult >= 10 ? furnaceMult.toFixed(2) : furnaceMult.toFixed(3)) +
                "</strong> · each Echo Hand compounds from ×" +
                BLACK_HOLE_FURNACE_MULT_PER_POWER.toFixed(2) +
                " base</span>" +
                "<span>Hotter Core <strong>" +
                hotter +
                "</strong> · raises Echo CPS base +" +
                Math.round(BLACK_HOLE_FURNACE_HOTTER_CORE_BONUS * 100) +
                "% / stack</span>" +
                "<span>Essence Refinery <strong>" +
                refinery +
                "</strong> · current furnace Essence bonus +" +
                (furnaceEssenceBonus * 100).toFixed(1) +
                "%</span>" +
                "<span>Shorter Orbit <strong>" +
                orbit +
                "</strong> · next digests ×" +
                ctrl.getBlackHolePhase5ShorterOrbitMult().toFixed(2) +
                " time</span>";
        }

        if (canSpeedDigest) {
            const numsEl = bhEl.querySelector(".asc-black-hole__mass-meter-wrap .asc-black-hole__mass-meter-nums");
            if (numsEl) {
                numsEl.innerHTML =
                    "<strong>" +
                    progressPct.toFixed(1) +
                    "%</strong> time · <strong>" +
                    curvedPct.toFixed(1) +
                    "%</strong> power · " +
                    esc(typeof deps.formatSeconds === "function" ? deps.formatSeconds(digestRemainingSec) : String(digestRemainingSec) + "s") +
                    " left";
            }
            const meterTrack = bhEl.querySelector(".asc-black-hole__furnace-meter-track");
            if (meterTrack) {
                meterTrack.setAttribute("aria-valuenow", progressPct.toFixed(1));
                const fill = meterTrack.querySelector(".asc-black-hole__furnace-meter-fill");
                if (fill) fill.style.width = Math.max(0, Math.min(100, progress * 100)).toFixed(1) + "%";
                const preview = meterTrack.querySelector(".asc-black-hole__furnace-meter-preview");
                if (preview && !bhEl.classList.contains("asc-black-hole--stoke-preview-active")) {
                    const stokePreviewPct = stokePreview ? Math.floor(stokePreview.progress * 1000) / 10 : progressPct;
                    preview.style.width = Math.max(0, Math.min(100, stokePreviewPct)).toFixed(1) + "%";
                }
            }
            const handShell = bhEl.querySelector(".asc-black-hole__furnace-hand-shell");
            if (handShell) handShell.style.setProperty("--digest-fill", Math.max(0, Math.min(100, progress * 100)).toFixed(1) + "%");
            const digestVisual = bhEl.querySelector(".asc-black-hole__furnace-visual");
            if (digestVisual) {
                digestVisual.setAttribute("aria-label", "Hand " + activeHand + " is " + progressPct.toFixed(1) + "% digested");
            }
            const stokePreviewEl = bhEl.querySelector("#asc-black-hole-stoke-preview");
            if (stokePreviewEl && !bhEl.classList.contains("asc-black-hole--stoke-preview-active")) {
                if (stokePreview) {
                    const stokePreviewPct = Math.floor(stokePreview.progress * 1000) / 10;
                    const stokePreviewCurvedPct = Math.floor(stokePreview.curved * 1000) / 10;
                    const stokeRemovedSec = Math.max(0, Math.floor(stokePreview.removedMs / 1000));
                    const stokeRemainingSec = Math.max(0, Math.ceil(stokePreview.projectedRemainingMs / 1000));
                    stokePreviewEl.classList.remove("asc-black-hole__stoke-preview--empty");
                    stokePreviewEl.innerHTML =
                        "Projected after stoke: <strong>" +
                        stokePreviewPct.toFixed(1) +
                        "%</strong> time · <strong>" +
                        stokePreviewCurvedPct.toFixed(1) +
                        "%</strong> power · removes <strong>" +
                        esc(typeof deps.formatSeconds === "function" ? deps.formatSeconds(stokeRemovedSec) : String(stokeRemovedSec) + "s") +
                        "</strong> · leaves <strong>" +
                        esc(typeof deps.formatSeconds === "function" ? deps.formatSeconds(stokeRemainingSec) : String(stokeRemainingSec) + "s") +
                        "</strong>";
                } else {
                    stokePreviewEl.classList.add("asc-black-hole__stoke-preview--empty");
                    stokePreviewEl.textContent = "Earn Ascension Essence to preview the next stoke jump.";
                }
            }
        }

        const stats = bhEl.querySelectorAll(".asc-black-hole__stats");
        if (stats[0]) {
            stats[0].innerHTML =
                "Phase: <strong>5</strong> · Completed hands: <strong>" +
                completed +
                "</strong> · Active: <strong>" +
                esc(digestLabel) +
                "</strong>";
        }
        if (stats[1]) {
            stats[1].innerHTML =
                "Furnace power: <strong>" +
                currentPower.toFixed(2) +
                "</strong> Echo Hands · Current furnace CPS: <strong>×" +
                furnaceMult.toFixed(2) +
                "</strong> · On completion: <strong>×" +
                nextFurnaceMult.toFixed(2) +
                "</strong>";
        }
        const purse = bhEl.querySelector(".asc-black-hole__purse");
        if (purse) {
            purse.innerHTML =
                "You hold <strong>" +
                deps.formatCount(have) +
                "</strong> Ascension Essence · full stoke unit: <strong>" +
                deps.formatCount(speedDigestCost) +
                "</strong>. Stoking trims time until ~<strong>" +
                bufferSecCeil +
                "</strong>s remain and only spends Essence that actually accelerates digestion.";
        }
        const multStat = bhEl.querySelector(".asc-black-hole__total-mult");
        if (multStat) {
            const label = ctrl.getTotalProductionMultLabelForPanel();
            if (multStat.querySelector('[data-preview-stat="totalMult"]')) {
                previewUi.setPreviewStatCurrent(bhEl, "totalMult", "×" + multStr, false);
            } else {
                multStat.innerHTML = label + ": <strong>×" + multStr + "</strong>";
            }
        }

        const stokeBtn = bhEl.querySelector('[data-asc-black-hole-buy="1"]');
        if (stokeBtn) {
            const stokeBtnLabel = !canSpeedDigest
                ? "Stoke active digest"
                : hasPendingMutation
                  ? "Stoke (mutation pending)"
                  : stokeSpend >= 1
                    ? "Stoke active digest (" + deps.formatCount(stokeSpend) + " Essence)"
                    : "Digest buffer (~≤" + bufferSecCeil + "s left) · won't spend Essence yet";
            stokeBtn.disabled = !canStoke;
            previewUi.setPreviewButtonLabel(stokeBtn, stokeBtnLabel);
        }
        const sacrificeBtn = bhEl.querySelector('[data-asc-black-hole-sacrifice="1"]');
        if (sacrificeBtn) {
            sacrificeBtn.disabled = canSpeedDigest || hasPendingMutation;
            const sacrificeLabel = hasPendingMutation
                ? "Choose mutation first"
                : canSpeedDigest
                  ? "Digesting hand " + activeHand + "..."
                  : nextHandLocked
                    ? "Unlock Hand " + nextHand + " to feed"
                    : "Feed next hand";
            previewUi.setPreviewButtonLabel(sacrificeBtn, sacrificeLabel);
        }

        previewUi.refreshActivePreview(bhEl);
        return true;
    }

    function refreshBlackHolePanelLiveDomIfOpen() {
        const pagePanelEl = deps.getPagePanelEl();
        const pagePanelBodyEl = deps.getPagePanelBodyEl();
        if (!pagePanelEl || pagePanelEl.style.display === "none" || !pagePanelBodyEl) return;
        if (pagePanelEl.dataset.openPageId !== "ascension" || deps.getAscensionPageActiveNumber() !== 1) return;
        const bhEl = pagePanelBodyEl.querySelector(".asc-black-hole");
        if (bhEl) {
            if (!patchBlackHolePhase1PanelLiveDom(bhEl) &&
                !patchBlackHolePhase2PanelLiveDom(bhEl) &&
                !patchBlackHolePhase3PanelLiveDom(bhEl) &&
                !patchBlackHolePhase5PanelLiveDom(bhEl)) {
                bhEl.outerHTML = deps.renderNumber1BlackHolePanelHtml();
                const nextBhEl = pagePanelBodyEl.querySelector(".asc-black-hole");
                previewUi.afterPanelMounted(nextBhEl);
            } else {
                previewUi.afterPanelMounted(bhEl);
            }
        } else {
            deps.refreshAscensionPanelIfOpen();
        }
        deps.patchAscensionHubStatsPillsDomIfChanged();
        if (ctrl.getBlackHolePhase() <= 1) {
            syncPhase1TesseractCanvasesInRoot(pagePanelBodyEl);
        }
    }

    return {
        queueBlackHoleUiRefresh,
        syncBlackHolePhase4LensingRipples,
        pulseBlackHoleLensingManualBurst,
        pulseBlackHoleLensingAutoTick,
        syncBlackHolePhase1Vfx,
        triggerBlackHolePhase1CollapseVfx,
        patchBlackHolePhase1PanelLiveDom,
        patchBlackHolePhase2PanelLiveDom,
        patchBlackHolePhase3PanelLiveDom,
        patchBlackHolePhase5PanelLiveDom,
        refreshBlackHolePanelLiveDomIfOpen,
        bindBlackHoleUpgradePreviewListeners: previewUi.bindBlackHoleUpgradePreviewListeners,
        afterBlackHolePanelMounted: previewUi.afterPanelMounted
    };
}
