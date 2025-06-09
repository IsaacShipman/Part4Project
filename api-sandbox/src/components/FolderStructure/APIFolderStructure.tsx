import React from 'react';
import { Box, List } from '@mui/material';
import { APIFolderStructureProps } from '../../types/api';
import { useAPIData } from '../../hooks/useAPIData';
import { useFolderState } from '../../hooks/useFolderStructure';
import { organizeEndpoints, createFolderStructures, PREDEFINED_CATEGORIES } from '../../utils/dataOrganiser';
import { containerStyles, listStyles } from '../../styles/containerStyles';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { FolderItem } from './FolderItem';

export default function APIFolderStructure({ onSelectEndpoint }: APIFolderStructureProps) {
  const { data, loading, error } = useAPIData();
  const { expandedFolders, selectedEndpointId, toggleFolder, selectEndpoint } = useFolderState();

  const handleEndpointClick = (endpointId: number) => {
    selectEndpoint(endpointId);
    onSelectEndpoint(endpointId);
  };

  const categoryData = organizeEndpoints(data);
  const folderStructures = data ? createFolderStructures(categoryData) : {};

  return (
    <Box sx={containerStyles}>
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
    </Box>
  );
}