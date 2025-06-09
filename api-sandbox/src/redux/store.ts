import { configureStore } from '@reduxjs/toolkit';
import fileSystemReducer from './slices/fileSystemSlice';

export const store = configureStore({
  reducer: {
    fileSystem: fileSystemReducer,
    // Add other reducers here as needed
  },
  // Optional: Add middleware, devTools configuration, etc.
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;