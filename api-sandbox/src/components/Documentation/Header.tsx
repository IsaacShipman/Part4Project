import { Box, Typography, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { glassCardStyles } from '../../styles/containerStyles';
import { DocumentationData } from '../../types/documentation';

interface DocumentationHeaderProps {
  data: DocumentationData;
  getMethodColor: (method: string) => string;
}

const DocumentationHeader = ({ data, getMethodColor }: DocumentationHeaderProps) => (
  <Box sx={{
    p: 3,
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: '16px 16px 0 0',
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip 
          label={data.method}
          size="medium"
          sx={{ 
            fontWeight: 'bold',
            fontSize: '0.75rem',
            height: '28px',
            background: `linear-gradient(45deg, ${getMethodColor(data.method)}, ${alpha(getMethodColor(data.method), 0.7)})`,
            color: 'white',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
        />
        <Typography 
          variant="h6" 
          fontFamily="'JetBrains Mono', monospace" 
          fontWeight="medium"
          sx={{ 
            color: '#e2e8f0',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          }}
        >
          {data.path}
        </Typography>
      </Box>
      <Chip 
        size="medium"
        label={data.category}
        sx={{ 
          background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
          color: 'white',
          fontWeight: '500',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        }}
      />
    </Box>
    <Typography 
      variant="body1" 
      sx={{ 
        color: '#cbd5e1',
        lineHeight: 1.6,
        fontWeight: '400',
      }}
    >
      {data.summary}
    </Typography>
  </Box>
);

export default DocumentationHeader;