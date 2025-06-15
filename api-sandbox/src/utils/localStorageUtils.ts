import { ApiCall } from '../types/api';

const API_CALLS_STORAGE_KEY = 'api-sandbox-requests';

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