import { describe, expect, it, vi } from "vitest";

import { GAME_LOOP_MS } from "../loop/n1-game-loop.js";
import { createUpgradeTrack } from "./n1-upgrade-track.js";

function makeShared(overrides: Record<string, unknown> = {}) {
    const levels = [0];
    const bonus = [0];
    const earnings = [100];
    const countdown = [0];
    const btn = {
        disabled: true,
        style: { display: "" },
        classList: {
            add: vi.fn(),
            remove: vi.fn(),
            toggle: vi.fn()
        },
        querySelector: () => ({ textContent: "" }),
        closest: () => null
    };
    const levelEl = {
        innerHTML: "",
        classList: { toggle: vi.fn() }
    };
    const wrapEl = { style: { display: "none" } };
    return {
        levels,
        bonus,
        earnings,
        countdown,
        btn,
        deps: {
            getBlackHolePhase: () => 0,
            getUnlockedHands: () => 1,
            getHandEarnings: (i: number) => earnings[i] || 0,
            setHandEarningBalance: (i: number, v: number) => {
                earnings[i] = v;
            },
            markMeaningfulProgress: vi.fn(),
            markAutobuyDeferredTotalsPending: vi.fn(),
            refreshTotalFromHandEarnings: vi.fn(),
            getIncrementalCountEl: () => null,
            formatCount: (n: number) => String(n),
            getTotalChanges: () => 0,
            addToLog: vi.fn(),
            getSpeedRowRefs: () => [
                {
                    cheapenWrapEl: wrapEl,
                    cheapenBtn: btn,
                    cheapenLevelEl: levelEl
                }
            ],
            sprayConfettiFrom: vi.fn(),
            setUpgradeTooltipText: vi.fn(),
            setUpgradeButtonProgress: vi.fn(),
            formatUpgradeAffordEtaLine: () => "",
            flashSpeedAutobuyToast: vi.fn(),
            setBatchedUpgradeUiFlush: vi.fn(),
            refreshUpgradeColumnsUi: vi.fn(),
            scheduleHandUpgradeScrollHintUpdate: vi.fn(),
            getAutoBuyUnlocked: () => true,
            getAutoBuyEnabledByHand: () => true,
            getAutoBuyDelaySeconds: () => 1,
            ...overrides
        }
    };
}

describe("createUpgradeTrack", () => {
    it("buys when affordable and updates level", () => {
        const { levels, earnings, deps } = makeShared();
        const track = createUpgradeTrack(
            {
                wrapKey: "cheapenWrapEl",
                btnKey: "cheapenBtn",
                levelKey: "cheapenLevelEl",
                defaultLabel: "Cheapen",
                autobuyToastPrefix: "Cheapen",
                gateBuyByTrackUnlock: false,
                gateAutobuyByTrackUnlock: false,
                getBaseLevels: () => levels,
                getBonusLevels: () => [0],
                getCap: () => 10,
                getCost: () => 40,
                applyPurchase(_i: number, next: number) {
                    levels[0] = next;
                },
                isTrackUnlocked: () => true,
                formatEffectAchieved: () => "fx",
                formatEffectNext: () => "fx",
                formatLog: (handNum: number, lvl: number) => "Hand " + handNum + " L" + lvl,
                getAutoBuyCountdownByHand: () => [0],
                setAutoBuyCountdown: vi.fn()
            },
            deps
        );

        track.buyUpgradeForHand(0, null, {});
        expect(levels[0]).toBe(1);
        expect(earnings[0]).toBe(60);
        expect(deps.refreshUpgradeColumnsUi).toHaveBeenCalled();
    });

    it("autobuy purchases after countdown elapses", () => {
        const { levels, earnings, countdown, deps } = makeShared();
        earnings[0] = 999;
        countdown[0] = GAME_LOOP_MS / 1000 / 2;
        const track = createUpgradeTrack(
            {
                wrapKey: "cheapenWrapEl",
                btnKey: "cheapenBtn",
                levelKey: "cheapenLevelEl",
                defaultLabel: "Cheapen",
                autobuyToastPrefix: "Cheapen",
                gateBuyByTrackUnlock: false,
                gateAutobuyByTrackUnlock: false,
                getBaseLevels: () => levels,
                getBonusLevels: () => [0],
                getCap: () => 10,
                getCost: () => 10,
                applyPurchase(_i: number, next: number) {
                    levels[0] = next;
                },
                isTrackUnlocked: () => true,
                formatEffectAchieved: () => "fx",
                formatEffectNext: () => "fx",
                formatLog: () => "",
                devAutobuyOn: () => true,
                devAutobuyDelaySec: 1,
                getAutoBuyCountdownByHand: () => countdown,
                setAutoBuyCountdown: (i: number, v: number) => {
                    countdown[i] = v;
                }
            },
            deps
        );

        track.maybeAutoBuy();
        expect(levels[0]).toBe(1);
        expect(deps.flashSpeedAutobuyToast).toHaveBeenCalledWith(0, "Cheapen 1");
    });

    it("hides column UI while track locked", () => {
        const { deps, btn } = makeShared();
        const wrapEl = deps.getSpeedRowRefs()[0].cheapenWrapEl as { style: { display: string } };
        const track = createUpgradeTrack(
            {
                wrapKey: "cheapenWrapEl",
                btnKey: "cheapenBtn",
                levelKey: "cheapenLevelEl",
                defaultLabel: "Cheapen",
                autobuyToastPrefix: "Cheapen",
                getBaseLevels: () => [0],
                getBonusLevels: () => [0],
                getCap: () => 10,
                getCost: () => 1,
                applyPurchase: vi.fn(),
                isTrackUnlocked: () => false,
                formatEffectAchieved: () => "fx",
                formatEffectNext: () => "fx",
                formatLog: () => "",
                getAutoBuyCountdownByHand: () => [0],
                setAutoBuyCountdown: vi.fn()
            },
            deps
        );

        track.updateUpgradeUI();
        expect(wrapEl.style.display).toBe("none");
        expect(btn.classList.remove).toHaveBeenCalledWith("upgrade-btn--afford-pulse");
    });
});
