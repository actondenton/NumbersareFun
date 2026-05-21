import fs from "fs";
const extract = fs.readFileSync("src/game/_turbo_extract.txt", "utf8");
const body = extract
    .split("\n")
    .map(l => l.replace(/^    /, ""))
    .join("\n")
    .replace(/\bturboScensionBurnLevel\b/g, "d.getTurboScensionBurnLevel()")
    .replace(/\bturboScensionTankLevel\b/g, "d.getTurboScensionTankLevel()")
    .replace(/\bturboScensionMultLevel\b/g, "d.getTurboScensionMultLevel()")
    .replace(/\bturboScensionFillLevel\b/g, "d.getTurboScensionFillLevel()")
    .replace(/turboScensionBurnLevel\+\+/g, "d.incTurboScensionBurnLevel()")
    .replace(/turboScensionTankLevel\+\+/g, "d.incTurboScensionTankLevel()")
    .replace(/turboScensionMultLevel\+\+/g, "d.incTurboScensionMultLevel()")
    .replace(/turboScensionFillLevel\+\+/g, "d.incTurboScensionFillLevel()")
    .replace(/\bturboBoostMeter\b/g, "turboBoostMeter")
    .replace(/\bturboBoostUnlocked\b/g, "turboBoostUnlocked")
    .replace(/\bturboBoostEnabled\b/g, "turboBoostEnabled")
    .replace(/\bturboActivationCount\b/g, "turboActivationCount")
    .replace(/\bturboLevelerBank\b/g, "turboLevelerBank")
    .replace(/\bturboLevelerPurchases\b/g, "turboLevelerPurchases");

const header = `import {
    GAME_LOOP_MS,
    TURBO_LEVELER_LINE_TOOLTIP,
    TURBO_SCENSION_AXIS_TITLES,
    createNumber1TurboBoot,
    getTurboBoostMultiplierFromTurboState,
    getTurboBurnDrainForStep,
    getTurboComboPointsForMinHands,
    getTurboLevelerNextPointCostForPurchases,
    getTurboNominalBurnPerSecFromState,
    getTurboScensionActivationCostFromTotals,
    getTurboScensionFillMultForLevel,
    getTurboScensionUpgradeRollCountFromTotals
} from "./modules/number1/core.js";
import { formatUpgradeAffordEtaDuration } from "./modules/number1/upgrades.js";

export function wireNumber1TurboMeterBoot(d) {
`;

const footer = `
    return {
        getTurboCountMultiplier,
        getTurboCountMultiplierFromMeter,
        getTurboComboPoints,
        addTurboBoostMeter,
        updateTurboBurn,
        applyTurboPassiveMeterRegen,
        syncUnlocksWithTotalCount,
        tryTurboScensionActivationUpgrade,
        updateTurboBoostUI,
        tryUnlockTurboIfEligible,
        syncTurboBoostToggleDomFromBoot,
        number1TurboBoot,
        getTurboBoostMeter: () => turboBoostMeter,
        setTurboBoostMeter: v => { turboBoostMeter = v; },
        getTurboBoostUnlocked: () => turboBoostUnlocked,
        setTurboBoostUnlocked: v => { turboBoostUnlocked = v; },
        getTurboBoostEnabled: () => turboBoostEnabled,
        setTurboBoostEnabled: v => { turboBoostEnabled = v; }
    };
}
`;

