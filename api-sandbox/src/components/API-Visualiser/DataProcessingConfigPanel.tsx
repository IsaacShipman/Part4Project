import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Divider,
  useTheme,
  styled,
  alpha,
  Tabs,
  Tab,
  TextField,
  Button,
  Alert,
  Chip,
  Switch,
  FormControlLabel,
  Autocomplete,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import {
  Close,
  Settings,
  PlayArrow,
  Code,
  DataObject,
  ErrorOutline,
  CheckCircle,
  Delete,
  Add,
  Transform,
  Input,
  Output,
} from '@mui/icons-material';
import { useNodeState } from '../../contexts/NodeStateContext';
import { NodeConfiguration, DataOperation } from '../../types/node';
import { glassCardStyles } from '../../styles/containerStyles';
import InputMappingPanel from './InputMappingPanel';
import JsonTreeView from './JsonTreeView';

const PanelContainer = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: 20,
  right: 20,
  bottom: 20,
  width: 450,
  zIndex: 1000,
  ...glassCardStyles,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid rgba(148, 163, 184, 0.2)',
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
  background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)',
  borderBottom: '1px solid rgba(16, 185, 129, 0.3)',
  padding: '12px 16px',
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
    background: 'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.5) 50%, transparent 100%)',
  }
}));

const PanelContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 2,
  position: 'relative',
}));

const TabContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
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

const StyledTabs = styled(Tabs)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.6)',
  backdropFilter: 'blur(16px)',
  borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
  '& .MuiTabs-indicator': {
    background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.8) 0%, rgba(59, 130, 246, 0.8) 100%)',
    height: '2px',
  },
  '& .MuiTab-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 600,
    fontSize: '0.8rem',
    textTransform: 'none',
    minHeight: '48px',
    '&.Mui-selected': {
      color: 'rgba(255, 255, 255, 0.9)',
    },
    '&:hover': {
      color: 'rgba(255, 255, 255, 0.9)',
      background: 'rgba(148, 163, 184, 0.1)',
    },
  },
}));

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

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'rgba(16, 185, 129, 0.1)',
  border: '1px solid rgba(16, 185, 129, 0.3)',
  borderRadius: '8px',
  color: '#86efac',
  fontWeight: 600,
  fontSize: '0.8rem',
  textTransform: 'none',
  padding: '8px 16px',
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

// Helper function to extract all field paths from an object
const extractAllFieldPaths = (obj: any, prefix: string = '', rootKey?: string): string[] => {
  const paths: string[] = [];

  if (obj === null || obj === undefined) {
    return paths;
  }

  if (Array.isArray(obj)) {
    // For arrays, we want to extract fields from the first item as a template
    // This avoids selecting array indices like [0], [1], etc.
    if (obj.length > 0) {
      const firstItem = obj[0];
      if (typeof firstItem === 'object' && firstItem !== null) {
        // Extract fields from the first item without array indices
        Object.keys(firstItem).forEach(key => {
          const currentPath = prefix ? `${prefix}.${key}` : key;
          paths.push(currentPath);
          paths.push(...extractAllFieldPaths(firstItem[key], currentPath));
        });
      }
    }
  } else if (typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      paths.push(currentPath);
      paths.push(...extractAllFieldPaths(obj[key], currentPath));
    });
  }

  // If a rootKey is provided and this is the top-level call, prepend it to all paths
  if (rootKey && !prefix) {
    return paths.map(path => `${rootKey}.${path}`);
  }

  return paths;
};

interface DataProcessingConfigPanelProps {
  nodeId: string;
  onClose: () => void;
}

const DATA_OPERATIONS = [
  { value: 'filter_fields', label: 'Filter Fields', description: 'Select specific fields from objects' },
  { value: 'filter_array', label: 'Filter Array', description: 'Filter array elements by field matching' },
  { value: 'custom_code', label: 'Custom Code', description: 'Custom Python transformation' },
];



