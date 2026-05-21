# Numbers Are Fun (NAF)

## Product Requirements Document (PRD) – Number 1 Module

---

# 1. Overview

The **Number 1 Module** is the foundational counting system in *Numbers Are Fun (NAF)*. It introduces the player to core mechanics, pacing, upgrades, and visual language that will be expanded upon in later numbers. Number 1 focuses on **counting by ones using animated ASCII‑style hands**, progressively unlocking additional hands, upgrades, and systems that increase complexity and production.

This module is designed to be approachable for new players while establishing the incremental depth expected throughout NAF.

---

# 2. Core Gameplay Loop

1. The player begins with **one hand** counting at **1 count per second**.  
2. The hand displays an ASCII animation corresponding to the **last digit** of the current count (1–10 loop).  
3. The player purchases upgrades to increase speed, reduce upgrade costs, and unlock additional hands.  
4. New systems (combinations, turbo, slowdown, time warp) unlock as total count milestones are reached.  
5. The player eventually reaches **1 undecillion total count**, unlocking **Ascension** for Number 1.

---

# 3. Visual & Animation Requirements

## 3.1 Hand Animation

- ASCII‑style hand art is used for all hands.  
- Animation corresponds to the **last digit** of the hand’s current count.  
- Animation speed increases or decreases based on upgrades (no frame skipping).  
- Animation loops must be seamless.

## 3.2 Hand Display

Each hand displays:

- Current count  
- Current count per second (base + bonuses)  
- Combined production including bonuses, turbo, slowdown, and multipliers  
- Upgrade panel directly beneath the hand  

## 3.3 UI Behavior

- Hands cannot be reordered.  
- Celebratory animations appear when:
  - A new hand is unlocked  
  - A combination bonus is discovered  

---

# 4. Hands & Unlock Progression

| Hand   | Unlock Requirement        | Expected Time           | New Systems Unlocked |
| ------ | ------------------------- | ----------------------- | -------------------- |
| Hand 1 | Starting hand             | Immediate               | Speed, Cheapen       |
| Hand 2 | 1 billion total count     | ~5 minutes              | Combination Bonuses  |
| Hand 3 | 1 trillion total count    | ~5 minutes after Hand 2 | Turbo System         |
| Hand 4 | 1 quadrillion total count | ~5 minutes after Hand 3 | Slowdown System      |
| Hand 5 | 1 quintillion total count | ~5 minutes after Hand 4 | Time Warp System     |

All hands begin at:

- 1 count/sec  
- No upgrades  
- No carryover from previous hands  

---

# 5. Upgrade Systems

## 5.1 Speed Upgrade

- Increases hand speed by **100% per purchase**.  
- Cost scales **exponentially**.  
- Each hand has its own independent speed level.  
- Speed increases directly affect animation speed.

## 5.2 Cheapen Speed Upgrade

- Reduces the cost of **future** speed upgrades by **99%**.  
- Does not apply retroactively.  
- Each hand has its own cheapen levels.  
- Initially capped at **6 levels**.  
- Additional levels unlock through ascension.  
- Cost scales faster than speed upgrades.  
- Not visible before being unlocked.

## 5.3 Slowdown Upgrade (Hand 4+)

- Available only after unlocking Hand 4.  
- Reduces animation speed back to **1 count/sec**.  
- Increases production per tick by **10×**.  
- Does not persists through ascension.  
- Not visible before Hand 4 is unlocked.  
- Uses the same currency as other upgrades.
- Slowdown upgrade is specific to each hand.

---

# 6. Combination Bonus System (Hands 1 & 2)

## 6.1 Trigger Conditions

- Activated once Hand 2 is unlocked.  
- A combination triggers when **both hands display the same last digit at the same moment**.  
- Each unique combination is a **one‑time permanent unlock**.

## 6.2 Effects

- Each combination grants a **multiplicative bonus** to all hands.  
- Bonuses do not persist through ascension.  
- Ascension does **not** unlock new combinations.

## 6.3 UI

- Combination Index page unlocks with Hand 2.  
- Displays:
  - Completed combinations  
  - Remaining combinations  
  - Effects of each combination
  - Count of the number of times each combo has been activated.  

