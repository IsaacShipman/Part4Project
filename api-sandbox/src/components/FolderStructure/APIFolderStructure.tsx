import React, { useState } from 'react';
import { Box, List, Typography, Button, useTheme } from '@mui/material';
import { APIFolderStructureProps } from '../../types/api';
import { useAPIData } from '../../hooks/useAPIData';
import { useFolderState } from '../../hooks/useFolderStructure';
import { organizeEndpoints, createFolderStructures, PREDEFINED_CATEGORIES } from '../../utils/dataOrganiser';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { FolderItem } from './FolderItem';
import { FolderOpen, InsertDriveFile } from '@mui/icons-material';
import FileManager from './FileManager';

export default function APIFolderStructure({ onSelectEndpoint }: APIFolderStructureProps) {
  const { data, loading, error } = useAPIData();
  const { expandedFolders, selectedEndpointId, toggleFolder, selectEndpoint } = useFolderState();
  const [activeTab, setActiveTab] = useState<'endpoints' | 'files'>('files');
  const theme = useTheme();

  const handleEndpointClick = (endpointId: number) => {
    selectEndpoint(endpointId);
    onSelectEndpoint(endpointId);
  };

  const categoryData = organizeEndpoints(data);
  const folderStructures = data ? createFolderStructures(categoryData) : {};

  // Header styles similar to CodeEditor
  const headerStyles = {
    header: {
      background: `linear-gradient(90deg, ${theme.custom.colors.primary}20 0%, ${theme.custom.colors.accent}15 100%)`,
      borderBottom: `1px solid ${theme.custom.colors.primary}30`,
      padding: '8px 16px',
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: `linear-gradient(90deg, transparent 0%, ${theme.custom.colors.primary}50 50%, transparent 100%)`,
      }
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      marginBottom: 1
    },
    headerTitle: {
      color: theme.custom.colors.text.primary,
      fontWeight: '600',
      fontSize: '0.9rem',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
    },
    icon: {
      color: theme.custom.colors.primary,
      fontSize: 18
    },
    tabContainer: {
      display: 'flex',
      marginTop: 1
    },
    tab: {
      flex: 1,
      borderRadius: 0,
      minWidth: 'auto',
      padding: '4px 12px',
      fontSize: '0.8rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: theme.custom.colors.text.muted,
      borderBottom: '2px solid transparent',
      '&.active': {
        borderBottom: `2px solid ${theme.custom.colors.primary}`,
      },
      '&:hover': {
        background: `${theme.custom.colors.primary}05`
      }
    }
  };

  return (
    <Box sx={{
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
            radial-gradient(circle at 60% 60%, rgba(16, 185, 129, 0.05) 0%, transparent 40%),
            radial-gradient(circle at 30% 90%, rgba(6, 95, 70, 0.08) 0%, transparent 30%)
          `
          : `
            radial-gradient(circle at 60% 60%, rgba(16, 185, 129, 0.03) 0%, transparent 40%),
            radial-gradient(circle at 30% 90%, rgba(6, 95, 70, 0.05) 0%, transparent 30%)
          `,
        borderRadius: '16px',
        pointerEvents: 'none',
        zIndex: 1,
        animation: 'subtleFloat 8s ease-in-out infinite'
      },
      '@keyframes subtleFloat': {
        '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
        '50%': { transform: 'translateY(-3px) rotate(0.5deg)' }
      }
    }}>
      {/* Header with tabs */}
      <Box sx={headerStyles.header}>
      
        {/* Tab Navigation */}
        <Box sx={headerStyles.tabContainer}>
          <Button
            onClick={() => setActiveTab('endpoints')}
            className={activeTab === 'endpoints' ? 'active' : ''}
            sx={{
              ...headerStyles.tab,
              ...(activeTab === 'endpoints' ? headerStyles.tab['&.active'] : {})
            }}
            startIcon={<FolderOpen fontSize="small" />}
          >
            Documentation
          </Button>
          <Button
            onClick={() => setActiveTab('files')}
            className={activeTab === 'files' ? 'active' : ''}
            sx={{
              ...headerStyles.tab,
              ...(activeTab === 'files' ? headerStyles.tab['&.active'] : {})
            }}
            startIcon={<InsertDriveFile fontSize="small" />}
          >
            Files
          </Button>
        </Box>
      </Box>

      {/* Content based on active tab */}
      {activeTab === 'endpoints' && (
        <>
          {loading && <LoadingSpinner />}
          
          {error && <ErrorMessage message={error.message} />}
          
          {!loading && !error && data && (
            <List sx={{
              width: '100%',
              height: '100%',
              padding: '4px 0',
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px'
              },
              '&::-webkit-scrollbar-track': {
                background: theme.custom.colors.border.subtle,
                borderRadius: '3px'
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme.custom.colors.border.secondary,
                borderRadius: '3px',
                '&:hover': {
                  background: theme.custom.colors.border.primary,
                }
              }
            }}>
              {PREDEFINED_CATEGORIES.map((category) => (
                <FolderItem 
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
        </>
      )}

      {activeTab === 'files' && (
        <FileManager />
      )}
    </Box>
  );
}