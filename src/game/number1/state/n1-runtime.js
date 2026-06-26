import { createN1RunStore } from "./n1-run-store.js";
import { createN1AscensionStore } from "./n1-ascension-store.js";
import { createN1BlackHoleStore } from "./n1-black-hole-store.js";
import { createN1TurboStore } from "./n1-turbo-store.js";
import { createN1SessionStore } from "./n1-session-store.js";
import { createN1UpgradesStore } from "./n1-upgrades-store.js";
import { createN1AutobuyStore } from "./n1-autobuy-store.js";
import { createN1TimewarpStore } from "./n1-timewarp-store.js";
import { createN1HandsStore } from "./n1-hands-store.js";
import { createN1ComboStore } from "./n1-combo-store.js";
import { createN1StoryStore } from "./n1-story-store.js";
import { createN1ObjectivesStore } from "./n1-objectives-store.js";

/**
 * Composes passive Number 1 runtime stores. No DOM, listeners, or game loop.
 * @param {{ maxHands?: number }} [config]
 */
export function createNumber1Runtime(config = {}) {
    const maxHands = Math.max(1, Math.floor(Number(config.maxHands) || 10));
    return {
        run: createN1RunStore({ maxHands }),
        ascension: createN1AscensionStore(),
        blackHole: createN1BlackHoleStore(),
        turbo: createN1TurboStore(),
        upgrades: createN1UpgradesStore({ maxHands }),
        autobuy: createN1AutobuyStore({ maxHands }),
        timewarp: createN1TimewarpStore({ maxHands }),
        hands: createN1HandsStore({ maxHands }),
        combo: createN1ComboStore(),
        story: createN1StoryStore(),
        objectives: createN1ObjectivesStore(),
        session: createN1SessionStore()
    };
}
