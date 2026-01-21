import { configureStore } from '@reduxjs/toolkit';
import timeTrackerReducer from './timeTracker/timeTrackerSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      timeTracker: timeTrackerReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
  });
};

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];