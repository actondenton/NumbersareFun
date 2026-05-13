import { BLACK_HOLE_PHASE1_ESSENCE_TARGET } from "./number1-black-hole.js";
import { syncPhase1TesseractCanvasesInRoot } from "./phase1-tesseract-canvas.js";

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
 */
export function createNumber1BlackHoleUi(deps) {
    const ctrl = deps.controller;

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

    function queueBlackHoleUiRefresh() {
        if (blackHoleUiRefreshQueued) return;
        blackHoleUiRefreshQueued = true;
        requestAnimationFrame(function () {
            blackHoleUiRefreshQueued = false;
            deps.syncPhase1MassFillCssVars();
            deps.refreshGlobalOverviewPanelIfOpen();
            refreshBlackHolePanelLiveDomIfOpen();
        });
    }

    function syncBlackHolePhase4LensingRipples() {
        const number1StageRootEl = deps.getStageRoot();
        if (!number1StageRootEl) return;
        const arc = deps.isBlackHoleArcUnlocked();
        const p = ctrl.getBlackHolePhase();
        const lensOn = arc && p >= 4 && p < 6;
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
            return;
        }
        const heatUnified = clamp01(computePhase5DigestHeatUnified(nowMs) / 9);
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

        const incrementalCountLabelEl = deps.getIncrementalCountLabel();
        if (incrementalCountLabelEl && blackHoleStageVfxLastPhaseForLabel !== p) {
            blackHoleStageVfxLastPhaseForLabel = p;
            incrementalCountLabelEl.textContent = p === 7 ? "Epilogue Count" : "Total Count";
        }

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
            number1StageRootEl.classList.toggle("bh-phase5-magnetic-furnace", arc && p === 5);
            number1StageRootEl.classList.toggle("bh-phase6-jet-beam", arc && p === 6);
            number1StageRootEl.classList.toggle("bh-phase6-jet-active", jetActive);
            number1StageRootEl.classList.toggle("bh-phase7-stillness", arc && p === 7);
            syncBlackHolePhase4LensingRipples();
        }

        if (heavyDue) {
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

        if (arc && p === 5) syncBlackHolePhase5ThermalTheme(now);
        else if (digestChanged) syncBlackHolePhase5ThermalTheme(now);

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
        if (meterNums) meterNums.innerHTML = "<strong>" + spent + "</strong> / " + BLACK_HOLE_PHASE1_ESSENCE_TARGET + " Essence · " + fillPct + "%";
        const meterTrack = bhEl.querySelector(".asc-black-hole__mass-meter-track");
        if (meterTrack) meterTrack.setAttribute("aria-valuenow", String(spent));
        const meterFill = bhEl.querySelector(".asc-black-hole__mass-meter-fill");
        if (meterFill) meterFill.style.width = fillPct + "%";
        const multStat = bhEl.querySelector(".asc-black-hole__total-mult");
        if (multStat) {
            const mult = ctrl.getNumber1BlackHoleProductionMult();
            const multStr = mult >= 10 ? mult.toFixed(2) : mult.toFixed(3);
            multStat.innerHTML = ctrl.getTotalProductionMultLabelForPanel() + ": <strong>×" + multStr + "</strong>";
        }
        const purse = bhEl.querySelector(".asc-black-hole__purse");
        if (purse) purse.innerHTML = "You hold <strong>" + deps.formatCount(have) + "</strong> Ascension Essence · next pour: <strong>" + deps.formatCount(pour) + "</strong> into mass";
        const btn = bhEl.querySelector(".page-btn--mass-pour");
        if (btn) {
            btn.disabled = !can;
            btn.textContent = "Pour in all Essence (" + deps.formatCount(pour) + ")";
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
        if (inertialVal) inertialVal.textContent = "run CPS ×" + ctrl.formatBlackHolePhase1CpsMultForUi(ctrl.getBlackHolePhase1RunCpsMult());
        if (essenceVal) essenceVal.textContent = "Ascend payout ×" + ctrl.getBlackHolePhase1AscensionEssenceMult().toFixed(2);
        if (dragVal) dragVal.textContent = "Compaction cap " + deps.getMaxSlowdownLevelCap();
        deps.syncPhase1MassFillCssVars();
        return true;
    }

    function patchBlackHolePhase2PanelLiveDom(bhEl) {
        if (!bhEl) return false;
        const phase = ctrl.getBlackHolePhase();
        if (phase !== 2 || !bhEl.classList.contains("asc-black-hole--phase2")) return false;
        const collapseGeometry = bhEl.querySelector(".asc-black-hole__collapse-geometry");
        if (!collapseGeometry) return false;
        const wrap = document.createElement("div");
        wrap.innerHTML = deps.renderNumber1BlackHolePanelHtml();
        const freshBhEl = wrap.firstElementChild;
        if (!freshBhEl || !freshBhEl.classList || !freshBhEl.classList.contains("asc-black-hole--phase2")) return false;
        bhEl.className = freshBhEl.className;
        Array.from(bhEl.childNodes).forEach(function (node) {
            if (node !== collapseGeometry) node.remove();
        });
        Array.from(freshBhEl.childNodes).forEach(function (node) {
            if (node.nodeType === 1 && node.classList.contains("asc-black-hole__collapse-geometry")) return;
            bhEl.appendChild(node);
        });
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
        const multStr = mult >= 10 ? mult.toFixed(2) : mult.toFixed(3);
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
                btn.textContent = maxed ? "Maxed" : "Buy (" + deps.formatCount(cost) + ")";
            }
        };
        patchP3Row("luminosity", lum);
        patchP3Row("viscous", vis);
        patchP3Row("coronal", cor);
        return true;
    }

    function refreshBlackHolePanelLiveDomIfOpen() {
        const pagePanelEl = deps.getPagePanelEl();
        const pagePanelBodyEl = deps.getPagePanelBodyEl();
        if (!pagePanelEl || pagePanelEl.style.display === "none" || !pagePanelBodyEl) return;
        if (pagePanelEl.dataset.openPageId !== "ascension" || deps.getAscensionPageActiveNumber() !== 1) return;
        const bhEl = pagePanelBodyEl.querySelector(".asc-black-hole");
        if (bhEl) {
            if (!patchBlackHolePhase1PanelLiveDom(bhEl) && !patchBlackHolePhase2PanelLiveDom(bhEl) && !patchBlackHolePhase3PanelLiveDom(bhEl)) bhEl.outerHTML = deps.renderNumber1BlackHolePanelHtml();
        } else {
            deps.refreshAscensionPanelIfOpen();
        }
        deps.patchAscensionHubStatsPillsDomIfChanged();
        syncPhase1TesseractCanvasesInRoot(pagePanelBodyEl);
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
        refreshBlackHolePanelLiveDomIfOpen
    };
}
