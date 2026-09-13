import { createSlice } from "@reduxjs/toolkit";

import { removeItem, addItem } from "../../utils";

const initialState = {
  players: 6,
  spies: 2,
  addedPlaces: [],
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    incPlayers: (state) => {
      if (state.players + 1 <= 16) state.players += 1;
    },
    decPlayers: (state) => {
      if (!(state.players - 1 < state.spies || state.players - 1 <= 0))
        state.players -= 1;
    },
    incSpies: (state) => {
      if (state.spies + 1 <= state.players) state.spies += 1;
    },
    decSpies: (state) => {
      if (state.spies - 1 > 0) state.spies -= 1;
    },
    addPlace: (state, action) => {
      const newPlace = action.payload?.newPlace?.trim();
      if (!newPlace) return;
      state.addedPlaces = addItem(state.addedPlaces, newPlace);
    },
    removePlace: (state, action) => {
      state.addedPlaces = removeItem(state.addedPlaces, action.payload.index);
    },
  },
});

export const {
  incPlayers,
  decPlayers,
  incSpies,
  decSpies,
  addPlace,
  removePlace,
} = settingsSlice.actions;
export default settingsSlice.reducer;
