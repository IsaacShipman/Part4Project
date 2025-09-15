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
import { FolderStructure } from '../../types';

const PanelContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  background: theme.custom.colors.background.gradient,
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: `1px solid ${theme.custom.colors.border.primary}`,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.palette.mode === 'dark'
      ? `
        radial-gradient(circle at 60% 60%, ${theme.custom.colors.accent}05 0%, transparent 40%),
        radial-gradient(circle at 30% 90%, ${theme.custom.colors.accent}08 0%, transparent 30%)
      `
      : `
        radial-gradient(circle at 60% 60%, ${theme.custom.colors.accent}03 0%, transparent 40%),
        radial-gradient(circle at 30% 90%, ${theme.custom.colors.accent}05 0%, transparent 30%)
      `,
    borderRadius: '16px',
    pointerEvents: 'none',
    zIndex: 1,
  }
}));

const PanelHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.custom.colors.primary}20 0%, ${theme.custom.colors.accent}15 100%)`,
  borderBottom: `1px solid ${theme.custom.colors.primary}30`,
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
    background: `linear-gradient(90deg, transparent 0%, ${theme.custom.colors.primary}50 50%, transparent 100%)`,
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
    background: theme.custom.colors.border.subtle,
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.custom.colors.border.secondary,
    borderRadius: '3px',
    '&:hover': {
      background: theme.custom.colors.border.primary,
    },
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: 0,
  '& .MuiListItemButton-root': {
    padding: '6px 12px',
    borderRadius: '6px',
    margin: '2px 8px',
    background: theme.custom.colors.background.tertiary,
    backdropFilter: 'blur(16px)',
    border: `1px solid ${theme.custom.colors.border.secondary}`,
    transition: 'all 0.2s ease',
    '&:hover': {
      background: `${theme.custom.colors.primary}10`,
      border: `1px solid ${theme.custom.colors.primary}30`,
      transform: 'translateY(-1px)',
    },
  },
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  '& .MuiListItemText-primary': {
    color: theme.custom.colors.text.primary,
    fontSize: '0.8rem',
    fontWeight: 500,
    fontFamily: theme.custom.terminal.fontFamily,
  },
  '& .MuiListItemText-secondary': {
    color: theme.custom.colors.text.muted,
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
  const folderStructures: Record<string, FolderStructure> =
  data ? createFolderStructures(categoryData) : {} as Record<string, FolderStructure>;

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
                structure={folderStructures[category]!}
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