let currentMode = 1;
let count = 0;

const NUM_HANDS = 10;
const countDisplay = document.getElementById("count-display");
const countBtn = document.getElementById("count-btn");
const curtain = document.getElementById("curtain");

// Trigger curtain animation
const CURTAIN_DURATION = 900;
function isCurtainEnabled() {
    try {
        const raw = localStorage.getItem("naf.settings.v1");
        if (!raw) return true;
        const parsed = JSON.parse(raw);
        return parsed.curtainEnabled !== false;
    } catch (_) {
        return true;
    }
}
function playCurtainAnimation(callback) {
    if (!isCurtainEnabled()) {
        callback?.();
        return;
    }
    // Ensure clean state
    curtain.classList.remove("opening", "closing");

    // CLOSE curtains
    curtain.classList.add("closing");
    setTimeout(() => {
        callback?.();
        // OPEN curtains
        curtain.classList.remove("closing");
        curtain.classList.add("opening");
    }, CURTAIN_DURATION);
}


// Switch counting mode
function switchMode(mode) {
    playCurtainAnimation(() => {
        if (typeof window.onBeforeNumberModeSwitch === "function") window.onBeforeNumberModeSwitch(mode);
        currentMode = mode;
        if (typeof window.onNumberModeSwitched === "function") window.onNumberModeSwitched(mode);
        //count = 0;
        //countDisplay.textContent = count;
        //countBtn.textContent = `Count +${mode}`;
    });
}

// Navigation buttons
function showLockedModeMessage() {
    const msg = "Keep playing to unlock this counting number!";
    if (typeof addToLog === "function") {
        addToLog(msg, "warning");
    } else {
        // Fallback for early boot edge cases.
        console.warn(msg);
    }
}
document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        if (btn.classList.contains("nav-btn--soon")) {
            showLockedModeMessage();
            return;
        }
        const mode = parseInt(btn.dataset.mode, 10);
        switchMode(mode);
    });
});

