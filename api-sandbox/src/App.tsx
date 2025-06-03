import React, { useRef, useEffect, useState } from 'react';
import { CssBaseline, ThemeProvider, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import globalTheme from './themes/globalTheme';
import MainView from './pages/MainView';


function App() {
  const executeCodeRef = useRef<() => void>(() => {});

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
                executeCodeRef.current();
              }
            }}
          >
            <PlayArrowIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <MainView
        onExecuteCode={(fn) => (executeCodeRef.current = fn)}
      />
    </ThemeProvider>
  );
}

export default App;