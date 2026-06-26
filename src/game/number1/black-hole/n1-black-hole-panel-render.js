import {
    BLACK_HOLE_FURNACE_COMPLETION_RITUAL_MS,
    BLACK_HOLE_FURNACE_ESSENCE_REFINERY_BONUS,
    BLACK_HOLE_FURNACE_HOTTER_CORE_BONUS,
    BLACK_HOLE_FURNACE_MULT_PER_POWER,
    BLACK_HOLE_PHASE1_ESSENCE_TARGET,
    BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER,
    BLACK_HOLE_PHASE2_MASS_CAP
} from "./number1-black-hole.js";
import { getPhase2CollapseEffectHtml } from "./n1-black-hole-upgrade-preview.js";
import { hands1 } from "../hands/n1-hand-ascii.js";
import { formatBlackHoleMultForUi } from "../shell-ui/n1-format.js";
import { renderAccretionDiskHeroInnerHtml } from "../shell-ui/n1-accretion-disk-render.js";

function escapeAscensionHtml(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Ascension-page black hole panel HTML for phases 0–7 (Phase 15b). */
export function createNumber1BlackHolePanelRender(dep) {
    function renderNumber1BlackHolePanelHtml() {
        const esc = escapeAscensionHtml;
        const state = dep.getBlackHoleState();
        const uxFlags = dep.getBlackHoleUxFlags();
        if (!dep.getNumber1HasAscended() || !dep.isBlackHoleArcUnlocked()) return "";
        if (dep.getBlackHolePhase() === 0) dep.ensureBlackHoleArcStarted();
        const phase = dep.getBlackHolePhase();
        const mult = dep.getNumber1BlackHoleProductionMult();
        const multStr = formatBlackHoleMultForUi(mult);
        let body = "";
        let note = "";
        let actions = "";
        let panelTitle = "Black hole";
        let panelAria = "Black hole — post-map progression";
        let panelExtraClass = "";
        if (phase === 0 || phase === 1) {
            panelTitle = "Numerical Mass Accumulator";
            panelAria = "Numerical Mass Accumulator — Phase 1 mass charge";
            panelExtraClass = " asc-black-hole--phase1";
            const spent = Math.floor(state.phase1EssenceSpent || 0);
            const rem = Math.max(0, BLACK_HOLE_PHASE1_ESSENCE_TARGET - spent);
            const have = Math.max(0, Math.floor(Number(dep.getNumber1AscensionEssence()) || 0));
            const pour = Math.min(rem, have);
            const can = rem > 0 && have > 0;
            const fillPct = Math.round(dep.getBlackHolePhase1FillRatio() * 100);
            const slowdownCap = dep.getMaxSlowdownLevelCap();
            const cpsM = dep.formatBlackHolePhase1CpsMultForUi(dep.getBlackHolePhase1RunCpsMult());
            const ascM = dep.getBlackHolePhase1AscensionEssenceMult().toFixed(2);
            body =
                "<div class=\"asc-black-hole__mass-geometry\" aria-hidden=\"true\">" +
                "<div class=\"asc-black-hole__tesseract\"></div>" +
                "<div class=\"asc-black-hole__numeral-dust\"><span>1</span><span>1</span><span>1</span><span>1</span><span>1</span><span>1</span><span>1</span><span>1</span></div>" +
                "</div>" +
                "<p class=\"asc-black-hole__kicker\">Phase 1 · toward critical mass</p>" +
                "<p class=\"asc-black-hole__body\">You've mapped every branch — now your totals gain <strong>weight</strong>. This sink is the only use for Ascension Essence here: one button pours <strong>everything</strong> you hold into mass. Heavier numbers count faster, ascend richer, and pull harder on your Compaction ceiling.</p>" +
                "<div class=\"asc-black-hole__mass-meter-wrap\" role=\"group\" aria-label=\"Numerical mass charge\">" +
                "<div class=\"asc-black-hole__mass-meter-label\"><span>Mass charge</span><span class=\"asc-black-hole__mass-meter-nums\"><strong>" + spent + "</strong> / " + BLACK_HOLE_PHASE1_ESSENCE_TARGET + " Essence · " + fillPct + "%</span></div>" +
                "<div class=\"asc-black-hole__mass-meter-track\" role=\"progressbar\" aria-valuenow=\"" + spent + "\" aria-valuemin=\"0\" aria-valuemax=\"" + BLACK_HOLE_PHASE1_ESSENCE_TARGET + "\" aria-label=\"Essence poured into numerical mass\"><div class=\"asc-black-hole__mass-meter-fill\" style=\"width:" + fillPct + "%\"></div></div>" +
                "</div>" +
                "<ul class=\"asc-black-hole__effect-list\" aria-label=\"Mass effects on this run\">" +
                "<li><span class=\"asc-black-hole__effect-name\">Inertial counting</span><span class=\"asc-black-hole__effect-val\" data-asc-p1-effect=\"inertial\">run CPS ×" + esc(cpsM) + "</span><span class=\"asc-black-hole__effect-hint\">ticks feel heavier as the bar fills</span></li>" +
                "<li><span class=\"asc-black-hole__effect-name\">Essence coupling</span><span class=\"asc-black-hole__effect-val\" data-asc-p1-effect=\"essence\">Ascend payout ×" + esc(ascM) + "</span><span class=\"asc-black-hole__effect-hint\">next Number 1 ascend earns more Essence</span></li>" +
                "<li><span class=\"asc-black-hole__effect-name\">Drag ceiling</span><span class=\"asc-black-hole__effect-val\" data-asc-p1-effect=\"drag\">Compaction cap " + slowdownCap + "</span><span class=\"asc-black-hole__effect-hint\">room to lean on Compaction upgrades</span></li>" +
                "</ul>";
            note = "<p class=\"asc-black-hole__stats asc-black-hole__purse\">You hold <strong>" + esc(dep.formatCount(have)) + "</strong> Ascension Essence · next pour: <strong>" + esc(dep.formatCount(pour)) + "</strong> into mass</p>";
            if (!can && rem > 0) {
                note += "<p class=\"asc-black-hole__note\">Ascend on Number 1 to earn Essence, then come back — one tap dumps your whole purse into the accumulator.</p>";
            }
            actions = "<p class=\"asc-black-hole__buy\"><button type=\"button\" class=\"page-btn page-btn--mass-pour\" data-asc-black-hole-buy=\"1\"" + (can ? "" : " disabled") + ">Pour in all Essence (" + esc(dep.formatCount(pour)) + ")</button></p>";
        } else if (phase === 2) {
            panelExtraClass = " asc-black-hole--phase2";
            if (Date.now() - (uxFlags.lastPhase2MassFeedAtMs || 0) < 1600) {
                panelExtraClass += " asc-black-hole--feed-pulse";
            }
            const L = Math.floor(state.phase2Mass || 0);
            const nextCost = dep.getBlackHolePhase2NextCostEssence();
            const bank = Math.floor(state.phase2EssenceBank || 0);
            const have = Math.max(0, Math.floor(Number(dep.getNumber1AscensionEssence()) || 0));
            const parallel = Math.max(0, Number(state.phase2ParallelBonusPool) || 0);
            const parallelPct = Math.min(100, Math.round((parallel / 1.5) * 100));
            const tm = dep.getBlackHolePhase2CollapseMassTier();
            const tp = dep.getBlackHolePhase2CollapsePhotonTier();
            const te = dep.getBlackHolePhase2CollapseErgosphereTier();
            const massPourUnlock = dep.isBlackHolePhase2MassPourUnlocked();
            const cMass = dep.getBlackHolePhase2CollapseUpgradeCost("mass");
            const cPhoton = dep.getBlackHolePhase2CollapseUpgradeCost("photon");
            const cErgo = dep.getBlackHolePhase2CollapseUpgradeCost("ergosphere");
            const canMassUp = tm < BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER && have >= cMass && cMass > 0;
            const canPhotonUp = tp < BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER && have >= cPhoton && cPhoton > 0;
            const canErgoUp = te < BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER && have >= cErgo && cErgo > 0;
            const canPourMass = massPourUnlock && have >= 1 && L < BLACK_HOLE_PHASE2_MASS_CAP;
            const p2EffectDeps = {
                escapeHtml: esc,
                formatCount,
                getBlackHolePhase: () => dep.getBlackHolePhase()
            };
            const massEffectHtml = getPhase2CollapseEffectHtml("mass", state, p2EffectDeps);
            const photonEffectHtml = getPhase2CollapseEffectHtml("photon", state, p2EffectDeps);
            const ergoEffectHtml = getPhase2CollapseEffectHtml("ergosphere", state, p2EffectDeps);
            const bankLine = nextCost > 0 && bank > 0
                ? (" · Banked toward next step: <strong>" + esc(dep.formatCount(bank)) + "</strong> / " + esc(dep.formatCount(nextCost)))
                : (nextCost > 0 ? (" · Next step: <strong>" + esc(dep.formatCount(nextCost)) + "</strong> Essence") : "");
            const p2Row = function (track, title, tier, effectHtml, cost, canBuy) {
                const maxed = tier >= BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER;
                const tierLabel = maxed ? "max" : (tier + "/" + BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER);
                const btnLabel = maxed ? "Maxed" : ("Buy (" + esc(dep.formatCount(cost)) + ")");
                return (
                    "<div class=\"asc-black-hole__p2-row\" data-asc-black-hole-p2-row=\"" + esc(track) + "\">" +
                    "<div class=\"asc-black-hole__p2-row-head\"><span class=\"asc-black-hole__p2-name\">" + esc(title) + "</span>" +
                    "<span class=\"asc-black-hole__p2-tier\">Tier <strong>" + esc(tierLabel) + "</strong></span></div>" +
                    "<p class=\"asc-black-hole__p2-effect\">" + effectHtml + "</p>" +
                    "<p class=\"asc-black-hole__buy\"><button type=\"button\" class=\"page-btn page-btn--p2-collapse\" data-asc-black-hole-p2=\"" + esc(track) + "\"" +
                    (canBuy ? "" : " disabled") + ">" + btnLabel + "</button></p>" +
                    "</div>"
                );
            };
            body =
                "<div class=\"asc-black-hole__collapse-geometry\" aria-hidden=\"true\">" +
                "<span class=\"asc-black-hole__collapse-core\"></span>" +
                "<span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--a\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--b\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--c\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--d\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--e\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--f\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--g\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--h\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--i\"></span><span class=\"asc-black-hole__collapse-shard asc-black-hole__collapse-shard--j\"></span>" +
                "</div>" +
                "<p class=\"asc-black-hole__kicker\">Phase 2 · collapse upgrades</p>" +
                "<p class=\"asc-black-hole__body\">Before the singularity accepts raw mass, stabilize three channels with Ascension Essence. Each track has <strong>" + BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER + "</strong> tiers. Every Phase 2 spend also charges a distinct <strong>parallel Essence bonus</strong> for future ascends.</p>" +
                "<div class=\"asc-black-hole__parallel-meter-wrap\" role=\"group\" aria-label=\"Parallel Essence bonus for future ascends\">" +
                "<div class=\"asc-black-hole__mass-meter-label\"><span>Parallel pool</span><span class=\"asc-black-hole__mass-meter-nums\"><strong>+" + esc((parallel * 100).toFixed(1)) + "%</strong> / +150.0% Essence</span></div>" +
                "<div class=\"asc-black-hole__mass-meter-track asc-black-hole__parallel-meter-track\" role=\"progressbar\" aria-valuenow=\"" + esc((parallel * 100).toFixed(1)) + "\" aria-valuemin=\"0\" aria-valuemax=\"150\" aria-label=\"Parallel Essence bonus\"><div class=\"asc-black-hole__mass-meter-fill asc-black-hole__parallel-meter-fill\" style=\"width:" + parallelPct + "%\"></div></div>" +
                "</div>" +
                "<div class=\"asc-black-hole__p2-list\" role=\"group\" aria-label=\"Collapse upgrades\">" +
                p2Row("mass", "Essence–mass coupling", tm, massEffectHtml, cMass, canMassUp) +
                p2Row("photon", "Photon shell", tp, photonEffectHtml, cPhoton, canPhotonUp) +
                p2Row("ergosphere", "Ergosphere coupling", te, ergoEffectHtml, cErgo, canErgoUp) +
                "</div>";
            note =
                "<p class=\"asc-black-hole__stats\" data-asc-bh-phase-stats>Phase: <strong>2</strong> · Mass pour: <strong>" + (massPourUnlock ? "unlocked" : "locked") + "</strong> · Mass: <strong>" + L + "</strong> · Total gain: <strong>×" + esc(multStr) + "</strong>" + bankLine + "</p>" +
                "<p class=\"asc-black-hole__stats asc-black-hole__purse\">You hold <strong>" + esc(dep.formatCount(have)) + "</strong> Ascension Essence.</p>" +
                (massPourUnlock
                    ? ""
                    : "<p class=\"asc-black-hole__note\">Bring every collapse track to tier " + BLACK_HOLE_PHASE2_COLLAPSE_MAX_TIER + " to unlock mass investment.</p>");
            actions = "<p class=\"asc-black-hole__buy\"><button type=\"button\" class=\"page-btn\" data-asc-black-hole-buy=\"1\"" + (canPourMass ? "" : " disabled") + ">Pour all Essence into mass (" + esc(dep.formatCount(have)) + ")</button></p>";
        } else if (phase === 3) {
            panelExtraClass = " asc-black-hole--phase3";
            const have = Math.max(0, Math.floor(Number(dep.getNumber1AscensionEssence()) || 0));
            const lum = dep.getBlackHolePhase3TrackLevel("luminosity");
            const vis = dep.getBlackHolePhase3TrackLevel("viscous");
            const cor = dep.getBlackHolePhase3TrackLevel("coronal");
            const p3TierPips = function (track, tier) {
                const dots = [];
                for (let i = 1; i <= 6; i++) {
                    dots.push("<span class=\"asc-black-hole__disk-pip" + (i <= tier ? " asc-black-hole__disk-pip--lit" : "") + "\" aria-hidden=\"true\">" + i + "</span>");
                }
                return "<div class=\"asc-black-hole__disk-pips asc-black-hole__disk-pips--" + esc(track) + "\" aria-label=\"" + esc(tier + " of 6 tiers lit") + "\">" + dots.join("") + "</div>";
            };
            const p3Row = function (track, title, tier, effectHtml) {
                const cost = dep.getBlackHolePhase3TrackCost(track);
                const maxed = tier >= 6;
                const canBuy = !maxed && have >= cost && cost > 0;
                return (
                    "<div class=\"asc-black-hole__p2-row asc-black-hole__disk-row asc-black-hole__disk-row--" + esc(track) + "\">" +
                    "<div class=\"asc-black-hole__disk-track-icon\" aria-hidden=\"true\"><span></span></div>" +
                    "<div class=\"asc-black-hole__p2-row-head\"><span class=\"asc-black-hole__p2-name\">" + esc(title) + "</span>" +
                    "<span class=\"asc-black-hole__p2-tier\">Tier <strong>" + (maxed ? "max" : (tier + "/6")) + "</strong></span></div>" +
                    "<p class=\"asc-black-hole__p2-effect\">" + effectHtml + "</p>" +
                    p3TierPips(track, tier) +
                    "<p class=\"asc-black-hole__buy\"><button type=\"button\" class=\"page-btn page-btn--p2-collapse\" data-asc-black-hole-p3=\"" + esc(track) + "\"" +
                    (canBuy ? "" : " disabled") + ">" + (maxed ? "Maxed" : ("Buy (" + esc(dep.formatCount(cost)) + ")")) + "</button></p>" +
                    "</div>"
                );
            };
            body =
                "<div class=\"asc-black-hole__disk-hero\" aria-hidden=\"true\">" +
                renderAccretionDiskHeroInnerHtml() +
                "</div>" +
                "<p class=\"asc-black-hole__body\">Phase 3 — Accretion Disk: tune the burst in three visible ways: brighter radiation, faster flares, and longer coronal burn windows.</p>" +
                "<div class=\"asc-black-hole__p2-list\" role=\"group\" aria-label=\"Accretion disk upgrades\">" +
                p3Row("luminosity", "Disk luminosity", lum, "Brighter Hawking bursts: raises the temporary CPS multiplier during radiation windows.") +
                p3Row("viscous", "Viscous accretion", vis, "More frequent flares: shortens the Hawking cooldown so bursts arrive sooner.") +
                p3Row("coronal", "Coronal loop", cor, "Longer burn: extends each Hawking burst duration so windows are easier to use.") +
                "</div>";
            note = "<p class=\"asc-black-hole__stats\" data-asc-bh-disk-phase-stats>Phase: <strong>3</strong> · Luminosity: <strong>" + lum + "</strong> · Viscous: <strong>" + vis + "</strong> · Coronal: <strong>" + cor + "</strong></p>" +
                "<p class=\"asc-black-hole__stats asc-black-hole__purse\" data-asc-bh-disk-purse>You hold <strong>" + esc(dep.formatCount(have)) + "</strong> Ascension Essence.</p>";
            actions = "";
        } else if (phase === 4) {
            panelExtraClass = " asc-black-hole--phase4";
            const W = Math.floor(state.phase4WaveLevel || 0);
            const cost = dep.getBlackHolePhase4NextCostEssence();
            const bank = Math.floor(state.phase4EssenceBank || 0);
            const have = Math.max(0, Math.floor(Number(dep.getNumber1AscensionEssence()) || 0));
            const can = have >= 1 && W < 6;
            const bankLine = cost > 0 && bank > 0
                ? (" · Banked: <strong>" + esc(dep.formatCount(bank)) + "</strong> / " + esc(dep.formatCount(cost)))
                : (cost > 0 ? (" · Next tier: <strong>" + esc(dep.formatCount(cost)) + "</strong> Essence") : "");
            const manualReady = Date.now() >= (state.phase4ManualReadyAtMs || 0);
            const manualInSec = manualReady ? 0 : Math.max(0, Math.ceil(((state.phase4ManualReadyAtMs || 0) - Date.now()) / 1000));
            body = "<p class=\"asc-black-hole__body\">Phase 4 — Gravitational Lensing: spacetime ripples pulse on cadence, and you can force a manual wave. Partial Essence banks toward the next wave upgrade.</p>";
            note = "<p class=\"asc-black-hole__stats\">Phase: <strong>4</strong> · Wave lvl: <strong>" + W + "</strong> · Interval: <strong>" + dep.getBlackHoleWaveIntervalSec().toFixed(1) + "s</strong> · Manual: <strong>" + (manualReady ? "ready" : ("in " + dep.formatSeconds(manualInSec))) + "</strong>" + bankLine + "</p>" +
                "<p class=\"asc-black-hole__stats asc-black-hole__purse\">You hold <strong>" + esc(dep.formatCount(have)) + "</strong> Ascension Essence.</p>";
            actions =
                "<p class=\"asc-black-hole__buy\"><button type=\"button\" class=\"page-btn\" data-asc-black-hole-buy=\"1\"" + (can ? "" : " disabled") + ">Pour all Essence into wave (" + esc(dep.formatCount(have)) + ")</button></p>" +
                "<p class=\"asc-black-hole__buy\"><button type=\"button\" class=\"page-btn\" data-asc-black-hole-wave=\"1\"" + (manualReady ? "" : " disabled") + ">Manual Gravitational Wave</button></p>";
        } else if (phase === 5) {
            panelExtraClass = " asc-black-hole--phase5";
            const digestEnd = state.phase5DigestEndsAtMs || 0;
            const now = Date.now();
            const lastCompleteAt = Number(state.phase5LastDigestCompletedAtMs) || 0;
            if (lastCompleteAt > 0 && now - lastCompleteAt < BLACK_HOLE_FURNACE_COMPLETION_RITUAL_MS) {
                panelExtraClass += " asc-black-hole--furnace-ritual";
            }
            const activeHand = Math.max(0, Math.floor(state.phase5DigestHandNumber || 0));
            const canSpeedDigest = digestEnd > now && activeHand > 0;
            const speedDigestCost = Math.max(25, Math.floor(50 + 20 * (state.phase5FurnaceLevel || 0)));
            const have = Math.max(0, Math.floor(Number(dep.getNumber1AscensionEssence()) || 0));
            const pendingMutationLevel = Math.max(0, Math.floor(Number(state.phase5PendingMutationLevel) || 0));
            const pendingMutationHand = Math.max(0, Math.floor(Number(state.phase5PendingMutationHand) || 0));
            const hasPendingMutation = pendingMutationLevel > 0;
            const stokePreview = canSpeedDigest && have > 0 ? dep.getBlackHolePhase5StokePreview(have, now) : null;
            const stokeSpend = stokePreview && stokePreview.spentEssence != null ? Math.max(0, Math.floor(Number(stokePreview.spentEssence))) : 0;
            const canStoke = canSpeedDigest && !hasPendingMutation && stokeSpend >= 1;
            const completed = Math.max(0, Math.floor(state.phase5FurnaceLevel || 0));
            const nextHand = Math.max(1, Math.floor(state.phase5NextSacrificeHand || 1));
            const rewardBeatActive = hasPendingMutation && lastCompleteAt > 0 && now - lastCompleteAt < BLACK_HOLE_FURNACE_COMPLETION_RITUAL_MS;
            const nextHandLocked = !canSpeedDigest && nextHand > 1 && dep.getUnlockedHands() < nextHand;
            const progress = canSpeedDigest ? dep.getBlackHolePhase5DigestProgressAt(now) : 0;
            const curved = dep.getBlackHolePhase5DigestCurve(progress);
            const progressPct = Math.floor(progress * 1000) / 10;
            const curvedPct = Math.floor(curved * 1000) / 10;
            const digestRemainingSec = canSpeedDigest ? Math.max(0, Math.ceil((digestEnd - now) / 1000)) : 0;
            const bufferSecCeil = Math.max(5, Math.ceil(dep.getPhase5StokeMinRemainingMs() / 1000));
            const stokePreviewPct = stokePreview ? Math.floor(stokePreview.progress * 1000) / 10 : progressPct;
            const stokePreviewCurvedPct = stokePreview ? Math.floor(stokePreview.curved * 1000) / 10 : curvedPct;
            const stokeRemovedSec = stokePreview ? Math.max(0, Math.floor(stokePreview.removedMs / 1000)) : 0;
            const stokeRemainingSec = stokePreview ? Math.max(0, Math.ceil(stokePreview.projectedRemainingMs / 1000)) : digestRemainingSec;
            const currentPower = dep.getBlackHolePhase5EffectiveFurnacePower();
            const nextFullPower = completed + (canSpeedDigest ? 1 : 0);
            const hotter = dep.getBlackHolePhase5MutationLevel("hotter-core");
            const refinery = dep.getBlackHolePhase5MutationLevel("essence-refinery");
            const orbit = dep.getBlackHolePhase5MutationLevel("shorter-orbit");
            const furnaceMult = dep.getBlackHoleFurnaceMult();
            const nextFurnaceMult = Math.pow(BLACK_HOLE_FURNACE_MULT_PER_POWER * dep.getBlackHolePhase5HotterCoreMult(), nextFullPower);
            const furnaceEssenceBonus = dep.getBlackHoleFurnaceEssenceBonus();
            const digestedStart = 11 - completed;
            const echoHands = completed > 0
                ? Array.from({ length: completed }, (_, i) => Math.max(1, 10 - i)).map(h => {
                    const pendingClass = hasPendingMutation && h === pendingMutationHand ? " asc-black-hole__echo-hand--pending" : "";
                    const rewardClass = rewardBeatActive && h === pendingMutationHand ? " asc-black-hole__echo-hand--new" : "";
                    return "<span class=\"asc-black-hole__echo-hand" + pendingClass + rewardClass + "\">H" + h + "</span>";
                }).join("")
                : "<span class=\"asc-black-hole__echo-empty\">No Echo Hands yet</span>";
            const echoTrack = "<div class=\"asc-black-hole__echo-track\" aria-label=\"Echo Hands collected\"><div class=\"asc-black-hole__echo-head\"><span>Echo Hands</span><strong>" + completed + " / 9</strong></div><div class=\"asc-black-hole__echo-list\">" + echoHands + "</div></div>";
            const mutationSummary = "<div class=\"asc-black-hole__mutation-summary\" aria-label=\"Furnace mutation summary\">" +
                "<span>Echo CPS <strong>×" + (furnaceMult >= 10 ? furnaceMult.toFixed(2) : furnaceMult.toFixed(3)) + "</strong> · each Echo Hand compounds from ×" + BLACK_HOLE_FURNACE_MULT_PER_POWER.toFixed(2) + " base</span>" +
                "<span>Hotter Core <strong>" + hotter + "</strong> · raises Echo CPS base +" + Math.round(BLACK_HOLE_FURNACE_HOTTER_CORE_BONUS * 100) + "% / stack</span>" +
                "<span>Essence Refinery <strong>" + refinery + "</strong> · current furnace Essence bonus +" + (furnaceEssenceBonus * 100).toFixed(1) + "%</span>" +
                "<span>Shorter Orbit <strong>" + orbit + "</strong> · next digests ×" + dep.getBlackHolePhase5ShorterOrbitMult().toFixed(2) + " time</span>" +
                "</div>";
            const ritual = hasPendingMutation
                ? ("<div class=\"asc-black-hole__furnace-ritual\" role=\"status\">" +
                    "<div class=\"asc-black-hole__furnace-ritual-kicker\">Furnace completion ritual</div>" +
                    "<h5>Hand " + pendingMutationHand + " became an Echo Hand</h5>" +
                    "<p>The furnace flares. Choose one mutation before feeding the next hand.</p>" +
                    "</div>")
                : "";
            const mutationChoices = hasPendingMutation
                ? ("<div class=\"asc-black-hole__mutation-choices" + (rewardBeatActive ? " asc-black-hole__mutation-choices--reward" : "") + "\" role=\"group\" aria-label=\"Choose Furnace Mutation\">" +
                    "<button type=\"button\" class=\"asc-black-hole__mutation-choice\" data-asc-black-hole-mutation=\"hotter-core\"><strong>Hotter Core</strong><span>Echo Hands burn brighter. The compounding CPS base gains +" + Math.round(BLACK_HOLE_FURNACE_HOTTER_CORE_BONUS * 100) + "% per stack.</span></button>" +
                    "<button type=\"button\" class=\"asc-black-hole__mutation-choice\" data-asc-black-hole-mutation=\"essence-refinery\"><strong>Essence Refinery</strong><span>Digested hands refine ascension fuel. Furnace Essence bonus gains +" + Math.round(BLACK_HOLE_FURNACE_ESSENCE_REFINERY_BONUS * 100) + "% per stack.</span></button>" +
                    "<button type=\"button\" class=\"asc-black-hole__mutation-choice\" data-asc-black-hole-mutation=\"shorter-orbit\"><strong>Shorter Orbit</strong><span>The next digestion timers compress. Current timer multiplier: ×" + dep.getBlackHolePhase5ShorterOrbitMult().toFixed(2) + ".</span></button>" +
                    "</div>")
                : "";
            const digestLabel = canSpeedDigest
                ? ("Hand " + activeHand + " digesting · " + progressPct.toFixed(1) + "% time · " + curvedPct.toFixed(1) + "% power")
                : (hasPendingMutation ? ("Mutation pending for Hand " + pendingMutationHand) : "Ready for next sacrifice");
            const digestMeter = canSpeedDigest
                ? ("<div class=\"asc-black-hole__mass-meter-wrap\" role=\"group\" aria-label=\"Active hand digestion\">" +
                    "<div class=\"asc-black-hole__mass-meter-label\"><span>Digesting hand " + activeHand + "</span><span class=\"asc-black-hole__mass-meter-nums\"><strong>" + progressPct.toFixed(1) + "%</strong> time · <strong>" + curvedPct.toFixed(1) + "%</strong> power · " + esc(dep.formatSeconds(digestRemainingSec)) + " left</span></div>" +
                    "<div class=\"asc-black-hole__mass-meter-track asc-black-hole__furnace-meter-track\" role=\"progressbar\" aria-valuenow=\"" + esc(progressPct.toFixed(1)) + "\" aria-valuemin=\"0\" aria-valuemax=\"100\" aria-label=\"Digestion progress\"><div class=\"asc-black-hole__furnace-meter-preview\" style=\"width:" + Math.max(0, Math.min(100, stokePreviewPct)).toFixed(1) + "%\"></div><div class=\"asc-black-hole__mass-meter-fill asc-black-hole__furnace-meter-fill\" style=\"width:" + Math.max(0, Math.min(100, progress * 100)).toFixed(1) + "%\"></div></div>" +
                    (stokePreview
                        ? "<p class=\"asc-black-hole__stoke-preview-hint\">Hover or focus <strong>Stoke active digest</strong> to preview the jump.</p><p id=\"asc-black-hole-stoke-preview\" class=\"asc-black-hole__stoke-preview\" aria-live=\"polite\">Projected after stoke: <strong>" + stokePreviewPct.toFixed(1) + "%</strong> time · <strong>" + stokePreviewCurvedPct.toFixed(1) + "%</strong> power · removes <strong>" + esc(dep.formatSeconds(stokeRemovedSec)) + "</strong> · leaves <strong>" + esc(dep.formatSeconds(stokeRemainingSec)) + "</strong></p>"
                        : "<p id=\"asc-black-hole-stoke-preview\" class=\"asc-black-hole__stoke-preview asc-black-hole__stoke-preview--empty\">Earn Ascension Essence to preview the next stoke jump.</p>") +
                    "</div>")
                : "";
            const digestVisual = canSpeedDigest
                ? ("<div class=\"asc-black-hole__furnace-visual\" role=\"img\" aria-label=\"Hand " + activeHand + " is " + progressPct.toFixed(1) + "% digested\">" +
                    "<div class=\"asc-black-hole__furnace-hand-card\">" +
                    "<div class=\"asc-black-hole__furnace-hand-shell\" style=\"--digest-fill:" + Math.max(0, Math.min(100, progress * 100)).toFixed(1) + "%\">" +
                    "<div class=\"asc-black-hole__furnace-hand-fill\"></div>" +
                    "<pre class=\"asc-black-hole__furnace-hand-ascii\">" + esc(hands1[activeHand - 1] || hands1[9] || "") + "</pre>" +
                    "</div>" +
                    "<div class=\"asc-black-hole__furnace-hand-label\">Hand " + activeHand + "</div>" +
                    "</div>" +
                    "<div class=\"asc-black-hole__furnace-caption\">The silhouette fills as digestion converts the lost hand into furnace power.</div>" +
                    "</div>")
                : "";
            body = "<p class=\"asc-black-hole__body\">Phase 5 — Gravitational Furnace: feed one hand, wait for it to digest, then feed the next. The current hand starts weak and ramps non-linearly toward full furnace power as the 24-hour digest completes. Ascend actively to earn Essence, then stoke the furnace to compress the remaining timer.</p>" +
                ritual +
                echoTrack +
                mutationSummary +
                digestVisual +
                digestMeter +
                mutationChoices;
            note = "<p class=\"asc-black-hole__stats\">Phase: <strong>5</strong> · Completed hands: <strong>" + completed + "</strong> · Active: <strong>" + esc(digestLabel) + "</strong></p>" +
                "<p class=\"asc-black-hole__stats\">Furnace power: <strong>" + currentPower.toFixed(2) + "</strong> Echo Hands · Current furnace CPS: <strong>×" + furnaceMult.toFixed(2) + "</strong> · On completion: <strong>×" + nextFurnaceMult.toFixed(2) + "</strong></p>" +
                "<p class=\"asc-black-hole__stats asc-black-hole__purse\">You hold <strong>" + esc(dep.formatCount(have)) + "</strong> Ascension Essence · full stoke unit: <strong>" + esc(dep.formatCount(speedDigestCost)) + "</strong>. Stoking trims time until ~<strong>" + bufferSecCeil + "</strong>s remain and only spends Essence that actually accelerates digestion.</p>" +
                (completed > 0 ? "<p class=\"asc-black-hole__stats\">Echo sequence: <strong>Hand 10" + (completed > 1 ? " → Hand " + digestedStart : "") + "</strong> absorbed into the singularity.</p>" : "") +
                (hasPendingMutation ? "<p class=\"asc-black-hole__note\">Pick a mutation to claim the Echo Hand reward.</p>" : (nextHandLocked ? "<p class=\"asc-black-hole__note\">Next sacrifice requires <strong>Hand " + nextHand + "</strong>. Unlock that hand again on this run before feeding it.</p>" : ""));
            const stokeBtnLabel =
                !canSpeedDigest
                    ? "Stoke active digest"
                    : hasPendingMutation
                      ? "Stoke (mutation pending)"
                      : stokeSpend >= 1
                        ? ("Stoke active digest (" + esc(dep.formatCount(stokeSpend)) + " Essence)")
                        : ("Digest buffer (~≤" + bufferSecCeil + "s left) · won't spend Essence yet");
            actions =
                "<p class=\"asc-black-hole__buy\"><button type=\"button\" class=\"page-btn\" data-asc-black-hole-buy=\"1\"" +
                    (canSpeedDigest ? " data-asc-black-hole-stoke-preview-toggle=\"1\" aria-describedby=\"asc-black-hole-stoke-preview\" title=\"Charges only Essence needed to shorten this digestion (stops ~" + bufferSecCeil + "s remaining).\"" : "") +
                    (canStoke ? "" : " disabled") +
                    ">" +
                    esc(stokeBtnLabel) +
                    "</button></p>" +
                "<p class=\"asc-black-hole__buy\"><button type=\"button\" class=\"page-btn\" data-asc-black-hole-sacrifice=\"1\"" + (canSpeedDigest || hasPendingMutation ? " disabled" : "") + ">" + (hasPendingMutation ? "Choose mutation first" : (canSpeedDigest ? ("Digesting hand " + activeHand + "...") : (nextHandLocked ? ("Unlock Hand " + nextHand + " to feed") : "Feed next hand"))) + "</button></p>";
        } else if (phase === 6) {
            panelExtraClass = " asc-black-hole--phase6" + (state.phase6JetActive ? " asc-black-hole--jet-active" : "");
            const charge = Math.floor(state.phase6JetCharge || 0);
            const best = Math.max(0, Number(state.phase6JetBestAscensionEssence) || 0);
            const chargeCap = Math.max(500, best * (0.5 + 0.2 * dep.getBlackHolePhase6TrackLevel("bank")));
            const have = Math.max(0, Math.floor(Number(dep.getNumber1AscensionEssence()) || 0));
            const drain = dep.getBlackHolePhase6TrackLevel("drain");
            const boost = dep.getBlackHolePhase6TrackLevel("boost");
            const bankLvl = dep.getBlackHolePhase6TrackLevel("bank");
            const p6Row = function (track, title, tier, effectHtml) {
                const cost = dep.getBlackHolePhase6TrackCost(track);
                const canBuy = have >= cost;
                return (
                    "<div class=\"asc-black-hole__p2-row\">" +
                    "<div class=\"asc-black-hole__p2-row-head\"><span class=\"asc-black-hole__p2-name\">" + esc(title) + "</span>" +
                    "<span class=\"asc-black-hole__p2-tier\">Tier <strong>" + tier + "</strong></span></div>" +
                    "<p class=\"asc-black-hole__p2-effect\">" + effectHtml + "</p>" +
                    "<p class=\"asc-black-hole__buy\"><button type=\"button\" class=\"page-btn page-btn--p2-collapse\" data-asc-black-hole-p6=\"" + esc(track) + "\"" +
                    (canBuy ? "" : " disabled") + ">Buy (" + esc(dep.formatCount(cost)) + ")</button></p>" +
                    "</div>"
                );
            };
            body = "<p class=\"asc-black-hole__body\">Phase 6 — Astrophysical Jets: the battery creates Essence-equivalent jet fuel from your best ascension. If the tank runs dry while the jet is ON, stored Ascension Essence can burn directly as emergency fuel.</p>" +
                "<div class=\"asc-black-hole__p2-list\" role=\"group\" aria-label=\"Jet upgrades\">" +
                p6Row("drain", "Drain efficiency", drain, "Same thrust, cheaper burn: reduces fuel consumed per second while the jet is ON.") +
                p6Row("boost", "Boost multiplier", boost, "Hotter burn: increases the active jet production multiplier.") +
                p6Row("bank", "Boost bank", bankLvl, "Bigger tank: raises the Essence-equivalent fuel cap generated from your best ascend.") +
                "</div>";
            note = "<p class=\"asc-black-hole__stats\">Phase: <strong>6</strong> · Jet fuel: <strong>" + esc(dep.formatCount(charge)) + " / " + esc(dep.formatCount(Math.floor(chargeCap))) + "</strong> · Jet: <strong>" + (state.phase6JetActive ? "ON" : "OFF") + "</strong></p>" +
                "<p class=\"asc-black-hole__stats asc-black-hole__purse\">You hold <strong>" + esc(dep.formatCount(have)) + "</strong> Ascension Essence.</p>";
            actions =
                "<p class=\"asc-black-hole__buy\"><button type=\"button\" class=\"page-btn\" data-asc-black-hole-jet=\"" + (state.phase6JetActive ? "off" : "on") + "\">Turn jet " + (state.phase6JetActive ? "off" : "on") + "</button></p>";
        } else {
            panelExtraClass = " asc-black-hole--phase7";
            body = "<p class=\"asc-black-hole__body\">Phase 7 — Evaporation: one hand, one counter, one beat. Upgrades are silent. Counting continues for closure.</p>";
            note = "<p class=\"asc-black-hole__stats\">Phase: <strong>7</strong> · Epilogue counter: <strong>" + esc(dep.formatCount(Math.floor(state.phase7EpilogueCounter || 0))) + "</strong></p>";
        }
        const totalMultLine =
            "<p class=\"asc-black-hole__stats asc-black-hole__total-mult\">" + esc(dep.getTotalProductionMultLabelForPanel()) + ": <strong>×" + esc(multStr) + "</strong></p>";
        return (
            "<section class=\"asc-black-hole" + panelExtraClass + "\" aria-label=\"" + esc(panelAria) + "\">" +
            "<h4 class=\"asc-black-hole__title\">" + esc(panelTitle) + "</h4>" +
            body +
            totalMultLine +
            note +
            actions +
            "</section>"
        );

    }
    return { renderNumber1BlackHolePanelHtml };
}
