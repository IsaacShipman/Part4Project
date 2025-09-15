import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { NodeState, NodeAction, NodeConfiguration, NodeTestResult, NodeValidationError, DataOperation } from '../types/node';
import { Endpoint } from '../types/api';

const NODE_STATE_STORAGE_KEY = 'api-sandbox-node-state';

// Helper function to extract selected fields from data
const extractSelectedFields = (data: any, selectedFields: string[]): any => {
  if (!selectedFields || selectedFields.length === 0) {
    return data; // Return full data if no fields are selected
  }

  if (Array.isArray(data)) {
    // Check if we're selecting specific array indices
    const arrayIndexSelections = selectedFields.filter(field => /^\[\d+\]$/.test(field));
    const fieldSelections = selectedFields.filter(field => !/^\[\d+\]$/.test(field));
    
    if (arrayIndexSelections.length > 0) { // User selected specific array indices, return only those items
      const result: any[] = [];
      arrayIndexSelections.forEach(indexField => {
        const index = parseInt(indexField.slice(1, -1)); // Extract number from [0], [1], etc.
        if (data[index] !== undefined) {
          if (fieldSelections.length > 0) {
            // Also filter fields within the selected items
            result.push(extractSelectedFields(data[index], fieldSelections));
          } else {
            // Return the full item
            result.push(data[index]);
          }
        }
      });
      return result;
    } else if (fieldSelections.length > 0) { // User selected fields to extract from all items in the array
      return data.map(item => extractSelectedFields(item, fieldSelections));
    } else {
      // No valid selections, return original array
      return data;
    }
  }

  if (typeof data === 'object' && data !== null) {
    const result: any = {};
    selectedFields.forEach(fieldPath => {
      const value = getNestedValue(data, fieldPath);
      if (value !== undefined) {
        setNestedValue(result, fieldPath, value);
      }
    });
    return result;
  }

  return data;
};

// Helper function to get nested value by path (e.g., "items0")
const getNestedValue = (obj: any, path: string): any => {
  const parts = path.split(/[.\[\]]/).filter(part => part !== '');
  let current = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    
    if (part.match(/^\d+$/)) {
      // Array index
      current = current[parseInt(part)];
    } else {
      // Object property
      current = current[part];
    }
  }
  
  return current;
};

// Helper function to set nested value by path
const setNestedValue = (obj: any, path: string, value: any): void => {
  const parts = path.split(/[.\[\]]/).filter(part => part !== '');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const nextPart = parts[i + 1];

    if (!part) {
      continue;
    }

    if (nextPart && /^\d+$/.test(nextPart)) {
      // Next part is array index
      if (!current[part]) {
        (current as any)[part] = [];
      }
      const idx = parseInt(nextPart, 10);
      if (!Array.isArray((current as any)[part])) {
        (current as any)[part] = [];
      }
      if ((current as any)[part][idx] === undefined) {
        (current as any)[part][idx] = [];
      }
      current = (current as any)[part][idx];
      i++; // Skip the next part since we handled it
    } else {
      // Next part is object property
      if (!current[part]) {
        (current as any)[part] = {};
      }
      current = (current as any)[part];
    }
  }
  
  const lastPart = parts[parts.length - 1];
  if (!lastPart) return;
  if (/^\d+$/.test(lastPart)) {
    (current as any)[parseInt(lastPart, 10)] = value;
  } else {
    (current as any)[lastPart] = value;
  }
};

