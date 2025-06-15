import React, { useState, useEffect } from 'react';
import { Box, Typography, Divider, useTheme, Paper, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import RequestPanel from '../components/RequestPanel/RequestPanel';
import JsonViewer from '../components/Console/JsonViewer';
import EnhancedRequestViewer from '../components/APIRequestViewer/JsonViewerImproved';
import { loadApiCalls } from '../utils/localStorageUtils';
import { ApiCall } from '../types/api';

// Glass-like container with backdrop blur
const GlassContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(15, 20, 25, 0.8) 0%, rgba(26, 35, 50, 0.85) 100%)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  height: '100%'
}));

const PageHeader = styled(Box)(({ theme }) => ({
  padding: '16px 24px',
  background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
  borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.4) 50%, transparent 100%)',
  }
}));

function APIRequestViewer() {
  const theme = useTheme();
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([]);
  const [selectedRequestIndex, setSelectedRequestIndex] = useState<number | null>(null);
  const [isRequestPanelOpen, setIsRequestPanelOpen] = useState(true);

  // Load saved API calls on component mount
  useEffect(() => {
    const savedCalls = loadApiCalls();
    if (savedCalls.length > 0) {
      setApiCalls(savedCalls);
    }
  }, []);

  // Convert API calls to request format for RequestPanel
  const requestSummaries = apiCalls.map(call => ({
    method: call.method,
    url: call.url,
    status: call.status || 0,
  }));

  const selectedApiCall = selectedRequestIndex !== null ? apiCalls[selectedRequestIndex] : null;

  return (
    <Box 
      sx={{ 
        padding: { xs: 2, md: 4 }, 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'calc(100vh - 72px)',
        mt: '64px',
        background: `linear-gradient(135deg, 
          ${theme.palette.background.default} 0%, 
          ${alpha(theme.palette.background.paper, 0.8)} 50%,
          ${theme.palette.background.default} 100%)`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 10% 30%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
                       radial-gradient(circle at 90% 40%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%)`,
          pointerEvents: 'none',
          zIndex: -1,
        }
      }}
    >
    
       

      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: '360px 1fr',
          gap: 3,
          flex: 1,
          overflow: 'hidden'
        }}
      >
        {/* Left panel - API Request List */}
        <GlassContainer>
          <RequestPanel
            setIsOpen={setIsRequestPanelOpen}
            requests={requestSummaries}
            onSelectRequest={setSelectedRequestIndex}
            selectedIndex={selectedRequestIndex}
            apiCalls={apiCalls}
            isOpen={isRequestPanelOpen}
          />
        </GlassContainer>

        {/* Right panel - API Response Viewer */}
        <GlassContainer>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box 
              sx={{ 
                p: 2, 
                borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
                background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
              }}
            >
        
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto', p: 0 }}>
              {selectedApiCall ? (
                <Box sx={{ height: '100%' }}>
                  <EnhancedRequestViewer  
                    headers={selectedApiCall.headers || {}}
                    responseData={typeof selectedApiCall.response === 'string' 
                      ? JSON.parse(selectedApiCall.response || '{}') 
                      : selectedApiCall.response || {}}
                    requestData={selectedApiCall.request?.json || selectedApiCall.request?.data || null}
                    statusCode={selectedApiCall.status || 200}
                    url={selectedApiCall.url || ''}
                    method={selectedApiCall.method || 'GET'}
                  />
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    p: 3,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
                    No Request Selected
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Select a request from the left panel to view detailed information about the request and response.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </GlassContainer>
      </Box>
    </Box>
  );
}

export default APIRequestViewer;