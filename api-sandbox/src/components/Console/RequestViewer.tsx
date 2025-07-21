import React, { useState } from 'react';
import { 
  Box, Typography, Button, ButtonGroup, 
  Paper, CircularProgress, Stack, useTheme, styled
} from '@mui/material';
import JsonViewer from './JsonViewerOptimized';
import { ApiCall } from '../../types/api';

interface RequestViewerProps {
  loading: boolean;
  selectedApiCall: ApiCall | null;
}

// Glassy container with backdrop blur effect
const GlassyPaper = styled(Paper)(({ theme }) => ({
  background: theme.custom.colors.background.gradient,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${theme.custom.colors.border.primary}`,
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  margin: '16px',
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100% - 32px)', // Full height minus margins
}));

// Header with gradient
const ViewerHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.custom.colors.primary}20 0%, ${theme.custom.colors.accent}15 100%)`,
  borderBottom: `1px solid ${theme.custom.colors.primary}30`,
  padding: '8px 16px',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: `linear-gradient(90deg, transparent 0%, ${theme.custom.colors.primary}50 50%, transparent 100%)`,
  }
}));

// Content area with custom scrollbar
const ViewerContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  height: '100%',
  maxHeight: '100%',
  padding: '16px',
  scrollbarWidth: 'thin',
  scrollbarColor: `${theme.custom.colors.primary}30 transparent`,
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: `linear-gradient(180deg, ${theme.custom.colors.primary}40, ${theme.custom.colors.accent}30)`,
    borderRadius: '4px',
    border: `1px solid ${theme.custom.colors.primary}20`,
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: `linear-gradient(180deg, ${theme.custom.colors.primary}60, ${theme.custom.colors.accent}40)`,
  },
}));

const RequestViewer: React.FC<RequestViewerProps> = ({ loading, selectedApiCall }) => {
  const theme = useTheme();
  const [view, setView] = useState<'headers' | 'body'>('body');

  // Format JSON data for display
  const formatJson = (obj: any): string => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  // Get content based on selected view
  const getContent = () => {
    if (!selectedApiCall) return null;

    switch (view) {
      case 'headers':
        return formatJson(selectedApiCall.headers || {});
      case 'body':
        return formatJson(selectedApiCall.response || 
                          '');
      default:
        return '';
    }
  };

  return (
    <GlassyPaper elevation={0}>
      <ViewerHeader>
        <ButtonGroup 
          size="small" 
          variant="outlined" 
          aria-label="view selector"
          sx={{ 
            minHeight: 28,
            '.MuiButton-root': {
              borderColor: `${theme.custom.colors.primary}30`,
              color: theme.custom.colors.text.secondary,
              '&.Mui-selected, &:hover': {
                backgroundColor: `${theme.custom.colors.primary}20`,
                borderColor: `${theme.custom.colors.primary}50`,
              }
            }
          }}
          fullWidth
        >
          <Button 
            onClick={() => setView('headers')}
            variant={view === 'headers' ? 'contained' : 'outlined'}
            sx={{ 
              px: 1,
              backgroundColor: view === 'headers' ? `${theme.custom.colors.primary}20` : 'transparent',
              '&:hover': {
                backgroundColor: view === 'headers' ? `${theme.custom.colors.primary}30` : `${theme.custom.colors.primary}10`
              }
            }}
          >
            Headers
          </Button>
          <Button 
            onClick={() => setView('body')}
            variant={view === 'body' ? 'contained' : 'outlined'}
            sx={{ 
              px: 1,
              backgroundColor: view === 'body' ? `${theme.custom.colors.primary}20` : 'transparent',
              '&:hover': {
                backgroundColor: view === 'body' ? `${theme.custom.colors.primary}30` : `${theme.custom.colors.primary}10`
              }
            }}
          >
            Body
          </Button>
        
        </ButtonGroup>
      </ViewerHeader>

      <ViewerContent>
        {loading ? (
          <Stack 
            direction="row" 
            alignItems="center" 
            spacing={1}
            sx={{
              padding: '12px',
              background: `transparent`,
              border: `1px solid ${theme.custom.colors.primary}20`,
              borderRadius: '8px',
              marginTop: '8px',
            }}
          >
            <CircularProgress 
              size={20} 
              sx={{ 
                color: theme.custom.colors.primary,
                filter: `drop-shadow(0 0 4px ${theme.custom.colors.primary}40)`
              }}
            />
            <Typography 
              variant="body2"
              sx={{ 
                color: theme.custom.colors.text.secondary,
                fontWeight: 500,
              }}
            >
              Processing request...
            </Typography>
          </Stack>
        ) : selectedApiCall ? (
          <Box
            sx={{
              height: '100%',
              overflow: 'auto',
              background: 'transparent',
              borderRadius: '0 8px 8px 0',
              padding: '12px',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <JsonViewer data={getContent()} />
          </Box>
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              color: theme.custom.colors.text.muted,
            }}
          >
            <Typography 
              variant="body2"
              sx={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                fontWeight: 500,
              }}
            >
              Select a request to view response
            </Typography>
          </Box>
        )}
      </ViewerContent>
    </GlassyPaper>
  );
};

export default RequestViewer;