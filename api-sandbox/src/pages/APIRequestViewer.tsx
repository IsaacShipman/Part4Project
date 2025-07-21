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
  background: theme.custom.colors.background.gradient,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  border: `1px solid ${theme.custom.colors.border.primary}`,
  height: '100%'
}));

const PageHeader = styled(Box)(({ theme }) => ({
  padding: '16px 24px',
  background: `linear-gradient(90deg, ${theme.custom.colors.primary}15 0%, ${theme.custom.colors.accent}10 100%)`,
  borderBottom: `1px solid ${theme.custom.colors.primary}20`,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: `linear-gradient(90deg, transparent 0%, ${theme.custom.colors.primary}40 50%, transparent 100%)`,
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
  
  // Debug logging
  if (selectedApiCall) {
    console.log('Selected API Call:', selectedApiCall);
  }

  return (
    <Box 
      sx={{ 
        padding: { xs: 2, md: 4 }, 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'calc(100vh - 72px)',
        mt: '64px',
        background: theme.custom.colors.background.gradient,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'dark'
            ? `radial-gradient(circle at 10% 30%, ${alpha(theme.custom.colors.primary, 0.1)} 0%, transparent 50%),
               radial-gradient(circle at 90% 40%, ${alpha(theme.custom.colors.accent, 0.1)} 0%, transparent 50%)`
            : `radial-gradient(circle at 10% 30%, ${alpha(theme.custom.colors.primary, 0.05)} 0%, transparent 50%),
               radial-gradient(circle at 90% 40%, ${alpha(theme.custom.colors.accent, 0.05)} 0%, transparent 50%)`,
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
                borderBottom: `1px solid ${theme.custom.colors.primary}20`,
                background: `linear-gradient(90deg, ${theme.custom.colors.primary}10 0%, ${theme.custom.colors.accent}05 100%)`,
              }}
            >
        
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto', p: 0 }}>
              {selectedApiCall ? (
                <Box sx={{ height: '100%' }}>
                  <EnhancedRequestViewer  
                    headers={selectedApiCall.headers || {}}
                    responseData={(() => {
                      try {
                        if (typeof selectedApiCall.response === 'string') {
                          return JSON.parse(selectedApiCall.response || '{}');
                        }
                        return selectedApiCall.response || {};
                      } catch (e) {
                        console.error('Error parsing response:', e);
                        return { error: 'Failed to parse response', raw: selectedApiCall.response };
                      }
                    })()}
                    requestData={(() => {
                      // Handle different possible request data structures
                      if (selectedApiCall.request?.json) return selectedApiCall.request.json;
                      if (selectedApiCall.request?.data) return selectedApiCall.request.data;
                      if (selectedApiCall.request_data) return selectedApiCall.request_data;
                      if (selectedApiCall.request_headers) return { headers: selectedApiCall.request_headers };
                      return null;
                    })()}
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
                  <Typography variant="h6" sx={{ mb: 1, color: theme.custom.colors.text.muted }}>
                    No Request Selected
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.custom.colors.text.muted }}>
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