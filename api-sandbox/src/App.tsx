import React, { useRef, useState } from 'react';
import { CssBaseline, ThemeProvider, AppBar, Toolbar, Typography, IconButton, Box, Button, Stack } from '@mui/material';
import { PlayArrow as PlayArrowIcon, Security as SecurityIcon, Code as CodeIcon, Science as ScienceIcon } from '@mui/icons-material';
import globalTheme from './themes/globalTheme';
import MainView from './pages/MainView';
import SecurityScanView from './pages/SecurityScanView';


function App() {
  const executeCodeRef = useRef<() => void>(() => {});
  const [currentView, setCurrentView] = useState<'main' | 'security'>('main');

  return (
    <ThemeProvider theme={globalTheme}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Left section with logo and title */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ScienceIcon sx={{ mr: 1.5, fontSize: 40 }} />
            <Typography variant="h4" sx={{ fontWeight: 'light' }}>
              APILab
            </Typography>
          </Box>

          {/* Center section with navigation */}
          <Stack direction="row" spacing={1}>
            <Button 
              color="inherit" 
              startIcon={<CodeIcon />}
              onClick={() => setCurrentView('main')}
              sx={{ 
                bgcolor: currentView === 'main' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' },
                // Consistent padding and dimensions
                padding: '6px 12px',
                minWidth: '100px'
              }}
            >
              Editor
            </Button>
            <Button 
              color="inherit" 
              startIcon={<SecurityIcon />}
              onClick={() => setCurrentView('security')}
              sx={{ 
                bgcolor: currentView === 'security' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' },
                // Consistent padding and dimensions
                padding: '6px 12px',
                minWidth: '100px'
              }}
            >
              Security
            </Button>
          </Stack>

          {/* Right section with action buttons */}
          <Box>
            <IconButton
              color="inherit"
              onClick={() => {
                if (executeCodeRef.current && currentView === 'main') {
                  executeCodeRef.current();
                }
              }}
              disabled={currentView !== 'main'}
              title="Run Code"
            >
              <PlayArrowIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      {currentView === 'main' ? (
        <MainView onExecuteCode={(fn) => (executeCodeRef.current = fn)} />
      ) : (
        <SecurityScanView />
      )}
    </ThemeProvider>
  );
}

export default App;