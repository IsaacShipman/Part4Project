import React from 'react';
import { Box, useTheme } from '@mui/material';
import { DashboardMain } from '../components/Dashboard';
import { useLogging } from '../contexts/LoggingContext';

const DashboardView: React.FC = () => {
  const theme = useTheme();
  const { state } = useLogging();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.custom.colors.background.gradient,
        position: 'relative'
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: -1,
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            borderRadius: '50%',
            filter: 'blur(60px)',
            opacity: 0.4,
            animation: 'float 8s ease-in-out infinite'
          },
          '&::before': {
            width: '400px',
            height: '400px',
            background: `radial-gradient(circle, ${theme.custom.colors.primary}20 0%, ${theme.custom.colors.primary}05 50%, transparent 100%)`,
            top: '10%',
            left: '10%',
            animationDelay: '0s'
          },
          '&::after': {
            width: '300px',
            height: '300px',
            background: `radial-gradient(circle, ${theme.custom.colors.accent}25 0%, ${theme.custom.colors.accent}05 50%, transparent 100%)`,
            bottom: '10%',
            right: '10%',
            animationDelay: '4s'
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) translateX(0px) scale(1)' },
            '33%': { transform: 'translateY(-30px) translateX(20px) scale(1.1)' },
            '66%': { transform: 'translateY(20px) translateX(-20px) scale(0.9)' }
          }
        }}
      />
      
      <DashboardMain />
    </Box>
  );
};

export default DashboardView;
