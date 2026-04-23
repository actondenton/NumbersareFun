/**
 * Entry: tiny shell + vendor data, then lazy-load the full game behind the curtain.
 * Number 1 / Number 2 logic still lives in one legacy chunk until a follow-up splits files.
 */
import "../style.css";
/** Canonical data files live at repo root (tooling in `_*.ps1` edits these paths). */
import "../ascension-tree-data.js";
import "../number2-upgrades.js";
import "../ascension2-tree-data.js";

import { runCurtainTransition } from "./shell/curtain.js";
import { installGlobalModeApi } from "./shell/mode-switch.js";

installGlobalModeApi();

runCurtainTransition(() => {
  void import("./game/legacy-boot.js");
});
