import { createSlice } from "@reduxjs/toolkit";

import {
  DEFAULT_DISCUSSION_MINUTES,
  MAX_DISCUSSION_MINUTES,
  MAX_PLAYERS,
  MIN_DISCUSSION_MINUTES,
  MIN_PLAYERS,
  MIN_SPIES,
  normalizeLocationName,
} from "../../game/gameLogic";

export const initialState = {
  players: 6,
  spies: 2,
  timerMinutes: DEFAULT_DISCUSSION_MINUTES,
  customLocations: [], // [{ id, name }]
};

function makeCustomLocationId() {
  return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    incPlayers(state) {
      if (state.players < MAX_PLAYERS) state.players += 1;
    },
    decPlayers(state) {
      const next = state.players - 1;
      // Never drop below the minimum supported player count, and never let
      // the spy count catch up to (or exceed) the player count.
      if (next >= MIN_PLAYERS && next > state.spies) {
        state.players = next;
      }
    },
    incSpies(state) {
      const next = state.spies + 1;
      if (next < state.players) state.spies = next;
    },
    decSpies(state) {
      const next = state.spies - 1;
      if (next >= MIN_SPIES) state.spies = next;
    },
    incTimerMinutes(state) {
      if (state.timerMinutes < MAX_DISCUSSION_MINUTES) state.timerMinutes += 1;
    },
    decTimerMinutes(state) {
      if (state.timerMinutes > MIN_DISCUSSION_MINUTES) state.timerMinutes -= 1;
    },
    addCustomLocation: {
      reducer(state, action) {
        const name = action.payload?.name;
        if (!name) return;

        const normalized = normalizeLocationName(name);
        const isDuplicate = state.customLocations.some(
          (location) => normalizeLocationName(location.name) === normalized
        );
        if (isDuplicate) return;

        state.customLocations.push({ id: action.payload.id, name });
      },
      prepare(name) {
        return {
          payload: {
            id: makeCustomLocationId(),
            name: String(name || "").trim(),
          },
        };
      },
    },
    removeCustomLocation(state, action) {
      state.customLocations = state.customLocations.filter(
        (location) => location.id !== action.payload
      );
    },
    // Applied once at startup with whatever was found in localStorage.
    hydrateSettings(state, action) {
      const { players, spies, customLocations, timerMinutes } = action.payload || {};
      if (Number.isInteger(players) && players >= MIN_PLAYERS) state.players = players;
      if (Number.isInteger(spies) && spies >= MIN_SPIES) state.spies = spies;
      if (
        Number.isInteger(timerMinutes) &&
        timerMinutes >= MIN_DISCUSSION_MINUTES &&
        timerMinutes <= MAX_DISCUSSION_MINUTES
      ) {
        state.timerMinutes = timerMinutes;
      }
      if (Array.isArray(customLocations)) state.customLocations = customLocations;
    },
  },
});

export const {
  incPlayers,
  decPlayers,
  incSpies,
  decSpies,
  incTimerMinutes,
  decTimerMinutes,
  addCustomLocation,
  removeCustomLocation,
  hydrateSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
