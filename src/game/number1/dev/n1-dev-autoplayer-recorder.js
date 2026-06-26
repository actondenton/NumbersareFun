/** In-memory session recorder for dev auto-player telemetry (never persisted). */

let sessionCounter = 0;

function newSessionId() {
    sessionCounter += 1;
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return "autoplayer-" + Date.now() + "-" + sessionCounter;
}

export function createAutoplayerRecorder() {
    /** @type {null | { sessionId: string, personaId: string, startedAt: string, startSnapshot: object, events: object[], simulatedClicks: number, ascensionCount: number, stoppedAt: string | null }} */
    let session = null;

    function beginSession(opts) {
        const options = opts || {};
        session = {
            sessionId: newSessionId(),
            personaId: String(options.personaId || "efficient"),
            startedAt: new Date().toISOString(),
            startSnapshot: options.startSnapshot && typeof options.startSnapshot === "object" ? { ...options.startSnapshot } : {},
            events: [],
            simulatedClicks: 0,
            ascensionCount: 0,
            stoppedAt: null
        };
        return session.sessionId;
    }

    function clearSession() {
        session = null;
    }

    function hasSession() {
        return session != null;
    }

    function getSessionStartedAtMs() {
        if (!session) return 0;
        const t = Date.parse(session.startedAt);
        return Number.isFinite(t) ? t : 0;
    }

    function recordEvent(event, opts) {
        if (!session || !event) return null;
        const options = opts || {};
        const nowMs = Number.isFinite(options.nowMs) ? options.nowMs : Date.now();
        const startedMs = getSessionStartedAtMs();
        const entry = {
            at: new Date(nowMs).toISOString(),
            sessionMs: Math.max(0, nowMs - startedMs),
            ...event
        };
        session.events.push(entry);
        if (event.type !== "phase_enter" && event.type !== "dismiss_story") {
            session.simulatedClicks += 1;
        }
        if (event.type === "ascend") {
            session.ascensionCount += 1;
        }
        return entry;
    }

    function markStopped(nowMs) {
        if (!session) return;
        session.stoppedAt = new Date(Number.isFinite(nowMs) ? nowMs : Date.now()).toISOString();
    }

    function getSnapshot() {
        if (!session) {
            return {
                sessionId: null,
                personaId: null,
                simulatedClicks: 0,
                ascensionCount: 0,
                eventCount: 0
            };
        }
        return {
            sessionId: session.sessionId,
            personaId: session.personaId,
            simulatedClicks: session.simulatedClicks,
            ascensionCount: session.ascensionCount,
            eventCount: session.events.length,
            startedAt: session.startedAt,
            stoppedAt: session.stoppedAt
        };
    }

    function getEvents() {
        return session ? session.events.slice() : [];
    }

    function exportSession(summary) {
        if (!session) return null;
        return {
            meta: {
                sessionId: session.sessionId,
                personaId: session.personaId,
                startedAt: session.startedAt,
                stoppedAt: session.stoppedAt,
                simulatedClicks: session.simulatedClicks,
                ascensionCount: session.ascensionCount
            },
            startSnapshot: { ...session.startSnapshot },
            events: session.events.slice(),
            summary: summary && typeof summary === "object" ? summary : undefined
        };
    }

    return {
        beginSession,
        clearSession,
        hasSession,
        getSessionStartedAtMs,
        recordEvent,
        markStopped,
        getSnapshot,
        getEvents,
        exportSession
    };
}
