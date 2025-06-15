import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, List, IconButton, useTheme } from '@mui/material';
import { ChevronRight, ChevronLeft, DataObject, NetworkCheck } from '@mui/icons-material';
import { ApiCall } from '../../types/api';
import { RequestSummary } from '../../types/api';
import RequestItem from './RequestItem';
import { containerStyles, listStyles, glassCardStyles } from '../../styles/containerStyles';

interface RequestPanelProps {
  setIsOpen: (isOpen: boolean) => void;
  requests: RequestSummary[];
  onSelectRequest: (index: number) => void;
  selectedIndex: number | null;
  apiCalls?: ApiCall[];
  isOpen: boolean;
}

const RequestPanel: React.FC<RequestPanelProps> = ({
  setIsOpen,
  requests,
  onSelectRequest,
  selectedIndex,
  apiCalls = [],
  isOpen
}) => {
  const [expandedDetails, setExpandedDetails] = useState<number | null>(null);
  const theme = useTheme();

  useEffect(() => {
    console.log('Requests updated:', apiCalls);
    
  }, [apiCalls]);

  const toggleDetails = (index: number): void => {
    setExpandedDetails(expandedDetails === index ? null : index);
  };

  // Custom styles that extend the containerStyles
  const panelStyles = {
    collapsedPanel: {
      width: '24px',
      height: 'calc(100% - 16px)',
      borderRadius: '12px 0 0 12px',
      background: 'rgba(30, 41, 59, 0.8)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(71, 85, 105, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    collapsedContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
    },
    collapsedIcon: {
      fontSize: '16px',
      color: '#94a3b8',
    },
    requestBadge: {
      background: '#3b82f6',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '10px',
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Updated header style to match CodeEditor exactly
    header: {
      background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
      borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      // Remove the explicit border radius to allow it to follow the parent container
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.5) 50%, transparent 100%)',
      }
    },
    headerTitle: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontWeight: '600',
      fontSize: '0.9rem',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
    },
    icon: {
      color: 'rgba(59, 130, 246, 0.8)',
      fontSize: 18
    },
    closeButton: {
      color: '#94a3b8',
      p: 0.5,
      '&:hover': {
        color: '#e2e8f0',
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
      },
    },
    listContainer: {
      flex: 1,
      overflow: 'auto',
      ...listStyles,
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#64748b',
      p: 3,
      textAlign: 'center',
    },
    emptyIcon: {
      fontSize: '2.5rem',
      mb: 2,
      opacity: 0.6,
    },
    emptyText: {
      fontWeight: 500,
      fontSize: '0.9rem',
      mb: 1,
    },
    emptySubtext: {
      fontSize: '0.8rem',
      opacity: 0.7,
    },
  };

  // Collapsed panel view
  if (!isOpen) {
    return (
      <Paper
        elevation={0}
        sx={panelStyles.collapsedPanel}
        onClick={() => setIsOpen(true)}
      >
        <Box sx={panelStyles.collapsedContent}>
          <ChevronLeft sx={panelStyles.collapsedIcon} />
          {requests.length > 0 && (
            <Box sx={panelStyles.requestBadge}>
              {requests.length}
            </Box>
          )}
        </Box>
      </Paper>
    );
  }

  // Full panel view
  return (
    <Paper elevation={0} sx={containerStyles}>
      {/* Updated Header */}
      <Box sx={panelStyles.header}>
        <Box sx={panelStyles.headerContent}>
          <NetworkCheck sx={panelStyles.icon} />
          <Typography variant="subtitle2" sx={panelStyles.headerTitle}>
            API REQUESTS ({requests.length})
          </Typography>
        </Box>
        <IconButton
          onClick={() => setIsOpen(false)}
          sx={panelStyles.closeButton}
        >
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Request List */}
      <Box sx={panelStyles.listContainer}>
        {requests.length === 0 ? (
          <Box sx={panelStyles.emptyState}>
            <DataObject sx={panelStyles.emptyIcon} />
            <Typography variant="body2" sx={panelStyles.emptyText}>
              No API requests yet
            </Typography>
            <Typography variant="body2" sx={panelStyles.emptySubtext}>
              Run code with HTTP requests to see them here
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {requests.map((request, index) => (
              <RequestItem
                key={index}
                request={request}
                apiCall={apiCalls[index]}
                index={index}
                isSelected={selectedIndex === index}
                isExpanded={expandedDetails === index}
                onSelect={() => onSelectRequest(index)}
                onToggleDetails={() => toggleDetails(index)}
                isLast={index === requests.length - 1}
              />
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
};

// Helper functions remain unchanged
export function getMethodColor(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET': return 'rgba(34, 197, 94, 0.9)';
    case 'POST': return 'rgba(59, 130, 246, 0.9)';
    case 'PUT': return 'rgba(245, 158, 11, 0.9)';
    case 'DELETE': return 'rgba(239, 68, 68, 0.9)';
    case 'PATCH': return 'rgba(168, 85, 247, 0.9)';
    default: return 'rgba(71, 85, 105, 0.9)';
  }
}

export function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'rgba(16, 185, 129, 0.9)';
  if (status >= 300 && status < 400) return 'rgba(14, 165, 233, 0.9)';
  if (status >= 400 && status < 500) return 'rgba(249, 115, 22, 0.9)';
  if (status >= 500) return 'rgba(239, 68, 68, 0.9)';
  return 'rgba(71, 85, 105, 0.9)';
}

export default RequestPanel;