import reducer, {
  addCustomLocation,
  decPlayers,
  decSpies,
  hydrateSettings,
  incPlayers,
  incSpies,
  initialState,
  removeCustomLocation,
} from "./settingsReducer";
import { MAX_PLAYERS, MIN_PLAYERS, MIN_SPIES } from "../../game/gameLogic";

describe("settingsReducer - player/spy bounds", () => {
  it("increments players up to the maximum", () => {
    let state = { ...initialState, players: MAX_PLAYERS - 1 };
    state = reducer(state, incPlayers());
    expect(state.players).toBe(MAX_PLAYERS);
    state = reducer(state, incPlayers());
    expect(state.players).toBe(MAX_PLAYERS);
  });

  it("does not decrement players below the minimum", () => {
    let state = { ...initialState, players: MIN_PLAYERS, spies: MIN_SPIES };
    state = reducer(state, decPlayers());
    expect(state.players).toBe(MIN_PLAYERS);
  });

  it("does not decrement players so far that spies would be >= players", () => {
    // players = spies + 1 is the tightest legal gap.
    let state = { ...initialState, players: 4, spies: 3 };
    state = reducer(state, decPlayers());
    expect(state.players).toBe(4);
  });

  it("does not increment spies to equal or exceed players", () => {
    let state = { ...initialState, players: 4, spies: 3 };
    state = reducer(state, incSpies());
    expect(state.spies).toBe(3);
  });

  it("does not decrement spies below the minimum", () => {
    let state = { ...initialState, players: 6, spies: MIN_SPIES };
    state = reducer(state, decSpies());
    expect(state.spies).toBe(MIN_SPIES);
  });

  it("allows normal increments/decrements within bounds", () => {
    let state = { ...initialState, players: 6, spies: 2 };
    state = reducer(state, incPlayers());
    expect(state.players).toBe(7);
    state = reducer(state, incSpies());
    expect(state.spies).toBe(3);
  });
});

describe("settingsReducer - custom locations", () => {
  it("adds a trimmed custom location", () => {
    const state = reducer(initialState, addCustomLocation("  Grandma's House  "));
    expect(state.customLocations).toHaveLength(1);
    expect(state.customLocations[0].name).toBe("Grandma's House");
    expect(typeof state.customLocations[0].id).toBe("string");
    expect(state.customLocations[0].id.length).toBeGreaterThan(0);
  });

  it("rejects an empty/whitespace-only location", () => {
    const state = reducer(initialState, addCustomLocation("   "));
    expect(state.customLocations).toHaveLength(0);
  });

  it("rejects an obvious case-insensitive duplicate", () => {
    let state = reducer(initialState, addCustomLocation("Submarine"));
    state = reducer(state, addCustomLocation("submarine"));
    expect(state.customLocations).toHaveLength(1);
  });

  it("removes a custom location by id", () => {
    let state = reducer(initialState, addCustomLocation("Space Station"));
    const id = state.customLocations[0].id;
    state = reducer(state, removeCustomLocation(id));
    expect(state.customLocations).toHaveLength(0);
  });
});

describe("settingsReducer - hydrateSettings", () => {
  it("applies valid persisted values", () => {
    const state = reducer(
      initialState,
      hydrateSettings({ players: 8, spies: 3, customLocations: [{ id: "x", name: "Y" }] })
    );
    expect(state.players).toBe(8);
    expect(state.spies).toBe(3);
    expect(state.customLocations).toEqual([{ id: "x", name: "Y" }]);
  });

  it("ignores invalid/missing fields and keeps existing state", () => {
    const state = reducer(initialState, hydrateSettings({ players: 0, spies: -1 }));
    expect(state.players).toBe(initialState.players);
    expect(state.spies).toBe(initialState.spies);
  });
});
