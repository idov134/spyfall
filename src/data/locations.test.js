import { BUILT_IN_LOCATIONS, getLocationName, toLocationObject } from "./locations";

describe("BUILT_IN_LOCATIONS", () => {
  it("has a reasonably large, varied catalog", () => {
    expect(BUILT_IN_LOCATIONS.length).toBeGreaterThanOrEqual(20);
  });

  it("gives every location a unique, stable id", () => {
    const ids = BUILT_IN_LOCATIONS.map((location) => location.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(typeof id).toBe("string"));
  });

  it("gives every location both an English and a Hebrew name", () => {
    BUILT_IN_LOCATIONS.forEach((location) => {
      expect(location.names.en).toBeTruthy();
      expect(location.names.he).toBeTruthy();
    });
  });

  it("does not use specific businesses or addresses (spot check)", () => {
    const names = BUILT_IN_LOCATIONS.map((location) => location.names.en.toLowerCase());
    ["pizza hut", "starbucks", "street", "avenue"].forEach((forbidden) => {
      expect(names.some((name) => name.includes(forbidden))).toBe(false);
    });
  });
});

describe("getLocationName", () => {
  const location = { names: { en: "Airport", he: "נמל תעופה" } };

  it("returns the English name for English", () => {
    expect(getLocationName(location, "en")).toBe("Airport");
  });

  it("returns the Hebrew name for Hebrew", () => {
    expect(getLocationName(location, "he")).toBe("נמל תעופה");
  });

  it("falls back to English for unknown/unsupported languages", () => {
    expect(getLocationName(location, "fr")).toBe("Airport");
  });

  it("returns an empty string for a missing location", () => {
    expect(getLocationName(null, "en")).toBe("");
  });
});

describe("toLocationObject", () => {
  it("wraps a custom location so it matches the built-in shape", () => {
    const custom = toLocationObject({ id: "custom-1", name: "Grandma's House" });
    expect(custom.id).toBe("custom-1");
    expect(custom.isCustom).toBe(true);
    expect(getLocationName(custom, "en")).toBe("Grandma's House");
    expect(getLocationName(custom, "he")).toBe("Grandma's House");
  });
});
