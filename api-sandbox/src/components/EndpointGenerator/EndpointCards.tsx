import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Card,
  CardContent
} from '@mui/material';
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
              {/* Header with method and confidence */}
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
    </Box>
  );
};

export default EndpointCards;
