import { configureStore } from "@reduxjs/toolkit";

import { api } from "./api";
import { middleware } from "./realtime";
import { stateSlice } from "./state";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    state: stateSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware).concat(middleware),
  devTools: true,
});

export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
