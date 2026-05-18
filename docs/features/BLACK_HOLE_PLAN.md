# Black hole (Number 1) — phased progression design

**Voice:** treat this as a **fun-first** prestige layer: every phase should **read on the meter** (total count, essence, spectacle) and every **feed** into the hole should feel like a deliberate sacrifice or investment—not silent spreadsheet growth.

**Unlock gate (all phases):** the player must **own every node** on the Number 1 ascension skill map before any of this content begins (same idea as today’s “map complete” gate).

---

## Implementation decisions (locked — v1 handoff)

These answers exist so engineering does not guess behavior at integration time.

| Topic | Decision |
|--------|----------|
| **Phase 7 vs main total** | **Hard reset** at evaporation entry: main progression totals are no longer the primary readout; only the epilogue **1/s counter** advances (see Phase 7). |
| **Phase 5 hand queue** | **Fixed order:** sacrifice **Hand 10 → 9 → … → 1** (no player pick). |
| **Phase 4 “100× / 5s” scope** | Applies to **all count gain** in the window (ticks, offline slices, combo pulses, time-warp grants, etc.). |
| **Ascension tree respec after BH starts** | **Blocked** while the black-hole arc is active (or until a dedicated “reset BH arc” flow exists—same UX outcome: cannot clear tree mid-arc). |
| **Number 1 ascend during Phase 5 digest** | **Allowed.** Digest timers use **wall-clock** real time and **keep elapsing** across ascends (run reset does not pause digest). |
| **Phase 2 Essence pacing buff** | **Parallel bonus pool** (e.g. “+% next ascend” or stackable bonus Essence bucket), **not** only silently rewriting the base ascend formula (formula may still be tuned separately). |
| **Offline + timed VFX buffs (Hawking / lensing / jet)** | Missed windows become a **banked lump** on return (EV preserved simply; avoids simulating every proc offline). |
| **Hand fed to furnace (gameplay removal)** | On **feed commit**, that hand is **immediately removed from the simulation** — it **cannot** be unlocked, counted, combo’d, clapped, time-warped, or used for any bonus (see Phase 5 — *Sacrifice contract*). |
| **Phase 6 vs Hawking + lensing** | Once the player is in **Phase 6 (Astrophysical jets)**, **Hawking radiation** (Phase 3) and **Gravitational wave** (Phase 4) **no longer run** — no procs, **no** temporary buffs, **no** VFX — so the screen stays readable. **Tuning obligation:** jet (and any always-on mults earned through Phases 3–5) must be **strong enough** that losing those two transient systems is **not** a net power downgrade for the player. |
| **Phase 6 jet VFX (layering)** | **Background** effect: an **energy beam** that **charges** then **fires along a vertical path** (bottom of viewport → top), read as “powering up then shooting.” **Z-order:** jet renders **behind** interactive/readout UI (hands, rows, buttons, BH panels) so gameplay stays crisp on top. |
| **Phase 1 gate** | **Single cumulative Essence bar:** **350** Ascension Essence total to complete Phase 1 (Essence-only progress). **2–3 upgrades** scale with bar fill (see Phase 1). |
| **Phase 4 — Gravitational Wave trigger** | **Hybrid trigger:** passive automatic timer runs at **60s → 15s** with mass (existing rule), plus a **manual trigger** that can fire at **50% of the current passive interval** (faster cadence). Default implementation: manual fire **resets** passive timer to prevent double-proc stacking in the same moment. Wave effect remains **100× for 5s** on **all count gain** (see existing row). |
| **Phase 2 upgrade set (v1)** | Three upgrades: **Essence → mass ratio**, **Photon shell (disk primer)**, **Ergosphere coupling** (passive Turbo/sec). Other candidates deferred in Phase 2 section. |
| **Phase 3 upgrade set (v1)** | Three upgrades, all shipped: **Disk luminosity**, **Viscous accretion**, **Coronal loop** (see Phase 3). |
| **Turbo off + Gravitational drive** | Passive **Gravitational drive** meter/sec **still accrues** while Turbo boost toggle is **Off**; **multiplier stays 1×** until boost is **On** (meter banks charge). Document in UI. |
| **BH placement in ascension UI** | Black Hole progression lives on the **ascension screen**. The black hole **replaces** the ascension hand (not overlay). When replacement occurs, play a short **hand absorption** VFX so the transition is legible and dramatic. |
| **Parallel bonus pool UI** | Show BH parallel bonuses in the **ascension bonus display area** using a **distinct color/style** from regular ascension node bonuses so players can instantly identify BH-origin bonuses. |
| **Phase transition narrative** | Phase transitions use **pause-the-game story modals** with short text (draft copy in this doc), then explicit confirm to resume play. |

