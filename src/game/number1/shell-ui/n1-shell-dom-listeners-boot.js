import { N1_DEFAULT_SETTINGS } from "../state/n1-session-store.js";
import { SAVE_KEY } from "../../n1-save.js";

/**
 * Settings menu, page panels, ascension/BH click routing (Phase 21c).
 *
 * @param {object} dep
 */
export function wireNumber1ShellDomListeners(dep) {
    const {
        session,
        menuBtn,
        settingsPanelEl,
        settingsCloseBtn,
        settingsDeleteSaveBtn,
        deleteSaveOverlayEl,
        deleteSaveNoBtn,
        deleteSaveYesBtn,
        settingsThemeDarkEl,
        settingsAdaptiveTipsEl,
        settingsCurtainEnabledEl,
        settingsHumorEnabledEl,
        settingsShowClapAnimationEl,
        settingsOfflineCapHoursEl,
        offlineSummaryCloseBtn,
        offlineSummaryPanelEl,
        pageButtons,
        pagePanelCloseBtn,
        pagePanelEl,
        pagePanelBodyEl,
        closeInlineMainStagePanels,
        syncInlinePanelsVsGameplay,
        applyTheme,
        persistSettings,
        addToLog,
        getAdaptiveTipMessage,
        logTickerRt,
        renderActionLog,
        refreshMessageLogPanelIfOpen,
        showPagePanel,
        syncMessageLogScrollContainerMode,
        teardownAscensionMapPanZoom,
        getStoryBannerById,
        hasUnlockedStoryBanner,
        showStoryBanner,
        comboForward,
        bindBlackHoleUpgradePreviewListeners,
        ascension,
        isNumber2Unlocked,
        renderAscensionPageHtml,
        syncPhase1MassFillCssVars,
        syncPhase1TesseractCanvasesInRoot,
        afterBlackHolePanelMounted,
        initAscensionMapPanZoom,
        number2,
        tryBuyAscensionNode,
        tryBuyNumber1BlackHole,
        tryBuyBlackHolePhase2CollapseUpgrade,
        tryBuyBlackHolePhase3DiskUpgrade,
        tryBuyBlackHolePhase6JetUpgrade,
        tryStartNumber1BlackHoleArc,
        triggerBlackHoleWaveManual,
        queueBlackHoleUiRefresh,
        sacrificeNextHandToFurnace,
        chooseBlackHoleFurnaceMutation,
        tryToggleJet,
        beginNumber1AscensionFlow,
        ascensionResolveNodeIdAtClient,
        setAscensionMapSelectedNode,
        respecNumber1AscensionFinger,
        respecNumber1AscensionSkillTrees,
        consumeAscendNumber1Button
    } = dep;

    function showDeleteSaveConfirmDialog() {
        session.gamePaused = true;
        if (deleteSaveOverlayEl) deleteSaveOverlayEl.style.display = "flex";
    }
    function hideDeleteSaveConfirmDialog() {
        if (deleteSaveOverlayEl) deleteSaveOverlayEl.style.display = "none";
        session.gamePaused = false;
    }
    function executeDeleteSaveAndReload() {
        session.suppressAutosave = true;
        try {
            localStorage.removeItem(SAVE_KEY);
        } catch (_) {}
        location.reload();
    }

    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            if (!settingsPanelEl) return;
            const openNext = settingsPanelEl.style.display === "none";
            const applyToggle = () => {
                if (openNext) {
                    closeInlineMainStagePanels({ keep: "settings" });
                    settingsPanelEl.style.display = "block";
                } else {
                    settingsPanelEl.style.display = "none";
                    syncInlinePanelsVsGameplay();
                }
            };
            applyToggle();
        });
    }
    if (settingsCloseBtn) {
        settingsCloseBtn.addEventListener("click", () => {
            if (settingsPanelEl) settingsPanelEl.style.display = "none";
            syncInlinePanelsVsGameplay();
        });
    }
    if (settingsDeleteSaveBtn) {
        settingsDeleteSaveBtn.addEventListener("click", () => {
            if (settingsPanelEl) settingsPanelEl.style.display = "none";
            syncInlinePanelsVsGameplay();
            showDeleteSaveConfirmDialog();
        });
    }
    if (deleteSaveNoBtn) deleteSaveNoBtn.addEventListener("click", () => hideDeleteSaveConfirmDialog());
    if (deleteSaveYesBtn) deleteSaveYesBtn.addEventListener("click", () => executeDeleteSaveAndReload());
    if (settingsThemeDarkEl) {
        settingsThemeDarkEl.addEventListener("change", () => {
            session.settings.theme = settingsThemeDarkEl.checked ? "dark" : "light";
            applyTheme();
            persistSettings();
        });
    }
    if (settingsAdaptiveTipsEl) {
        settingsAdaptiveTipsEl.addEventListener("change", () => {
            session.settings.adaptiveTipsEnabled = settingsAdaptiveTipsEl.checked;
            if (session.settings.adaptiveTipsEnabled) {
                addToLog(getAdaptiveTipMessage(), "tip");
                logTickerRt.restartAdaptiveTipClockAfterSettingsTurnOn();
            }
            persistSettings();
        });
    }
    if (settingsCurtainEnabledEl) {
        settingsCurtainEnabledEl.addEventListener("change", () => {
            session.settings.curtainEnabled = settingsCurtainEnabledEl.checked;
            persistSettings();
        });
    }
    if (settingsHumorEnabledEl) {
        settingsHumorEnabledEl.addEventListener("change", () => {
            session.settings.humorEnabled = settingsHumorEnabledEl.checked;
            persistSettings();
            renderActionLog();
            refreshMessageLogPanelIfOpen();
        });
    }
    if (settingsShowClapAnimationEl) {
        settingsShowClapAnimationEl.addEventListener("change", () => {
            session.settings.showClapAnimation = settingsShowClapAnimationEl.checked;
            persistSettings();
        });
    }
    if (settingsOfflineCapHoursEl) {
        settingsOfflineCapHoursEl.addEventListener("change", () => {
            const n = Number(settingsOfflineCapHoursEl.value);
            session.settings.offlineCapHours = Number.isFinite(n) && n >= 0 ? n : N1_DEFAULT_SETTINGS.offlineCapHours;
            settingsOfflineCapHoursEl.value = String(session.settings.offlineCapHours);
            persistSettings();
        });
    }
    if (offlineSummaryCloseBtn) {
        offlineSummaryCloseBtn.addEventListener("click", () => {
            if (offlineSummaryPanelEl) offlineSummaryPanelEl.style.display = "none";
        });
    }
    pageButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const pageId = btn.getAttribute("data-page");
            showPagePanel(pageId);
        });
    });
    if (pagePanelCloseBtn) {
        pagePanelCloseBtn.addEventListener("click", () => {
            if (pagePanelEl) {
                const wasAscension = pagePanelEl.dataset.openPageId === "ascension";
                pagePanelEl.style.display = "none";
                delete pagePanelEl.dataset.openPageId;
                syncMessageLogScrollContainerMode("");
                if (wasAscension) teardownAscensionMapPanZoom();
            }
            syncInlinePanelsVsGameplay();
        });
    }
    if (pagePanelBodyEl) {
        pagePanelBodyEl.addEventListener("pointerup", function(e) {
            const replayBtn = e.target.closest("[data-story-replay-id]");
            if (replayBtn) {
                e.preventDefault();
                e.stopPropagation();
                const banner = getStoryBannerById(replayBtn.getAttribute("data-story-replay-id"));
                if (banner && hasUnlockedStoryBanner(banner.id)) showStoryBanner(banner, { isReplay: true });
                return;
            }
            const statusBtn = e.target.closest("[data-combo-status]");
            if (statusBtn) {
                e.preventDefault();
                e.stopPropagation();
                const now = Date.now();
                if (!comboForward.consumeComboFilterClickDebounced(now)) return;
                comboForward.setComboIndexStatusFilter(statusBtn.getAttribute("data-combo-status") || "all");
                comboForward.refreshCombinationsPanelIfOpen(true);
                return;
            }
            const handsBtn = e.target.closest("[data-combo-hands]");
            if (handsBtn) {
                e.preventDefault();
                e.stopPropagation();
                const now = Date.now();
                if (!comboForward.consumeComboFilterClickDebounced(now)) return;
                comboForward.setComboIndexHandsFilter(handsBtn.getAttribute("data-combo-hands") || "all");
                comboForward.refreshCombinationsPanelIfOpen(true);
            }
        });
    }

    if (pagePanelEl) {
        bindBlackHoleUpgradePreviewListeners?.(pagePanelEl);
        pagePanelEl.addEventListener("click", function(e) {
            const ascTab = e.target.closest("[data-asc-tab]");
            if (ascTab && pagePanelEl.dataset.openPageId === "ascension" && pagePanelBodyEl) {
                const t = parseInt(ascTab.getAttribute("data-asc-tab"), 10);
                if (t === 1 || t === 2) {
                    if (t === 2 && !isNumber2Unlocked()) return;
                    if (ascension.ascensionPageActiveNumber === t) return;
                    const wasTab1 = ascension.ascensionPageActiveNumber === 1;
                    ascension.ascensionPageActiveNumber = t;
                    if (wasTab1 && t !== 1) teardownAscensionMapPanZoom();
                    pagePanelBodyEl.innerHTML = renderAscensionPageHtml();
                    syncPhase1MassFillCssVars();
                    syncPhase1TesseractCanvasesInRoot(pagePanelBodyEl);
                    const bhElTab = pagePanelBodyEl.querySelector(".asc-black-hole");
                    if (bhElTab) afterBlackHolePanelMounted?.(bhElTab);
                    if (t === 1 && ascension.number1HasAscended) {
                        requestAnimationFrame(() => initAscensionMapPanZoom());
                    }
                }
                return;
            }
            const asc2Buy = e.target.closest("[data-asc2-buy]");
            if (asc2Buy && pagePanelEl.dataset.openPageId === "ascension" && ascension.ascensionPageActiveNumber === 2 && pagePanelBodyEl) {
                e.preventDefault();
                const nid = asc2Buy.getAttribute("data-asc2-buy");
                number2.tryBuyAscensionNode(nid);
                return;
            }
            const ascBhBuy = e.target.closest("[data-asc-black-hole-buy]");
            if (ascBhBuy && pagePanelEl.dataset.openPageId === "ascension" && ascension.ascensionPageActiveNumber === 1 && pagePanelBodyEl) {
                e.preventDefault();
                tryBuyNumber1BlackHole();
                return;
            }
            const ascBhP2 = e.target.closest("[data-asc-black-hole-p2]");
            if (ascBhP2 && pagePanelEl.dataset.openPageId === "ascension" && ascension.ascensionPageActiveNumber === 1 && pagePanelBodyEl) {
                e.preventDefault();
                tryBuyBlackHolePhase2CollapseUpgrade(ascBhP2.getAttribute("data-asc-black-hole-p2") || "");
                return;
            }
            const ascBhP3 = e.target.closest("[data-asc-black-hole-p3]");
            if (ascBhP3 && pagePanelEl.dataset.openPageId === "ascension" && ascension.ascensionPageActiveNumber === 1 && pagePanelBodyEl) {
                e.preventDefault();
                tryBuyBlackHolePhase3DiskUpgrade(ascBhP3.getAttribute("data-asc-black-hole-p3") || "");
                return;
            }
            const ascBhP6 = e.target.closest("[data-asc-black-hole-p6]");
            if (ascBhP6 && pagePanelEl.dataset.openPageId === "ascension" && ascension.ascensionPageActiveNumber === 1 && pagePanelBodyEl) {
                e.preventDefault();
                tryBuyBlackHolePhase6JetUpgrade(ascBhP6.getAttribute("data-asc-black-hole-p6") || "");
                return;
            }
            const ascBhStart = e.target.closest("[data-asc-black-hole-start]");
            if (ascBhStart && pagePanelEl.dataset.openPageId === "ascension" && ascension.ascensionPageActiveNumber === 1 && pagePanelBodyEl) {
                e.preventDefault();
                tryStartNumber1BlackHoleArc();
                return;
            }
            const ascBhWave = e.target.closest("[data-asc-black-hole-wave]");
            if (ascBhWave && pagePanelEl.dataset.openPageId === "ascension" && ascension.ascensionPageActiveNumber === 1 && pagePanelBodyEl) {
                e.preventDefault();
                triggerBlackHoleWaveManual();
                queueBlackHoleUiRefresh();
                return;
            }
            const ascBhSacrifice = e.target.closest("[data-asc-black-hole-sacrifice]");
            if (ascBhSacrifice && pagePanelEl.dataset.openPageId === "ascension" && ascension.ascensionPageActiveNumber === 1 && pagePanelBodyEl) {
                e.preventDefault();
                sacrificeNextHandToFurnace();
                queueBlackHoleUiRefresh();
                return;
            }
            const ascBhMutation = e.target.closest("[data-asc-black-hole-mutation]");
            if (ascBhMutation && pagePanelEl.dataset.openPageId === "ascension" && ascension.ascensionPageActiveNumber === 1 && pagePanelBodyEl) {
                e.preventDefault();
                chooseBlackHoleFurnaceMutation(ascBhMutation.getAttribute("data-asc-black-hole-mutation") || "");
                queueBlackHoleUiRefresh();
                return;
            }
            const ascBhJet = e.target.closest("[data-asc-black-hole-jet]");
            if (ascBhJet && pagePanelEl.dataset.openPageId === "ascension" && ascension.ascensionPageActiveNumber === 1 && pagePanelBodyEl) {
                e.preventDefault();
                tryToggleJet(ascBhJet.getAttribute("data-asc-black-hole-jet") === "on");
                queueBlackHoleUiRefresh();
                return;
            }
            const openAsc = e.target.closest("[data-open-ascension]");
            if (openAsc) {
                e.preventDefault();
                showPagePanel("ascension");
                return;
            }
            const openAscN2 = e.target.closest("[data-open-ascension-n2]");
            if (openAscN2) {
                e.preventDefault();
                ascension.ascensionPageActiveNumber = 2;
                showPagePanel("ascension");
                return;
            }
            const ascMapViewport = e.target.closest("#ascension-map-viewport");
            if (ascMapViewport && ascension.number1HasAscended) {
                const blockAscMapInteract = e.target.closest(
                    "button, a, [data-asc-respec-finger], [data-asc-respec], .ascension-respec-btn, .asc-tree-respec-btn, .ascension-map-toolbar"
                );
                if (!blockAscMapInteract) {
                    const nodeEl = e.target && typeof e.target.closest === "function" ? e.target.closest(".asc-map-node") : null;
                    let nid = ascensionResolveNodeIdAtClient(e.clientX, e.clientY);
                    if (!nid && nodeEl && nodeEl.getAttribute("data-asc-node-id")) {
                        nid = nodeEl.getAttribute("data-asc-node-id");
                    }
                    if (nid) {
                        setAscensionMapSelectedNode(nid);
                        tryBuyAscensionNode(nid);
                    } else {
                        setAscensionMapSelectedNode(null);
                    }
                    return;
                }
            }
            const ascFingerRespec = e.target.closest("[data-asc-respec-finger]");
            if (ascFingerRespec) {
                const fk = ascFingerRespec.getAttribute("data-asc-respec-finger");
                if (fk) respecNumber1AscensionFinger(fk);
                return;
            }
            if (e.target.closest("[data-asc-respec]")) {
                respecNumber1AscensionSkillTrees();
                return;
            }
            if (consumeAscendNumber1Button(e.target, () => beginNumber1AscensionFlow())) return;
        });
    }

    return {
        showDeleteSaveConfirmDialog,
        hideDeleteSaveConfirmDialog,
        executeDeleteSaveAndReload
    };
}
