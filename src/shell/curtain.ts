/** Matches legacy `game.js` curtain timing. */
export const CURTAIN_DURATION_MS = 900;

export function isCurtainEnabled(): boolean {
  try {
    const raw = localStorage.getItem("naf.settings.v1");
    if (!raw) {
      return true;
    }
    const parsed = JSON.parse(raw) as { curtainEnabled?: boolean };
    return parsed.curtainEnabled !== false;
  } catch {
    return true;
  }
}

/**
 * Runs the midpoint callback while curtains are closed (or immediately if disabled / missing DOM).
 */
export function runCurtainTransition(onMidpoint: () => void): void {
  const curtain = document.getElementById("curtain");
  if (!isCurtainEnabled()) {
    onMidpoint();
    return;
  }
  if (!curtain) {
    onMidpoint();
    return;
  }
  curtain.classList.remove("opening", "closing");
  curtain.classList.add("closing");
  window.setTimeout(() => {
    onMidpoint();
    curtain.classList.remove("closing");
    curtain.classList.add("opening");
  }, CURTAIN_DURATION_MS);
}
