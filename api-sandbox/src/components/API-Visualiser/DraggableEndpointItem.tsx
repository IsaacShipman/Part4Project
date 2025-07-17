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
    background: 'rgba(30, 41, 59, 0.6)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      transform: 'translateY(-1px)',
    },
  },
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  '& .MuiListItemText-primary': {
    color: '#e2e8f0',
    fontSize: '0.75rem',
    fontWeight: 500,
    fontFamily: '"Fira Code", "Monaco", "Cascadia Code", "Roboto Mono", monospace',
    wordBreak: 'break-all' as const,
    lineHeight: 1.3,
  },
  '& .MuiListItemText-secondary': {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.65rem',
    fontFamily: '"Fira Code", "Monaco", "Cascadia Code", "Roboto Mono", monospace',
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  color: 'rgba(59, 130, 246, 0.8)',
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
        return 'rgba(34, 197, 94, 0.9)';
      case 'POST':
        return 'rgba(59, 130, 246, 0.9)';
      case 'PUT':
        return 'rgba(245, 158, 11, 0.9)';
      case 'DELETE':
        return 'rgba(239, 68, 68, 0.9)';
      case 'PATCH':
        return 'rgba(168, 85, 247, 0.9)';
      default:
        return 'rgba(71, 85, 105, 0.9)';
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
            ? 'rgba(59, 130, 246, 0.1)' 
            : 'transparent',
          borderLeft: isSelected 
            ? '3px solid #3b82f6' 
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