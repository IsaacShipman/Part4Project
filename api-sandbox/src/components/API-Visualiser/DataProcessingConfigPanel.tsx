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
import InputMappingPanel from './InputMappingPanel';
import JsonTreeView from './JsonTreeView';

const PanelContainer = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: 20,
  right: 20,
  bottom: 20,
  width: 450,
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  background: theme.custom.colors.background.gradient,
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: `1px solid ${theme.custom.colors.border.primary}`,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
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
  background: `linear-gradient(90deg, ${theme.custom.colors.accent}20 0%, ${theme.custom.colors.primary}15 100%)`,
  borderBottom: `1px solid ${theme.custom.colors.accent}30`,
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
    background: `linear-gradient(90deg, transparent 0%, ${theme.custom.colors.accent}50 50%, transparent 100%)`,
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

const StyledTabs = styled(Tabs)(({ theme }) => ({
  background: theme.custom.colors.background.tertiary,
  backdropFilter: 'blur(16px)',
  borderBottom: `1px solid ${theme.custom.colors.border.secondary}`,
  '& .MuiTabs-indicator': {
    background: `linear-gradient(90deg, ${theme.custom.colors.accent}80 0%, ${theme.custom.colors.primary}80 100%)`,
    height: '2px',
  },
  '& .MuiTab-root': {
    color: theme.custom.colors.text.muted,
    fontWeight: 600,
    fontSize: '0.8rem',
    textTransform: 'none',
    minHeight: '48px',
    '&.Mui-selected': {
      color: theme.custom.colors.text.primary,
    },
    '&:hover': {
      color: theme.custom.colors.text.primary,
      background: theme.custom.colors.background.secondary,
    },
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: theme.custom.colors.background.tertiary,
    backdropFilter: 'blur(16px)',
    border: `1px solid ${theme.custom.colors.border.secondary}`,
    borderRadius: '8px',
    color: theme.custom.colors.text.primary,
    '&:hover': {
      border: `1px solid ${theme.custom.colors.border.primary}`,
    },
    '&.Mui-focused': {
      border: `1px solid ${theme.custom.colors.accent}`,
      boxShadow: `0 0 0 2px ${theme.custom.colors.accent}20`,
    },
    '& fieldset': {
      border: 'none',
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.custom.colors.text.muted,
    '&.Mui-focused': {
      color: theme.custom.colors.accent,
    },
  },
  '& .MuiInputBase-input': {
    color: theme.custom.colors.text.primary,
    '&::placeholder': {
      color: theme.custom.colors.text.muted,
      opacity: 1,
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: `${theme.custom.colors.accent}10`,
  border: `1px solid ${theme.custom.colors.accent}30`,
  borderRadius: '8px',
  color: theme.custom.colors.accent,
  fontWeight: 600,
  fontSize: '0.8rem',
  textTransform: 'none',
  padding: '8px 16px',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: `${theme.custom.colors.accent}20`,
    border: `1px solid ${theme.custom.colors.accent}50`,
    transform: 'translateY(-1px)',
    boxShadow: `0 4px 12px ${theme.custom.colors.accent}20`,
  },
  '& .MuiButton-startIcon': {
    color: theme.custom.colors.accent,
  }
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  background: theme.custom.colors.background.tertiary,
  backdropFilter: 'blur(16px)',
  border: `1px solid ${theme.custom.colors.border.secondary}`,
  color: theme.custom.colors.text.primary,
  fontWeight: 600,
  fontSize: '0.7rem',
  height: '28px',
  '&:hover': {
    background: theme.custom.colors.background.secondary,
    border: `1px solid ${theme.custom.colors.border.primary}`,
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
        filterFields: operation === 'filter_array' ? [{ field: '', value: '' }] : undefined,
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
          <Typography variant="h6" sx={{ color: theme.custom.colors.text.primary }}>
            Data Processing Configuration
          </Typography>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{ 
              color: theme.custom.colors.text.muted,
              '&:hover': {
                color: theme.custom.colors.text.primary,
                backgroundColor: theme.custom.colors.background.secondary,
              }
            }}
          >
            <Close />
          </IconButton>
        </PanelHeader>
        <Box p={2}>
          <Alert severity="error" sx={{ 
            background: `${theme.palette.error.main}10`,
            border: `1px solid ${theme.palette.error.main}30`,
            color: theme.palette.error.main
          }}>
            Data processing node configuration not found
          </Alert>
        </Box>
      </PanelContainer>
    );
  }

  const dataProcessingConfig = config.dataProcessing;

  return (
    <PanelContainer elevation={3}>
      <PanelHeader>
        <Box display="flex" alignItems="center" gap={2}>
          <Transform sx={{ color: theme.custom.colors.accent }} />
          <Box>
            <Typography variant="h6" sx={{ color: theme.custom.colors.text.primary }}>
              Data Processing Node
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <Chip
                label={DATA_OPERATIONS.find(op => op.value === dataProcessingConfig?.operation)?.label || 'Unknown'}
                size="small"
                sx={{
                  backgroundColor: `${theme.custom.colors.accent}10`,
                  color: theme.custom.colors.accent,
                  border: `1px solid ${theme.custom.colors.accent}30`,
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                }}
              />
            </Box>
          </Box>
        </Box>
        <IconButton 
          onClick={onClose} 
          size="small"
          sx={{ 
            color: theme.custom.colors.text.muted,
            '&:hover': {
              color: theme.custom.colors.text.primary,
              backgroundColor: theme.custom.colors.background.secondary,
            }
          }}
        >
          <Close />
        </IconButton>
      </PanelHeader>

      <PanelContent>
        <StyledTabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: theme.custom.colors.border.secondary }}
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
                <InputLabel sx={{ color: theme.custom.colors.text.muted }}>Data Operation</InputLabel>
                <Select
                  value={dataProcessingConfig?.operation || 'filter_fields'}
                  label="Data Operation"
                  onChange={(e) => handleOperationChange(e.target.value as DataOperation)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: theme.custom.colors.background.tertiary,
                      border: `1px solid ${theme.custom.colors.border.secondary}`,
                      color: theme.custom.colors.text.primary,
                      '&:hover': {
                        border: `1px solid ${theme.custom.colors.border.primary}`,
                      },
                      '&.Mui-focused': {
                        border: `1px solid ${theme.custom.colors.accent}`,
                      },
                    },
                    '& .MuiSelect-icon': {
                      color: theme.custom.colors.text.muted,
                    },
                  }}
                >
                  {DATA_OPERATIONS.map((op) => (
                    <MenuItem key={op.value} value={op.value}>
                      <Box>
                        <Typography variant="body2" sx={{ color: theme.custom.colors.text.primary }}>
                          {op.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.custom.colors.text.muted }}>
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

            <Divider sx={{ my: 2, borderColor: theme.custom.colors.border.secondary }} />

            {/* Operation-specific Configuration */}
            {dataProcessingConfig?.operation === 'filter_fields' && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: theme.custom.colors.text.primary }}>
                  Field Selection
                </Typography>
                <Typography variant="body2" sx={{ color: theme.custom.colors.text.muted, mb: 2 }}>
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
                <Typography variant="subtitle2" gutterBottom sx={{ color: theme.custom.colors.text.primary }}>
                  Filter by Fields
                </Typography>
                <Typography variant="body2" sx={{ color: theme.custom.colors.text.muted, mb: 2 }}>
                  Filter array elements where specific fields match values. All conditions must be met (AND logic).
                </Typography>
                
                {(dataProcessingConfig?.config?.filterFields || []).map((filterItem: { field: string; value: string }, index: number) => (
                  <Box key={index} display="flex" gap={2} mb={2} alignItems="flex-start">
                    <StyledTextField
                      label="Field Name"
                      value={filterItem.field || ''}
                      onChange={(e) => {
                        const updatedFilters = [...(dataProcessingConfig?.config?.filterFields || [])];
                        updatedFilters[index] = { ...updatedFilters[index], field: e.target.value };
                        handleDataProcessingUpdate({
                          config: { ...dataProcessingConfig?.config, filterFields: updatedFilters }
                        });
                      }}
                      placeholder="status"
                      sx={{ flex: 1 }}
                      helperText="The field to filter by"
                    />
                    <StyledTextField
                      label="Field Value(s)"
                      value={filterItem.value || ''}
                      onChange={(e) => {
                        const updatedFilters = [...(dataProcessingConfig?.config?.filterFields || [])];
                        updatedFilters[index] = { ...updatedFilters[index], value: e.target.value };
                        handleDataProcessingUpdate({
                          config: { ...dataProcessingConfig?.config, filterFields: updatedFilters }
                        });
                      }}
                      placeholder="open,closed"
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      onClick={() => {
                        const updatedFilters = (dataProcessingConfig?.config?.filterFields || []).filter((_: { field: string; value: string }, i: number) => i !== index);
                        handleDataProcessingUpdate({
                          config: { ...dataProcessingConfig?.config, filterFields: updatedFilters }
                        });
                      }}
                      sx={{ 
                        mt: 1,
                        color: theme.palette.error.main,
                        '&:hover': { backgroundColor: `${theme.palette.error.main}10` }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
                
                <StyledButton
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => {
                    const currentFilters = dataProcessingConfig?.config?.filterFields || [];
                    handleDataProcessingUpdate({
                      config: { 
                        ...dataProcessingConfig?.config, 
                        filterFields: [...currentFilters, { field: '', value: '' }]
                      }
                    });
                  }}
                  fullWidth
                >
                  Add Field
                </StyledButton>
              </Box>
            )}



            {dataProcessingConfig?.operation === 'custom_code' && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: theme.custom.colors.text.primary }}>
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
                      <CheckCircle sx={{ color: theme.custom.colors.accent }} />
                    ) : (
                      <ErrorOutline sx={{ color: theme.palette.error.main }} />
                    )}
                    <Typography variant="subtitle2" sx={{ color: theme.custom.colors.text.primary }}>
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
                      style: { fontFamily: theme.custom.terminal.fontFamily, fontSize: '0.8rem' }
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
                <Typography variant="body2" sx={{ color: theme.custom.colors.text.muted }}>
                  Test the transformation first to see available output fields.
                </Typography>
              </Box>
            ) : (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: theme.custom.colors.text.primary }}>
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
                
                <Typography variant="caption" sx={{ color: theme.custom.colors.text.muted, mb: 2, display: 'block' }}>
                  Select the fields you want to pass to the next node. Selected fields will be available as inputs for other nodes.
                </Typography>

                {config.outputFieldSelections && config.outputFieldSelections.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="caption" sx={{ color: theme.custom.colors.text.muted }}>
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