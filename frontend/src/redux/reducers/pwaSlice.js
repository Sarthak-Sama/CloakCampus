import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  deferredPrompt: null,
  isInstalled: false,
};

const pwaSlice = createSlice({
  name: "pwa",
  initialState,
  reducers: {
    setDeferredPrompt(state, action) {
      state.deferredPrompt = action.payload;
    },
    setInstalled(state, action) {
      state.isInstalled = action.payload;
      // Optionally clear the deferred prompt if installed
      if (action.payload) {
        state.deferredPrompt = null;
      }
    },
  },
});

export const { setDeferredPrompt, setInstalled } = pwaSlice.actions;
export default pwaSlice.reducer;
