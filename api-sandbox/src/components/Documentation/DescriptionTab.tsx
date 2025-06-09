import { Box, Typography, Link } from '@mui/material';
import { Launch } from '@mui/icons-material';
import { glassCardStyles } from '../../styles/containerStyles'; 
import { DocumentationData } from '../../types/documentation';

interface DescriptionTabProps {
  data: DocumentationData;
}

const DescriptionTab = ({ data }: DescriptionTabProps) => (
  <Box sx={{ p: 1 }}>
    <Box sx={{ 
      ...glassCardStyles,
      p: 3,
      mb: 3,
    }}>
      <Typography 
        variant="body1" 
        sx={{ 
          color: '#e2e8f0',
          lineHeight: 1.7,
          fontSize: '0.95rem',
        }}
      >
        {data.documentation.description}
      </Typography>
    </Box>
    
    <Box sx={{ 
      ...glassCardStyles,
      p: 3,
    }}>
      <Typography 
        variant="h6" 
        fontWeight="600" 
        sx={{ 
          mb: 2,
          color: '#f1f5f9',
          fontSize: '1rem',
        }}
      >
        Resources
      </Typography>
      <Link 
        href={data.doc_url} 
        target="_blank" 
        rel="noopener" 
        underline="none"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          color: '#60a5fa',
          fontWeight: '500',
          padding: '8px 16px',
          borderRadius: '8px',
          background: 'rgba(96, 165, 250, 0.1)',
          border: '1px solid rgba(96, 165, 250, 0.2)',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'rgba(96, 165, 250, 0.2)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(96, 165, 250, 0.3)',
          }
        }}
      >
        <Launch fontSize="small" />
        Official Documentation
      </Link>
    </Box>
  </Box>
);

export default DescriptionTab;