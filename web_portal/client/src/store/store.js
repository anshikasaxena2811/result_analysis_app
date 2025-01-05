import { configureStore } from '@reduxjs/toolkit'
import themeReducer from './themeSlice'
import filesReducer from './filesSlice'
import userReducer from './userSlice'

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    files: filesReducer,
    user: userReducer
  }
}) 