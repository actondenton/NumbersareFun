/**
 * Dev auto-player policy: persona configs and pure action selection.
 */

export const AUTOPLAYER_PERSONA_EFFICIENT = "efficient";
export const AUTOPLAYER_PERSONA_PATIENT = "patient";

export const AUTOPLAYER_ASCEND_LOOKAHEAD_SEC = 30;

/** @type {Record<string, object>} */
export const AUTOPLAYER_PERSONA_PRESETS = {
    [AUTOPLAYER_PERSONA_EFFICIENT]: {
        id: AUTOPLAYER_PERSONA_EFFICIENT,
        label: "Efficient",
        mutationKind: "essence-refinery",
        stokeWhenEssenceAvailable: true,
        stokeMinDigestProgress: 0,
        manualWaveWhenOffCooldown: true,
        manualWaveMinIdleSec: 0,
        ascend: {
            minReadyDwellSec: 45,
            marginalGainFloorPct: 0.05,
            maxDeferSec: 600,
            lookaheadSec: AUTOPLAYER_ASCEND_LOOKAHEAD_SEC
        }
    },
    [AUTOPLAYER_PERSONA_PATIENT]: {
        id: AUTOPLAYER_PERSONA_PATIENT,
        label: "Patient",
        mutationKind: "essence-refinery",
        stokeWhenEssenceAvailable: true,
        stokeMinDigestProgress: 0.5,
        manualWaveWhenOffCooldown: false,
        manualWaveMinIdleSec: 60,
        ascend: {
            minReadyDwellSec: 120,
            marginalGainFloorPct: 0.02,
            maxDeferSec: 1800,
            lookaheadSec: AUTOPLAYER_ASCEND_LOOKAHEAD_SEC
        }
    }
};

export function getAutoplayerPersonaConfig(personaId) {
    const id = String(personaId || AUTOPLAYER_PERSONA_EFFICIENT);
    return AUTOPLAYER_PERSONA_PRESETS[id] || AUTOPLAYER_PERSONA_PRESETS[AUTOPLAYER_PERSONA_EFFICIENT];
}

/**
 * Hybrid B+A ascend gate.
 * @param {object} opts
 */
export function shouldAscendNow(opts) {
    const o = opts || {};
    if (!o.isAscensionReady) return false;
    if (o.hasAffordableRunUpgrade) return false;

    const nowMs = Number(o.nowMs) || 0;
    const readySinceMs = Number(o.ascendReadySinceMs);
    const ascendConfig = o.ascendConfig || {};
    const minDwellSec = Number(ascendConfig.minReadyDwellSec) || 0;
    const maxDeferSec = Number(ascendConfig.maxDeferSec) || 600;
    const floorPct = Number(ascendConfig.marginalGainFloorPct) || 0.05;
    const lookaheadSec = Number(ascendConfig.lookaheadSec) || AUTOPLAYER_ASCEND_LOOKAHEAD_SEC;

    if (!Number.isFinite(readySinceMs) || readySinceMs <= 0) return false;

    const readyForSec = Math.max(0, (nowMs - readySinceMs) / 1000);
    if (readyForSec >= maxDeferSec) return true;
    if (readyForSec < minDwellSec) return false;

    const total = Math.max(1, Number(o.totalChanges) || 1);
    const cps = Math.max(0, Number(o.effectiveCps) || 0);
    const gainNow = typeof o.getAscensionGainAtTotal === "function" ? o.getAscensionGainAtTotal(total) : 0;
    const projectedTotal = total + cps * lookaheadSec;
    const gainLater =
        typeof o.getAscensionGainAtTotal === "function" ? o.getAscensionGainAtTotal(projectedTotal) : gainNow;
    const marginal = gainLater - gainNow;
    if (!(gainNow > 0)) return true;
    return marginal / gainNow < floorPct;
}

const COLLAPSE_TRACKS = ["mass", "photon", "ergosphere"];
const DISK_TRACKS = ["luminosity", "viscous", "coronal"];
const JET_TRACKS = ["drain", "boost", "bank"];

