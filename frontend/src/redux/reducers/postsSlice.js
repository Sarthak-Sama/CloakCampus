import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  posts: [],
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    // Renamed loadPost to setPosts for better clarity
    setPosts: (state, action) => {
      // Here we replace the posts array with the fetched posts
      state.posts = action.payload.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    },

    addPost: (state, action) => {
      state.posts.push(action.payload);

      // Sort the posts after adding the new one
      state.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    removePost: (state, action) => {
      state.posts = state.posts.filter((post) => post.id !== action.payload);
    },
  },
});

// Export actions
export const { setPosts, addPost, removePost } = postsSlice.actions;

export default postsSlice.reducer;
