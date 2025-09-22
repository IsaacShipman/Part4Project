import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import { ContentCopy as CopyIcon } from '@mui/icons-material';
import { SimpleEndpoint, isValidEndpoint } from './simpleTypes';

interface EndpointCardsProps {
  endpoints: SimpleEndpoint[];
  selectedEndpointId?: string;
  onEndpointSelect?: (endpointId: string) => void;
}

const EndpointCards: React.FC<EndpointCardsProps> = ({
  endpoints,
  selectedEndpointId,
  onEndpointSelect
}) => {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const getMethodColor = (method: string) => {
    if (!method || typeof method !== 'string') {
      return '#6B7280'; // Default gray color for invalid methods
    }
    
    switch (method.toUpperCase()) {
      case 'GET': return '#10B981';
      case 'POST': return '#3B82F6';
      case 'PUT': return '#F59E0B';
      case 'DELETE': return '#EF4444';
      case 'PATCH': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const formatUrlPath = (url: string) => {
    return url.replace('https://api.github.com', '');
  };

  const formatUrlForPython = (url: string) => {
    // Format the URL in a way that's ready to paste into Python code
    return `"${url}"`;
  };

  const handleCopyUrl = async (url: string, endpointName: string, event: React.MouseEvent) => {
    // Prevent the card click event from firing
    event.stopPropagation();
    
    try {
      const formattedUrl = formatUrlForPython(url);
      await navigator.clipboard.writeText(formattedUrl);
      setCopyFeedback(`Copied ${endpointName} URL to clipboard`);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      setCopyFeedback('Failed to copy URL');
    }
  };

  const handleCloseFeedback = () => {
    setCopyFeedback(null);
  };

  if (endpoints.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '16px',
          background: (theme) => `${theme.custom?.colors?.background?.secondary || '#f5f5f5'}95`,
          backdropFilter: 'blur(10px)',
          border: (theme) => `1px solid ${theme.custom?.colors?.border?.primary || '#e0e0e0'}`,
          textAlign: 'center'
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: (theme) => theme.custom?.colors?.text?.secondary || '#666666',
            mb: 1
          }}
        >
          No endpoints generated yet
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: (theme) => theme.custom?.colors?.text?.secondary || '#666666'
          }}
        >
          Describe what you want to do with the API and we'll suggest relevant endpoints
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {endpoints
        .filter(isValidEndpoint) // Filter out any invalid endpoints
        .map((endpoint) => {
        const isSelected = selectedEndpointId === endpoint.id;
        
        // Provide fallbacks for potentially undefined values
        const method = endpoint.method || 'GET';
        const name = endpoint.name || 'Unknown Endpoint';
        const urlTemplate = endpoint.url_template || '';
        const description = endpoint.description || 'No description available';
        const confidence = typeof endpoint.confidence === 'number' ? endpoint.confidence : 0;

        return (
          <Card
            key={endpoint.id}
            onClick={() => onEndpointSelect?.(endpoint.id)}
            sx={{
              borderRadius: '16px',
              background: (theme) => `${theme.custom?.colors?.background?.secondary || '#f5f5f5'}95`,
              backdropFilter: 'blur(10px)',
              border: (theme) => `1px solid ${
                isSelected 
                  ? theme.custom?.colors?.primary || '#1976d2'
                  : theme.custom?.colors?.border?.primary || '#e0e0e0'
              }`,
              boxShadow: isSelected ? 
                (theme) => `0 0 0 2px ${theme.custom?.colors?.primary || '#1976d2'}30` : 
                '0 2px 8px rgba(0,0,0,0.1)',
              cursor: onEndpointSelect ? 'pointer' : 'default',
              transition: 'all 0.2s ease-in-out',
              '&:hover': onEndpointSelect ? {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
              } : {}
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {/* Header with method and copy button */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Chip
                  label={method}
                  size="small"
                  sx={{
                    backgroundColor: getMethodColor(method),
                    color: 'white',
                    fontWeight: 600,
                    minWidth: '60px'
                  }}
                />
                <Tooltip title="Copy URL for Python code">
                  <IconButton
                    size="small"
                    onClick={(event) => handleCopyUrl(urlTemplate, name, event)}
                    sx={{
                      color: (theme) => theme.custom?.colors?.text?.secondary || '#666666',
                      '&:hover': {
                        backgroundColor: (theme) => `${theme.custom?.colors?.primary || '#1976d2'}15`,
                        color: (theme) => theme.custom?.colors?.primary || '#1976d2'
                      }
                    }}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Endpoint name */}
              <Typography
                variant="h6"
                sx={{
                  color: (theme) => theme.custom?.colors?.text?.primary || '#000000',
                  fontWeight: 600,
                  mb: 1
                }}
              >
                {name}
              </Typography>

              {/* URL Path */}
              <Typography
                variant="body2"
                sx={{
                  color: (theme) => theme.custom?.colors?.text?.secondary || '#666666',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  backgroundColor: (theme) => `${theme.custom?.colors?.background?.tertiary || '#eeeeee'}50`,
                  p: 1,
                  borderRadius: '4px',
                  mb: 2,
                  wordBreak: 'break-all'
                }}
              >
                {formatUrlPath(urlTemplate)}
              </Typography>

              {/* Description */}
              <Typography
                variant="body2"
                sx={{
                  color: (theme) => theme.custom?.colors?.text?.secondary || '#666666',
                  lineHeight: 1.5
                }}
              >
                {description}
              </Typography>
            </CardContent>
          </Card>
        );
      })}
      
      {/* Copy feedback snackbar */}
      <Snackbar
        open={!!copyFeedback}
        autoHideDuration={3000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseFeedback} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {copyFeedback}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EndpointCards;
