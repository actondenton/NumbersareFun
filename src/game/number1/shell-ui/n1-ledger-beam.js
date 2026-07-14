const LEDGER_BEAM_MAX_FULL_PER_SEC = 5;
const LEDGER_BEAM_TRAVEL_MS = 920;
const LEDGER_BEAM_HOLD_AT_SINK_MS = 220;
/** Ledger pop at sink: total time on screen before removal (float-up + fade span this whole window). */
const LEDGER_BEAM_POP_DISPLAY_MS = 1680;
/** Clap level pop: 2× combo pop — hold old, reel bonus, then slow fade. */
const LEDGER_BEAM_CLAP_POP_DISPLAY_MS = 3360;
const LEDGER_BEAM_CLAP_POP_HOLD_MS = 700;
const LEDGER_BEAM_CLAP_POP_ROLL_MS = 900;
const LEDGER_BEAM_CLAP_STAGGER_MS = 90;
const LEDGER_BEAM_SINK_MAX_DRIFT_PX = 40;
const LEDGER_BEAM_NOISE_STEPS = 26;

function compactText(el) {
    return el ? el.textContent.replace(/\s+/g, " ").trim() : "";
}

/** Parse "3 +2" / "3" compact level text → { base, bonus } or null. */
function parseClapLevelPart(text) {
    const m = String(text || "")
        .trim()
        .match(/^(\d+)\s*(?:\+(\d+))?$/);
    if (!m) return null;
    return { base: m[1], bonus: m[2] != null ? Number(m[2]) : 0 };
}

/**
 * @returns {{ mode: "bonus", base: string, oldBonus: number, newBonus: number }
 *   | { mode: "full", oldLabel: string, newLabel: string }}
 */
function resolveClapReelParts(oldText, newText) {
    const oldP = parseClapLevelPart(oldText);
    const newP = parseClapLevelPart(newText);
    if (oldP && newP && oldP.base === newP.base) {
        return { mode: "bonus", base: newP.base, oldBonus: oldP.bonus, newBonus: newP.bonus };
    }
    return {
        mode: "full",
        oldLabel: String(oldText || "—").trim() || "—",
        newLabel: String(newText || "—").trim() || "—"
    };
}

