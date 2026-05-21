/**
 * Number 1 black-hole controller: read model, production mult cache, arc start, and simulated phase stepping.
 * Composition root wires DOM/VFX and cross-module gameplay (turbo meter, hands reset) via deps.
 */
import {
    BLACK_HOLE_DIGEST_BASE_MS,
    BLACK_HOLE_EVAPORATION_CAP,
    BLACK_HOLE_PHASE1_ESSENCE_TARGET,
    BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER,
    BLACK_HOLE_PHASE2_MASS_CAP,
    getBlackHolePhase2CollapseMaxTier as getBlackHolePhase2CollapseMaxTierRule,
    getBlackHolePhase2ErgosphereTurboDefaultOn as getBlackHolePhase2ErgosphereTurboDefaultOnRule,
    getBlackHolePhase2ErgosphereTurboLevelerPassive as getBlackHolePhase2ErgosphereTurboLevelerPassiveRule,
    getBlackHolePhase2ErgosphereTurboPassivePerSec as getBlackHolePhase2ErgosphereTurboPassivePerSecRule,
    getBlackHolePhase2ErgosphereTurboPassiveRequiresOn as getBlackHolePhase2ErgosphereTurboPassiveRequiresOnRule,
    getBlackHolePhase2MassMultFromLevel as getBlackHolePhase2MassMultFromLevelRule,
    BLACK_HOLE_PHASE4_WAVE_BOOST_DURATION_SEC,
    BLACK_HOLE_PHASE4_WAVE_BOOST_MULT,
    clampBlackHolePhase as clampBlackHolePhaseRule,
    getBlackHoleFurnaceEssenceBonus as getBlackHoleFurnaceEssenceBonusRule,
    getBlackHoleFurnaceMult as getBlackHoleFurnaceMultRule,
    getBlackHolePhase2CollapseErgosphereTier as getBlackHolePhase2CollapseErgosphereTierRule,
    getBlackHolePhase2CollapseMassTier as getBlackHolePhase2CollapseMassTierRule,
    getBlackHolePhase2CollapsePhotonTier as getBlackHolePhase2CollapsePhotonTierRule,
    getBlackHolePhase2CollapseUpgradeCost as getBlackHolePhase2CollapseUpgradeCostRule,
    getBlackHolePhase2CostAtLevel as getBlackHolePhase2CostAtLevelRule,
    getBlackHolePhase2MassCouplingCostMult as getBlackHolePhase2MassCouplingCostMultRule,
    getBlackHolePhase2PhotonHawkingCdTrimSec as getBlackHolePhase2PhotonHawkingCdTrimSecRule,
    getBlackHolePhase2PhotonShellMult as getBlackHolePhase2PhotonShellMultRule,
    getBlackHolePhase1AscensionEssenceMult as getBlackHolePhase1AscensionEssenceMultRule,
    getBlackHolePhase1FillRatio as getBlackHolePhase1FillRatioRule,
    getBlackHolePhase1RunCpsMult as getBlackHolePhase1RunCpsMultRule,
    getBlackHolePhase1SlowdownCapBonus as getBlackHolePhase1SlowdownCapBonusRule,
    getBlackHolePhase3TrackCost as getBlackHolePhase3TrackCostRule,
    getBlackHolePhase3TrackLevel as getBlackHolePhase3TrackLevelRule,
    getBlackHolePhase3UpgradeFrac as getBlackHolePhase3UpgradeFracRule,
    getBlackHolePhase4NextCostEssenceForWave as getBlackHolePhase4NextCostEssenceForWaveRule,
    getBlackHolePhase5DigestCurve as getBlackHolePhase5DigestCurveRule,
    getBlackHolePhase5DigestProgressAt as getBlackHolePhase5DigestProgressAtRule,
    getBlackHolePhase5EffectiveFurnacePower as getBlackHolePhase5EffectiveFurnacePowerRule,
    getBlackHolePhase5HotterCoreMult as getBlackHolePhase5HotterCoreMultRule,
    getBlackHolePhase5MutationLevel as getBlackHolePhase5MutationLevelRule,
    getBlackHolePhase5ShorterOrbitMult as getBlackHolePhase5ShorterOrbitMultRule,
    getBlackHolePhase6NextJetUpgradeCostEssence as getBlackHolePhase6NextJetUpgradeCostEssenceRule,
    getBlackHolePhase6TrackCost as getBlackHolePhase6TrackCostRule,
    getBlackHolePhase6TrackLevel as getBlackHolePhase6TrackLevelRule,
    getBlackHoleWaveIntervalSec as getBlackHoleWaveIntervalSecRule,
    isBlackHolePhase3Complete as isBlackHolePhase3CompleteRule,
    isBlackHolePhase2MassPourUnlocked as isBlackHolePhase2MassPourUnlockedRule,
    syncNumber1BlackHolePhase3LegacyLevel
} from "./number1-black-hole.js";
import { createNumber1BlackHoleUi } from "./n1-black-hole-ui.js";
import { formatCompactMultiplier } from "./modules/number1/format.js";
import { syncPhase1MassFillCssVarsInRoot } from "./modules/number1/tesseract-canvas.js";

