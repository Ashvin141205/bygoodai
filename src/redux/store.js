import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import authReducer from './slice/authSlice';
import gamesReducer from './slice/gamesSlice';
import couponReducer from './slice/couponSlice';
import { thunk } from 'redux-thunk';
import { logout } from './slice/authSlice';

// Track if logout has already been triggered to prevent infinite loops
let logoutInProgress = false;

// Middleware to clean up corrupted cart data
const cartCleanupMiddleware = (store) => (next) => (action) => {
  // Clean up cart on REHYDRATE (when persisted state is loaded)
  if (action.type === REHYDRATE && action.payload?.games?.cart) {
    const cleanedCart = action.payload.games.cart.filter(
      game => game && game.id !== undefined && game.id !== null
    );
    
    if (cleanedCart.length !== action.payload.games.cart.length) {
      console.log('Cleaned up corrupted cart entries on rehydrate');
      action.payload.games.cart = cleanedCart;
    }
  }
  
  return next(action);
};

// Custom middleware to check session expiration
const sessionExpirationMiddleware = (store) => (next) => (action) => {
  // Skip check if logout is already in progress or if this IS a logout action
  if (logoutInProgress || action.type === 'auth/logout') {
    return next(action);
  }

  // Check session expiration on every action
  const state = store.getState();
  const sessionExpiry = state.auth?.sessionExpiry;
  const token = state.auth?.token;
  
  if (token && sessionExpiry) {
    const now = Date.now();
    if (now > sessionExpiry) {
      // Session has expired, automatically logout
      console.log('Session expired at:', new Date(sessionExpiry).toLocaleString());
      
      // Set flag to prevent infinite loop
      logoutInProgress = true;
      
      // Dispatch logout and redirect
      store.dispatch(logout());
      
      // Reset flag after a short delay
      setTimeout(() => {
        logoutInProgress = false;
        window.location.href = '/login';
      }, 100);
      
      return next(action);
    }
  }
  
  return next(action);
};

const persistConfig = {
  key: 'luckcharmseep',
  storage,
};

const rootReducer = combineReducers({
  auth: authReducer,
  games: gamesReducer,
  coupon: couponReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(thunk, cartCleanupMiddleware, sessionExpirationMiddleware),
  devTools: true,
});

export const persistor = persistStore(store);