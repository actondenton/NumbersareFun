// Number 1 Hands Module
// Merged from: n1-hands.js, n1-hand-counter.js, n1-hand-ascii.js

export const UNLOCK_THRESHOLDS = [
    1e9,   // hand 2: 1 billion
    1e12,  // hand 3: 1 trillion
    1e15,  // hand 4: 1 quadrillion
    1e18,  // hand 5: 1 quintillion
    1e21,  // hand 6: 1 sextillion
    1e24,  // hand 7: 1 septillion
    1e27,  // hand 8: 1 octillion
    1e30,  // hand 9: 1 nonillion
    1e33   // hand 10: 1 decillion
];

export const HAND_BASE_SPEED = 1000;

export function storyTotalCountLead(threshold, formatCount) {
    return "At " + formatCount(threshold) + " total count on your counter, ";
}

export function getEffectiveUnlockedHandsCap(unlockedHandsCap, maxHands) {
    return Math.max(1, Math.min(maxHands, unlockedHandsCap | 0));
}

export function shouldUnlockNextHand(unlockedHands, unlockedHandsCap, totalChanges, maxHands, thresholds = UNLOCK_THRESHOLDS) {
    const cap = getEffectiveUnlockedHandsCap(unlockedHandsCap, maxHands);
    return unlockedHands < cap &&
        unlockedHands - 1 < thresholds.length &&
        totalChanges >= thresholds[unlockedHands - 1];
}

export const hands1 = [

`       _	
      | |
      | |
 _ _ _| |
| | | | |  
|       |_   
|         \\ 
|          \\
|          |
 \\        /
  |      /
  |  1  |  
`, // 1

`     _  
    | |_	
    | | |
    | | |
 _ _| | |
| | | | |  
|       |_   
|         \\  
|          \\
|          |
 \\        /
  |      /
  |  2  | 
  `, // 2

`     _  
   _| |_	
  | | | |
  | | | |
 _| | | |
| | | | |  
|       |_   
|         \\ 
|          |
|          |
 \\        /
  |      /
  |  3  | 
  `, // 3

`     _  
   _| |_	
 _| | | |
| | | | |
| | | | |
| | | | |  
|       |_  
|         \\ 
|          |
|          |
 \\        /
  |      /
  |  4  |  
  `, // 4

`     _  
   _| |_	
 _| | | |
| | | | |
| | | | |
| | | | |    _
|       |  /  /
|        \\/  /
|           /
|          / 
 \\        /
  |      /
  |  5  |  
  `, // 5

`

 _    
| |  
| |_ _ _ 
| | | | |   _
|       |  /  /
|        \\/  /
|           /
|          / 
 \\        /
  |      /
  |  6  |  
  `, // 6 

`
   _  
 _| | 
| | |
| | |_ _ 
| | | | |   _
|       |  /  /
|        \\/  /
|           /
|          / 
 \\        /
  |      /
  |  7  | 
  `, // 7

`     _ 
   _| |
 _| | |
| | | |
| | | |_ 
| | | | |    _
|       |  /  /
|        \\/  /
|           /
|          / 
 \\        /
  |      /
  |  8 |
  `, // 8

`

        __
       /   \\
 _ _ _/  /\\_\\
| | | | |    _
|       |   / /
|        \\/  /
|           /
|          / 
 \\        /
  |      /
  |  9  | 
  `, // 9 

`



 _ _ _ _  
| | | | |     
|       |      
|        \\_   
|          | 
|          / 
 \\        /
  |      /
  |  10 |  
  ` // 10  
];

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