---

## Relationship to current code (baseline)

The shipped prototype in `index.html` is a **single knob**: Ascension Essence → **mass level** → global multiplier on count gain (`number1AscensionBlackHoleLevel` + constants). Treat that as a **placeholder** until the phased system below is implemented.

When implementing phases, **replace or fold** the placeholder so save fields, UI, and math match the seven-phase model (avoid two competing “black hole” economies).

---

## Phase order (player-facing unlock sequence)

Phases **unlock in order**. Each phase has its own **primary fantasy**, **feeds** (what the player puts in), and **rough power targets** so pacing can be tuned.

```mermaid
flowchart LR
  fullTree[Full ascension tree]
  p1[1 Mass Accumulation]
  p2[2 Black hole collapse]
  p3[3 Accretion disk]
  p4[4 Gravitational lensing]
  p5[5 Gravitational furnace]
  p6[6 Astrophysical jets]
  p7[7 Evaporation]
  fullTree --> p1 --> p2 --> p3 --> p4 --> p5 --> p6 --> p7
```

---

### Phase 1 — Mass Accumulation (new)

**Trigger:** completing the ascension tree starts an event: the **Numerical Mass Accumulator**.

**Story:** the player has counted so high that numbers begin to **gain mass**; increasing this **numerical mass** is believed to **increase counting speed**.

**Mechanics (v1):**

- **One Essence sink:** a **single cumulative bar** costing **350** Ascension Essence total (see **Implementation decisions**). Only Essence spent into this bar advances progress—no passive fill from counting.
- **2–3 upgrades** (names `TUNE`) whose **tier or strength scales as the bar fills** (e.g. milestones at ~33% / ~66% / 100%, or continuous scaling—implementation choice). Each upgrade line must be **legible** on the panel and each Essence investment should produce an obvious **immediate CPS bump** in the current run:
  1. **Count per second** — improves run CPS (additive or mult per tier, `TUNE`).
  2. **Ascension Essence generation** — improves Essence earned on Number 1 ascend (or effective ascend payout; `TUNE`).
  3. **Max slowdown level** — raises the **cap** on slowdown upgrades for the Number 1 run (ties into existing slowdown systems in `index.html`; must not soft-lock if slowdown is absent—guard in code).

**Transition:** when the bar reaches **350 / 350** Essence spent, play the **collapse** beat → **Phase 2**.

**Pacing note (design target):** ~**2–3** ascensions to fund the bar (~350 Essence total), per tuning pass.

---

### Phase 2 — Black hole collapse (new)

**Story:** the player **creates a black hole** and notices they **still get** the counting-speed benefit they had from raw numerical mass, and can **push mass further** for more upgrades.

**Goals:** help the player **regularly reach ~1e100** total count; continue funding Essence for **Phase 3** via the **parallel bonus pool** (on ascend; see **Implementation decisions**).

**Pacing:** target roughly **~5 ascensions** in this band to bank enough Essence for **Phase 3** (~**1000** Essence throughput target from broader tuning doc).

#### Phase 2 upgrades (v1 — locked set of 3)

1. **Essence → mass ratio:** improves how much **numerical mass** each unit of Essence buys (or reduces effective cost per mass step). Primary **efficiency** knob for the Phase 2 mass sink.

2. **Photon shell (disk primer):** small **bridge** into Phase 3: **+Hawking proc frequency** (frequency branch locked).

3. **Ergosphere coupling:** early **passive Turbo meter / sec** (small) so the run still feels responsive before **Gravitational drive** fully ramps in the furnace.

**Deferred candidates** (not v1 unless design reopens): **Ascension resonance** (parallel pool amplifier), **Frame dragging** (Phase-2-only count mult), **Tidal bulk discount** (cheaper marginal mass).

---

### Phase 2 — Gap analysis (design / art vs current implementation)

*Audience: engineering + art. Source of truth for “v1 locked” is the sections above + the Implementation decisions table; current behavior is primarily `legacy-boot.js` (black hole state, `tryBuyNumber1BlackHole`, ascend gain breakdown, `updateBlackHolePhaseStep`, ascension panel HTML).*

#### A. Gameplay & systems

