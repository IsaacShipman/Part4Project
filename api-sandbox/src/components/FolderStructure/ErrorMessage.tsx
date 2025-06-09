import React from 'react';
import { Typography } from '@mui/material';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <Typography 
    sx={{ 
      color: '#f87171', 
      padding: '16px',
      textAlign: 'center',
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '8px',
      margin: '8px'
    }}
  >
    Error loading API data: {message}
  </Typography>
);