
export interface RequiredParam {
    name: string;
    type: string;
    description: string;
  }
  
  export interface ResponseField {
    name: string;
    type: string;
    description: string;
  }
  
  export interface ResponseSchema {
    brief: string;
    fields: ResponseField[];
  }
  
  export interface Documentation {
    description: string;
    required_params: RequiredParam[];
    response_schema: ResponseSchema;
  }
  
  export interface CodeExample {
    language: string;
    code: string;
    description: string;
  }
  
 export interface EndpointData {
    method: string;
    path: string;
    summary: string;
    operation_id: string;
    doc_url: string;
    documentation: Documentation;
    code_examples: CodeExample[];
    category: string;
  }

  // Define default values for EndpointData
export const defaultEndpointData: EndpointData = {
    method: '',
    path: '',
    summary: '',
    operation_id: '',
    doc_url: '',
    documentation: {
      description: '',
      required_params: [],
      response_schema: {
        brief: '',
        fields: [],
      },
    },
    code_examples: [],
    category: '',
  };
  
  export interface DocumentationPanelProps {
    endpointId: number | null;
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
  
