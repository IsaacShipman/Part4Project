import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  TextField,
  IconButton
} from '@mui/material';
import { 
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Edit as EditIcon
} from '@mui/icons-material';

interface ParsedIntent {
  raw: string;
  parsed: string[];
  confidence: number;
}

interface InterpretedParam {
  name: string;
  value: string;
  type: string;
  editable?: boolean;
}

interface IntentParseDisplayProps {
  intent: ParsedIntent | null;
  interpretedParams: InterpretedParam[];
  onParamChange?: (paramName: string, newValue: string) => void;
}

const IntentParseDisplay: React.FC<IntentParseDisplayProps> = ({
  intent,
  interpretedParams,
  onParamChange
}) => {
  if (!intent) {
    return null;
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckIcon sx={{ fontSize: 16 }} />;
    return <WarningIcon sx={{ fontSize: 16 }} />;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mt: 2,
        borderRadius: '16px',
        background: (theme) => `${theme.custom.colors.background.secondary}95`,
        backdropFilter: 'blur(10px)',
        border: (theme) => `1px solid ${theme.custom.colors.border.primary}`,
      }}
    >
      {/* Intent Understanding */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            color: (theme) => theme.custom.colors.text.primary,
            mb: 2,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          Intent Understanding
          <Chip
            icon={getConfidenceIcon(intent.confidence)}
            label={`${Math.round(intent.confidence * 100)}% confident`}
            color={getConfidenceColor(intent.confidence)}
            size="small"
            variant="outlined"
          />
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: (theme) => theme.custom.colors.text.secondary,
              mb: 1,
              display: 'block'
            }}
          >
            Confidence Score
          </Typography>
          <LinearProgress
            variant="determinate"
            value={intent.confidence * 100}
            color={getConfidenceColor(intent.confidence)}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: (theme) => `${theme.custom.colors.background.tertiary}50`,
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
              }
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {intent.parsed.map((action, index) => (
            <Chip
              key={index}
              label={action.replace(/_/g, ' ')}
              variant="filled"
              size="small"
              sx={{
                backgroundColor: (theme) => `${theme.custom.colors.primary}20`,
                color: (theme) => theme.custom.colors.primary,
                fontWeight: 500,
                textTransform: 'capitalize'
              }}
            />
          ))}
        </Box>
      </Box>


    </Paper>
  );
};

export default IntentParseDisplay;
