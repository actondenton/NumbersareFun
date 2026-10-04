import {
    DEV_SLOWDOWN_AUTOBUY_DELAY,
    getSlowdownMultiplierForLevel
} from "./n1-upgrades.js";
import { createUpgradeTrack } from "./n1-upgrade-track.js";

/** Compaction (slowdown) column UI, purchase, and autobuy; arrays live in boot via deps. */
export function createNumber1SlowdownBoot(deps) {
    function getSlowdownEffectText(level) {
        if (level <= 0) return "No Compaction";
        return (
            "+" +
            deps.formatCount(getSlowdownMultiplierForLevel(level)) +
            "× tick value; digit speed scales with Speed upgrades"
        );
    }

    const track = createUpgradeTrack(
        {
            wrapKey: "slowdownWrapEl",
            btnKey: "slowdownBtn",
            levelKey: "slowdownLevelEl",
            defaultLabel: "Compaction",
            autobuyToastPrefix: "Compact",
            getBaseLevels: deps.getSlowdownLevel,
            getBonusLevels: deps.getSlowdownBonusLevel,
            getCap: deps.getMaxSlowdownLevelCap,
            getCost(_handIndex, nextLevel) {
                return deps.getSlowdownUpgradeCost(nextLevel);
            },
            applyPurchase(handIndex, nextLevel) {
                deps.setSlowdownBaseLevel(handIndex, nextLevel);
            },
            afterPurchase(handIndex) {
                deps.resetSpeedLevelForCompaction(handIndex);
                const targetHand = deps.getHands()[handIndex];
                if (targetHand) targetHand.tickAccBig = 0n;
            },
            isTrackUnlocked: deps.isSlowdownUnlocked,
            onTrackUnlockedUi: deps.onSlowdownUnlockedFirstUi,
            formatEffectAchieved: getSlowdownEffectText,
            formatEffectNext: getSlowdownEffectText,
            formatLog(handNum, lvlNow) {
                return (
                    "Compaction purchased for Hand " +
                    handNum +
                    " (level " +
                    lvlNow +
                    "). Speed level reset."
                );
            },
            devAutobuyOn: deps.devSlowdownAutobuyOn,
            ascensionAutobuyIncludes: deps.ascensionAutobuyIncludesSlowdown,
            devAutobuyDelaySec: DEV_SLOWDOWN_AUTOBUY_DELAY,
            getAutoBuyCountdownByHand: deps.getSlowdownAutoBuyCountdownByHand,
            setAutoBuyCountdown: deps.setSlowdownAutoBuyCountdown
        },
        deps
    );

    return {
        buySlowdownUpgradeForHand: track.buyUpgradeForHand,
        maybeAutoBuySlowdown: track.maybeAutoBuy,
        updateSlowdownUpgradeUI: track.updateUpgradeUI
    };
}
