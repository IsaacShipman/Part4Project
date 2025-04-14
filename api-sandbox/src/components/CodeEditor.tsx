import React from 'react';
import Editor from '@monaco-editor/react';
import { Box, CircularProgress } from '@mui/material';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange }) => {
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Editor
        height="65vh"
        defaultLanguage="python"
        defaultValue={value}
        onChange={(value) => onChange(value || '')}
        theme="vs-dark"
        loading={<CircularProgress />}
        options={{
          minimap: { enabled: true },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          formatOnPaste: true,
          tabSize: 2,
          wordWrap: 'on',
        }}
      />
    </Box>
  );
};

export default CodeEditor;