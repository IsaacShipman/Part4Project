import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, List, IconButton, useTheme } from '@mui/material';
import { ChevronRight, ChevronLeft, DataObject, NetworkCheck } from '@mui/icons-material';
import { ApiCall } from '../../types/api';
import { RequestSummary } from '../../types/api';
import RequestItem from './RequestItem';

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
      background: theme.custom.colors.background.secondary,
      backdropFilter: 'blur(16px)',
      border: `1px solid ${theme.custom.colors.border.primary}`,
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
      color: theme.custom.colors.text.muted,
    },
    requestBadge: {
      background: theme.custom.colors.primary,
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
      background: `linear-gradient(90deg, ${theme.custom.colors.primary}20 0%, ${theme.custom.colors.accent}15 100%)`,
      borderBottom: `1px solid ${theme.custom.colors.primary}30`,
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
        background: `linear-gradient(90deg, transparent 0%, ${theme.custom.colors.primary}50 50%, transparent 100%)`,
      }
    },
    headerTitle: {
      color: theme.custom.colors.text.primary,
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
      color: theme.custom.colors.primary,
      fontSize: 18
    },
    closeButton: {
      color: theme.custom.colors.text.muted,
      p: 0.5,
      '&:hover': {
        color: theme.custom.colors.text.primary,
        backgroundColor: `${theme.custom.colors.text.muted}10`,
      },
    },
    listContainer: {
      flex: 1,
      overflow: 'auto',
      width: '100%',
      height: '100%',
      padding: '4px 0',
      '&::-webkit-scrollbar': {
        width: '6px'
      },
      '&::-webkit-scrollbar-track': {
        background: theme.custom.colors.border.subtle,
        borderRadius: '3px'
      },
      '&::-webkit-scrollbar-thumb': {
        background: theme.custom.colors.border.secondary,
        borderRadius: '3px',
        '&:hover': {
          background: theme.custom.colors.border.primary,
        }
      }
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: theme.custom.colors.text.muted,
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
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <Paper
          elevation={0}
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: 55,
            borderRadius: '12px 0 0 12px',
            background: theme.custom.colors.background.secondary,
            backdropFilter: 'blur(16px)',
            border: `1px solid ${theme.custom.colors.border.primary}`,
            borderRight: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <ChevronLeft sx={{ fontSize: 18, color: theme.custom.colors.text.muted }} />
            {requests.length > 0 && (
              <Box sx={panelStyles.requestBadge}>{requests.length}</Box>
            )}
            <Typography
              variant="caption"
              sx={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                color: theme.custom.colors.text.muted,
                letterSpacing: 1,
                fontSize: '14px',
                mt: 0.5,
              }}
            >
              Requests
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  // Full panel view
  return (
    <Paper 
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        background: theme.custom.colors.background.gradient,
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: `1px solid ${theme.custom.colors.border.primary}`,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
          : '0 8px 32px rgba(0, 0, 0, 0.1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'dark'
            ? `
              radial-gradient(circle at 60% 60%, rgba(16, 185, 129, 0.05) 0%, transparent 40%),
              radial-gradient(circle at 30% 90%, rgba(6, 95, 70, 0.08) 0%, transparent 30%)
            `
            : `
              radial-gradient(circle at 60% 60%, rgba(16, 185, 129, 0.03) 0%, transparent 40%),
              radial-gradient(circle at 30% 90%, rgba(6, 95, 70, 0.05) 0%, transparent 30%)
            `,
          borderRadius: '16px',
          pointerEvents: 'none',
          zIndex: 1,
          animation: 'subtleFloat 8s ease-in-out infinite'
        },
        '@keyframes subtleFloat': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-3px) rotate(0.5deg)' }
        }
      }}
    >
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