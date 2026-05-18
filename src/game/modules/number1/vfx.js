export const CONFETTI_COLORS = ["#4CAF50", "#9aa0ff", "#FFC107", "#E91E63", "#00BCD4", "#8BC34A", "#FF9800"];
export const CONFETTI_HOLD_REMOVE_MS = 3200;

export function fillConfettiParticles(container, originEl, opts = {}) {
    const doc = opts.document || document;
    const random = opts.random || Math.random;
    const colors = opts.colors || CONFETTI_COLORS;
    const el = originEl;
    if (!el || !container) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const count = 18;
    container.replaceChildren();
    for (let i = 0; i < count; i++) {
        const p = doc.createElement("div");
        p.className = "confetti-particle";
        const size = 10 + random() * 10;
        const angle = (Math.PI * 2 * i) / count + random() * 0.5;
        const dist = 70 + random() * 90;
        const dx = Math.cos(angle) * dist * (random() > 0.5 ? 1 : -1);
        const dy = Math.sin(angle) * dist - 20;
        p.style.left = (cx - size / 2) + "px";
        p.style.top = (cy - size / 2) + "px";
        p.style.width = size + "px";
        p.style.height = size + "px";
        p.style.background = colors[Math.floor(random() * colors.length)];
        p.style.setProperty("--dx", dx + "px");
        p.style.setProperty("--dy", dy + "px");
        container.appendChild(p);
    }
}

export function createConfettiSprayer(opts = {}) {
    const doc = opts.document || document;
    const body = opts.body || doc.body;
    const defaultOriginEl = opts.defaultOriginEl || null;
    const setTimeoutFn = opts.setTimeoutFn || setTimeout;
    const clearTimeoutFn = opts.clearTimeoutFn || clearTimeout;
    const removeMs = opts.removeMs || CONFETTI_HOLD_REMOVE_MS;
    let holdRepeatConfettiContainer = null;
    let holdRepeatConfettiRemoveTimer = 0;

    return function sprayConfettiFrom(originEl, sprayOpts) {
        const el = originEl || defaultOriginEl;
        if (!el) return;
        const holdRepeatCoalesce = !!(sprayOpts && sprayOpts.holdRepeatCoalesce);
        if (holdRepeatCoalesce) {
            if (!holdRepeatConfettiContainer || !holdRepeatConfettiContainer.parentNode) {
                holdRepeatConfettiContainer = doc.createElement("div");
                holdRepeatConfettiContainer.className = "confetti-container";
                holdRepeatConfettiContainer.style.pointerEvents = "none";
                body.appendChild(holdRepeatConfettiContainer);
            }
            fillConfettiParticles(holdRepeatConfettiContainer, el, opts);
            if (holdRepeatConfettiRemoveTimer) clearTimeoutFn(holdRepeatConfettiRemoveTimer);
            holdRepeatConfettiRemoveTimer = setTimeoutFn(function () {
                holdRepeatConfettiRemoveTimer = 0;
                if (holdRepeatConfettiContainer && holdRepeatConfettiContainer.parentNode) holdRepeatConfettiContainer.remove();
                holdRepeatConfettiContainer = null;
            }, removeMs);
            return;
        }
        const container = doc.createElement("div");
        container.className = "confetti-container";
        container.style.pointerEvents = "none";
        fillConfettiParticles(container, el, opts);
        body.appendChild(container);
        setTimeoutFn(() => container.remove(), removeMs);
    };
}