const DataProcessingConfigPanel: React.FC<DataProcessingConfigPanelProps> = ({ nodeId, onClose }) => {
  const theme = useTheme();
  const { 
    getNodeConfiguration, 
    getNodeTestResult, 
    getNodeValidationErrors, 
    getAvailableInputs,
    getInputData,
    getConnectedInputNodes,
    dispatch 
  } = useNodeState();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldsText, setFieldsText] = useState('');
  
  const config = getNodeConfiguration(nodeId);
  const testResult = getNodeTestResult(nodeId);
  const validationErrors = getNodeValidationErrors(nodeId);

  // Initialize fields text from config
  React.useEffect(() => {
    if (config?.dataProcessing?.config?.selectedFields && config.dataProcessing.config.selectedFields.length > 0) {
      setFieldsText(config.dataProcessing.config.selectedFields.join('\n'));
    } else {
      setFieldsText('');
    }
  }, [config?.dataProcessing?.config?.selectedFields]);

  const handleConfigUpdate = useCallback((updates: any) => {
    dispatch({ type: 'UPDATE_CONFIGURATION', nodeId, config: updates });
  }, [dispatch, nodeId]);

  const handleDataProcessingUpdate = useCallback((updates: any) => {
    const newDataProcessing = {
      ...config?.dataProcessing,
      ...updates,
    };
    handleConfigUpdate({ dataProcessing: newDataProcessing });
  }, [config?.dataProcessing, handleConfigUpdate]);

  const handleOperationChange = useCallback((operation: DataOperation) => {
    handleDataProcessingUpdate({
      operation,
      config: {
        selectedFields: operation === 'filter_fields' ? [] : undefined,
        filterField: operation === 'filter_array' ? '' : undefined,
        filterValue: operation === 'filter_array' ? '' : undefined,
        customCode: operation === 'custom_code' ? 'return data' : undefined,
      }
    });
  }, [handleDataProcessingUpdate]);

  const handleTestNode = async () => {
    if (!config?.dataProcessing) return;
    
    setIsLoading(true);
    try {
      // Get input data from connected nodes
      const inputData = getInputData(nodeId);
      const connectedNodes = getConnectedInputNodes(nodeId);
      
      // Check if we have input data
      if (connectedNodes.length === 0) {
        dispatch({
          type: 'SET_TEST_RESULT',
          nodeId,
          result: {
            nodeId,
            success: false,
            error: 'No input nodes connected. Connect an API endpoint or other data processing node first.',
            timestamp: Date.now(),
          }
        });
        return;
      }
      
      // Find the first available input data
      let processingData = null;
      for (const node of connectedNodes) {
        if (inputData[node.id]) {
          processingData = inputData[node.id];
          break;
        }
      }
      
      if (!processingData) {
        dispatch({
          type: 'SET_TEST_RESULT',
          nodeId,
          result: {
            nodeId,
            success: false,
            error: 'No data available from connected nodes. Run the source nodes first to generate data.',
            timestamp: Date.now(),
          }
        });
        return;
      }
      
      // Call the backend to process the data
      const response = await fetch('http://localhost:8000/api/process-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: processingData,
          operation: dataProcessingConfig?.operation,
          config: dataProcessingConfig?.config
        })
      });

      const result = await response.json();
      
      if (result.success) {
        dispatch({
          type: 'SET_TEST_RESULT',
          nodeId,
          result: {
            nodeId,
            success: true,
            response: result.result,
            timestamp: Date.now(),
            generatedCode: result.generated_code,
            fullCode: result.full_code,
          }
        });
      } else {
        dispatch({
          type: 'SET_TEST_RESULT',
          nodeId,
          result: {
            nodeId,
            success: false,
            error: result.error || 'Unknown error',
            timestamp: Date.now(),
            generatedCode: result.generated_code,
            fullCode: result.full_code,
          }
        });
      }
    } catch (error) {
      dispatch({
        type: 'SET_TEST_RESULT',
        nodeId,
        result: {
          nodeId,
          success: false,
          error: error instanceof Error ? error.message : 'Network error - check if backend is running',
          timestamp: Date.now(),
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!config || config.type !== 'DATA_PROCESSING') {
    return (
      <PanelContainer elevation={3}>
        <PanelHeader>
          <Typography variant="h6">Data Processing Configuration</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </PanelHeader>
        <Box p={2}>
          <Alert severity="error">Data processing node configuration not found</Alert>
        </Box>
      </PanelContainer>
    );
  }

  const dataProcessingConfig = config.dataProcessing;

  return (
    <PanelContainer elevation={3}>
      <PanelHeader>
        <Box display="flex" alignItems="center" gap={2}>
          <Transform color="secondary" />
          <Box>
            <Typography variant="h6">
              Data Processing Node
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <Chip
                label={DATA_OPERATIONS.find(op => op.value === dataProcessingConfig?.operation)?.label || 'Unknown'}
                size="small"
                sx={{
                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                  color: theme.palette.secondary.main,
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                }}
              />
            </Box>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </PanelHeader>

      <PanelContent>
        <StyledTabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Inputs" icon={<DataObject />} />
          <Tab label="Configuration" icon={<Transform />} />
          <Tab label="Testing" icon={<PlayArrow />} />
    
          <Tab label="Output" icon={<DataObject />} />
        </StyledTabs>

        {activeTab === 0 && (
          <TabContent>
            <InputMappingPanel
              connectedNodes={getConnectedInputNodes(nodeId)}
              availableInputs={getAvailableInputs(nodeId)}
              inputData={getInputData(nodeId)}
              onFieldSelect={(sourceNodeId, fieldPath) => {
                // Handle field selection if needed
                console.log('Field selected:', sourceNodeId, fieldPath);
              }}
            />
          </TabContent>
        )}

        {activeTab === 1 && (
          <TabContent>
            {/* Operation Selection */}
            <Box mb={3}>
              <FormControl fullWidth>
                <InputLabel>Data Operation</InputLabel>
                <Select
                  value={dataProcessingConfig?.operation || 'filter_fields'}
                  label="Data Operation"
                  onChange={(e) => handleOperationChange(e.target.value as DataOperation)}
                >
                  {DATA_OPERATIONS.map((op) => (
                    <MenuItem key={op.value} value={op.value}>
                      <Box>
                        <Typography variant="body2">{op.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {op.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {/* <FormHelperText>
                  Select the type of data transformation to apply
                </FormHelperText> */}
              </FormControl>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Operation-specific Configuration */}
            {dataProcessingConfig?.operation === 'filter_fields' && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Field Selection
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select the fields you want to keep from each object. This is perfect for filtering down large API responses.
                </Typography>
                <StyledTextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Selected Fields (one per line)"
                  value={fieldsText}
                  onChange={(e) => {
                    // Update local state immediately for natural typing
                    setFieldsText(e.target.value);
                  }}
                  onBlur={() => {
                    // Process fields when user finishes editing
                    const fields = fieldsText.split('\n').map(f => f.trim()).filter(f => f.length > 0);
                    handleDataProcessingUpdate({
                      config: { ...dataProcessingConfig?.config, selectedFields: fields }
                    });
                  }}
                  onKeyDown={(e) => {
                    // Also process fields when user presses Ctrl+Enter or Tab
                    if ((e.ctrlKey && e.key === 'Enter') || e.key === 'Tab') {
                      const fields = fieldsText.split('\n').map(f => f.trim()).filter(f => f.length > 0);
                      handleDataProcessingUpdate({
                        config: { ...dataProcessingConfig?.config, selectedFields: fields }
                      });
                    }
                  }}
                
                  helperText="Enter field names that you want to extract from each object (one per line)"
                />
              </Box>
            )}

            {dataProcessingConfig?.operation === 'filter_array' && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Filter by Field
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Filter array elements where a specific field matches a value.
                </Typography>
                <Box display="flex" gap={2} mb={2}>
                  <StyledTextField
                    label="Field Name"
                    value={dataProcessingConfig?.config?.filterField || ''}
                    onChange={(e) => {
                      handleDataProcessingUpdate({
                        config: { ...dataProcessingConfig?.config, filterField: e.target.value }
                      });
                    }}
                    placeholder="status"
                    sx={{ flex: 1 }}
                    helperText="The field to filter by"
                  />
                  <StyledTextField
                    label="Field Value"
                    value={dataProcessingConfig?.config?.filterValue || ''}
                    onChange={(e) => {
                      handleDataProcessingUpdate({
                        config: { ...dataProcessingConfig?.config, filterValue: e.target.value }
                      });
                    }}
                    placeholder="open"
                    sx={{ flex: 1 }}
                    helperText="The value to match"
                  />
                </Box>
                <Box mt={1}>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Examples:</strong><br />
                    • Field: <code>status</code>, Value: <code>open</code> - Shows items where status equals "open"<br />
                    • Field: <code>author</code>, Value: <code>john</code> - Shows items where author equals "john"<br />
                    • Field: <code>draft</code>, Value: <code>false</code> - Shows items where draft equals "false"
                  </Typography>
                </Box>
              </Box>
            )}



            {dataProcessingConfig?.operation === 'custom_code' && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Custom Python Code
                </Typography>
                <StyledTextField
                  fullWidth
                  multiline
                  rows={8}
                  label="Transformation Code"
                  value={dataProcessingConfig?.config?.customCode || ''}
                  onChange={(e) => {
                    handleDataProcessingUpdate({
                      config: { ...dataProcessingConfig?.config, customCode: e.target.value }
                    });
                  }}
                  placeholder="# Transform the data
return [
    {
        'id': item['id'],
        'title': item['title'],
        'status': item['status']
    }
    for item in data
    if isinstance(item, dict)
]"
                  helperText="Write Python code to transform the data. Input data is available as 'data' variable. Return the transformed result."
                />
              </Box>
            )}
          </TabContent>
        )}

        {activeTab === 2 && (
          <TabContent>
            <Box display="flex" flex={1} flexDirection="column">
              <Box mb={2}>
                <StyledButton
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={handleTestNode}
                  disabled={isLoading}
                  fullWidth
                >
                  {isLoading ? 'Testing...' : 'Test Transformation'}
                </StyledButton>
              </Box>

          

              {testResult && (
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    {testResult.success ? (
                      <CheckCircle color="success" />
                    ) : (
                      <ErrorOutline color="error" />
                    )}
                    <Typography variant="subtitle2">
                      {testResult.success ? 'Success' : 'Error'}
                    </Typography>
                  </Box>

                  <StyledTextField
                    fullWidth
                    multiline
                    rows={10}
                    label={testResult.success ? 'Test Result' : 'Error Details'}
                    value={testResult.success 
                      ? JSON.stringify(testResult.response, null, 2)
                      : testResult.error || 'Unknown error'
                    }
                    variant="outlined"
                    size="small"
                    InputProps={{
                      readOnly: true,
                      style: { fontFamily: 'monospace', fontSize: '0.8rem' }
                    }}
                  />
                </Box>
              )}
            </Box>
          </TabContent>
        )}

      

        {activeTab === 3 && (
          <TabContent>
            {!testResult || !testResult.response ? (
              <Box textAlign="center" py={4}>
                <Typography variant="body2" color="text.secondary">
                  Test the transformation first to see available output fields.
                </Typography>
              </Box>
            ) : (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Available Output Fields
                  </Typography>
                  <Box>
                    <StyledButton
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        // Select all fields (extracts field paths from first array item as template)
                        // This avoids selecting array indices like [0], [1] which break data processing
                        const allFields = extractAllFieldPaths(testResult.response);
                        handleConfigUpdate({ outputFieldSelections: allFields });
                      }}
                      sx={{ mr: 1 }}
                    >
                      Select All
                    </StyledButton>
                    <StyledButton
                      size="small"
                      variant="outlined"
                      onClick={() => handleConfigUpdate({ outputFieldSelections: [] })}
                    >
                      Clear All
                    </StyledButton>
                  </Box>
                </Box>
                
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  Select the fields you want to pass to the next node. Selected fields will be available as inputs for other nodes.
                </Typography>

                {config.outputFieldSelections && config.outputFieldSelections.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary">
                      Selected fields ({config.outputFieldSelections.length}):
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                      {config.outputFieldSelections.map((field, index) => (
                        <Chip
                          key={index}
                          label={field}
                          size="small"
                          variant="outlined"
                          color="primary"
                          onDelete={() => {
                            const newSelections = config.outputFieldSelections.filter(f => f !== field);
                            handleConfigUpdate({ outputFieldSelections: newSelections });
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <JsonTreeView
                  data={testResult.response}
                  selectedFields={new Set(config.outputFieldSelections || [])}
                  onFieldToggle={(fieldPath: string, selected: boolean) => {
                    const currentSelections = config.outputFieldSelections || [];
                    const newSelections = selected
                      ? [...currentSelections, fieldPath]
                      : currentSelections.filter(f => f !== fieldPath);
                    handleConfigUpdate({ outputFieldSelections: newSelections });
                  }}
                />
              </Box>
            )}
          </TabContent>
        )}
      </PanelContent>
    </PanelContainer>
  );
};

export default DataProcessingConfigPanel; 