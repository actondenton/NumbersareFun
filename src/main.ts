/**
 * Entry: tiny shell + vendor data, then lazy-load the full game behind the curtain.
 * Ascension tree scripts and Number 2 upgrades load in parallel before legacy-boot to trim the critical path
 * (extra round trips on slow networks — see vite `manualChunks` tradeoffs in vite.config.ts).
 */
import "../style.css";

import { runCurtainTransition } from "./shell/curtain.js";
import { installGlobalModeApi } from "./shell/mode-switch.js";

installGlobalModeApi();

runCurtainTransition(() => {
  Promise.all([
    import("../data/ascension/ascension-tree-data.js"),
    import("../number2-upgrades.js"),
    import("../data/ascension/ascension2-tree-data.js")
  ])
    .then(() => import("./game/legacy-boot.js"))
    .catch((err) => {
    console.error("[NumbersareFun] Failed to load game (legacy-boot):", err);
    const wrap = document.createElement("div");
    wrap.style.cssText =
      "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;background:#1a1025;color:#f8e9ff;font-family:system-ui,sans-serif;z-index:2147483647;text-align:center";
    const inner = document.createElement("div");
    inner.style.cssText = "max-width:420px;line-height:1.45";
    const title = document.createElement("strong");
    title.style.fontSize = "1.1rem";
    title.textContent = "Game failed to start";
    const hint = document.createElement("p");
    hint.style.margin = "12px 0 0";
    hint.style.opacity = "0.9";
    hint.textContent = "Open DevTools (F12) → Console for details.";
    const pre = document.createElement("pre");
    pre.style.cssText =
      "margin-top:16px;text-align:left;font-size:12px;overflow:auto;max-height:40vh;background:#0006;padding:12px;border-radius:8px";
    pre.textContent = err instanceof Error ? err.stack || err.message : String(err);
    inner.append(title, hint, pre);
    wrap.append(inner);
    document.body.append(wrap);
  });
});
