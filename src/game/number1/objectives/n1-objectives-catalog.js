/** Short-term count milestones (achieved state lives on each object). */
export const NUMBER1_SHORT_TERM_OBJECTIVES = [
    { goal: 10, text: "Unlock speed increase", achieved: false },
    { goal: 100, text: "Unlocks speed increase auto buyer", achieved: false },
    { goal: 1000, text: "Unlock speed increase Cheapen", achieved: false },
    { goal: 10000, text: "Hand 1 cheapen level 2", achieved: false },
    { goal: 100000, text: "Hand 1 cheapen level 3", achieved: false },
    { goal: 1e6, text: "Hand 1 cheapen level 4", achieved: false },
    { goal: 1e7, text: "Hand 1 cheapen level 5", achieved: false },
    { goal: 1e8, text: "Hand 1 cheapen level 6", achieved: false }
];

/**
 * Long-term objectives including ascension and black-hole arcs (Phase 21c).
 *
 * @param {object} d
 */
export function createNumber1LongTermObjectives(d) {
    return [
        { goal: 1e9, text: "Unlock a second hand", achieved: false },
        { goal: 1e12, text: "Unlock a third hand", achieved: false },
        { goal: 1e12, text: "Unlock Turbo Boost", achieved: false },
        { goal: 1e15, text: "Unlock a fourth hand", achieved: false },
        { goal: 1e18, text: "Unlock a fifth hand", achieved: false },
        { goal: 1e21, text: "Unlock a sixth hand", achieved: false },
        { goal: 1e24, text: "Unlock a seventh hand", achieved: false },
        { goal: 1e27, text: "Unlock a eighth hand", achieved: false },
        { goal: 1e30, text: "Unlock a ninth hand", achieved: false },
        { goal: 1e33, text: "Unlock a tenth hand", achieved: false },
        { id: "ascension-ready", goal: 1e35, text: "Prepare to Ascend", achieved: false },
        { id: "first-ascension", text: "Ascend Number 1 for the first time", achieved: false, isComplete: () => d.ascension.number1HasAscended },
        {
            id: "first-ascension-node",
            text: "Buy your first Ascension node",
            achieved: false,
            isComplete: () => d.ascension.number1AscensionNodeIds.length >= 1,
            getProgress: () => ({
                current: Math.min(d.ascension.number1AscensionNodeIds.length, 1),
                target: 1,
                pct: Math.min(100, (d.ascension.number1AscensionNodeIds.length / 1) * 100),
                label: d.ascension.number1AscensionNodeIds.length + " / 1 node"
            })
        },
        {
            id: "ascension-tree-complete",
            text: "Complete the Ascension tree",
            achieved: false,
            isComplete: () => d.isNumber1AscensionTreeFullyPurchased(),
            getProgress: () => {
                const total = Math.max(1, Array.isArray(d.ascensionMapNodes) ? d.ascensionMapNodes.length : 1);
                const owned = Math.min(total, d.ascensionPurchasedSet().size);
                return { current: owned, target: total, pct: Math.max(0, Math.min(100, (owned / total) * 100)), label: owned + " / " + total + " nodes" };
            }
        },
        {
            id: "bh-mass-pour",
            text: "Pour Essence into the Mass Accumulator",
            achieved: false,
            isComplete: () => d.getBlackHolePhase() >= 2 || Math.floor(Number(d.blackHole.number1BlackHoleState.phase1EssenceSpent) || 0) > 0,
            getProgress: () => {
                const spent = Math.max(0, Math.floor(Number(d.blackHole.number1BlackHoleState.phase1EssenceSpent) || 0));
                return {
                    current: spent,
                    target: d.blackHolePhase1EssenceTarget,
                    pct: d.getBlackHolePhase() >= 2 ? 100 : Math.max(0, Math.min(100, (spent / d.blackHolePhase1EssenceTarget) * 100)),
                    label: d.formatCount(spent) + " / " + d.formatCount(d.blackHolePhase1EssenceTarget) + " Essence"
                };
            }
        },
        {
            id: "bh-phase2",
            text: "Collapse the Mass Accumulator",
            achieved: false,
            isComplete: () => d.getBlackHolePhase() >= 2,
            getProgress: () => ({
                pct: d.getBlackHolePhase() >= 2 ? 100 : d.getBlackHolePhase1FillRatio() * 100,
                label: Math.floor(d.getBlackHolePhase1FillRatio() * 100) + "% charged"
            })
        },
        {
            id: "bh-phase2-tracks",
            text: "Stabilize all collapse tracks",
            achieved: false,
            isComplete: () => d.getBlackHolePhase() >= 3 || d.isBlackHolePhase2MassPourUnlocked(),
            getProgress: () => {
                const total = d.blackHolePhase2CollapseMaxTier * 3;
                const tiers = d.getBlackHolePhase2CollapseMassTier() + d.getBlackHolePhase2CollapsePhotonTier() + d.getBlackHolePhase2CollapseErgosphereTier();
                return { current: tiers, target: total, pct: d.getBlackHolePhase() >= 3 ? 100 : Math.max(0, Math.min(100, (tiers / total) * 100)), label: tiers + " / " + total + " tiers" };
            }
        },
        {
            id: "bh-phase3",
            text: "Fill the singularity with mass",
            achieved: false,
            isComplete: () => d.getBlackHolePhase() >= 3,
            getProgress: () => {
                const mass = Math.max(0, Math.floor(Number(d.blackHole.number1BlackHoleState.phase2Mass) || 0));
                return {
                    current: mass,
                    target: d.blackHolePhase2MassCap,
                    pct: d.getBlackHolePhase() >= 3 ? 100 : Math.max(0, Math.min(100, (mass / d.blackHolePhase2MassCap) * 100)),
                    label: mass + " / " + d.blackHolePhase2MassCap + " mass"
                };
            }
        },
        {
            id: "bh-phase4",
            text: "Tune all accretion disk systems",
            achieved: false,
            isComplete: () => d.getBlackHolePhase() >= 4,
            getProgress: () => {
                const tiers = d.getBlackHolePhase3TrackLevel("luminosity") + d.getBlackHolePhase3TrackLevel("viscous") + d.getBlackHolePhase3TrackLevel("coronal");
                return { current: tiers, target: 18, pct: d.getBlackHolePhase() >= 4 ? 100 : Math.max(0, Math.min(100, (tiers / 18) * 100)), label: tiers + " / 18 disk tiers" };
            }
        },
        {
            id: "bh-wave",
            text: "Fire a Gravitational Wave",
            achieved: false,
            isComplete: () => d.getBlackHolePhase() >= 5 || !!d.blackHole.number1BlackHoleState.phase4WaveTriggered || Date.now() <= (d.blackHole.number1BlackHoleState.phase4WaveActiveUntilMs || 0),
            getProgress: () => ({ pct: d.getBlackHolePhase() >= 4 ? 50 : 0, label: d.getBlackHolePhase() >= 4 ? "Wave system online" : "Locked" })
        },
        {
            id: "bh-phase5",
            text: "Unlock the Gravitational Furnace",
            achieved: false,
            isComplete: () => d.getBlackHolePhase() >= 5,
            getProgress: () => ({
                pct: d.getBlackHolePhase() >= 5 ? 100 : Math.max(0, Math.min(100, ((d.blackHole.number1BlackHoleState.phase4WaveLevel || 0) / 6) * 100)),
                label: Math.floor(Number(d.blackHole.number1BlackHoleState.phase4WaveLevel) || 0) + " / 6 wave levels"
            })
        },
        {
            id: "bh-first-sacrifice",
            text: "Feed your first hand to the furnace",
            achieved: false,
            isComplete: () => d.getBlackHolePhase() >= 6 || (d.blackHole.number1BlackHoleState.phase5DigestHandNumber || 0) > 0 || (d.blackHole.number1BlackHoleState.phase5DigestedHands || 0) > 0
        },
        {
            id: "bh-first-digest",
            text: "Complete your first digestion",
            achieved: false,
            isComplete: () => d.getBlackHolePhase() >= 6 || (d.blackHole.number1BlackHoleState.phase5DigestedHands || 0) >= 1 || (d.blackHole.number1BlackHoleState.phase5FurnaceLevel || 0) >= 1,
            getProgress: () => ({
                pct: ((d.blackHole.number1BlackHoleState.phase5DigestedHands || 0) >= 1 || d.getBlackHolePhase() >= 6) ? 100 : d.getBlackHolePhase5DigestProgress() * 100,
                label: Math.floor(d.getBlackHolePhase5DigestProgress() * 100) + "% digested"
            })
        },
        {
            id: "bh-phase6",
            text: "Digest down to one hand",
            achieved: false,
            isComplete: () => d.getBlackHolePhase() >= 6,
            getProgress: () => {
                const done = d.getBlackHolePhase() >= 6 ? 9 : Math.max(0, Math.floor(Number(d.blackHole.number1BlackHoleState.phase5DigestedHands) || 0));
                return { current: done, target: 9, pct: Math.max(0, Math.min(100, (done / 9) * 100)), label: done + " / 9 hands digested" };
            }
        },
        {
            id: "bh-jet-ignite",
            text: "Ignite the Astrophysical Jet",
            achieved: false,
            isComplete: () => d.getBlackHolePhase() >= 7 || !!d.blackHole.number1BlackHoleState.phase6JetIgnited || !!d.blackHole.number1BlackHoleState.phase6JetActive,
            getProgress: () => ({ pct: d.getBlackHolePhase() >= 6 ? 50 : 0, label: d.getBlackHolePhase() >= 6 ? "Jet system online" : "Locked" })
        },
        {
            id: "bh-phase7",
            text: "Reach the evaporation limit",
            achieved: false,
            isComplete: () => d.getBlackHolePhase() >= 7 || d.run.totalChanges >= d.blackHoleEvaporationCap,
            getProgress: () => ({
                pct: d.getBlackHolePhase() >= 7 ? 100 : Math.max(0, Math.min(100, Math.log10(Math.max(1, d.run.totalChanges)) / 308 * 100)),
                label: d.formatCount(d.run.totalChanges) + " / " + d.formatCount(d.blackHoleEvaporationCap)
            })
        },
        {
            id: "bh-epilogue",
            text: "Count in the Epilogue",
            achieved: false,
            isComplete: () => d.getBlackHolePhase() >= 7 && (d.blackHole.number1BlackHoleState.phase7EpilogueCounter || 0) >= 60,
            getProgress: () => ({
                pct: d.getBlackHolePhase() >= 7 ? Math.max(0, Math.min(100, ((d.blackHole.number1BlackHoleState.phase7EpilogueCounter || 0) / 60) * 100)) : 0,
                label: Math.floor(d.blackHole.number1BlackHoleState.phase7EpilogueCounter || 0) + " / 60 epilogue ticks"
            })
        }
    ];
}
