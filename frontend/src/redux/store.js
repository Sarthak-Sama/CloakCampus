import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/userSlice";
import postReducer from "./reducers/postsSlice";
import themeReducer from "./reducers/themeSlice";
import notificationReducer from "./reducers/notificationsSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postReducer,
    notifications: notificationReducer,
    theme: themeReducer,
  },
});
