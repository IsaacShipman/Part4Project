import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { Build as BuildIcon } from '@mui/icons-material';
import { PromptInputPanel } from '../components/EndpointGenerator';

const EndpointGenerator: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: '72px', // Account for AppBar height
        background: (theme) => theme.custom.colors.background.gradient,
        position: 'relative'
      }}
    >
      <Container maxWidth={false} disableGutters sx={{ py: 4, px: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              background: (theme) => `linear-gradient(135deg, ${theme.custom.colors.primary} 0%, ${theme.custom.colors.accent} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 3,
              boxShadow: (theme) => `0 8px 32px ${theme.custom.colors.primary}30`
            }}
          >
            <BuildIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700,
              color: (theme) => theme.custom.colors.text.primary,
            }}
          >
            Endpoint Explorer
          </Typography>
        </Box>

        {/* Main Content - Centered Layout */}
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Box sx={{ width: '100%', maxWidth: 1000 }}>
            <PromptInputPanel />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default EndpointGenerator;
