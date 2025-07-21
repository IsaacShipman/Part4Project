import { SxProps, Theme } from '@mui/material';

export const containerStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  background: (theme) => theme.custom.colors.background.gradient,
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: (theme) => `1px solid ${theme.custom.colors.border.primary}`,
  boxShadow: (theme) => theme.palette.mode === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: (theme) => theme.palette.mode === 'dark'
      ? `
        radial-gradient(circle at 60% 60%, rgba(16, 185, 129, 0.05) 0%, transparent 40%),
        radial-gradient(circle at 30% 90%, rgba(6, 95, 70, 0.08) 0%, transparent 30%)
      `
      : `
        radial-gradient(circle at 60% 60%, rgba(16, 185, 129, 0.03) 0%, transparent 40%),
        radial-gradient(circle at 30% 90%, rgba(6, 95, 70, 0.05) 0%, transparent 30%)
      `,
    borderRadius: '16px',
    pointerEvents: 'none',
    zIndex: 1,
    animation: 'subtleFloat 8s ease-in-out infinite'
  },
  '@keyframes subtleFloat': {
    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
    '50%': { transform: 'translateY(-3px) rotate(0.5deg)' }
  }
};

export const listStyles: SxProps<Theme> = {
  width: '100%',
  height: '100%',
  padding: '4px 0',
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px'
  },
  '&::-webkit-scrollbar-track': {
    background: (theme) => theme.custom.colors.border.subtle,
    borderRadius: '3px'
  },
  '&::-webkit-scrollbar-thumb': {
    background: (theme) => theme.custom.colors.border.secondary,
    borderRadius: '3px',
    '&:hover': {
      background: (theme) => theme.custom.colors.border.primary,
    }
  }
};

// These are now deprecated - use theme.custom.glass and theme.custom.glassCard instead
export const glassStyles = {
  background: 'rgba(15, 23, 42, 0.7)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(148, 163, 184, 0.1)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
};

export const glassCardStyles = {
  background: 'rgba(30, 41, 59, 0.6)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(148, 163, 184, 0.1)',
  borderRadius: '12px',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
};