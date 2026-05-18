# Near-miss combo matching — build specification

This document locks rules for **ascension-driven near-miss** so `getActiveCombos`, discovery, and pulse math stay consistent. It aligns with the combo plan ([`combo_ascension_concepts_17423e37.plan.md`](c:\Users\acton\.cursor\plans\combo_ascension_concepts_17423e37.plan.md) §3).

**Code anchors today:** [`getHandValues`](c:\Numbers\NumbersareFun\index.html), [`COMBOS`](c:\Numbers\NumbersareFun\index.html) / `check`, [`getActiveCombos`](c:\Numbers\NumbersareFun\index.html), [`updateComboUI`](c:\Numbers\NumbersareFun\index.html) / `newlyEarned`, [`getComboParticipatingHandIndices`](c:\Numbers\NumbersareFun\index.html), [`getComboMultiplier`](c:\Numbers\NumbersareFun\index.html).

---

## 1. Goals

- **Player:** Some “almost there” digit setups (especially **two-hand pairs**) can count as active / discoverable when ascension has unlocked **tolerance ranks**.
- **Design:** Near-miss **relaxes predicates**, not DPS stacking rules — earned combos still multiply within tier; greedy rules affect **discovery ordering** only, not “one winner” for the Bonus multiplier (plan default).
- **Scope control:** Ship a **small MVP** first; extend k≥3 / special combos only after MVP is stable.

---

## 2. Non-goals (MVP)

- **No** relaxation for **Two Pair**, **Full House**, or **k ≥ 3** “Three ns … Ten ns” row checks (count-based `countValues(v)[n] >= k`).
- **No** player UI to pick tolerance digits in v1 — ranks come from **explicit ascension grants** on **3–5 middle-finger nodes** only (same policy as `comboEarnedPatternMultAdd`).
- **No** Cartesian product over alternative digit vectors per tick (performance).

---

## 3. Ascension grants

### 3.1 Grant key

- **`nearMissToleranceRank`**: integer in **1..10** (inclusive), present on **middle** (`finger === "middle"`) ascension nodes only.
- **Cardinality:** **3–5** such nodes across the full middle route (seed placement + costs TBD in [`ascension-tree-data.js`](c:\Numbers\NumbersareFun\ascension-tree-data.js)).

### 3.2 Aggregation

- Build **`nearMissToleranceRanks`** as the **sorted unique** list of all `nearMissToleranceRank` values from **purchased** middle ascension nodes (same loop style as [`computeAscensionGrantTotals`](c:\Numbers\NumbersareFun\index.html)).
- **Max size:** **5** distinct ranks (if duplicates from multiple nodes, unique set still ≤ 10; cap list length at **5** by **ascension purchase order** — first five distinct ranks win, later duplicates ignored **or** merge policy: **prefer unique ranks in tree path order**; document in implementation comments).

### 3.3 Runtime accessor

- **`getNearMissToleranceRanks(): number[]`** — cached per tick is optional; cheap to recompute from `number1AscensionNodeIds` + `ASCENSION_MAP_NODE_BY_ID` like other ascension totals.

---

## 4. Relaxed matching (MVP)

### 4.1 Hand vector

- Use **`v = getHandValues()`** (first `minHands` entries are the participating prefix for combo checks today).

### 4.2 Pair of `n` only (`minHands === 2`)

**Strict check (today):** `v[0] === n && v[1] === n`.

**Relaxed check** when **`n` ∈ `nearMissToleranceRanks`**:

- Let `a = v[0]`, `b = v[1]` (order preserved; two hands).
- **Strict success** as today.
- Else **near success** iff `a` and `b` are integers in **1..10** and the multiset `{a,b}` equals one of:

  | Pattern | Meaning |
  |--------|---------|
  | `{n, n}` | Strict pair |
  | `{n, n+1}` | One high — only if `n+1 ≤ 10` |
  | `{n-1, n}` | One low — only if `n-1 ≥ 1` |

- **Reject** e.g. `{7,8}` for **Pair of 6s** even if `7` is tolerant — tolerance is **per combo rank `n`**, not “any adjacent pair”. (Plan: modifier is tied to the **pattern rank** being chased.)

**Boundary ranks (digits stay in 1..10):**

- **`n === 10`:** There is no valid `{n, n+1}`. The **only** relaxed neighbor multiset besides strict `{10,10}` is **`{9,10}`** via `{n-1, n}`. **Confirmed OK** as the sole “almost pair” case for tens.
- **`n === 1`:** There is no valid `{n-1, n}`. The **only** relaxed neighbor multiset besides strict `{1,1}` is **`{1,2}`** via `{n, n+1}`.

