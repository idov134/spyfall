// Small localStorage helper for persisting non-sensitive game settings
// (player/spy counts, custom locations) across page refreshes. Kept
// framework-free and defensive: any storage/JSON error is swallowed and
// simply results in "no persisted settings".

export const SETTINGS_STORAGE_KEY = "spyfall:settings:v1";

function getStorage() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return window.localStorage;
}

export function loadPersistedSettings() {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const { players, spies, customLocations } = parsed;
    const result = {};
    if (Number.isInteger(players)) result.players = players;
    if (Number.isInteger(spies)) result.spies = spies;
    if (Array.isArray(customLocations)) {
      result.customLocations = customLocations.filter(
        (location) =>
          location && typeof location.id === "string" && typeof location.name === "string"
      );
    }
    return result;
  } catch (error) {
    console.warn("Failed to read persisted settings:", error.message);
    return null;
  }
}

export function savePersistedSettings(settings) {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        players: settings.players,
        spies: settings.spies,
        customLocations: settings.customLocations,
      })
    );
  } catch (error) {
    console.warn("Failed to persist settings:", error.message);
  }
}