const subs = [
    ["computeAscensionGrantTotals", "d.computeAscensionGrantTotals"],
    ["getTurboMeterMax", "d.getTurboMeterMax"],
    ["getTurboMeterCurveScale", "d.getTurboMeterCurveScale"],
    ["getTurboCountMultiplierMax", "d.getTurboCountMultiplierMax"],
    ["isTurboScensionUnlocked", "d.isTurboScensionUnlocked"],
    ["gameplaySimFrozen", "d.gameplaySimFrozen"],
    ["formatCount", "d.formatCount"],
    ["addToLog", "d.addToLog"],
    ["markMeaningfulProgress", "d.markMeaningfulProgress"],
    ["autosaveNow", "d.autosaveNow"],
    ["updateRateDisplay", "d.updateRateDisplay"],
    ["setUpgradeTooltipText", "d.setUpgradeTooltipText"],
    ["setUpgradeButtonProgress", "d.setUpgradeButtonProgress"],
    ["formatTurboBoostMultiplierForDisplay", "d.formatTurboBoostMultiplierForDisplay"],
    ["formatTurboScensionLevelDisplay", "d.formatTurboScensionLevelDisplay"],
    ["checkUnlockHands", "d.checkUnlockHands"],
    ["forwardCheckStoryBanners", "d.forwardCheckStoryBanners"],
    ["isSlowdownUnlocked", "d.isSlowdownUnlocked"],
    ["isTimeWarpUnlocked", "d.isTimeWarpUnlocked"],
    ["ensureSpeedRows", "d.ensureSpeedRows"],
    ["updateCheapenUpgradeUI", "d.updateCheapenUpgradeUI"],
    ["getHandEarnings", "d.getHandEarnings"],
    ["totalChanges", "d.getTotalChanges()"],
    ["handEarnings", "d.getHandEarnings"],
    ["cheapenSectionUnlocked", "d.getCheapenSectionUnlocked"],
    ["setCheapenSectionUnlocked", "d.setCheapenSectionUnlocked"],
    ["slowdownUnlockLogged", "d.getSlowdownUnlockLogged"],
    ["setSlowdownUnlockLogged", "d.setSlowdownUnlockLogged"],
    ["timeWarpUnlockLogged", "d.getTimeWarpUnlockLogged"],
    ["setTimeWarpUnlockLogged", "d.setTimeWarpUnlockLogged"],
    ["autoBuyUnlocked", "autoBuyUnlocked"],
    ["upgradeContainer", "d.upgradeContainer"],
    ["turboScensionPanelEl", "d.turboScensionPanelEl"],
    ["turboRightClusterEl", "d.turboRightClusterEl"],
    ["turboScensionLevelerLineEl", "d.turboScensionLevelerLineEl"],
    ["turboScensionBurnLineEl", "d.turboScensionBurnLineEl"],
    ["turboScensionTankLineEl", "d.turboScensionTankLineEl"],
    ["turboScensionMultLineEl", "d.turboScensionMultLineEl"],
    ["turboScensionFillLineEl", "d.turboScensionFillLineEl"],
    ["turboScensionUpgradeBtn", "d.turboScensionUpgradeBtn"],
    ["turboBoostFillEl", "d.turboBoostFillEl"],
    ["turboBoostGaugeEl", "d.turboBoostGaugeEl"],
    ["turboBoostWrapEl", "d.turboBoostWrapEl"],
    ["turboBoostMultiplierEl", "d.turboBoostMultiplierEl"],
    ["turboBoostActivationsEl", "d.turboBoostActivationsEl"],
    ["turboBoostEnabledCheckbox", "d.turboBoostEnabledCheckbox"],
    ["turboBoostToggleLabelEl", "d.turboBoostToggleLabelEl"]
];

let code = body;
for (const [from, to] of subs) {
    code = code.split(from).join(to);
}

code = code.replace(/let tryUnlockTurboIfEligible = \(\) => \{\};/, "let tryUnlockTurboIfEligible = () => {};\n    let syncTurboBoostToggleDomFromBoot = () => {};");
code = code.replace(/let syncTurboBoostToggleDomFromBoot = \(\) => \{\};\n    let syncTurboBoostToggleDomFromBoot = \(\) => \{\};/, "let syncTurboBoostToggleDomFromBoot = () => {};");

fs.writeFileSync("src/game/n1-turbo-meter-boot.js", header + code + footer);
console.log("wrote n1-turbo-meter-boot.js");
