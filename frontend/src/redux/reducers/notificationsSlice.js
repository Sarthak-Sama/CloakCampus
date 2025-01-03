import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
};

const notificationsSlice = createSlice({
  name: "notificaations",
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    },
  },
});

// Export actions
export const { setNotifications } = notificationsSlice.actions;

export default notificationsSlice.reducer;
