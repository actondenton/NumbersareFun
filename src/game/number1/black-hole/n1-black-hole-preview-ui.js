import {
    getBlackHoleUpgradePreview,
    PREVIEW_HINT_HELD_ONLY,
    PREVIEW_HINT_READY
} from "./n1-black-hole-upgrade-preview.js";

/**
 * DOM enhancement + hover handlers for black-hole upgrade previews.
 */
export function createBlackHolePreviewUi(deps) {
    let activePreviewHost = null;
    let activePreviewButton = null;
    let listenersBound = false;

    function wrapPreviewActionButton(btn) {
        if (!btn || btn.dataset.ascBhPreviewWrapped === "1") return btn;
        const labelText = btn.textContent.trim();
        btn.textContent = "";
        btn.classList.add("page-btn--bh-preview");
        btn.dataset.ascBhPreviewWrapped = "1";
        const label = document.createElement("span");
        label.className = "asc-bh-preview-btn__label";
        label.textContent = labelText;
        const hint = document.createElement("span");
        hint.className = "asc-bh-preview-btn__hint";
        hint.setAttribute("aria-hidden", "true");
        btn.appendChild(label);
        btn.appendChild(hint);
        return btn;
    }

    function registerPreviewButton(btn, actionKey) {
        if (!btn) return;
        btn.dataset.ascBhPreviewAction = actionKey;
        wrapPreviewActionButton(btn);
    }

    function registerPreviewAction(host, btn, actionKey) {
        if (host) host.dataset.ascBhPreviewAction = actionKey;
        if (btn) {
            wrapPreviewActionButton(btn);
            if (!host || host === btn) btn.dataset.ascBhPreviewAction = actionKey;
            else delete btn.dataset.ascBhPreviewAction;
        }
    }

    function resolvePreviewTarget(el) {
        if (!el || !el.closest) return { host: null, btn: null, actionKey: "" };
        const host = el.closest("[data-asc-bh-preview-action]");
        if (!host) return { host: null, btn: null, actionKey: "" };
        const actionKey = host.dataset.ascBhPreviewAction || "";
        const btn = host.tagName === "BUTTON" ? host : host.querySelector("button");
        return { host: host, btn: btn, actionKey: actionKey };
    }

    function setPreviewButtonLabel(btn, text) {
        if (!btn) return;
        if (btn.dataset.ascBhPreviewWrapped === "1") {
            const label = btn.querySelector(".asc-bh-preview-btn__label");
            if (label) label.textContent = text;
        } else {
            btn.textContent = text;
        }
    }

    function wrapStatCycle(el, statKey, useHtml) {
        if (!el || el.dataset.previewWrapped === "1") return el;
        const sourceHtml = useHtml ? el.innerHTML : null;
        const sourceText = el.textContent;
        el.textContent = "";
        el.dataset.previewWrapped = "1";
        el.dataset.previewStat = statKey;
        el.classList.add("asc-bh-stat-cycle");
        const current = document.createElement("span");
        current.className = "asc-bh-stat-cycle__current";
        if (useHtml && sourceHtml) current.innerHTML = sourceHtml;
        else current.textContent = sourceText;
        const future = document.createElement("span");
        future.className = "asc-bh-stat-cycle__future";
        el.appendChild(current);
        el.appendChild(future);
        return el;
    }

    function setPreviewStatCurrent(bhEl, key, value, useHtml) {
        const host = bhEl.querySelector('[data-preview-stat="' + key + '"]');
        if (!host) return;
        const current = host.querySelector(".asc-bh-stat-cycle__current") || host;
        if (useHtml) current.innerHTML = value;
        else current.textContent = value;
    }

    function enhanceBlackHolePreviewMarkup(bhEl) {
        if (!bhEl || bhEl.dataset.previewEnhanced === "1") return;
        bhEl.dataset.previewEnhanced = "1";
        const phase = deps.getBlackHolePhase();

        if (phase === 0 || phase === 1) {
            const meterNums = bhEl.querySelector(".asc-black-hole__mass-meter-nums");
            if (meterNums) wrapStatCycle(meterNums, "massMeter", true);
            bhEl.querySelectorAll(".asc-black-hole__effect-val[data-asc-p1-effect]").forEach(function (el) {
                wrapStatCycle(el, el.getAttribute("data-asc-p1-effect"), false);
            });
            const pourBtn = bhEl.querySelector(".page-btn--mass-pour");
            registerPreviewAction(pourBtn && pourBtn.closest(".asc-black-hole__buy"), pourBtn, "p1-pour");
        }

        if (phase === 2) {
            const parallelNums = bhEl.querySelector(".asc-black-hole__parallel-meter-wrap .asc-black-hole__mass-meter-nums");
            if (parallelNums) wrapStatCycle(parallelNums, "parallelMeter", true);
            bhEl.querySelectorAll("[data-asc-black-hole-p2-row]").forEach(function (row) {
                const track = row.getAttribute("data-asc-black-hole-p2-row");
                if (!track) return;
                registerPreviewAction(row, row.querySelector("[data-asc-black-hole-p2]"), "p2-" + track);
                const tierStrong = row.querySelector(".asc-black-hole__p2-tier strong");
                if (tierStrong) wrapStatCycle(tierStrong, "p2-tier-" + track, false);
                const effect = row.querySelector(".asc-black-hole__p2-effect");
                if (effect) wrapStatCycle(effect, "p2-effect-" + track, true);
            });
            const pourMassBtn = bhEl.querySelector("[data-asc-black-hole-buy=\"1\"]");
            registerPreviewAction(pourMassBtn && pourMassBtn.closest(".asc-black-hole__buy"), pourMassBtn, "p2-pour-mass");
            const phaseStat = bhEl.querySelector("[data-asc-bh-phase-stats]");
            if (phaseStat) wrapStatCycle(phaseStat, "phaseStats", true);
        }

        if (phase === 3) {
            bhEl.querySelectorAll(".asc-black-hole__disk-row").forEach(function (row) {
                const trackClass = Array.from(row.classList).find(c => c.indexOf("asc-black-hole__disk-row--") === 0);
                if (!trackClass) return;
                const track = trackClass.replace("asc-black-hole__disk-row--", "");
                registerPreviewAction(row, row.querySelector("[data-asc-black-hole-p3]"), "p3-" + track);
                const tierStrong = row.querySelector(".asc-black-hole__p2-tier strong");
                if (tierStrong) wrapStatCycle(tierStrong, "p3-tier-" + track, false);
            });
        }

        if (phase === 4) {
            const pourBtn = bhEl.querySelector("[data-asc-black-hole-buy=\"1\"]");
            registerPreviewAction(pourBtn && pourBtn.closest(".asc-black-hole__buy"), pourBtn, "p4-pour");
            const phaseStat = bhEl.querySelector(".asc-black-hole__stats:not(.asc-black-hole__purse):not(.asc-black-hole__total-mult)");
            if (phaseStat) wrapStatCycle(phaseStat, "phaseStats", true);
        }

        if (phase === 5) {
            const stokeBtn = bhEl.querySelector("[data-asc-black-hole-stoke-preview-toggle]");
            registerPreviewAction(stokeBtn && stokeBtn.closest(".asc-black-hole__buy"), stokeBtn, "p5-stoke");
            const stokePreview = bhEl.querySelector("#asc-black-hole-stoke-preview");
            if (stokePreview) wrapStatCycle(stokePreview, "stokeLine", true);
        }

        if (phase === 6) {
            bhEl.querySelectorAll(".asc-black-hole__p2-row").forEach(function (row, idx) {
                const tracks = ["drain", "boost", "bank"];
                const track = tracks[idx];
                if (!track) return;
                registerPreviewAction(row, row.querySelector("[data-asc-black-hole-p6]"), "p6-" + track);
                const tierStrong = row.querySelector(".asc-black-hole__p2-tier strong");
                if (tierStrong) wrapStatCycle(tierStrong, "p6-tier-" + track, false);
            });
        }

        const multStrong = bhEl.querySelector(".asc-black-hole__total-mult strong");
        if (multStrong) wrapStatCycle(multStrong, "totalMult", false);

        const phaseStats = bhEl.querySelector("[data-asc-bh-phase-stats]");
        if (phaseStats && !phaseStats.dataset.previewWrapped) wrapStatCycle(phaseStats, "phaseStats", true);

        const phaseStatsDisk = bhEl.querySelector("[data-asc-bh-disk-phase-stats]");
        if (phaseStatsDisk && !phaseStatsDisk.dataset.previewWrapped) wrapStatCycle(phaseStatsDisk, "phaseStats", true);

    }

    function clearButtonPreviewHint(btn) {
        if (!btn) return;
        const hint = btn.querySelector(".asc-bh-preview-btn__hint");
        if (hint) {
            hint.textContent = "";
            hint.setAttribute("aria-hidden", "true");
        }
        btn.classList.remove("page-btn--bh-preview-hint-visible");
        btn.removeAttribute("aria-describedby");
    }

    function setPreviewHint(btn, text) {
        if (!btn) return;
        wrapPreviewActionButton(btn);
        const hint = btn.querySelector(".asc-bh-preview-btn__hint");
        if (!hint) return;
        hint.textContent = text || "";
        hint.setAttribute("aria-hidden", text ? "false" : "true");
        btn.classList.toggle("page-btn--bh-preview-hint-visible", !!text);
        if (text) {
            if (!hint.id) {
                const actionKey = btn.closest("[data-asc-bh-preview-action]")?.dataset.ascBhPreviewAction || btn.dataset.ascBhPreviewAction || "active";
                hint.id = "asc-bh-preview-hint-" + actionKey;
            }
            btn.setAttribute("aria-describedby", hint.id);
        } else {
            btn.removeAttribute("aria-describedby");
        }
    }

    function clearPreviewHint(panel) {
        if (!panel) return;
        panel.querySelectorAll(".page-btn--bh-preview-hint-visible").forEach(clearButtonPreviewHint);
    }

    function buildPreviewDeps() {
        return {
            getHeldEssence: deps.getAscensionEssence,
            isAscendReady: deps.isNumber1AscensionReady,
            getAscensionGainBreakdown: deps.getAscensionGainBreakdown,
            getBlackHolePhase: deps.getBlackHolePhase,
            getBlackHoleState: deps.getBlackHoleState,
            getSlowdownCapBase: deps.getSlowdownCapBase,
            formatBlackHolePhase1CpsMultForUi: deps.formatBlackHolePhase1CpsMultForUi,
            getJetMult: deps.getJetMult,
            escapeHtml: deps.escapeHtml,
            formatCount: deps.formatCount,
            previewHintReady: PREVIEW_HINT_READY,
            previewHintHeldOnly: PREVIEW_HINT_HELD_ONLY,
            getStokePreviewStats: deps.getStokePreviewStats
        };
    }

    function applyPreviewValues(bhEl, preview, btn) {
        if (!bhEl || !preview) return;
        Object.keys(preview.future).forEach(function (key) {
            const host = bhEl.querySelector('[data-preview-stat="' + key + '"]');
            if (!host) return;
            const future = host.querySelector(".asc-bh-stat-cycle__future");
            if (!future) return;
            const val = preview.future[key];
            if (key.indexOf("effect") >= 0 || key === "massMeter" || key === "parallelMeter" || key === "phaseStats" || key === "stokeLine") {
                future.innerHTML = val;
            } else {
                future.textContent = val;
            }
        });
        const fillFuture = preview.future.massFillWidth;
        if (fillFuture != null) {
            const previewFill = bhEl.querySelector(".asc-black-hole__mass-meter-fill-preview");
            if (previewFill) previewFill.style.width = fillFuture + "%";
        }
        const parallelFill = preview.future.parallelFillWidth;
        if (parallelFill != null) {
            const previewFill = bhEl.querySelector(".asc-black-hole__parallel-meter-fill-preview");
            if (previewFill) previewFill.style.width = parallelFill + "%";
        }
        const stokeFill = preview.future.stokeFillWidth;
        if (stokeFill != null) {
            const bar = bhEl.querySelector(".asc-black-hole__furnace-meter-preview");
            if (bar) bar.style.width = stokeFill + "%";
        }
        if (btn) setPreviewHint(btn, preview.hint);
        else clearPreviewHint(bhEl);
    }

    function clearPreviewValues(bhEl) {
        if (!bhEl) return;
        bhEl.querySelectorAll(".asc-bh-stat-cycle__future").forEach(function (el) {
            el.textContent = "";
            el.innerHTML = "";
        });
        bhEl.querySelectorAll(".asc-black-hole__mass-meter-fill-preview, .asc-black-hole__parallel-meter-fill-preview").forEach(function (el) {
            el.style.width = "0%";
        });
        clearPreviewHint(bhEl);
    }

    function activatePreview(host, btn, actionKey) {
        if (!host || !btn || !actionKey) return;
        const panel = host.closest(".asc-black-hole");
        if (!panel) return;
        activePreviewHost = host;
        activePreviewButton = btn;
        const preview = getBlackHoleUpgradePreview(actionKey, buildPreviewDeps());
        panel.classList.add("asc-black-hole--upgrade-preview-active");
        if (actionKey === "p5-stoke") panel.classList.add("asc-black-hole--stoke-preview-active");
        if (preview) applyPreviewValues(panel, preview, btn);
        else clearPreviewValues(panel);
    }

    function deactivatePreview() {
        const panel = activePreviewHost && activePreviewHost.closest ? activePreviewHost.closest(".asc-black-hole") : null;
        if (panel) {
            panel.classList.remove("asc-black-hole--upgrade-preview-active", "asc-black-hole--stoke-preview-active");
            clearPreviewValues(panel);
        }
        activePreviewHost = null;
        activePreviewButton = null;
    }

    function refreshActivePreview(bhEl) {
        if (!activePreviewHost || !activePreviewButton || !bhEl || !bhEl.contains(activePreviewHost)) return;
        activatePreview(activePreviewHost, activePreviewButton, activePreviewHost.dataset.ascBhPreviewAction || activePreviewButton.dataset.ascBhPreviewAction);
    }

    function bindBlackHoleUpgradePreviewListeners(pagePanelEl) {
        if (!pagePanelEl || listenersBound) return;
        listenersBound = true;

        pagePanelEl.addEventListener("pointerover", function (e) {
            const target = resolvePreviewTarget(e.target);
            if (!target.host || !target.btn || !target.actionKey) return;
            if (activePreviewHost === target.host) return;
            activatePreview(target.host, target.btn, target.actionKey);
        });
        pagePanelEl.addEventListener("pointerout", function (e) {
            if (!activePreviewHost) return;
            const leaving = resolvePreviewTarget(e.target);
            if (leaving.host !== activePreviewHost) return;
            if (e.relatedTarget && activePreviewHost.contains(e.relatedTarget)) return;
            deactivatePreview();
        });
        pagePanelEl.addEventListener("focusin", function (e) {
            const target = resolvePreviewTarget(e.target);
            if (!target.host || !target.btn || !target.actionKey) return;
            activatePreview(target.host, target.btn, target.actionKey);
        });
        pagePanelEl.addEventListener("focusout", function (e) {
            if (!activePreviewButton) return;
            const target = resolvePreviewTarget(e.target);
            if (target.btn !== activePreviewButton) return;
            deactivatePreview();
        });
    }

    function ensureMeterPreviewBars(bhEl) {
        const massTrack = bhEl.querySelector(".asc-black-hole__mass-meter-track:not(.asc-black-hole__parallel-meter-track):not(.asc-black-hole__furnace-meter-track)");
        if (massTrack && !massTrack.querySelector(".asc-black-hole__mass-meter-fill-preview")) {
            const previewFill = document.createElement("div");
            previewFill.className = "asc-black-hole__mass-meter-fill asc-black-hole__mass-meter-fill-preview";
            previewFill.style.width = "0%";
            massTrack.insertBefore(previewFill, massTrack.firstChild);
        }
        const parallelTrack = bhEl.querySelector(".asc-black-hole__parallel-meter-track");
        if (parallelTrack && !parallelTrack.querySelector(".asc-black-hole__parallel-meter-fill-preview")) {
            const previewFill = document.createElement("div");
            previewFill.className = "asc-black-hole__mass-meter-fill asc-black-hole__parallel-meter-fill asc-black-hole__parallel-meter-fill-preview";
            previewFill.style.width = "0%";
            parallelTrack.insertBefore(previewFill, parallelTrack.querySelector(".asc-black-hole__parallel-meter-fill"));
        }
    }

    function afterPanelMounted(bhEl) {
        if (!bhEl) return;
        if (bhEl.dataset.previewEnhanced !== "1") {
            enhanceBlackHolePreviewMarkup(bhEl);
        }
        ensureMeterPreviewBars(bhEl);
        refreshActivePreview(bhEl);
    }

    return {
        setPreviewStatCurrent,
        setPreviewButtonLabel,
        enhanceBlackHolePreviewMarkup,
        bindBlackHoleUpgradePreviewListeners,
        afterPanelMounted,
        refreshActivePreview
    };
}
