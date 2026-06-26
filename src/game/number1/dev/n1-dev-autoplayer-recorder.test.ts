import { describe, expect, it } from "vitest";
import { createAutoplayerRecorder } from "./n1-dev-autoplayer-recorder.js";

describe("createAutoplayerRecorder", () => {
    it("begins a session and records timestamped events", () => {
        const rec = createAutoplayerRecorder();
        const id = rec.beginSession({
            personaId: "efficient",
            startSnapshot: { blackHolePhase: 2 }
        });
        expect(id).toBeTruthy();
        expect(rec.hasSession()).toBe(true);

        const t0 = rec.getSessionStartedAtMs();
        rec.recordEvent({ type: "buy_speed", hand: 1, levelAfter: 2 }, { nowMs: t0 });
        rec.recordEvent({ type: "buy_speed", hand: 1, levelAfter: 3 }, { nowMs: t0 + 5000 });

        const snap = rec.getSnapshot();
        expect(snap.simulatedClicks).toBe(2);
        expect(snap.eventCount).toBe(2);

        const events = rec.getEvents();
        expect(events[0].sessionMs).toBe(0);
        expect(events[1].sessionMs).toBe(5000);
    });

    it("counts ascensions and captures peak on ascend events", () => {
        const rec = createAutoplayerRecorder();
        rec.beginSession({ personaId: "patient" });
        rec.recordEvent({
            type: "ascend",
            peakTotalAtAscend: 1e100,
            ascensionGain: 42,
            metrics: { blackHolePhase: 2 }
        });
        expect(rec.getSnapshot().ascensionCount).toBe(1);
        expect(rec.getSnapshot().simulatedClicks).toBe(1);
    });

    it("does not increment clicks for phase_enter", () => {
        const rec = createAutoplayerRecorder();
        rec.beginSession({ personaId: "efficient" });
        rec.recordEvent({ type: "phase_enter", blackHolePhase: 3 });
        expect(rec.getSnapshot().simulatedClicks).toBe(0);
    });

    it("clears session and export returns null when empty", () => {
        const rec = createAutoplayerRecorder();
        rec.beginSession({ personaId: "efficient" });
        rec.clearSession();
        expect(rec.hasSession()).toBe(false);
        expect(rec.exportSession()).toBe(null);
    });

    it("exports meta, events, and optional summary", () => {
        const rec = createAutoplayerRecorder();
        rec.beginSession({ personaId: "efficient", startSnapshot: { totalChanges: 1e35 } });
        rec.recordEvent({ type: "ascend", peakTotalAtAscend: 1e35, ascensionGain: 10 });
        rec.markStopped(Date.parse("2026-06-22T14:01:00.000Z"));
        const payload = rec.exportSession({ global: { totalAscensions: 1 } });
        expect(payload?.meta.personaId).toBe("efficient");
        expect(payload?.events.length).toBe(1);
        expect(payload?.summary?.global?.totalAscensions).toBe(1);
    });
});
