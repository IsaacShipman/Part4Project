import React, { useRef, useState } from 'react';
import { CssBaseline, ThemeProvider, AppBar, Toolbar, Typography, IconButton, Box, Button, Stack, Avatar } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { PlayArrow as PlayArrowIcon, Security as SecurityIcon, Code as CodeIcon, Science as ScienceIcon, Search as SearchIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
// Import view components
import MainView from './pages/MainView';
import SecurityScanView from './pages/SecurityScanView';
import APIRequestViewer from './pages/APIRequestViewer';

// Custom theme with dark colors inspired by the screenshots
const modernTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4A90E2',
      light: '#6BA3F0',
      dark: '#2E5A9E'
    },
    secondary: {
      main: '#00D4AA',
      light: '#33E0BB',
      dark: '#00A388'
    },
    background: {
      default: '#0D1421',
      paper: '#1E2A3A'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0BEC5'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700
  }
});

// Animated background component
const AnimatedBackground = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: -1,
        background: 'linear-gradient(135deg, #0D1421 0%, #1A2332 50%, #0F1B2A 100%)',
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          borderRadius: '50%',
          filter: 'blur(40px)',
          opacity: 0.6,
          animation: 'float 6s ease-in-out infinite'
        },
        '&::before': {
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(0, 212, 170, 0.3) 0%, rgba(0, 212, 170, 0.1) 50%, transparent 100%)',
          top: '-150px',
          left: '20%',
          animationDelay: '0s'
        },
        '&::after': {
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(74, 144, 226, 0.4) 0%, rgba(74, 144, 226, 0.1) 50%, transparent 100%)',
          top: '-100px',
          right: '30%',
          animationDelay: '3s'
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '33%': { transform: 'translateY(-20px) translateX(10px)' },
          '66%': { transform: 'translateY(10px) translateX(-10px)' }
        }
      }}
    />
  );
};

function App() {
  const executeCodeRef = useRef(() => {});
  const [currentView, setCurrentView] = useState('main');

  return (
    <ThemeProvider theme={modernTheme}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          background: 'rgba(13, 20, 33, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 1200 // Ensure AppBar stays on top
        }}
      >
        <AnimatedBackground />
        <Toolbar sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          padding: '0 24px',
          minHeight: '72px'
        }}>
          {/* Left section with logo and title */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4A90E2 0%, #00D4AA 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: '0 8px 32px rgba(74, 144, 226, 0.3)'
              }}
            >
              <ScienceIcon sx={{ fontSize: 28, color: 'white' }} />
            </Box>
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #B0BEC5 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px'
                }}
              >
                APILab 
              </Typography>
            
            </Box>
          </Box>

          {/* Center section with navigation */}
          <Box
            sx={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '4px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Button 
              startIcon={<CodeIcon />}
              onClick={() => setCurrentView('main')}
              sx={{ 
                color: currentView === 'main' ? '#FFFFFF' : '#B0BEC5',
                background: currentView === 'main' 
                  ? 'linear-gradient(135deg, #4A90E2 0%, #6BA3F0 100%)' 
                  : 'transparent',
                borderRadius: '12px',
                padding: '8px 20px',
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'none',
                minWidth: '120px',
                boxShadow: currentView === 'main' 
                  ? '0 4px 20px rgba(74, 144, 226, 0.4)' 
                  : 'none',
                '&:hover': { 
                  background: currentView === 'main'
                    ? 'linear-gradient(135deg, #4A90E2 0%, #6BA3F0 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-1px)',
                  boxShadow: currentView === 'main' 
                    ? '0 6px 25px rgba(74, 144, 226, 0.5)' 
                    : '0 2px 10px rgba(255, 255, 255, 0.1)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Editor
            </Button>
            <Button 
              startIcon={<SecurityIcon />}
              onClick={() => setCurrentView('security')}
              sx={{ 
                color: currentView === 'security' ? '#FFFFFF' : '#B0BEC5',
                background: currentView === 'security' 
                  ? 'linear-gradient(135deg, #00D4AA 0%, #33E0BB 100%)' 
                  : 'transparent',
                borderRadius: '12px',
                padding: '8px 20px',
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'none',
                minWidth: '120px',
                boxShadow: currentView === 'security' 
                  ? '0 4px 20px rgba(0, 212, 170, 0.4)' 
                  : 'none',
                '&:hover': { 
                  background: currentView === 'security'
                    ? 'linear-gradient(135deg, #00D4AA 0%, #33E0BB 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-1px)',
                  boxShadow: currentView === 'security' 
                    ? '0 6px 25px rgba(0, 212, 170, 0.5)' 
                    : '0 2px 10px rgba(255, 255, 255, 0.1)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Security
            </Button>
                 <Button 
              startIcon={<SecurityIcon />}
              onClick={() => setCurrentView('APIViewer')}
              sx={{ 
                color: currentView === 'APIViewer' ? '#FFFFFF' : '#B0BEC5',
                background: currentView === 'APIViewer' 
                  ? 'linear-gradient(135deg,rgb(116, 51, 90) 0%,rgb(164, 58, 240) 100%)' 
                  : 'transparent',
                borderRadius: '12px',
                padding: '8px 20px',
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'none',
                minWidth: '120px',
                boxShadow: currentView === 'APIViewer' 
                  ? '0 4px 20px rgba(0, 212, 170, 0.4)' 
                  : 'none',
                '&:hover': { 
                  background: currentView === 'APIViewer'
                    ? 'linear-gradient(135deg,rgb(116, 51, 90) 0%,rgb(164, 58, 240) 100%)' 
                  : 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-1px)',
                  boxShadow: currentView === 'APIViewer' 
                    ? '0 6px 25px rgba(0, 212, 170, 0.5)' 
                    : '0 2px 10px rgba(255, 255, 255, 0.1)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              API Viewer
            </Button>
          </Box>

          {/* Right section with action buttons and user info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
       

            {/* User Avatar */}
            <Avatar
              sx={{
                width: 44,
                height: 44,
                background: 'linear-gradient(135deg, #00D4AA 0%, #4A90E2 100%)',
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: '0 4px 20px rgba(0, 212, 170, 0.3)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 25px rgba(0, 212, 170, 0.4)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              U
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>


      {/* Render the appropriate view based on currentView state */}
      <Box sx={{ width: '100%', height: '100%' }}>
        {currentView === 'main' ? (
          <MainView onExecuteCode={(fn) => {
            executeCodeRef.current = fn;
          }} />
        ) : currentView === 'security' ? (
          <SecurityScanView />
        ) : (
          <APIRequestViewer />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;