| Gap | Plan / intent | Current implementation | Severity |
|-----|----------------|-------------------------|----------|
| **A1 — No three upgrade tracks** | v1 locked set: **(1)** Essence→mass **efficiency**, **(2)** Photon shell (Hawking **primer**), **(3)** Ergosphere coupling (**passive Turbo / sec**). | Phase 2 is a **single sink**: pour Essence → `phase2Mass` + `phase2EssenceBank` → `getBlackHolePhase2MassMult()` only. No separate purchases, levels, or tooltips for the three named upgrades. | **High** — core Phase 2 identity missing. |
| **A2 — Photon shell absent** | Small bridge into Phase 3: **+Hawking proc frequency** (or equivalent “disk primer”) *during* Phase 2. | Hawking cadence / amplitude logic is **Phase 3+** only (`getBlackHoleHawkingMult`, `updateBlackHolePhaseStep`). Nothing in Phase 2 modifies future Hawking or a visible “primer” meter. | **High** |
| **A3 — Ergosphere coupling absent** | Early **passive Turbo meter / sec** from a **Phase-2-purchased** track (plan; aligns with later “Gravitational drive” philosophy). | No Phase-2-only passive meter/sec tied to BH purchases. Turbo fill remains combo/ascension-ring/etc. as elsewhere. | **High** |
| **A4 — Essence→mass ratio not a separate knob** | Primary **efficiency** knob: improve mass per Essence *or* reduce effective cost per step (player-facing choice / upgrades). | Efficiency is **only** the global cost curve (`BLACK_HOLE_COST_BASE` / `BLACK_HOLE_COST_GROWTH`) + fractional step via bank; no player-controlled ratio upgrade. | **Medium–High** |
| **A5 — Parallel bonus pool semantics** | Pool is the **Phase 2 Essence pacing buff** for **next ascend** (or stackable bucket), **not** “only silently rewriting” base formula — player should **feel** Essence→parallel linkage. | `phase2ParallelBonusPool` **creeps up over real time** (`+ dt * 0.0002`, cap `1.5`) **independent of feeding Essence into mass**, then adds to ascend `phaseMult`. No spend interaction, no bucket UI breakdown on ascend preview. | **Medium** — mechanic exists but **does not match** the “feed the hole → parallel payoff” fantasy. |
| **A6 — Phase exit condition vs mass ceiling** | “Push mass further” with upgrades; pacing doc speaks to **Essence throughput toward Phase 3** (~5 ascensions / ~1000 Essence class targets — tune as needed). | Hard gate **`BLACK_HOLE_PHASE2_MASS_CAP` = 60** mass steps then auto **Phase 3**; legacy `BLACK_HOLE_MAX_LEVEL` (400) still exists elsewhere and can confuse tuning/docs. | **Medium** — may be fine numerically, but **needs explicit design sign-off** and doc alignment. |
| **A7 — ~1e100 run goal** | Phase 2 should help the player **regularly reach ~1e100** total count. | Power is almost entirely **`getBlackHolePhase2MassMult`** (+ Phase 1 carryover) + rest of run; **no dedicated tuning pass** documented here against the 1e100 bar for this phase alone. | **Medium** (validation / QA) |

#### B. UX, clarity & ascension UI

| Gap | Plan / intent | Current implementation | Severity |
|-----|----------------|-------------------------|----------|
| **B1 — Parallel pool UI (locked decision)** | Show BH parallel bonuses in ascension area with **distinct color/style** from tree bonuses. | Ascend math uses pool in `computeNumber1AscensionGainBreakdown`, but **no dedicated BH-origin pill** / line item in ascend confirm or hub stats (void pill shows BH mult + mass, not “Parallel pool +X.XX”). | **Medium** |
| **B2 — Upgrade legibility** | Each Phase-2 upgrade line should be **legible** on the panel with clear **cause → effect** (per plan voice: “read on the meter”). | One paragraph + purse line + single button; no per-track meters, costs, or “next bonus at tier N”. | **Medium** |
| **B3 — Phase transition UX (global)** | Phase transitions: **pause**, story modal, **confirm** to resume (table row). | Mix of **story banners**, logs, and VFX; not the full gated modal pattern described for all transitions. (Phase 1→2 has collapse banner + pulse; verify Phase 2→3 matches spec.) | **Low–Medium** (cross-phase) |

#### C. Art direction & spectacle

