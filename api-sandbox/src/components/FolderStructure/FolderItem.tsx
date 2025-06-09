import React from 'react';
import {
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Typography,
  List
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { FolderItemProps } from '../../types/api';
import { EndpointItem } from './EndpointItem';

interface FolderItemComponentProps extends FolderItemProps {
  isExpanded: boolean;
  onToggle: (folderName: string) => void;
}

export const FolderItem: React.FC<FolderItemComponentProps> = ({ 
  name, 
  structure, 
  onSelectEndpoint, 
  selectedEndpointId,
  isExpanded,
  onToggle
}) => {
  const hasEndpoints = structure.endpoints && structure.endpoints.length > 0;

  return (
    <>
      <ListItem 
        component="div"
        onClick={() => onToggle(name)}
        sx={{ 
          borderRadius: '12px',
          margin: '4px 8px',
          padding: '12px 16px',
          position: 'relative',
          background: 'rgba(30, 41, 59, 0.4)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          overflow: 'hidden',
          zIndex: 2,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 70% 30%, rgba(16, 185, 129, 0.03) 0%, transparent 60%),
              linear-gradient(45deg, rgba(6, 78, 59, 0.05) 0%, transparent 50%)
            `,
            opacity: 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none'
          },
          '&:hover': { 
            background: `
              radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 70%),
              rgba(51, 65, 85, 0.5)
            `,
            border: '1px solid rgba(16, 185, 129, 0.3)',
            transform: 'translateY(-2px) scale(1.01)',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.4),
              0 0 20px rgba(16, 185, 129, 0.1)
            `,
            '&::before': {
              opacity: 1
            }
          },
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          width: 'calc(100% - 16px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <ListItemIcon 
          sx={{
            display: 'flex',
            flexGrow: 0,
            color: '#64748b',
            minWidth: '32px'
          }}
        >
          {isExpanded ? 
            <ExpandLessIcon sx={{ 
              color: '#60a5fa',
              transition: 'all 0.3s ease',
              transform: 'rotate(0deg)'
            }} /> : 
            <ExpandMoreIcon sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                color: '#10b981',
                transform: 'scale(1.1)'
              }
            }} />
          }
        </ListItemIcon>
        <ListItemText 
          primary={
            <Typography 
              variant="body1" 
              fontWeight="600" 
              sx={{ 
                color: '#e2e8f0',
                textTransform: 'capitalize',
                letterSpacing: '0.5px'
              }}
            >
              {name.replace('_', ' ')}
            </Typography>
          }
          secondary={
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#64748b',
                fontSize: '0.75rem'
              }}
            >
              {hasEndpoints ? `${structure.endpoints.length} endpoints` : 'No endpoints'}
            </Typography>
          }
          sx={{ flexGrow: 1 }}
        />
      </ListItem>
      
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ 
          paddingLeft: '8px',
          width: '100%'
        }}>
          {hasEndpoints && structure.endpoints.map((endpoint) => (
            <EndpointItem
              key={endpoint.id}
              endpoint={endpoint}
              isSelected={selectedEndpointId === endpoint.id}
              onSelect={onSelectEndpoint}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
};