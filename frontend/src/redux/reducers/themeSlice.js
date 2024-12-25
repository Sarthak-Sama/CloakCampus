import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: localStorage.getItem("theme") || "light", // Initialize from local storage
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      state.theme = newTheme;
      localStorage.setItem("theme", newTheme);

      const root = window.document.documentElement;
      root.classList.remove(newTheme === "light" ? "dark" : "light"); // Remove old theme class
      root.classList.add(newTheme); // Add new theme class
    },
    setTheme: (state, action) => {
      const newTheme = action.payload;
      if (newTheme === state.theme) return; // Avoid redundant operations if theme is unchanged

      const root = window.document.documentElement;
      root.classList.remove(state.theme); // Remove old theme class
      root.classList.add(newTheme); // Add new theme class

      state.theme = newTheme;
      localStorage.setItem("theme", newTheme);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
