import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types for logging
export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info' | 'success';
  message: string;
  endpoint?: string;
  statusCode?: number;
  method?: string;
  duration?: number;
  details?: string;
  stack?: string;
  userId?: string;
  sessionId?: string;
}

export interface ActivityEntry {
  id: string;
  type: 'api_request' | 'security_scan' | 'code_execution' | 'error' | 'success' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    endpoint?: string;
    method?: string;
    statusCode?: number;
    duration?: number;
    userId?: string;
    [key: string]: any;
  };
}

export interface MetricsData {
  totalRequests: number;
  successfulRequests: number;
  errorRequests: number;
  averageResponseTime: number;
  securityScans: number;
  uptime: number;
  requestTrends: {
    totalChange: string;
    successChange: string;
    errorChange: string;
    responseTimeChange: string;
  };
}

interface LoggingState {
  logs: LogEntry[];
  activities: ActivityEntry[];
  metrics: MetricsData;
  isLogging: boolean;
}

// Action types
type LoggingAction =
  | { type: 'ADD_LOG'; payload: Omit<LogEntry, 'id' | 'timestamp'> }
  | { type: 'ADD_ACTIVITY'; payload: Omit<ActivityEntry, 'id' | 'timestamp'> }
  | { type: 'UPDATE_METRICS'; payload: Partial<MetricsData> }
  | { type: 'CLEAR_LOGS' }
  | { type: 'CLEAR_ACTIVITIES' }
  | { type: 'SET_LOGGING'; payload: boolean };

// Initial state
const initialState: LoggingState = {
  logs: [],
  activities: [],
  metrics: {
    totalRequests: 0,
    successfulRequests: 0,
    errorRequests: 0,
    averageResponseTime: 0,
    securityScans: 0,
    uptime: 100,
    requestTrends: {
      totalChange: '0%',
      successChange: '0%',
      errorChange: '0%',
      responseTimeChange: '0ms'
    }
  },
  isLogging: true
};

// Reducer
function loggingReducer(state: LoggingState, action: LoggingAction): LoggingState {
  switch (action.type) {
    case 'ADD_LOG': {
      const newLog: LogEntry = {
        ...action.payload,
        id: generateId(),
        timestamp: new Date().toISOString()
      };
      
      // Keep only last 1000 logs to prevent memory issues
      const logs = [newLog, ...state.logs].slice(0, 1000);
      
      // Update metrics based on log
      let metrics = { ...state.metrics };
      if (action.payload.statusCode) {
        metrics.totalRequests += 1;
        if (action.payload.statusCode >= 200 && action.payload.statusCode < 300) {
          metrics.successfulRequests += 1;
        } else if (action.payload.statusCode >= 400) {
          metrics.errorRequests += 1;
        }
        
        // Update average response time
        if (action.payload.duration) {
          const totalTime = metrics.averageResponseTime * (metrics.totalRequests - 1) + action.payload.duration;
          metrics.averageResponseTime = Math.round(totalTime / metrics.totalRequests);
        }
      }
      
      return { ...state, logs, metrics };
    }
    
    case 'ADD_ACTIVITY': {
      const newActivity: ActivityEntry = {
        ...action.payload,
        id: generateId(),
        timestamp: new Date().toISOString()
      };
      
      // Keep only last 500 activities
      const activities = [newActivity, ...state.activities].slice(0, 500);
      
      return { ...state, activities };
    }
    
    case 'UPDATE_METRICS':
      return {
        ...state,
        metrics: { ...state.metrics, ...action.payload }
      };
    
    case 'CLEAR_LOGS':
      return { ...state, logs: [] };
    
    case 'CLEAR_ACTIVITIES':
      return { ...state, activities: [] };
    
    case 'SET_LOGGING':
      return { ...state, isLogging: action.payload };
    
    default:
      return state;
  }
}

