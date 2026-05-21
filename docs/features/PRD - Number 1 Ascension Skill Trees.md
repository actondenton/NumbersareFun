# PRD: Number 1 Ascension — Skill Trees & Prestige Loop

**Document type:** Product requirements (design + UX + economy direction).  
**Status:** Proposal — not yet implemented.  
**Canonical mechanics:** Existing Number 1 systems in `index.html` (hands, speed, cheapen, slowdown, turbo, combos, time warp, clapping, etc.).  
**Ascension gate (unchanged for now):** Total count **≥ 1e35** and **10 hands** unlocked.  
**Player-facing copy** is a first-class deliverable alongside systems; ascension is **first of many** prestiges, not a one-shot ending.

---

## 0. Resolved product decisions

| Decision | Choice | Implication |
|----------|--------|-------------|
| **Respec** | **Free** | Players may **reallocate all Essence** spent on trees at any time (full tree reset or per-tree TBD in UX). Encourages **experimentation** and supports **G3** build diversity without fear tax. |
| **Currency** | **Single: Ascension Essence only** | No secondary prestige shards or insight currency. All nodes cost **Essence**; economy tuning stays **one-dimensional** and easy to read. |
| **Number 2 vs Number 1 ascension** | **No relation** | Unlocking, pacing, or progression for **Number 2** must **not** depend on Number 1 ascensions, Essence, or tree depth. Number 1 ascension is **self-contained** for the Number 1 module. *(Note: live code may still gate Number 2 on first ascension today — decouple when implementing this PRD.)* |

---

## 1. Executive summary

Number 1’s ascension should evolve from a **small flat Essence shop** into a **multi-tree skill system**: each major upgrade family (Speed, Cheapen, Turbo, Time Warp, Slowdown, Clapping, and optionally Combos / QoL) gets its **own branchy tree**. Players spend **Ascension Essence** only to unlock nodes across trees over **roughly 50–100 total ascensions**, with **no single node or tree** mandatory or overwhelmingly optimal.

**Design pillar:** The player should enjoy **staring at the tree** — planning the next 2–3 runs, spotting synergies, and feeling clever without solving a spreadsheet.

---

## 2. Goals

| Goal | Detail |
|------|--------|
| **G1 — Tree fantasy** | Each “obvious” system (speed, cheapen, turbo, warp, etc.) has a **visible subtree** with **meaningful branches** (not a single line). |
| **G2 — Many prestiges** | Target **50–100 lifetime ascensions** to feel “complete” on trees (not 3–5 mega purchases). |
| **G3 — Build diversity** | **No upgrade is extreme vs another**; avoid DPS-only or “always rush X first” dominance. Use **diminishing returns**, **soft caps**, and **cross-tree hooks** so multiple paths reach similar power *given similar Essence spent*. |
| **G4 — Thinky, not homework** | Trees are **readable in one screen** per family (or pannable hub); **short descriptions**; optional **recommendation hints** for first ascension only. |
| **G5 — Copy quality** | All nodes have **player-facing names + one-line fantasy + mechanical summary** (tooltip). |
| **G6 — Loop clarity** | Each ascension run has a **clear reason** to push (unlock next node, finish a branch, try a synergy). |

**Non-goals (this PRD):** Changing **1e35** threshold; exact 20-minute-to-first-ascension balance (noted as **product tension** — see §9).

---

## 3. Ascension game loop (50–100 runs)

### 3.1 Loop shape

1. **Run** — Progress hands, upgrades, combos, turbo, warp, claps; climb toward **1e35** (or future tuned gate if balance changes later).  
2. **Ascend** — Reset Number 1 run per existing rules; gain **Essence** = `clamp(floor(log10(total)), 1, 500)` (or revised curve if economy is re-tuned for 50–100 runs).  
3. **Spend** — Allocate Essence into **skill trees**; **respec is free** — reclaim all spent Essence and re-place points when the player chooses (see §0).  
4. **Repeat** — Faster or wider paths open; new branches **change how you play** this run, not only “+10% numbers.”

### 3.2 Essence economy (directional)

- **50–100 ascensions** implies **average Essence per run** and **node costs** must be modeled so **meaningful** purchases happen **every 1–3 ascensions** early, **every few ascensions** mid, and **rare capstones** late.  
- **Suggestion:** Tier nodes as **Tier I / II / III** with costs scaling ~geometrically *within* a branch, but **cross-tree** costs stay same order of magnitude (§6).  
- **Single currency only:** All purchases use **Ascension Essence** — no secondary prestige currencies (§0).

### 3.3 Pacing target (design intent)

- **First ascension:** Still aligned with product goal of **~20 min active** *when* balance supports it; **gate remains 1e35** until a dedicated balance pass.  
- **Mid game (ascensions ~10–40):** Player is **actively choosing** between 2–3 tempting branches.  
- **Late game (~40–100):** **Capstones** and **quality-of-life** nodes. **Number 2** progression is **out of scope** here and **not** gated by Number 1 ascension (§0).

