import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage'; // Removed due to Vite ESM compatibility

const customStorage = {
  getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key, item) => Promise.resolve(window.localStorage.setItem(key, item)),
  removeItem: (key) => Promise.resolve(window.localStorage.removeItem(key)),
};
import authReducer from './authSlice';
import rideReducer from './rideSlice';
import notificationReducer from './notificationSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  ride: rideReducer,
  notifications: notificationReducer,
});

const persistConfig = {
  key: 'root',
  storage: customStorage,
  whitelist: ['auth', 'ride'] // Only persist auth and active ride
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // redux-persist uses non-serializable values
    }),
});

export const persistor = persistStore(store);
