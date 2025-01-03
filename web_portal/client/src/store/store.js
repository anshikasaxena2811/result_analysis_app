import { configureStore } from '@reduxjs/toolkit'
import themeReducer from './themeSlice'
import filesReducer from './filesSlice'

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    files: filesReducer
  }
}) 