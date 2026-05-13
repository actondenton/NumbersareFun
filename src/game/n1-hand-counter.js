import { hands1 } from "./n1-hand-ascii.js";

export class HandCounter {
    constructor(id, speed, parentEl) {
        this.id = id;
        this.count = 1;
        this.baseSpeed = speed;
        /** Exact sub-tick carry: floor(total ms x mult / 1000) via (acc += dt x mult) / 1000. */
        this.tickAccBig = 0n;

        this.el = document.createElement("div");
        this.el.className = "hand curtain-reveal";
        this.el.style.whiteSpace = "pre";

        const mount = parentEl || document.getElementById("hands-container");
        if (mount) mount.appendChild(this.el);

        this.render();

        setTimeout(() => {
            this.el.classList.add("visible");
        }, 300);
    }

    restartTimer() { /* speed applied in game loop */ }

    applyTicks(n) {
        if (n <= 0) return;
        const nb = typeof n === "bigint" ? n : BigInt(Math.floor(Number(n)));
        if (nb <= 0n) return;
        const tMod = Number(nb % 10n);
        this.count = ((this.count - 1 + tMod) % 10 + 10) % 10 + 1;
        this.render();
    }

    /** Updates the visible digit if `count` changed. Hot-path callers often skip the call when `count` is unchanged. */
    render() {
        if (this._lastRenderedCount === this.count) return;
        this._lastRenderedCount = this.count;
        this.el.textContent = hands1[this.count - 1];
    }
}
