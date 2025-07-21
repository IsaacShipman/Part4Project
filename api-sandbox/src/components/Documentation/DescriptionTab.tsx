import { Box, Typography, Link, useTheme } from '@mui/material';
import { Launch } from '@mui/icons-material';
import { DocumentationData } from '../../types/documentation';

interface DescriptionTabProps {
  data: DocumentationData;
}

const DescriptionTab = ({ data }: DescriptionTabProps) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ 
        ...theme.custom.glassCard,
        p: 3,
        mb: 3,
      }}>
        <Typography 
          variant="body1" 
          sx={{ 
            color: theme.custom.colors.text.primary,
            lineHeight: 1.7,
            fontSize: '0.95rem',
          }}
        >
          {data.documentation.description}
        </Typography>
      </Box>
      
      <Link 
        href={data.doc_url} 
        target="_blank" 
        rel="noopener" 
        underline="none"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          color: theme.custom.colors.primary,
          fontWeight: '500',
          padding: '8px 16px',
          borderRadius: '8px',
          background: `${theme.custom.colors.primary}10`,
          border: `1px solid ${theme.custom.colors.primary}20`,
          transition: 'all 0.3s ease',
          '&:hover': {
            background: `${theme.custom.colors.primary}20`,
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 12px ${theme.custom.colors.primary}30`,
          }
        }}
      >
        <Launch fontSize="small" />
        Official Documentation
      </Link>
    </Box>
  );
};

export default DescriptionTab;