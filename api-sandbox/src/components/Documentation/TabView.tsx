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

const CustomTab = ({ label, icon, ...props }: any) => (
  <Tab
    label={label}
    icon={icon}
    iconPosition="start"
    sx={{
      minHeight: '48px',
      minWidth: '120px',
      padding: '0 16px',
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.875rem',
      color: '#94a3b8',
      marginRight: '8px',
      '&.Mui-selected': {
        color: '#60a5fa',
        fontWeight: 600,
      },
      '&:hover': {
        color: '#60a5fa',
        background: 'rgba(96, 165, 250, 0.08)',
      },
    }}
    {...props}
  />
);

export default CustomTab;