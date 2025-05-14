import React, { useRef, useEffect, useState } from 'react';
import { CssBaseline, ThemeProvider, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import globalTheme from './themes/globalTheme';
import MainView from './pages/MainView';


function App() {
  const executeCodeRef = useRef<() => void>(() => {});
  const [pyodide, setPyodide] = useState<any>(null); // State to store Pyodide instance

  useEffect(() => {
    async function loadPyodideLib() {
      try {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js";
        script.onload = async () => {
          try {
            const py = await (window as any).loadPyodide();
            setPyodide(py); // Store Pyodide instance in state
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


  return (
    <ThemeProvider theme={globalTheme}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            API Sandbox
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => {
              if (executeCodeRef.current) {
                executeCodeRef.current(); // Call the function from MainView
              }
            }}
          >
            <PlayArrowIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <MainView
        onExecuteCode={(fn) => (executeCodeRef.current = fn)}
        pyodide={pyodide} // Pass Pyodide instance to MainView
      />
    </ThemeProvider>
  );
}

export default App;