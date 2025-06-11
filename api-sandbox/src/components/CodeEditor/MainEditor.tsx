import React, { useEffect, useRef } from 'react';
import PythonEditor from './CodeEditor';
import { useFileManager } from '../../contexts/FileManagerContext';
import { Box, Snackbar } from '@mui/material';

interface MainEditorProps {
    code: string;  // Default code to use when no file is selected
    setCode: (code: string) => void;  // Update default code (for backward compatibility)
    onExecuteCode: () => void;
}

const MainEditor: React.FC<MainEditorProps> = ({ code, setCode, onExecuteCode }) => {
  const { activeFileId, files, updateFile, getActiveFile } = useFileManager();
  const [saved, setSaved] = React.useState(true);
  const [showSavedMessage, setShowSavedMessage] = React.useState(false);
  const lastActiveFileIdRef = useRef(activeFileId);
  
  // Get the active file based on activeFileId
  const activeFile = getActiveFile();
  
  // Auto-save when switching between files
  useEffect(() => {
    if (lastActiveFileIdRef.current !== activeFileId) {
      lastActiveFileIdRef.current = activeFileId;
    }
  }, [activeFileId, activeFile]);
  
  const handleCodeChange = (newCode: string) => {
    if (activeFile) {
      updateFile(activeFile.id, newCode);
      setSaved(false);
    } else {
      // If no active file, update the default code
      setCode(newCode);
    }
  };
  
  const handleSaveCode = () => {
    if (activeFile) {
      console.log('Saving code:', activeFile.content);
      setSaved(true);
      setShowSavedMessage(true);
    }
  };
  
  // Function to pass to CodeEditor's onExecuteCode
  const handleRunCode = () => {
    // Auto-save before running
    if (activeFile) {
      handleSaveCode();
    }
    
    // Call the onExecuteCode prop from MainView
    onExecuteCode();
  };
  
  // Auto-save timer
  useEffect(() => {
    if (!saved && activeFile) {
      const timer = setTimeout(() => {
        setSaved(true);
        setShowSavedMessage(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [saved, activeFile]);
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PythonEditor 
        key={activeFileId || 'default'}
        code={activeFile ? activeFile.content : code} 
        setCode={handleCodeChange} 
        onExecuteCode={handleRunCode}
        onSaveCode={handleSaveCode}
        isSaved={saved}
      />
      
      <Snackbar
        open={showSavedMessage}
        autoHideDuration={3000}
        onClose={() => setShowSavedMessage(false)}
        message="File saved successfully"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
};

export default MainEditor;