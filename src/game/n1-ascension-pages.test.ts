import { describe, expect, it } from "vitest";
import {
    ASCENSION_FINGER_RESPEC_LABELS,
    createN1AscensionBootUi,
    createN1AscensionMapDomDelegates,
    renderAccretionDiskHeroInnerHtml
} from "./n1-ascension-pages.js";

describe("n1-ascension-pages", () => {
    it("escapeAscensionHtml escapes HTML specials", () => {
        const { escapeAscensionHtml } = createN1AscensionBootUi({
            getHasAscended: () => true,
            getAscensionNodeIds: () => [],
            getAscensionNodeById: () => undefined,
            computeAscensionGrantTotals: () => ({}),
            getNearMissToleranceRanks: () => [],
            getUnlockedHands: () => 1,
            getPatternCatalogMultiplier: () => 1,
            getAscensionComboPatternMult: () => 1,
            getTimeWarpComboMultiplier: () => 1,
            getTurboCountMultiplierMax: () => 1,
            getTurboMeterMax: () => 1,
            getTimeWarpOverflowRatio: () => 0,
            getTimeWarpAuraSpawnSpanMaxSec: () => 1,
            getMaxCheapenLevel: () => 10,
            formatCount: n => String(n),
            BLACK_HOLE_PHASE1_ESSENCE_TARGET: 1,
            getAscensionEssenceInvestedInNodes: () => 0,
            getNumber1AscensionPendingBonusEssence: () => 0,
            getNumber1AscensionEssence: () => 0,
            getNumber1BlackHoleState: () => ({ phase1EssenceSpent: 0, phase2ParallelBonusPool: 0, phase2Mass: 0 }),
            getBlackHolePhase: () => 0,
            isBlackHoleArcUnlocked: () => false,
            getNumber1BlackHoleProductionMult: () => 1,
            formatBlackHolePhase1CpsMultForUi: m => String(m),
            getBlackHolePhase1RunCpsMult: () => 1,
            getAscensionMapNodeCount: () => 0
        });
        expect(escapeAscensionHtml("<x>\"&")).toBe("&lt;x&gt;&quot;&amp;");
    });

    it("ASCENSION_FINGER_RESPEC_LABELS covers five fingers", () => {
        expect(Object.keys(ASCENSION_FINGER_RESPEC_LABELS).sort().join(",")).toBe("index,middle,pinky,ring,thumb");
    });

    it("createN1AscensionMapDomDelegates forwards to asc map API", () => {
        const calls: string[] = [];
        const api = {
            computeAscensionHandLayout: () => {
                calls.push("layout");
                return {};
            },
            renderAscensionMapColumnGuidesSvg: (h: number) => {
                calls.push("col" + h);
                return "<g/>";
            },
            renderAscensionMapEdgesSvg: (layout: object) => {
                calls.push("edges" + (layout === api ? "bad" : "ok"));
                return "<g/>";
            },
            syncAscensionMapNodeDomPositions: () => {
                calls.push("sync");
            },
            ascensionResolveNodeIdAtClient: (x: number, y: number) => {
                calls.push("hit" + x + y);
                return null;
            },
            updateAscensionMapDetailPanel: () => {
                calls.push("detail");
            },
            setAscensionMapSelectedNode: (id: string, skip: boolean) => {
                calls.push("sel" + id + skip);
            },
            teardownAscensionMapPanZoom: () => {
                calls.push("teardown");
            },
            initAscensionMapPanZoom: () => {
                calls.push("init");
            },
            renderAscensionMapDebugOverlaySvg: () => {
                calls.push("debug");
                return "";
            }
        };
        const d = createN1AscensionMapDomDelegates(api);
        d.computeAscensionHandLayout();
        d.renderAscensionMapColumnGuidesSvg(3);
        d.renderAscensionMapEdgesSvg({ a: 1 });
        d.syncAscensionMapNodeDomPositions();
        d.ascensionResolveNodeIdAtClient(1, 2);
        d.updateAscensionMapDetailPanel();
        d.setAscensionMapSelectedNode("n1", true);
        d.teardownAscensionMapPanZoom();
        d.initAscensionMapPanZoom();
        d.renderAscensionMapDebugOverlaySvg();
        expect(calls.join("|")).toBe(
            "layout|col3|edgesok|sync|hit12|detail|seln1true|teardown|init|debug"
        );
    });

    it("renderAccretionDiskHeroInnerHtml includes spiral and structure spans", () => {
        const html = renderAccretionDiskHeroInnerHtml();
        expect(html).toContain("asc-black-hole__disk-spiral");
        expect(html).toContain("asc-black-hole__disk-core");
    });
});
