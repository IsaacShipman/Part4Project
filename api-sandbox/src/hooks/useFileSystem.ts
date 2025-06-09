import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  loadFiles, 
  saveFile, 
  deleteFile, 
  setCurrentFile, 
  updateCurrentFileContent 
} from '../redux/slices/fileSystemSlice';
import { RootState } from '../redux/store';

// Define File interface to match your redux store
interface File {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useFileSystem() {
  const dispatch = useDispatch();
  const { files, currentFile } = useSelector((state: RootState) => state.fileSystem);
  
  // Load files from local storage on initial load
  const loadFilesFromStorage = useCallback(() => {
    try {
      const savedFiles = localStorage.getItem('apiSandboxFiles');
      if (savedFiles) {
        const parsedFiles = JSON.parse(savedFiles, (key, value) => {
          if (key === 'createdAt' || key === 'updatedAt') {
            return new Date(value);
          }
          return value;
        }) as File[];
        dispatch(loadFiles(parsedFiles));
        return parsedFiles;
      }
      return [];
    } catch (error) {
      console.error('Error loading files:', error);
      return [];
    }
  }, [dispatch]);
  
  // Save file to redux and local storage
  const saveFileToStorage = useCallback((file: File) => {
    // Update redux state
    dispatch(saveFile(file));
    
    // Update local storage
    try {
      const updatedFiles = [...files.filter(f => f.id !== file.id), file];
      localStorage.setItem('apiSandboxFiles', JSON.stringify(updatedFiles));
    } catch (error) {
      console.error('Error saving file:', error);
    }
    
    return file;
  }, [dispatch, files]);
  
  // Delete file from redux and local storage
  const deleteFileFromStorage = useCallback((fileId: string) => {
    dispatch(deleteFile(fileId));
    
    try {
      const updatedFiles = files.filter(file => file.id !== fileId);
      localStorage.setItem('apiSandboxFiles', JSON.stringify(updatedFiles));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }, [dispatch, files]);
  
  // Open a file for editing
  const openFileForEditing = useCallback((file: File) => {
    dispatch(setCurrentFile(file));
  }, [dispatch]);
  
  // Update current file content - this is the key function for auto-saving
  const updateFileContent = useCallback((content: string) => {
    dispatch(updateCurrentFileContent(content));
    
    // Auto-save to local storage
    if (currentFile) {
      const updatedFile = {
        ...currentFile,
        content,
        updatedAt: new Date()
      };
      
      try {
        const updatedFiles = files.map(file => 
          file.id === currentFile.id ? updatedFile : file
        );
        localStorage.setItem('apiSandboxFiles', JSON.stringify(updatedFiles));
      } catch (error) {
        console.error('Error auto-saving file:', error);
      }
    }
  }, [dispatch, currentFile, files]);
  
  return {
    files,
    currentFile,
    loadFiles: loadFilesFromStorage,
    saveFile: saveFileToStorage,
    deleteFile: deleteFileFromStorage,
    openFile: openFileForEditing,
    updateFileContent
  };
}