import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/userSlice";
import postReducer from "./reducers/postsSlice";
import themeReducer from "./reducers/themeSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postReducer,
    theme: themeReducer,
  },
});
