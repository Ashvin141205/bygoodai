import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  sessionExpiry: null, // Track when session expires (timestamp)
  userLocation: null,
  hotGames: [],
  ourPlatform: [],
  levels: [], // Array to store all the objects (used by BonusesLevel page)
  activeLevel: null, // Object to store the active level
  main_balance: 0,
  bonus_balance: 0,
  total_deposit: 0,
  promotion_count: 0,
  system_count: 0,
  total_count: 0,
  signupBonus: null,
  // --- NEW UNIFIED STATE PROPERTIES ---
  lifetimeDeposit: 0,
  progressPercent: 0,
  // --- END ---
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    userToken: (state, action) => {
      state.token = action.payload.token;
      // Set session expiry to 12 hours from now (adjust as needed based on your backend)
      // Backend session timeout should match or be longer than this
      state.sessionExpiry = Date.now() + (12 * 60 * 60 * 1000); // 12 hours
    },
    userData: (state, action) => {
      state.user = action.payload.user;
    },
    HotGameData: (state, action) => {
      state.hotGames = action.payload.hotGames;
    },
    OurPlatformData: (state, action) => {
      state.ourPlatform = action.payload.ourPlatform;
    },
    setLevelDataState: (state, action) => {
      state.levels = action.payload;

      // Set activeLevel by finding the first object with active === true
      // This is still used by the BonusesLevel page
      state.activeLevel = action.payload.find(item => item.active) || null;
    },
    setActiveLevel(state, action) {
      state.activeLevel = action.payload;
    },
    // <<< --- ADD THIS NEW REDUCER --- >>>
    setUserLocation: (state, action) => {
      state.userLocation = action.payload;
    },
    UPDATE_BALANCE: (state, action) => {
      state.main_balance = parseFloat(action.payload.main_balance); // Ensure conversion to float
      state.bonus_balance = parseFloat(action.payload.bonus_balance); // Ensure conversion to float
      state.total_deposit = parseFloat(action.payload.total_deposit); // Ensure conversion to float
      state.promotion_count = parseFloat(action.payload.promotion_count); // Ensure conversion to float
      state.system_count = parseFloat(action.payload.system_count); // Ensure conversion to float
      state.total_count = parseFloat(action.payload.total_count); // Ensure conversion to float
    },
    
    // --- NEW UNIFIED REDUCER ---
    /**
     * Sets all level, deposit, and progress data from a single API call.
     * This becomes the main source of truth for the Header and progress bars.
     */
    SET_LEVEL_DATA: (state, action) => {
        state.activeLevel = action.payload.activeLevel;
        state.lifetimeDeposit = parseFloat(action.payload.lifetimeDeposit) || 0;
        state.progressPercent = parseInt(action.payload.progressPercent, 10) || 0;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.sessionExpiry = null; // Clear session expiry
      state.hotGames = [];
      state.ourPlatform = [];
      state.levels = [];
      state.activeLevel = null;
      state.main_balance = 0;
      state.bonus_balance = 0;
      state.total_deposit = 0;
      state.promotion_count = 0;
      state.system_count = 0;
      state.total_count = 0;
      state.signupBonus = null; // Clear on logout
      state.userLocation = null; // Clear on logout
      
      // --- ADD RESETS FOR NEW STATE ---
      state.lifetimeDeposit = 0;
      state.progressPercent = 0;
 
      // --- END RESETS ---
    },

    // --- ADD THESE TWO NEW REDUCERS ---
    setSignupBonus: (state, action) => {
        state.signupBonus = action.payload;
    },
    clearSignupBonus: (state) => {
        state.signupBonus = null;
    },
    // --- ADD THESE NEW REDUCERS ---

    /**
     * Updates the streak UI instantly after a successful claim,
     * without needing to re-fetch.
     */
 
    // --- END OF NEW REDUCERS ---
  },
});

export const { 
    userToken, 
    userData, 
    setUserLocation, 
    HotGameData, 
    OurPlatformData, 
    logout, 
    setSignupBonus, 
    clearSignupBonus, 
    setLevelDataState, 
    setActiveLevel, 
    UPDATE_BALANCE,
    // --- EXPORT THE NEW REDUCER ---
    SET_LEVEL_DATA 
    
} = authSlice.actions;
export default authSlice.reducer;