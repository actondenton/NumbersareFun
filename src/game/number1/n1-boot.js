import { hydrateNumber1RuntimeFromSave } from "./n1-persist.js";
import { applyHydratedSnapshotToLiveGame, restoreHandsFromSaveSnapshot } from "./n1-load-orchestration.js";
import { wireNumber1DevTools } from "./dev/n1-dev-boot.js";
import { createNumber1BlackHoleBoot } from "./black-hole/n1-black-hole-boot.js";
import { wireNumber1Combinations } from "./combos/n1-combinations-wire.js";
import { wireNumber1Story } from "./story/n1-story-wire.js";
import { wireNumber1Objectives } from "./objectives/n1-objectives-wire.js";
import { wireNumber1UpgradeBoots } from "./upgrades/n1-upgrades-wire.js";
import { wireNumber1TimeWarpBoot } from "./upgrades/n1-timewarp-boot-wire.js";
import { wireNumber1TurboBoot } from "./upgrades/n1-turbo-boot-wire.js";
import { createTurboRuntimeBoot } from "./upgrades/n1-turbo-runtime-boot.js";
import { createTurboUiBoot } from "./upgrades/n1-turbo-ui-boot.js";
import { createSpeedUpgradeUiBoot } from "./upgrades/n1-speed-upgrade-ui-boot.js";
import { wireNumber1GameLoop } from "./loop/n1-game-loop-boot.js";
import { buildNumber1GameLoopWireDep } from "./loop/n1-game-loop-wire-deps.js";
import { buildN1DevToolsWireDep } from "./dev/n1-dev-tools-boot.js";
import { buildNumber1BootFinishRefreshers } from "./shell-ui/n1-boot-finish-refreshers.js";
import { wireNumber1SaveLoad } from "./n1-save-wire.js";
import { wireNumber1ShellDomListeners } from "./shell-ui/n1-shell-dom-listeners-boot.js";
import { finishNumber1ShellBoot } from "./shell-ui/n1-shell-finish-boot.js";
import { createNumber1SettingsBoot } from "./shell-ui/n1-settings-boot.js";
import { createSyncPlayStageForNumberMode, wireNumber1ShellModeSwitch } from "./shell-ui/n1-shell-mode-boot.js";
import { wireNumber1HandUnlock } from "./hands/n1-hand-unlock-boot.js";
import { createNumber1DetachedCpsBoot } from "./loop/n1-detached-cps-boot.js";
import { createGameplaySimFrozen } from "./session/n1-gameplay-sim-freeze.js";
import { createNumber2ShellBoot } from "./shell-ui/n1-number2-shell-boot.js";
import { wireNumber1ObjectivesLive } from "./objectives/n1-objectives-live-boot.js";
import { createNumber1StoryBanners } from "./story/n1-story-banners-catalog.js";
import { wireNumber1AscensionFlow } from "./ascension/n1-ascension-flow-boot.js";
import { createSyncUnlocksWithTotalCount } from "./loop/n1-milestone-unlocks-boot.js";
import { createAscensionHubRender } from "./ascension/n1-ascension-hub-render.js";
import { createNumber1BlackHolePanelRender } from "./black-hole/n1-black-hole-panel-render.js";
import { createAscensionPageRender } from "./ascension/n1-ascension-page-render.js";
import { wireNumber1AscensionNodeActions } from "./ascension/n1-ascension-node-actions-boot.js";
import { wireNumber1AscensionPerform } from "./ascension/n1-ascension-perform-boot.js";
import { createAscensionMapFacade } from "./ascension/n1-ascension-map-facade.js";
import { createGlobalOverviewBoot } from "./shell-ui/n1-global-overview-cards.js";
import { createMessageStoryLogPageBoot } from "./shell-ui/n1-message-story-log-page.js";
import { createPagePanelBoot } from "./shell-ui/n1-page-panel-boot.js";
import { createPageButtonUnlocksBoot } from "./shell-ui/n1-page-button-unlocks-boot.js";
import { createAscensionReadyChrome } from "./ascension/n1-ascension-ready-chrome.js";
import { createAscensionGrantAccessorsBoot } from "./ascension/n1-ascension-grant-accessors-boot.js";
import { createOverviewAscensionPanelsRefresh } from "./ascension/n1-overview-ascension-panels.js";
import { runNumber1Boot } from "./n1-boot-body.js";

