import { BLACK_HOLE_SCREEN_FX_MS } from "./number1-black-hole.js";

/** Full-screen black hole VFX overlay (sacrifice, wave, hawking, …). */
export function playBlackHoleScreenEffect(kind) {
    if (typeof document === "undefined" || !document.body) return;
    const allowed = {
        hawking: true,
        wave: true,
        sacrifice: true,
        digest: true,
        evaporation: true
    };
    if (!allowed[kind]) return;
    const wrap = document.createElement("div");
    wrap.className = "black-hole-screen-fx black-hole-screen-fx--" + kind;
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML = "<div class=\"black-hole-screen-fx__core\"></div><div class=\"black-hole-screen-fx__ring\"></div><div class=\"black-hole-screen-fx__field\"></div>";
    document.body.appendChild(wrap);
    window.setTimeout(function() {
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    }, BLACK_HOLE_SCREEN_FX_MS);
}
