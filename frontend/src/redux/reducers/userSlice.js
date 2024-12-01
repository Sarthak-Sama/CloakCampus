import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loadUser: (state, action) => {
      state.user = action.payload; // Store the user data in Redux
    },
  },
});

export const { loadUser } = userSlice.actions;
export default userSlice.reducer;
