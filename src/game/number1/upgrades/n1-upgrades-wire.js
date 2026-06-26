import { createNumber1CheapenBoot } from "./n1-cheapen-boot.js";
import { createNumber1SlowdownBoot } from "./n1-slowdown-boot.js";
import { createNumber1SpeedUpgradeBoot } from "./n1-speed-upgrade-boot.js";

/**
 * Wires speed / cheapen / slowdown upgrade boots and cross-refresh links (Phase 21a).
 *
 * @param {{
 *   slowdown: Parameters<typeof createNumber1SlowdownBoot>[0],
 *   cheapen: Parameters<typeof createNumber1CheapenBoot>[0],
 *   speed: Parameters<typeof createNumber1SpeedUpgradeBoot>[0]
 * }} dep
 */
export function wireNumber1UpgradeBoots(dep) {
    const n1UpgradeCrossRefresh = {
        updateCheapenUpgradeUI() {},
        updateSlowdownUpgradeUI() {}
    };

    const number1SlowdownBoot = createNumber1SlowdownBoot({
        ...dep.slowdown,
        updateCheapenUpgradeUI: () => n1UpgradeCrossRefresh.updateCheapenUpgradeUI()
    });
    const number1CheapenBoot = createNumber1CheapenBoot({
        ...dep.cheapen,
        updateSlowdownUpgradeUI: () => n1UpgradeCrossRefresh.updateSlowdownUpgradeUI()
    });
    const number1SpeedUpgradeBoot = createNumber1SpeedUpgradeBoot({
        ...dep.speed,
        updateCheapenUpgradeUI: () => n1UpgradeCrossRefresh.updateCheapenUpgradeUI(),
        updateSlowdownUpgradeUI: () => n1UpgradeCrossRefresh.updateSlowdownUpgradeUI()
    });

    n1UpgradeCrossRefresh.updateCheapenUpgradeUI = () => { number1CheapenBoot.updateCheapenUpgradeUI(); };
    n1UpgradeCrossRefresh.updateSlowdownUpgradeUI = () => { number1SlowdownBoot.updateSlowdownUpgradeUI(); };

    return {
        number1SlowdownBoot,
        number1CheapenBoot,
        number1SpeedUpgradeBoot,
        buySpeedUpgradeForHand: number1SpeedUpgradeBoot.buySpeedUpgradeForHand,
        maybeAutoBuySpeedUpgrade: number1SpeedUpgradeBoot.maybeAutoBuySpeedUpgrade,
        buyCheapenUpgradeForHand: number1CheapenBoot.buyCheapenUpgradeForHand,
        maybeAutoBuyCheapen: number1CheapenBoot.maybeAutoBuyCheapen,
        updateCheapenUpgradeUI: number1CheapenBoot.updateCheapenUpgradeUI,
        buySlowdownUpgradeForHand: number1SlowdownBoot.buySlowdownUpgradeForHand,
        maybeAutoBuySlowdown: number1SlowdownBoot.maybeAutoBuySlowdown,
        updateSlowdownUpgradeUI: number1SlowdownBoot.updateSlowdownUpgradeUI
    };
}