**Interpretation note:** For **Pair of 7s**, `{7,8}` and `{6,7}` qualify when `7` is in the tolerance set; `{8,9}` does **not** qualify as Pair of 7s.

### 4.3 All other `COMBOS` rows (MVP)

- Use **strict** `c.check(v)` only.

---

## 5. `getActiveCombos` contract

Replace raw `c.check(v)` with:

```text
comboMatchesActive(c, v) := strictCheck(c, v) OR relaxedPairCheck(c, v, ranks)
```

- **`relaxedPairCheck`** applies **only** when `c` is a generated **“Pair of ns”** row (`minHands === 2` and name matches `/^Pair of (\d+)s$/`) **and** parsed `n` is in `nearMissToleranceRanks`.

**Return value:** Still an array of **combo objects** from `COMBOS` (reference equality preserved) so downstream code (`getComboParticipatingHandIndices`, logs, UI) keeps working.

---

## 6. Greedy discovery ordering (plan §3)

When **`newlyEarned`** contains **multiple** combos in the same tick:

1. Sort candidates by **`minHands` descending** (larger patterns first).
2. Then by **intrinsic `bonus` descending**.
3. Then by **`name` ascending** (stable tie-break).

**Append order:** Push into `earnedComboNames` in that sorted order so logs / “Discovered combo” order matches greedy priority.

**Multiplier:** **No change** — every combo that is **earned** and **actively** matched (strict or relaxed) still contributes in [`getComboMultiplier`](c:\Numbers\NumbersareFun\index.html); greedy **does not** remove smaller patterns from the multiplier.

---

## 7. `getComboParticipatingHandIndices`

For **relaxed Pair of n** where strict fails but relaxed holds (e.g. `{7,8}` for pair of 7s):

- Participating hands are indices `0` and `1` (both hands that define the pair), same as strict pair behavior today for pulse split.

---

## 8. Performance

- **COMBOS** size ~10²; each check O(1) for pairs.
- **`nearMissToleranceRanks`**: length ≤ 5.
- **Per tick:** one `getHandValues()`, one tolerance list, filter `COMBOS` — same asymptotic as today.

---

## 9. Save / reset

- **No new save fields** if tolerance ranks are **always derived** from current ascension purchases.
- **Number 1 ascension reset** clears purchases → tolerances clear automatically.

---

## 10. Implementation checklist (for coding pass)

1. Add `getNearMissToleranceRanks()` (middle-only ascension nodes with `nearMissToleranceRank`).
2. Add `comboMatchesActive(c, v)` (or inline in `getActiveCombos`).
3. Sort `newlyEarned` in [`updateComboUI`](c:\Numbers\NumbersareFun\index.html) per §6.
4. Add **3–5** middle seeds with `nearMissToleranceRank` + [`effectFromGrants`](c:\Numbers\NumbersareFun\ascension-tree-data.js) copy.
5. Unit-style manual test matrix: pairs (6,6), (6,7), (7,7), (7,8) with ranks `{6}`, `{7}`, `{}`; plus **boundary** Pair of 1s `(1,2)` and Pair of 10s `(9,10)` when `1` / `10` ∈ tolerance set.

---

## 11. Extensions (post-MVP)

- k = 3 same-digit rows: tolerance applies only to **one** designated slot / rank (per original design discussion).
- **Two Pair / Full House:** separate relaxation tables.
- **Player-picked ranks** (UI + save).

---

## 12. Open decisions (resolve before or during first PR)

| # | Question | Proposed default |
|---|----------|------------------|
| 1 | Duplicate `nearMissToleranceRank` on two nodes | Both count toward “purchased”; unique set still one rank |
| 2 | More than 5 purchased distinct ranks | Cap to first **5** by **ascension node id sort order** |
| 3 | Relaxed pair participates in which **combo name**? | Only the **named** “Pair of ns” for that `n` |

**Resolved**

| Topic | Decision |
|-------|----------|
| Pair of 10s relaxed neighbors | Only **`{9,10}`** besides strict `{10,10}`; no `{10,11}`. |
| Pair of 1s relaxed neighbors | Only **`{1,2}`** besides strict `{1,1}`; no `{0,1}`. |

---

*Version: 1.1 — spec only; implementation follows this file.*
