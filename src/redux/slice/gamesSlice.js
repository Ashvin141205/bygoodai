import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  games: [],
  cart: [],
  pendingOperations: {}, // Track pending API operations by game ID
}

const gamesSlice = createSlice({
  name: "games",
  initialState,
  reducers: {
    setGames: (state, action) => {
      state.games = action.payload
    },
    updateGame: (state, action) => {
      const updatedGame = action.payload
      // FIX: Add null check to safely access .id
      const index = state.games.findIndex((game) => game && game.id === updatedGame.id)

      if (index !== -1) {
        if (state.games[index].is_game_add === true && updatedGame.is_game_add === false) {
          state.games[index].is_game_add = true
        } else {
          state.games[index] = updatedGame
        }
      } else {
        state.games.push(updatedGame)
      }
    },
    addToCart: (state, action) => {
      const { id, quantity = 10 } = action.payload
      
      // Clean up any corrupted cart entries first
      state.cart = state.cart.filter(game => game && game.id !== undefined && game.id !== null)
      
      // FIX: Add null check to safely access .id
      const gameIndex = state.games.findIndex((game) => game && game.id === id)
      // FIX: Add null check to safely access .id (This addresses line 57 in the original error context)
      const cartIndex = state.cart.findIndex((game) => game && game.id === id)

      if (gameIndex !== -1 && state.games[gameIndex]) {
        state.games[gameIndex].is_game_add = true
      }

      if (cartIndex !== -1 && state.cart[cartIndex]) {
        state.cart[cartIndex].quantity = quantity
      } else if (gameIndex !== -1 && state.games[gameIndex]) {
        state.cart.push({ ...state.games[gameIndex], quantity })
      }

      // Mark as pending
      if (!state.pendingOperations) {
        state.pendingOperations = {}
      }
      state.pendingOperations[id] = "adding"
    },
    updateCartQuantity: (state, action) => {
      const { id, quantity } = action.payload
      
      // Clean up any corrupted cart entries first
      state.cart = state.cart.filter(game => game && game.id !== undefined && game.id !== null)
      
      // FIX: Add null check to safely access .id
      const cartIndex = state.cart.findIndex((game) => game && game.id === id)

      if (cartIndex !== -1 && state.cart[cartIndex]) {
        state.cart[cartIndex].quantity = quantity
      }
    },
    removeFromCart: (state, action) => {
      const { id } = action.payload
      
      // Clean up any corrupted cart entries first
      state.cart = state.cart.filter(game => game && game.id !== undefined && game.id !== null)
      
      // FIX: Add null check to safely access .id
      const gameIndex = state.games.findIndex((game) => game && game.id === id)

      if (gameIndex !== -1 && state.games[gameIndex]) {
        state.games[gameIndex].is_game_add = false
      }

      // FIX: Add null check to safely access .id and filter out corrupted entries
      state.cart = state.cart.filter((game) => game && game.id !== id)

      // Mark as pending
      if (!state.pendingOperations) {
        state.pendingOperations = {}
      }
      state.pendingOperations[id] = "removing"
    },
    confirmCartOperation: (state, action) => {
      const { id } = action.payload
      // Ensure pendingOperations exists before trying to delete
      if (state.pendingOperations && state.pendingOperations[id]) {
        delete state.pendingOperations[id]
      }
    },
    rollbackCartOperation: (state, action) => {
      const { id, operation, previousState } = action.payload

      if (operation === "adding") {
        // Rollback add
        // FIX: Add null check to safely access .id
        const gameIndex = state.games.findIndex((game) => game && game.id === id)
        if (gameIndex !== -1) {
          state.games[gameIndex].is_game_add = false
        }
        // FIX: Add null check to safely access .id and filter out corrupted entries
        state.cart = state.cart.filter((game) => game && game.id !== id)
      } else if (operation === "updating" && previousState) {
        // Rollback quantity update
        // FIX: Add null check to safely access .id
        const cartIndex = state.cart.findIndex((game) => game && game.id === id)
        if (cartIndex !== -1) {
          state.cart[cartIndex].quantity = previousState.quantity
        }
      } else if (operation === "removing" && previousState) {
        // Rollback remove
        // FIX: Add null check to safely access .id
        const gameIndex = state.games.findIndex((game) => game && game.id === id)
        if (gameIndex !== -1) {
          state.games[gameIndex].is_game_add = true
        }
        state.cart.push(previousState)
      }

      // Ensure pendingOperations exists before trying to delete
      if (state.pendingOperations && state.pendingOperations[id]) {
        delete state.pendingOperations[id]
      }
    },
    resetGamesState: (state) => {
      state.games = []
      state.cart = []
      state.pendingOperations = {}
    },
  },
})

export const {
  setGames,
  updateGame,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  confirmCartOperation,
  rollbackCartOperation,
  resetGamesState,
} = gamesSlice.actions

export default gamesSlice.reducer