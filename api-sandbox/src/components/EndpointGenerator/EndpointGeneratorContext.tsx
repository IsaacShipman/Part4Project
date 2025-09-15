import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GeneratedWorkflow, InterpretedParam } from './types';
import { 
  saveEndpointGeneratorState, 
  loadEndpointGeneratorState,
  clearEndpointGeneratorState 
} from './endpointGeneratorStorage';

interface EndpointGeneratorState {
  workflow: GeneratedWorkflow | null;
  selectedStepId: string | null;
  interpretedParams: InterpretedParam[];
  language: string;
  isLoading: boolean;
  hasRestoredState: boolean;
}

type EndpointGeneratorAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_WORKFLOW'; payload: GeneratedWorkflow | null }
  | { type: 'SET_SELECTED_STEP'; payload: string | null }
  | { type: 'SET_INTERPRETED_PARAMS'; payload: InterpretedParam[] }
  | { type: 'UPDATE_PARAM'; payload: { name: string; value: string } }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'RESTORE_STATE'; payload: Partial<EndpointGeneratorState> }
  | { type: 'CLEAR_STATE' }
  | { type: 'SET_RESTORED_FLAG'; payload: boolean };

const initialState: EndpointGeneratorState = {
  workflow: null,
  selectedStepId: null,
  interpretedParams: [],
  language: 'typescript',
  isLoading: false,
  hasRestoredState: false
};

const endpointGeneratorReducer = (
  state: EndpointGeneratorState,
  action: EndpointGeneratorAction
): EndpointGeneratorState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_WORKFLOW':
      return { ...state, workflow: action.payload };
    
    case 'SET_SELECTED_STEP':
      return { ...state, selectedStepId: action.payload };
    
    case 'SET_INTERPRETED_PARAMS':
      return { ...state, interpretedParams: action.payload };
    
    case 'UPDATE_PARAM':
      return {
        ...state,
        interpretedParams: state.interpretedParams.map(param =>
          param.name === action.payload.name
            ? { ...param, value: action.payload.value }
            : param
        )
      };
    
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    
    case 'RESTORE_STATE':
      return { ...state, ...action.payload, hasRestoredState: true };
    
    case 'CLEAR_STATE':
      return { ...initialState };
    
    case 'SET_RESTORED_FLAG':
      return { ...state, hasRestoredState: action.payload };
    
    default:
      return state;
  }
};

interface EndpointGeneratorContextType {
  state: EndpointGeneratorState;
  dispatch: React.Dispatch<EndpointGeneratorAction>;
  actions: {
    setLoading: (loading: boolean) => void;
    setWorkflow: (workflow: GeneratedWorkflow | null) => void;
    setSelectedStep: (stepId: string | null) => void;
    setInterpretedParams: (params: InterpretedParam[]) => void;
    updateParam: (name: string, value: string) => void;
    setLanguage: (language: string) => void;
    clearState: () => void;
    dismissRestoredNotification: () => void;
  };
}

const EndpointGeneratorContext = createContext<EndpointGeneratorContextType | undefined>(undefined);

export const useEndpointGenerator = () => {
  const context = useContext(EndpointGeneratorContext);
  if (!context) {
    throw new Error('useEndpointGenerator must be used within an EndpointGeneratorProvider');
  }
  return context;
};

interface EndpointGeneratorProviderProps {
  children: ReactNode;
}

export const EndpointGeneratorProvider: React.FC<EndpointGeneratorProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(endpointGeneratorReducer, initialState);

  // Load persisted state on mount
  useEffect(() => {
    const persistedState = loadEndpointGeneratorState();
    if (persistedState) {
      dispatch({
        type: 'RESTORE_STATE',
        payload: {
          workflow: persistedState.workflow,
          selectedStepId: persistedState.selectedStepId,
          interpretedParams: persistedState.interpretedParams,
          language: persistedState.language
        }
      });
    }
  }, []);

  // Save state when it changes (debounced)
  useEffect(() => {
    if (state.workflow && !state.isLoading) {
      const timeoutId = setTimeout(() => {
        saveEndpointGeneratorState(
          state.workflow,
          state.selectedStepId,
          state.interpretedParams,
          state.language
        );
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [state.workflow, state.selectedStepId, state.interpretedParams, state.language, state.isLoading]);

  const actions = {
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setWorkflow: (workflow: GeneratedWorkflow | null) => dispatch({ type: 'SET_WORKFLOW', payload: workflow }),
    setSelectedStep: (stepId: string | null) => dispatch({ type: 'SET_SELECTED_STEP', payload: stepId }),
    setInterpretedParams: (params: InterpretedParam[]) => dispatch({ type: 'SET_INTERPRETED_PARAMS', payload: params }),
    updateParam: (name: string, value: string) => dispatch({ type: 'UPDATE_PARAM', payload: { name, value } }),
    setLanguage: (language: string) => dispatch({ type: 'SET_LANGUAGE', payload: language }),
    clearState: () => {
      clearEndpointGeneratorState();
      dispatch({ type: 'CLEAR_STATE' });
    },
    dismissRestoredNotification: () => dispatch({ type: 'SET_RESTORED_FLAG', payload: false })
  };

  return (
    <EndpointGeneratorContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </EndpointGeneratorContext.Provider>
  );
};
