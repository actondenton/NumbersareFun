import { UNLOCK_THRESHOLDS, storyTotalCountLead } from "../hands/n1-hands.js";
import { TURBO_UNLOCK_COUNT } from "../upgrades/n1-turbo.js";

/**
 * Milestone story banner definitions (Phase 21c).
 * Milestone text matches UNLOCK_THRESHOLDS / TURBO_UNLOCK_COUNT (same as long-term objectives).
 *
 * @param {{
 *   run: { unlockedHands: number, totalChanges: number },
 *   ascension: { number1HasAscended: boolean },
 *   formatCount: (n: number) => string,
 *   isBlackHoleArcUnlocked: () => boolean,
 *   getBlackHolePhase: () => number
 * }} dep
 */
export function createNumber1StoryBanners(dep) {
    const lead = threshold => storyTotalCountLead(threshold, dep.formatCount);
    const { run, ascension } = dep;

    return [
        {
            id: "second-hand",
            order: 1,
            trigger: () => run.unlockedHands >= 2,
            title: "Congratulations — you unlocked a second hand!",
            body: lead(UNLOCK_THRESHOLDS[0]) + "you unlocked a second hand. Statistically speaking, you've always had a second hand available but you just didn't want to use it or something, but now you will be counting with two hands. Each hand has its own upgrades and its own earnings. Combinations between two hands award one-time bonuses that affect all of your counting. Try to get all of the bonuses!"
        },
        {
            id: "third-hand",
            order: 2,
            trigger: () => run.unlockedHands >= 3,
            title: "Wow — you're now counting on 3 hands!",
            body: lead(UNLOCK_THRESHOLDS[1]) + "you unlocked a third hand. I don't know how that is possible but maybe your friend is helping you. Similarly to two hands you can earn bonuses by having interesting hand combinations like all of the hands are on the same number at the end of the tick. It shouldn't be too hard to collect them all."
        },
        {
            id: "turbo-boost",
            order: 3,
            trigger: () => run.totalChanges >= TURBO_UNLOCK_COUNT,
            title: "Turbo Boost unlocked!",
            body: lead(TURBO_UNLOCK_COUNT) + "you unlocked Turbo Boost. Three hands aren't going to get you to a quadrillion on their own, but with Turbo Boost you can push much further! The gauge to the right of your total count fills when you land hand combos—bigger combos add more. While the meter has charge and Turbo is on, all hand counts are multiplied. Now your numbers have NOS! Oh and you can get more combos too."
        },
        {
            id: "fourth-hand",
            order: 4,
            trigger: () => run.unlockedHands >= 4,
            title: "It's patty-cake time! 🎉 You're now counting on 4 hands!",
            body: lead(UNLOCK_THRESHOLDS[2]) + "you unlocked a fourth hand. Bake me a cake as fast as you can. JK there is no cake. You can earn bonuses by having interesting hand combinations like all of the hands are on the same number at the end of the tick. It shouldn't be too hard to collect them all."
        },
        {
            id: "fifth-hand",
            order: 5,
            trigger: () => run.unlockedHands >= 5,
            title: "You're now counting on 5 hands!",
            body: lead(UNLOCK_THRESHOLDS[3]) + "you unlocked a fifth hand. This is getting crazy. Where are these hands coming from? Probably from the same place as the sheep do. You can earn bonuses by having interesting hand combinations like all of the hands are on the same number at the end of the tick. It shouldn't be too hard to collect them all."
        },
        {
            id: "sixth-hand",
            order: 6,
            trigger: () => run.unlockedHands >= 6,
            title: "You're now counting on 6 hands!",
            body: lead(UNLOCK_THRESHOLDS[4]) + "you unlocked a sixth hand. If you google, \"do any creatures have 6 hands?\" the answer is no. Because of course it is no. Therefore you are an abomination...much like when Spider-Man became a spider man, but look at all those numbers! Also with more hands come more bonuses, just like uncle Ben said."
        },
        {
            id: "seventh-hand",
            order: 7,
            trigger: () => run.unlockedHands >= 7,
            title: "THE SEVENTH HAND HAS APPEARED!",
            body: lead(UNLOCK_THRESHOLDS[5]) + "you unlocked a seventh hand. Much like the other hands we have no idea who's they are or why they chose to help you count. But look at all those numbers! Get those new combos baby, cha-ching."
        },
        {
            id: "eighth-hand",
            order: 8,
            trigger: () => run.unlockedHands >= 8,
            title: "8 hand counting is now a thing!",
            body: lead(UNLOCK_THRESHOLDS[6]) + "you unlocked an eighth hand — give yourself a round of applause. Oh and Clapping is now a thing that helps you count faster. When any two hands finish a tick on the digit 5, they clap together (watch for the center-screen animation). Each clap has a 10% chance per hand to grant a bonus Speed level: it boosts your hand's rate like a normal level but does not increase upgrade costs. Your level line shows as \"Level X +Y\" when you have bonus levels. You can turn the animation off in Menu → Show clap animation (bonuses still apply). Combos between hands still work as before — keep mixing digits for bonuses and Turbo meter."
        },
        {
            id: "ninth-hand",
            order: 9,
            trigger: () => run.unlockedHands >= 9,
            title: "Nine is a fun number because it is the first time we see the square of three! If you don't find that interesting too, well that is reasonable.",
            body: lead(UNLOCK_THRESHOLDS[7]) + "you unlocked a ninth hand. Did I really not come up with an upgrade for this? Anyways, you can earn bonuses by having interesting hand combinations like all of the hands are on the same number at the end of the tick. It shouldn't be too hard to collect them all."
        },
        {
            id: "tenth-hand",
            order: 10,
            trigger: () => run.unlockedHands >= 10,
            title: "This is the sound of 10 hands counting!",
            body: lead(UNLOCK_THRESHOLDS[8]) + "you unlocked a tenth hand. It is quieter than I thought it would be. Wait did I not add an upgrade for 10 hands either? No, that can't be right, I feel like there is something here. Keep counting while I go look for the next upgrade.."
        },
        {
            id: "black-hole-mass-accumulator-intro",
            order: 50,
            trigger: () => ascension.number1HasAscended && dep.isBlackHoleArcUnlocked() && dep.getBlackHolePhase() === 1,
            title: "Gravity takes hold",
            body: "You have mapped every path and you cunted so high that your numbers are no longer weightless. I know it sounds crazy but I think it might just be crazy enuogh to work. Let's call this the Numerical Mass Accumulator and by the power of imagination we will use its mass to help you count faster and higher. Feed Essence to the Numerical Mass Accumulator on Ascension for new boosts. Under Count per second, warm numerical mass shows your inertial boost while you charge. I am sure adding more and more numerical mass will have no consequences."
        },
        {
            id: "ascension-map-collapse-ready",
            order: 1000,
            trigger: () => false,
            title: "Constellation complete",
            body: "Ok, so there appear to be some minor consequences. It looks like our numerical mass is starting to get a bit heavy and collpased in on itself. BUT somehow its still helping us count, so the power of imagination lives. Let's see how far we can push this collapse, let's add some more ascension essence."
        },
        {
            id: "black-hole-phase-1-collapse",
            order: 1001,
            trigger: () => false,
            title: "Mass Accumulator Collapse",
            body: "Critical mass reached. The accumulator collapses inward. A black hole is born. You done messed up son (or daughter)!"
        },
        {
            id: "black-hole-phase-2-disk",
            order: 1002,
            trigger: () => false,
            title: "Accretion Disk Ignition",
            body: "Numerical Matter begins to circle the singularity, it makes pretty swirly shapes. Also, the accretion disk ignites. So basically spiecy swirly shapes are going to help us count faster and higher."
        },
        {
            id: "black-hole-phase-3-wave",
            order: 1003,
            trigger: () => false,
            title: "Gravitational Lensing",
            body: "Spacetime bends around your count. Suck it Einstein! Gravitational Waves begin to pulse. Also, I am not sure if this is actually working, but it looks cool so I am going to leave it in."
        },
        {
            id: "black-hole-phase-4-furnace",
            order: 1004,
            trigger: () => false,
            title: "Gravitational Furnace",
            body: "It seems like our black hole is growing nicely but recently it just hasn't been itself. We give it essence and more essence but it just doesn't seem to do the trick. Much like our little shop of horrors I feel like we need to feed it soemthing tasty. I dare you to throw one of your hands in there, lol."
        },
        {
            id: "black-hole-phase-5-jets",
            order: 1005,
            trigger: () => false,
            title: "Astrophysical Jets",
            body: "Going from 10 hands to 1 was quite the sacrifice but little Jimmy (I assume that's our black hole's name) seems pretty happy. He's shooting out astrophysical jets of hypercharged numerical mass. Ride these jet's to the inevitable conclusion so you can prove everyone wrong and say, \"I counted to infinity\"."
        },
        {
            id: "black-hole-phase-6-evaporation",
            order: 1006,
            trigger: () => false,
            title: "Evaporation",
            body: "The cosmic limit is reached. Upgrades fall silent. Now, count for counting's sake."
        },
        {
            id: "black-hole-first-digest",
            order: 1007,
            trigger: () => false,
            title: "Furnace Response",
            body: "Digestion complete. The furnace answers with new power."
        }
    ];
}