export function createNumber1BlackHoleController(deps) {
    const getS = deps.getBlackHoleState;
    const isArcUnlocked = deps.isArcUnlocked;
    const hasAscended = deps.hasAscended;

    function getBlackHolePhase() {
        return clampBlackHolePhaseRule(getS().phase);
    }

    function useBlackHolePlayerTerminology() {
        return getBlackHolePhase() >= 2;
    }

    function getArcEssenceMultiplierBonusPhraseLower() {
        return useBlackHolePlayerTerminology() ? "black hole bonus" : "numerical mass bonus";
    }

    function getArcEssenceMultiplierBonusPhraseTitle() {
        return useBlackHolePlayerTerminology() ? "Black hole bonus" : "Numerical mass bonus";
    }

    function getTotalProductionMultLabelForPanel() {
        return useBlackHolePlayerTerminology() ? "Current total black hole multiplier" : "Current total run multiplier";
    }

    function getGravityStackTooltipPhrase() {
        if (!isArcUnlocked()) return "post-map multiplier (unlocks when the skill map is complete)";
        return getBlackHolePhase() <= 1 ? "numerical mass" : "black hole";
    }

    function ensureBlackHoleArcStarted() {
        if (!isArcUnlocked()) return;
        if (getBlackHolePhase() > 0) return;
        getS().phase = 1;
        deps.addToLog(
            "Numerical Mass Accumulator online — pour Ascension Essence until critical mass (" +
                deps.formatCount(BLACK_HOLE_PHASE1_ESSENCE_TARGET) +
                ").",
            "milestone"
        );
    }

    function tryStartNumber1BlackHoleArc() {
        if (!hasAscended()) return;
        if (!isArcUnlocked()) {
            deps.addToLog("Complete every ascension map node first.", "warning");
            return;
        }
        ensureBlackHoleArcStarted();
        deps.queueBlackHoleUiRefresh();
        deps.autosaveNow();
    }

    function hasBlackHoleProgressLockingRespec() {
        const phase = getBlackHolePhase();
        const s = getS();
        if (phase > 1) return true;
        if (Math.floor(Number(s.phase1EssenceSpent) || 0) > 0) return true;
        if (Math.floor(Number(s.phase2Mass) || 0) > 0) return true;
        if (Math.floor(Number(s.phase2EssenceBank) || 0) > 0) return true;
        if (getBlackHolePhase2CollapseMassTier() > 0) return true;
        if (getBlackHolePhase2CollapsePhotonTier() > 0) return true;
        if (getBlackHolePhase2CollapseErgosphereTier() > 0) return true;
        if (Math.floor(Number(s.phase3HawkingStrength) || 0) > 0) return true;
        if (Math.floor(Number(s.phase3EssenceBank) || 0) > 0) return true;
        if (Math.floor(Number(s.phase4WaveLevel) || 0) > 0) return true;
        if (Math.floor(Number(s.phase4EssenceBank) || 0) > 0) return true;
        if (Math.floor(Number(s.phase5FurnaceLevel) || 0) > 0) return true;
        if (Math.floor(Number(s.phase6JetBoostLevel) || 0) > 0) return true;
        if (Math.floor(Number(s.phase6EssenceBank) || 0) > 0) return true;
        return false;
    }

    function getBlackHolePhase2CollapseMassTier() {
        return getBlackHolePhase2CollapseMassTierRule(getS());
    }

    function getBlackHolePhase2CollapsePhotonTier() {
        return getBlackHolePhase2CollapsePhotonTierRule(getS());
    }

    function getBlackHolePhase2CollapseErgosphereTier() {
        return getBlackHolePhase2CollapseErgosphereTierRule(getS());
    }

    function isBlackHolePhase2MassPourUnlocked() {
        return isBlackHolePhase2MassPourUnlockedRule(getS());
    }

    function getBlackHolePhase2MassCouplingCostMult() {
        return getBlackHolePhase2MassCouplingCostMultRule(getS(), getBlackHolePhase());
    }

    function getBlackHolePhase2PhotonShellMult() {
        return getBlackHolePhase2PhotonShellMultRule(getS());
    }

    function getBlackHolePhase2PhotonHawkingCdTrimSec() {
        return getBlackHolePhase2PhotonHawkingCdTrimSecRule(getS());
    }

    function getBlackHolePhase2CollapseUpgradeCost(track) {
        return getBlackHolePhase2CollapseUpgradeCostRule(getS(), track);
    }

    function getBlackHolePhase2CostAtLevel(L) {
        return getBlackHolePhase2CostAtLevelRule(L, getBlackHolePhase2MassCouplingCostMult());
    }

    function getBlackHolePhase2CollapseMaxTier() {
        return getBlackHolePhase2CollapseMaxTierRule(getS());
    }

    function getBlackHolePhase2MassMult() {
        const s = getS();
        const L = Math.max(0, Math.min(BLACK_HOLE_PHASE2_MASS_CAP, Math.floor(Number(s.phase2Mass) || 0)));
        return getBlackHolePhase2MassMultFromLevelRule(L);
    }

    function getBlackHolePhase2MassMultAfterNextPour() {
        const s = getS();
        const L = Math.max(0, Math.min(BLACK_HOLE_PHASE2_MASS_CAP - 1, Math.floor(Number(s.phase2Mass) || 0)));
        return getBlackHolePhase2MassMultFromLevelRule(L + 1);
    }

    function getBlackHolePhase2NextCostEssence() {
        const s = getS();
        const L = Math.max(0, Math.min(BLACK_HOLE_PHASE2_MASS_CAP, Math.floor(Number(s.phase2Mass) || 0)));
        if (L >= BLACK_HOLE_PHASE2_MASS_CAP) return 0;
        return getBlackHolePhase2CostAtLevel(L);
    }

    function addBlackHolePhase2ParallelBonusFromEssence(spentEssence) {
        if (getBlackHolePhase() !== 2) return 0;
        const spend = Math.max(0, Math.floor(Number(spentEssence) || 0));
        if (spend <= 0) return 0;
        const s = getS();
        const before = Math.max(0, Number(s.phase2ParallelBonusPool) || 0);
        const after = Math.min(1.5, before + spend * 0.0001);
        s.phase2ParallelBonusPool = after;
        return Math.max(0, after - before);
    }

    function getBlackHolePhase3UpgradeFrac() {
        return getBlackHolePhase3UpgradeFracRule(getS(), getBlackHolePhase());
    }

    function getBlackHolePhase4NextCostEssenceForWave(w) {
        return getBlackHolePhase4NextCostEssenceForWaveRule(w);
    }

    function getBlackHolePhase4NextCostEssence() {
        return getBlackHolePhase4NextCostEssenceForWave(getS().phase4WaveLevel || 0);
    }

    function getBlackHolePhase6NextJetUpgradeCostEssence() {
        return getBlackHolePhase6NextJetUpgradeCostEssenceRule(getS());
    }

    function getBlackHolePhase3TrackLevel(track) {
        return getBlackHolePhase3TrackLevelRule(getS(), track);
    }

    function getBlackHolePhase3TrackCost(track) {
        return getBlackHolePhase3TrackCostRule(getS(), track);
    }

    function syncBlackHolePhase3LegacyLevel() {
        syncNumber1BlackHolePhase3LegacyLevel(getS());
    }

    function isBlackHolePhase3Complete() {
        return isBlackHolePhase3CompleteRule(getS());
    }

    function getBlackHolePhase6TrackLevel(track) {
        return getBlackHolePhase6TrackLevelRule(getS(), track);
    }

    function getBlackHolePhase6TrackCost(track) {
        return getBlackHolePhase6TrackCostRule(getS(), track);
    }

    function getBlackHolePhase1FillRatio() {
        return getBlackHolePhase1FillRatioRule(getS());
    }

    function getBlackHolePhase1RunCpsMult() {
        return getBlackHolePhase1RunCpsMultRule(getS());
    }

    function formatBlackHolePhase1CpsMultForUi(m) {
        const x = Number(m);
        if (!Number.isFinite(x) || x < 1) return "1";
        return formatCompactMultiplier(x);
    }

    function getBlackHolePhase1AscensionEssenceMult() {
        return getBlackHolePhase1AscensionEssenceMultRule(getS());
    }

    function getBlackHolePhase1SlowdownCapBonus() {
        return getBlackHolePhase1SlowdownCapBonusRule(getS());
    }

    function getBlackHoleWaveIntervalSec() {
        return getBlackHoleWaveIntervalSecRule(getS());
    }

    function getBlackHoleHawkingMult() {
        const p = getBlackHolePhase();
        if (p < 3 || p >= 6) return 1;
        const now = Date.now();
        if (now > (getS().phase3HawkingActiveUntilMs || 0)) return 1;
        const baseS = getBlackHolePhase3TrackLevel("luminosity");
        const sEff = p === 3 ? baseS + getBlackHolePhase3UpgradeFrac() : baseS;
        const amp = 0.25 + 0.1 * sEff;
        return 1 + amp;
    }

    function getBlackHoleWaveMult() {
        const p = getBlackHolePhase();
        if (p < 4 || p >= 6) return 1;
        return Date.now() <= (getS().phase4WaveActiveUntilMs || 0) ? BLACK_HOLE_PHASE4_WAVE_BOOST_MULT : 1;
    }

    function getBlackHolePhase5ShorterOrbitMult() {
        return getBlackHolePhase5ShorterOrbitMultRule(getS());
    }

    function getBlackHoleNextDigestDurationMs() {
        return Math.max(60 * 1000, Math.floor(BLACK_HOLE_DIGEST_BASE_MS * getBlackHolePhase5ShorterOrbitMult()));
    }

    function getBlackHolePhase5DigestDurationMsSafe() {
        const raw = Number(getS().phase5DigestDurationMs);
        return Number.isFinite(raw) && raw > 0 ? raw : getBlackHoleNextDigestDurationMs();
    }

    function getBlackHolePhase5MutationLevel(kind) {
        return getBlackHolePhase5MutationLevelRule(getS(), kind);
    }

    function getBlackHolePhase5HotterCoreMult() {
        return getBlackHolePhase5HotterCoreMultRule(getS());
    }

    function getBlackHolePhase5DigestProgressAt(nowMs) {
        return getBlackHolePhase5DigestProgressAtRule(getS(), nowMs, getBlackHolePhase5DigestDurationMsSafe());
    }

    function getBlackHolePhase5DigestProgress() {
        return getBlackHolePhase5DigestProgressAt(Date.now());
    }

    function getBlackHolePhase5DigestCurve(progress) {
        return getBlackHolePhase5DigestCurveRule(progress);
    }

    function getBlackHolePhase5EffectiveFurnacePower() {
        return getBlackHolePhase5EffectiveFurnacePowerRule(getS(), getBlackHolePhase(), getBlackHolePhase5DigestProgress());
    }

    function getBlackHoleFurnaceEssenceBonus() {
        return getBlackHoleFurnaceEssenceBonusRule(getS(), getBlackHolePhase(), getBlackHolePhase5EffectiveFurnacePower());
    }

    function getBlackHoleFurnaceMult() {
        return getBlackHoleFurnaceMultRule(getS(), getBlackHolePhase(), getBlackHolePhase5EffectiveFurnacePower());
    }

    function getBlackHoleJetMult() {
        const s = getS();
        if (getBlackHolePhase() < 6 || !s.phase6JetActive) return 1;
        const B = getBlackHolePhase6TrackLevel("boost");
        let frac = 0;
        if (getBlackHolePhase() === 6) {
            const bank = Math.max(0, Math.floor(Number(s.phase6EssenceBank) || 0));
            const c = getBlackHolePhase6NextJetUpgradeCostEssence();
            if (c > 0) frac = Math.min(1, bank / c);
        }
        const bEff = B + frac;
        return 1 + 3 * (1 + 0.15 * bEff);
    }

    let blackHoleTotalMultCacheFp = null;
    let blackHoleTotalMultCacheVal = 1;

    function computeBlackHoleProductionMultFingerprint() {
        const now = Date.now();
        const p = getBlackHolePhase();
        const s = getS();
        return [
            p,
            now,
            Number(s.phase1EssenceSpent) || 0,
            Number(s.phase2Mass) || 0,
            Number(s.phase2EssenceBank) || 0,
            Number(s.phase2CollapseMassTier) || 0,
            Number(s.phase2CollapsePhotonTier) || 0,
            Number(s.phase2CollapseErgosphereTier) || 0,
            Number(s.phase3HawkingActiveUntilMs) || 0,
            Number(s.phase3EssenceBank) || 0,
            getBlackHolePhase3TrackLevel("luminosity"),
            getBlackHolePhase3TrackLevel("viscous"),
            getBlackHolePhase3TrackLevel("coronal"),
            Number(s.phase4WaveActiveUntilMs) || 0,
            Number(s.phase5FurnaceLevel) || 0,
            Number(s.phase5MutationHotterCore) || 0,
            Number(s.phase5MutationEssenceRefinery) || 0,
            Number(s.phase5MutationShorterOrbit) || 0,
            Number(s.phase5DigestStartedAtMs) || 0,
            Number(s.phase5DigestEndsAtMs) || 0,
            Number(s.phase5DigestDurationMs) || 0,
            s.phase6JetActive ? 1 : 0,
            Number(s.phase6EssenceBank) || 0,
            Number(s.phase6JetBoostLevel) || 0,
        ].join("|");
    }

    function recomputeBlackHoleTotalMult() {
        if (!isArcUnlocked()) return 1;
        return (
            getBlackHolePhase2MassMult() *
            getBlackHolePhase1RunCpsMult() *
            getBlackHolePhase2PhotonShellMult() *
            getBlackHoleHawkingMult() *
            getBlackHoleWaveMult() *
            getBlackHoleFurnaceMult() *
            getBlackHoleJetMult()
        );
    }

    function getBlackHoleTotalMult() {
        if (!isArcUnlocked()) {
            blackHoleTotalMultCacheFp = null;
            return 1;
        }
        const fp = computeBlackHoleProductionMultFingerprint();
        if (fp === blackHoleTotalMultCacheFp) return blackHoleTotalMultCacheVal;
        blackHoleTotalMultCacheFp = fp;
        blackHoleTotalMultCacheVal = recomputeBlackHoleTotalMult();
        return blackHoleTotalMultCacheVal;
    }

    function getBlackHolePersistentMultForOffline() {
        if (!isArcUnlocked()) return 1;
        const s = getS();
        const jetMult = getBlackHolePhase() >= 6 && s.phase6JetActive ? getBlackHoleJetMult() : 1;
        return (
            getBlackHolePhase2MassMult() *
            getBlackHolePhase1RunCpsMult() *
            getBlackHolePhase2PhotonShellMult() *
            getBlackHoleFurnaceMult() *
            jetMult
        );
    }

    function getBlackHoleOfflineTimedBuffAverageMult(dtSec) {
        const p = getBlackHolePhase();
        if (!(dtSec > 0) || p < 3 || p >= 6) return 1;
        let hawkingAvg = 1;
        if (p >= 3) {
            const f = p === 3 ? getBlackHolePhase3UpgradeFrac() : 0;
            const cd = Math.max(4, 18 - (getBlackHolePhase3TrackLevel("viscous") + f) - getBlackHolePhase2PhotonHawkingCdTrimSec());
            const dur = 5 + getBlackHolePhase3TrackLevel("coronal") + f;
            const amp = 0.25 + 0.1 * (getBlackHolePhase3TrackLevel("luminosity") + f);
            const uptime = Math.max(0, Math.min(1, dur / cd));
            hawkingAvg = 1 + amp * uptime;
        }
        let waveAvg = 1;
        if (p >= 4) {
            const iv = Math.max(1, getBlackHoleWaveIntervalSec());
            const uptime = Math.max(0, Math.min(1, BLACK_HOLE_PHASE4_WAVE_BOOST_DURATION_SEC / iv));
            waveAvg = 1 + (BLACK_HOLE_PHASE4_WAVE_BOOST_MULT - 1) * uptime;
        }
        return hawkingAvg * waveAvg;
    }

    function getBlackHoleOfflineProductionMult(dtSec) {
        return getBlackHolePersistentMultForOffline() * getBlackHoleOfflineTimedBuffAverageMult(dtSec);
    }

    function getNumber1BlackHoleProductionMult() {
        return getBlackHoleTotalMult();
    }

    const phase5StokeStopRm = deps.phase5StokeMinRemainingMs != null ? deps.phase5StokeMinRemainingMs : 8000;

    function completeBlackHolePhaseTransition(nextPhase, message) {
        const s = getS();
        const from = clampBlackHolePhaseRule(s.phase);
        if (nextPhase <= from) return;
        s.phase = nextPhase;
        const ux = deps.getBlackHoleUxFlags();
        if (nextPhase >= 3) s.phase2EssenceBank = 0;
        if (nextPhase >= 4) s.phase3EssenceBank = 0;
        if (nextPhase >= 5) s.phase4EssenceBank = 0;
        if (nextPhase >= 7) s.phase6EssenceBank = 0;
        deps.syncBlackHolePhase1Vfx();
        deps.updateN1GravityCpsStrip();
        deps.updateRateDisplay();
        if (message) deps.addToLog(message, "milestone");
        if (nextPhase === 2) {
            deps.triggerBlackHolePhase1CollapseVfx();
            deps.showStoryBannerById("black-hole-phase-1-collapse");
        }
        if (nextPhase === 3) deps.showStoryBannerById("black-hole-phase-2-disk");
        if (nextPhase === 4) deps.showStoryBannerById("black-hole-phase-3-wave");
        if (nextPhase === 5) deps.showStoryBannerById("black-hole-phase-4-furnace");
        if (nextPhase === 6) {
            deps.playBlackHoleScreenEffect("sacrifice");
            deps.showStoryBannerById("black-hole-phase-5-jets");
        }
        if (nextPhase === 7) {
            deps.playBlackHoleScreenEffect("evaporation");
            deps.showStoryBannerById("black-hole-phase-6-evaporation");
        }
        if (nextPhase === 2) {
            deps.addToLog(
                "Tip: buy three collapse upgrades to tier 3 each, then pour Essence into mass.",
                "tip"
            );
            deps.addToLog(
                "Tip: Collapse gravity accelerates autobuy—each tick buys every upgrade that hand can afford.",
                "tip"
            );
        }
        if (nextPhase === 3)
            deps.addToLog("Tip: Hawking bursts are brief. Time your pushes around burst windows.", "tip");
        if (nextPhase === 4)
            deps.addToLog(
                "Tip: Gravitational Wave can be fired manually at half-interval timing.",
                "tip"
            );
        if (nextPhase === 5)
            deps.addToLog(
                "Tip: sacrifices are permanent. Feed hands in order 10 -> 1. Use Essence to accelerate digestion.",
                "tip"
            );
        if (nextPhase === 6)
            deps.addToLog(
                "Tip: Hawking and lensing are now silent. Jets are your primary burst window.",
                "tip"
            );
        if (nextPhase === 7) deps.addToLog("The upgrades fall silent. Count on.", "milestone");
        const nowTs = Date.now();
        if (nextPhase === 3 && !(s.phase3NextHawkingAtMs > 0)) s.phase3NextHawkingAtMs = nowTs + 12000;
        if (nextPhase === 4) {
            const ivMs = Math.round(getBlackHoleWaveIntervalSec() * 1000);
            s.phase4NextWaveAtMs = nowTs + ivMs;
            s.phase4ManualReadyAtMs = nowTs + Math.round(ivMs * 0.5);
            ux.waveReadyAnnounced = false;
        }
        if (nextPhase === 5 && !(s.phase5NextSacrificeHand > 0)) {
            s.phase5NextSacrificeHand = 10;
            ux.digestReadyAnnounced = true;
        }
        if (nextPhase === 6) {
            s.phase3HawkingActiveUntilMs = 0;
            s.phase4WaveActiveUntilMs = 0;
            ux.jetReadyAnnounced = false;
            ux.jetDryAnnounced = false;
        }
        deps.autosaveNow();
        deps.queueBlackHoleUiRefresh();
    }

    function tryBuyBlackHolePhase2CollapseUpgrade(track) {
        if (!hasAscended()) return;
        if (!isArcUnlocked()) {
            deps.addToLog("Complete every ascension map node first.", "warning");
            return;
        }
        if (getBlackHolePhase() !== 2) return;
        if (track !== "mass" && track !== "photon" && track !== "ergosphere") return;
        const cost = getBlackHolePhase2CollapseUpgradeCost(track);
        if (!(cost > 0)) return;
        const haveEss = Math.max(0, Math.floor(Number(deps.getNumber1AscensionEssence()) || 0));
        if (haveEss < cost) {
            deps.addToLog("Need " + deps.formatCount(cost) + " Ascension Essence for this upgrade.", "warning");
            return;
        }
        const s = getS();
        let cur = 0;
        let name = "";
        const maxTier = getBlackHolePhase2CollapseMaxTier();
        if (track === "mass") {
            cur = getBlackHolePhase2CollapseMassTier();
            name = "Essence–mass coupling";
            if (cur >= maxTier) return;
            s.phase2CollapseMassTier = cur + 1;
        } else if (track === "photon") {
            cur = getBlackHolePhase2CollapsePhotonTier();
            name = "Photon shell";
            if (cur >= maxTier) return;
            s.phase2CollapsePhotonTier = cur + 1;
            deps.syncBlackHolePhase2PhotonCombos?.();
        } else if (track === "ergosphere") {
            cur = getBlackHolePhase2CollapseErgosphereTier();
            name = "Ergosphere coupling";
            if (cur >= maxTier) return;
            s.phase2CollapseErgosphereTier = cur + 1;
            if (getBlackHolePhase2ErgosphereTurboDefaultOnRule(s) && deps.getTurboBoostUnlocked?.()) {
                deps.setTurboBoostEnabled?.(true);
                deps.syncTurboBoostToggleDomFromBoot?.(true);
            }
        } else {
            return;
        }
        deps.setNumber1AscensionEssence(haveEss - cost);
        const parallelAdded = addBlackHolePhase2ParallelBonusFromEssence(cost);
        const parallelNote =
            parallelAdded > 0 ? (" · parallel pool +" + (parallelAdded * 100).toFixed(2) + "%") : "";
        deps.addToLog(name + " → tier " + (cur + 1) + "/" + maxTier + parallelNote + ".", "system");
        if (isBlackHolePhase2MassPourUnlocked()) {
            deps.addToLog("Singularity accepts direct mass feeds. Pour Essence when you are ready.", "milestone");
        }
        deps.autosaveNow();
        deps.queueBlackHoleUiRefresh();
        deps.updateRateDisplay();
    }

    function tryBuyBlackHolePhase3DiskUpgrade(track) {
        if (!hasAscended() || getBlackHolePhase() !== 3) return;
        if (track !== "luminosity" && track !== "viscous" && track !== "coronal") return;
        const cost = getBlackHolePhase3TrackCost(track);
        if (!(cost > 0)) return;
        const haveEss = Math.max(0, Math.floor(Number(deps.getNumber1AscensionEssence()) || 0));
        if (haveEss < cost) {
            deps.addToLog("Need " + deps.formatCount(cost) + " Ascension Essence for this disk upgrade.", "warning");
            return;
        }
        deps.setNumber1AscensionEssence(haveEss - cost);
        const s = getS();
        let name = "";
        if (track === "luminosity") {
            s.phase3LuminosityLevel = getBlackHolePhase3TrackLevel(track) + 1;
            name = "Disk luminosity";
        } else if (track === "viscous") {
            s.phase3ViscousLevel = getBlackHolePhase3TrackLevel(track) + 1;
            name = "Viscous accretion";
        } else {
            s.phase3CoronalLevel = getBlackHolePhase3TrackLevel(track) + 1;
            name = "Coronal loop";
        }
        syncBlackHolePhase3LegacyLevel();
        deps.addToLog(name + " → tier " + getBlackHolePhase3TrackLevel(track) + "/6.", "system");
        if (isBlackHolePhase3Complete()) {
            s.phase3EssenceBank = 0;
            completeBlackHolePhaseTransition(4, "Phase 3 complete: lensing active. Phase 4 unlocked.");
        }
        deps.autosaveNow();
        deps.queueBlackHoleUiRefresh();
        deps.updateRateDisplay();
    }

    function tryBuyBlackHolePhase6JetUpgrade(track) {
        if (!hasAscended() || getBlackHolePhase() !== 6) return;
        if (track !== "drain" && track !== "boost" && track !== "bank") return;
        const cost = getBlackHolePhase6TrackCost(track);
        const haveEss = Math.max(0, Math.floor(Number(deps.getNumber1AscensionEssence()) || 0));
        if (haveEss < cost) {
            deps.addToLog("Need " + deps.formatCount(cost) + " Ascension Essence for this jet upgrade.", "warning");
            return;
        }
        deps.setNumber1AscensionEssence(haveEss - cost);
        const s = getS();
        let name = "";
        if (track === "drain") {
            s.phase6JetEfficiencyLevel = getBlackHolePhase6TrackLevel(track) + 1;
            name = "Drain efficiency";
        } else if (track === "boost") {
            s.phase6JetBoostLevel = getBlackHolePhase6TrackLevel(track) + 1;
            name = "Boost multiplier";
        } else {
            s.phase6JetBankLevel = getBlackHolePhase6TrackLevel(track) + 1;
            name = "Boost bank";
        }
        deps.addToLog(name + " → tier " + getBlackHolePhase6TrackLevel(track) + ".", "system");
        deps.autosaveNow();
        deps.queueBlackHoleUiRefresh();
        deps.updateRateDisplay();
    }

    function tryBuyNumber1BlackHole() {
        if (!hasAscended()) return;
        if (!isArcUnlocked()) {
            deps.addToLog("Complete every ascension map node first.", "warning");
            return;
        }
        ensureBlackHoleArcStarted();
        const phase = getBlackHolePhase();
        const s = getS();
        const ux = deps.getBlackHoleUxFlags();

        if (phase === 1) {
            const remaining = Math.max(0, BLACK_HOLE_PHASE1_ESSENCE_TARGET - (s.phase1EssenceSpent || 0));
            if (remaining <= 0) return;
            const haveEss = Math.max(0, Math.floor(Number(deps.getNumber1AscensionEssence()) || 0));
            const spend = Math.min(remaining, haveEss);
            if (spend < 1) {
                deps.addToLog(
                    "Need Ascension Essence to charge the Mass Accumulator. Ascend, then pour it all in here.",
                    "warning"
                );
                return;
            }
            deps.setNumber1AscensionEssence(haveEss - spend);
            s.phase1EssenceSpent = Math.min(BLACK_HOLE_PHASE1_ESSENCE_TARGET, (s.phase1EssenceSpent || 0) + spend);
            deps.addToLog("Mass Accumulator absorbed " + deps.formatCount(spend) + " Essence.", "system");
            if (s.phase1EssenceSpent >= BLACK_HOLE_PHASE1_ESSENCE_TARGET) {
                completeBlackHolePhaseTransition(2, "Phase 1 complete: accumulator collapse. Phase 2 unlocked.");
            }
        } else if (phase === 2) {
            const maxTier = getBlackHolePhase2CollapseMaxTier();
            if (!isBlackHolePhase2MassPourUnlocked()) {
                deps.addToLog(
                    "Max all three collapse channels at tier " + maxTier + " before the next mass pour.",
                    "warning"
                );
                return;
            }
            const L = Math.max(0, Math.min(BLACK_HOLE_PHASE2_MASS_CAP, Math.floor(Number(s.phase2Mass) || 0)));
            if (L >= BLACK_HOLE_PHASE2_MASS_CAP) return;
            const stepCost = getBlackHolePhase2CostAtLevel(L);
            const haveEss = Math.max(0, Math.floor(Number(deps.getNumber1AscensionEssence()) || 0));
            let bank = Math.max(0, Math.floor(Number(s.phase2EssenceBank) || 0));
            const totalAvail = haveEss + bank;
            if (totalAvail < stepCost) {
                deps.addToLog(
                    "Need " + deps.formatCount(stepCost) + " Ascension Essence for the next mass step (have " + deps.formatCount(totalAvail) + ").",
                    "warning"
                );
                return;
            }
            const couplingTier = getBlackHolePhase2CollapseMassTier();
            if (couplingTier <= 0 && typeof deps.confirmPhase2MassPourWithoutCoupling === "function") {
                if (!deps.confirmPhase2MassPourWithoutCoupling(stepCost, totalAvail)) return;
            }
            let remaining = stepCost;
            const fromBank = Math.min(bank, remaining);
            bank -= fromBank;
            remaining -= fromBank;
            const fromPurse = Math.min(haveEss, remaining);
            deps.setNumber1AscensionEssence(haveEss - fromPurse);
            s.phase2EssenceBank = bank;
            const nextL = L + 1;
            s.phase2Mass = nextL;
            if (nextL < BLACK_HOLE_PHASE2_MASS_CAP) {
                s.phase2CollapseMassTier = 0;
                s.phase2CollapsePhotonTier = 0;
                s.phase2CollapseErgosphereTier = 0;
            }
            ux.lastPhase2MassFeedAtMs = Date.now();
            const parallelAdded = addBlackHolePhase2ParallelBonusFromEssence(stepCost);
            const parallelNote =
                parallelAdded > 0 ? (" · parallel pool +" + (parallelAdded * 100).toFixed(2) + "%") : "";
            const resetNote =
                nextL < BLACK_HOLE_PHASE2_MASS_CAP ? " Collapse channels reset for the next cycle." : "";
            deps.addToLog(
                "Mass step " + nextL + "/" + BLACK_HOLE_PHASE2_MASS_CAP + " complete · singularity ×" +
                    deps.formatCount(getBlackHolePhase2MassMult()) + resetNote + parallelNote + ".",
                "milestone"
            );
            deps.triggerBlackHolePhase2StepSurgeVfx?.();
            if (nextL >= BLACK_HOLE_PHASE2_MASS_CAP) {
                s.phase2EssenceBank = 0;
                completeBlackHolePhaseTransition(3, "Phase 2 complete: accretion disk ignites. Phase 3 unlocked.");
            }
        } else if (phase === 3) {
            let st = Math.floor(Number(s.phase3HawkingStrength) || 0);
            if (st >= 6) return;
            const haveEss = Math.max(0, Math.floor(Number(deps.getNumber1AscensionEssence()) || 0));
            if (haveEss < 1) {
                deps.addToLog("Need Ascension Essence for disk upgrades.", "warning");
                return;
            }
            deps.setNumber1AscensionEssence(0);
            let bank = Math.max(0, Math.floor(Number(s.phase3EssenceBank) || 0)) + haveEss;
            while (st < 6) {
                const c = 75 + 25 * st;
                if (bank < c) break;
                bank -= c;
                st++;
            }
            s.phase3HawkingStrength = st;
            s.phase3HawkingRate = st;
            s.phase3HawkingDuration = st;
            s.phase3EssenceBank = bank;
            const nextC = st < 6 ? 75 + 25 * st : 0;
            const bankNote =
                bank > 0 && nextC > 0 ? (" · " + deps.formatCount(bank) + " / " + deps.formatCount(nextC) + " toward next disk tier") : "";
            deps.addToLog("Fed " + deps.formatCount(haveEss) + " Essence into the accretion disk" + bankNote + ".", "system");
            if (st >= 6) {
                s.phase3EssenceBank = 0;
                completeBlackHolePhaseTransition(4, "Phase 3 complete: lensing active. Phase 4 unlocked.");
            }
        } else if (phase === 4) {
            let W = Math.floor(Number(s.phase4WaveLevel) || 0);
            if (W >= 6) return;
            const haveEss = Math.max(0, Math.floor(Number(deps.getNumber1AscensionEssence()) || 0));
            if (haveEss < 1) {
                deps.addToLog("Need Ascension Essence for wave upgrades.", "warning");
                return;
            }
            deps.setNumber1AscensionEssence(0);
            let bank = Math.max(0, Math.floor(Number(s.phase4EssenceBank) || 0)) + haveEss;
            while (W < 6) {
                const c = getBlackHolePhase4NextCostEssenceForWave(W);
                if (bank < c) break;
                bank -= c;
                W++;
            }
            s.phase4WaveLevel = W;
            s.phase4EssenceBank = bank;
            const nextC = W < 6 ? getBlackHolePhase4NextCostEssenceForWave(W) : 0;
            const bankNote =
                bank > 0 && nextC > 0 ? (" · " + deps.formatCount(bank) + " / " + deps.formatCount(nextC) + " toward next wave tier") : "";
            deps.addToLog(
                "Fed " + deps.formatCount(haveEss) + " Essence into gravitational lensing" + bankNote + ".",
                "system"
            );
            if (W >= 6) {
                s.phase4EssenceBank = 0;
                completeBlackHolePhaseTransition(5, "Phase 4 complete: furnace unlocked. Phase 5 unlocked.");
            }
        } else if (phase === 5) {
            if ((s.phase5PendingMutationLevel || 0) > 0) {
                deps.addToLog("Choose the pending Furnace Mutation before stoking or feeding again.", "warning");
                return;
            }
            const digestEnd = s.phase5DigestEndsAtMs || 0;
            if (!(digestEnd > Date.now()) || !(s.phase5DigestHandNumber > 0)) {
                deps.addToLog("Phase 5 has no active digest to accelerate.", "warning");
                return;
            }
            const haveEss = Math.max(0, Math.floor(Number(deps.getNumber1AscensionEssence()) || 0));
            if (haveEss < 1) {
                deps.addToLog("Need Ascension Essence to stoke the furnace.", "warning");
                return;
            }
            const nowDig = Date.now();
            const preview = getBlackHolePhase5StokePreview(haveEss, nowDig);
            if (!preview) {
                deps.addToLog("Phase 5 has no active digest to accelerate.", "warning");
                return;
            }
            const spent = Math.max(0, Math.floor(Number(preview.spentEssence) || 0));
            if (spent < 1) {
                deps.addToLog(
                    "Digestion is already inside the furnace buffer (~" +
                        Math.ceil(phase5StokeStopRm / 1000) +
                        "s or less remaining); Essence wasn't spent.",
                    "warning"
                );
                return;
            }
            deps.setNumber1AscensionEssence(haveEss - spent);
            s.phase5DigestEndsAtMs = preview.digestEndMs;
            s.phase5DigestStartedAtMs = preview.start;
            s.phase5DigestDurationMs = preview.duration;
            const leftSec = Math.max(0, Math.ceil(preview.projectedRemainingMs / 1000));
            const removedSec = Math.max(0, Math.floor(preview.removedMs / 1000));
            const pct = Math.floor(getBlackHolePhase5DigestProgress() * 100);
            let msg =
                "Furnace: spent " +
                deps.formatCount(spent) +
                " Essence (" +
                deps.formatSeconds(removedSec) +
                " removed, " +
                pct +
                "% digested, ~" +
                deps.formatSeconds(leftSec) +
                " remaining).";
            if (spent < haveEss)
                msg +=
                    " (" +
                    deps.formatCount(haveEss - spent) +
                    " Essence untouched — digestion only needed up to ~" +
                    deps.formatSeconds(Math.ceil(phase5StokeStopRm / 1000)) +
                    " left.)";
            deps.addToLog(msg, "system");
        } else if (phase === 6) {
            const haveEss = Math.max(0, Math.floor(Number(deps.getNumber1AscensionEssence()) || 0));
            if (haveEss < 1) {
                deps.addToLog("Need Ascension Essence for jet upgrades.", "warning");
                return;
            }
            deps.setNumber1AscensionEssence(0);
            let bank = Math.max(0, Math.floor(Number(s.phase6EssenceBank) || 0)) + haveEss;
            let B = Math.floor(Number(s.phase6JetBoostLevel) || 0);
            while (true) {
                const c = 300 + 120 * B;
                if (!(c > 0) || bank < c) break;
                bank -= c;
                B++;
                s.phase6JetBoostLevel = B;
                s.phase6JetEfficiencyLevel = B;
                s.phase6JetBankLevel = B;
            }
            s.phase6EssenceBank = bank;
            const nextC = getBlackHolePhase6NextJetUpgradeCostEssence();
            const bankNote =
                bank > 0 && nextC > 0
                    ? (" · " + deps.formatCount(bank) + " / " + deps.formatCount(nextC) + " toward next jet upgrade")
                    : "";
            deps.addToLog("Fed " + deps.formatCount(haveEss) + " Essence into jet systems" + bankNote + ".", "system");
        }
        deps.updateRateDisplay();
        deps.queueBlackHoleUiRefresh();
    }

    function getBlackHolePhase5StokePreview(spendEssence, nowMs) {
        const s = getS();
        const now = Number(nowMs) || Date.now();
        const spendBudget = Math.max(0, Math.floor(Number(spendEssence) || 0));
        const digestEnd = Number(s.phase5DigestEndsAtMs) || 0;
        if (!(digestEnd > now) || !(s.phase5DigestHandNumber > 0)) return null;
        if (spendBudget < 0) return null;

        const oldDuration = getBlackHolePhase5DigestDurationMsSafe();
        const duration = oldDuration;

        if (spendBudget === 0) {
            const start0 = digestEnd - duration;
            const progress0 = Math.max(0, Math.min(1, duration > 0 ? (now - start0) / duration : 0));
            return {
                start: start0,
                digestEndMs: digestEnd,
                duration,
                currentRemainingMs: Math.max(0, digestEnd - now),
                projectedRemainingMs: Math.max(0, digestEnd - now),
                removedMs: 0,
                progress: progress0,
                curved: getBlackHolePhase5DigestCurve(progress0),
                spentEssence: 0,
                unspentBudget: 0,
            };
        }

        const cost = Math.max(25, Math.floor(50 + 20 * (s.phase5FurnaceLevel || 0)));
        const floorMs = Math.max(1000, Math.floor(oldDuration * 0.01));
        const stopRm = phase5StokeStopRm;

        const getStokedRemainingMs = function (remaining, reduction) {
            const rem = Math.max(0, Math.floor(Number(remaining) || 0));
            const red = Math.max(0, Math.floor(Number(reduction) || 0));
            if (rem <= 1 || red <= 0) return rem;
            if (rem <= floorMs) return Math.max(1, rem - red);
            return Math.min(rem, Math.max(floorMs, rem - red));
        };

        let poolRemain = spendBudget;
        let digestEndMs = digestEnd;

        while (poolRemain >= cost && digestEndMs > now) {
            const remaining = digestEndMs - now;
            if (remaining <= stopRm) break;
            const fullRed = Math.max(1, Math.floor(remaining * 0.06));
            let newRm = getStokedRemainingMs(remaining, fullRed);
            if (newRm < stopRm) newRm = stopRm;
            digestEndMs = now + newRm;
            poolRemain -= cost;
        }

        if (poolRemain > 0 && digestEndMs > now && cost > 0) {
            const remaining = digestEndMs - now;
            if (remaining > stopRm) {
                const fullRed = Math.max(1, Math.floor(remaining * 0.06));
                const reduction = Math.max(1, Math.floor(fullRed * Math.min(1, poolRemain / cost)));
                let newRm = getStokedRemainingMs(remaining, reduction);
                if (newRm < stopRm) newRm = stopRm;
                digestEndMs = now + newRm;
                poolRemain = 0;
            }
        }

        const spentEssence = spendBudget - poolRemain;
        const start = digestEndMs - duration;
        const progress = Math.max(0, Math.min(1, duration > 0 ? (now - start) / duration : 0));
        return {
            start,
            digestEndMs,
            duration,
            currentRemainingMs: Math.max(0, digestEnd - now),
            projectedRemainingMs: Math.max(0, digestEndMs - now),
            removedMs: Math.max(0, digestEnd - digestEndMs),
            progress,
            curved: getBlackHolePhase5DigestCurve(progress),
            spentEssence,
            unspentBudget: Math.max(0, poolRemain),
        };
    }

    function triggerBlackHoleWaveManual() {
        if (getBlackHolePhase() < 4 || getBlackHolePhase() >= 6) return;
        const s = getS();
        const ux = deps.getBlackHoleUxFlags();
        const now = Date.now();
        if (now < (s.phase4ManualReadyAtMs || 0)) {
            const waitSec = Math.max(
                0,
                Math.ceil(((s.phase4ManualReadyAtMs || 0) - now) / 1000)
            );
            deps.addToLog("Gravitational Wave is not ready (" + deps.formatSeconds(waitSec) + " remaining).", "warning");
            return;
        }
        s.phase4WaveActiveUntilMs = now + BLACK_HOLE_PHASE4_WAVE_BOOST_DURATION_SEC * 1000;
        const ivMs = Math.round(getBlackHoleWaveIntervalSec() * 1000);
        s.phase4NextWaveAtMs = now + ivMs;
        s.phase4ManualReadyAtMs = now + Math.round(ivMs * 0.5);
        ux.waveReadyAnnounced = false;
        s.phase4WaveTriggered = true;
        deps.playBlackHoleScreenEffect("wave");
        deps.syncBlackHolePhase1Vfx();
        deps.pulseBlackHoleLensingManualBurst();
        deps.addToLog("Manual Gravitational Wave fired (100x for 5s).", "milestone");
    }

    function sacrificeNextHandToFurnace() {
        const s = getS();
        const ux = deps.getBlackHoleUxFlags();
        if (getBlackHolePhase() !== 5) return;
        if ((s.phase5PendingMutationLevel || 0) > 0) {
            deps.addToLog("Choose a Furnace Mutation before feeding the next hand.", "warning");
            return;
        }
        if ((s.phase5DigestEndsAtMs || 0) > Date.now()) {
            const remainSec = Math.max(0, Math.ceil(((s.phase5DigestEndsAtMs || 0) - Date.now()) / 1000));
            deps.addToLog("Digestion is already in progress (" + deps.formatSeconds(remainSec) + " remaining).", "warning");
            return;
        }
        const handNum = Math.max(1, Math.floor(s.phase5NextSacrificeHand || 1));
        const unlockedHands = deps.getUnlockedHands();
        if (handNum <= 1 || unlockedHands <= 1) {
            completeBlackHolePhaseTransition(6, "Only one hand remains. Phase 6 jets unlocked.");
            return;
        }
        if (unlockedHands < handNum) {
            deps.addToLog(
                "Furnace needs Hand " +
                    handNum +
                    ", but it is not unlocked yet. Build this run back to " +
                    handNum +
                    " hands, then feed it.",
                "warning"
            );
            return;
        }
        if (!deps.applyHandSacrifice(handNum)) {
            deps.addToLog(
                "Furnace could not feed Hand " + handNum + " yet. Unlock it first, then try again.",
                "warning"
            );
            return;
        }
        const nowSf = Date.now();
        const duration = getBlackHoleNextDigestDurationMs();
        s.phase5DigestHandNumber = handNum;
        s.phase5DigestStartedAtMs = nowSf;
        s.phase5DigestDurationMs = duration;
        s.phase5DigestEndsAtMs = nowSf + duration;
        s.phase5NextSacrificeHand = handNum - 1;
        ux.digestReadyAnnounced = false;
        deps.playBlackHoleScreenEffect("sacrifice");
        deps.addToLog(
            "Hand " + handNum + " is fed to the furnace. Digestion begins (" + deps.formatSeconds(Math.ceil(duration / 1000)) + ").",
            "milestone"
        );
    }

    function chooseBlackHoleFurnaceMutation(kind) {
        const s = getS();
        if (getBlackHolePhase() !== 5) return;
        if (!(s.phase5PendingMutationLevel > 0)) return;
        const handNum = Math.max(
            1,
            Math.floor(Number(s.phase5PendingMutationHand) || s.phase5LastDigestedHand || 1)
        );
        let label = "";
        if (kind === "hotter-core") {
            s.phase5MutationHotterCore = getBlackHolePhase5MutationLevel("hotter-core") + 1;
            label = "Hotter Core";
        } else if (kind === "essence-refinery") {
            s.phase5MutationEssenceRefinery = getBlackHolePhase5MutationLevel("essence-refinery") + 1;
            label = "Essence Refinery";
        } else if (kind === "shorter-orbit") {
            s.phase5MutationShorterOrbit = getBlackHolePhase5MutationLevel("shorter-orbit") + 1;
            label = "Shorter Orbit";
        } else {
            return;
        }
        s.phase5PendingMutationHand = 0;
        s.phase5PendingMutationLevel = 0;
        deps.addToLog("Furnace Mutation chosen for Hand " + handNum + ": " + label + ".", "milestone");
        deps.playBlackHoleScreenEffect("digest");
        deps.updateRateDisplay();
        deps.updateN1GravityCpsStrip();
        deps.refreshAscensionPanelIfOpen();
        deps.autosaveNow();
        if ((s.phase5NextSacrificeHand || 1) <= 1) {
            completeBlackHolePhaseTransition(6, "Phase 5 complete: jets awakened.");
        }
    }

    function showBlackHoleFurnaceDigestCompletionRitual(handNum, furnaceLevel) {
        const maxH = Math.max(1, Math.floor(Number(deps.getMaxHands()) || 1));
        const h = Math.max(1, Math.min(maxH, Math.floor(Number(handNum) || 1)));
        const level = Math.max(1, Math.floor(Number(furnaceLevel) || 1));
        const echoMult = getBlackHoleFurnaceMult();
        const title = "Hand " + h + " Digested";
        const body =
            "The Gravitational Furnace flares and Hand " +
            h +
            " collapses into an Echo Hand.\n\n" +
            "Echo Hands collected: " +
            level +
            " / 9\n" +
            "Current furnace CPS: x" +
            (echoMult >= 10 ? echoMult.toFixed(2) : echoMult.toFixed(3)) +
            "\n\n" +
            "Choose a Furnace Mutation to claim the reward, then feed the next hand.";
        deps.showStoryBanner(
            {
                id: level === 1 ? "black-hole-first-digest" : "black-hole-digest-hand-" + h,
                order: 1007 + level,
                title,
                body
            },
            {
                onClose: function () {
                    deps.queueBlackHoleUiRefresh();
                    deps.playBlackHoleScreenEffect("digest");
                }
            }
        );
    }

    function tryToggleJet(active) {
        if (getBlackHolePhase() < 6 || getBlackHolePhase() >= 7) return;
        const s = getS();
        if (active && (s.phase6JetCharge || 0) <= 0) {
            deps.addToLog("Jet cannot ignite: no charge. Let the battery refill.", "warning");
            return;
        }
        s.phase6JetActive = !!active;
        if (s.phase6JetActive) s.phase6JetIgnited = true;
        deps.syncBlackHolePhase1Vfx();
        deps.addToLog(s.phase6JetActive ? "Jet ignition: ON." : "Jet ignition: OFF.", "milestone");
    }

    /** Lensing ripple cadence throttle (formerly in legacy-boot). */
    let blackHoleLensRippleCssLastMs = 0;
    let blackHoleLensRippleLastIv = 0;

    function resetPhase4LensingRippleThrottle() {
        blackHoleLensRippleCssLastMs = 0;
        blackHoleLensRippleLastIv = 0;
    }

    function updateBlackHolePhaseStep(dtSec) {
        if (!(dtSec > 0)) return;
        if (!isArcUnlocked()) return;
        ensureBlackHoleArcStarted();
        const now = Date.now();
        const phase = getBlackHolePhase();
        const s = getS();
        const ux = deps.getBlackHoleUxFlags();

        if (phase === 2 || phase > 2) {
            const ergoRate = getBlackHolePhase2ErgosphereTurboPassivePerSecRule(s);
            if (ergoRate > 0 && deps.getTurboBoostUnlocked?.()) {
                const needsOn = getBlackHolePhase2ErgosphereTurboPassiveRequiresOnRule(s);
                const turboOn = deps.getTurboBoostEnabled?.();
                const levelerOk =
                    getBlackHolePhase2ErgosphereTurboLevelerPassiveRule(s) &&
                    typeof deps.isTurboLevelerMode === "function" &&
                    deps.isTurboLevelerMode();
                const mayFill = (!needsOn || turboOn) && (turboOn || levelerOk);
                const meter = deps.getTurboBoostMeter();
                if (mayFill && (meter > 0 || !needsOn)) {
                    deps.setTurboBoostMeter(
                        Math.min(deps.getTurboMeterMax(), Math.max(meter, 0) + ergoRate * dtSec)
                    );
                }
            }
        }

        if (phase >= 3 && phase < 6) {
            const f = phase === 3 ? getBlackHolePhase3UpgradeFrac() : 0;
            const baseCd = Math.max(4, 18 - (getBlackHolePhase3TrackLevel("viscous") + f) - getBlackHolePhase2PhotonHawkingCdTrimSec());
            if (!(s.phase3NextHawkingAtMs > 0)) s.phase3NextHawkingAtMs = now + baseCd * 1000;
            if (now >= s.phase3NextHawkingAtMs) {
                const durSec = 5 + getBlackHolePhase3TrackLevel("coronal") + f;
                s.phase3HawkingActiveUntilMs = now + durSec * 1000;
                s.phase3NextHawkingAtMs = now + baseCd * 1000;
                deps.playBlackHoleScreenEffect("hawking");
                deps.syncBlackHolePhase1Vfx();
            }
        }

        if (phase >= 4 && phase < 6) {
            const root = deps.getNumber1StageRootEl();
            if (root && isArcUnlocked()) {
                const ivLens = Math.max(8, getBlackHoleWaveIntervalSec());
                root.style.setProperty("--bh-lens-period", ivLens + "s");
                const ivDelta = Math.abs(ivLens - blackHoleLensRippleLastIv);
                const rippleDelaySyncMs = 320;
                if (ivDelta > 0.051 || !blackHoleLensRippleLastIv || now - blackHoleLensRippleCssLastMs >= rippleDelaySyncMs) {
                    blackHoleLensRippleCssLastMs = now;
                    blackHoleLensRippleLastIv = ivLens;
                    const nextAt = s.phase4NextWaveAtMs || 0;
                    let remSec = nextAt > now ? (nextAt - now) / 1000 : 0;
                    if (remSec > ivLens) remSec = ivLens;
                    const elapsedLens = Math.max(0, ivLens - remSec);
                    root.style.setProperty("--bh-lens-ripple-delay", (-elapsedLens) + "s");
                }
            }
            const ivMs = Math.round(getBlackHoleWaveIntervalSec() * 1000);
            if (!(s.phase4NextWaveAtMs > 0)) s.phase4NextWaveAtMs = now + ivMs;
            if (now >= s.phase4NextWaveAtMs) {
                s.phase4WaveActiveUntilMs = now + BLACK_HOLE_PHASE4_WAVE_BOOST_DURATION_SEC * 1000;
                s.phase4NextWaveAtMs = now + ivMs;
                s.phase4WaveTriggered = true;
                deps.playBlackHoleScreenEffect("wave");
                deps.pulseBlackHoleLensingAutoTick();
                deps.syncBlackHolePhase1Vfx();
                if (now >= (s.phase4ManualReadyAtMs || 0)) {
                    s.phase4ManualReadyAtMs = now + Math.round(ivMs * 0.5);
                }
                ux.waveReadyAnnounced = false;
            }
            if (!ux.waveReadyAnnounced && now >= (s.phase4ManualReadyAtMs || 0)) {
                deps.addToLog("Gravitational Wave manual trigger is ready.", "tip");
                ux.waveReadyAnnounced = true;
            }
        }

        if (phase === 5) {
            const digestEnd = s.phase5DigestEndsAtMs || 0;
            if (digestEnd > 0 && now >= digestEnd) {
                const completedHand = Math.max(
                    1,
                    Math.floor(Number(s.phase5DigestHandNumber) || s.phase5NextSacrificeHand + 1 || 1)
                );
                s.phase5DigestEndsAtMs = 0;
                s.phase5DigestStartedAtMs = 0;
                s.phase5DigestDurationMs = 0;
                s.phase5DigestHandNumber = 0;
                s.phase5DigestedHands = (s.phase5DigestedHands || 0) + 1;
                s.phase5FurnaceLevel = (s.phase5FurnaceLevel || 0) + 1;
                s.phase5PendingMutationHand = completedHand;
                s.phase5PendingMutationLevel = s.phase5FurnaceLevel;
                s.phase5LastDigestedHand = completedHand;
                s.phase5LastDigestCompletedAtMs = now;
                deps.addToLog(
                    "Hand " + completedHand + " digestion complete. Echo Hand formed — choose a Furnace Mutation.",
                    "milestone"
                );
                showBlackHoleFurnaceDigestCompletionRitual(completedHand, s.phase5FurnaceLevel);
                ux.digestReadyAnnounced = true;
                deps.autosaveNow();
            }
            const passiveMeterPerSec = Math.max(0, 0.5 * getBlackHolePhase5EffectiveFurnacePower());
            if (passiveMeterPerSec > 0) {
                deps.setTurboBoostMeter(
                    Math.min(deps.getTurboMeterMax(), deps.getTurboBoostMeter() + passiveMeterPerSec * dtSec)
                );
            }
        }

        if (phase >= 6 && phase < 7) {
            const best = Math.max(0, Number(s.phase6JetBestAscensionEssence) || 0);
            const chargeCap = Math.max(500, best * (0.5 + 0.2 * getBlackHolePhase6TrackLevel("bank")));
            const batteryPerSec = Math.max(1, best * 0.01);
            s.phase6JetCharge = Math.min(chargeCap, (s.phase6JetCharge || 0) + batteryPerSec * dtSec);

            let ess = deps.getNumber1AscensionEssence();

            if (s.phase6JetActive) {
                const eff = 1 + 0.15 * getBlackHolePhase6TrackLevel("drain");
                const burn = (20 + 4 * getBlackHolePhase6TrackLevel("boost")) / eff;
                const fuelNeed = burn * dtSec;
                const fromTank = Math.min(s.phase6JetCharge || 0, fuelNeed);
                s.phase6JetCharge = Math.max(0, (s.phase6JetCharge || 0) - fromTank);
                const remainder = Math.max(0, fuelNeed - fromTank);
                if (remainder > 0 && ess > 0) {
                    const fromEssence = Math.min(ess, Math.ceil(remainder));
                    ess -= fromEssence;
                    deps.setNumber1AscensionEssence(ess);
                }
                if (s.phase6JetCharge <= 0 && deps.getNumber1AscensionEssence() <= 0) {
                    s.phase6JetActive = false;
                    if (!ux.jetDryAnnounced) {
                        deps.addToLog(
                            "Jet fuel depleted. Battery recharging; no Ascension Essence remains for emergency burn.",
                            "warning"
                        );
                        ux.jetDryAnnounced = true;
                    }
                }
            } else {
                const charge = s.phase6JetCharge || 0;
                const bestForReady = Math.max(0, Number(s.phase6JetBestAscensionEssence) || 0);
                const readyFloor = Math.max(100, bestForReady * 0.08);
                if (!ux.jetReadyAnnounced && charge >= readyFloor) {
                    deps.addToLog("Jet charge is ready. Ignite when you want a burst window.", "tip");
                    ux.jetReadyAnnounced = true;
                    ux.jetDryAnnounced = false;
                }
            }
        }

        if (phase >= 6 && deps.getTotalChanges() >= BLACK_HOLE_EVAPORATION_CAP) {
            s.phase = 7;
            s.phase7EnteredAtMs = now;
            s.phase7EpilogueCounter = 0;
            s.evaporationComplete = true;
            deps.enterBlackHolePhase7GameplayReset();
            deps.addToLog("Phase 7 reached. Evaporation begins. The epilogue counter is active.", "milestone");
            deps.playBlackHoleScreenEffect("evaporation");
        }

        if (phase === 7) {
            s.phase7EpilogueCounter += dtSec;
        }
    }

    return {
        addBlackHolePhase2ParallelBonusFromEssence,
        chooseBlackHoleFurnaceMutation,
        completeBlackHolePhaseTransition,
        ensureBlackHoleArcStarted,
        formatBlackHolePhase1CpsMultForUi,
        getArcEssenceMultiplierBonusPhraseLower,
        getArcEssenceMultiplierBonusPhraseTitle,
        getBlackHoleFurnaceEssenceBonus,
        getBlackHoleFurnaceMult,
        getBlackHoleHawkingMult,
        getBlackHoleJetMult,
        getBlackHoleNextDigestDurationMs,
        getBlackHoleOfflineProductionMult,
        getBlackHoleOfflineTimedBuffAverageMult,
        getBlackHolePersistentMultForOffline,
        getBlackHolePhase,
        getBlackHolePhase1AscensionEssenceMult,
        getBlackHolePhase1FillRatio,
        getBlackHolePhase1RunCpsMult,
        getBlackHolePhase1SlowdownCapBonus,
        getBlackHolePhase2CollapseErgosphereTier,
        getBlackHolePhase2CollapseMassTier,
        getBlackHolePhase2CollapseMaxTier,
        getBlackHolePhase2CollapsePhotonTier,
        getBlackHolePhase2CollapseUpgradeCost,
        getBlackHolePhase2CostAtLevel,
        getBlackHolePhase2MassCouplingCostMult,
        getBlackHolePhase2MassMult,
        getBlackHolePhase2MassMultAfterNextPour,
        getBlackHolePhase2NextCostEssence,
        getBlackHolePhase2PhotonHawkingCdTrimSec,
        getBlackHolePhase2PhotonShellMult,
        getBlackHolePhase3TrackCost,
        getBlackHolePhase3TrackLevel,
        getBlackHolePhase3UpgradeFrac,
        getBlackHolePhase4NextCostEssence,
        getBlackHolePhase4NextCostEssenceForWave,
        getBlackHolePhase5DigestCurve,
        getBlackHolePhase5DigestDurationMsSafe,
        getBlackHolePhase5DigestProgress,
        getBlackHolePhase5DigestProgressAt,
        getBlackHolePhase5EffectiveFurnacePower,
        getBlackHolePhase5HotterCoreMult,
        getBlackHolePhase5MutationLevel,
        getBlackHolePhase5StokePreview,
        getBlackHolePhase6NextJetUpgradeCostEssence,
        getBlackHolePhase6TrackCost,
        getBlackHolePhase6TrackLevel,
        getBlackHoleTotalMult,
        getBlackHoleWaveIntervalSec,
        getBlackHoleWaveMult,
        getGravityStackTooltipPhrase,
        getNumber1BlackHoleProductionMult,
        getTotalProductionMultLabelForPanel,
        hasBlackHoleProgressLockingRespec,
        isBlackHolePhase2MassPourUnlocked,
        isBlackHolePhase3Complete,
        resetPhase4LensingRippleThrottle,
        sacrificeNextHandToFurnace,
        syncBlackHolePhase3LegacyLevel,
        triggerBlackHoleWaveManual,
        tryBuyBlackHolePhase2CollapseUpgrade,
        tryBuyBlackHolePhase3DiskUpgrade,
        tryBuyBlackHolePhase6JetUpgrade,
        tryBuyNumber1BlackHole,
        tryStartNumber1BlackHoleArc,
        tryToggleJet,
        updateBlackHolePhaseStep,
        useBlackHolePlayerTerminology
    };
}