function pickCheapestCollapseTrack(state) {
    let best = null;
    let bestCost = Infinity;
    for (const track of COLLAPSE_TRACKS) {
        const tier = state.collapseTierByTrack?.[track] ?? 0;
        if (tier >= (state.collapseMaxTier ?? 3)) continue;
        const cost = state.collapseCostByTrack?.[track];
        if (!(cost > 0) || cost >= bestCost) continue;
        if (state.ascensionEssence >= cost) {
            bestCost = cost;
            best = track;
        }
    }
    return best;
}

function pickLowestDiskTrack(state) {
    let best = null;
    let bestLevel = Infinity;
    let bestCost = Infinity;
    for (const track of DISK_TRACKS) {
        const level = state.diskLevelByTrack?.[track] ?? 0;
        if (level >= (state.diskMaxLevel ?? 6)) continue;
        const cost = state.diskCostByTrack?.[track];
        if (!(cost > 0)) continue;
        if (level < bestLevel || (level === bestLevel && cost < bestCost)) {
            if (state.ascensionEssence >= cost) {
                bestLevel = level;
                bestCost = cost;
                best = track;
            }
        }
    }
    return best;
}

function pickAffordableJetTrack(state) {
    let best = null;
    let bestCost = Infinity;
    for (const track of JET_TRACKS) {
        const cost = state.jetCostByTrack?.[track];
        if (!(cost > 0) || cost >= bestCost) continue;
        if (state.ascensionEssence >= cost) {
            bestCost = cost;
            best = track;
        }
    }
    return best;
}

function pickCheapestRunUpgrade(state) {
    let best = null;
    let bestCost = Infinity;
    const hands = Math.max(0, Math.floor(Number(state.unlockedHands) || 0));
    for (let i = 0; i < hands; i++) {
        if (state.canBuySpeed?.[i]) {
            const cost = state.speedCostByHand?.[i];
            if (cost > 0 && cost < bestCost) {
                bestCost = cost;
                best = { kind: "buy_speed", handIndex: i, cost };
            }
        }
        if (state.canBuyCheapen?.[i]) {
            const cost = state.cheapenCostByHand?.[i];
            if (cost > 0 && cost < bestCost) {
                bestCost = cost;
                best = { kind: "buy_cheapen", handIndex: i, cost };
            }
        }
        if (state.canBuySlowdown?.[i]) {
            const cost = state.slowdownCostByHand?.[i];
            if (cost != null && cost > 0 && cost < bestCost) {
                bestCost = cost;
                best = { kind: "buy_slowdown", handIndex: i, cost };
            }
        }
    }
    return best;
}

function hasAffordableRunUpgrade(state) {
    return pickCheapestRunUpgrade(state) != null;
}

/**
 * @returns {null | object} action descriptor for orchestrator
 */
