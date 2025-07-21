import React, { useEffect } from 'react';
import {
  Box, ListItem, ListItemButton, Typography, Chip,
  IconButton, Collapse, Divider, useTheme
} from '@mui/material';
import {
  ExpandMore, ChevronRight, AccessTime, Code
} from '@mui/icons-material';
import { ApiCall, RequestSummary } from '../../types/api';
import RequestDetails from './RequestDetails';
import { getMethodColor, getStatusColor } from './RequestPanel';

interface RequestItemProps {
  request: RequestSummary;
  apiCall?: ApiCall;
  index: number;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleDetails: () => void;
  isLast: boolean;
}

const RequestItem: React.FC<RequestItemProps> = ({
  request,
  apiCall,
  index,
  isSelected,
  isExpanded,
  onSelect,
  onToggleDetails,
  isLast
}) => {
  const theme = useTheme();

  useEffect(() => {
        console.log('RequestDetails apiCall:', apiCall);
    console.log('Response data:', apiCall?.response);
    console.log('Response headers:', apiCall?.headers);
  }, [apiCall]);

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  const truncateUrl = (url: string, maxLength: number = 50): string => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  const itemStyles = {
    listItem: {
      backgroundColor: isSelected 
        ? `${theme.custom.colors.primary}10` 
        : 'transparent',
      borderLeft: isSelected 
        ? `3px solid ${theme.custom.colors.primary}` 
        : '3px solid transparent',
      transition: 'all 0.2s ease',
      // Override the global MuiListItem hover styles
      '&:hover': {
        backgroundColor: 'transparent !important',
      },
    },
    
    listButton: {
      py: 1.5,
      px: 2,
      transition: 'all 0.2s ease',
      borderRadius: '8px',
      margin: '2px 8px',
      '&:hover': {
        backgroundColor: `${theme.custom.colors.background.tertiary}60`,
        transform: 'translateY(-1px)',
        boxShadow: `0 2px 8px ${theme.custom.colors.border.primary}`,
      },
    },

    chipContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      mb: 1,
      flexWrap: 'wrap',
    },

    methodChip: {
      background: getMethodColor(request.method),
      color: '#ffffff',
      fontWeight: 700,
      fontSize: '0.7rem',
      minWidth: '50px',
      height: '24px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    },

    statusChip: {
      background: getStatusColor(request.status),
      color: '#ffffff',
      fontWeight: 700,
      fontSize: '0.7rem',
      height: '24px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    },

    lineChip: {
      color: theme.custom.colors.text.muted,
      borderColor: theme.custom.colors.border.secondary,
      fontSize: '0.6rem',
      height: '22px',
      background: `${theme.custom.colors.text.muted}05`,
      '&:hover': {
        background: `${theme.custom.colors.text.muted}10`,
      },
    },

    urlText: {
      color: theme.custom.colors.text.primary,
      fontFamily: theme.custom.terminal.fontFamily,
      fontSize: '0.8rem',
      wordBreak: 'break-all' as const,
      lineHeight: 1.4,
    },

    timestampContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
      mt: 0.5,
    },

    timestampIcon: {
      fontSize: '0.7rem',
      color: theme.custom.colors.text.muted,
    },

    timestampText: {
      color: theme.custom.colors.text.muted,
      fontSize: '0.7rem',
      fontFamily: theme.custom.terminal.fontFamily,
    },

    expandButton: {
      color: theme.custom.colors.text.muted,
      p: 1,
      transition: 'all 0.2s ease',
      '&:hover': {
        color: theme.custom.colors.text.primary,
        background: `${theme.custom.colors.text.muted}10`,
      },
    },

    divider: {
      borderColor: theme.custom.colors.border.secondary,
    },
  };

  return (
    <Box>
      <ListItem disablePadding sx={itemStyles.listItem}>
        <ListItemButton onClick={onSelect} sx={itemStyles.listButton}>
          <Box sx={{ width: '100%' }}>
            {/* Method, Status, and Line chips */}
            <Box sx={itemStyles.chipContainer}>
              <Chip
                label={request.method}
                size="small"
                sx={itemStyles.methodChip}
              />
              <Chip
                label={request.status}
                size="small"
                sx={itemStyles.statusChip}
              />
              {apiCall?.line && (
                <Chip
                  icon={<Code sx={{ fontSize: '0.7rem' }} />}
                  label={`L${apiCall.line}`}
                  size="small"
                  variant="outlined"
                  sx={itemStyles.lineChip}
                />
              )}
            </Box>

            {/* URL */}
            <Typography variant="body2" sx={itemStyles.urlText}>
              {truncateUrl(request.url, 50)}
            </Typography>

            {/* Timestamp */}
            {apiCall && (
              <Box sx={itemStyles.timestampContainer}>
                <AccessTime sx={itemStyles.timestampIcon} />
                <Typography variant="caption" sx={itemStyles.timestampText}>
                  {formatTimestamp(apiCall.timestamp)}
                </Typography>
              </Box>
            )}
          </Box>
        </ListItemButton>

        {/* Expand/Collapse button */}
        {apiCall && (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onToggleDetails();
            }}
            sx={itemStyles.expandButton}
          >
            {isExpanded ? <ExpandMore /> : <ChevronRight />}
          </IconButton>
        )}
      </ListItem>

      {/* Expanded Details */}
      {apiCall && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <RequestDetails apiCall={apiCall} />
        </Collapse>
      )}

      {!isLast && <Divider sx={itemStyles.divider} />}
    </Box>
  );
};

export default RequestItem;