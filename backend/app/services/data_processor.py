"""
Data processing service that generates and executes Python code for data transformations.
"""
import json
from typing import Any, Dict, List, Union

class DataProcessorCodeGenerator:
    """Generate Python code for various data processing operations."""
    
    @staticmethod
    def generate_filter_fields_code(selected_fields: List[str]) -> str:
        """Generate Python code to filter specific fields from objects."""
        fields_str = ", ".join(f"'{field}'" for field in selected_fields)
        return f"""
# Filter specific fields from objects
def process_data(data):
    selected_fields = [{fields_str}]
    
    if isinstance(data, list):
        result = []
        for item in data:
            if isinstance(item, dict):
                filtered_item = {{field: item.get(field) for field in selected_fields if field in item}}
                result.append(filtered_item)
            else:
                result.append(item)
        return result
    elif isinstance(data, dict):
        return {{field: data.get(field) for field in selected_fields if field in data}}
    else:
        return data

# Execute the transformation
result = process_data(data)
print(json.dumps(result, indent=2))
"""

    @staticmethod
    def generate_filter_array_code(field_name: str, field_value: str) -> str:
        """Generate Python code to filter array elements by field matching (legacy single field)."""
        if not field_name.strip():
            field_name = "id"  # Default field
        
        # Parse the field value to handle different data types
        # Support multiple values separated by commas
        field_values = [v.strip() for v in field_value.split(',') if v.strip()]
        
        # Convert values to appropriate types
        parsed_values = []
        for value in field_values:
            # Try to convert to appropriate type
            if value.lower() == 'true':
                parsed_values.append(True)
            elif value.lower() == 'false':
                parsed_values.append(False)
            elif value.lower() == 'null' or value.lower() == 'none':
                parsed_values.append(None)
            else:
                # Try to convert to number first
                try:
                    if '.' in value:
                        parsed_values.append(float(value))
                    else:
                        parsed_values.append(int(value))
                except ValueError:
                    # If not a number, keep as string
                    parsed_values.append(value)
        
        # Create the comparison logic
        if len(parsed_values) == 1:
            # Single value comparison
            value = parsed_values[0]
            if isinstance(value, str):
                comparison = f"item.get('{field_name}') == '{value}'"
            elif isinstance(value, bool):
                comparison = f"item.get('{field_name}') == {value}"
            elif value is None:
                comparison = f"item.get('{field_name}') is None"
            else:
                comparison = f"item.get('{field_name}') == {value}"
        else:
            # Multiple values comparison
            value_conditions = []
            for value in parsed_values:
                if isinstance(value, str):
                    value_conditions.append(f"item.get('{field_name}') == '{value}'")
                elif isinstance(value, bool):
                    value_conditions.append(f"item.get('{field_name}') == {value}")
                elif value is None:
                    value_conditions.append(f"item.get('{field_name}') is None")
                else:
                    value_conditions.append(f"item.get('{field_name}') == {value}")
            comparison = " or ".join(value_conditions)
        
        return f"""
# Filter array elements by field matching
def process_data(data):
    if not isinstance(data, list):
        raise ValueError("Data must be an array for array filtering")
    
    result = []
    for item in data:
        try:
            if isinstance(item, dict):
                # Check if field matches any of the specified values
                if {comparison}:
                    result.append(item)
        except Exception as e:
            # If condition evaluation fails, skip the item
            continue
    
    return result

# Execute the transformation
result = process_data(data)
print(json.dumps(result, indent=2))
"""

    @staticmethod
    def generate_filter_array_multiple_fields_code(filter_fields: List[Dict[str, str]]) -> str:
        """Generate Python code to filter array elements by multiple field conditions (AND logic)."""
        if not filter_fields:
            return """
# No filter conditions specified
def process_data(data):
    return data

# Execute the transformation
result = process_data(data)
print(json.dumps(result, indent=2))
"""
        
        # Generate conditions for each field
        field_conditions = []
        for filter_item in filter_fields:
            field_name = filter_item.get('field', '').strip()
            field_value = filter_item.get('value', '').strip()
            
            if not field_name or not field_value:
                continue
            
            # Parse the field value to handle different data types
            field_values = [v.strip() for v in field_value.split(',') if v.strip()]
            
            # Convert values to appropriate types
            parsed_values = []
            for value in field_values:
                # Try to convert to appropriate type
                if value.lower() == 'true':
                    parsed_values.append(True)
                elif value.lower() == 'false':
                    parsed_values.append(False)
                elif value.lower() == 'null' or value.lower() == 'none':
                    parsed_values.append(None)
                else:
                    # Try to convert to number first
                    try:
                        if '.' in value:
                            parsed_values.append(float(value))
                        else:
                            parsed_values.append(int(value))
                    except ValueError:
                        # If not a number, keep as string
                        parsed_values.append(value)
            
            # Create the comparison logic for this field
            if len(parsed_values) == 1:
                # Single value comparison
                value = parsed_values[0]
                if isinstance(value, str):
                    condition = f"item.get('{field_name}') == '{value}'"
                elif isinstance(value, bool):
                    condition = f"item.get('{field_name}') == {value}"
                elif value is None:
                    condition = f"item.get('{field_name}') is None"
                else:
                    condition = f"item.get('{field_name}') == {value}"
            else:
                # Multiple values comparison (OR logic within the field)
                value_conditions = []
                for value in parsed_values:
                    if isinstance(value, str):
                        value_conditions.append(f"item.get('{field_name}') == '{value}'")
                    elif isinstance(value, bool):
                        value_conditions.append(f"item.get('{field_name}') == {value}")
                    elif value is None:
                        value_conditions.append(f"item.get('{field_name}') is None")
                    else:
                        value_conditions.append(f"item.get('{field_name}') == {value}")
                condition = " or ".join(value_conditions)
            
            field_conditions.append(condition)
        
        # Combine all field conditions with AND logic
        if field_conditions:
            combined_condition = " and ".join(f"({condition})" for condition in field_conditions)
        else:
            combined_condition = "True"  # No valid conditions
        
        return f"""
# Filter array elements by multiple field conditions (AND logic)
def process_data(data):
    if not isinstance(data, list):
        raise ValueError("Data must be an array for array filtering")
    
    result = []
    for item in data:
        try:
            if isinstance(item, dict):
                # Check if all field conditions are met (AND logic)
                if {combined_condition}:
                    result.append(item)
        except Exception as e:
            # If condition evaluation fails, skip the item
            continue
    
    return result

# Execute the transformation
result = process_data(data)
print(json.dumps(result, indent=2))
"""



    @staticmethod
    def generate_custom_code(custom_code: str) -> str:
        """Generate Python code for custom transformation."""
        return f"""
# Custom transformation
def process_data(data):
    {custom_code}

# Execute the transformation
result = process_data(data)
print(json.dumps(result, indent=2))
"""

    @classmethod
    def generate_code(cls, operation: str, config: Dict[str, Any]) -> str:
        """Generate Python code for the specified operation."""
        if operation == 'filter_fields':
            return cls.generate_filter_fields_code(config.get('selectedFields', []))
        elif operation == 'filter_array':
            # Check if using new multiple fields structure
            filter_fields = config.get('filterFields')
            if filter_fields and isinstance(filter_fields, list):
                return cls.generate_filter_array_multiple_fields_code(filter_fields)
            else:
                # Fall back to legacy single field structure
                return cls.generate_filter_array_code(
                    config.get('filterField', ''), 
                    config.get('filterValue', '')
                )
        elif operation == 'custom_code':
            return cls.generate_custom_code(config.get('customCode', 'return data'))
        else:
            raise ValueError(f"Unknown operation: {operation}") 