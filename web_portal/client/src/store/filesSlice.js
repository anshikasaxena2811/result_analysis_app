import { createSlice } from '@reduxjs/toolkit'

const filesSlice = createSlice({
  name: 'files',
  initialState: {
    generatedFiles: []
  },
  reducers: {
    setGeneratedFiles: (state, action) => {
      state.generatedFiles = action.payload
    },
    clearGeneratedFiles: (state) => {
      state.generatedFiles = []
    }
  }
})

export const { setGeneratedFiles, clearGeneratedFiles } = filesSlice.actions
export default filesSlice.reducer 