---

## 4. Skill tree structure (how it should look)

### 4.1 Hub layout

- **Central “Number 1” core** (or **Essence well**) with **6–8 spokes** — one spoke per **tree**.  
- Each spoke opens a **panel** or **zoomed subtree**: **8–20 nodes** per tree for v1 (expand later).  
- **Edges:** Directed; **prerequisites** are **local** (parent nodes) plus rare **cross-tree** requirements (“requires Turbo tier II anywhere”) to encourage breadth without hard locks.

### 4.2 Node types (template)

| Type | Purpose |
|------|--------|
| **Small passive** | +X% to one metric, small flat bonus, or −Y% cost on one action. |
| **Mechanic unlock** | Enables a **quality** (e.g. “second autobuy slot,” “see next clap window”). |
| **Choice node** | **Pick A or B** (mutually exclusive) — same *tier power*, different *playstyle*. |
| **Capstone** | End of branch; **flavorful**, **capped** so it cannot dwarf the rest of the tree. |
| **Meta-QoL** | Offline, UI, log filters — **separate budget** so they don’t compete with power nodes in cost. |

### 4.3 Visual language

- **Icon + short title** per node; **locked** = silhouette; **available** = pulse; **taken** = filled + branch glow.  
- **Branch color** per family (Speed = gold, Cheapen = teal, Turbo = magenta, etc.).  
- **Mobile:** Collapsible trees; **desktop:** one-screen subtree where possible.

---

## 5. Per-tree content (proposals)

*Power levels are **illustrative**; numbers require a balance pass. Ideas mix **obvious** and **interesting**.*

### 5.1 Speed tree — “Tempo”

**Obvious:**  
- Cheaper first N speed levels per hand per run.  
- +% tick rate or effective speed multiplier **cap** raise (small).  
- **Autobuy**: shorter delay, unlock extra hand autobuy earlier, or “autobuy only if next level < X% of balance.”

**Interesting:**  
- **Staggered cadence:** non-adjacent hands tick slightly out of phase → **easier specific combos** (player skill expression).  
- **Burst windows:** every N seconds, +tick value for M seconds (opt-in micro rhythm).  
- **Overclock:** +speed, +heat meter; if heat caps, pause bonus 5s (risk/reward).  
- **Branch choice:** “Smooth scaling” vs “Spiky crit ticks” (same long-run DPS band).

### 5.2 Cheapen tree — “Haggler’s Guild”

**Obvious:**  
- Raise **cheapen cap** (already exists — fold into tree nodes with smaller steps).  
- Flat **−%** on speed purchase cost per cheapen level owned.  
- First cheapen level **−50%** cost once per run.

**Interesting:**  
- **Cross-hand coupon:** every 10th speed buy on any hand grants **−next cheapen cost** on lowest hand.  
- **Debt:** buy speed into negative balance on one hand up to floor; **interest** paid to total count (tunable).  
- **Choice:** “Deep discount on Hand 1 only” vs “Shallow discount on all hands.”

### 5.3 Turbo tree — “Overdrive”

**Obvious:**  
- Meter max, max multiplier, burn rate reduction (existing meta — **split into nodes**).  
- Combo → meter **efficiency** +X%.

**Interesting:**  
- **Turbo phases:** at 100% meter, choose **burn fast / high mult** vs **burn slow / low mult** once per activation.  
- **Overfill:** meter can go to 120% with decay; only **top 20%** adds mult.  
- **Synergy gate:** “+meter from claps” node (links Clap tree without forcing it).

### 5.4 Time Warp tree — “Chronicle”

**Obvious:**  
- Aura spawn rate, **overflow ratio** (existing meta — granular steps).  
- Click grants **+seconds** or **+scale** (small increments).

**Interesting:**  
- **Resonance:** if two auras would spawn within T seconds, merge into **one super-aura** on a chosen hand.  
- **Recall:** once per run, **undo** last non-ascension purchase (hard cap).  
- **Branch:** “More auras” vs “Stronger manual clicks, fewer auras.”

### 5.5 Slowdown tree — “Heavy Hands”

**Obvious:**  
- −% slowdown **cost**; +1 max level (if cap raised in future).  
- **+% tick value** per slowdown level (tiny, stacked cap).

**Interesting:**  
- **Anchor hand:** one designated hand gets **double slowdown value**, others get −10% (build identity).  
- **Rhythm:** digit changes **slower** but **each tick** worth more — UI shows **DPS equivalence** so players trust the trade.  
- **Choice:** “Sustain” (longer time at max slowdown) vs “Burst” (short mega-ticks after buying slowdown).

### 5.6 Clapping tree — “Applause”

