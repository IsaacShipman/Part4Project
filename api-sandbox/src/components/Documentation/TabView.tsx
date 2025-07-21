import React from 'react';
import { Box, Typography, Tab, Link, TabProps, useTheme } from '@mui/material';
import { Launch } from '@mui/icons-material';
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

const CustomTab = ({ label, icon, ...props }: any) => {
  const theme = useTheme();
  
  return (
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
        color: theme.custom.colors.text.muted,
        marginRight: '8px',
        '&.Mui-selected': {
          color: theme.custom.colors.primary,
          fontWeight: 600,
        },
        '&:hover': {
          color: theme.custom.colors.primary,
          background: `${theme.custom.colors.primary}08`,
        },
      }}
      {...props}
    />
  );
};

export default CustomTab;