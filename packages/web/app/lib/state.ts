import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const stateSlice = createSlice({
  name: "state",
  initialState: {
    token: null as string | null,
    chatId: null as string | null,
  },
  reducers: {
    tokenChanged: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    chatIdChanged: (state, action: PayloadAction<string | null>) => {
      state.chatId = action.payload;
    },
  },
});

export const { tokenChanged, chatIdChanged } = stateSlice.actions;
