let currentMode = 1;
let count = 0;

const NUM_HANDS = 10;
const countDisplay = document.getElementById("count-display");
const countBtn = document.getElementById("count-btn");
const curtain = document.getElementById("curtain");

// Trigger curtain animation
const CURTAIN_DURATION = 900;
function playCurtainAnimation(callback) {
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
        currentMode = mode;
        //count = 0;
        //countDisplay.textContent = count;
        //countBtn.textContent = `Count +${mode}`;
    });
}

// Navigation buttons
document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const mode = parseInt(btn.dataset.mode, 10);
        switchMode(mode);
    });
});

// Menu button
document.getElementById("menu-btn").addEventListener("click", () => {
    playCurtainAnimation(() => {
        console.log("Menu clicked — future menu goes here");
    });
});