/**
 * Number 1 orchestration spine (grows each migration phase).
 *
 * @deps {object} runtime - n1-runtime composed stores
 * @deps {object} dom - collectNumber1DomRefs result
 * FORBIDDEN: deps.runtime bag passed to domain factories
 *
 * @param {{ runtime: ReturnType<typeof import("./state/n1-runtime.js").createNumber1Runtime>, dom: ReturnType<typeof import("./shell-ui/n1-dom-refs.js").collectNumber1DomRefs> }} deps
 */
export function createN1Boot(deps) {
    /** @type {(snap: NonNullable<ReturnType<typeof hydrateNumber1RuntimeFromSave>>) => void} */
    let applyLiveGameLoad = () => {};

    const api = {
        runtime: deps.runtime,
        dom: deps.dom,
        registerLiveGameLoad(fn) {
            applyLiveGameLoad = fn;
        },
        applyLoadedSave(rawSave, hydrateEnv) {
            const snap = hydrateNumber1RuntimeFromSave(deps.runtime, rawSave, hydrateEnv);
            if (!snap) return false;
            applyHydratedSnapshotToLiveGame(snap, { applyLiveGameLoad: snap => applyLiveGameLoad(snap) });
            return true;
        },
        /** Phase 4+ domain wiring drain target. */
        wireDevTools(devDeps) {
            wireNumber1DevTools(devDeps);
        },
        /** Phase 9+ loop registration. */
        startGameLoop(loopRuntime) {
            loopRuntime.start();
        },
        /** Phase 13b+: BH domain boot façade (expanded in Phase 21a). */
        wireBlackHole(dep) {
            return createNumber1BlackHoleBoot(dep);
        },
        /** Phase 14+: combinations domain boot. */
        wireCombinations(dep) {
            return wireNumber1Combinations(dep);
        },
        /** Phase 17+: hands store + load-orchestration hand rebuild. */
        wireHands(dep) {
            return {
                restoreFromSaveSnapshot(snap) {
                    restoreHandsFromSaveSnapshot(snap, dep);
                }
            };
        },
        /** Phase 18b+: story store + banner boot; registers checkStoryBanners on story slice. */
        wireStory(dep, storyBannerBridge) {
            return wireNumber1Story(dep, storyBannerBridge);
        },
        /** Phase 18c+: objectives DOM flush boot (achievement flags live on objectives store). */
        wireObjectives(dep) {
            return wireNumber1Objectives(dep);
        },
        /** Phase 21a: speed / cheapen / slowdown upgrade boots. */
        wireUpgrades(dep) {
            return wireNumber1UpgradeBoots(dep);
        },
        /** Phase 21a: time warp boot on timewarp store. */
        wireTimeWarp(dep) {
            return wireNumber1TimeWarpBoot(dep);
        },
        /** Phase 21a: turbo gauge / scension DOM boot. */
        wireTurbo(dep) {
            return wireNumber1TurboBoot(dep);
        },
        /** Phase 21c: turbo meter burn, combo points, scension upgrades. */
        createTurboRuntimeBoot(dep) {
            return createTurboRuntimeBoot(dep);
        },
        /** Phase 21c: turbo gauge + scension panel DOM paint. */
        createTurboUiBoot(dep) {
            return createTurboUiBoot(dep);
        },
        /** Phase 21c: speed upgrade row DOM + scroll hints. */
        createSpeedUpgradeUiBoot(dep) {
            return createSpeedUpgradeUiBoot(dep);
        },
        /** Phase 21c: clap/turbo/tick-apply + loop runtime wiring. */
        wireLoop(dep) {
            return wireNumber1GameLoop(dep);
        },
        /** Phase 21c: assembles wireLoop dep from flat boot callbacks. */
        buildGameLoopWireDep(dep) {
            return buildNumber1GameLoopWireDep(dep);
        },
        /** Phase 21c: assembles dev-tools wire dep. */
        buildDevToolsWireDep(dep) {
            return buildN1DevToolsWireDep(dep);
        },
        /** Phase 21c: post-init UI refresh batch list. */
        buildBootFinishRefreshers(dep) {
            return buildNumber1BootFinishRefreshers(dep);
        },
        /** Phase 21c: save envelope, autosave, hydrate, offline progress. */
        wireSaveLoad(dep) {
            return wireNumber1SaveLoad(api, dep);
        },
        /** Phase 21c: settings + page panel DOM listeners. */
        wireShellDomListeners(dep) {
            return wireNumber1ShellDomListeners(dep);
        },
        /** Phase 21c: post-loop upgrade listeners, settings, save load, n2 bind. */
        finishShellBoot(dep) {
            finishNumber1ShellBoot(dep);
        },
        /** Phase 21c: settings load/persist/theme. */
        wireSettings(dep) {
            return createNumber1SettingsBoot(dep);
        },
        /** Phase 21c: number-mode play-stage visibility + global switch hooks. */
        wireShellModeSwitch(dep) {
            wireNumber1ShellModeSwitch(dep);
        },
        /** Phase 21c: play-stage visibility when switching number mode. */
        createSyncPlayStage(dep) {
            return createSyncPlayStageForNumberMode(dep);
        },
        /** Phase 21c: hand unlock milestones + first-hand bootstrap. */
        wireHandUnlock(dep) {
            return wireNumber1HandUnlock(dep);
        },
        /** Phase 21c: detached CPS while on Number 2 / offline. */
        wireDetachedCps(dep) {
            return createNumber1DetachedCpsBoot(dep);
        },
        /** Phase 21c: dev-freeze + story pause gate for simulation. */
        createGameplaySimFrozen(session) {
            return createGameplaySimFrozen(session);
        },
        /** Phase 21c: Number 2 nav unlock chrome. */
        wireNumber2Shell(dep) {
            return createNumber2ShellBoot(dep);
        },
        /** Phase 21c: objectives catalog + milestone DOM. */
        wireObjectivesLive(dep) {
            return wireNumber1ObjectivesLive(dep);
        },
        /** Phase 21c: story banner milestone catalog. */
        createStoryBanners(dep) {
            return createNumber1StoryBanners(dep);
        },
        /** Phase 21c: total-count milestone unlock sync. */
        wireMilestoneUnlocks(dep) {
            return createSyncUnlocksWithTotalCount(dep);
        },
        /** Phase 21c: ascension intro/confirm flow. */
        wireAscensionFlow(dep) {
            return wireNumber1AscensionFlow(dep);
        },
        /** Phase 15a: ascension hub stats pills + grant summary HTML. */
        createAscensionHubRender(dep) {
            return createAscensionHubRender(dep);
        },
        /** Phase 15b: ascension-page black hole panel HTML. */
        createBlackHolePanelRender(dep) {
            return createNumber1BlackHolePanelRender(dep);
        },
        /** Phase 15c: ascend control + map hub + ascension page shell HTML. */
        createAscensionPageRender(dep) {
            return createAscensionPageRender(dep);
        },
        /** Phase 21c: ascension node buy/respec + map collapse. */
        wireAscensionNodeActions(dep) {
            return wireNumber1AscensionNodeActions(dep);
        },
        /** Phase 21c: perform ascension economy + lane reset hooks. */
        wireAscensionPerform(dep) {
            return wireNumber1AscensionPerform(dep);
        },
        /** Phase 21c: ascension map UI delegates (pan/zoom, layout, SVG). */
        createAscensionMapFacade(ascMapUi) {
            return createAscensionMapFacade(ascMapUi);
        },
        /** Phase 21c: global overview card payloads + HTML. */
        createGlobalOverviewBoot(dep) {
            return createGlobalOverviewBoot(dep);
        },
        /** Phase 21c: message log + story archive page HTML. */
        createMessageStoryLogPageBoot(dep) {
            return createMessageStoryLogPageBoot(dep);
        },
        /** Phase 21c: right-rail page panel router. */
        createPagePanelBoot(dep) {
            return createPagePanelBoot(dep);
        },
        /** Phase 21c: ascension nav button + ready banner chrome. */
        createAscensionReadyChrome(dep) {
            return createAscensionReadyChrome(dep);
        },
        /** Phase 21c: ascension grant accessors (autobuy, cheapen cap, turbo meter). */
        createAscensionGrantAccessorsBoot(dep) {
            return createAscensionGrantAccessorsBoot(dep);
        },
        /** Phase 21c: combinations/ascension page nav unlock visibility. */
        createPageButtonUnlocksBoot(dep) {
            return createPageButtonUnlocksBoot(dep);
        },
        /** Phase 21c: overview + ascension panel refresh / live DOM patch. */
        wireOverviewAscensionPanels(dep) {
            return createOverviewAscensionPanelsRefresh(dep);
        },
        /** Post-init UI refresh batch (Phase 10). */
        finishBootRefresh(refreshers) {
            refreshers.forEach(fn => fn());
        },
        /** Number 1 shell entry. */
        boot() {
            return runNumber1Boot({ n1Boot: api, runtime: deps.runtime, dom: deps.dom });
        }
    };

    return api;
}
