import React from 'react';
import {
  Box, Typography, Accordion, AccordionSummary,
  AccordionDetails, Divider, useTheme
} from '@mui/material';
import { ExpandMore, Link, DataObject } from '@mui/icons-material';
import { ApiCall } from '../../types/api';
import { glassCardStyles, glassStyles } from '../../styles/containerStyles';

interface RequestDetailsProps {
  apiCall: ApiCall;
}

const RequestDetails: React.FC<RequestDetailsProps> = ({ apiCall }) => {
  const theme = useTheme();

  const formatJson = (obj: any): string => {
    if (!obj) return 'None';
    if (typeof obj === 'string') return obj;
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  const detailsStyles = {
    container: {
      p: 2,
      m: 1,
      ...glassCardStyles,
    },

    sectionTitle: {
      color: '#f1f5f9',
      mb: 1,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
    },

    sectionIcon: {
      fontSize: '1rem',
      color: '#3b82f6',
    },

    urlContainer: {
      mb: 1,
    },

    label: {
      color: '#94a3b8',
      display: 'block',
      mb: 0.5,
      fontSize: '0.75rem',
      fontWeight: 500,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    },

    urlBox: {
      color: '#e2e8f0',
      fontFamily: '"Fira Code", "Monaco", "Cascadia Code", "Roboto Mono", monospace',
      fontSize: '0.8rem',
      p: 1.5,
      background: 'rgba(15, 23, 42, 0.6)',
      borderRadius: 1,
      wordBreak: 'break-all' as const,
      border: '1px solid rgba(148, 163, 184, 0.1)',
    },

    accordion: {
      backgroundColor: 'transparent',
      '&:before': { display: 'none' },
      mb: 1,
      border: '1px solid rgba(148, 163, 184, 0.1)',
      borderRadius: '8px !important',
      overflow: 'hidden',
      '&.Mui-expanded': {
        margin: '0 0 8px 0',
      },
    },

    accordionSummary: {
      px: 1.5,
      py: 0.5,
      minHeight: '40px',
      background: 'rgba(148, 163, 184, 0.05)',
      '& .MuiAccordionSummary-content': {
        margin: '8px 0',
      },
      '&.Mui-expanded': {
        background: 'rgba(148, 163, 184, 0.1)',
      },
    },

    accordionDetails: {
      p: 0,
    },

    contentBox: {
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      p: 1.5,
      color: '#e2e8f0',
      fontFamily: '"Fira Code", "Monaco", "Cascadia Code", "Roboto Mono", monospace',
      fontSize: '0.8rem',
      whiteSpace: 'pre-wrap' as const,
      border: '1px solid rgba(148, 163, 184, 0.1)',
      maxHeight: '300px',
      overflow: 'auto',
      '&::-webkit-scrollbar': {
        width: '4px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'rgba(148, 163, 184, 0.05)',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(148, 163, 184, 0.2)',
        borderRadius: '2px',
        '&:hover': {
          background: 'rgba(148, 163, 184, 0.3)',
        },
      },
    },

    headerEntry: {
      mb: 0.5,
      fontSize: '0.8rem',
    },

    headerKey: {
      color: '#10b981',
      fontWeight: 600,
    },

    divider: {
      borderColor: 'rgba(148, 163, 184, 0.2)',
      my: 2,
    },
  };

  const renderHeaders = (headers: Record<string, any> | undefined) => {
    if (!headers || Object.keys(headers).length === 0) {
      return (
        <Typography sx={{ color: '#64748b', fontStyle: 'italic' }}>
          No headers
        </Typography>
      );
    }

    return Object.entries(headers).map(([key, value]) => (
      <Box key={key} sx={detailsStyles.headerEntry}>
        <span style={detailsStyles.headerKey}>{key}</span>: {String(value)}
      </Box>
    ));
  };

  return (
    <Box sx={detailsStyles.container}>
      {/* Request Section */}
      <Typography variant="subtitle2" sx={detailsStyles.sectionTitle}>
        <Link sx={detailsStyles.sectionIcon} />
        Request
      </Typography>

      <Box sx={{ mb: 2 }}>
        {/* Full URL */}
        <Box sx={detailsStyles.urlContainer}>
          <Typography variant="caption" sx={detailsStyles.label}>
            URL
          </Typography>
          <Box sx={detailsStyles.urlBox}>
            {apiCall.url}
          </Box>
        </Box>

        {/* Request Headers */}
        <Accordion
          disableGutters
          elevation={0}
          sx={detailsStyles.accordion}
        >
          <AccordionSummary
            expandIcon={<ExpandMore sx={{ color: '#94a3b8' }} />}
            sx={detailsStyles.accordionSummary}
          >
            <Typography variant="caption" sx={detailsStyles.label}>
              Headers
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={detailsStyles.accordionDetails}>
            <Box sx={detailsStyles.contentBox}>
              {renderHeaders(apiCall.request?.headers)}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Request Body */}
        {(apiCall.request?.data || apiCall.request?.json) && (
          <Accordion
            disableGutters
            elevation={0}
            sx={detailsStyles.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMore sx={{ color: '#94a3b8' }} />}
              sx={detailsStyles.accordionSummary}
            >
              <Typography variant="caption" sx={detailsStyles.label}>
                Body
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={detailsStyles.accordionDetails}>
              <Box sx={detailsStyles.contentBox}>
                {formatJson(apiCall.request.json || apiCall.request.data)}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}
      </Box>

      <Divider sx={detailsStyles.divider} />

      {/* Response Section */}
      <Typography variant="subtitle2" sx={detailsStyles.sectionTitle}>
        <DataObject sx={detailsStyles.sectionIcon} />
        Response
      </Typography>

      <Box>
        {/* Response Headers */}
        <Accordion
          disableGutters
          elevation={0}
          sx={detailsStyles.accordion}
        >
          <AccordionSummary
            expandIcon={<ExpandMore sx={{ color: '#94a3b8' }} />}
            sx={detailsStyles.accordionSummary}
          >
            <Typography variant="caption" sx={detailsStyles.label}>
              Headers
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={detailsStyles.accordionDetails}>
            <Box sx={detailsStyles.contentBox}>
              {renderHeaders(apiCall.responseData?.headers)}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Response Body */}
        <Accordion
          defaultExpanded
          disableGutters
          elevation={0}
          sx={detailsStyles.accordion}
        >
          <AccordionSummary
            expandIcon={<ExpandMore sx={{ color: '#94a3b8' }} />}
            sx={detailsStyles.accordionSummary}
          >
            <Typography variant="caption" sx={detailsStyles.label}>
              Body
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={detailsStyles.accordionDetails}>
            <Box sx={detailsStyles.contentBox}>
              {apiCall.responseData?.text || 
               apiCall.responseData?.content || 
               'No content'}
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default RequestDetails;