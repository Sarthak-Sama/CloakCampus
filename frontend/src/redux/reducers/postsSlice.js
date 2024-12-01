// features/posts/postsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  posts: [],
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    loadPost: (state, action) => {
      console.log(action.payload);
      state.posts.push(action.payload);
    },
  },
});

export const { loadPost } = postsSlice.actions;
export default postsSlice.reducer;