export function createLedgerBeamVfx(deps) {
    let ledgerBeamFullEventTimesMs = [];
    let ledgerBeamLayerEl = null;

    function getWindow() {
        return deps.window || window;
    }

    function getDocument() {
        return deps.document || document;
    }

    function getCurrentNumberMode() {
        return typeof deps.getCurrentNumberMode === "function" ? deps.getCurrentNumberMode() : 1;
    }

    function ensureLedgerBeamLayer() {
        if (ledgerBeamLayerEl && ledgerBeamLayerEl.parentNode) return ledgerBeamLayerEl;
        const doc = getDocument();
        const el = doc.createElement("div");
        el.id = "ledger-beam-layer";
        el.className = "ledger-beam-layer";
        el.setAttribute("aria-hidden", "true");
        doc.body.appendChild(el);
        ledgerBeamLayerEl = el;
        return el;
    }

    function ledgerBeamAllowFullTravel() {
        const now = Date.now();
        ledgerBeamFullEventTimesMs = ledgerBeamFullEventTimesMs.filter(t => now - t < 1000);
        if (ledgerBeamFullEventTimesMs.length >= LEDGER_BEAM_MAX_FULL_PER_SEC) return false;
        ledgerBeamFullEventTimesMs.push(now);
        return true;
    }

    function ledgerBeamPrefersReducedMotion() {
        const win = getWindow();
        try {
            return win.matchMedia && win.matchMedia("(prefers-reduced-motion: reduce)").matches;
        } catch (_) {
            return false;
        }
    }

    /**
     * Hide ribbon travel for any full-screen page other than Combinations, settings / ascension confirm, or (clap) when
     * not on Number 1. Catalog bonus travel may run on Number 2.
     */
    function ledgerBeamShouldHideTravel(forBonusCatalog) {
        const pagePanelEl = deps.pagePanelEl;
        const ascensionConfirmOverlayEl = deps.ascensionConfirmOverlayEl;
        if (typeof deps.isSettingsPanelOpen === "function" && deps.isSettingsPanelOpen()) return true;
        if (ascensionConfirmOverlayEl && ascensionConfirmOverlayEl.style.display === "flex") return true;
        if (typeof deps.isPagePanelOpen === "function" && deps.isPagePanelOpen() && pagePanelEl && pagePanelEl.dataset.openPageId !== "combinations") return true;
        if (!forBonusCatalog && getCurrentNumberMode() !== 1) return true;
        return false;
    }

    /** When log rows have no layout, use the visible ticker strip / action-log chrome (player reads messages there). */
    function ledgerBeamFallbackMessageSourceRect() {
        const doc = getDocument();
        const ambientMessageTickerEl = deps.ambientMessageTickerEl;
        const actionLogContainer = deps.actionLogContainer;
        if (ambientMessageTickerEl) {
            const r = ambientMessageTickerEl.getBoundingClientRect();
            if (r.width > 4 && r.height > 4) return r;
        }
        if (actionLogContainer) {
            const r = actionLogContainer.getBoundingClientRect();
            if (r.width > 4 && r.height > 4) return r;
        }
        const stage = doc.getElementById("play-stage");
        if (stage) {
            const r = stage.getBoundingClientRect();
            if (r.width > 4 && r.height > 4) return r;
        }
        return null;
    }

    /** @param {string} [logCategory] — match {@link data-log-category}; prefer the latest row when it matches (trigger line). */
    function ledgerBeamGetSourceRectFromActionLog(logCategory) {
        const actionLogEl = deps.actionLogEl;
        if (!actionLogEl) return ledgerBeamFallbackMessageSourceRect();
        const lines = actionLogEl.querySelectorAll(".action-log-line");
        if (lines && lines.length) {
            const last = lines[lines.length - 1];
            if (!logCategory || last.getAttribute("data-log-category") === logCategory) {
                const rLast = last.getBoundingClientRect();
                if (rLast.width > 2 && rLast.height > 2) return rLast;
            }
            for (let i = lines.length - 1; i >= 0; i--) {
                const line = lines[i];
                if (logCategory && line.getAttribute("data-log-category") !== logCategory) continue;
                const r = line.getBoundingClientRect();
                if (r.width > 2 && r.height > 2) return r;
            }
        }
        const wrap = actionLogEl.getBoundingClientRect();
        if (wrap.width > 2 && wrap.height > 2) return wrap;
        return ledgerBeamFallbackMessageSourceRect();
    }

    function ledgerBeamGetBonusSinkElement() {
        const doc = getDocument();
        const pagePanelEl = deps.pagePanelEl;
        if (typeof deps.isPagePanelOpen === "function" && deps.isPagePanelOpen() && pagePanelEl && pagePanelEl.dataset.openPageId === "combinations") {
            const catalog = doc.getElementById("ledger-sink-catalog-combined");
            if (catalog) return catalog;
        }
        return deps.incrementalRateEl;
    }

    function ledgerBeamSinkAnchorFromElement(el) {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        if (r.width < 2 && r.height < 2) return null;
        const ex = r.left + r.width * 0.72;
        const ey = r.top + r.height * 0.5;
        return { ex, ey, raw: r };
    }

    /** When the primary sink is hidden (e.g. Number 1 stage display:none on Number 2), land on a visible stage region. */
    function ledgerBeamBonusSinkAnchorOrFallback(sinkEl) {
        const doc = getDocument();
        let a = ledgerBeamSinkAnchorFromElement(sinkEl);
        if (a) return a;
        const mode = getCurrentNumberMode();
        if (mode === 2) {
            const n2 = doc.getElementById("number2-stage");
            if (n2 && n2.style.display !== "none") {
                const r = n2.getBoundingClientRect();
                if (r.width > 8 && r.height > 8) {
                    const raw = r;
                    return {
                        ex: r.left + r.width * 0.5,
                        ey: r.top + Math.min(140, r.height * 0.28),
                        raw
                    };
                }
            }
        }
        const stage = doc.getElementById("play-stage");
        if (stage) {
            const r = stage.getBoundingClientRect();
            if (r.width > 8 && r.height > 8) {
                return { ex: r.left + r.width * 0.5, ey: r.top + Math.min(160, r.height * 0.22), raw: r };
            }
        }
        const f = ledgerBeamFallbackSinkPoint();
        return {
            ex: f.x + 48,
            ey: f.y,
            raw: { left: f.x - 80, top: f.y - 14, width: 160, height: 28 }
        };
    }

    function ledgerBeamFallbackSinkPoint() {
        const doc = getDocument();
        const win = getWindow();
        const seg = doc.querySelector(".top-count-row__segment--center");
        if (seg) {
            const r = seg.getBoundingClientRect();
            return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.5 };
        }
        return { x: win.innerWidth * 0.5, y: 88 };
    }

    function ledgerBeamCurvePoint(t, ax, ay, bx, by, cx, cy) {
        const u = 1 - t;
        return { x: u * u * ax + 2 * u * t * bx + t * t * cx, y: u * u * ay + 2 * u * t * by + t * t * cy };
    }

    function ledgerBeamBuildGlyphListBonus(patternMultLabel, catalogAfterNum) {
        const label = String(patternMultLabel || "").replace(/\s/g, "");
        const multStr = (Number(catalogAfterNum) || 0).toFixed(2);
        const pool = [];
        for (let j = 0; j < label.length; j++) pool.push(label[j]);
        for (let j = 0; j < multStr.length; j++) pool.push(multStr[j]);
        pool.push("×", "·", "◆", "‣");
        if (pool.length < 4) pool.push("×", "·", "◇", "◇");
        const n = Math.min(24, Math.max(6, 6 + Math.floor(Math.random() * 9)));
        const glyphs = [];
        for (let i = 0; i < n; i++) {
            glyphs.push({ ch: pool[i % pool.length], off: i / n, jitter: (Math.random() - 0.5) * 0.04 });
        }
        return glyphs;
    }

    function ledgerBeamBuildGlyphListClap(hand1Based, axis) {
        const axCh = axis === "speed" ? "S" : axis === "cheapen" ? "C" : "P";
        const handStr = String(hand1Based);
        const pool = ["+", "1", axCh, "H", handStr, "·", "↑", "+", axCh];
        const n = Math.min(24, Math.max(6, 6 + Math.floor(Math.random() * 9)));
        const glyphs = [];
        for (let i = 0; i < n; i++) {
            glyphs.push({ ch: pool[i % pool.length], off: i / n, jitter: (Math.random() - 0.5) * 0.04 });
        }
        return glyphs;
    }

    function ledgerBeamPlayTravelCanvas(kind, sx, sy, lockedEx, lockedEy, onDone, travelOpts) {
        const doc = getDocument();
        const win = getWindow();
        const layer = ensureLedgerBeamLayer();
        const watchEl = travelOpts && travelOpts.watchEl;
        const glyphs = (travelOpts && travelOpts.glyphs) || ledgerBeamBuildGlyphListBonus("", 0);
        const glyphEls = [];
        for (let i = 0; i < glyphs.length; i++) {
            const sp = doc.createElement("span");
            sp.className = "ledger-beam-micro" + (kind === "clap" ? " ledger-beam-micro--clap" : "");
            sp.textContent = glyphs[i].ch;
            layer.appendChild(sp);
            glyphEls.push(sp);
        }
        const canvas = doc.createElement("canvas");
        canvas.className = "ledger-beam-canvas";
        const dpr = Math.min(2, win.devicePixelRatio || 1);
        const w = win.innerWidth;
        const h = win.innerHeight;
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        layer.appendChild(canvas);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            for (const ge of glyphEls) {
                if (ge && ge.parentNode) ge.parentNode.removeChild(ge);
            }
            layer.removeChild(canvas);
            if (typeof onDone === "function") onDone();
            return;
        }
        ctx.scale(dpr, dpr);
        const isLight = doc.documentElement.getAttribute("data-theme") === "light";
        const colors = kind === "clap"
            ? { outer: isLight ? "rgba(200,120,40,0.28)" : "rgba(255, 200, 120,0.55)", inner: isLight ? "rgba(255,180,90,0.65)" : "rgba(255, 230, 180,0.9)" }
            : { outer: isLight ? "rgba(60,100,160,0.22)" : "rgba(54, 80, 120,0.35)", inner: isLight ? "rgba(90,130,200,0.55)" : "rgba(154, 180, 255,0.78)" };
        const mx0 = (sx + lockedEx) * 0.5;
        const my0 = (sy + lockedEy) * 0.5 - Math.min(120, Math.abs(lockedEx - sx) * 0.18 + 40);
        const t0 = performance.now();
        const noisePhase = Math.random() * Math.PI * 2;
        let cancelled = false;
        function cleanup() {
            for (const ge of glyphEls) {
                if (ge && ge.parentNode) ge.parentNode.removeChild(ge);
            }
            if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        }
        function finishDone() {
            if (cancelled) return;
            cancelled = true;
            cleanup();
            if (typeof onDone === "function") onDone();
        }
        function noisyPoint(tNorm, bx, by) {
            const p = ledgerBeamCurvePoint(tNorm, sx, sy, bx, by, lockedEx, lockedEy);
            if (tNorm <= 0.002 || tNorm >= 0.998) return p;
            const delta = 0.018;
            const p2 = ledgerBeamCurvePoint(Math.min(1, tNorm + delta), sx, sy, bx, by, lockedEx, lockedEy);
            const dx = p2.x - p.x;
            const dy = p2.y - p.y;
            const len = Math.hypot(dx, dy) || 1;
            const nx = -dy / len;
            const ny = dx / len;
            const noise = (Math.sin(tNorm * 21.7 + noisePhase) * 0.55 + Math.cos(tNorm * 11.3 - noisePhase * 0.4) * 0.45) * 3.8 * (1 - 0.38 * tNorm);
            return { x: p.x + nx * noise, y: p.y + ny * noise };
        }
        const steps = LEDGER_BEAM_NOISE_STEPS;
        function frame(now) {
            if (cancelled) return;
            const elapsed = now - t0;
            const linearT = Math.min(1, elapsed / LEDGER_BEAM_TRAVEL_MS);
            let travelShape = 1;
            let holdFade = 1;
            if (elapsed >= LEDGER_BEAM_TRAVEL_MS) {
                const holdT = elapsed - LEDGER_BEAM_TRAVEL_MS;
                if (holdT >= LEDGER_BEAM_HOLD_AT_SINK_MS) {
                    finishDone();
                    return;
                }
                holdFade = 1 - holdT / LEDGER_BEAM_HOLD_AT_SINK_MS;
            } else {
                travelShape = 0.5 - 0.5 * Math.cos(Math.PI * linearT);
            }
            if (watchEl) {
                const na = ledgerBeamSinkAnchorFromElement(watchEl);
                if (!na || Math.hypot(na.ex - lockedEx, na.ey - lockedEy) > LEDGER_BEAM_SINK_MAX_DRIFT_PX) {
                    finishDone();
                    return;
                }
            }
            const wob = Math.sin(now * 0.012) * 4;
            const bx = mx0 + wob;
            const by = my0;
            const tease = (1 - Math.pow(1 - travelShape, 2)) * holdFade;
            ctx.clearRect(0, 0, w, h);
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            for (let pass = 0; pass < 3; pass++) {
                const baseW = pass === 0 ? 20 : (pass === 1 ? 11 : 5.2);
                for (let i = 1; i <= steps; i++) {
                    const tA = ((i - 1) / steps) * tease;
                    const tB = (i / steps) * tease;
                    const mid = (tA + tB) * 0.5;
                    const pA = noisyPoint(tA, bx, by);
                    const pB = noisyPoint(tB, bx, by);
                    const taper = 1 - 0.56 * mid;
                    ctx.strokeStyle = pass === 2 ? colors.inner : colors.outer;
                    const baseAlpha = pass === 0 ? 0.34 : (pass === 1 ? 0.5 : 0.86);
                    ctx.globalAlpha = baseAlpha * holdFade;
                    ctx.lineWidth = baseW * taper * (pass === 2 ? 0.42 : 1);
                    ctx.beginPath();
                    ctx.moveTo(pA.x, pA.y);
                    ctx.lineTo(pB.x, pB.y);
                    ctx.stroke();
                }
            }
            ctx.globalAlpha = 1;
            const ease = travelShape;
            const glyphAlpha = Math.min(1, ease * 1.05) * holdFade;
            for (let i = 0; i < glyphs.length; i++) {
                const g = glyphs[i];
                const gt = Math.max(0, Math.min(1, (ease - g.off * 0.85) / 0.35 + g.jitter));
                const p = ledgerBeamCurvePoint(gt, sx, sy, bx, by, lockedEx, lockedEy);
                const ge = glyphEls[i];
                if (ge) {
                    ge.style.left = p.x + "px";
                    ge.style.top = p.y + "px";
                    const vis = glyphAlpha * (gt > 0.02 && gt < 0.98 ? 0.88 : 0);
                    ge.style.opacity = String(vis);
                    ge.style.transform = "translate(-50%, -50%) scale(" + (0.7 + 0.35 * Math.sin(gt * Math.PI)) + ")";
                }
            }
            win.requestAnimationFrame(frame);
        }
        win.requestAnimationFrame(frame);
    }

    function appendClapReelLine(doc, wrap, oldLabel, newLabel, basePrefix) {
        const line = doc.createElement("span");
        line.className = "ledger-beam-pop-clap-line";
        if (basePrefix != null && basePrefix !== "") {
            const baseEl = doc.createElement("span");
            baseEl.className = "ledger-beam-pop-clap-base";
            baseEl.textContent = basePrefix;
            line.appendChild(baseEl);
        }
        const reel = doc.createElement("span");
        reel.className = "ledger-beam-pop-clap-reel";
        const slot = doc.createElement("span");
        slot.className = "ledger-beam-pop-clap-slot";
        const oldEl = doc.createElement("span");
        oldEl.className = "ledger-beam-pop-clap-old";
        oldEl.textContent = oldLabel;
        const newEl = doc.createElement("span");
        newEl.className = "ledger-beam-pop-clap-new";
        newEl.textContent = newLabel;
        slot.appendChild(oldEl);
        slot.appendChild(newEl);
        reel.appendChild(slot);
        line.appendChild(reel);
        wrap.appendChild(line);
    }

    function ledgerBeamPopOverlay(rect, kind, oldText, newText, popOpts) {
        if (!rect) return;
        popOpts = popOpts || {};
        const doc = getDocument();
        const win = getWindow();
        const layer = ensureLedgerBeamLayer();
        const wrap = doc.createElement("div");
        const isClap = kind === "clap";
        wrap.className = "ledger-beam-pop-wrap" + (isClap ? " ledger-beam-pop-wrap--clap" : "");
        const reduced = ledgerBeamPrefersReducedMotion();
        const displayMs = isClap ? LEDGER_BEAM_CLAP_POP_DISPLAY_MS : LEDGER_BEAM_POP_DISPLAY_MS;

        if (isClap) {
            const parts = resolveClapReelParts(oldText, newText);
            if (reduced) {
                const neu = doc.createElement("span");
                neu.className = "ledger-beam-pop-new";
                neu.textContent =
                    parts.mode === "bonus"
                        ? parts.base + (parts.newBonus > 0 ? " +" + parts.newBonus : "")
                        : parts.newLabel;
                wrap.appendChild(neu);
                if (popOpts.deltaText) {
                    const d = doc.createElement("span");
                    d.className = "ledger-beam-pop-delta";
                    d.textContent = popOpts.deltaText;
                    wrap.appendChild(d);
                }
            } else if (parts.mode === "bonus") {
                const oldBonusLabel = parts.oldBonus > 0 ? "+" + parts.oldBonus : "\u00a0";
                const newBonusLabel = parts.newBonus > 0 ? "+" + parts.newBonus : "\u00a0";
                appendClapReelLine(doc, wrap, oldBonusLabel, newBonusLabel, parts.base + " ");
            } else {
                appendClapReelLine(doc, wrap, parts.oldLabel, parts.newLabel, "");
            }
        } else {
            const ghost = doc.createElement("span");
            ghost.className = "ledger-beam-pop-ghost";
            ghost.textContent = oldText || "";
            wrap.appendChild(ghost);
            const neu = doc.createElement("span");
            neu.className = "ledger-beam-pop-new";
            neu.textContent = newText || "";
            wrap.appendChild(neu);
            if (popOpts.deltaText && reduced) {
                const d = doc.createElement("span");
                d.className = "ledger-beam-pop-delta";
                d.textContent = popOpts.deltaText;
                wrap.appendChild(d);
            }
        }

        const ax = popOpts.anchorX != null ? popOpts.anchorX : (rect.left + rect.width * 0.5);
        const ay = popOpts.anchorY != null ? popOpts.anchorY : (rect.top + rect.height * 0.5);
        wrap.style.left = ax + "px";
        wrap.style.top = ay + "px";
        layer.appendChild(wrap);

        if (isClap && !reduced) {
            win.setTimeout(() => {
                wrap.classList.add("ledger-beam-pop-wrap--clap-hold");
            }, 10);
            win.setTimeout(() => {
                wrap.classList.add("ledger-beam-pop-wrap--clap-roll");
            }, LEDGER_BEAM_CLAP_POP_HOLD_MS);
            win.setTimeout(() => {
                wrap.classList.add("ledger-beam-pop-wrap--clap-exit");
            }, LEDGER_BEAM_CLAP_POP_HOLD_MS + LEDGER_BEAM_CLAP_POP_ROLL_MS);
        } else {
            win.setTimeout(() => {
                wrap.classList.add("ledger-beam-pop-wrap--run");
                if (!reduced) {
                    wrap.classList.add("ledger-beam-pop-wrap--exit");
                }
            }, 10);
        }

        win.setTimeout(() => {
            if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        }, displayMs);
    }

    function ledgerBeamCreateClapFallbackChip(layer, ev) {
        const doc = getDocument();
        const chip = doc.createElement("div");
        chip.className = "ledger-beam-fallback-chip";
        const axisLabel = ev.axis === "speed" ? "Speed" : ev.axis === "cheapen" ? "Cheapen" : "Compaction";
        chip.textContent = "Hand " + ev.hand1Based + " · " + axisLabel + " +1";
        layer.appendChild(chip);
        return chip;
    }

    function ledgerBeamPulseSink(el, kind) {
        if (!el) return;
        const win = getWindow();
        const clap = kind === "clap";
        el.classList.remove("ledger-beam-sink-flash", "ledger-beam-sink-flash--clap");
        void el.offsetWidth;
        el.classList.add(clap ? "ledger-beam-sink-flash--clap" : "ledger-beam-sink-flash");
        win.setTimeout(() => {
            el.classList.remove("ledger-beam-sink-flash", "ledger-beam-sink-flash--clap");
        }, 400);
    }

    function playBonus(catalogBefore, catalogAfter, patternMultLabel) {
        const srcR = ledgerBeamGetSourceRectFromActionLog("milestone") || ledgerBeamFallbackMessageSourceRect();
        if (!srcR) return;
        const sinkEl = ledgerBeamGetBonusSinkElement();
        const sinkAnchor = ledgerBeamBonusSinkAnchorOrFallback(sinkEl);
        const primarySinkRect = ledgerBeamSinkAnchorFromElement(sinkEl);
        const popOnly = ledgerBeamShouldHideTravel(true) || ledgerBeamPrefersReducedMotion() || !ledgerBeamAllowFullTravel();
        const sx = srcR.left + srcR.width * 0.5;
        const sy = srcR.top + srcR.height * 0.5;
        const lockedEx = sinkAnchor.ex;
        const lockedEy = sinkAnchor.ey;
        const popRect = sinkAnchor.raw;
        const anchorX = sinkAnchor.ex;
        const anchorY = sinkAnchor.ey;
        const bStr = (Number(catalogBefore) || 0).toFixed(2);
        const aStr = (Number(catalogAfter) || 0).toFixed(2);
        const oldShort = "Combo Catalog ×" + bStr;
        const newShort = "Combo Catalog ×" + aStr + " · " + (patternMultLabel || "");
        const catDelta = (Number(catalogAfter) || 0) - (Number(catalogBefore) || 0);
        const deltaText = "Δ Combo Catalog " + (catDelta >= 0 ? "+" : "") + catDelta.toFixed(2);
        const bGlyphs = ledgerBeamBuildGlyphListBonus(patternMultLabel, catalogAfter);
        const finish = () => {
            ledgerBeamPopOverlay(popRect, "bonus", oldShort, newShort, { anchorX, anchorY, deltaText });
            if (sinkEl) ledgerBeamPulseSink(sinkEl, "bonus");
        };
        if (popOnly) {
            finish();
            return;
        }
        ledgerBeamPlayTravelCanvas("bonus", sx, sy, lockedEx, lockedEy, finish, { watchEl: primarySinkRect ? sinkEl : null, glyphs: bGlyphs });
    }

    function playClapEvent(ev) {
        if (!ev || !ev.sinkEl || ev.hand1Based == null || !ev.axis) return;
        const srcR = ledgerBeamGetSourceRectFromActionLog("system") || ledgerBeamFallbackMessageSourceRect();
        if (!srcR) return;
        const layer = ensureLedgerBeamLayer();
        let chipEl = null;
        let anchor = ledgerBeamSinkAnchorFromElement(ev.sinkEl);
        if (!anchor) {
            chipEl = ledgerBeamCreateClapFallbackChip(layer, ev);
            const cr = chipEl.getBoundingClientRect();
            anchor = ledgerBeamSinkAnchorFromElement(chipEl) || { ex: cr.left + cr.width * 0.5, ey: cr.top + cr.height * 0.5, raw: cr };
        }
        const lockedEx = anchor.ex;
        const lockedEy = anchor.ey;
        const popRect = anchor.raw;
        const anchorX = anchor.ex;
        const anchorY = anchor.ey;
        const popOnly = ledgerBeamShouldHideTravel(false) || ledgerBeamPrefersReducedMotion() || !ledgerBeamAllowFullTravel();
        const sx = srcR.left + srcR.width * 0.5;
        const sy = srcR.top + srcR.height * 0.5;
        const axisShort = ev.axis === "speed" ? "Spd" : ev.axis === "cheapen" ? "Chp" : "Cmp";
        const deltaText = "Δ H" + ev.hand1Based + " " + axisShort + " +1";
        const cGlyphs = ledgerBeamBuildGlyphListClap(ev.hand1Based, ev.axis);
        const finish = () => {
            if (chipEl && chipEl.parentNode) chipEl.parentNode.removeChild(chipEl);
            chipEl = null;
            ledgerBeamPopOverlay(popRect, "clap", ev.oldText || "—", ev.newText || "—", { anchorX, anchorY, deltaText });
            ledgerBeamPulseSink(ev.sinkEl, "clap");
        };
        if (popOnly) {
            finish();
            return;
        }
        ledgerBeamPlayTravelCanvas("clap", sx, sy, lockedEx, lockedEy, finish, { watchEl: chipEl || ev.sinkEl, glyphs: cGlyphs });
    }

    function snapshotHandLedgerBonusDisplays() {
        const out = [];
        const unlockedHands = typeof deps.getUnlockedHands === "function" ? deps.getUnlockedHands() : 0;
        const speedRowRefs = typeof deps.getSpeedRowRefs === "function" ? deps.getSpeedRowRefs() : [];
        for (let i = 0; i < unlockedHands; i++) {
            const ref = speedRowRefs[i];
            if (!ref) {
                out.push({ speed: "", cheapen: "", slowdown: "" });
                continue;
            }
            out.push({
                speed: compactText(ref.speedLevelEl),
                cheapen: compactText(ref.cheapenLevelEl),
                slowdown: compactText(ref.slowdownLevelEl)
            });
        }
        return out;
    }

    function afterClapBonuses(beforeSnap) {
        if (!beforeSnap) return;
        if (getCurrentNumberMode() !== 1) return;
        const win = getWindow();
        const events = [];
        const unlockedHands = typeof deps.getUnlockedHands === "function" ? deps.getUnlockedHands() : 0;
        const speedRowRefs = typeof deps.getSpeedRowRefs === "function" ? deps.getSpeedRowRefs() : [];
        for (let i = 0; i < unlockedHands; i++) {
            const ref = speedRowRefs[i];
            if (!ref) continue;
            const hand1 = i + 1;
            const b = beforeSnap[i] || { speed: "", cheapen: "", slowdown: "" };
            const sp = compactText(ref.speedLevelEl);
            const ch = compactText(ref.cheapenLevelEl);
            const sl = compactText(ref.slowdownLevelEl);
            if (sp !== b.speed && ref.speedLevelEl) {
                events.push({ sinkEl: ref.speedLevelEl, oldText: b.speed, newText: sp, hand1Based: hand1, axis: "speed" });
            }
            if (ch !== b.cheapen && ref.cheapenLevelEl) {
                events.push({ sinkEl: ref.cheapenLevelEl, oldText: b.cheapen, newText: ch, hand1Based: hand1, axis: "cheapen" });
            }
            if (sl !== b.slowdown && ref.slowdownLevelEl) {
                events.push({ sinkEl: ref.slowdownLevelEl, oldText: b.slowdown, newText: sl, hand1Based: hand1, axis: "slowdown" });
            }
        }
        events.forEach((ev, idx) => {
            win.setTimeout(() => playClapEvent(ev), idx * LEDGER_BEAM_CLAP_STAGGER_MS);
        });
    }

    return {
        playBonus,
        snapshotHandLedgerBonusDisplays,
        afterClapBonuses
    };
}
