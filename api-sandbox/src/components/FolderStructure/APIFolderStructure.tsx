import React, { useState } from 'react';
import { Box, List, Typography, Button } from '@mui/material';
import { APIFolderStructureProps } from '../../types/api';
import { useAPIData } from '../../hooks/useAPIData';
import { useFolderState } from '../../hooks/useFolderStructure';
import { organizeEndpoints, createFolderStructures, PREDEFINED_CATEGORIES } from '../../utils/dataOrganiser';
import { containerStyles, listStyles } from '../../styles/containerStyles';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { FolderItem } from './FolderItem';
import { FolderOpen, InsertDriveFile } from '@mui/icons-material';
import FileManager from './FileManager';

export default function APIFolderStructure({ onSelectEndpoint }: APIFolderStructureProps) {
  const { data, loading, error } = useAPIData();
  const { expandedFolders, selectedEndpointId, toggleFolder, selectEndpoint } = useFolderState();
  const [activeTab, setActiveTab] = useState<'endpoints' | 'files'>('endpoints');

  const handleEndpointClick = (endpointId: number) => {
    selectEndpoint(endpointId);
    onSelectEndpoint(endpointId);
  };

  const categoryData = organizeEndpoints(data);
  const folderStructures = data ? createFolderStructures(categoryData) : {};

  // Header styles similar to CodeEditor
  const headerStyles = {
    header: {
      background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
      borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
      padding: '8px 16px',
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.5) 50%, transparent 100%)',
      }
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      marginBottom: 1
    },
    headerTitle: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontWeight: '600',
      fontSize: '0.9rem',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
    },
    icon: {
      color: 'rgba(59, 130, 246, 0.8)',
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
      color: 'rgba(255, 255, 255, 0.7)',
      borderBottom: '2px solid transparent',
      '&.active': {
 
        borderBottom: '2px solid rgba(59, 130, 246, 0.8)',
     
      },
      '&:hover': {
        background: 'rgba(59, 130, 246, 0.05)'
      }
    }
  };

  return (
    <Box sx={containerStyles}>
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
            Endpoints
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
            <List sx={listStyles}>
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