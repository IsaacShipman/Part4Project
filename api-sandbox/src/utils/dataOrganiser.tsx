import { Endpoint, FolderStructure } from '../types/api';

export const PREDEFINED_CATEGORIES = [
  "repositories", 
  "contents", 
  "branches", 
  "commits", 
  "pull_requests", 
  "issues",
  "users"
];

export const organizeEndpoints = (data: Record<string, Endpoint[]> | null) => {
  if (!data) return {};
  
  const categories: Record<string, Endpoint[]> = {};
  PREDEFINED_CATEGORIES.forEach(category => {
    categories[category] = [];
  });
  
  // Data is now already grouped by category from the backend
  Object.entries(data).forEach(([category, endpoints]) => {
    if (PREDEFINED_CATEGORIES.includes(category)) {
      categories[category] = endpoints;
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