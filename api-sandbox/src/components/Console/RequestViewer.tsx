import React, { useState } from 'react';
import { 
  Box, Typography, Button, ButtonGroup, 
  Paper, CircularProgress, Stack, useTheme, styled
} from '@mui/material';
import JsonViewer from './JsonViewer';

interface RequestViewerProps {
  loading: boolean;
  selectedApiResponse: { response: string } | null;
}

// Glassy container with backdrop blur effect
const GlassyPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(15, 20, 25, 0.9) 0%, rgba(26, 35, 50, 0.95) 100%)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  margin: '16px',
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100% - 32px)', // Full height minus margins
}));

// Header with gradient
const ViewerHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
  borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
  padding: '8px 16px',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.5) 50%, transparent 100%)',
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
  scrollbarColor: 'rgba(59, 130, 246, 0.3) transparent',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.4), rgba(16, 185, 129, 0.3))',
    borderRadius: '4px',
    border: '1px solid rgba(59, 130, 246, 0.2)',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.6), rgba(16, 185, 129, 0.4))',
  },
}));

const RequestViewer: React.FC<RequestViewerProps> = ({ loading, selectedApiResponse }) => {
  const theme = useTheme();
  const [view, setView] = useState<'headers' | 'body' | 'response'>('response');

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
              borderColor: 'rgba(59, 130, 246, 0.3)',
              color: 'rgba(255, 255, 255, 0.8)',
              '&.Mui-selected, &:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 0.5)',
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
              backgroundColor: view === 'headers' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              '&:hover': {
                backgroundColor: view === 'headers' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)'
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
              backgroundColor: view === 'body' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              '&:hover': {
                backgroundColor: view === 'body' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)'
              }
            }}
          >
            Body
          </Button>
          <Button 
            onClick={() => setView('response')}
            variant={view === 'response' ? 'contained' : 'outlined'}
            sx={{ 
              px: 1,
              backgroundColor: view === 'response' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              '&:hover': {
                backgroundColor: view === 'response' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)'
              }
            }}
          >
            Response
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
              background: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '8px',
              marginTop: '8px',
            }}
          >
            <CircularProgress 
              size={20} 
              sx={{ 
                color: '#3b82f6',
                filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.4))'
              }}
            />
            <Typography 
              variant="body2"
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 500,
              }}
            >
              Processing request...
            </Typography>
          </Stack>
        ) : selectedApiResponse ? (
          <Box
            sx={{
              height: '100%',
              overflow: 'auto',
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(15, 20, 25, 0.4) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderLeft: '3px solid rgba(59, 130, 246, 0.6)',
              borderRadius: '0 8px 8px 0',
              padding: '12px',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <JsonViewer data={selectedApiResponse.response} />
          </Box>
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              color: 'rgba(255, 255, 255, 0.6)',
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