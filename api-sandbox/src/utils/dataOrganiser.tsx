import { Endpoint, FolderStructure } from '../types/api';

export const PREDEFINED_CATEGORIES = [
  "repositories", 
  "contents", 
  "branches", 
  "commits", 
  "pull_requests", 
  "issues"
];

export const organizeEndpoints = (data: Record<string, Endpoint[]> | null) => {
  if (!data) return {};
  
  const categories: Record<string, Endpoint[]> = {};
  PREDEFINED_CATEGORIES.forEach(category => {
    categories[category] = [];
  });
  
  const allEndpoints = [...(data.repos || []), ...(data.user || [])];
  
  allEndpoints.forEach(endpoint => {
    if (PREDEFINED_CATEGORIES.includes(endpoint.category)) {
      categories[endpoint.category].push(endpoint);
    }
  });
  
  return categories;
};

export const createFolderStructures = (categoryData: Record<string, Endpoint[]>) => {
  const folderStructures: Record<string, FolderStructure> = {};
  
  PREDEFINED_CATEGORIES.forEach(category => {
    folderStructures[category] = {
      isEndpoint: false,
      fullPath: `/${category}`,
      children: {},
      endpoints: categoryData[category] || []
    };
  });
  
  return folderStructures;
};