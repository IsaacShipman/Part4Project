import React from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  styled,
  alpha,
  Box,
  Chip,
} from '@mui/material';
import {
  Api,
} from '@mui/icons-material';
import { Endpoint } from '../../types/api';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: 0,
  '& .MuiListItemButton-root': {
    padding: '6px 12px',
    borderRadius: '6px',
    margin: '2px 8px',
    background: `
    radial-gradient(circle at 70% 30%, ${theme.custom.colors.accent}03 0%, transparent 60%),
    linear-gradient(45deg, ${theme.custom.colors.accent}05 0%, transparent 50%)
  `,
    backdropFilter: 'blur(16px)',
    border: `1px solid ${theme.custom.colors.border.secondary}`,
    transition: 'all 0.2s ease',
    '&:hover': {
      background: `
      radial-gradient(circle at 70% 30%, ${theme.custom.colors.accent}03 0%, transparent 60%),
      linear-gradient(45deg, ${theme.custom.colors.accent}05 0%, transparent 50%)
    `,
      border: `1px solid ${theme.custom.colors.primary}30`,
      transform: 'translateY(-1px)',
    },
  },
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  '& .MuiListItemText-primary': {
    color: theme.custom.colors.text.primary,
    fontSize: '0.75rem',
    fontWeight: 500,
    fontFamily: theme.custom.terminal.fontFamily,
    wordBreak: 'break-all' as const,
    lineHeight: 1.3,
  },
  '& .MuiListItemText-secondary': {
    color: theme.custom.colors.text.muted,
    fontSize: '0.65rem',
    fontFamily: theme.custom.terminal.fontFamily,
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  color: theme.custom.colors.primary,
  minWidth: '28px',
}));

const MethodChip = styled(Chip)(({ theme }) => ({
  minWidth: '50px',
  height: '20px',
  fontSize: '0.6rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
}));

interface DraggableEndpointItemProps {
  endpoint: Endpoint;
  onSelect: () => void;
  isSelected: boolean;
}

export const DraggableEndpointItem: React.FC<DraggableEndpointItemProps> = ({
  endpoint,
  onSelect,
  isSelected,
}) => {
  const theme = useTheme();

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return theme.custom.colors.accent;
      case 'POST':
        return theme.custom.colors.primary;
      case 'PUT':
        return theme.palette.warning.main;
      case 'DELETE':
        return theme.palette.error.main;
      case 'PATCH':
        return theme.palette.secondary.main;
      default:
        return theme.custom.colors.text.muted;
    }
  };

  const handleDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: 'apiEndpoint',
      endpoint: endpoint
    }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const truncatePath = (path: string, maxLength: number = 30) => {
    if (path.length <= maxLength) return path;
    return path.substring(0, maxLength) + '...';
  };

  return (
    <StyledListItem disablePadding>
      <ListItemButton
        onClick={onSelect}
        draggable
        onDragStart={handleDragStart}
        sx={{
          backgroundColor: isSelected 
            ? `${theme.custom.colors.primary}10` 
            : 'transparent',
          borderLeft: isSelected 
            ? `3px solid ${theme.custom.colors.primary}` 
            : '3px solid transparent',
        }}
      >
        <StyledListItemIcon>
          <Api sx={{ fontSize: 16 }} />
        </StyledListItemIcon>
        <StyledListItemText
          primary={truncatePath(endpoint.path)}
          secondary={endpoint.summary || 'No description'}
        />
        <Box display="flex" alignItems="center" gap={1}>
          <MethodChip
            label={endpoint.method}
            size="small"
            sx={{
              background: getMethodColor(endpoint.method),
              color: '#ffffff',
            }}
          />
        </Box>
      </ListItemButton>
    </StyledListItem>
  );
}; 