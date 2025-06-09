import React from 'react';
import { ListItem, Typography, Box, Chip } from '@mui/material';
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
            radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.2) 0%, transparent 70%),
            rgba(59, 130, 246, 0.15)
          ` 
          : `
            radial-gradient(circle at 80% 20%, rgba(6, 78, 59, 0.08) 0%, transparent 60%),
            rgba(15, 23, 42, 0.6)
          `,
        backdropFilter: 'blur(8px)',
        border: isSelected 
          ? '1px solid rgba(59, 130, 246, 0.4)' 
          : '1px solid rgba(71, 85, 105, 0.2)',
        overflow: 'hidden',
        zIndex: 2,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.1), transparent)',
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
          background: 'linear-gradient(to bottom, rgba(16, 185, 129, 0.8), rgba(16, 185, 129, 0.2))',
          transition: 'height 0.3s ease',
          pointerEvents: 'none'
        },
        '&:hover': { 
          background: isSelected 
            ? `
              radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.25) 0%, transparent 70%),
              rgba(59, 130, 246, 0.2)
            ` 
            : `
              radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.12) 0%, transparent 70%),
              rgba(30, 41, 59, 0.6)
            `,
          border: isSelected
            ? '1px solid rgba(59, 130, 246, 0.5)'
            : '1px solid rgba(16, 185, 129, 0.4)',
          transform: 'scale(1.01)',
          boxShadow: isSelected
            ? '0 4px 20px rgba(59, 130, 246, 0.2)'
            : '0 4px 20px rgba(16, 185, 129, 0.1)',
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
            fontFamily: 'monospace',
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
            color: '#cbd5e1',
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