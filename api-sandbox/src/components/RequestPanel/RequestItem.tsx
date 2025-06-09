import React from 'react';
import {
  Box, ListItem, ListItemButton, Typography, Chip,
  IconButton, Collapse, Divider, useTheme
} from '@mui/material';
import {
  ExpandMore, ChevronRight, AccessTime, Code
} from '@mui/icons-material';
import { ApiCall, RequestSummary } from '../../types/api';
import RequestDetails from './RequestDetails';
import { listStyles, glassCardStyles } from '../../styles/containerStyles';
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
        ? 'rgba(59, 130, 246, 0.1)' 
        : 'transparent',
      borderLeft: isSelected 
        ? '3px solid #3b82f6' 
        : '3px solid transparent',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: 'rgba(148, 163, 184, 0.05)',
      },
    },
    
    listButton: {
      py: 1.5,
      px: 2,
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: 'rgba(148, 163, 184, 0.08)',
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
      color: '#94a3b8',
      borderColor: 'rgba(148, 163, 184, 0.3)',
      fontSize: '0.6rem',
      height: '22px',
      background: 'rgba(148, 163, 184, 0.05)',
      '&:hover': {
        background: 'rgba(148, 163, 184, 0.1)',
      },
    },

    urlText: {
      color: '#e2e8f0',
      fontFamily: '"Fira Code", "Monaco", "Cascadia Code", "Roboto Mono", monospace',
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
      color: '#64748b',
    },

    timestampText: {
      color: '#64748b',
      fontSize: '0.7rem',
      fontFamily: '"Fira Code", "Monaco", "Cascadia Code", "Roboto Mono", monospace',
    },

    expandButton: {
      color: '#94a3b8',
      p: 1,
      transition: 'all 0.2s ease',
      '&:hover': {
        color: '#e2e8f0',
        background: 'rgba(148, 163, 184, 0.1)',
      },
    },

    divider: {
      borderColor: 'rgba(148, 163, 184, 0.1)',
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