import { createNumber1BlackHoleController } from "./n1-black-hole-controller.js";
import { createNumber1BlackHoleUi } from "./n1-black-hole-ui.js";
import { syncPhase1MassFillCssVarsInRoot } from "./phase1-tesseract-canvas.js";

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

    const ctl = createNumber1BlackHoleController(getBlackHoleControllerDeps(bhUiBridge));

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
        getBlackHolePhase2CollapsePhotonTier: () => ctl.getBlackHolePhase2CollapsePhotonTier(),
        getBlackHolePhase2CollapseErgosphereTier: () => ctl.getBlackHolePhase2CollapseErgosphereTier(),
        isBlackHolePhase2MassPourUnlocked: () => ctl.isBlackHolePhase2MassPourUnlocked(),
        getBlackHolePhase2MassCouplingAscensionEssenceBonus: () => ctl.getBlackHolePhase2MassCouplingAscensionEssenceBonus(),
        getBlackHolePhase2CollapseUpgradeCost: track => ctl.getBlackHolePhase2CollapseUpgradeCost(track),
        getBlackHolePhase2CostAtLevel: L => ctl.getBlackHolePhase2CostAtLevel(L),
        getBlackHolePhase2MassMult: () => ctl.getBlackHolePhase2MassMult(),
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
        bindBlackHoleUpgradePreviewListeners: pagePanelEl =>
            bhUiBridge.bindBlackHoleUpgradePreviewListeners?.(pagePanelEl),
        afterBlackHolePanelMounted: bhEl => bhUiBridge.afterBlackHolePanelMounted?.(bhEl),

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
