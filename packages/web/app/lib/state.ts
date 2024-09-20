import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const stateSlice = createSlice({
  name: "state",
  initialState: {
    token: null as string | null,
    userId: null as string | null,
    chatId: null as string | null,
  },
  reducers: {
    initialize: (
      state,
      action: PayloadAction<{ userId: string; token: string }>,
    ) => {
      state.token = action.payload.token;
      state.userId = action.payload.userId;
    },
    chatIdChanged: (state, action: PayloadAction<string | null>) => {
      state.chatId = action.payload;
    },
  },
});

export const { initialize, chatIdChanged } = stateSlice.actions;
