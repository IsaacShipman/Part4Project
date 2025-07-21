import React from 'react';
import { Typography, useTheme } from '@mui/material';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  const theme = useTheme();
  
  return (
    <Typography 
      sx={{ 
        color: theme.palette.error.main, 
        padding: '16px',
        textAlign: 'center',
        background: `${theme.palette.error.main}10`,
        border: `1px solid ${theme.palette.error.main}30`,
        borderRadius: '8px',
        margin: '8px'
      }}
    >
      Error loading API data: {message}
    </Typography>
  );
};