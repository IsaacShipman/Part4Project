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
  Input,
} from '@mui/icons-material';
import { useNodeState } from '../../contexts/NodeStateContext';
import { NodeConfiguration } from '../../types/node';
import { Endpoint } from '../../types/api';
import { 
  COMMON_HEADERS, 
  COMMON_QUERY_PARAMS, 
  extractPathParameters, 
  getHeaderValueSuggestions 
} from '../../constants/apiConstants';
import JsonTreeView from './JsonTreeView';
import InputMappingPanel from './InputMappingPanel';

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
  background: `linear-gradient(90deg, ${theme.custom.colors.primary}20 0%, ${theme.custom.colors.accent}15 100%)`,
  borderBottom: `1px solid ${theme.custom.colors.primary}30`,
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
    background: `linear-gradient(90deg, transparent 0%, ${theme.custom.colors.primary}50 50%, transparent 100%)`,
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
    background: `linear-gradient(90deg, ${theme.custom.colors.primary}80 0%, ${theme.custom.colors.accent}80 100%)`,
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
      border: `1px solid ${theme.custom.colors.primary}`,
      boxShadow: `0 0 0 2px ${theme.custom.colors.primary}20`,
    },
    '& fieldset': {
      border: 'none',
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.custom.colors.text.muted,
    '&.Mui-focused': {
      color: theme.custom.colors.primary,
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
  background: `${theme.custom.colors.primary}10`,
  border: `1px solid ${theme.custom.colors.primary}30`,
  borderRadius: '8px',
  color: theme.custom.colors.primary,
  fontWeight: 600,
  fontSize: '0.8rem',
  textTransform: 'none',
  padding: '8px 16px',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: `${theme.custom.colors.primary}20`,
    border: `1px solid ${theme.custom.colors.primary}50`,
    transform: 'translateY(-1px)',
    boxShadow: `0 4px 12px ${theme.custom.colors.primary}20`,
  },
  '& .MuiButton-startIcon': {
    color: theme.custom.colors.primary,
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

interface NodeConfigurationPanelProps {
  nodeId: string;
  onClose: () => void;
}

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

const NodeConfigurationPanel: React.FC<NodeConfigurationPanelProps> = ({ nodeId, onClose }) => {
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
  
  const config = getNodeConfiguration(nodeId);
  const testResult = getNodeTestResult(nodeId);
  const validationErrors = getNodeValidationErrors(nodeId);

  // Auto-detect URL parameters when URL changes
  useEffect(() => {
    if (config?.url) {
      const pathParams = extractPathParameters(config.url);
      const currentPathParams = config.pathParams || {};
      
      // Add new path parameters that don't exist
      const newPathParams = { ...currentPathParams };
      pathParams.forEach(param => {
        if (!newPathParams[param]) {
          newPathParams[param] = '';
        }
      });
      
      // Remove path parameters that are no longer in the URL
      Object.keys(currentPathParams).forEach(param => {
        if (!pathParams.includes(param)) {
          delete newPathParams[param];
        }
      });
      
      // Update if there are changes
      if (JSON.stringify(newPathParams) !== JSON.stringify(currentPathParams)) {
        dispatch({ type: 'UPDATE_CONFIGURATION', nodeId, config: { pathParams: newPathParams } });
      }
    }
  }, [config?.url, config?.pathParams, dispatch, nodeId]);

  const handleConfigUpdate = useCallback((updates: Partial<NodeConfiguration>) => {
    dispatch({ type: 'UPDATE_CONFIGURATION', nodeId, config: updates });
  }, [dispatch, nodeId]);

  const handleAddHeader = useCallback(() => {
    const newHeaders = { ...config?.headers || {}, 'New-Header': '' };
    handleConfigUpdate({ headers: newHeaders });
  }, [config?.headers, handleConfigUpdate]);

  const handleRemoveHeader = useCallback((headerName: string) => {
    const newHeaders = { ...config?.headers || {} };
    delete newHeaders[headerName];
    handleConfigUpdate({ headers: newHeaders });
  }, [config?.headers, handleConfigUpdate]);

  const handleAddQueryParam = useCallback(() => {
    const newParams = { ...config?.queryParams || {}, 'new_param': '' };
    handleConfigUpdate({ queryParams: newParams });
  }, [config?.queryParams, handleConfigUpdate]);

  const handleRemoveQueryParam = useCallback((paramName: string) => {
    const newParams = { ...config?.queryParams || {} };
    delete newParams[paramName];
    handleConfigUpdate({ queryParams: newParams });
  }, [config?.queryParams, handleConfigUpdate]);

  const handleTestNode = async () => {
   
    
    
    // Clear any previous validation errors
    dispatch({ type: 'CLEAR_VALIDATION_ERRORS', nodeId });
    
    // Basic validation
    if (!config?.url?.trim()) {
      dispatch({
        type: 'ADD_VALIDATION_ERROR',
        nodeId,
        error: {
          nodeId,
          field: 'url',
          message: 'URL is required',
          severity: 'error'
        }
      });
      return;
    }

    // Check if path parameters are filled
    const pathParams = extractPathParameters(config.url);
    const missingParams = pathParams.filter(param => !config.pathParams?.[param]?.trim());
    
    if (missingParams.length > 0) {
      missingParams.forEach(param => {
        dispatch({
          type: 'ADD_VALIDATION_ERROR',
          nodeId,
          error: {
            nodeId,
            field: 'pathParams',
            message: `Path parameter '${param}' is required`,
            severity: 'error'
          }
        });
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Get input data from connected nodes
      const inputData = getInputData(nodeId);
      const connectedNodes = getConnectedInputNodes(nodeId);
      
      // Prepare request body with input data if available
      let requestBody = config.body;
      let pathParams = { ...config.pathParams };
      let queryParams = { ...config.queryParams };
      
      if (connectedNodes.length > 0 && Object.keys(inputData).length > 0) {
        // If we have input data, merge it with the existing body
        try {
          const existingBody = config.body ? JSON.parse(config.body) : {};
          const mergedBody = { ...existingBody, ...inputData };
          requestBody = JSON.stringify(mergedBody, null, 2);
        } catch (error) {
          console.warn('Failed to merge input data with existing body:', error);
          // Fall back to just using input data
          requestBody = JSON.stringify(inputData, null, 2);
        }
        
        // Also substitute input data into path and query parameters
        // This allows dynamic values like {userId} to be filled from input data
        Object.keys(inputData).forEach(key => {
          const value = inputData[key];
          if (typeof value === 'string' || typeof value === 'number') {
            // Replace path parameters
            Object.keys(pathParams).forEach(paramKey => {
              if (pathParams[paramKey] === `{${key}}`) {
                pathParams[paramKey] = String(value);
              }
            });
            
            // Replace query parameters
            Object.keys(queryParams).forEach(paramKey => {
              if (queryParams[paramKey] === `{${key}}`) {
                queryParams[paramKey] = String(value);
              }
            });
          }
        });
      }
      
      // Call the backend test endpoint
      const response = await fetch('http://localhost:8000/api/test-node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: config.type,
          url: config.url || '',
          headers: config.headers || {},
          query_params: queryParams,
          path_params: pathParams,
          body: requestBody
        })
      });

      const result = await response.json();
      console.log(result);
      if (result.success) {
        // Store the resolved path parameters for code generation
        dispatch({
          type: 'UPDATE_CONFIGURATION',
          nodeId,
          config: {
            resolvedPathParams: pathParams
          }
        });
        
        dispatch({
          type: 'SET_TEST_RESULT',
          nodeId,
          result: {
            nodeId,
            success: true,
            response: result.response_data,
            statusCode: result.status_code,
            timestamp: Date.now(),
            executionTime: result.execution_time,
            requestUrl: result.request_url,
            responseHeaders: result.response_headers,
            sessionId: result.session_id
          }
        });
      } else {
        dispatch({
          type: 'SET_TEST_RESULT',
          nodeId,
          result: {
            nodeId,
            success: false,
            error: result.error,
            errorType: result.error_type,
            timestamp: Date.now()
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
          timestamp: Date.now()
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return theme.palette.success.main;
      case 'POST':
        return theme.palette.primary.main;
      case 'PUT':
        return theme.palette.warning.main;
      case 'DELETE':
        return theme.palette.error.main;
      case 'PATCH':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Ensure outputFieldSelections is always an array
  const outputFieldSelections = config?.outputFieldSelections || [];

  if (!config) {
    return (
      <PanelContainer elevation={3}>
        <PanelHeader>
          <Typography variant="h6">Node Configuration</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </PanelHeader>
        <Box p={2}>
          <Alert severity="error">Node configuration not found</Alert>
        </Box>
      </PanelContainer>
    );
  }

  return (
    <PanelContainer elevation={0}>
      <PanelHeader>
        <Box display="flex" alignItems="center" gap={2}>
          <Settings sx={{ color: 'rgba(59, 130, 246, 0.8)', fontSize: 20 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontWeight: '600', 
              fontSize: '0.9rem',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
            }}>
              NODE CONFIGURATION
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <StyledChip
                label={config.type}
                size="small"
              />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem' }}>
                {config.endpoint?.summary || 'Custom endpoint'}
              </Typography>
            </Box>
          </Box>
        </Box>
        <IconButton 
          onClick={onClose} 
          size="small"
          sx={{
            color: '#94a3b8',
            p: 0.5,
            '&:hover': {
              color: '#e2e8f0',
              backgroundColor: 'rgba(148, 163, 184, 0.1)',
            },
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
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Inputs" icon={<Input />} />
          <Tab label="Configuration" icon={<Settings />} />
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
            {/* URL Configuration */}
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                URL Configuration
              </Typography>
              <StyledTextField
                fullWidth
             
                value={config.url}
                onChange={(e) => handleConfigUpdate({ url: e.target.value })}
                variant="outlined"
                size="small"
                helperText="Use {param} for path parameters"
                error={validationErrors.some(e => e.field === 'url')}
              />
            </Box>

            {/* Path Parameters */}
            {config.pathParams && Object.keys(config.pathParams).length > 0 && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Path Parameters
                </Typography>
     
                {Object.entries(config.pathParams || {}).map(([key, value]) => (
                  <Box key={key} display="flex" gap={1} mb={1} alignItems="center">
                    <Chip
                      label={`{${key}}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ minWidth: 80 }}
                    />
                    <StyledTextField
                      value={value}
                      size="small"
                      sx={{ flex: 1 }}
                      onChange={(e) => {
                        handleConfigUpdate({
                          pathParams: { ...config.pathParams, [key]: e.target.value }
                        });
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}

            {/* Headers */}
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                Headers
              </Typography>
              {Object.entries(config.headers || {}).map(([key, value]) => (
                <Box key={key} display="flex" gap={1} mb={1} alignItems="center">
                  <Autocomplete
                    options={COMMON_HEADERS}
                    value={COMMON_HEADERS.find(h => h.value === key) || null}
                    onChange={(_, newValue) => {
                      if (newValue) {
                        const newHeaders = { ...config.headers };
                        delete newHeaders[key];
                        const headerName = typeof newValue === 'string' ? newValue : newValue.value;
                        newHeaders[headerName] = value;
                        handleConfigUpdate({ headers: newHeaders });
                      }
                    }}
                    renderInput={(params) => (
                      <StyledTextField
                        {...params}
                        label="Header Name"
                        size="small"
                        variant="outlined"
                        value={key}
                        onChange={(e) => {
                          const newHeaders = { ...config.headers };
                          delete newHeaders[key];
                          newHeaders[e.target.value] = value;
                          handleConfigUpdate({ headers: newHeaders });
                        }}
                      />
                    )}
                    sx={{ flex: 1 }}
                    freeSolo
                  />
                  <Autocomplete
                    options={getHeaderValueSuggestions(key)}
                    value={null}
                    onChange={(_, newValue) => {
                      if (newValue) {
                        const headerValue = typeof newValue === 'string' ? newValue : newValue.value;
                        handleConfigUpdate({
                          headers: { ...config.headers, [key]: headerValue }
                        });
                      }
                    }}
                    renderInput={(params) => (
                      <StyledTextField
                        {...params}
                        label="Header Value"
                        size="small"
                        variant="outlined"
                        value={value}
                        onChange={(e) => {
                          handleConfigUpdate({
                            headers: { ...config.headers, [key]: e.target.value }
                          });
                        }}
                      />
                    )}
                    sx={{ flex: 1 }}
                    freeSolo
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveHeader(key)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
              <StyledButton
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={handleAddHeader}
              >
                Add Header
              </StyledButton>
            </Box>

            {/* Query Parameters (for GET requests) */}
            {config.type === 'GET' && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Query Parameters
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Type any parameter name or select from common suggestions
                </Typography>
                {Object.entries(config.queryParams || {}).map(([key, value]) => {
                  const QueryParamInput = () => {
                    const [localKey, setLocalKey] = useState(key);
                    
                    const handleKeyChange = (newKey: string) => {
                      const newParams = { ...config.queryParams };
                      delete newParams[key];
                      newParams[newKey] = value;
                      handleConfigUpdate({ queryParams: newParams });
                    };

                    return (
                      <Autocomplete
                        options={COMMON_QUERY_PARAMS}
                        value={null}
                        inputValue={localKey}
                        onInputChange={(_, newInputValue) => {
                          setLocalKey(newInputValue || '');
                        }}
                        onChange={(_, newValue) => {
                          if (newValue) {
                            const paramName = typeof newValue === 'string' ? newValue : newValue.value;
                            setLocalKey(paramName);
                            handleKeyChange(paramName);
                          }
                        }}
                        onBlur={() => {
                          if (localKey !== key) {
                            handleKeyChange(localKey);
                          }
                        }}
                        renderInput={(params) => (
                          <StyledTextField
                            {...params}
                            label="Parameter Name"
                            size="small"
                            variant="outlined"
                            helperText=""
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && localKey !== key) {
                                handleKeyChange(localKey);
                              }
                            }}
                          />
                        )}
                        sx={{ flex: 1 }}
                        freeSolo
                        clearOnBlur={false}
                        handleHomeEndKeys
                      />
                    );
                  };

                  return (
                    <Box key={key} display="flex" gap={1} mb={1} alignItems="center">
                      <QueryParamInput />
                    <StyledTextField
                      label="Parameter Value"
                      value={value}
                      size="small"
                      sx={{ flex: 1 }}
                      onChange={(e) => {
                        handleConfigUpdate({
                          queryParams: { ...config.queryParams, [key]: e.target.value }
                        });
                      }}
                      helperText=""
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveQueryParam(key)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                  );
                })}
                <StyledButton
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={handleAddQueryParam}
                >
                  Add Parameter
                </StyledButton>
              </Box>
            )}

            {/* Body (for POST/PUT/PATCH requests) */}
            {['POST', 'PUT', 'PATCH'].includes(config.type) && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Request Body
                </Typography>
                <StyledTextField
                  fullWidth
                  multiline
                  rows={6}
                  label="JSON Body"
                  value={config.body || ''}
                  onChange={(e) => handleConfigUpdate({ body: e.target.value })}
                  variant="outlined"
                  size="small"
                  helperText="Enter JSON data for the request body"
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
                  sx={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#86efac',
                    '&:hover': {
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid rgba(16, 185, 129, 0.5)',
                    },
                    '&:disabled': {
                      background: 'rgba(71, 85, 105, 0.1)',
                      border: '1px solid rgba(71, 85, 105, 0.3)',
                      color: 'rgba(255, 255, 255, 0.3)',
                    }
                  }}
                >
                  {isLoading ? 'Testing...' : 'Test Node'}
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
                    {testResult.statusCode && (
                      <Chip
                        label={testResult.statusCode}
                        size="small"
                        color={testResult.success ? 'success' : 'error'}
                      />
                    )}
                    {testResult.executionTime && (
                      <Chip
                        label={`${(testResult.executionTime * 1000).toFixed(0)}ms`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {/* Request Details */}
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Request Details
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Typography variant="body2">
                        <strong>URL:</strong> {testResult.requestUrl || config.url}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Method:</strong> {config.type}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Timestamp:</strong> {new Date(testResult.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Response Headers */}
                  {testResult.responseHeaders && Object.keys(testResult.responseHeaders).length > 0 && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Response Headers
                      </Typography>
                      <Box sx={{ maxHeight: 100, overflowY: 'auto' }}>
                        {Object.entries(testResult.responseHeaders).map(([key, value]) => (
                          <Typography key={key} variant="body2" sx={{ fontSize: '0.8rem' }}>
                            <strong>{key}:</strong> {value}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Response Body */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      {testResult.success ? 'Response Body' : 'Error Details'}
                    </Typography>
                    <StyledTextField
                      fullWidth
                      multiline
                      rows={testResult.success ? 12 : 6}
                      label={testResult.success ? 'Response' : 'Error'}
                      value={testResult.success 
                        ? (typeof testResult.response === 'string' 
                            ? testResult.response 
                            : JSON.stringify(testResult.response, null, 2))
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

                     {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom color="error">
                  Validation Errors
                </Typography>
                {validationErrors.map((error, index) => (
                  <Alert key={index} severity={error.severity} sx={{ mb: 1 }}>
                    <strong>{error.field}:</strong> {error.message}
                  </Alert>
                ))}
              </Box>
            )}
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
                  Test the node first to see available output fields.
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

                {outputFieldSelections.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary">
                      Selected fields ({outputFieldSelections.length}):
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                      {outputFieldSelections.map((field, index) => (
                        <Chip
                          key={index}
                          label={field}
                          size="small"
                          variant="outlined"
                          color="primary"
                          onDelete={() => {
                            const newSelections = outputFieldSelections.filter(f => f !== field);
                            handleConfigUpdate({ outputFieldSelections: newSelections });
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <JsonTreeView
                  data={testResult.response}
                  selectedFields={new Set(outputFieldSelections)}
                  onFieldToggle={(fieldPath: string, selected: boolean) => {
                    const currentSelections = outputFieldSelections;
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

export default NodeConfigurationPanel; 