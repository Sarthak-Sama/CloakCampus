import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: {
    // Add reducers here, e.g., posts, comments, notifications
  },
});

export default store;
