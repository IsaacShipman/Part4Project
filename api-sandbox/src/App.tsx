import React, { useState } from 'react';
import { CssBaseline, ThemeProvider, AppBar, Toolbar, Typography, IconButton, Button } from '@mui/material';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import globalTheme from './themes/globalTheme';
import MainView from './pages/MainView';
import SecurityScanView from './pages/SecurityScanView';

function App() {
  const [activeView, setActiveView] = useState<'main' | 'security'>('main');

  return (
    <ThemeProvider theme={globalTheme}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            API Sandbox
          </Typography>
          <Button
            color="inherit"
            variant="outlined"
            sx={{
              alignSelf: 'center',
     

            }}
            onClick={() => setActiveView(activeView === 'main' ? 'security' : 'main')}
          >
            {activeView === 'main' ? 'Security Scan' : 'Main View'}
          </Button>
          <IconButton color="inherit">
            <PlayArrowIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      {activeView === 'main' ? <MainView /> : <SecurityScanView />}
    </ThemeProvider>
  );
}

export default App;