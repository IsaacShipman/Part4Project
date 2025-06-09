export interface CodeExample {
  language: string;
  code: string;
  description: string;
}

export interface Parameter {
  name: string;
  type: string;
  description: string;
  required?: boolean;
}

export interface ResponseField {
  name: string;
  type: string;
  description: string;
}

export interface ResponseSchemaType {
  brief: string;
  fields: ResponseField[];
}

export interface DocumentationData {
  method: string;
  path: string;
  category: string;
  summary: string;
  doc_url: string;
  documentation: {
    description: string;
    required_params: Parameter[];
    response_schema: ResponseSchemaType;
  };
  code_examples: CodeExample[];
}