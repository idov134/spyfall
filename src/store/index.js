import { configureStore } from "@reduxjs/toolkit";

import settingsReducer, { hydrateSettings } from "./reducers/settingsReducer";
import { loadPersistedSettings, savePersistedSettings } from "./persistence";

const store = configureStore({
  reducer: {
    settings: settingsReducer,
  },
});

// Restore player/spy counts and custom locations saved from a previous
// session, then keep localStorage in sync on every change.
const persisted = loadPersistedSettings();
if (persisted) {
  store.dispatch(hydrateSettings(persisted));
}

store.subscribe(() => {
  savePersistedSettings(store.getState().settings);
});

export default store;
