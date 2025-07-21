import React from 'react';
import { Box, CircularProgress, useTheme } from '@mui/material';

export const LoadingSpinner: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
      <CircularProgress 
        sx={{ 
          color: theme.custom.colors.primary,
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round'
          }
        }} 
      />
    </Box>
  );
};

// 8. components/ErrorMessage.tsx - Error component
