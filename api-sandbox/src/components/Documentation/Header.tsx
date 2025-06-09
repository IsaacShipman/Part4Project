import { Box, Typography, Chip, Stack, styled } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DocumentationData } from '../../types/documentation';
import { Close } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { getMethodColor } from '../../utils/methodTypes';

interface DocumentationHeaderProps {
  data: DocumentationData;
}

// Glass header with gradient style
const GlassHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
  borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
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
    background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.5) 50%, transparent 100%)',
  }
}));

const DocumentationHeader = ({ data, onClose }: { data: DocumentationData; onClose?: () => void }) => {
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
            color: '#e2e8f0',
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
            background: 'rgba(59, 130, 246, 0.2)',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            fontSize: '0.75rem',
          }}
        />
      </Stack>
      
      <Typography 
        variant="body2" 
        sx={{ 
          color: '#cbd5e1',
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
            color: '#94a3b8',
            '&:hover': { color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      )}
    </GlassHeader>
  );
};

export default DocumentationHeader;