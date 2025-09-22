// Simplified types for endpoint display
export interface SimpleEndpoint {
  id: string;
  name: string;
  method: string;
  url_template: string;
  description: string;
  confidence: number;
}

// Type guard to validate endpoint data
export const isValidEndpoint = (obj: any): obj is SimpleEndpoint => {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.method === 'string' &&
    typeof obj.url_template === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.confidence === 'number'
  );
};
