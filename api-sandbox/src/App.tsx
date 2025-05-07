import React, { useState, useEffect } from 'react';
import Split from 'react-split';
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Paper
} from '@mui/material';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import CodeEditor from './components/CodeEditor';
import ResponsePanel from './components/ResponsePanel';
import DocumentationPanel from './components/DocumentationPanel';
import FolderStructure from './components/FolderStructure';
import globalTheme from './themes/globalTheme';



function App() {
  const [code, setCode] = useState(`print("Hello, Pyodide!")`);
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [showDocs, setShowDocs] = useState(false);
  const [selectedEndpointId, setSelectedEndpointId] = useState<number | null>(null);

  useEffect(() => {
    async function loadPyodideLib() {
      try {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js";
        script.onload = async () => {
          try {
            const py = await window.loadPyodide();
            setPyodide(py);
            console.log("✅ Pyodide loaded");

            await py.loadPackage("micropip");

            await py.runPythonAsync(`
              import micropip
              try:
                  await micropip.install("requests")
                  print("✅ Requests installed successfully")
              except Exception as e:
                  print(f"❌ Failed to install requests: {e}")
              `);
          } catch (err) {
            console.error("Failed to load Pyodide:", err);
          }
        };
        document.body.appendChild(script);
      } catch (error) {
        console.error("Error setting up Pyodide:", error);
      }
    }
    loadPyodideLib();
  }, []);

  const handleExecuteCode = async () => {
    if (!pyodide) {
      setResponse("Error: Pyodide is not loaded yet.");
      return;
    }

    setLoading(true);
    try {
      pyodide.runPython(`
        import sys
        from io import StringIO
        sys.stdout = StringIO()
      `);

      const result = await pyodide.runPythonAsync(code);
      const stdout = pyodide.runPython("sys.stdout.getvalue()");
      const fullResponse = stdout + (result !== undefined ? "\nResult: " + result : "");
      setResponse(fullResponse);
    } catch (err) {
      setResponse("Error:\n" + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={globalTheme}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            API Sandbox
          </Typography>
          <IconButton color="inherit" onClick={handleExecuteCode}>
            <PlayArrowIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', pt: 8 }}>
        {/* Top Section: Split into two halves vertically */}
        <Split
          direction="vertical"
          sizes={[70, 30]}
          minSize={100}
          gutterSize={5}
          style={{ height: '100%' }}
        >
          {/* Upper Half: Folder Structure, Code Editor, and Response Panel */}
          <Split
            sizes={[20, 50, 30]}
            minSize={100}
            gutterSize={5}
            style={{ display: 'flex', height: '100%' }}
          >
            {/* Folder Structure */}
            <Paper 
              elevation={3} 
              sx={{ 
                overflow: 'auto',
                borderRadius: 0,
                m: 0,
              
              }}
            >
              <FolderStructure onSelectEndpoint={setSelectedEndpointId} />
            </Paper>

            {/* Code Editor */}
            <Paper 
              elevation={3} 
              sx={{ 
                overflow: 'hidden', // Prevent scrollbars from interfering
                borderRadius: 0,
                m: 0,
                height: '100%', // Ensure it takes up the full height
              }}
            >
              <CodeEditor code={code} setCode={setCode} />
            </Paper>

            {/* Response Panel */}
            <Paper 
              elevation={3} 
              sx={{ 
                overflow: 'auto',
                borderRadius: 0,
                m: 0
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Response
                </Typography>
                <ResponsePanel response={response} loading={loading} />
              </Box>
            </Paper>
          </Split>

          {/* Bottom Half: Documentation Panel (Console-like) */}
          <Paper 
            elevation={3} 
            sx={{ 
              display: 'flex', // Enable flex layout
              flexDirection: 'column', // Ensure children stack vertically
              flex: 1, // Allow this section to grow and fill available space
              overflow: 'hidden', // Prevent scrollbars from interfering
              backgroundColor: '#1e1e1e',
              borderTop: '1px solid #333',
              borderRadius: 0,
              m: 0
            }}
          >
            <Box 
              sx={{ 
                backgroundColor: '#2d2d2d', 
                p: 0.5, 
                pl: 2,
                borderBottom: '1px solid #333',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#cccccc' }}>
                DOCUMENTATION
              </Typography>
            </Box>
            
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {/* Documentation Panel */}
              <DocumentationPanel endpointId={selectedEndpointId} />
            </Box>
          </Paper>
        </Split>
      </Box>
    </ThemeProvider>
  );
}

export default App;