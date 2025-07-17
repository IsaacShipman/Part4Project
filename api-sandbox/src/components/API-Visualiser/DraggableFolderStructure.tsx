import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  styled,
  alpha,
} from '@mui/material';
import {
  Folder,
  FolderOpen,
  ExpandMore,
  ExpandLess,
  Api,
  Description,
} from '@mui/icons-material';
import { useAPIData } from '../../hooks/useAPIData';
import { useFolderState } from '../../hooks/useFolderStructure';
import { organizeEndpoints, createFolderStructures, PREDEFINED_CATEGORIES } from '../../utils/dataOrganiser';
import { LoadingSpinner } from '../FolderStructure/LoadingSpinner';
import { ErrorMessage } from '../FolderStructure/ErrorMessage';
import { DraggableFolderItem } from './DraggableFolderItem';
import { glassCardStyles } from '../../styles/containerStyles';

const PanelContainer = styled(Box)(({ theme }) => ({
  ...glassCardStyles,
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '12px',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 60% 60%, rgba(16, 185, 129, 0.05) 0%, transparent 40%),
      radial-gradient(circle at 30% 90%, rgba(6, 95, 70, 0.08) 0%, transparent 30%)
    `,
    borderRadius: '12px',
    pointerEvents: 'none',
    zIndex: 1,
  }
}));

const PanelHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
  borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
  padding: '8px 12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'relative',
  zIndex: 2,
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.5) 50%, transparent 100%)',
  }
}));

const PanelContent = styled(Box)(({ theme }) => ({
  maxHeight: '300px',
  overflowY: 'auto',
  zIndex: 2,
  position: 'relative',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(71, 85, 105, 0.1)',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(71, 85, 105, 0.3)',
    borderRadius: '3px',
    '&:hover': {
      background: 'rgba(71, 85, 105, 0.5)',
    },
  },
}));

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
    fontSize: '0.8rem',
    fontWeight: 500,
    fontFamily: '"Fira Code", "Monaco", "Cascadia Code", "Roboto Mono", monospace',
  },
  '& .MuiListItemText-secondary': {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.7rem',
  },
}));

const MethodChip = styled(Box)(({ theme }) => ({
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '0.6rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
}));

export const DraggableFolderStructure: React.FC = () => {
  const theme = useTheme();
  const { data, loading, error } = useAPIData();
  const { expandedFolders, selectedEndpointId, toggleFolder, selectEndpoint } = useFolderState();

  const handleEndpointClick = (endpointId: number) => {
    selectEndpoint(endpointId);
  };

  const categoryData = organizeEndpoints(data);
  const folderStructures = data ? createFolderStructures(categoryData) : {};

  return (

      <PanelContent sx={{minHeight: '500px'}}>
        {loading && <LoadingSpinner />}
        
        {error && <ErrorMessage message={error.message} />}
        
        {!loading && !error && data && (
          <List sx={{ padding: 0 }}>
            {PREDEFINED_CATEGORIES.map((category) => (
              <DraggableFolderItem 
                key={category}
                name={category}
                structure={folderStructures[category]}
                onSelectEndpoint={handleEndpointClick}
                selectedEndpointId={selectedEndpointId}
                isExpanded={expandedFolders[category] || false}
                onToggle={toggleFolder}
              />
            ))}
          </List>
        )}
      </PanelContent>
 
  );
}; 