**Obvious:**  
- −clap cooldown; +clap **bonus chance** (cap ~half current gap to avoid trivial maxing).  
- +max clap pairs per tick (careful — **cap at 2–3**).

**Interesting:**  
- **Encore:** if both hands roll no bonus, **+next clap chance** (streak forgiveness).  
- **Duet / Quartet:** bonuses slightly higher if clapping hands are **adjacent indices** or **same speed bucket**.  
- **Choice:** “More claps” vs “Fewer claps, bigger bonus rolls.”

### 5.7 Combos & global tree — “Patterns” / “Comfort”

**Obvious:**  
- +% combo **bonus strength** (all earned patterns, **tiny**).  
- **Turbo meter** on **first discovery** of a pattern tier.

**Interesting:**  
- **Wildcard tick:** once per run, set one hand to **any digit** (cooldown long).  
- **Hint system:** subtle UI for **one** undiscovered pattern (not full solution).  
- **QoL branch:** offline cap, animation toggles already in menu — **migrate** to tree with **free first node** then Essence costs.

---

## 6. Balance: avoid one dominant upgrade

### 6.1 Rules

- **B1 — Banding:** Any node’s **equivalent power** (modeled as % impact on time-to-1e35) stays within **~0.5×–2×** of another node **at the same tier** (same cumulative Essence depth).  
- **B2 — Diminishing returns:** Repeated “+10%” becomes **+10% → +8% → +6%** of *remaining gap* or use **additive layers with global soft cap**.  
- **B3 — Cross-tree dependencies:** At most **light** gates (“need any 5 Tier-I nodes globally”) — **never** “need full Turbo tree.”  
- **B4 — Mutual exclusivity:** **Choice nodes** are the main place for **A vs B** power; both sides **simulation-tested** for parity.  
- **B5 — No mandatory capstone:** Player who spreads points **evenly** should reach **~85–95%** of min-max speedrunner who optimizes — not 40%.  
- **B6 — Free respec:** Because respec has **no cost**, temporary “wrong” picks do not punish; balance can assume players will **iterate** — avoid traps that only hurt players who don’t read guides.

### 6.2 Validation

- Spreadsheet or sim: **time-to-threshold** for **3 archetypes** (Turbo-focused, Cheapen-focused, Clap-focused) should vary **< 15%** at same Essence.  
- Playtest: **blind pick** builds over 10 ascensions each.

---

## 7. Player-facing copy (deliverables)

- **Tree hub:** One line value prop — *“Every ascent adds a permanent trick to Number 1.”*  
- **Respec:** Short, reassuring line — e.g. *“Reallocate your Essence any time — no cost.”*  
- **Per-tree flavor blurb** (2 sentences) when opening a spoke.
- **Per-node:** Name (3–6 words), **flavor** (one line), **effect** (one line, numbers).  
- **First ascension:** Teach **Essence persists**, **run resets**, **trees are forever**; **no** “you won” tone.  
- **50–100 runs:** Optional **milestone lines** at ascensions 10 / 25 / 50 / 100 (cosmetic titles only, no power).

---

## 8. Phasing (implementation)

| Phase | Scope |
|-------|--------|
| **MVP** | One **hub UI** + **2 trees** (e.g. Speed + Turbo) reusing current Essence; migrate existing flat upgrades into nodes. |
| **v1** | All **6** gameplay trees + **QoL** mini-tree; **free respec** UX (full reset and/or per-tree). |
| **v2** | Choice nodes, cross-tree links, sim-balanced capstones. |

---

## 9. Risks & remaining open questions

- **R1:** **1e35** in **~20 min** active likely needs **large** early multipliers or a **lower gate** later; until then, copy must **not overpromise** time.  
- **R2:** Skill UI scope — **art**, **layout**, **save migration** from flat `number1AscensionUpgrades`.  
- **R3:** **Analysis paralysis** — mitigated with **recommended path** (first 5 nodes) and **tier labels**.  
- **R4:** **Implementation debt** — today Number 2 may be tied to `number1HasAscended`; aligning with §0 requires a **separate unlock path** for Number 2.  
- **Q1 (open):** **Respec UX** — one button “reset all trees” vs **per-tree** reset vs confirmation flow to prevent mis-taps?  
- **Q2 (open):** Should **free respec** have a **cooldown** (e.g. once per real-time day) to reduce save-scumming, or truly **unlimited**?

---

## 10. Success metrics (live ops)

- **Median ascensions** before 7-day churn (target: **>15** for engaged cohort).  
- **Build diversity:** % players with **≥3 trees** touched by **ascension 20**.  
- **Session length** post-ascension: uptick = tree engagement.  
- **Support:** zero “I thought I had to max X” confusion in feedback.

---

*Authoring stance: long-time incremental designer — favor **readable trees**, **parity across fantasies**, and **prestige as habit**, not punishment.*
