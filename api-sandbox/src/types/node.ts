import { Endpoint } from './api';

// Common data transformation operations
export type DataOperation = 
  | 'filter_fields'      // Select specific fields from objects
  | 'filter_array'       // Filter array elements by field matching
  | 'custom_code';       // Custom Python transformation

export interface DataProcessingConfiguration {
  id: string;
  type: 'DATA_PROCESSING';
  operation: DataOperation;
  config: {
    // For field filtering
    selectedFields?: string[];
    // For array filtering (legacy single field)
    filterField?: string;
    filterValue?: string; // Can be single value or comma-separated multiple values
    // For array filtering (new multiple fields)
    filterFields?: Array<{ field: string; value: string }>;
    // For custom code
    customCode?: string;
  };
  inputMappings: Record<string, string>; // Maps input field to source node output
  outputFieldSelections: string[];
}

export interface NodeConfiguration {
  id: string;
  type: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'DATA_PROCESSING';
  endpoint?: Endpoint;
  url?: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: string;
  pathParams?: Record<string, string>;
  resolvedPathParams?: Record<string, string>; // Store actual values used in successful tests
  outputFieldSelections: string[];
  inputMappings: Record<string, string>; // Maps input field to source node output
  
  // Data processing specific configuration
  dataProcessing?: DataProcessingConfiguration;
}

export interface NodeTestResult {
  nodeId: string;
  success: boolean;
  response?: any;
  error?: string;
  errorType?: string;
  statusCode?: number;
  timestamp: number;
  executionTime?: number;
  requestUrl?: string;
  responseHeaders?: Record<string, string>;
  sessionId?: string;
  generatedCode?: string;
  fullCode?: string;
}

export interface NodeValidationError {
  nodeId: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface NodeConnection {
  sourceNodeId: string;
  targetNodeId: string;
  sourceField: string;
  targetField: string;
}

export interface NodeState {
  configurations: Record<string, NodeConfiguration>;
  testResults: Record<string, NodeTestResult>;
  validationErrors: Record<string, NodeValidationError[]>;
  connections: NodeConnection[];
}

export type NodeAction = 
  | { type: 'UPDATE_CONFIGURATION'; nodeId: string; config: Partial<NodeConfiguration> }
  | { type: 'SET_TEST_RESULT'; nodeId: string; result: NodeTestResult }
  | { type: 'ADD_VALIDATION_ERROR'; nodeId: string; error: NodeValidationError }
  | { type: 'CLEAR_VALIDATION_ERRORS'; nodeId: string }
  | { type: 'ADD_CONNECTION'; connection: NodeConnection }
  | { type: 'REMOVE_CONNECTION'; sourceNodeId: string; targetNodeId: string }
  | { type: 'INITIALIZE_NODE'; nodeId: string; endpoint?: Endpoint }
  | { type: 'INITIALIZE_DATA_PROCESSING_NODE'; nodeId: string; operation?: DataOperation }
  | { type: 'REMOVE_NODE'; nodeId: string }
  | { type: 'CLEAR_ALL_NODES' }; 