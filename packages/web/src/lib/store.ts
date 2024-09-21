import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

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

export const useAppDispatch = () => useDispatch<Dispatch>();
export const useAppSelector: TypedUseSelectorHook<State> = useSelector;
