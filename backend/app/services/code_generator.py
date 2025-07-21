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
        
        # If only one field is selected, use simple bracket notation
        if len(selected_fields) == 1:
            field_path = selected_fields[0]
            bracket_access = WorkflowCodeGenerator._convert_field_path_to_bracket_notation(field_path)
            return f"data = {input_var}{bracket_access}"
        
        # If multiple fields are selected, create a dictionary
        code_parts = []
        code_parts.append("# Extract selected fields into a dictionary")
        code_parts.append("data = {}")
        
        for field_path in selected_fields:
            bracket_access = WorkflowCodeGenerator._convert_field_path_to_bracket_notation(field_path)
            
            # Create a safe field name for the dictionary key
            # Replace dots with underscores and handle special characters
            safe_field_name = field_path.replace('.', '_').replace('-', '_').replace(' ', '_').replace('[', '_').replace(']', '_')
            
            # Add try-except to handle missing fields gracefully
            code_parts.append(f"data['{safe_field_name}'] = {input_var}{bracket_access}")
        
        return "\n".join(code_parts)
    
    @staticmethod
    def _convert_field_path_to_bracket_notation(field_path: str) -> str:
        """Convert a field path to Python bracket notation, handling array indices."""
        # Split by dots and brackets, but preserve the brackets
        import re
        parts = re.split(r'([.\[\]])', field_path)
        parts = [part for part in parts if part]  # Remove empty strings
        
        bracket_access = ""
        i = 0
        while i < len(parts):
            part = parts[i]
            
            if part == '.':
                # Skip the dot, next part is a field name
                i += 1
                if i < len(parts):
                    field_name = parts[i]
                    bracket_access += f'["{field_name}"]'
            elif part == '[':
                # Next part is an array index
                i += 1
                if i < len(parts):
                    index = parts[i]
                    bracket_access += f'[{index}]'
                    # Skip the closing bracket
                    i += 1
            elif part == ']':
                # Skip closing bracket
                pass
            else:
                # This is a field name (first part or after a dot)
                bracket_access += f'["{part}"]'
            
            i += 1
        
        return bracket_access
    
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
        
        # Create a mapping of node IDs to their processed data variables
        node_data_vars = {}
        
        # Process each node
        for i, node in enumerate(nodes):
            node_id = node['id']
            node_config = node['data']
            node_type = node_config.get('type')
            
            # Check if this node has input connections
            input_connections = [conn for conn in connections if conn['targetNodeId'] == node_id]
            
            if input_connections:
                # This node has inputs, so we need to prepare input data
                code_parts.append(f"# Prepare input data for node {node_id}")
                code_parts.append("input_data = {}")
                
                for conn in input_connections:
                    source_node_id = conn['sourceNodeId']
                    if source_node_id in node_data_vars:
                        source_var = node_data_vars[source_node_id]
                        code_parts.append(f"input_data['{source_node_id}'] = {source_var}")
                
                code_parts.append("")
            
            # Generate node-specific code
            if node_type == 'DATA_PROCESSING':
                # For data processing nodes, we need to modify the code to use input_data
                node_code = WorkflowCodeGenerator.generate_data_processing_code(node_config, i + 1)
                if input_connections:
                    # Replace the data variable with input_data
                    node_code = node_code.replace("data = response_data", "data = input_data")
            else:
                # For API nodes, we need to modify the code to use input_data for path/query params
                node_code = WorkflowCodeGenerator.generate_api_call_code(node_config, i + 1)
                if input_connections:
                    # Add code to substitute input data into path and query parameters
                    substitution_code = []
                    substitution_code.append("# Substitute input data into parameters")
                    substitution_code.append("if input_data:")
                    substitution_code.append("    for key, value in input_data.items():")
                    substitution_code.append("        if isinstance(value, dict):")
                    substitution_code.append("            for sub_key, sub_value in value.items():")
                    substitution_code.append("                if isinstance(sub_value, (str, int, float)):")
                    substitution_code.append("                    # Replace in path params")
                    substitution_code.append("                    for param_key in list(path_params.keys()):")
                    substitution_code.append("                        if path_params[param_key] == f'{{{sub_key}}}':")
                    substitution_code.append("                            path_params[param_key] = str(sub_value)")
                    substitution_code.append("                    # Replace in query params")
                    substitution_code.append("                    for param_key in list(params.keys()):")
                    substitution_code.append("                        if params[param_key] == f'{{{sub_key}}}':")
                    substitution_code.append("                            params[param_key] = str(sub_value)")
                    substitution_code.append("")
                    
                    # Insert the substitution code before the API call
                    lines = node_code.split('\n')
                    api_call_index = -1
                    for j, line in enumerate(lines):
                        if 'response = requests.' in line:
                            api_call_index = j
                            break
                    
                    if api_call_index != -1:
                        lines.insert(api_call_index, '\n'.join(substitution_code))
                        node_code = '\n'.join(lines)
            
            code_parts.append(node_code)
            code_parts.append("")
            
            # Store the variable name for this node's output
            node_data_vars[node_id] = "data"
        
        # Generate final output
        code_parts.append("# Final output")
        if node_data_vars:
            # Use the last node's data
            last_node_id = nodes[-1]['id']
            code_parts.append(f"result = {node_data_vars[last_node_id]}")
            code_parts.append("print(json.dumps(result, indent=2))")
        else:
            code_parts.append("print(data)")
        
        return "\n".join(code_parts) 