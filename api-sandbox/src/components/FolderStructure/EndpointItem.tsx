import React from 'react';
import { ListItem, Typography, Box, Chip, useTheme } from '@mui/material';
import { Endpoint } from '../../types/api';
import { getMethodColor } from '../../utils/methodTypes';

interface EndpointItemProps {
  endpoint: Endpoint;
  isSelected: boolean;
  onSelect: (endpointId: number) => void;
}

export const EndpointItem: React.FC<EndpointItemProps> = ({ 
  endpoint, 
  isSelected, 
  onSelect 
}) => {
  const theme = useTheme();
  const methodStyle = getMethodColor(endpoint.method);

  return (
    <ListItem 
      component="div"
      onClick={() => onSelect(endpoint.id)}
      sx={{ 
        borderRadius: '8px',
        margin: '2px 8px 2px 8px',
        padding: '8px 12px',
        position: 'relative',
        width: 'calc(100% - 16px)',
        background: isSelected 
          ? `
            radial-gradient(circle at 30% 70%, ${theme.custom.colors.primary}20 0%, transparent 70%),
            ${theme.custom.colors.primary}15
          ` 
          : `
            radial-gradient(circle at 80% 20%, ${theme.custom.colors.accent}08 0%, transparent 60%),
            ${theme.custom.colors.background.tertiary}
          `,
        backdropFilter: 'blur(8px)',
        border: isSelected 
          ? `1px solid ${theme.custom.colors.primary}40` 
          : `1px solid ${theme.custom.colors.border.secondary}`,
        overflow: 'hidden',
        zIndex: 2,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: `linear-gradient(90deg, transparent, ${theme.custom.colors.accent}10, transparent)`,
          transition: 'left 0.5s ease',
          pointerEvents: 'none'
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '2px',
          height: '0%',
          background: `linear-gradient(to bottom, ${theme.custom.colors.accent}80, ${theme.custom.colors.accent}20)`,
          transition: 'height 0.3s ease',
          pointerEvents: 'none'
        },
        '&:hover': { 
          background: isSelected 
            ? `
              radial-gradient(circle at 50% 50%, ${theme.custom.colors.primary}25 0%, transparent 70%),
              ${theme.custom.colors.primary}20
            ` 
            : `
              radial-gradient(circle at 50% 50%, ${theme.custom.colors.accent}12 0%, transparent 70%),
              ${theme.custom.colors.background.secondary}
            `,
          border: isSelected
            ? `1px solid ${theme.custom.colors.primary}50`
            : `1px solid ${theme.custom.colors.accent}40`,
          transform: 'scale(1.01)',
          boxShadow: isSelected
            ? `0 4px 20px ${theme.custom.colors.primary}20`
            : `0 4px 20px ${theme.custom.colors.accent}10`,
          '&::before': {
            left: '100%'
          },
          '&::after': {
            height: '100%'
          }
        },
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <Box display="flex" alignItems="center" width="100%" gap={2}>
        <Chip 
          label={endpoint.method}
          size="small" 
          sx={{ 
            fontWeight: '700',
            fontSize: '0.7rem',
            fontFamily: theme.custom.terminal.fontFamily,
            minWidth: '50px',
            height: '20px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
              transition: 'left 0.5s ease'
            },
            '&:hover::before': {
              left: '100%'
            },
            '&:hover': {
              transform: 'scale(1.05)',
              filter: 'brightness(1.2)'
            },
            ...methodStyle
          }} 
        />
        <Typography 
          variant="body2" 
          sx={{ 
            color: theme.custom.colors.text.primary,
            fontSize: '0.85rem',
            fontWeight: '400'
          }}
        >
          {endpoint.summary}
        </Typography>
      </Box>
    </ListItem>
  );
};