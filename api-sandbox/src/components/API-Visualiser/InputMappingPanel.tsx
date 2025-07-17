import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  styled,
  alpha,
} from '@mui/material';
import {
  Search,
  ExpandMore,
  Visibility,
  VisibilityOff,
  DataObject,
  Api,
  Transform,
  CheckCircle,
  Warning,
  Info,
  FilterList,
  Clear,
} from '@mui/icons-material';
import { NodeConfiguration } from '../../types/node';

// Styled components for consistent theming
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(30, 41, 59, 0.6)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '8px',
    color: '#e2e8f0',
    '&:hover': {
      border: '1px solid rgba(148, 163, 184, 0.4)',
    },
    '&.Mui-focused': {
      border: '1px solid rgba(16, 185, 129, 0.6)',
      boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
    },
    '& fieldset': {
      border: 'none',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-focused': {
      color: 'rgba(16, 185, 129, 0.8)',
    },
  },
  '& .MuiInputBase-input': {
    color: '#e2e8f0',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.5)',
      opacity: 1,
    },
  },
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.6)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '8px',
  marginBottom: theme.spacing(1),
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: theme.spacing(0, 0, 1, 0),
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  '& .MuiAccordionSummary-content': {
    margin: theme.spacing(1, 0),
  },
  '& .MuiAccordionSummary-expandIconWrapper': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  background: 'rgba(15, 23, 42, 0.4)',
  borderTop: '1px solid rgba(148, 163, 184, 0.1)',
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.6)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  color: '#e2e8f0',
  fontWeight: 600,
  fontSize: '0.7rem',
  height: '28px',
  '&:hover': {
    background: 'rgba(148, 163, 184, 0.1)',
    border: '1px solid rgba(148, 163, 184, 0.4)',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'rgba(16, 185, 129, 0.1)',
  border: '1px solid rgba(16, 185, 129, 0.3)',
  borderRadius: '8px',
  color: '#86efac',
  fontWeight: 600,
  fontSize: '0.8rem',
  textTransform: 'none',
  padding: '6px 12px',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'rgba(16, 185, 129, 0.2)',
    border: '1px solid rgba(16, 185, 129, 0.5)',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
  },
  '& .MuiButton-startIcon': {
    color: '#86efac',
  }
}));

// Helper function to extract only top-level/parent fields from an object
const extractTopLevelFields = (obj: any, prefix: string = ''): string[] => {
  const paths: string[] = [];
  
  if (obj === null || obj === undefined) {
    return paths;
  }
  
  if (Array.isArray(obj)) {
    // For arrays, we only want to select the structure of the first item
    // This represents the template for all items in the array
    if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
      // Add the top-level fields of the first object in the array
      Object.keys(obj[0]).forEach(key => {
        const currentPath = prefix ? `${prefix}[0].${key}` : `[0].${key}`;
        paths.push(currentPath);
      });
    }
  } else if (typeof obj === 'object') {
    // For objects, select only the immediate properties
    Object.keys(obj).forEach(key => {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      paths.push(currentPath);
    });
  }
  
  return paths;
};

interface InputMappingPanelProps {
  connectedNodes: NodeConfiguration[];
  availableInputs: { [sourceNodeId: string]: string[] };
  inputData: { [sourceNodeId: string]: any };
  onFieldSelect?: (sourceNodeId: string, fieldPath: string) => void;
}

