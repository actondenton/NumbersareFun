import { ASCENSION_1_REQUIRED_TOTAL } from "./n1-ascension.js";
import { renderAscensionPageShellHtml } from "./n1-ascension-page-shell.js";
import { hands1 } from "../hands/n1-hand-ascii.js";

const ASCENSION_FINGER_KEYS = ["pinky", "ring", "middle", "index", "thumb"];
const ASCENSION_FINGER_RESPEC_LABELS = {
    index: "Index (velocity)",
    middle: "Middle (combo)",
    ring: "Ring (turbo)",
    pinky: "Pinky (warp)",
    thumb: "Thumb (clap)"
};

function escapeAscensionHtml(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function ascensionFingerHasPurchasedNodes(dep, finger) {
    const nodeById = dep.getAscensionMapNodeById();
    return dep.getNumber1AscensionNodeIds().some(id => {
        const def = nodeById[id];
        return def && def.finger === finger;
    });
}

/** Ascend control digest, map hub, and page shell HTML (Phase 15c). */
export function createAscensionPageRender(dep) {
    /** Fingerprint ascend-control copy + affordances for ~1 Hz incremental patch (avoid outerHTML churn). */
    function getNumber1AscendControlLivePatchDigest() {
        const essence = Math.floor(Number(dep.getNumber1AscensionEssence()) || 0);
        if (!dep.getNumber1HasAscended()) {
            return "pre|" + dep.getUnlockedHands() + "|" + dep.getTotalChanges() + "|" + essence;
        }
        const ph = dep.getBlackHolePhase();
        if (ph === 7) {
            return "p7|" + dep.getTotalChanges() + "|" + dep.getUnlockedHands() + "|" + essence;
        }
        const req = dep.getNumber1AscensionRequiredHands();
        if (!dep.isNumber1AscensionReady()) {
            return "nr|" + dep.getTotalChanges() + "|" + dep.getUnlockedHands() + "|" + req + "|" + ASCENSION_1_REQUIRED_TOTAL + "|" + essence;
        }
        const g = dep.computeNumber1AscensionGainBreakdown(dep.getNumber1AscensionEssenceFormulaTotal());
        return (
            "r|" + g.finalGain + "|" + g.baseGain + "|" + g.pendingBonus + "|" + g.blackHolePhaseMult + "|" + g.beforeMult + "|" + g.clapMult + "|" +
            g.blackHoleMultiplierBonus + "|" + g.multiplierBonus
        );
    }

    function renderNumber1AscendControlHtml(livePatchDigest) {
        const ready = dep.isNumber1AscensionReady();
        const esc = escapeAscensionHtml;
        const digestAttr =
            typeof livePatchDigest === "string" && livePatchDigest.length > 0
                ? " data-live-patch-digest=\"" + esc(livePatchDigest) + "\""
                : "";
        const requiredHands = dep.getNumber1AscensionRequiredHands();
        const gainInfo = ready ? dep.computeNumber1AscensionGainBreakdown(dep.getNumber1AscensionEssenceFormulaTotal()) : null;
        const gainText = gainInfo ? dep.formatCount(gainInfo.finalGain) : "0";
        const gainFormulaText = gainInfo
            ? " Formula: base " + dep.formatCount(gainInfo.baseGain) +
                (gainInfo.pendingBonus > 0 ? " + warp bonus " + dep.formatCount(gainInfo.pendingBonus) : "") +
                (gainInfo.blackHoleMultiplierBonus > 0 ? " + " + dep.getArcEssenceMultiplierBonusPhraseLower() + " " + dep.formatCount(gainInfo.blackHoleMultiplierBonus) + " (" + gainInfo.blackHolePhaseMult.toFixed(3) + "x)" : "") +
                (gainInfo.multiplierBonus > 0 ? " + clap mult " + dep.formatCount(gainInfo.multiplierBonus) + " (" + gainInfo.clapMult.toFixed(3) + "x)" : "") +
                " = " + gainText + "."
            : "";
        const requirementText = ready
            ? "Ready now: ascend Number 1 for " + gainText + " Ascension Essence." + gainFormulaText
            : "Not ready: reach " + dep.formatCount(ASCENSION_1_REQUIRED_TOTAL) + " total and " + requiredHands + " hand" + (requiredHands === 1 ? "" : "s") + ". Current: " + dep.formatCount(dep.getTotalChanges()) + " total, " + dep.getUnlockedHands() + "/" + requiredHands + " hands.";
        return (
            "<section" + digestAttr + " class=\"ascension-run-action" + (ready ? " ascension-run-action--ready" : "") + "\" aria-label=\"Number 1 ascend action\">" +
            "<div class=\"ascension-run-action__copy\">" +
            "<strong class=\"ascension-run-action__title\">Number 1 Ascension</strong>" +
            "<span class=\"ascension-run-action__status\">" + esc(requirementText) + "</span>" +
            "</div>" +
            "<button type=\"button\" class=\"page-btn ascend-number-btn ascension-run-action__btn\" data-number=\"1\"" + (ready ? "" : " disabled aria-disabled=\"true\"") + ">Ascend now</button>" +
            "</section>"
        );
    }

    function renderAscensionUpgradesHtml() {
        if (!dep.getNumber1HasAscended()) {
            return "<section class=\"ascension-placeholder\"><strong>Ascension map locked.</strong><br>Complete your first Number 1 ascension to unlock the permanent skill map.</section>";
        }
        const esc = escapeAscensionHtml;
        const s = dep.ascensionPurchasedSet();
        const collapseActive = dep.isAscensionMapCollapseTransitionActive();
        const hideAscensionSkillMap = dep.isBlackHoleArcUnlocked() && dep.getBlackHolePhase() >= 1 && !collapseActive;
        let respecRow = "";
        if (!hideAscensionSkillMap && !collapseActive) {
            const respecBtn = "<button type=\"button\" class=\"page-btn ascension-respec-btn\" data-asc-respec=\"1\"" + (dep.getNumber1AscensionNodeIds().length === 0 ? " disabled" : "") + ">Respec all</button>";
            const fingerRespecs = ASCENSION_FINGER_KEYS.map(fk => {
                const has = ascensionFingerHasPurchasedNodes(dep, fk);
                return "<button type=\"button\" class=\"page-btn asc-tree-respec-btn\" data-asc-respec-finger=\"" + esc(fk) + "\"" + (has ? "" : " disabled") + " title=\"" + esc(ASCENSION_FINGER_RESPEC_LABELS[fk] || fk) + "\">" + esc(fk.charAt(0).toUpperCase() + fk.slice(1)) + "</button>";
            }).join("");
            respecRow = "<div class=\"ascension-respec-row\"><div class=\"ascension-branch-respecs\">" + fingerRespecs + "</div>" + respecBtn + "</div>";
        }
        let mapAndLegend = "";
        if (!hideAscensionSkillMap || collapseActive) {
            const layout = dep.computeAscensionHandLayout();
            const ascMapVbH = dep.getAscensionMapViewBoxHeight();
            const treeExport = dep.getAscensionTreeExport();
            const handArt = (treeExport && treeExport.HUB_HAND_ART)
                ? String(treeExport.HUB_HAND_ART)
                : (hands1[4] ? String(hands1[4]) : "");
            const nodeDots = dep.getAscensionMapNodes().map(node => {
                const pt = layout[node.id] || { x: 50, y: 50 };
                const lx = pt.x.toFixed(3);
                const ly = pt.y.toFixed(3);
                const owned = s.has(node.id);
                const prereqOk = dep.ascensionNodePrereqsMet(node.id);
                let stateClass = "asc-map-node--locked";
                if (owned) stateClass = "asc-map-node--owned";
                else if (prereqOk) stateClass = "asc-map-node--available";
                return (
                    "<div class=\"asc-map-node asc-map-node--route-" + esc(node.route) + " " + stateClass + "\" data-asc-vbx=\"" + lx + "\" data-asc-vby=\"" + ly + "\" data-asc-node-id=\"" + esc(node.id) + "\" role=\"button\" aria-label=\"" + esc(node.title) + " — hover for details, click to select and attempt purchase\" tabindex=\"-1\">" +
                    "<div class=\"asc-map-node-pin\" aria-hidden=\"true\"></div></div>"
                );
            }).join("");
            const legend =
                "<ul class=\"asc-map-legend\" aria-label=\"Path colors (left to right on map)\">" +
                "<li><span class=\"asc-map-legend-swatch asc-map-legend-swatch--warp\"></span> Pinky · warp</li>" +
                "<li><span class=\"asc-map-legend-swatch asc-map-legend-swatch--turbo\"></span> Ring · turbo</li>" +
                "<li><span class=\"asc-map-legend-swatch asc-map-legend-swatch--combo\"></span> Middle · combo</li>" +
                "<li><span class=\"asc-map-legend-swatch asc-map-legend-swatch--velocity\"></span> Index · velocity</li>" +
                "<li><span class=\"asc-map-legend-swatch asc-map-legend-swatch--clap\"></span> Thumb · clap</li>" +
                "</ul>";
            mapAndLegend =
                "<div class=\"ascension-map-viewport" + (collapseActive ? " ascension-map-viewport--collapse" : "") + "\" id=\"ascension-map-viewport\">" +
                "<div class=\"ascension-map-detail-panel\" id=\"ascension-map-detail-panel\" aria-live=\"polite\">" +
                "<div class=\"ascension-map-detail-panel-inner\">" +
                "<div class=\"ascension-map-detail-kicker\" id=\"ascension-map-detail-kicker\"></div>" +
                "<div class=\"ascension-map-detail-title\" id=\"ascension-map-detail-title\"></div>" +
                "<div class=\"ascension-map-detail-effect\" id=\"ascension-map-detail-effect\"></div>" +
                "<div class=\"ascension-map-detail-meta\" id=\"ascension-map-detail-meta\"></div>" +
                "</div></div>" +
                "<div class=\"ascension-map-pan-zoom\" id=\"ascension-map-pan-zoom\">" +
                "<div class=\"ascension-map-world" + (collapseActive ? " ascension-map-world--collapse" : "") + "\">" +
                "<pre class=\"ascension-hand-backdrop\" aria-hidden=\"true\">" + esc(handArt) + "</pre>" +
                "<svg class=\"ascension-map-svg\" viewBox=\"0 0 100 " + ascMapVbH + "\" preserveAspectRatio=\"xMidYMid meet\" aria-hidden=\"true\">" +
                dep.renderAscensionMapColumnGuidesSvg(ascMapVbH) +
                dep.renderAscensionMapEdgesSvg(layout) +
                "</svg>" +
                dep.renderAscensionMapDebugOverlaySvg() +
                "<div class=\"ascension-map-nodes-layer\">" + nodeDots + "</div>" +
                "</div></div></div>" + legend;
        }
        const hubClass =
            "ascension-hub" +
            (hideAscensionSkillMap ? " ascension-hub--mass-arc-active" : "") +
            (!hideAscensionSkillMap && collapseActive ? " ascension-hub--collapse-active" : "") +
            (dep.isBlackHoleArcUnlocked() ? " ascension-hub--bh-arc-first" : "");
        const hubAria = hideAscensionSkillMap
            ? (dep.getBlackHolePhase() <= 1
                ? "Number 1 ascension — skill map complete; numerical mass accumulator"
                : "Number 1 ascension — skill map complete; black hole progression")
            : "Number 1 ascension skill map";
        const hubTitle = hideAscensionSkillMap
            ? "<h4 class=\"ascension-hub-title\"><span class=\"ascension-hub-glyph\" aria-hidden=\"true\">◇</span> Ascension — map complete</h4>"
            : "<h4 class=\"ascension-hub-title\"><span class=\"ascension-hub-glyph\" aria-hidden=\"true\">◇</span> Ascension map</h4>";
        const hubSub = hideAscensionSkillMap
            ? (dep.getBlackHolePhase() <= 1
                ? "<p class=\"ascension-hub-sub\">Every skill gem is owned. Spend Essence in the <strong>Numerical Mass Accumulator</strong> below — the gem map is done.</p>"
                : "<p class=\"ascension-hub-sub\">Every skill gem is owned. Continue below with <strong>black hole</strong> progression — the gem map is done.</p>")
            : (collapseActive
                ? "<p class=\"ascension-hub-sub\">Every branch is complete. Watch the constellation collapse into the singularity.</p>"
                : "<p class=\"ascension-hub-sub\">Five columns — pinky through thumb — lower branch tier at the bottom of each column, rising toward the top. Combo pulse production is split across <strong>hands that satisfy that pattern</strong>. <strong>Respec is free</strong>. <strong>Hover or click a gem</strong> for details; <strong>click</strong> also attempts purchase.</p>");
        const belowMapBlock =
            "<div class=\"ascension-hub-below-map\">" +
            "<p class=\"ascension-hub-sub ascension-hub-sub--grants-intro\">Owned-gem benefits are summarized in grouped lists below the map (complete for every aggregate grant). Gem tooltips remain the source of truth for exact wording.</p>" +
            "<div class=\"ascension-hub-stats\" id=\"ascension-hub-stats\">" + dep.renderAscensionHubStatsPillsHtml() + "</div>" +
            "<div class=\"ascension-hub-grants\" id=\"ascension-hub-grants\" role=\"region\" aria-label=\"Purchased ascension benefits\">" + dep.renderAscensionHubGrantsHtml() + "</div>" +
            "</div>";
        const bhPanel = dep.renderNumber1BlackHolePanelHtml();
        const hubBodyMain = dep.isBlackHoleArcUnlocked()
            ? (bhPanel + mapAndLegend + belowMapBlock)
            : (mapAndLegend + belowMapBlock + bhPanel);
        return (
            "<section class=\"" + hubClass + "\" aria-label=\"" + esc(hubAria) + "\">" +
            "<header class=\"ascension-hub-header\">" +
            hubTitle +
            hubSub +
            respecRow +
            "</header>" +
            hubBodyMain +
            "</section>"
        );
    }

    function renderAscensionPageHtml() {
        dep.normalizeAscensionPageActiveNumber();
        return renderAscensionPageShellHtml({
            activeTabNumber: dep.getAscensionPageActiveNumber(),
            number2TabsUnlocked: dep.isNumber2Unlocked(),
            renderNumber1AscensionBody: () => renderNumber1AscendControlHtml() + renderAscensionUpgradesHtml(),
            renderNumber2AscensionBody: () => dep.renderNumber2AscensionShell(),
            renderAscensionFallbackBody: () => renderAscensionUpgradesHtml()
        });
    }

    return {
        getNumber1AscendControlLivePatchDigest,
        renderNumber1AscendControlHtml,
        renderAscensionUpgradesHtml,
        renderAscensionPageHtml
    };
}
