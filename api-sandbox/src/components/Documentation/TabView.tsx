import React from 'react';
import { Box, Typography, Tab, Link, TabProps } from '@mui/material';
import { Launch } from '@mui/icons-material';
import { glassCardStyles } from '../../styles/containerStyles';
import { DocumentationData } from '../../types/documentation';

// Define interface for component props
interface CustomTabProps extends Omit<TabProps, 'icon'> {
  icon?: React.ReactNode;
  label: string;
  isActive: boolean;
}

interface DescriptionTabProps {
  data: DocumentationData;
}

export const CustomTab = ({ icon, label, isActive, ...props }: CustomTabProps) => (
  <Tab
    iconPosition="start"
    label={label}
    sx={{
      minHeight: '48px',
      py: 1.5,
      px: 3,
      color: isActive ? '#60a5fa' : '#94a3b8',
      fontWeight: isActive ? '600' : '500',
      textTransform: 'none',
      fontSize: '0.875rem',
      transition: 'all 0.3s ease',
      '&:hover': {
        color: '#60a5fa',
        background: 'rgba(96, 165, 250, 0.05)',
      },
      '&.Mui-selected': {
        color: '#60a5fa',
        fontWeight: '600',
      },
      '& .MuiTab-iconWrapper': {
        marginBottom: '0 !important',
        marginRight: '8px',
      }
    }}
    {...props}
  />
);

// Description Tab Component
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