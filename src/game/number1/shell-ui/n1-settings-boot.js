import { N1_DEFAULT_SETTINGS } from "../state/n1-session-store.js";

export const N1_SETTINGS_KEY = "naf.settings.v1";

/**
 * Settings load/persist, theme, and settings panel DOM sync (Phase 21c).
 *
 * @param {{
 *   session: { settings: typeof N1_DEFAULT_SETTINGS },
 *   storage?: Storage | null,
 *   settingsThemeDarkEl: HTMLInputElement | null,
 *   settingsAdaptiveTipsEl: HTMLInputElement | null,
 *   settingsCurtainEnabledEl: HTMLInputElement | null,
 *   settingsHumorEnabledEl: HTMLInputElement | null,
 *   settingsShowClapAnimationEl: HTMLInputElement | null,
 *   settingsOfflineCapHoursEl: HTMLInputElement | null,
 *   scheduleFitTopCountRow: () => void
 * }} dep
 */
export function createNumber1SettingsBoot(dep) {
    const storage = dep.storage ?? (typeof localStorage !== "undefined" ? localStorage : null);

    function getPreferredThemeFromSystem() {
        try {
            return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        } catch (_) {
            return N1_DEFAULT_SETTINGS.theme;
        }
    }

    function applyTheme() {
        const theme = dep.session.settings.theme === "dark" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", theme);
        dep.scheduleFitTopCountRow();
    }

    function loadSettings() {
        try {
            const raw = storage?.getItem?.(N1_SETTINGS_KEY);
            if (!raw) {
                dep.session.settings = { ...N1_DEFAULT_SETTINGS, theme: getPreferredThemeFromSystem() };
                return;
            }
            const parsed = JSON.parse(raw);
            dep.session.settings = {
                theme: parsed.theme === "dark" ? "dark" : "light",
                adaptiveTipsEnabled: parsed.adaptiveTipsEnabled !== false,
                curtainEnabled: parsed.curtainEnabled !== false,
                humorEnabled: parsed.humorEnabled !== false,
                showClapAnimation: parsed.showClapAnimation !== false,
                offlineCapHours: Number.isFinite(parsed.offlineCapHours) && parsed.offlineCapHours >= 0
                    ? parsed.offlineCapHours
                    : N1_DEFAULT_SETTINGS.offlineCapHours
            };
        } catch (_) {}
    }

    function persistSettings() {
        try {
            storage?.setItem?.(N1_SETTINGS_KEY, JSON.stringify(dep.session.settings));
        } catch (_) {}
    }

    function applySettingsToUI() {
        const s = dep.session.settings;
        if (dep.settingsThemeDarkEl) dep.settingsThemeDarkEl.checked = s.theme === "dark";
        if (dep.settingsAdaptiveTipsEl) dep.settingsAdaptiveTipsEl.checked = s.adaptiveTipsEnabled !== false;
        if (dep.settingsCurtainEnabledEl) dep.settingsCurtainEnabledEl.checked = !!s.curtainEnabled;
        if (dep.settingsHumorEnabledEl) dep.settingsHumorEnabledEl.checked = !!s.humorEnabled;
        if (dep.settingsShowClapAnimationEl) dep.settingsShowClapAnimationEl.checked = s.showClapAnimation !== false;
        if (dep.settingsOfflineCapHoursEl) dep.settingsOfflineCapHoursEl.value = String(s.offlineCapHours);
    }

    return {
        DEFAULT_SETTINGS: N1_DEFAULT_SETTINGS,
        applyTheme,
        loadSettings,
        persistSettings,
        applySettingsToUI
    };
}
