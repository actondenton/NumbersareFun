# **Numbers Are Fun (NAF) - Number 1: Clapping feature**

## **Feature: Clapping Upgrade – Number 1**

---

## **1. Overview**

The **Clapping** feature introduces a new upgrade mechanic for the Number 1 progression path in *Numbers Are Fun*. When two hands end on the number **5**, they perform a **clap**, triggering a chance to earn **bonus upgrade levels**. These bonus levels increase the upgrade’s effectiveness without increasing its cost. The feature unlocks automatically at **1 octillion total count**, coinciding with the **8th hand unlock** and accompanied by a **Story Message** explaining the mechanic.

This feature adds visual excitement, progression depth, and a new layer of randomness to the early and mid‑game experience.

---

## **2. Goals & Success Criteria**

### **Goals**

- Introduce a visually satisfying and mechanically meaningful upgrade mechanic.
- Provide a new source of progression that feels rewarding without destabilizing balance.
- Create a foundation for future Ascension‑based enhancements.

### **Success Criteria**

- Players understand the clapping mechanic immediately upon unlock.
- Bonus levels feel impactful but not mandatory.
- Clapping animations are readable even when multiple claps occur.
- Feature integrates seamlessly with existing CPS and upgrade systems.

---

## **3. Unlock Conditions**

- **Unlock Trigger:** 1 octillion total count.
- **Simultaneous Unlock:** Occurs at the same time as the **8th hand**.
- **Story Message:** Uses existing Story Message configuration system.  
  - Message includes explanation of clapping, bonus levels, and visual cues.

---

## **4. Core Mechanics**

### **4.1 Clap Trigger**

- A **clap** occurs when **any two hands** end on the number **5**.
- Only **2 claps maximum** per event (pair hands sequentially).
- **Future Expansion:**  
  - Ascension talent tree upgrade will allow **all pair combinations** to generate claps.

### **4.2 Bonus Upgrade Chance**

- Each clap triggers:
  - **10% chance per hand** involved in the clap.
  - A single clap can award **0, 1, or 2 bonus levels**.
- Bonus levels:
  - Increase upgrade effectiveness **exactly like normal levels**.
  - Do **not** increase cost.
  - Are included in **Base CPS** calculations.

### **4.3 Bonus Level Display**

- Display format:  
  `Level X +Y`
- `+Y` only appears when Y > 0.
- Bonus portion uses a **color that is readable in both light and dark mode**.  
  - Final color selection TBD by UI/UX team.

---

## **5. UI / UX Requirements**

### **5.1 Clap Animation**

- When a clap occurs:
  - Two hands showing **5** appear near the **center of the screen**.
  - A short animation shows them **colliding** to represent a clap.
- Animation duration:
  - **~1 second**, including fade‑out.
- Multiple claps:
  - Use a **cascading stagger** in timing.
  - Slight positional offsets to avoid overlap and maintain clarity.

### **5.2 Bonus Level Display**

- Appears in the upgrade UI next to the existing level number.
- Bonus portion uses a distinct color (universal across themes).
- Tooltip (if applicable) should clarify:
  - Base level  
  - Bonus level  
  - Total effective level

### **5.3 Settings Menu**

- Add toggle under **Visual Settings**:
  - **“Show Clap Animation”** (default: ON)
- Turning animation off:
  - Does **not** affect clap logic or bonus level generation.
  - Only suppresses the visual animation.

---

## **6. Functional Requirements**

### **6.1 Clap Detection**

- System checks all hands each tick.
- When two hands end on 5:
  - Trigger clap event.
  - Trigger animation (if enabled).
  - Roll bonus chance per hand.

### **6.2 Bonus Level Application**

- Bonus levels stack indefinitely.
- Stored separately from base levels.
- Included in all CPS calculations.

### **6.3 Story Message**

- Triggered immediately upon unlock.
- Uses existing Story Message system.
- Must reference:
  - Hands ending on 5  
  - Clapping animation  
  - Bonus level chance

---

## **7. Non‑Functional Requirements**

- **Performance:**  
  - Clapping animations must not cause frame drops even during rapid multi‑clap sequences.
- **Accessibility:**  
  - Bonus level color must meet contrast requirements for both themes.
- **Scalability:**  
  - System must support future Ascension upgrades that increase clap frequency.

---

## **8. Edge Cases**

- **Animation disabled:**  
  - Clap logic still runs; bonus levels still awarded.
- **Simultaneous multiple claps:**  
  - Staggered animations must not overlap excessively.
- **Hands not visible on screen:**  
  - Clap animation still uses the floating center‑screen representation.

---

## **9. Telemetry & Analytics**

Track the following:

- Number of claps triggered.
- Number of bonus levels awarded.
- Average bonus levels per player per hour.
- Toggle usage for “Show Clap Animation”.
- Player retention after unlocking clapping.

---

## **10. Future Expansion Hooks (Ascension 1)**

These are not implemented now but must be architecturally supported:

### **10.1 Clap Combination Upgrade**

- Ascension talent enabling **all pair combinations** to generate claps.
- Potentially exponential clap events when many hands show 5.

### **10.2 Bonus Levels for Cheapen & Slowdown**

- Ascension upgrade allowing clapping to generate bonus levels for:
  - **Cheapen**
  - **Slowdown**
- Details will be defined in the **Number 1 Ascension PRD**.

---

## **11. Open Questions (for future PRDs)**

- Should there be a cap on bonus levels?
- Should bonus levels be reset on ascension or partially retained?
- Should there be achievements tied to clapping?

---
