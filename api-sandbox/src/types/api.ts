export interface RequestData {
    method: string;
    url: string;
    headers: Record<string, string>;
    data?: any;
    json?: any;
    params?: any;
    timestamp: string;
    line?: number;
  }
  
  export interface ResponseData {
    status_code: number;
    headers: Record<string, string>;
    content: string;
    text?: string;
  }
  
  export interface ApiCall {
    id: number;
    line?: number;
    method: string;
    url: string;
    status: number;
    response: string;
    headers?: Record<string, string>;
    timestamp: number;
    request: RequestData;
    responseData: ResponseData;
  }

export interface RequestSummary {
    method: string;
    url: string;
    status: number;
  }

  
  // Extend Window interface for Pyodide integration
  declare global {
    interface Window {
      _pyApiCalls: any[];
      _apiInterceptorCallbacks: ((calls: ApiCall[]) => void)[];
    }
  }

  export interface Endpoint {
  id: number;
  method: string;
  path: string;
  summary: string;
  category: string;
}

export interface FolderStructure {
  isEndpoint: boolean;
  fullPath: string;
  children: Record<string, FolderStructure>;
  endpoints: Endpoint[];
}

export interface FolderItemProps {
  name: string;
  structure: FolderStructure;
  onSelectEndpoint: (endpointId: number) => void;
  selectedEndpointId: number | null;
}

export interface APIFolderStructureProps {
  onSelectEndpoint: (endpointId: number) => void;
}
