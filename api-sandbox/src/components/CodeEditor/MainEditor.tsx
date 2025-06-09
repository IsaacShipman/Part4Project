import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash'; // Make sure to install this if not already: npm install lodash
import PythonEditor from './CodeEditor';
import { useFileSystem } from '../../hooks/useFileSystem';
import { Box, Typography } from '@mui/material';

const MainEditor: React.FC = () => {
  const { currentFile, updateFileContent } = useFileSystem();
  const [code, setCode] = useState<string>('');
  
  // When the selected file changes, update the editor content
  useEffect(() => {
    if (currentFile) {
      setCode(currentFile.content);
    } else {
      setCode('# Select or create a file to start coding');
    }
  }, [currentFile]);
  
  // Create a debounced save function - improves performance by not saving on every keystroke
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce((content: string) => {
      if (currentFile) {
        updateFileContent(content);
        console.log('Auto-saved file:', currentFile.name);
      }
    }, 800),
    [currentFile, updateFileContent]
  );
  
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    // Trigger auto-save with debounce
    debouncedSave(newCode);
  };
  
  // Optional: Handle code execution
  const handleRunCode = () => {
    // Implement your code execution logic here
    console.log('Running code:', code);
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {!currentFile ? (
        <Box 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 20, 25, 0.95)',
            borderRadius: 2
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
          >
            Select or create a file to start coding
          </Typography>
        </Box>
      ) : (
        <PythonEditor 
          code={code} 
          setCode={handleCodeChange} 
          onExecuteCode={handleRunCode}
        />
      )}
    </Box>
  );
};

export default MainEditor;