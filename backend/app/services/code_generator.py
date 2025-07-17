"""
Code generation service that converts node workflows into executable Python code.
"""
import json
from typing import Any, Dict, List, Union, Optional
from .data_processor import DataProcessorCodeGenerator

class WorkflowCodeGenerator:
    """Generate complete Python code for node workflows."""
    
    @staticmethod
    def generate_imports() -> str:
        """Generate the imports section for the Python code."""
        return """import requests
import json
from datetime import datetime
from typing import Dict, Any, List, Optional

# GitHub API base URL
GITHUB_API_BASE = "https://api.github.com"

"""

    @staticmethod
    def generate_api_call_code(node_config: Dict[str, Any], step_number: int) -> str:
        """Generate Python code for an API call node."""
        method = node_config.get('type', 'GET').upper()
        url = node_config.get('url', '')
        headers = node_config.get('headers', {})
        query_params = node_config.get('query_params', {})
        path_params = node_config.get('path_params', {})
        body = node_config.get('body')
        output_fields = node_config.get('outputFieldSelections', [])
        
        # Generate the API call code
        code_parts = []
        
        # Add path parameters as variables if they exist
        # Use resolved path params if available (from successful tests), otherwise use configured params
        resolved_params = node_config.get('resolvedPathParams', path_params)
        if resolved_params:
            code_parts.append(f"# Step {step_number}: {method} request")
            for param_name, param_value in resolved_params.items():
                code_parts.append(f"{param_name} = '{param_value}'")
        else:
            code_parts.append(f"# Step {step_number}: {method} request")
        
        # Prepare headers
        if headers:
            headers_str = json.dumps(headers, indent=4)
            code_parts.append(f"headers = {headers_str}")
        else:
            code_parts.append("headers = {}")
        
        # Prepare query parameters
        if query_params:
            params_str = json.dumps(query_params, indent=4)
            code_parts.append(f"params = {params_str}")
        else:
            code_parts.append("params = {}")
        
        # Prepare request data
        if method in ['POST', 'PUT', 'PATCH'] and body:
            try:
                # Try to parse as JSON to format it nicely
                body_data = json.loads(body)
                body_str = json.dumps(body_data, indent=4)
                code_parts.append(f"data = {body_str}")
            except json.JSONDecodeError:
                # If not valid JSON, treat as string
                code_parts.append(f"data = {repr(body)}")
        else:
            code_parts.append("data = None")
        
        # Build URL with path parameters
        if url.startswith('/'):
            # For relative URLs, construct with path parameters
            url_template = url
            for param_name in resolved_params.keys():
                url_template = url_template.replace(f"{{{param_name}}}", f"{{{param_name}}}")
            code_parts.append(f'url = f"{{GITHUB_API_BASE}}{url_template}"')
        else:
            # For absolute URLs, use as is
            code_parts.append(f'url = "{url}"')
        
        # Make the API call
        code_parts.append(f"response = requests.{method.lower()}(url, headers=headers, params=params, json=data if data else None)")
        code_parts.append("response.raise_for_status()")
        code_parts.append("response_data = response.json()")
        
        # Filter output fields if specified
        if output_fields:
            code_parts.append(WorkflowCodeGenerator._generate_clean_field_filtering_code(output_fields, "response_data"))
        else:
            code_parts.append("data = response_data")
        
        return "\n".join(code_parts)
    
    @staticmethod
    def _generate_field_filtering_code(selected_fields: List[str], input_var: str, output_var: str) -> str:
        """Generate code to filter specific fields from the response."""
        if not selected_fields:
            return f"{output_var} = {input_var}"
        
        code_parts = []
        code_parts.append(f"# Filter selected fields from {input_var}")
        code_parts.append(f"def extract_fields(data, fields):")
        code_parts.append("    if isinstance(data, list):")
        code_parts.append("        return [extract_fields(item, fields) for item in data]")
        code_parts.append("    elif isinstance(data, dict):")
        code_parts.append("        result = {}")
        code_parts.append("        for field in fields:")
        code_parts.append("        if field in data:")
        code_parts.append("            result[field] = data[field]")
        code_parts.append("        return result")
        code_parts.append("    else:")
        code_parts.append("        return data")
        
        fields_str = json.dumps(selected_fields, indent=4)
        code_parts.append(f"{output_var} = extract_fields({input_var}, {fields_str})")
        
        return "\n".join(code_parts)

    @staticmethod
    def _generate_clean_field_filtering_code(selected_fields: List[str], input_var: str) -> str:
        """Generate clean code to filter specific fields from the response."""
        if not selected_fields:
            return "data = response_data"
        
        # For now, just take the first selected field for simplicity
        # In a more advanced version, you could handle multiple fields
        field_path = selected_fields[0]
        
        # Convert field path to bracket notation
        # e.g., "id" -> ["id"], "owner.login" -> ["owner"]["login"]
        field_parts = field_path.split('.')
        bracket_access = ''.join([f'["{part}"]' for part in field_parts])
        
        return f"data = {input_var}{bracket_access}"
    
    @staticmethod
    def generate_data_processing_code(node_config: Dict[str, Any], step_number: int) -> str:
        """Generate Python code for a data processing node."""
        data_processing = node_config.get('dataProcessing', {})
        operation = data_processing.get('operation', 'custom_code')
        config = data_processing.get('config', {})
        output_fields = node_config.get('outputFieldSelections', [])
        
        code_parts = []
        code_parts.append(f"# Step {step_number}: Data processing")
        
        # Generate the processing code
        if operation == 'custom_code':
            custom_code = config.get('customCode', 'return data')
            processing_code = f"""
# Custom data processing
def process_data(data):
    {custom_code}

# Execute processing
processed_data = process_data(data)
"""
        else:
            # Use the existing DataProcessorCodeGenerator
            processing_code = DataProcessorCodeGenerator.generate_code(operation, config)
            # Replace the function call to use our data variable
            processing_code = processing_code.replace("process_data(data)", "process_data(data)")
            processing_code = processing_code.replace("print(json.dumps(result, indent=2))", "processed_data = result")
        
        code_parts.append(processing_code)
        
        # Filter output fields if specified
        if output_fields:
            code_parts.append(WorkflowCodeGenerator._generate_clean_field_filtering_code(output_fields, "processed_data"))
        else:
            code_parts.append("data = processed_data")
        
        return "\n".join(code_parts)
    
    @staticmethod
    def generate_workflow_code(workflow_data: Dict[str, Any]) -> str:
        """Generate complete Python code for a workflow."""
        nodes = workflow_data.get('nodes', [])
        connections = workflow_data.get('connections', [])
        
        if not nodes:
            return "# No nodes in workflow"
        
        # Sort nodes by their position in the workflow (you might need to adjust this based on your UI)
        # For now, we'll process them in the order they appear
        sorted_nodes = sorted(nodes, key=lambda x: x.get('position', {}).get('x', 0))
        
        code_parts = [WorkflowCodeGenerator.generate_imports()]
        code_parts.append("# Generated workflow code")
        code_parts.append("# This code performs the exact same operations as your visual workflow")
        code_parts.append("")
        
        # Generate code for each node
        for node in sorted_nodes:
            node_id = node['id']
            node_config = node['data']
            node_type = node_config.get('type')
            
            code_parts.append(f"# Node: {node_id} ({node_type})")
            
            if node_type == 'DATA_PROCESSING':
                # Use the clean data processing code generator
                node_code = WorkflowCodeGenerator.generate_data_processing_code(node_config, 1)
            else:
                # Use the clean API call code generator
                node_code = WorkflowCodeGenerator.generate_api_call_code(node_config, 1)
            
            code_parts.append(node_code)
            code_parts.append("")
        
        # Generate final output
        last_node = sorted_nodes[-1]
        last_node_id = last_node['id']
        code_parts.append("# Final output")
        code_parts.append(f"result = {last_node_id}_data")
        code_parts.append("print(json.dumps(result, indent=2))")
        
        return "\n".join(code_parts)
    
    @staticmethod
    def generate_simple_workflow_code(nodes: List[Dict[str, Any]], connections: List[Dict[str, Any]]) -> str:
        """Generate code for a simple workflow with basic node processing."""
        if not nodes:
            return "# No nodes in workflow"
        
        code_parts = [WorkflowCodeGenerator.generate_imports()]
        code_parts.append("# Generated workflow code")
        code_parts.append("")
        
        # Process each node
        for i, node in enumerate(nodes):
            node_config = node['data']
            node_type = node_config.get('type')
            
            if node_type == 'DATA_PROCESSING':
                # Use the clean data processing code generator
                node_code = WorkflowCodeGenerator.generate_data_processing_code(node_config, i + 1)
            else:
                # Use the clean API call code generator
                node_code = WorkflowCodeGenerator.generate_api_call_code(node_config, i + 1)
            
            code_parts.append(node_code)
            code_parts.append("")
        
        # Generate final output
        code_parts.append("# Final output")
        code_parts.append("print(data)")
        
        return "\n".join(code_parts) 