// Helper functions for localStorage
const saveNodeStateToStorage = (state: NodeState): void => {
  try {
    localStorage.setItem(NODE_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save node state to localStorage:', error);
  }
};

const loadNodeStateFromStorage = (): NodeState => {
  try {
    const storedState = localStorage.getItem(NODE_STATE_STORAGE_KEY);
    return storedState ? JSON.parse(storedState) : {
      configurations: {},
      testResults: {},
      validationErrors: {},
      connections: []
    };
  } catch (error) {
    console.error('Failed to load node state from localStorage:', error);
    return {
      configurations: {},
      testResults: {},
      validationErrors: {},
      connections: []
    };
  }
};

const initialState: NodeState = {
  configurations: {},
  testResults: {},
  validationErrors: {},
  connections: []
};

// Flag to control localStorage persistence
let shouldPersistToStorage = false;

const nodeStateReducer = (state: NodeState, action: NodeAction): NodeState => {
  let newState: NodeState;
  
  switch (action.type) {
    case 'INITIALIZE_NODE':
      newState = {
        ...state,
        configurations: {
          ...state.configurations,
          [action.nodeId]: {
            id: action.nodeId,
            type: action.endpoint?.method as any || 'GET',
            endpoint: action.endpoint,
            url: action.endpoint?.path || '',
            headers: {},
            queryParams: {},
            body: action.endpoint?.method === 'POST' || action.endpoint?.method === 'PUT' ? '{}' : undefined,
            pathParams: {},
            outputFieldSelections: [],
            inputMappings: {}
          }
        }
      };
      break;

    case 'INITIALIZE_DATA_PROCESSING_NODE':
      newState = {
        ...state,
        configurations: {
          ...state.configurations,
          [action.nodeId]: {
            id: action.nodeId,
            type: 'DATA_PROCESSING',
            outputFieldSelections: [],
            inputMappings: {},
            // Initialize with default values to prevent undefined errors
            url: '',
            headers: {},
            queryParams: {},
            pathParams: {},
            dataProcessing: {
              id: action.nodeId,
              type: 'DATA_PROCESSING',
              operation: action.operation || 'filter_fields',
              config: {
                selectedFields: [],
                filterField: '',
                filterValue: '',
                customCode: 'return data'
              },
              inputMappings: {},
              outputFieldSelections: []
            }
          }
        }
      };
      break;

    case 'UPDATE_CONFIGURATION': {
      const existing = state.configurations[action.nodeId];
      if (!existing) {
        // No existing node to update; ignore to keep type safety.
        newState = state;
        break;
      }
      const updated: NodeConfiguration = {
        ...existing,
        ...action.config,
        // Ensure required fields stay defined
        id: existing.id,
        type: existing.type,
        outputFieldSelections: action.config.outputFieldSelections ?? existing.outputFieldSelections ?? [],
        inputMappings: action.config.inputMappings ?? existing.inputMappings ?? {},
      };
      newState = {
        ...state,
        configurations: {
          ...state.configurations,
          [action.nodeId]: updated,
        },
      };
      break;
    }

    case 'SET_TEST_RESULT':
      newState = {
        ...state,
        testResults: {
          ...state.testResults,
          [action.nodeId]: action.result
        }
      };
      break;

    case 'ADD_VALIDATION_ERROR':
      newState = {
        ...state,
        validationErrors: {
          ...state.validationErrors,
          [action.nodeId]: [
            ...(state.validationErrors[action.nodeId] || []),
            action.error
          ]
        }
      };
      break;

    case 'CLEAR_VALIDATION_ERRORS':
      newState = {
        ...state,
        validationErrors: {
          ...state.validationErrors,
          [action.nodeId]: []
        }
      };
      break;

    case 'ADD_CONNECTION':
      newState = {
        ...state,
        connections: [...state.connections, action.connection]
      };
      break;

    case 'REMOVE_CONNECTION':
      newState = {
        ...state,
        connections: state.connections.filter(
          conn => !(conn.sourceNodeId === action.sourceNodeId && conn.targetNodeId === action.targetNodeId)
        )
      };
      break;

    case 'REMOVE_NODE':
      const { [action.nodeId]: removedConfig, ...restConfigs } = state.configurations;
      const { [action.nodeId]: removedResult, ...restResults } = state.testResults;
      const { [action.nodeId]: removedErrors, ...restErrors } = state.validationErrors;
      
      newState = {
        ...state,
        configurations: restConfigs,
        testResults: restResults,
        validationErrors: restErrors,
        connections: state.connections.filter(
          conn => conn.sourceNodeId !== action.nodeId && conn.targetNodeId !== action.nodeId
        )
      };
      break;

    case 'CLEAR_ALL_NODES':
      newState = {
        configurations: {},
        testResults: {},
        validationErrors: {},
        connections: []
      };
      break;

    default:
      return state;
  }

  // Save to localStorage after every state change (only if persistence is enabled)
  if (shouldPersistToStorage) {
    saveNodeStateToStorage(newState);
  }
  return newState;
};

interface NodeStateContextType {
  state: NodeState;
  dispatch: React.Dispatch<NodeAction>;
  getNodeConfiguration: (nodeId: string) => NodeConfiguration | undefined;
  getNodeTestResult: (nodeId: string) => NodeTestResult | undefined;
  getNodeValidationErrors: (nodeId: string) => NodeValidationError[];
  hasValidationErrors: (nodeId: string) => boolean;
  getAvailableInputs: (nodeId: string) => { [sourceNodeId: string]: string[] };
  getInputData: (nodeId: string) => { [sourceNodeId: string]: any };
  getConnectedInputNodes: (nodeId: string) => NodeConfiguration[];
  enablePersistence: () => void;
  disablePersistence: () => void;
}

const NodeStateContext = createContext<NodeStateContextType | undefined>(undefined);

export const useNodeState = () => {
  const context = useContext(NodeStateContext);
  if (!context) {
    throw new Error('useNodeState must be used within a NodeStateProvider');
  }
  return context;
};

interface NodeStateProviderProps {
  children: ReactNode;
}

export const NodeStateProvider: React.FC<NodeStateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(nodeStateReducer, initialState);

  const getNodeConfiguration = (nodeId: string): NodeConfiguration | undefined => {
    return state.configurations[nodeId];
  };

  const getNodeTestResult = (nodeId: string): NodeTestResult | undefined => {
    return state.testResults[nodeId];
  };

  const getNodeValidationErrors = (nodeId: string): NodeValidationError[] => {
    return state.validationErrors[nodeId] || [];
  };

  const hasValidationErrors = (nodeId: string): boolean => {
    const errors = state.validationErrors[nodeId] || [];
    return errors.some(error => error.severity === 'error');
  };

  const getAvailableInputs = (nodeId: string): { [sourceNodeId: string]: string[] } => {
    const inputs: { [sourceNodeId: string]: string[] } = {};
    
    // Find all connections where this node is the target
    const incomingConnections = state.connections.filter(conn => conn.targetNodeId === nodeId);
    
    incomingConnections.forEach(connection => {
      const sourceNodeConfig = state.configurations[connection.sourceNodeId];
      if (sourceNodeConfig && sourceNodeConfig.outputFieldSelections) {
        inputs[connection.sourceNodeId] = sourceNodeConfig.outputFieldSelections;
      }
    });
    
    return inputs;
  };

  const getInputData = (nodeId: string): { [sourceNodeId: string]: any } => {
    const inputData: { [sourceNodeId: string]: any } = {};
    
    // Find all connections where this node is the target
    const incomingConnections = state.connections.filter(conn => conn.targetNodeId === nodeId);
    
    incomingConnections.forEach(connection => {
      const sourceNodeResult = state.testResults[connection.sourceNodeId];
      if (sourceNodeResult && sourceNodeResult.success && sourceNodeResult.response) {
        const sourceNodeConfig = state.configurations[connection.sourceNodeId];
        if (sourceNodeConfig && sourceNodeConfig.outputFieldSelections) {
          inputData[connection.sourceNodeId] = extractSelectedFields(sourceNodeResult.response, sourceNodeConfig.outputFieldSelections);
          console.log('Processing data:', sourceNodeResult.response);
console.log('Selected fields:', sourceNodeConfig.outputFieldSelections);
console.log('Filtered result:', extractSelectedFields(sourceNodeResult.response, sourceNodeConfig.outputFieldSelections));
        } else {
          inputData[connection.sourceNodeId] = sourceNodeResult.response;
        }
      }
    });
    
    return inputData;
  };

  const getConnectedInputNodes = (nodeId: string): NodeConfiguration[] => {
    const connectedNodes: NodeConfiguration[] = [];
    
    // Find all connections where this node is the target
    const incomingConnections = state.connections.filter(conn => conn.targetNodeId === nodeId);
    
    incomingConnections.forEach(connection => {
      const sourceNodeConfig = state.configurations[connection.sourceNodeId];
      if (sourceNodeConfig) {
        connectedNodes.push(sourceNodeConfig);
      }
    });
    
    return connectedNodes;
  };

  const enablePersistence = () => {
    shouldPersistToStorage = true;
  };

  const disablePersistence = () => {
    shouldPersistToStorage = false;
  };

  const contextValue: NodeStateContextType = {
    state,
    dispatch,
    getNodeConfiguration,
    getNodeTestResult,
    getNodeValidationErrors,
    hasValidationErrors,
    getAvailableInputs,
    getInputData,
    getConnectedInputNodes,
    enablePersistence,
    disablePersistence
  };

  return (
    <NodeStateContext.Provider value={contextValue}>
      {children}
    </NodeStateContext.Provider>
  );
}; 