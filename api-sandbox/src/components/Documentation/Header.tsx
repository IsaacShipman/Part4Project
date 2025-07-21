import { Box, Typography, Chip, Stack, styled, useTheme } from '@mui/material';
import { DocumentationData } from '../../types/documentation';
import { Close } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { getMethodColor } from '../../utils/methodTypes';

interface DocumentationHeaderProps {
  data: DocumentationData;
  onClose?: () => void;
}

// Glass header with gradient style
const GlassHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.custom.colors.primary}20 0%, ${theme.custom.colors.accent}15 100%)`,
  borderBottom: `1px solid ${theme.custom.colors.primary}30`,
  padding: '8px 16px',
  position: 'relative',
  display: 'flex',
  alignItems: 'center', 
  justifyContent: 'space-between',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: `linear-gradient(90deg, transparent 0%, ${theme.custom.colors.primary}50 50%, transparent 100%)`,
  }
}));

const DocumentationHeader = ({ data, onClose }: DocumentationHeaderProps) => {
  const theme = useTheme();
  const methodStyle = getMethodColor(data.method);
  
  return (
    <GlassHeader>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
        <Chip 
          label={data.method}
          size="small"
          sx={{ 
            fontWeight: 'bold',
            fontSize: '0.75rem',
            backgroundColor: methodStyle.backgroundColor,
            color: methodStyle.color,
            border: methodStyle.border,
            minWidth: '60px',
          }}
        />
        <Typography 
          variant="body2" 
          fontFamily="'JetBrains Mono', monospace" 
          sx={{ 
            color: theme.custom.colors.text.primary,
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {data.path}
        </Typography>
        <Chip 
          size="small"
          label={data.category}
          sx={{ 
            background: `${theme.custom.colors.primary}20`,
            color: theme.custom.colors.primary,
            border: `1px solid ${theme.custom.colors.primary}30`,
            fontSize: '0.75rem',
          }}
        />
      </Stack>
      
      <Typography 
        variant="body2" 
        sx={{ 
          color: theme.custom.colors.text.secondary,
          fontSize: '0.875rem',
          maxWidth: '300px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          mx: 2,
        }}
      >
        {data.summary}
      </Typography>
      
      {onClose && (
        <IconButton 
          onClick={onClose}
          size="small"
          sx={{ 
            color: theme.custom.colors.text.muted,
            '&:hover': { 
              color: theme.custom.colors.error, 
              background: `${theme.custom.colors.error}10` 
            }
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      )}
    </GlassHeader>
  );
};

export default DocumentationHeader;