export function pickNextAction(state, personaConfig) {
    const s = state || {};
    const persona = personaConfig || getAutoplayerPersonaConfig();
    const phase = Math.max(0, Math.floor(Number(s.blackHolePhase) || 0));

    if (s.storyBannerOpen && s.autoDismissStoryBanners !== false) {
        return { kind: "dismiss_story" };
    }

    if (phase === 5 && (s.phase5PendingMutationLevel || 0) > 0) {
        return { kind: "bh_mutation", mutationKind: persona.mutationKind || "essence_refinery" };
    }

    if (phase === 5 && s.phase5DigestActive) {
        const digestProgress = Number(s.phase5DigestProgress) || 0;
        const canStoke =
            persona.stokeWhenEssenceAvailable &&
            (s.ascensionEssence || 0) > 0 &&
            digestProgress >= (Number(persona.stokeMinDigestProgress) || 0);
        if (canStoke) {
            return { kind: "bh_stoke" };
        }
    }

    if (phase === 5 && !s.phase5DigestActive && !(s.phase5PendingMutationLevel > 0)) {
        if (s.canSacrificeHand) {
            return { kind: "bh_sacrifice" };
        }
    }

    if (phase === 6) {
        const charge = Number(s.phase6JetCharge) || 0;
        const jetActive = !!s.phase6JetActive;
        if (jetActive && charge <= 0 && (s.ascensionEssence || 0) <= 0) {
            return { kind: "bh_jet_toggle", active: false };
        }
        if (!jetActive && charge > 0) {
            const threshold = Math.max(0, Number(s.phase6JetChargeThreshold) || 0.25) * Math.max(1, Number(s.phase6JetChargeCap) || 500);
            if (charge >= threshold) {
                return { kind: "bh_jet_toggle", active: true };
            }
        }
    }

    if (s.isArcUnlocked && phase >= 1 && phase <= 6 && (s.ascensionEssence || 0) > 0) {
        if (phase === 2) {
            const track = pickCheapestCollapseTrack(s);
            if (track) return { kind: "bh_collapse_buy", track };
            if (s.phase2MassPourUnlocked) {
                return { kind: "bh_pour" };
            }
        } else if (phase === 3) {
            const track = pickLowestDiskTrack(s);
            if (track) return { kind: "bh_disk_buy", track };
            if (!s.phase3Complete) return { kind: "bh_pour" };
        } else if (phase === 4) {
            if ((s.phase4WaveLevel || 0) < 6) return { kind: "bh_pour" };
        } else if (phase === 5 && s.phase5DigestActive && (s.ascensionEssence || 0) > 0) {
            return { kind: "bh_stoke" };
        } else if (phase === 6) {
            const track = pickAffordableJetTrack(s);
            if (track) return { kind: "bh_jet_buy", track };
            return { kind: "bh_pour" };
        } else if (phase === 1) {
            return { kind: "bh_pour" };
        }
    }

    if (phase === 4 && s.phase4ManualWaveReady) {
        const idleSec = Math.max(0, (Number(s.nowMs) - Number(s.lastActionAtMs || s.sessionStartMs || 0)) / 1000);
        const allowWave =
            persona.manualWaveWhenOffCooldown ||
            idleSec >= (Number(persona.manualWaveMinIdleSec) || 0);
        if (allowWave) {
            return { kind: "bh_wave_manual" };
        }
    }

    if (s.hasAscended && !s.treeFullyPurchased && s.cheapestAscensionNodeId) {
        return { kind: "buy_ascension_node", nodeId: s.cheapestAscensionNodeId };
    }

    const runBuy = pickCheapestRunUpgrade(s);
    if (runBuy) return runBuy;

    if (
        shouldAscendNow({
            isAscensionReady: s.isAscensionReady,
            ascendReadySinceMs: s.ascendReadySinceMs,
            nowMs: s.nowMs,
            hasAffordableRunUpgrade: hasAffordableRunUpgrade(s),
            totalChanges: s.totalChanges,
            effectiveCps: s.effectiveCps,
            getAscensionGainAtTotal: s.getAscensionGainAtTotal,
            ascendConfig: persona.ascend
        })
    ) {
        return { kind: "ascend" };
    }

    if (s.turboBoostUnlocked && !s.turboBoostEnabled && (Number(s.turboMeterFillRatio) || 0) >= 0.8) {
        return { kind: "turbo_toggle", enabled: true };
    }

    return null;
}

export function mapActionKindToEventType(kind) {
    const map = {
        buy_speed: "buy_speed",
        buy_cheapen: "buy_cheapen",
        buy_slowdown: "buy_slowdown",
        ascend: "ascend",
        buy_ascension_node: "buy_ascension_node",
        bh_pour: "bh_pour",
        bh_stoke: "bh_stoke",
        bh_collapse_buy: "bh_collapse_buy",
        bh_disk_buy: "bh_disk_buy",
        bh_jet_buy: "bh_jet_buy",
        bh_wave_manual: "bh_wave_manual",
        bh_sacrifice: "bh_sacrifice",
        bh_mutation: "bh_mutation",
        bh_jet_toggle: "bh_jet_toggle",
        turbo_toggle: "turbo_toggle",
        dismiss_story: "dismiss_story"
    };
    return map[kind] || kind;
}
