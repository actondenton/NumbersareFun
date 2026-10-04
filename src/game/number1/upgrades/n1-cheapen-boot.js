import {
    DEV_CHEAPEN_AUTOBUY_DELAY,
    getCheapenEffectTextForAchievedLevel
} from "./n1-upgrades.js";
import { createUpgradeTrack } from "./n1-upgrade-track.js";

/** Cheapen column UI, purchase, and autobuy; arrays + unlock flag live in boot via deps. */
export function createNumber1CheapenBoot(deps) {
    const track = createUpgradeTrack(
        {
            wrapKey: "cheapenWrapEl",
            btnKey: "cheapenBtn",
            levelKey: "cheapenLevelEl",
            defaultLabel: "Cheapen",
            autobuyToastPrefix: "Cheapen",
            gateBuyByTrackUnlock: false,
            gateAutobuyByTrackUnlock: false,
            getBaseLevels: deps.getCheapenLevel,
            getBonusLevels: deps.getCheapenBonusLevel,
            getCap: deps.getMaxCheapenLevel,
            getCost: deps.getCheapenUpgradeCost,
            applyPurchase(handIndex, nextLevel) {
                deps.setCheapenBaseLevel(handIndex, nextLevel);
            },
            isTrackUnlocked: deps.getCheapenSectionUnlocked,
            beforeUpdateUi() {
                const hand1Balance = deps.getHandEarnings(0);
                if (!deps.getCheapenSectionUnlocked() && hand1Balance >= 1000) {
                    deps.setCheapenSectionUnlocked(true);
                    deps.ensureSpeedRows();
                }
            },
            formatEffectAchieved: getCheapenEffectTextForAchievedLevel,
            formatEffectNext: deps.getCheapenEffectText,
            formatLog(handNum, lvlNow) {
                return "Speed cheapen purchased for Hand " + handNum + " (level " + lvlNow + ")";
            },
            devAutobuyOn: deps.devCheapenAutobuyOn,
            ascensionAutobuyIncludes: deps.ascensionAutobuyIncludesCheapen,
            devAutobuyDelaySec: DEV_CHEAPEN_AUTOBUY_DELAY,
            getAutoBuyCountdownByHand: deps.getCheapenAutoBuyCountdownByHand,
            setAutoBuyCountdown: deps.setCheapenAutoBuyCountdown,
            ascAutobuyHandGate() {
                return deps.getCheapenSectionUnlocked();
            }
        },
        deps
    );

    return {
        buyCheapenUpgradeForHand: track.buyUpgradeForHand,
        maybeAutoBuyCheapen: track.maybeAutoBuy,
        updateCheapenUpgradeUI: track.updateUpgradeUI
    };
}
