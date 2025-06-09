import React from 'react';
import { Box, CircularProgress } from '@mui/material';

export const LoadingSpinner: React.FC = () => (
  <Box display="flex" justifyContent="center" alignItems="center" height="200px">
    <CircularProgress 
      sx={{ 
        color: '#60a5fa',
        '& .MuiCircularProgress-circle': {
          strokeLinecap: 'round'
        }
      }} 
    />
  </Box>
);

// 8. components/ErrorMessage.tsx - Error component
