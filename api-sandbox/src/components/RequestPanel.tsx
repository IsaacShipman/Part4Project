import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, List, ListItem, ListItemButton,
  ListItemText, Chip, IconButton, Collapse, Divider,
  Accordion, AccordionSummary, AccordionDetails, useTheme
} from '@mui/material';
import { 
  Close, ExpandMore, ChevronRight, AccessTime, Code,
  Link, DataObject
} from '@mui/icons-material';
import { ApiCall } from '../types/api';
import { RequestSummary } from '../types/api';

interface RequestPanelProps {
  setIsOpen: (isOpen: boolean) => void;
  requests: RequestSummary[];
  onSelectRequest: (index: number) => void;
  selectedIndex: number | null;
  apiCalls?: ApiCall[];
}

const RequestPanel: React.FC<RequestPanelProps> = ({
  setIsOpen,
  requests,
  onSelectRequest,
  selectedIndex,
  apiCalls = []
}) => {
  const [expandedDetails, setExpandedDetails] = useState<number | null>(null);
  const theme = useTheme();

  useEffect(() => {
    // Reset expanded details when requests change
    console.log('Requests updated:', apiCalls);
  }, [apiCalls]);

  const getStatusColor = (status: number): string => {
    if (status >= 200 && status < 300) return theme.custom.requestPanel.statusColors.success;
    if (status >= 300 && status < 400) return theme.custom.requestPanel.statusColors.redirect;
    if (status >= 400 && status < 500) return theme.custom.requestPanel.statusColors.clientError;
    if (status >= 500) return theme.custom.requestPanel.statusColors.serverError;
    return theme.custom.requestPanel.statusColors.default;
  };

  const getMethodColor = (method: string): string => {
    switch (method.toLowerCase()) {
      case 'get': return theme.custom.requestPanel.methodColors.get;
      case 'post': return theme.custom.requestPanel.methodColors.post;
      case 'put': return theme.custom.requestPanel.methodColors.put;
      case 'delete': return theme.custom.requestPanel.methodColors.delete;
      case 'patch': return theme.custom.requestPanel.methodColors.patch;
      default: return theme.custom.requestPanel.methodColors.default;
    }
  };

  const formatJson = (obj: any): string => {
    if (!obj) return 'None';
    if (typeof obj === 'string') return obj;
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  const truncateUrl = (url: string, maxLength: number = 40): string => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  const toggleDetails = (index: number): void => {
    setExpandedDetails(expandedDetails === index ? null : index);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        height: '100%',
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.subtle,
        }}
      >
        <Typography variant="h6" sx={{ fontFamily: theme.custom.terminal.fontFamily, color: theme.palette.text.primary }}>
          API REQUESTS ({requests.length})
        </Typography>
        <IconButton
          onClick={() => setIsOpen(false)}
          sx={{ color: theme.palette.text.primary }}
        >
          <Close />
        </IconButton>
      </Box>

      {/* Request List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {requests.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: theme.palette.text.secondary,
            }}
          >
            <DataObject sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="body2">
              No API requests yet
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', mt: 1 }}>
              Run code with HTTP requests to see them here
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {requests.map((request, index) => {
              const apiCall = apiCalls[index];
              const isSelected = selectedIndex === index;
              const isExpanded = expandedDetails === index;

              return (
                <Box key={index}>
                  <ListItem
                    disablePadding
                    sx={{
                      backgroundColor: isSelected ? theme.palette.action.selected : 'transparent',
                      borderLeft: isSelected ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                    }}
                  >
                    <ListItemButton
                      onClick={() => onSelectRequest(index)}
                      sx={{
                        py: 1,
                        px: 2,
                        '&:hover': {
                          backgroundColor: theme.palette.background.hover,
                        },
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        {/* Main request info */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Chip
                            label={request.method}
                            size="small"
                            sx={{
                              backgroundColor: getMethodColor(request.method),
                              color: theme.palette.text.primary,
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                              minWidth: '50px',
                            }}
                          />
                          <Chip
                            label={request.status}
                            size="small"
                            sx={{
                              backgroundColor: getStatusColor(request.status),
                              color: theme.palette.text.primary,
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                            }}
                          />
                          {apiCall?.line && (
                            <Chip
                              icon={<Code sx={{ fontSize: '0.7rem' }} />}
                              label={`L${apiCall.line}`}
                              size="small"
                              variant="outlined"
                              sx={{
                                color: theme.palette.text.secondary,
                                borderColor: theme.palette.divider,
                                fontSize: '0.6rem',
                              }}
                            />
                          )}
                        </Box>

                        {/* URL */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.primary,
                            fontFamily: theme.custom.terminal.fontFamily,
                            fontSize: '0.8rem',
                            wordBreak: 'break-all',
                          }}
                        >
                          {truncateUrl(request.url, 50)}
                        </Typography>

                        {/* Timestamp */}
                        {apiCall && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <AccessTime sx={{ fontSize: '0.7rem', color: theme.palette.text.secondary }} />
                            <Typography
                              variant="caption"
                              sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem' }}
                            >
                              {formatTimestamp(apiCall.timestamp)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </ListItemButton>

                    {/* Expand/Collapse button for details */}
                    {apiCall && (
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDetails(index);
                        }}
                        sx={{ color: theme.palette.text.secondary, p: 1 }}
                      >
                        {isExpanded ? <ExpandMore /> : <ChevronRight />}
                      </IconButton>
                    )}
                  </ListItem>

                  {/* Expanded Details */}
                  {apiCall && (
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <Box sx={{ p: 2, backgroundColor: theme.palette.background.subtle }}>
                        {/* Request Details */}
                        <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary, mb: 1 }}>
                          <Link sx={{ fontSize: '0.9rem', mr: 1, verticalAlign: 'middle' }} />
                          Request
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          {/* Full URL */}
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.5 }}>
                              URL
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: theme.palette.text.primary, 
                                fontFamily: theme.custom.terminal.fontFamily, 
                                fontSize: '0.8rem', 
                                p: 1, 
                                backgroundColor: theme.palette.background.default, 
                                borderRadius: 1,
                                wordBreak: 'break-all'
                              }}
                            >
                              {apiCall.url}
                            </Typography>
                          </Box>
                          
                          {/* Request Headers */}
                          <Accordion 
                            disableGutters 
                            elevation={0}
                            sx={{ 
                              backgroundColor: 'transparent',
                              '&:before': { display: 'none' },
                              mb: 1
                            }}
                          >
                            <AccordionSummary 
                              expandIcon={<ExpandMore sx={{ color: theme.palette.text.secondary }} />}
                              sx={{ px: 0, minHeight: '36px', '& .MuiAccordionSummary-content': { margin: '4px 0' } }}
                            >
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                Headers
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0 }}>
                              <Box 
                                sx={{ 
                                  backgroundColor: theme.palette.background.default, 
                                  p: 1, 
                                  borderRadius: 1, 
                                  color: theme.palette.text.primary,
                                  fontFamily: theme.custom.terminal.fontFamily,
                                  fontSize: '0.8rem',
                                  whiteSpace: 'pre-wrap'
                                }}
                              >
                                {apiCall.request?.headers ? (
                                  Object.entries(apiCall.request.headers).map(([key, value]) => (
                                    <Box key={key} sx={{ mb: 0.5 }}>
                                      <span style={{ color: theme.palette.success.main }}>{key}</span>: {value}
                                    </Box>
                                  ))
                                ) : 'No headers'}
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                          
                          {/* Request Body */}
                          {(apiCall.request?.data || apiCall.request?.json) && (
                            <Accordion 
                              disableGutters 
                              elevation={0}
                              sx={{ 
                                backgroundColor: 'transparent',
                                '&:before': { display: 'none' },
                                mb: 1
                              }}
                            >
                              <AccordionSummary 
                                expandIcon={<ExpandMore sx={{ color: theme.palette.text.secondary }} />}
                                sx={{ px: 0, minHeight: '36px', '& .MuiAccordionSummary-content': { margin: '4px 0' } }}
                              >
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                  Body
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails sx={{ p: 0 }}>
                                <Box 
                                  sx={{ 
                                    backgroundColor: theme.palette.background.default, 
                                    p: 1, 
                                    borderRadius: 1, 
                                    color: theme.palette.text.primary,
                                    fontFamily: theme.custom.terminal.fontFamily,
                                    fontSize: '0.8rem',
                                    whiteSpace: 'pre-wrap'
                                  }}
                                >
                                  {formatJson(apiCall.request.json || apiCall.request.data)}
                                </Box>
                              </AccordionDetails>
                            </Accordion>
                          )}
                        </Box>
                        
                        <Divider sx={{ borderColor: theme.palette.divider, my: 2 }} />
                        
                        {/* Response Details */}
                        <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary, mb: 1 }}>
                          <DataObject sx={{ fontSize: '0.9rem', mr: 1, verticalAlign: 'middle' }} />
                          Response
                        </Typography>
                        
                        <Box>
                          {/* Response Headers */}
                          <Accordion 
                            disableGutters 
                            elevation={0}
                            sx={{ 
                              backgroundColor: 'transparent',
                              '&:before': { display: 'none' },
                              mb: 1
                            }}
                          >
                            <AccordionSummary 
                              expandIcon={<ExpandMore sx={{ color: theme.palette.text.secondary }} />}
                              sx={{ px: 0, minHeight: '36px', '& .MuiAccordionSummary-content': { margin: '4px 0' } }}
                            >
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                Headers
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0 }}>
                              <Box 
                                sx={{ 
                                  backgroundColor: theme.palette.background.default, 
                                  p: 1, 
                                  borderRadius: 1, 
                                  color: theme.palette.text.primary,
                                  fontFamily: theme.custom.terminal.fontFamily,
                                  fontSize: '0.8rem',
                                  whiteSpace: 'pre-wrap'
                                }}
                              >
                                {apiCall.responseData?.headers ? (
                                  Object.entries(apiCall.responseData.headers).map(([key, value]) => (
                                    <Box key={key} sx={{ mb: 0.5 }}>
                                      <span style={{ color: theme.palette.success.main }}>{key}</span>: {value}
                                    </Box>
                                  ))
                                ) : 'No headers'}
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                          
                          {/* Response Body */}
                          <Accordion 
                            defaultExpanded
                            disableGutters 
                            elevation={0}
                            sx={{ 
                              backgroundColor: 'transparent',
                              '&:before': { display: 'none' }
                            }}
                          >
                            <AccordionSummary 
                              expandIcon={<ExpandMore sx={{ color: theme.palette.text.secondary }} />}
                              sx={{ px: 0, minHeight: '36px', '& .MuiAccordionSummary-content': { margin: '4px 0' } }}
                            >
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                Body
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0 }}>
                              <Box 
                                sx={{ 
                                  backgroundColor: theme.palette.background.default, 
                                  p: 1, 
                                  borderRadius: 1, 
                                  color: theme.palette.text.primary,
                                  fontFamily: theme.custom.terminal.fontFamily,
                                  fontSize: '0.8rem',
                                  whiteSpace: 'pre-wrap',
                                  maxHeight: '300px',
                                  overflow: 'auto'
                                }}
                              >
                                {apiCall.responseData?.text || apiCall.responseData?.content || 'No content'}
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                        </Box>
                      </Box>
                    </Collapse>
                  )}
                  
                  {index < requests.length - 1 && (
                    <Divider sx={{ borderColor: theme.palette.divider }} />
                  )}
                </Box>
              );
            })}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default RequestPanel;