import React, { useRef, useState } from 'react';
import { CssBaseline, AppBar, Toolbar, Typography, IconButton, Box, Button, Stack, Avatar, Menu, MenuItem } from '@mui/material';
import { PlayArrow as PlayArrowIcon, Security as SecurityIcon, Code as CodeIcon, Science as ScienceIcon, Search as SearchIcon, Notifications as NotificationsIcon, Visibility as VisibilityIcon, Api as ApiIcon, Build as BuildIcon, Dashboard as DashboardIcon } from '@mui/icons-material';
// Import view components
import MainView from './pages/MainView';
import SecurityScanView from './pages/SecurityScanView';
import APIRequestViewer from './pages/APIRequestViewer';
import APIVisualiser from './pages/APIVisualiser';
import EndpointGenerator from './pages/EndpointGenerator';
import DashboardView from './pages/DashboardView';
// Import theme components
import { ThemeProvider } from './contexts/ThemeContext';
import { LoggingProvider } from './contexts/LoggingContext';
import ThemeToggle from './components/ThemeToggle';

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
        background: (theme) => theme.custom.colors.background.gradient,
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
          background: (theme) => `radial-gradient(circle, ${theme.custom.colors.accent}30 0%, ${theme.custom.colors.accent}10 50%, transparent 100%)`,
          top: '-150px',
          left: '20%',
          animationDelay: '0s'
        },
        '&::after': {
          width: '200px',
          height: '200px',
          background: (theme) => `radial-gradient(circle, ${theme.custom.colors.primary}40 0%, ${theme.custom.colors.primary}10 50%, transparent 100%)`,
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleDashboardClick = () => {
    setCurrentView('dashboard');
    handleProfileClose();
  };

  return (
    <ThemeProvider>
      <LoggingProvider>
        <CssBaseline />
        <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          background: (theme) => `${theme.custom.colors.background.primary}95`,
          backdropFilter: 'blur(20px)',
          borderBottom: (theme) => `1px solid ${theme.custom.colors.border.primary}`,
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
                background: (theme) => `linear-gradient(135deg, ${theme.custom.colors.primary} 0%, ${theme.custom.colors.accent} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: (theme) => `0 8px 32px ${theme.custom.colors.primary}30`
              }}
            >
              <ScienceIcon sx={{ fontSize: 28, color: 'white' }} />
            </Box>
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  background: (theme) => `linear-gradient(135deg, ${theme.custom.colors.text.primary} 0%, ${theme.custom.colors.text.secondary} 100%)`,
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
              background: (theme) => `${theme.custom.colors.background.tertiary}50`,
              borderRadius: '16px',
              padding: '4px',
              border: (theme) => `1px solid ${theme.custom.colors.border.primary}`,
              backdropFilter: 'blur(10px)',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          >
            <Button 
              startIcon={<CodeIcon />}
              onClick={() => setCurrentView('main')}
              sx={{ 
                color: (theme) => currentView === 'main' ? theme.custom.colors.text.primary : theme.custom.colors.text.secondary,
                background: (theme) => currentView === 'main' 
                  ? `linear-gradient(135deg, ${theme.custom.colors.primary} 0%, ${theme.custom.colors.info} 100%)` 
                  : 'transparent',
                borderRadius: '12px',
                padding: '8px 20px',
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'none',
                minWidth: '120px',
                boxShadow: (theme) => currentView === 'main' 
                  ? `0 4px 20px ${theme.custom.colors.primary}40` 
                  : 'none',
                '&:hover': { 
                  background: (theme) => currentView === 'main'
                    ? `linear-gradient(135deg, ${theme.custom.colors.primary} 0%, ${theme.custom.colors.info} 100%)`
                    : `${theme.custom.colors.background.tertiary}50`,
                  transform: 'translateY(-1px)',
                  boxShadow: (theme) => currentView === 'main' 
                    ? `0 6px 25px ${theme.custom.colors.primary}50` 
                    : `0 2px 10px ${theme.custom.colors.border.primary}`
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
                color: (theme) => currentView === 'security' ? theme.custom.colors.text.primary : theme.custom.colors.text.secondary,
                background: (theme) => currentView === 'security' 
                  ? `linear-gradient(135deg, ${theme.custom.colors.accent} 0%, ${theme.custom.colors.success} 100%)` 
                  : 'transparent',
                borderRadius: '12px',
                padding: '8px 20px',
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'none',
                minWidth: '120px',
                boxShadow: (theme) => currentView === 'security' 
                  ? `0 4px 20px ${theme.custom.colors.accent}40` 
                  : 'none',
                '&:hover': { 
                  background: (theme) => currentView === 'security'
                    ? `linear-gradient(135deg, ${theme.custom.colors.accent} 0%, ${theme.custom.colors.success} 100%)`
                    : `${theme.custom.colors.background.tertiary}50`,
                  transform: 'translateY(-1px)',
                  boxShadow: (theme) => currentView === 'security' 
                    ? `0 6px 25px ${theme.custom.colors.accent}50` 
                    : `0 2px 10px ${theme.custom.colors.border.primary}`
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Security
            </Button>
            <Button 
              startIcon={<VisibilityIcon />}
              onClick={() => setCurrentView('APIViewer')}
              sx={{ 
                color: (theme) => currentView === 'APIViewer' ? theme.custom.colors.text.primary : theme.custom.colors.text.secondary,
                background: (theme) => currentView === 'APIViewer' 
                  ? `linear-gradient(135deg, ${theme.custom.colors.warning} 0%, ${theme.custom.colors.error} 100%)` 
                  : 'transparent',
                borderRadius: '12px',
                padding: '8px 20px',
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'none',
                minWidth: '120px',
                boxShadow: (theme) => currentView === 'APIViewer' 
                  ? `0 4px 20px ${theme.custom.colors.warning}40` 
                  : 'none',
                '&:hover': { 
                  background: (theme) => currentView === 'APIViewer'
                    ? `linear-gradient(135deg, ${theme.custom.colors.warning} 0%, ${theme.custom.colors.error} 100%)` 
                    : `${theme.custom.colors.background.tertiary}50`,
                  transform: 'translateY(-1px)',
                  boxShadow: (theme) => currentView === 'APIViewer' 
                    ? `0 6px 25px ${theme.custom.colors.warning}50` 
                    : `0 2px 10px ${theme.custom.colors.border.primary}`
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              API Viewer
            </Button>
            <Button 
              startIcon={<ApiIcon />}
              onClick={() => setCurrentView('APIVisualiser')}
              sx={{ 
                color: (theme) => currentView === 'APIVisualiser' ? theme.custom.colors.text.primary : theme.custom.colors.text.secondary,
                background: (theme) => currentView === 'APIVisualiser' 
                  ? `linear-gradient(135deg, ${theme.custom.colors.secondary} 0%, ${theme.custom.colors.accent} 100%)` 
                  : 'transparent',
                borderRadius: '12px',
                padding: '8px 20px',
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'none',
                minWidth: '120px',
                boxShadow: (theme) => currentView === 'APIVisualiser' 
                  ? `0 4px 20px ${theme.custom.colors.secondary}40` 
                  : 'none',
                '&:hover': { 
                  background: (theme) => currentView === 'APIVisualiser'
                    ? `linear-gradient(135deg, ${theme.custom.colors.secondary} 0%, ${theme.custom.colors.accent} 100%)` 
                    : `${theme.custom.colors.background.tertiary}50`,
                  transform: 'translateY(-1px)',
                  boxShadow: (theme) => currentView === 'APIVisualiser' 
                    ? `0 6px 25px ${theme.custom.colors.secondary}50` 
                    : `0 2px 10px ${theme.custom.colors.border.primary}`
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              API Visualiser
            </Button>
            <Button 
              startIcon={<BuildIcon />}
              onClick={() => setCurrentView('EndpointGenerator')}
              sx={{ 
                color: (theme) => currentView === 'EndpointGenerator' ? theme.custom.colors.text.primary : theme.custom.colors.text.secondary,
                background: (theme) => currentView === 'EndpointGenerator' 
                  ? `linear-gradient(135deg, ${theme.custom.colors.primary} 0%, ${theme.custom.colors.secondary} 100%)` 
                  : 'transparent',
                borderRadius: '12px',
                padding: '8px 20px',
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'none',
                minWidth: '120px',
                boxShadow: (theme) => currentView === 'EndpointGenerator' 
                  ? `0 4px 20px ${theme.custom.colors.primary}40` 
                  : 'none',
                '&:hover': { 
                  background: (theme) => currentView === 'EndpointGenerator'
                    ? `linear-gradient(135deg, ${theme.custom.colors.primary} 0%, ${theme.custom.colors.secondary} 100%)` 
                    : `${theme.custom.colors.background.tertiary}50`,
                  transform: 'translateY(-1px)',
                  boxShadow: (theme) => currentView === 'EndpointGenerator' 
                    ? `0 6px 25px ${theme.custom.colors.primary}50` 
                    : `0 2px 10px ${theme.custom.colors.border.primary}`
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Endpoint Explorer
            
            </Button>
          </Box>

          {/* Right section with action buttons and user info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Theme Toggle */}
            <ThemeToggle size="medium" />
            
            {/* User Avatar */}
            <Avatar
              onClick={handleProfileClick}
              sx={{
                width: 44,
                height: 44,
                background: (theme) => `linear-gradient(135deg, ${theme.custom.colors.accent} 0%, ${theme.custom.colors.primary} 100%)`,
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: (theme) => `0 4px 20px ${theme.custom.colors.accent}30`,
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: (theme) => `0 6px 25px ${theme.custom.colors.accent}40`
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              U
            </Avatar>
            
            {/* Profile Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileClose}
              PaperProps={{
                sx: {
                  background: (theme) => theme.custom.colors.background.secondary,
                  border: (theme) => `1px solid ${theme.custom.colors.border.primary}`,
                  borderRadius: '12px',
                  boxShadow: (theme) => `0 8px 32px ${theme.custom.colors.background.primary}50`,
                  mt: 1,
                  minWidth: 180
                }
              }}
            >
              <MenuItem 
                onClick={handleDashboardClick}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  color: (theme) => theme.custom.colors.text.primary,
                  '&:hover': {
                    background: (theme) => `${theme.custom.colors.primary}10`
                  }
                }}
              >
                <DashboardIcon />
                Dashboard
              </MenuItem>
            </Menu>
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
        ) : currentView === 'APIVisualiser' ? (
          <APIVisualiser />
        ) : currentView === 'EndpointGenerator' ? (
          <EndpointGenerator />
        ) : currentView === 'dashboard' ? (
          <DashboardView />
        ) : (
          <APIRequestViewer />
        )}
      </Box>
    </LoggingProvider>
    </ThemeProvider>
  );
}

export default App;