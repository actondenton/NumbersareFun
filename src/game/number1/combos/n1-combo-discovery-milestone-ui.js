/**
 * Combinations page: Combo Catalog discovery milestone queue + countdown bar.
 */

export function formatComboDiscoveryMilestoneCountdown(remainMs) {
    const sec = Math.max(0, Math.ceil(remainMs / 1000));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
}

/**
 * @param {{
 *   pagePanelEl: HTMLElement | null | undefined,
 *   pagePanelTitleEl: HTMLElement | null | undefined,
 *   unlockedHands: number,
 *   milestoneCooldownMinMs: number,
 *   milestone: {
 *     pendingQueue: { readonly length: number },
 *     readyAtMs: number,
 *     cooldownSpanMs: number,
 *   },
 *   getDefaultCooldownMs: () => number,
 *   nowMs?: number,
 * }} d
 */
export function updateComboDiscoveryMilestonePanelIfOpen(d) {
    if (!d.pagePanelEl || d.pagePanelEl.style.display === "none" || !d.pagePanelTitleEl) return;
    if (d.pagePanelTitleEl.textContent !== "Combinations") return;
    if (d.unlockedHands < 2) return;
    const wrap = document.getElementById("combo-discovery-milestone-ui");
    const line = document.getElementById("combo-discovery-milestone-line");
    const track = document.getElementById("combo-discovery-milestone-bar-track");
    const fill = document.getElementById("combo-discovery-milestone-bar-fill");
    if (!wrap || !line || !track || !fill) return;
    const q = d.milestone.pendingQueue.length;
    if (q === 0) {
        wrap.hidden = true;
        return;
    }
    wrap.hidden = false;
    const now = Number.isFinite(d.nowMs) ? Number(d.nowMs) : Date.now();
    const waiting =
        d.milestone.readyAtMs !== 0 && now < d.milestone.readyAtMs;
    let spanEff =
        d.milestone.cooldownSpanMs > 0 ? d.milestone.cooldownSpanMs : d.getDefaultCooldownMs();
    spanEff = Math.max(d.milestoneCooldownMinMs, spanEff);
    let remainMs = 0;
    let pct = 100;
    if (waiting) {
        remainMs = d.milestone.readyAtMs - now;
        pct = Math.max(0, Math.min(100, (remainMs / spanEff) * 100));
    }
    let text;
    if (waiting) {
        const cd = formatComboDiscoveryMilestoneCountdown(remainMs);
        if (q > 1) {
            text = q + " discoveries queued — showing the next in " + cd + ".";
        } else {
            text = "Next unlock ready in " + cd + ".";
        }
    } else {
        text =
            q > 1
                ? q + " discoveries queued — applying the next Combo Catalog unlock now."
                : "Next Combo Catalog unlock is ready — applying now.";
    }
    line.textContent = text;
    fill.style.width = pct + "%";
    track.setAttribute("aria-valuenow", String(Math.round(pct)));
    track.setAttribute(
        "aria-valuetext",
        waiting ? formatComboDiscoveryMilestoneCountdown(remainMs) + " remaining" : "Ready"
    );
}
