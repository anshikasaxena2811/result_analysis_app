import { createSlice } from '@reduxjs/toolkit'

const getSystemTheme = () => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'system') {
    return getSystemTheme()
  }
  return savedTheme || 'light'
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: getInitialTheme(),
    preference: localStorage.getItem('theme') || 'light'
  },
  reducers: {
    toggleTheme: (state, action) => {
      const preference = action.payload
      state.preference = preference
      state.mode = preference === 'system' ? getSystemTheme() : preference
      localStorage.setItem('theme', preference)
    },
  },
})

export const { toggleTheme } = themeSlice.actions
export default themeSlice.reducer 