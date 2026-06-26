/**
 * Dev-tools freeze: skips simulation without touching overlay `gamePaused` (story, ascension dialogs, …).
 *
 * @param {{ gamePaused: boolean, devFreezeGame: boolean }} session
 */
export function createGameplaySimFrozen(session) {
    return function gameplaySimFrozen() {
        return session.gamePaused || session.devFreezeGame;
    };
}
