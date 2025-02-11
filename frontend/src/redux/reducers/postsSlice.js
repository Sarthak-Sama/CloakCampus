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
      const { posts, isFirstPage } = action.payload;
      if (isFirstPage) {
        state.posts = posts;
      } else {
        state.posts = [...state.posts, ...posts];
      }
    },

    addPost: (state, action) => {
      state.posts.push(action.payload.post);

      // Sort the posts after adding the new one
      state.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    removePost: (state, action) => {
      console.log(`Removing post`, state.posts.length);
      state.posts = state.posts.filter((post) => post._id !== action.payload);
      console.log(`Removed post`, state.posts.length);
    },
  },
});

// Export actions
export const { setPosts, addPost, removePost } = postsSlice.actions;

export default postsSlice.reducer;
