import { ApiCall } from '../types/api';
import { Edge, Node } from 'reactflow';

const API_CALLS_STORAGE_KEY = 'api-sandbox-requests';
const FLOW_STATE_STORAGE_KEY = 'api-sandbox-flow-state';

export const saveApiCalls = (calls: ApiCall[]): void => {
  try {
    localStorage.setItem(API_CALLS_STORAGE_KEY, JSON.stringify(calls));
  } catch (error) {
    console.error('Failed to save API calls to localStorage:', error);
  }
};

export const loadApiCalls = (): ApiCall[] => {
  try {
    const storedCalls = localStorage.getItem(API_CALLS_STORAGE_KEY);
    return storedCalls ? JSON.parse(storedCalls) : [];
  } catch (error) {
    console.error('Failed to load API calls from localStorage:', error);
    return [];
  }
};

export const clearApiCalls = (): void => {
  localStorage.removeItem(API_CALLS_STORAGE_KEY);
};
// Flow state persistence functions
export const saveFlowState = (nodes: Node[], edges: Edge[]): void => {
  try {
    const flowState = { nodes, edges };
    localStorage.setItem(FLOW_STATE_STORAGE_KEY, JSON.stringify(flowState));
  } catch (error) {
    console.error('Failed to save flow state to localStorage:', error);
  }
};

export const loadFlowState = (): { nodes: Node[], edges: Edge[] } => {
  try {
    const storedState = localStorage.getItem(FLOW_STATE_STORAGE_KEY);
    if (storedState) {
      const parsedState = JSON.parse(storedState);
      return {
        nodes: parsedState.nodes || [],
        edges: parsedState.edges || []
      };
    }
    return { nodes: [], edges: [] };
  } catch (error) {
    console.error('Failed to load flow state from localStorage:', error);
    return { nodes: [], edges: [] };
  }
};

export const clearFlowState = (): void => {
  localStorage.removeItem(FLOW_STATE_STORAGE_KEY);
};

// Node state persistence functions
export const clearNodeState = (): void => {
  localStorage.removeItem('api-sandbox-node-state');
};

// Clear all API Visualizer related storage
export const clearAllAPIVisualizerStorage = (): void => {
  localStorage.removeItem(API_CALLS_STORAGE_KEY);
  localStorage.removeItem(FLOW_STATE_STORAGE_KEY);
  localStorage.removeItem('api-sandbox-node-state');
  sessionStorage.removeItem('api-visualizer-initialized');
};

// Debug function to check what's in storage
export const debugStorage = (): void => {
  console.log('=== Storage Debug ===');
  console.log('API Calls:', localStorage.getItem(API_CALLS_STORAGE_KEY));
  console.log('Flow State:', localStorage.getItem(FLOW_STATE_STORAGE_KEY));
  console.log('Node State:', localStorage.getItem('api-sandbox-node-state'));
  console.log('Session Flag:', sessionStorage.getItem('api-visualizer-initialized'));
  console.log('===================');
};