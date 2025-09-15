import React from 'react';
import { Box, Paper } from '@mui/material';
import EndpointCards from './EndpointCards';
import { EndpointStep } from './types';

interface EndpointCardsPanelProps {
  steps: EndpointStep[];
  selectedStepId?: string;
  language: string;
  onRunRequest?: (stepId: string) => void;
}

// A scrollable, padded panel to host EndpointCards without clipping
const EndpointCardsPanel: React.FC<EndpointCardsPanelProps> = ({
  steps,
  selectedStepId,
  language,
  onRunRequest
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: '16px',
        background: (theme) => `${theme.custom.colors.background.secondary}95`,
        backdropFilter: 'blur(10px)',
        border: (theme) => `1px solid ${theme.custom.colors.border.primary}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          // Avoid clipping inner absolute elements near the edges
          pr: 2,
          pt: 2,
        }}
      >
        <EndpointCards
          steps={steps}
          selectedStepId={selectedStepId}
          language={language}
          onRunRequest={onRunRequest}
        />
      </Box>
    </Paper>
  );
};

export default EndpointCardsPanel;
