// features/posts/postsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    items: [], // Stores posts
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  },
  reducers: {
    addPost: (state, action) => {
      state.items.push(action.payload);
    },
    removePost: (state, action) => {
      state.items = state.items.filter(post => post.id !== action.payload);
    },
    // Add more reducers here as needed
  },
});

export const { addPost, removePost } = postsSlice.actions;
export default postsSlice.reducer;