| Gap | Plan / intent | Current implementation | Severity |
|-----|----------------|-------------------------|----------|
| **C1 — Hand absorption / map hand replacement** | When BH replaces ascension hand: **short hand-absorption VFX** so transition is “legible and dramatic.” | Phase 1 has **mass / singularity** CSS classes on `#number1-stage-root`; **no bespoke** “hand absorbed into void” beat tied to map completion → Phase 2 entry beyond existing mood classes. | **Medium** (art) |
| **C2 — Phase 2 visual identity** | “Black hole collapse”: player **feels** collapse, singularity depth, **deliberate feed** (plan voice). | Mostly **copy + stat line** + same ascension page chrome as other phases; no unique **key art**, shader, or **feed pulse** on successful pour (beyond general BH strip if present). | **Medium** (art) |
| **C3 — Juice on feed** | Every feed should feel like **investment**, not silent spreadsheet growth. | Functional logs + panel refresh; **no** screen-space **consequence** (shake, ring, particle burst scaled by Essence spent, SFX tier by mass level, etc.). | **Low–Medium** (art + audio) |

#### D. Narrative & copy

| Gap | Plan / intent | Current implementation | Severity |
|-----|----------------|-------------------------|----------|
| **D1 — Story beat for “still have numerical mass benefit”** | Explicit story: player **notices** they still get counting-speed benefit from raw numerical mass, **then** pushes mass further. | Phase 1 already encodes inertial mult; Phase 2 copy mentions collapse + parallel pool but **does not strongly restate** the “mass benefit persists + deepens” beat in one tight line tied to **visible meters**. | **Low** |
| **D2 — Naming the three upgrades** | Locked names: **Essence→mass ratio**, **Photon shell**, **Ergosphere coupling**. | Names **only appear in this doc**, not in-game. | **Low** until A1 is built |

#### E. Engineering consistency & tech debt

