// Types for the Endpoint Generator based on the design schema

export interface Parameter {
  name: string;
  type: string;
  required: boolean;
  example?: any;
  description?: string;
}

export interface Header {
  name: string;
  value: string;
  required?: boolean;
}

export interface Endpoint {
  method: string;
  url_template: string;
  path_params?: Parameter[];
  query_params?: Parameter[];
  headers?: Header[];
}

export interface ExampleRequest {
  curl?: string;
  [key: string]: any;
}

export interface ExampleResponse {
  mock?: any;
}

export interface Pagination {
  type: string;
  note?: string;
}

export interface ResponseSchema {
  type: string;
  items?: any;
  properties?: any;
}

export interface EndpointStep {
  id: string;
  name: string;
  description: string;
  ai_guidance?: string;
  endpoint: Endpoint;
  pagination?: Pagination;
  response_schema?: ResponseSchema;
  example_request?: ExampleRequest;
  example_response?: ExampleResponse;
  notes?: string;
  confidence: number;
  
}

export interface DataFlowEdge {
  from: string;
  to: string;
  map: string;
}

export interface DataFlow {
  edges: DataFlowEdge[];
}

export interface ParsedIntent {
  raw: string;
  parsed: string[];
  confidence: number;
}

export interface AuthConfig {
  type: 'oauth2' | 'api-key' | 'basic' | 'none';
  scopes?: string[];
}

export interface SourceDoc {
  url: string;
  snippet?: string;
}

export interface GenerationMetadata {
  estimated_calls_per_execution: number;
  auth?: AuthConfig;
  source_docs?: SourceDoc[];
  generated_at: string;
}

export interface InterpretedParam {
  name: string;
  value: string;
  type: string;
  editable?: boolean;
}

// Main schema interface as defined in the design
export interface GeneratedWorkflow {
  title: string;
  description: string;
  intent: ParsedIntent;
  steps: EndpointStep[];
  data_flow?: DataFlow;
  metadata: GenerationMetadata;
}

// UI State interfaces
export interface GeneratorState {
  isLoading: boolean;
  workflow: GeneratedWorkflow | null;
  selectedStepId: string | null;
  interpretedParams: InterpretedParam[];
}

export interface GeneratorConfig {
  authMethod: string;
  language: string;
  prompt: string;
}

export type AuthMethod = 'none' | 'api-key' | 'oauth2' | 'basic';
export type LanguagePreference = 'typescript' | 'python' | 'go' | 'curl';
