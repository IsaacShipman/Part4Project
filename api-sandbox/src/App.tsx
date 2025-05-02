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
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import CodeEditor from './components/CodeEditor';
import ResponsePanel from './components/ResponsePanel';
import DocumentationPanel from './components/DocumentationPanel';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' },
  },
});

function App() {
  const [code, setCode] = useState(`print("Hello, Pyodide!")`);
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [showDocs, setShowDocs] = useState(false);

  // Load Pyodide on component mount
  useEffect(() => {
    async function loadPyodideLib() {
      try {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
        script.onload = async () => {
          try {
            const py = await window.loadPyodide();
            setPyodide(py);
            console.log("✅ Pyodide loaded");

            await py.loadPackage("micropip");

            // Load requests package 
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
      // Redirect sys.stdout to capture print() output
      pyodide.runPython(`
        import sys
        from io import StringIO
        sys.stdout = StringIO()
      `);

      // Execute the Python code
      const result = await pyodide.runPythonAsync(code);
      
      // Retrieve the captured stdout content
      const stdout = pyodide.runPython("sys.stdout.getvalue()");
      
      // Combine the result and stdout
      const fullResponse = stdout + (result !== undefined ? "\nResult: " + result : "");
      setResponse(fullResponse);
    } catch (err) {
      setResponse("Error:\n" + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
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

      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', mt: 8 }}>
        <Split
          direction="vertical"
          sizes={showDocs ? [75, 25] : [100, 0]}
          minSize={0}
          expandToMin={false}
          gutterSize={6}
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          {/* Top Section: Main App */}
          <Split
            className="split-horizontal"
            sizes={[15, 60, 25]}
            minSize={150}
            gutterSize={10}
            direction="horizontal"
            style={{ display: 'flex', height: '100%' }}
          >
            {/* Sidebar */}
            <Box sx={{ p: 1, backgroundColor: '#1e1e1e' }}>
              <List>
                <ListItemButton onClick={() => setShowDocs(prev => !prev)}>
                  <ListItemIcon><DescriptionIcon /></ListItemIcon>
                  <ListItemText primary="Docs" />
                </ListItemButton> 
              </List>
            </Box>

            {/* Code Editor */}
            <Box sx={{ p: 1 }}>
              <Paper elevation={3} sx={{ height: '100%', p: 2 }}>
                <CodeEditor code={code} setCode={setCode} />
              </Paper>
            </Box>

            {/* Response Panel */}
            <Box sx={{ p: 1 }}>
              <Paper elevation={3} sx={{ height: '100%', p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Response
                </Typography>
                <ResponsePanel response={response} loading={loading} />
              </Paper>
            </Box>
          </Split>

          {/* Bottom Section: Documentation */}
          <Box sx={{ p: 1 }}>
            {showDocs && (
              <Paper elevation={3} sx={{ height: '100%', p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Documentation
                </Typography>
                <DocumentationPanel />
              </Paper>
            )}
          </Box>
        </Split>
      </Box>
    </ThemeProvider>
  );
}

export default App;