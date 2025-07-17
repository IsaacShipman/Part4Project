import React, { useState } from 'react';
import {
  Box,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  List,
  useTheme,
  styled,
  alpha,
  Chip,
} from '@mui/material';
import {
  Folder,
  FolderOpen,
  ExpandMore,
  ExpandLess,
  Api,
} from '@mui/icons-material';
import { DraggableEndpointItem } from './DraggableEndpointItem';
import { Endpoint, FolderStructure } from '../../types/api';

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
    fontWeight: 600,
  },
  '& .MuiListItemText-secondary': {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.7rem',
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  color: 'rgba(59, 130, 246, 0.8)',
  minWidth: '32px',
}));

const ExpandIcon = styled(Box)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.6)',
  transition: 'all 0.2s ease',
  '&:hover': {
    color: 'rgba(255, 255, 255, 0.9)',
    transform: 'scale(1.1)',
  },
}));

const EndpointCountChip = styled(Chip)(({ theme }) => ({
  background: 'rgba(59, 130, 246, 0.1)',
  border: '1px solid rgba(59, 130, 246, 0.3)',
  color: '#93c5fd',
  fontWeight: 600,
  fontSize: '0.6rem',
  height: '20px',
  '& .MuiChip-label': {
    padding: '0 6px',
  },
}));

interface DraggableFolderItemProps {
  name: string;
  structure: FolderStructure;
  onSelectEndpoint: (endpointId: number) => void;
  selectedEndpointId: number | null;
  isExpanded: boolean;
  onToggle: (folderName: string) => void;
}

export const DraggableFolderItem: React.FC<DraggableFolderItemProps> = ({
  name,
  structure,
  onSelectEndpoint,
  selectedEndpointId,
  isExpanded,
  onToggle,
}) => {
  const theme = useTheme();
  const [expandedSubfolders, setExpandedSubfolders] = useState<Record<string, boolean>>({});

  const toggleSubfolder = (subfolderName: string) => {
    setExpandedSubfolders(prev => ({
      ...prev,
      [subfolderName]: !prev[subfolderName]
    }));
  };

  const totalEndpoints = structure.endpoints.length + 
    Object.values(structure.children).reduce((acc, subfolder) => 
      acc + (subfolder as FolderStructure).endpoints.length, 0
    );

  const handleToggle = () => {
    onToggle(name);
  };

  return (
    <Box>
      <StyledListItem disablePadding>
        <ListItemButton onClick={handleToggle}>
          <StyledListItemIcon>
            {isExpanded ? <FolderOpen /> : <Folder />}
          </StyledListItemIcon>
          <StyledListItemText
            primary={name}
            secondary={`${totalEndpoints} endpoints`}
          />
          <Box display="flex" alignItems="center" gap={1}>
            <EndpointCountChip
              label={totalEndpoints}
              size="small"
            />
            <ExpandIcon>
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </ExpandIcon>
          </Box>
        </ListItemButton>
      </StyledListItem>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <List sx={{ paddingLeft: 2 }}>
          {/* Direct endpoints in this folder */}
          {structure.endpoints.map((endpoint) => (
            <DraggableEndpointItem
              key={endpoint.id}
              endpoint={endpoint}
              onSelect={() => onSelectEndpoint(endpoint.id)}
              isSelected={selectedEndpointId === endpoint.id}
            />
          ))}

          {/* Subfolders */}
          {Object.entries(structure.children).map(([subfolderName, subfolderStructure]) => {
            const subfolder = subfolderStructure as FolderStructure;
            return (
              <Box key={subfolderName}>
                <StyledListItem disablePadding>
                  <ListItemButton 
                    onClick={() => toggleSubfolder(subfolderName)}
                    sx={{ paddingLeft: 4 }}
                  >
                    <StyledListItemIcon>
                      {expandedSubfolders[subfolderName] ? <FolderOpen /> : <Folder />}
                    </StyledListItemIcon>
                    <StyledListItemText
                      primary={subfolderName}
                      secondary={`${subfolder.endpoints.length} endpoints`}
                    />
                    <Box display="flex" alignItems="center" gap={1}>
                      <EndpointCountChip
                        label={subfolder.endpoints.length}
                        size="small"
                      />
                      <ExpandIcon>
                        {expandedSubfolders[subfolderName] ? <ExpandLess /> : <ExpandMore />}
                      </ExpandIcon>
                    </Box>
                  </ListItemButton>
                </StyledListItem>

                <Collapse in={expandedSubfolders[subfolderName]} timeout="auto" unmountOnExit>
                  <List sx={{ paddingLeft: 4 }}>
                    {subfolder.endpoints.map((endpoint: Endpoint) => (
                      <DraggableEndpointItem
                        key={endpoint.id}
                        endpoint={endpoint}
                        onSelect={() => onSelectEndpoint(endpoint.id)}
                        isSelected={selectedEndpointId === endpoint.id}
                      />
                    ))}
                  </List>
                </Collapse>
              </Box>
            );
          })}
        </List>
      </Collapse>
    </Box>
  );
}; 