const InputMappingPanel: React.FC<InputMappingPanelProps> = ({
  connectedNodes,
  availableInputs,
  inputData,
  onFieldSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showDataPreview, setShowDataPreview] = useState<Set<string>>(new Set());

  const handleNodeToggle = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleDataPreviewToggle = (nodeId: string) => {
    setShowDataPreview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const filteredNodesData = useMemo(() => {
    return connectedNodes.map(node => {
      const nodeInputs = availableInputs[node.id] || [];
      const hasData = inputData[node.id];
      
      // Get smart field suggestions based on actual data structure
      const smartFields = hasData ? extractTopLevelFields(inputData[node.id]) : [];
      
      // Filter fields based on search query
      const filteredFields = nodeInputs.filter(field =>
        field.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const filteredSmartFields = smartFields.filter(field =>
        field.toLowerCase().includes(searchQuery.toLowerCase())
      );

      return {
        node,
        fields: filteredFields,
        smartFields: filteredSmartFields,
        totalFields: nodeInputs.length,
        totalSmartFields: smartFields.length,
        hasData,
        dataPreview: hasData ? JSON.stringify(inputData[node.id], null, 2) : null
      };
    });
  }, [connectedNodes, availableInputs, inputData, searchQuery]);

  const totalFields = useMemo(() => {
    return Object.values(availableInputs).reduce((sum, fields) => sum + fields.length, 0);
  }, [availableInputs]);

  const totalSmartFields = useMemo(() => {
    return Object.keys(inputData).reduce((sum, nodeId) => {
      const smartFields = extractTopLevelFields(inputData[nodeId]);
      return sum + smartFields.length;
    }, 0);
  }, [inputData]);

  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'DATA_PROCESSING':
        return <Transform />;
      default:
        return <Api />;
    }
  };

  const getNodeColor = (nodeType: string) => {
    switch (nodeType) {
      case 'DATA_PROCESSING':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  return (
    <Box>
      {/* Header with search and summary */}
      <Box mb={2}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
            Connected Input Nodes ({connectedNodes.length})
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            {totalFields} selected | {totalSmartFields} available
          </Typography>
        </Box>
        
        <StyledTextField
          fullWidth
          size="small"
          placeholder="Search fields..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchQuery('')}
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* No nodes connected */}
      {connectedNodes.length === 0 && (
        <Alert severity="info" sx={{ 
          mb: 2,
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#93c5fd',
          '& .MuiAlert-icon': {
            color: '#93c5fd',
          }
        }}>
          <Typography variant="body2" sx={{ color: '#93c5fd' }}>
            No nodes are connected to this data processing node. 
            Connect API endpoint nodes or other data processing nodes to provide input data.
          </Typography>
        </Alert>
      )}

      {/* Connected nodes */}
      {filteredNodesData.map(({ node, fields, smartFields, totalFields, totalSmartFields, hasData, dataPreview }) => (
        <StyledAccordion
          key={node.id}
          expanded={expandedNodes.has(node.id)}
          onChange={() => handleNodeToggle(node.id)}
        >
          <StyledAccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              background: hasData 
                ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)'
                : 'rgba(30, 41, 59, 0.4)',
              '&.Mui-expanded': {
                background: hasData 
                  ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)'
                  : 'rgba(30, 41, 59, 0.6)',
              },
            }}
          >
            <Box display="flex" alignItems="center" gap={1} width="100%">
              {getNodeIcon(node.type)}
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <StyledChip
                    label={node.type}
                    size="small"
                    color={getNodeColor(node.type)}
                    variant="outlined"
                  />
               
                  {hasData && (
                    <StyledChip
                      label="Data Available"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>
                
                {node.endpoint && (
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    {node.endpoint.method} {node.endpoint.path}
                  </Typography>
                )}
              </Box>
              
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  {searchQuery 
                    ? `${fields.length}/${totalFields} selected | ${smartFields.length}/${totalSmartFields} available` 
                    : `${totalFields} selected | ${totalSmartFields} available`
                  }
                </Typography>
                
                {hasData && (
                  <Tooltip title="Toggle data preview">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDataPreviewToggle(node.id);
                      }}
                    >
                      {showDataPreview.has(node.id) ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </StyledAccordionSummary>
          
          <StyledAccordionDetails>
            <Box>
          
              
              {/* Data preview */}
              {hasData && (
                <Collapse in={showDataPreview.has(node.id)}>
                  <Box mb={2}>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }} gutterBottom>
                      Data Preview:
                    </Typography>
                    <StyledTextField
                      fullWidth
                      multiline
                      rows={4}
                      value={dataPreview}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        readOnly: true,
                        style: { fontFamily: 'monospace', fontSize: '0.75rem' }
                      }}
                    />
                  </Box>
                </Collapse>
              )}
              
              {/* Selected Output Fields */}
              {fields.length > 0 && (
                <Box mb={2}>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }} gutterBottom>
                    Selected Output Fields ({fields.length}):
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                    {fields.map((field, index) => (
                      <StyledChip
                        key={index}
                        label={field}
                        size="small"
                        variant="filled"
                        color="primary"
                        onClick={() => onFieldSelect?.(node.id, field)}
                        clickable={!!onFieldSelect}
                        sx={{ 
                          fontSize: '0.7rem',
                          cursor: onFieldSelect ? 'pointer' : 'default'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* No fields messages */}
              {fields.length === 0 && (
                searchQuery ? (
                  <Alert severity="info" sx={{ 
                    mt: 1,
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#93c5fd',
                    '& .MuiAlert-icon': {
                      color: '#93c5fd',
                    }
                  }}>
                    <Typography variant="body2" sx={{ color: '#93c5fd' }}>
                      No selected fields match "{searchQuery}". Try a different search term.
                    </Typography>
                  </Alert>
                ) : (
                  <Alert severity="warning" sx={{ 
                    mt: 1,
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#fcd34d',
                    '& .MuiAlert-icon': {
                      color: '#fcd34d',
                    }
                  }}>
                    <Typography variant="body2" sx={{ color: '#fcd34d' }}>
                      No output fields selected in the source node. 
                      Configure the source node to select output fields.
                    </Typography>
                  </Alert>
                )
              )}
              
        
            </Box>
          </StyledAccordionDetails>
        </StyledAccordion>
      ))}

      {/* Quick actions */}
      {connectedNodes.length > 0 && (
        <Box mt={2} display="flex" gap={1}>
          <StyledButton
            size="small"
            variant="outlined"
            onClick={() => setExpandedNodes(new Set(connectedNodes.map(n => n.id)))}
          >
            Expand All
          </StyledButton>
          <StyledButton
            size="small"
            variant="outlined"
            onClick={() => setExpandedNodes(new Set())}
          >
            Collapse All
          </StyledButton>
          <StyledButton
            size="small"
            variant="outlined"
            onClick={() => setShowDataPreview(new Set(connectedNodes.map(n => n.id)))}
          >
            Show All Data
          </StyledButton>
        </Box>
      )}
    </Box>
  );
};

export default InputMappingPanel; 