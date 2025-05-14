import React, { useState } from 'react';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import { ChevronRight as ChevronRightIcon, ChevronLeft as ChevronLeftIcon } from '@mui/icons-material';

interface RequestPanelProps {
  setIsOpen: (isOpen: boolean) => void;
}

const RequestPanel: React.FC<RequestPanelProps> = ({ setIsOpen }) => {
  const [isOpen, setPanelOpen] = useState(false);

  const togglePanel = () => {
    const newState = !isOpen;
    setPanelOpen(newState);
    setIsOpen(newState); // Notify parent component
  };

  return (
    <Box
      sx={{
        position: 'relative', // Enable positioning for the chevron
        display: 'flex',
        flex: 1,
        height: '100%',
        backgroundColor: '#2d2d2d',
        borderLeft: '1px solid #333',
        width: isOpen ? '500px' : '5px', // Adjust width based on state
      }}
    >
      {/* Chevron Icon */}
      <IconButton
        onClick={togglePanel}
        sx={{
          position: 'absolute', // Position the chevron on top
          top: 8, // Adjust vertical position
          left: -20, // Adjust horizontal position to sit outside the panel
          backgroundColor: '#2d2d2d',
          color: '#cccccc',
          border: '1px solid #333',
          zIndex: 10, // Ensure it appears above other elements
          '&:hover': {
            backgroundColor: '#3a3a3a',
          },
        }}
      >
        {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </IconButton>

      {/* Panel Content */}
      <Paper
        elevation={3}
        sx={{
          flex: 1,
          padding: 2,
          backgroundColor: '#2d2d2d',
          color: '#ffffff',
          overflow: 'auto',
          borderRadius: 0,
          width: "100%"
     
        }}
      >
        {isOpen && (
          <>
            <Typography variant="h6" sx={{ marginBottom: 1 }}>
              Request Panel
            </Typography>
            <Typography variant="body2">
              This is the content of the request panel.
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default RequestPanel;