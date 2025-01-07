import { createSlice } from '@reduxjs/toolkit'

const filesSlice = createSlice({
  name: 'files',
  initialState: {
    files: {},               // for file listing/browsing
    generatedFiles: [],      // for newly generated files
    loading: false,
    error: null
  },
  reducers: {
    // For file browsing
    setFiles: (state, action) => {
      state.files = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearFiles: (state) => {
      state.files = {};
      state.loading = false;
      state.error = null;
    },

    // For generated files
    setGeneratedFiles: (state, action) => {
      state.generatedFiles = action.payload;
    },
    clearGeneratedFiles: (state) => {
      state.generatedFiles = [];
    },

    // Clear all file-related state
    clearAllFiles: (state) => {
      state.files = {};
      state.generatedFiles = [];
      state.loading = false;
      state.error = null;
    }
  }
})

export const { 
  setFiles, 
  setLoading, 
  setError, 
  clearFiles,
  setGeneratedFiles, 
  clearGeneratedFiles,
  clearAllFiles 
} = filesSlice.actions

export default filesSlice.reducer 