## 6.4 Messaging

- First‑time combination unlock triggers:
  - A unique message  
  - A celebratory animation  

---

# 7. Turbo System (Hand 3+)

## 7.1 Unlock

- Unlocks at **1 trillion total count**.

## 7.2 Functionality

- Turbo is a **global mechanic** affecting all hands.  
- Turbo charge accumulates based on **hand combinations**:
  - Larger combinations → faster turbo gain  
- Turbo meter is visible only after it is unlocked.  
- Turbo activation is **manual**.  
- Turbo has a **cooldown** after activation.  
- Turbo bonuses scale with ascension.  
- UI displays:
  - Turbo meter  
  - Number of times turbo has been activated  

---

# 8. Slowdown System (Hand 4+)

## 8.1 Unlock

- Unlocks at **1 quadrillion total count**.

## 8.2 Functionality

- Slowdown resets animation speed to **1 count/sec**.  
- Slowdown upgrade is hand specific.
- Production increases by **10×** per tick.  
- Costs 10 quadrillion for the first level, costs 100 quadrillion for the next upgrade.
- There should be 3 upgrade levels and more can be unlocked after ascension.  
- Does not persist through ascension.  
- Not visible before Hand 4.

---

# 9. Time Warp System (Hand 5+)

## 9.1 Unlock

- Unlocks at **1 quintillion total count**.

## 9.2 Functionality

- A random hand receives a **Time Warp Aura** every **0–60 seconds**.  
- Only unlocked hands can receive an aura.  
- Clicking the aura grants **60 seconds of production** instantly.  
- Unclicked auras persist indefinitely unless the player triggers ascension.  
- If all hands have an aura:
  - Next aura grants **25%** of the clickable value  
  - This 25% value is upgradable after the first ascension  

---

# 10. Currencies

## 10.1 Count Currency

- Each hand has its own count currency.  
- Currencies do not transfer between hands.  
- Total count is the sum of all hands.

## 10.2 Ascension Currency

- Earned only after reaching **1 undecillion total count**.  
- Applies only to Number 1.  
- Used to unlock:
  - Additional cheapen levels  
  - Turbo scaling upgrades  
  - Time warp overflow upgrades  

---

# 11. Ascension System

## 11.1 Requirements

- Unlocks at **1 undecillion total count**.

## 11.2 Reset Behavior

Ascension resets:

- All hands  
- All upgrades  
- All currencies  
- All progress for Number 1  
- Combination bonuses
- Time warp overflow upgrades  
- Turbo scaling upgrades  
- Slowdown upgrades  

## 11.3 Ascension Bonuses

- Apply **only** to Number 1.  
- Include:
  - Additional cheapen speed levels  
  - Turbo scaling improvements  
  - Time warp overflow scaling  

---

# 12. Messaging System

## 12.1 Message Types

- Milestones  
- Combination unlocks  
- Tips  
- Progress hints  
- System unlock notifications  

## 12.2 Behavior

- Milestone messages interrupt gameplay **only once**.  
- Combination messages trigger only on first discovery.  
- Tips appear if the player is progressing slower than expected.  
- After each unlock, the next milestone is clearly displayed.

---

# 13. Performance Requirements

- All animations must run smoothly on low‑spec hardware.  
- No frame skipping; animation speed changes must be natural.  
- Background counting continues even when the player is on another page.  
- Time warp, turbo, and slowdown calculations must be lightweight.

---

# 14. Dependencies

- Core NAF save/load system  
- Core NAF message system  
- Core NAF UI framework  
- Core NAF ascension framework  
- ASCII art library for hand animations  

---

# 15. Acceptance Criteria

1. Player can progress from Hand 1 to Ascension without errors.  
2. All unlocks occur at the correct total count thresholds.  
3. All upgrade systems function independently per hand.  
4. Combination bonuses trigger correctly and persist.  
5. Turbo, slowdown, and time warp systems behave as specified.  
6. Ascension resets only Number 1 and grants correct bonuses.  
7. All UI elements display accurate production values.  
8. Performance remains stable on low‑spec hardware.
