import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import dashboardReducer from './dashboardSlice';
import userReducer from './userSlice';
import driverReducer from './driverSlice';
import rideReducer from './rideSlice';
import notificationReducer from './notificationSlice';
import couponReducer from './couponSlice';
import cmsReducer from './cmsSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    users: userReducer,
    drivers: driverReducer,
    rides: rideReducer,
    notifications: notificationReducer,
    coupons: couponReducer,
    cms: cmsReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
