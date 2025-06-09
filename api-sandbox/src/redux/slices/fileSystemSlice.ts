import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface File {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FileSystemState {
  files: File[];
  currentFile: File | null;
  loading: boolean;
  error: string | null;
}

const initialState: FileSystemState = {
  files: [],
  currentFile: null,
  loading: false,
  error: null
};

const fileSystemSlice = createSlice({
  name: 'fileSystem',
  initialState,
  reducers: {
    loadFiles: (state, action: PayloadAction<File[]>) => {
      state.files = action.payload;
      state.loading = false;
      state.error = null;
    },
    saveFile: (state, action: PayloadAction<File>) => {
      const existingIndex = state.files.findIndex(file => file.id === action.payload.id);
      if (existingIndex >= 0) {
        state.files[existingIndex] = action.payload;
      } else {
        state.files.push(action.payload);
      }
      state.currentFile = action.payload;
    },
    deleteFile: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter(file => file.id !== action.payload);
      if (state.currentFile && state.currentFile.id === action.payload) {
        state.currentFile = null;
      }
    },
    setCurrentFile: (state, action: PayloadAction<File>) => {
      state.currentFile = action.payload;
    },
    updateCurrentFileContent: (state, action: PayloadAction<string>) => {
      if (state.currentFile) {
        state.currentFile.content = action.payload;
        state.currentFile.updatedAt = new Date();
        
        // Also update the file in files array
        const fileIndex = state.files.findIndex(file => file.id === state.currentFile?.id);
        if (fileIndex >= 0) {
          state.files[fileIndex].content = action.payload;
          state.files[fileIndex].updatedAt = new Date();
        }
      }
    }
  }
});

export const {
  loadFiles,
  saveFile,
  deleteFile,
  setCurrentFile,
  updateCurrentFileContent
} = fileSystemSlice.actions;

export default fileSystemSlice.reducer;