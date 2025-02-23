import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loading: true,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Call this when starting the fetch
    setLoading(state) {
      state.loading = true;
    },
    // Call this on a successful fetch; sets loading to false
    loadUser(state, action) {
      state.user = action.payload;
    },
    // Call this on a failed fetch; sets loading to false
    setLoadingCompleted(state) {
      state.loading = false;
    },
  },
});

export const { setLoading, loadUser, setLoadingCompleted } = userSlice.actions;
export default userSlice.reducer;
