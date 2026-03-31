# Numbers Are Fun (NAF) - Basic game loop

## 1. High-Level Concept

Numbers Are Fun (NAF) is a browser-based incremental counting game where each number (1, 2, 3, etc.) is its own self-contained progression system with unique mechanics, currencies, visuals, and ascension layers. Players begin with Number 1 unlocked and must reach key milestones to unlock subsequent numbers.

Earlier numbers continue progressing even when the player focuses on later numbers, using either automated loops or summarized offline-style gains to preserve performance.

The game embraces a Mario Bros. 3 stage-play aesthetic, complete with curtains, props, and celebratory animations. It is designed to run smoothly on very low-spec hardware.

---

## 2. Core Pillars

### 2.1 Modular Number-Based Design

- Each number is a standalone mini-game with its own PRD.
- Numbers unlock sequentially through milestone achievements.
- Higher numbers may occasionally unlock bonuses for lower numbers.
- Each number has multiple currencies and multiple ascension layers.

### 2.2 Persistent Multi-Number Progression

- Earlier numbers continue counting in the background.
- Background progress may be summarized to reduce CPU load.
- A global overview screen shows all numbers’ progress simultaneously.

### 2.3 Milestone-Driven Gameplay

- Each number has a major milestone displayed in a dedicated message box.
- A progress bar shows percentage completion toward that milestone.
- Milestone pop-ups pause gameplay only the first time the milestone is reached.
- Achievements grant gameplay bonuses.

### 2.4 Ascension & Multi-Layer Prestige

- Each number has its own ascension currency.
- Ascension resets progress for that number only.
- Ascension pop-ups interrupt gameplay only on first completion.
- Higher-tier prestige layers exist within each number.
- A future “Grand Ascension” layer exists above all numbers.

### 2.5 Aesthetic & Personality

- 90s Nintendo stage-play vibe.
- Curtain transitions (mandatory unless disabled in settings).
- Pixel-art fonts for gameplay; standard fonts for menus.
- GLaDOS-inspired message system with color-coded message types.
- Celebratory animations for unlocks.

### 2.6 Accessibility & Performance

- Runs on low-spec machines.
- Offline play supported.
- Offline progress capped (default), with upgrades to increase cap.
- No sound required.

---

## 3. Gameplay Structure

### 3.1 Number Modules

Each number module includes:

- Unique counting mechanic.
- Unique visuals.
- Multiple currencies.
- Unlockable modifiers (speed, automation, multipliers, etc.).
- A milestone progression path.
- Multiple ascension layers.
- A message set.
- Cross-number interactions.

### 3.2 Cross-Number Interactions

- Bonuses are usually number-specific.
- Rare exceptions: higher numbers may unlock automation or boosts for lower numbers.
- UI must clearly communicate cross-number effects.

### 3.3 Global Overview Screen

Shows:

- All unlocked numbers.
- Their current rate of progress.
- Their next milestone and % progress.
- Whether ascension is available.

---

## 4. UI & Navigation

### 4.1 Pages

- Main Counting Screen.
- Achievements (global + per-number filters).
- Unlocks.
- Collectibles (each with unique benefits).
- Message Log (color-coded).
- Settings.
- Global Overview.
- Development Mode (removed in public release).

### 4.2 Transitions

- Curtain animation plays when switching pages.
- Cannot adjust speed.
- Can be disabled entirely in settings.

### 4.3 Fonts

- Pixel-art fonts for gameplay.
- Standard readable fonts for menus.

### 4.4 Message System

Messages are color-coded by type:

- Tips.
- Number facts.
- Milestones.
- Warnings.
- Humor.

Players can toggle humor off.

---

## 5. Save System

- Autosave to localStorage.
- Export/import via non-human-readable text string.
- Offline play supported.
- Offline progress capped (default), with upgrades to increase cap.
- Only one save slot.

---

## 6. Development Mode

- Accessible via a clickable object.
- Opens a submenu with tools:
  - Skip to milestones.
  - Unlock numbers.
  - Toggle ascension.
  - Adjust count speed.
  - Trigger animations.
- Does not allow editing save data.
- Removed in public release.

---

## 7. Monetization

- Base game: no monetization.
- Future optional monetization:
  - Purchase additional numbers.
  - Must not affect base progression.

---

## 8. Technical Requirements

### 8.1 Performance

- 60fps target.
- Efficient animation loops.
- Minimal DOM updates.
- Low memory footprint.
- Offline progress simulation must be lightweight.

### 8.2 Asset Loading

- Preload only essential assets.
- Lazy-load number modules when first opened.
- Cache assets for unlocked numbers.
- Optionally unload inactive numbers if memory is constrained.

### 8.3 Architecture

- Modular number system.
- Shared core systems:
  - Save/load.
  - Ascension logic.
  - Unlock system.
  - Message system.
  - UI transitions.
  - Offline progress simulator.

### 8.4 Recommended Tech Stack

Svelte + Vite.
