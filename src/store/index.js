import { configureStore } from "@reduxjs/toolkit";

import settingsReducer from "./reducers/settingsReducer";

const store = configureStore({
  reducer: {
    settings: settingsReducer,
  },
});

export default store;
