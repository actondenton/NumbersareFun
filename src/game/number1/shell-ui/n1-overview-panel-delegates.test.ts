import { describe, expect, it } from "vitest";

import { createOverviewPanelDelegates } from "./n1-overview-panel-delegates.js";

describe("createOverviewPanelDelegates", () => {
    it("delegates panel refresh calls through ref", () => {
        const delegates = createOverviewPanelDelegates();
        let called = false;
        delegates.ref.refreshGlobalOverviewPanelIfOpen = () => {
            called = true;
        };
        delegates.refreshGlobalOverviewPanelIfOpen();
        expect(called).toBe(true);
    });
});
