import { GeneratorState, GeneratedWorkflow, InterpretedParam } from './types';

const STORAGE_KEY = 'endpoint-generator-state';

export interface PersistedState {
  workflow: GeneratedWorkflow | null;
  selectedStepId: string | null;
  interpretedParams: InterpretedParam[];
  language: string;
  lastUpdated: string;
}

export const saveEndpointGeneratorState = (
  workflow: GeneratedWorkflow | null,
  selectedStepId: string | null,
  interpretedParams: InterpretedParam[],
  language: string
): void => {
  try {
    const stateToSave: PersistedState = {
      workflow,
      selectedStepId,
      interpretedParams,
      language,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.warn('Failed to save endpoint generator state:', error);
  }
};

export const loadEndpointGeneratorState = (): PersistedState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const parsed = JSON.parse(saved) as PersistedState;
    
    // Check if the state is not too old (optional - remove if you want indefinite persistence)
    const lastUpdated = new Date(parsed.lastUpdated);
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
    
    // Clear state if older than 24 hours (optional)
    if (hoursSinceUpdate > 24) {
      clearEndpointGeneratorState();
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.warn('Failed to load endpoint generator state:', error);
    return null;
  }
};

export const clearEndpointGeneratorState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear endpoint generator state:', error);
  }
};

export const hasPersistedState = (): boolean => {
  return localStorage.getItem(STORAGE_KEY) !== null;
};