/** Indirection so tests can `vi.spyOn(blackHoleControllerCreate, "create")` without splitting this file. */
export const blackHoleControllerCreate = { create: createNumber1BlackHoleController };

/* ---------------------------------------------------------
   Black hole boot — UI bridge + façade (wires controller above)
--------------------------------------------------------- */

/**
 * Wires controller + BH UI bridge behind a single façade (`create*` + deps batches).
 *
 * @param {object} dep
 * @param {(bhUiBridge: object) => object} dep.getBlackHoleControllerDeps partial controller deps wired to bhUiBridge
 * @param {(ctx: {{ ctl: object, syncPhase1MassFillCssVars: () => void, getMaxSlowdownLevelCap: () => number }}) => object} dep.getBlackHoleUiDeps deps for {@link createNumber1BlackHoleUi}
 * @param {number} dep.maxSlowdownLevelBase baseline cap before Phase 1 bonus (typically `MAX_SLOWDOWN_LEVEL`)
 * @param {{ documentElement?: unknown } | null | undefined} [dep.rootDocument]
 */
export function createNumber1BlackHoleBoot(dep) {
    const { getBlackHoleControllerDeps, getBlackHoleUiDeps, maxSlowdownLevelBase, rootDocument } = dep;
    const bhUiBridge = {};

    const ctl = blackHoleControllerCreate.create(getBlackHoleControllerDeps(bhUiBridge));

    function syncPhase1MassFillCssVars() {
        const doc = rootDocument || (typeof document !== "undefined" ? document : null);
        syncPhase1MassFillCssVarsInRoot(doc, ctl.getBlackHolePhase1FillRatio());
    }

    function getMaxSlowdownLevelCap() {
        return maxSlowdownLevelBase + ctl.getBlackHolePhase1SlowdownCapBonus();
    }

    Object.assign(
        bhUiBridge,
        createNumber1BlackHoleUi(getBlackHoleUiDeps({ ctl, syncPhase1MassFillCssVars, getMaxSlowdownLevelCap }))
    );

    return {
        controller: ctl,

        bhUiBridge,

        getBlackHolePhase: () => ctl.getBlackHolePhase(),
        useBlackHolePlayerTerminology: () => ctl.useBlackHolePlayerTerminology(),
        getArcEssenceMultiplierBonusPhraseLower: () => ctl.getArcEssenceMultiplierBonusPhraseLower(),
        getArcEssenceMultiplierBonusPhraseTitle: () => ctl.getArcEssenceMultiplierBonusPhraseTitle(),
        getTotalProductionMultLabelForPanel: () => ctl.getTotalProductionMultLabelForPanel(),
        getGravityStackTooltipPhrase: () => ctl.getGravityStackTooltipPhrase(),
        ensureBlackHoleArcStarted: () => ctl.ensureBlackHoleArcStarted(),
        tryStartNumber1BlackHoleArc: () => ctl.tryStartNumber1BlackHoleArc(),
        hasBlackHoleProgressLockingRespec: () => ctl.hasBlackHoleProgressLockingRespec(),

        getBlackHolePhase2CollapseMassTier: () => ctl.getBlackHolePhase2CollapseMassTier(),
        getBlackHolePhase2CollapseMaxTier: () => ctl.getBlackHolePhase2CollapseMaxTier(),
        getBlackHolePhase2CollapsePhotonTier: () => ctl.getBlackHolePhase2CollapsePhotonTier(),
        getBlackHolePhase2CollapseErgosphereTier: () => ctl.getBlackHolePhase2CollapseErgosphereTier(),
        isBlackHolePhase2MassPourUnlocked: () => ctl.isBlackHolePhase2MassPourUnlocked(),
        getBlackHolePhase2MassCouplingCostMult: () => ctl.getBlackHolePhase2MassCouplingCostMult(),
        getBlackHolePhase2PhotonShellMult: () => ctl.getBlackHolePhase2PhotonShellMult(),
        getBlackHolePhase2PhotonHawkingCdTrimSec: () => ctl.getBlackHolePhase2PhotonHawkingCdTrimSec(),
        getBlackHolePhase2CollapseUpgradeCost: track => ctl.getBlackHolePhase2CollapseUpgradeCost(track),
        getBlackHolePhase2CostAtLevel: L => ctl.getBlackHolePhase2CostAtLevel(L),
        getBlackHolePhase2MassMult: () => ctl.getBlackHolePhase2MassMult(),
        getBlackHolePhase2MassMultAfterNextPour: () => ctl.getBlackHolePhase2MassMultAfterNextPour(),
        getBlackHolePhase2NextCostEssence: () => ctl.getBlackHolePhase2NextCostEssence(),
        addBlackHolePhase2ParallelBonusFromEssence: spentEssence =>
            ctl.addBlackHolePhase2ParallelBonusFromEssence(spentEssence),
        getBlackHolePhase3UpgradeFrac: () => ctl.getBlackHolePhase3UpgradeFrac(),
        getBlackHolePhase4NextCostEssenceForWave: w => ctl.getBlackHolePhase4NextCostEssenceForWave(w),
        getBlackHolePhase4NextCostEssence: () => ctl.getBlackHolePhase4NextCostEssence(),
        getBlackHolePhase6NextJetUpgradeCostEssence: () => ctl.getBlackHolePhase6NextJetUpgradeCostEssence(),
        getBlackHolePhase3TrackLevel: track => ctl.getBlackHolePhase3TrackLevel(track),
        getBlackHolePhase3TrackCost: track => ctl.getBlackHolePhase3TrackCost(track),
        syncBlackHolePhase3LegacyLevel: () => ctl.syncBlackHolePhase3LegacyLevel(),
        isBlackHolePhase3Complete: () => ctl.isBlackHolePhase3Complete(),
        getBlackHolePhase6TrackLevel: track => ctl.getBlackHolePhase6TrackLevel(track),
        getBlackHolePhase6TrackCost: track => ctl.getBlackHolePhase6TrackCost(track),
        getBlackHolePhase1FillRatio: () => ctl.getBlackHolePhase1FillRatio(),
        syncPhase1MassFillCssVars,

        getBlackHolePhase1RunCpsMult: () => ctl.getBlackHolePhase1RunCpsMult(),
        formatBlackHolePhase1CpsMultForUi: m => ctl.formatBlackHolePhase1CpsMultForUi(m),
        getBlackHolePhase1AscensionEssenceMult: () => ctl.getBlackHolePhase1AscensionEssenceMult(),
        getBlackHolePhase1SlowdownCapBonus: () => ctl.getBlackHolePhase1SlowdownCapBonus(),
        getMaxSlowdownLevelCap,

        getBlackHoleWaveIntervalSec: () => ctl.getBlackHoleWaveIntervalSec(),
        getBlackHoleHawkingMult: () => ctl.getBlackHoleHawkingMult(),
        getBlackHoleWaveMult: () => ctl.getBlackHoleWaveMult(),
        getBlackHolePhase5DigestDurationMsSafe: () => ctl.getBlackHolePhase5DigestDurationMsSafe(),
        getBlackHolePhase5MutationLevel: kind => ctl.getBlackHolePhase5MutationLevel(kind),
        getBlackHolePhase5HotterCoreMult: () => ctl.getBlackHolePhase5HotterCoreMult(),
        getBlackHolePhase5ShorterOrbitMult: () => ctl.getBlackHolePhase5ShorterOrbitMult(),
        getBlackHolePhase5DigestProgressAt: nowMs => ctl.getBlackHolePhase5DigestProgressAt(nowMs),
        getBlackHolePhase5DigestProgress: () => ctl.getBlackHolePhase5DigestProgress(),
        getBlackHolePhase5DigestCurve: progress => ctl.getBlackHolePhase5DigestCurve(progress),
        getBlackHolePhase5EffectiveFurnacePower: () => ctl.getBlackHolePhase5EffectiveFurnacePower(),
        getBlackHoleFurnaceEssenceBonus: () => ctl.getBlackHoleFurnaceEssenceBonus(),
        getBlackHoleFurnaceMult: () => ctl.getBlackHoleFurnaceMult(),
        getBlackHoleJetMult: () => ctl.getBlackHoleJetMult(),
        getBlackHoleTotalMult: () => ctl.getBlackHoleTotalMult(),
        getBlackHolePersistentMultForOffline: () => ctl.getBlackHolePersistentMultForOffline(),
        getBlackHoleOfflineTimedBuffAverageMult: dtSec => ctl.getBlackHoleOfflineTimedBuffAverageMult(dtSec),
        getBlackHoleOfflineProductionMult: dtSec => ctl.getBlackHoleOfflineProductionMult(dtSec),
        getNumber1BlackHoleProductionMult: () => ctl.getNumber1BlackHoleProductionMult(),

        queueBlackHoleUiRefresh: () => bhUiBridge.queueBlackHoleUiRefresh?.(),
        syncBlackHolePhase4LensingRipples: () => bhUiBridge.syncBlackHolePhase4LensingRipples?.(),
        pulseBlackHoleLensingManualBurst: () => bhUiBridge.pulseBlackHoleLensingManualBurst?.(),
        pulseBlackHoleLensingAutoTick: () => bhUiBridge.pulseBlackHoleLensingAutoTick?.(),
        syncBlackHolePhase1Vfx: () => bhUiBridge.syncBlackHolePhase1Vfx?.(),
        triggerBlackHolePhase1CollapseVfx: () => bhUiBridge.triggerBlackHolePhase1CollapseVfx?.(),
        patchBlackHolePhase1PanelLiveDom: bhEl => bhUiBridge.patchBlackHolePhase1PanelLiveDom?.(bhEl),
        patchBlackHolePhase2PanelLiveDom: bhEl => bhUiBridge.patchBlackHolePhase2PanelLiveDom?.(bhEl),
        patchBlackHolePhase3PanelLiveDom: bhEl => bhUiBridge.patchBlackHolePhase3PanelLiveDom?.(bhEl),
        refreshBlackHolePanelLiveDomIfOpen: () => bhUiBridge.refreshBlackHolePanelLiveDomIfOpen?.(),

        completeBlackHolePhaseTransition: (nextPhase, message) =>
            ctl.completeBlackHolePhaseTransition(nextPhase, message),
        tryBuyBlackHolePhase2CollapseUpgrade: track => ctl.tryBuyBlackHolePhase2CollapseUpgrade(track),
        tryBuyBlackHolePhase3DiskUpgrade: track => ctl.tryBuyBlackHolePhase3DiskUpgrade(track),
        tryBuyBlackHolePhase6JetUpgrade: track => ctl.tryBuyBlackHolePhase6JetUpgrade(track),
        tryBuyNumber1BlackHole: () => ctl.tryBuyNumber1BlackHole(),
        triggerBlackHoleWaveManual: () => ctl.triggerBlackHoleWaveManual(),
        getBlackHoleNextDigestDurationMs: () => ctl.getBlackHoleNextDigestDurationMs(),
        getBlackHolePhase5StokePreview: (spendEssence, nowMs) =>
            ctl.getBlackHolePhase5StokePreview(spendEssence, nowMs),
        sacrificeNextHandToFurnace: () => ctl.sacrificeNextHandToFurnace(),
        chooseBlackHoleFurnaceMutation: kind => ctl.chooseBlackHoleFurnaceMutation(kind),
        tryToggleJet: active => ctl.tryToggleJet(active),
        updateBlackHolePhaseStep: dtSec => ctl.updateBlackHolePhaseStep(dtSec)
    };
}
