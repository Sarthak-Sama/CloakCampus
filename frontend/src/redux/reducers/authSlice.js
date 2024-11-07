import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to check authentication status by calling backend
export const checkAuth = createAsyncThunk("auth/checkAuth", async () => {
  try {
    const response = await axios.get("/auth/verify", { withCredentials: true });
    return response.status === 200; // if authenticated
  } catch (error) {
    return false; // if not authenticated
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    loading: false,
  },
  reducers: {
    login: (state) => {
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.isAuthenticated = action.payload;
    });
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
