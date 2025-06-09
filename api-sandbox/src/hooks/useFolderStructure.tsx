import { useState } from 'react';

export const useFolderState = () => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [selectedEndpointId, setSelectedEndpointId] = useState<number | null>(null);

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  const selectEndpoint = (endpointId: number) => {
    setSelectedEndpointId(endpointId);
  };

  return {
    expandedFolders,
    selectedEndpointId,
    toggleFolder,
    selectEndpoint
  };
};