// Helper function to generate unique IDs
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Context
interface LoggingContextType {
  state: LoggingState;
  logError: (message: string, details?: Partial<LogEntry>) => void;
  logWarning: (message: string, details?: Partial<LogEntry>) => void;
  logInfo: (message: string, details?: Partial<LogEntry>) => void;
  logSuccess: (message: string, details?: Partial<LogEntry>) => void;
  logApiRequest: (endpoint: string, method: string, statusCode: number, duration: number, details?: any) => void;
  addActivity: (activity: Omit<ActivityEntry, 'id' | 'timestamp'>) => void;
  updateMetrics: (metrics: Partial<MetricsData>) => void;
  clearLogs: () => void;
  clearActivities: () => void;
  setLogging: (enabled: boolean) => void;
}

const LoggingContext = createContext<LoggingContextType | undefined>(undefined);

// Provider component
interface LoggingProviderProps {
  children: ReactNode;
}

export const LoggingProvider: React.FC<LoggingProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(loggingReducer, initialState);

  const logError = (message: string, details?: Partial<LogEntry>) => {
    if (!state.isLogging) return;
    dispatch({
      type: 'ADD_LOG',
      payload: { level: 'error', message, ...details }
    });
    
    // Also add to activity feed
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        type: 'error',
        title: 'Error Occurred',
        description: message,
        metadata: details
      }
    });
  };

  const logWarning = (message: string, details?: Partial<LogEntry>) => {
    if (!state.isLogging) return;
    dispatch({
      type: 'ADD_LOG',
      payload: { level: 'warning', message, ...details }
    });
    
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        type: 'warning',
        title: 'Warning',
        description: message,
        metadata: details
      }
    });
  };

  const logInfo = (message: string, details?: Partial<LogEntry>) => {
    if (!state.isLogging) return;
    dispatch({
      type: 'ADD_LOG',
      payload: { level: 'info', message, ...details }
    });
    
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        type: 'info',
        title: 'Information',
        description: message,
        metadata: details
      }
    });
  };

  const logSuccess = (message: string, details?: Partial<LogEntry>) => {
    if (!state.isLogging) return;
    dispatch({
      type: 'ADD_LOG',
      payload: { level: 'success', message, ...details }
    });
    
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        type: 'success',
        title: 'Success',
        description: message,
        metadata: details
      }
    });
  };

  const logApiRequest = (endpoint: string, method: string, statusCode: number, duration: number, details?: any) => {
    if (!state.isLogging) return;
    
    const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warning' : 'info';
    const message = `${method.toUpperCase()} ${endpoint} - ${statusCode}`;
    
    dispatch({
      type: 'ADD_LOG',
      payload: {
        level,
        message,
        endpoint,
        method,
        statusCode,
        duration,
        details: details ? JSON.stringify(details) : undefined
      }
    });
    
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        type: 'api_request',
        title: `API Request ${statusCode >= 400 ? 'Failed' : 'Processed'}`,
        description: message,
        metadata: {
          endpoint,
          method,
          statusCode,
          duration,
          ...details
        }
      }
    });
  };

  const addActivity = (activity: Omit<ActivityEntry, 'id' | 'timestamp'>) => {
    if (!state.isLogging) return;
    dispatch({ type: 'ADD_ACTIVITY', payload: activity });
  };

  const updateMetrics = (metrics: Partial<MetricsData>) => {
    dispatch({ type: 'UPDATE_METRICS', payload: metrics });
  };

  const clearLogs = () => {
    dispatch({ type: 'CLEAR_LOGS' });
  };

  const clearActivities = () => {
    dispatch({ type: 'CLEAR_ACTIVITIES' });
  };

  const setLogging = (enabled: boolean) => {
    dispatch({ type: 'SET_LOGGING', payload: enabled });
  };

  const value: LoggingContextType = {
    state,
    logError,
    logWarning,
    logInfo,
    logSuccess,
    logApiRequest,
    addActivity,
    updateMetrics,
    clearLogs,
    clearActivities,
    setLogging
  };

  return (
    <LoggingContext.Provider value={value}>
      {children}
    </LoggingContext.Provider>
  );
};

// Hook to use logging context
export const useLogging = (): LoggingContextType => {
  const context = useContext(LoggingContext);
  if (!context) {
    throw new Error('useLogging must be used within a LoggingProvider');
  }
  return context;
};
