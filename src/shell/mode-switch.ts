import { runCurtainTransition } from "./curtain.js";

let currentMode = 1;

export function getCurrentNumberMode(): number {
  return currentMode;
}

function showLockedModeMessage(): void {
  const msg = "Keep playing to unlock this counting number!";
  if (typeof (window as unknown as { addToLog?: (m: string, c: string) => void }).addToLog === "function") {
    (window as unknown as { addToLog: (m: string, c: string) => void }).addToLog(msg, "warning");
  } else {
    console.warn(msg);
  }
}

export function switchMode(mode: number): void {
  runCurtainTransition(() => {
    const w = window as unknown as {
      onBeforeNumberModeSwitch?: (m: number) => void;
      onNumberModeSwitched?: (m: number) => void;
    };
    if (typeof w.onBeforeNumberModeSwitch === "function") {
      w.onBeforeNumberModeSwitch(mode);
    }
    currentMode = mode;
    if (typeof w.onNumberModeSwitched === "function") {
      w.onNumberModeSwitched(mode);
    }
  });
}

/** Expose for the legacy bundle (same contract as former `game.js`). */
export function installGlobalModeApi(): void {
  (window as unknown as { getCurrentNumberMode: typeof getCurrentNumberMode }).getCurrentNumberMode =
    getCurrentNumberMode;

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("nav-btn--soon")) {
        showLockedModeMessage();
        return;
      }
      const mode = Number.parseInt((btn as HTMLElement).dataset.mode ?? "1", 10);
      switchMode(mode);
    });
  });
}
