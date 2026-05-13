/**
 * Binary-search CSS scale vars so the `.top-count-row` bar fits left stack + centered rate copy.
 */

const TOP_COUNT_ROW_FIT_MIN_SCALE = 0.06;
const TOP_COUNT_ROW_FIT_ITERATIONS = 22;
/** Coalesce layout passes after row height is fixed to side-column anchor. */
const TOP_COUNT_ROW_FIT_LAYOUT_PASSES = 3;
/** Minimum inner content height (px) for the bar when sides are tiny or hidden. */
const TOP_COUNT_ROW_MIN_CONTENT_H = 40;

function binarySearchScaleToFit(segment, inner, cssVarName, minScale, maxScale) {
    if (!segment || !inner) return;
    const maxW = segment.clientWidth;
    const maxH = segment.clientHeight;
    if (maxW < 4 || maxH < 4) return;
    let lo = minScale;
    let hi = maxScale;
    for (let i = 0; i < TOP_COUNT_ROW_FIT_ITERATIONS; i++) {
        const mid = (lo + hi) / 2;
        segment.style.setProperty(cssVarName, String(mid));
        const w = inner.scrollWidth;
        const h = inner.scrollHeight;
        if (w <= maxW && h <= maxH) {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    segment.style.setProperty(cssVarName, String(lo));
}

function binarySearchScaleToFitWidthOnly(segment, inner, cssVarName, minScale, maxScale) {
    if (!segment || !inner) return;
    const maxW = segment.clientWidth;
    if (maxW < 4) return;
    let lo = minScale;
    let hi = maxScale;
    for (let i = 0; i < TOP_COUNT_ROW_FIT_ITERATIONS; i++) {
        const mid = (lo + hi) / 2;
        segment.style.setProperty(cssVarName, String(mid));
        if (inner.scrollWidth <= maxW) {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    segment.style.setProperty(cssVarName, String(lo));
}

/**
 * @param {{
 *   getTurboFitEl: () => Element | null | undefined,
 *   incrementalEl: Element | null | undefined,
 *   incrementalRateEl: Element | null | undefined,
 * }} deps
 */
export function createTopCountRowFit(deps) {
    let topCountRowFitRaf = 0;
    let topCountRowFitObserversStarted = false;

    function fitTopCountRowSegments() {
        const row = document.querySelector(".top-count-row");
        if (!row || row.offsetParent === null) return;
        if (row.style.display === "none") return;
        const leftSeg = row.querySelector(".top-count-row__segment--left");
        const centerSeg = row.querySelector(".top-count-row__segment--center");
        const leftInner = leftSeg && leftSeg.querySelector(".top-count-row__left-fit-wrap");
        const centerInner = centerSeg && centerSeg.querySelector(".top-count-row__center-fit-wrap");
        if (!leftSeg || !centerSeg || !leftInner || !centerInner) return;

        centerSeg.style.setProperty("min-height", "0");
        centerSeg.style.setProperty("max-height", "0");
        centerSeg.style.setProperty("overflow", "hidden");
        row.style.height = "";
        row.style.minHeight = "";

        binarySearchScaleToFitWidthOnly(leftSeg, leftInner, "--left-stack-scale", TOP_COUNT_ROW_FIT_MIN_SCALE, 1);

        const hLeft = Math.ceil(leftInner.getBoundingClientRect().height);
        let hRight = 0;
        const turboFitEl = deps.getTurboFitEl();
        if (turboFitEl) {
            const tws = window.getComputedStyle(turboFitEl);
            if (tws.display !== "none" && tws.visibility !== "hidden") {
                hRight = Math.ceil(turboFitEl.getBoundingClientRect().height);
            }
        }
        const anchorH = Math.max(hLeft, hRight, TOP_COUNT_ROW_MIN_CONTENT_H);

        const cs = window.getComputedStyle(row);
        const padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
        const borderY = (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.borderBottomWidth) || 0);
        row.style.boxSizing = "border-box";
        row.style.height = anchorH + padY + borderY + "px";

        centerSeg.style.removeProperty("max-height");
        centerSeg.style.removeProperty("min-height");
        centerSeg.style.removeProperty("overflow");

        for (let p = 0; p < TOP_COUNT_ROW_FIT_LAYOUT_PASSES; p++) {
            binarySearchScaleToFit(leftSeg, leftInner, "--left-stack-scale", TOP_COUNT_ROW_FIT_MIN_SCALE, 1);
            binarySearchScaleToFit(centerSeg, centerInner, "--center-text-scale", TOP_COUNT_ROW_FIT_MIN_SCALE, 1);
        }
    }

    function scheduleFitTopCountRow() {
        if (topCountRowFitRaf) return;
        topCountRowFitRaf = requestAnimationFrame(function() {
            topCountRowFitRaf = 0;
            fitTopCountRowSegments();
        });
    }

    function initTopCountRowFitObservers() {
        if (topCountRowFitObserversStarted) return;
        topCountRowFitObserversStarted = true;
        const row = document.querySelector(".top-count-row");
        if (!row || typeof ResizeObserver === "undefined") {
            scheduleFitTopCountRow();
            return;
        }
        const ro = new ResizeObserver(function() {
            scheduleFitTopCountRow();
        });
        ro.observe(row);
        if (deps.incrementalEl) {
            const mo = new MutationObserver(function() {
                scheduleFitTopCountRow();
            });
            mo.observe(deps.incrementalEl, { characterData: true, subtree: true, childList: true });
        }
        if (deps.incrementalRateEl) {
            const moR = new MutationObserver(function() {
                scheduleFitTopCountRow();
            });
            moR.observe(deps.incrementalRateEl, { characterData: true, subtree: true, childList: true });
        }
        scheduleFitTopCountRow();
    }

    return { scheduleFitTopCountRow, initTopCountRowFitObservers };
}