| Gap | Notes | Severity |
|-----|--------|----------|
| **E1** | **`BLACK_HOLE_MAX_LEVEL` (400) vs `BLACK_HOLE_PHASE2_MASS_CAP` (60)`** — clarify which is authoritative for saves, UI, and `number1AscensionBlackHoleLevel` migration. | **Low** |
| **E2** | **Save / migrate** when adding real upgrade levels (new fields, respec rules, `hasBlackHoleProgressLockingRespec`). | **Low** (ahead of work) |
| **E3** | **Offline / tab background**: parallel pool still ticks (`updateBlackHolePhaseStep`); mass bank does not. Decide if passive pool should tick offline or bank EV lump (per plan’s general offline philosophy for other systems). | **Low** |

#### Suggested work order (starter backlog)

1. **Ship A1–A4 in one vertical slice**: three visible upgrade rows + Essence costs + effects wired (mass efficiency, Hawking primer, passive Turbo/sec) — even at tier 1 each — before heavy art.  
2. **Rework A5** so parallel pool **ties to player action** (e.g. % of Essence spent into mass, or per completed mass tier) and **surface it** (B1) in ascend preview + hub.  
3. **Close A2/A3** with minimal Phase-3-safe implementation (primer can pre-seed timers or soft-cap CD hidden until P3 if needed).  
4. **Art pass C1–C3** once the panel has real buttons to hang VFX/SFX on.  
5. **Tuning pass A6/A7** with target curves and a single source of truth for mass cap vs legacy constants.

---

### Phase 3 — Accretion disk

**Fantasy:** continued Essence investment makes an **accretion disk** form around the hole. **Visual reference:** *Interstellar*-style disk (readable, iconic).

**Mechanics (core):**

- The disk **occasionally emits Hawking radiation**: a **wavy / radiation** screen effect.
- Each emission grants a **temporary CPS boost**, e.g. **+100 count/s for 5 seconds** (numbers are placeholders—scale with upgrades below).
- **Through Phase 5 only:** while Phases 3–5 are active, Hawking behaves as written. **After Phase 6 begins**, Hawking **does not activate** (see **Implementation decisions** — avoids stacking VFX with the jet).

#### Phase 3 upgrades (v1 — all three locked)

All three lines ship on the accretion panel; tiers per line are `TUNE`.

| Working name | Player read | Effect (design) |
|--------------|-------------|-----------------|
| **Disk luminosity** | “Brighter bursts” | Each Hawking tick grants **stronger** temporary CPS during the burst window (amplitude). |
| **Viscous accretion** | “More frequent flares” | Hawking emissions happen **more often** (proc rate / cooldown). |
| **Coronal loop** | “Longer burn” | **Longer** burst duration and/or allows **one** stack refresh rule without exploding mult (`TUNE` caps). |

**Naming note:** “Luminosity / viscous / coronal” reads astro without jargon overload; rebrand if you want a more playful tone.

**Power target:** player can reach **~1e150** total count through this phase. **Pacing target:** ~**10** ascensions of Essence investment in this phase (from tuning doc).

---

### Phase 4 — Gravitational lensing

**Upgrade name (locked):** **Gravitational Wave**.

**Mechanics:**

- A **100× multiplier to all count gain** for **5 seconds** (numbers `TUNE`); strength/duration may still **upgrade with Essence** invested into this phase.
- **Trigger (locked):** **hybrid**. Passive automatic interval is **60 seconds** base, shortening to **15 seconds** minimum as numerical mass rises. Add a **manual trigger button** that can fire at **50% of the current passive interval**. Manual use resets the passive timer and starts the manual cooldown.
- **Visual:** like a **water droplet hitting a pool**—ripple expanding across the screen.
- **Stacking rule (Phases 3–5 only):** may **trigger alongside** Hawking; when both are active, they are **multiplicative**. **After Phase 6 begins**, Gravitational Wave **does not run** (see **Implementation decisions**).

**Offline:** bank missed waves with the **banked lump** EV rule; use **effective average interval** between **15s and 60s** for the closed-form when mass-based (`TUNE`).

**Pacing / power:** about **10 ascension runs** after lensing comes online to push toward **~1e200** total count (tuning knob).

---

### Phase 5 — Gravitational furnace (new)

**Shift:** The hole is **no longer meaningfully improved by Essence alone** for core progression; the player must **feed one of their hands** into the black hole to advance.

#### Sacrifice contract (developer-critical)

**When the player confirms feeding a hand, that hand is gone immediately from all gameplay** — it is **effectively no longer any part of the simulation** (not a dormant slot, not “digesting but still there”).

- It is **not available to unlock** and **not used for counting** (no ticks, no `handEarnings` contribution, no CPS from that index).
- It does **not** contribute to **any** bonuses that depend on “per-hand” or “number of active hands” — including (non-exhaustive) **combo multiplier math**, **clap bonus / pair rolls**, **per-hand speed & cheapen & slowdown rows**, **autobuy timers** for that index, and **any ascension grant** that assumes that hand exists (hide or remove the row in UI; code must not index it for CPS).
- It is **excluded from clapping** (no pair with it; no cooldown slot).
- It is **excluded from combos** (cannot participate in patterns; combo UI must not reference it).
- **Time Warp** cannot target it; no aura spawn on that slot.

The **real-time digest** is a **narrative / pacing clock** for how long until the hole “finishes processing” the sacrifice and grants payoff. The hand is **not** “in limbo” still playing—it is **removed on commit**. **Digest shortening:** spending Essence into the hole **linearly** reduces remaining digest time, subject to the **1% floor** rule (see tuning / implementation decisions doc)—this is a **raw mechanic**, not a named upgrade row.

**Furnace level (named upgrade):** a **single upgrade track** (“Furnace level” or `TUNE` display name) whose levels provide a **multiplier** that applies to **count per second**, **Ascension Essence gain**, and **Turbo Boost meter gain per second** (one coefficient or three linked coefficients—implementation may use one tier with three surfaced stats). Rises with **completed digests** and/or Essence purchases (`TUNE`); this is the main **sticky** power carrier for furnace progression besides digest completion itself.

**Design bar (fun):** this is a **huge** sacrifice—especially **fewer combos** and thus **less Turbo meter from combo play**. Furnace payoffs and **mandatory** parallel upgrades (below) must be tuned so the player still feels **net power growth**, not a punishment for engaging the fantasy.

#### Digestion loop (wall-clock)

- Feeding the **10th hand** starts digest: **24 hours** real time (tunable).
- **Ascension Number 1 is allowed during digest**; digest is **wall-clock** and **does not pause** when the run resets.
- **Essence** fed to the hole **reduces remaining digest time**.
- Tuning target: **~10 full runs** above **~1e200** total count should supply enough Essence (with digest-speed rules) to **complete** the 10th-hand digest.
- Queue is **fixed:** after the 10th, the next sacrifice is the **9th** hand, digest duration **half** of the 10th (e.g. 12h if 10th was 24h), then **8th** at half of the 9th’s duration (6h), **halving each step** down the chain.

**Payoff:** each completed digestion should **feel huge**—primarily by advancing **Furnace level** plus a **mandatory digest-complete VFX beat** (clear celebration pulse / ring), tuned against the **lost hands’** CPS, combo value, and turbo value.

#### Turbo Boost compensation (required design)

Fewer hands → **fewer / no combos** → in today’s Number 1, **Turbo meter** is largely fed by **combo-driven play**. That pipeline **collapses** as sacrifices mount, so the black-hole track must ship a **simple, legible** replacement the player can read at a glance:

- **Gravitational drive** (working title): an upgrade that adds a **fixed Turbo meter gain per second** (flat **+X meter / s**), tuned to **roughly replace** the meter income the build *would have had* from combos at comparable progression (QA bar: “turbo still spins up in sensible wall-clock time without fishing for patterns”).
- **Easiest implementation spec:** one passive **meter/sec** value that **scales with furnace tier** (e.g. per completed digest, or per `10 - activeHands`) so it **ramps automatically** as combos and clapping die off—no micro-management.
- **Rules of engagement:** passive fill runs **while the game is unpaused**; it **respects meter cap** (clamp); it **stacks additively** with any other passive meter/sec ascension grants. **Turbo toggle:** while Turbo boost is **Off**, meter **still fills**; **multiplier stays 1×** until the player turns boost **On** (see **Implementation decisions** table).
- **Clarity:** tooltips should state explicitly that this exists **because sacrificed hands no longer feed the meter via combos**.

#### Single-hand endgame (within Phase 5 → into Phase 6)

As the player approaches **one hand**, **combos and clapping entirely disappear** (no multi-hand patterns; **no** clap pairs). **All upgrades** in late furnace, jet prep, and related UI must be written and tested under that assumption—no hidden dependency on combo discovery, clap streaks, or multi-hand time warp.

- **Combo multiplier:** treat as **1×** (or bypass combo logic entirely); UI copy should explain **why** (“only one digit line remains”).
- **Clapping:** hide the control cluster or show a **single disabled** state with one line of copy (“clapping returns when… never—epilogue uses one hand only”).
- **Time Warp:** single-hand targeting only; any “all hands” ascension perks must **re-spec** to the remaining index or **disable with refund logic** (spec per grant in `ascension-tree-data.js` audit).
- **Turbo:** sustained by **Gravitational drive** (+ jets later), **not** by pattern play.

**Dev QA checklist (non-exhaustive):** `getComboMultiplier`, clap pair resolution, combo pulse production, turbo meter from combos, per-hand aura arrays, autobuy loops, overview CPS—all must behave with **`unlockedHands === 1`** and **no NaN / no empty-set crashes**.

**End state of phase:** one hand remains; player can reach about **1e275** total count before leaning hard into jets.


---

### Phase 6 — Astrophysical jets (new)

**Fantasy:** the player can **trigger a jet** that **greatly increases count per second**, but the jet **consumes Ascension Essence** as fuel.

**Visual (v1 spec):** a **persistent or session-long background** treatment dominated by the **jet beam**: read as **energy gathering at the bottom** of the screen, then **a beam firing upward** through the playfield (bottom → top). Use a **charge → fire** cadence that can sync to **jet ON** / fuel burn if helpful, but the art direction is “cosmic accelerator,” not a tiny UI particle. **Layering:** render the beam **below** hands, upgrade rows, turbo cluster, and other **interactive** layers so nothing important is obscured. **Clarity rule:** Hawking and lensing **ripples are off** in this phase (see **Implementation decisions**) so the jet is the **one** big moving read on the screen.

**Key upgrade (essence battery):**

- Grant **1% per second** (of the player’s **highest-ever single-ascension Essence earnings**—or another clear “personal best” definition) as **passive jet charge** so the player can **charge the jet without ascending**, and only ascend when they hit a **materially higher** Essence cap.

#### Phase 6 jet upgrades (named levers — v1)

Essence spent in this phase improves the jet system (exact curves `TUNE`):

| Upgrade | Player read | Design role |
|---------|--------------|--------------|
| **Drain efficiency** | “Same boost, cheaper fuel” | Reduces **Essence/sec** consumed while the jet is **ON** for the same **count boost** (or improves Essence → thrust conversion). |
| **Boost multiplier** | “Hotter burn” | Increases the **rate** at which Essence is **burned** while the jet is **ON** (thrust per second per Essence—tuning links this to felt CPS if desired). |
| **Boost bank** | “Bigger tank per trigger” | Raises the **maximum Essence** that can be **spent in one jet activation** (per toggle ON session or per burst—pick one model and document); pairs with essence battery charge cap. |

**Power target:** use jets (plus prior layers) to reach **1e308** total count. Balance jet throughput (active + passive charge) so that **turning off** Hawking + lensing at Phase 6 entry is a **feel upgrade** (less noise, clearer fantasy), **not** a damage nerf — use permanent/sticky bonuses bought in Phases 3–5 and jet numbers to **meet or exceed** the output the player would have had from the old transient stack at comparable investment.

**Technical requirement — hard cap:**

- The simulation must enforce a **finite cap at or below ~1e308** (or a safe `Number.MAX_VALUE` margin) so that **no calculation path** can push `totalChanges` (or aggregated earnings) into **NaN** / overflow. Any “theoretical” mult beyond the cap should **clamp** or **soft-cap** with clear UI (“cosmic limit reached”).

---

### Phase 7 — Evaporation (end state)

**Trigger:** reaching the **highest representable total** (per the cap above).

**Experience:**

- **One hand** counting.
- **Backdrop:** black hole (minimal, solemn).
- **No upgrades** available.
- A **new counter** runs at **exactly 1 per second** and the **screen displays that counter’s total** (epilogue readout).
- **Authoritative rule:** at entry, perform the agreed **hard reset** of the main incremental state so there is no ambiguity about `totalChanges` vs epilogue tally (see **Implementation decisions** table).

This phase is intentionally **not about power**; it is about **mood and closure** after maxing the numeric arc.

**Player-facing closure copy (draft):** “You reached the end of Number 1. From here, counting continues for the joy of it — because the real lesson was the counting you did along the way.”

---

## Cross-cutting design notes

- **Feeds:** Essence, time (digestion), hands, jet fuel, and “personal best Essence” all belong in the economy—document each in the phase where it debuts.
- **Spectacle:** phases 3–6 should each ship a **distinct VFX language** (radiation waves, lensing ripples, furnace/digest UI, **vertical jet beam** behind UI). In **Phase 6**, **only** the jet (plus minimal always-on disk/hole backdrop if desired) should carry **large** motion; earlier transient VFX are **disabled** so the jet reads clearly (see **Implementation decisions**).
- **Offline:** timed buffs use the **banked lump** rule (see **Implementation decisions**); document the exact grant placement (on tab focus / save load) so QA can test it.
- **Save schema (future):** one persistent state machine (`blackHolePhase`, phase progress, timers, best-essence snapshot, jet charge, evaporation counter, **fedHandMask** or `unlockedHandsCap`, **`gravitationalDriveMeterPerSec`** / tier, banked buff value, etc.) instead of only `number1AscensionBlackHoleLevel`—migrate saves carefully from the baseline prototype.
- **Sacrifice → systems map:** any feature that iterates `0..unlockedHands-1` or assumes **10 hands** must use **`unlockedHands` (or explicit allowlist)** after furnace feeds—**no ghost indices**.
- **Readability & accessibility:** do not rely on color alone for BH states/bonuses (include labels/icons/tooltips), and keep core interactions readable under jet background VFX.

---

## VFX interpretation — from many to one

This section captures the intended artistic read for Number 1 black-hole progression and should guide implementation/polish decisions without overriding locked gameplay rules above.

### Core visual thesis (Number 1 lens)

- **Many → one:** each phase should remove visual complexity and increase focus, so the final emotional read is singular, calm, and inevitable.
- **Number 1 motif:** a recurring single vertical axis (“**1-line**”) serves as the visual spine—subtle in early phases, dominant in jets, resolved in Phase 7.
- **Motion evolution:** chaotic/multi-source motion early → controlled pulses mid-arc → one dominant direction (bottom→top beam) late.
- **Color evolution:** broad cosmic palette early, narrowing to one hero hue (or monochrome + one accent) as evaporation approaches.
- **UI/VFX relationship:** VFX increasingly becomes background truth while gameplay/readout remains crisp and readable on top.

### Phase-by-phase read (designer lens)

- **Phase 1 (Mass accumulation):** show “weight gaining” via subtle compression, heavier easing, and denser micro-vignette. End with a memorable single collapse beat.
- **Phase 2 (Black hole collapse):** maintain a low-frequency persistent warp so the world now feels centered on one singular point.
- **Phase 3 (Accretion disk):** introduce orbital motion and Hawking burst excitement while preserving legibility (energetic, never noisy).
- **Phase 4 (Gravitational lensing):** ripple language (“droplet in pool”) becomes spacetime punctuation; manual trigger should feel tactile and intentional.
- **Phase 5 (Gravitational furnace):** emphasize sacrifice; each feed gets a solemn pull-in and each digest completion gets a distinct “loss converted to power” celebration.
- **Phase 6 (Astrophysical jets):** this is the Number 1 hero moment—one vertical beam behind UI, charge then fire. Hawking/lensing remain disabled so the beam owns the motion read.
- **Phase 7 (Evaporation):** minimal and almost devotional: one hand, one counter, one tick per second. No spectacle arms race—only closure.

### Practical art-direction rules

- **One dominant effect per phase** so players can instantly read “what matters now.”
- **One recognizable silhouette at all times** (hole + axis/beam) for continuity.
- **One clear “I advanced” beat per milestone** (collapse, digest complete, jet ready, final silence).
- **One emotional arc:** wonder → control → sacrifice → transcendence → stillness.

---

## Deprecated reference — old single-phase tuning table

The following matched the **pre-phase** prototype in code; rebalance or delete when phases land:

| Constant | Was | Role |
|----------|-----|------|
| `BLACK_HOLE_MULT_PER_LEVEL` | `1.035` | Global mult per mass level |
| `BLACK_HOLE_COST_BASE` | `400` | Essence step base |
| `BLACK_HOLE_COST_GROWTH` | `1.38` | Essence cost growth |
| `BLACK_HOLE_MAX_LEVEL` | `400` | Mass cap |

---

## Mandatory VFX / spectacle requirements (v1)

These effects are expected to ship in v1 for clarity and feel (tuning and art polish can vary):

- **Phase 1 → 2 transition:** one-shot **collapse** read (screen pulse, bar shatter, brief color grade) so the phase change is unforgettable.
- **Ascension hand → black hole replacement:** short **absorption** VFX (hand drawn inward / dissolved into singularity) when BH progression takes over the ascension screen.
- **Phase 2 “hole exists”:** subtle **persistent** warping or vignette behind the playfield (low frequency, does not fight per-second UI).
- **Digest complete / furnace payoff:** short **celebration** distinct from Hawking (e.g. rim light, shock ring) so sacrifices feel rewarded without reusing lensing language.
- **Jet charge ready:** small **UI-adjacent** cue (gauge spark, beam pre-glow) so players know firing is available without reading numbers only.
- **Time Warp** (if still relevant late BH): a **single** obvious warp streak or clock distortion on trigger — avoid if it stacks badly with jet; otherwise keep **subtle** during Phase 6.
- **Objectives / milestone pings** (if used in Number 1): lightweight check-flash; keep **off** the jet’s vertical “lane” so the beam stays the hero.

These VFX requirements reinforce the locked Phase 6 layering and “no Hawking/lensing in Phase 6” rules.

---

## Phase transition story modal copy (draft; pause/resume flow)

Use these as first-pass text for pause modals at phase transitions. Player confirms to continue.

- **Tree complete → Phase 1:** “You have mapped every path. Your numbers are no longer weightless — feed Essence to the Mass Accumulator and feel gravity take hold.”
- **Phase 1 complete → Phase 2:** “Critical mass reached. The accumulator collapses inward. A black hole is born.”
- **Phase 2 complete → Phase 3:** “Matter begins to circle the singularity. The accretion disk ignites.”
- **Phase 3 complete → Phase 4:** “Spacetime bends around your count. Gravitational Waves begin to pulse.”
- **Phase 4 complete → Phase 5:** “Essence alone is no longer enough. To go further, the hole must be fed.”
- **First hand digested (Phase 5 milestone):** “Digestion complete. The furnace answers with new power.”
- **Phase 5 complete → Phase 6:** “Only one line remains. The jets awaken — charge, ignite, and burn.”
- **Phase 6 complete → Phase 7:** “The cosmic limit is reached. Upgrades fall silent. Now, count for counting’s sake.”

---

## Open ideation hooks (not committed)

Use these for future vertical slices: **jet steering minigame**, **disk color by build**, **hand-digestion narrative logs**, **co-op spectator VFX**, **export share card at evaporation**. None are required for v1.
