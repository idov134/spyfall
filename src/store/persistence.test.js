import { SETTINGS_STORAGE_KEY, loadPersistedSettings, savePersistedSettings } from "./persistence";

describe("settings persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns null when nothing has been saved yet", () => {
    expect(loadPersistedSettings()).toBeNull();
  });

  it("round-trips players, spies, timer duration, and custom locations through localStorage", () => {
    savePersistedSettings({
      players: 9,
      spies: 3,
      timerMinutes: 10,
      customLocations: [{ id: "custom-1", name: "Grandma's House" }],
    });

    expect(loadPersistedSettings()).toEqual({
      players: 9,
      spies: 3,
      timerMinutes: 10,
      customLocations: [{ id: "custom-1", name: "Grandma's House" }],
    });
  });

  it("persists custom locations across a simulated refresh (re-read after save)", () => {
    savePersistedSettings({ players: 6, spies: 2, customLocations: [{ id: "c1", name: "Submarine" }] });
    const reloaded = loadPersistedSettings();
    expect(reloaded.customLocations).toEqual([{ id: "c1", name: "Submarine" }]);
  });

  it("ignores corrupted JSON instead of throwing", () => {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, "{not valid json");
    expect(loadPersistedSettings()).toBeNull();
  });

  it("drops malformed custom location entries", () => {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ players: 5, spies: 1, customLocations: [{ id: "ok", name: "Fine" }, { name: "no id" }, "garbage"] })
    );
    expect(loadPersistedSettings().customLocations).toEqual([{ id: "ok", name: "Fine" }]);
  });
});
