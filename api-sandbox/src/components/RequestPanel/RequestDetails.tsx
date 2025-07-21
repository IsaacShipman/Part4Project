import React from 'react';
import {
  Box, Typography, Accordion, AccordionSummary,
  AccordionDetails, Divider, useTheme
} from '@mui/material';
import { ExpandMore, Link, DataObject } from '@mui/icons-material';
import { ApiCall } from '../../types/api';

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
      ...theme.custom.glassCard,
    },

    sectionTitle: {
      color: theme.custom.colors.text.primary,
      mb: 1,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
    },

    sectionIcon: {
      fontSize: '1rem',
      color: theme.custom.colors.primary,
    },

    urlContainer: {
      mb: 1,
    },

    label: {
      color: theme.custom.colors.text.muted,
      display: 'block',
      mb: 0.5,
      fontSize: '0.75rem',
      fontWeight: 500,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    },

    urlBox: {
      color: theme.custom.colors.text.primary,
      fontFamily: theme.custom.terminal.fontFamily,
      fontSize: '0.8rem',
      p: 1.5,
      background: theme.custom.colors.background.tertiary,
      borderRadius: 1,
      wordBreak: 'break-all' as const,
      border: `1px solid ${theme.custom.colors.border.secondary}`,
    },

    accordion: {
      backgroundColor: 'transparent',
      '&:before': { display: 'none' },
      mb: 1,
      border: `1px solid ${theme.custom.colors.border.secondary}`,
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
      background: `${theme.custom.colors.text.muted}05`,
      '& .MuiAccordionSummary-content': {
        margin: '8px 0',
      },
      '&.Mui-expanded': {
        background: `${theme.custom.colors.text.muted}10`,
      },
    },

    accordionDetails: {
      p: 0,
    },

    contentBox: {
      backgroundColor: theme.custom.colors.background.tertiary,
      p: 1.5,
      color: theme.custom.colors.text.primary,
      fontFamily: theme.custom.terminal.fontFamily,
      fontSize: '0.8rem',
      whiteSpace: 'pre-wrap' as const,
      border: `1px solid ${theme.custom.colors.border.secondary}`,
      maxHeight: '300px',
      overflow: 'auto',
      '&::-webkit-scrollbar': {
        width: '4px',
      },
      '&::-webkit-scrollbar-track': {
        background: `${theme.custom.colors.text.muted}05`,
      },
      '&::-webkit-scrollbar-thumb': {
        background: theme.custom.colors.border.secondary,
        borderRadius: '2px',
        '&:hover': {
          background: theme.custom.colors.border.primary,
        },
      },
    },

    headerEntry: {
      mb: 0.5,
      fontSize: '0.8rem',
    },

    headerKey: {
      color: theme.custom.colors.accent,
      fontWeight: 600,
    },

    divider: {
      borderColor: theme.custom.colors.border.primary,
      my: 2,
    },
  };

  const renderHeaders = (headers: Record<string, any> | undefined) => {
    if (!headers || Object.keys(headers).length === 0) {
      return (
        <Typography sx={{ color: theme.custom.colors.text.muted, fontStyle: 'italic' }}>
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
            expandIcon={<ExpandMore sx={{ color: theme.custom.colors.text.muted }} />}
            sx={detailsStyles.accordionSummary}
          >
            <Typography variant="caption" sx={detailsStyles.label}>
              Headers
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={detailsStyles.accordionDetails}>
            <Box sx={detailsStyles.contentBox}>
              {renderHeaders(apiCall.headers)}
            </Box>
          </AccordionDetails>
        </Accordion>

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
            expandIcon={<ExpandMore sx={{ color: theme.custom.colors.text.muted }} />}
            sx={detailsStyles.accordionSummary}
          >
            <Typography variant="caption" sx={detailsStyles.label}>
              Headers
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={detailsStyles.accordionDetails}>
            <Box sx={detailsStyles.contentBox}>
              {renderHeaders(apiCall.headers)}
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
            expandIcon={<ExpandMore sx={{ color: theme.custom.colors.text.muted }} />}
            sx={detailsStyles.accordionSummary}
          >
            <Typography variant="caption" sx={detailsStyles.label}>
              Body
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={detailsStyles.accordionDetails}>
            <Box sx={detailsStyles.contentBox}>
              {apiCall.response || 
               'No content'}
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default RequestDetails;