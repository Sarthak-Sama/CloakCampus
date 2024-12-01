import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/userSlice";
import postReducer from "./reducers/postsSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postReducer,
  },
});
