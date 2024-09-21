import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const stateSlice = createSlice({
  name: "state",
  initialState: {
    token: null as string | null,
    userId: null as string | null,
    chatId: null as string | null,
    realtimeActiveToken: null as string | null,
    isArtifactOpen: false,
  },
  reducers: {
    initialize: (
      state,
      action: PayloadAction<{ userId: string; token: string }>,
    ) => {
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      sessionStorage.setItem("token", action.payload.token);
      sessionStorage.setItem("userId", action.payload.userId);
    },
    activeChatChanged: (state, action: PayloadAction<string | null>) => {
      state.chatId = action.payload;
      state.isArtifactOpen = false;
    },
    realtimeActiveTokenChanged: (
      state,
      action: PayloadAction<string | null>,
    ) => {
      state.realtimeActiveToken = action.payload;
    },
    artifactOpenChanged: (state, action: PayloadAction<boolean>) => {
      state.isArtifactOpen = action.payload;
    },
  },
});

export const {
  initialize,
  activeChatChanged,
  realtimeActiveTokenChanged,
  artifactOpenChanged,
} = stateSlice.actions;
