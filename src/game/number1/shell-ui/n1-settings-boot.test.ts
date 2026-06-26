import { describe, expect, it, vi } from "vitest";

import { createNumber1SettingsBoot, N1_SETTINGS_KEY } from "./n1-settings-boot.js";
import { N1_DEFAULT_SETTINGS } from "../state/n1-session-store.js";

describe("createNumber1SettingsBoot", () => {
    it("loads, persists, and mirrors settings to DOM", () => {
        const storage = {
            data: {} as Record<string, string>,
            getItem(key: string) {
                return this.data[key] ?? null;
            },
            setItem(key: string, value: string) {
                this.data[key] = value;
            }
        };
        const session = { settings: { ...N1_DEFAULT_SETTINGS } };
        const settingsThemeDarkEl = { checked: false };
        const settingsOfflineCapHoursEl = { value: "" };
        const boot = createNumber1SettingsBoot({
            session,
            storage,
            settingsThemeDarkEl,
            settingsAdaptiveTipsEl: null,
            settingsCurtainEnabledEl: null,
            settingsHumorEnabledEl: null,
            settingsShowClapAnimationEl: null,
            settingsOfflineCapHoursEl,
            scheduleFitTopCountRow: vi.fn()
        });

        session.settings.theme = "dark";
        boot.applySettingsToUI();
        expect(settingsThemeDarkEl.checked).toBe(true);

        boot.persistSettings();
        expect(storage.data[N1_SETTINGS_KEY]).toBeTruthy();

        session.settings = { ...N1_DEFAULT_SETTINGS };
        storage.data[N1_SETTINGS_KEY] = JSON.stringify({ theme: "dark", offlineCapHours: 4 });
        boot.loadSettings();
        expect(session.settings.theme).toBe("dark");
        expect(session.settings.offlineCapHours).toBe(4);
    });
});
