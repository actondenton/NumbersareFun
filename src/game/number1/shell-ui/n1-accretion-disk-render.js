/** Vogel (golden-angle) spiral from disk center; glyphs follow the Fibonacci sequence. */
export function renderAccretionDiskSpiralNumeralsHtml() {
    const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
    const SCALE_REM = 1.02;
    const RADIAL_EXP = 0.63;
    const DURATION_SEC = 180;
    const MAX_TERMS = 12;
    const fib = [1];
    let prev = 1;
    let cur = 1;
    while (fib.length < MAX_TERMS) {
        const next = prev + cur;
        prev = cur;
        cur = next;
        fib.push(next);
    }
    const n = fib.length;
    const arms = [];
    for (let i = 0; i < n; i++) {
        let dx = 0;
        let dy = 0;
        if (i > 0) {
            const r = SCALE_REM * Math.pow(i, RADIAL_EXP);
            const ang = (i - 1) * GOLDEN_ANGLE;
            dx = r * Math.cos(ang);
            dy = r * Math.sin(ang);
        }
        const fadeDelay = -(i * DURATION_SEC / n);
        const wideClass = fib[i] >= 100 ? " asc-black-hole__disk-number-glyph--wide" : "";
        arms.push(
            "<span class=\"asc-black-hole__disk-spiral-arm\" style=\"--sdx:" + dx.toFixed(3) + "rem;--sdy:" + dy.toFixed(3) + "rem;--spiral-anim-delay:" + fadeDelay.toFixed(2) + "s\">" +
            "<span class=\"asc-black-hole__disk-number\"><span class=\"asc-black-hole__disk-number-glyph" + wideClass + "\">" + fib[i] + "</span></span></span>"
        );
    }
    return "<span class=\"asc-black-hole__disk-spiral\" aria-hidden=\"true\">" + arms.join("") + "</span>";
}

export function renderAccretionDiskHeroInnerHtml() {
    return (
        "<span class=\"asc-black-hole__disk-glow\"></span>" +
        "<span class=\"asc-black-hole__disk-band asc-black-hole__disk-band--outer\"></span>" +
        "<span class=\"asc-black-hole__disk-band asc-black-hole__disk-band--inner\"></span>" +
        "<span class=\"asc-black-hole__disk-core\"></span>" +
        renderAccretionDiskSpiralNumeralsHtml()
    );
}

/** Fill play-stage accretion disk BG once (idempotent). Call on first Phase 3. */
export function initNumber1StageAccretionDiskBg() {
    const wrap = document.getElementById("number1-stage-disk-bg");
    if (!wrap || wrap.dataset.diskBgInit === "1") return;
    wrap.dataset.diskBgInit = "1";
    wrap.innerHTML =
        "<div class=\"asc-black-hole__disk-hero number1-stage-disk-hero\" aria-hidden=\"true\">" +
        renderAccretionDiskHeroInnerHtml() +
        "</div>";
}
