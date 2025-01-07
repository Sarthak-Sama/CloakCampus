import { createSlice } from "@reduxjs/toolkit";

const validThemes = ["light", "dark"];
let savedTheme = localStorage.getItem("theme");

// Apply the initial theme to the root element
const root = window.document.documentElement;

if (!savedTheme || !validThemes.includes(savedTheme)) {
  savedTheme = "light";
  localStorage.setItem("theme", "light");
}

root.classList.add(savedTheme); // Add the saved theme as a class to <html>

const initialState = {
  theme: savedTheme,
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
      root.classList.remove(newTheme === "light" ? "dark" : "light");
      root.classList.add(newTheme);
    },
    setTheme: (state, action) => {
      const newTheme = action.payload;
      if (!validThemes.includes(newTheme) || newTheme === state.theme) return;

      const root = window.document.documentElement;
      root.classList.remove(state.theme);
      root.classList.add(newTheme);

      state.theme = newTheme;
      localStorage.setItem("theme", newTheme);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
