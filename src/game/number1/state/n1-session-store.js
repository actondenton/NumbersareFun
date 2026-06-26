const DEFAULT_SETTINGS = {
    theme: "light",
    adaptiveTipsEnabled: true,
    curtainEnabled: true,
    humorEnabled: true,
    showClapAnimation: true,
    offlineCapHours: 8
};

/**
 * Session UI settings, pause flags, and autosave suppression.
 */
export function createN1SessionStore() {
    return {
        settings: { ...DEFAULT_SETTINGS },
        suppressAutosave: false,
        gamePaused: false,
        devFreezeGame: false,
        unlockedNumbers: new Set([1, 2])
    };
}

export { DEFAULT_SETTINGS as N1_DEFAULT_SETTINGS };
