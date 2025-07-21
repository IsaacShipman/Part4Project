import React from 'react';
import { IconButton, Tooltip, useTheme as useMuiTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  size = 'medium', 
  showTooltip = true 
}) => {
  const { mode, toggleTheme } = useTheme();
  const theme = useMuiTheme();

  const handleToggle = () => {
    toggleTheme();
  };

  const icon = mode === 'dark' ? <Brightness7 /> : <Brightness4 />;
  const tooltipText = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  const button = (
    <IconButton
      onClick={handleToggle}
      size={size}
      sx={{
        color: theme.custom.colors.text.secondary,
        '&:hover': {
          color: theme.custom.colors.primary,
          backgroundColor: theme.custom.colors.background.tertiary,
        },
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {icon}
    </IconButton>
  );

  if (showTooltip) {
    return (
      <Tooltip title={tooltipText} placement="bottom">
        {button}
      </Tooltip>
    );
  }

  return button;
};

export default ThemeToggle; 