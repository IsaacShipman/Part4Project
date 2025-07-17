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
        """Generate Python code to filter array elements by field matching."""
        if not field_name.strip():
            field_name = "id"  # Default field
        
        return f"""
# Filter array elements by field matching
def process_data(data):
    if not isinstance(data, list):
        raise ValueError("Data must be an array for array filtering")
    
    result = []
    for item in data:
        try:
            if isinstance(item, dict):
                # Check if field matches the specified value
                if item.get('{field_name}') == '{field_value}':
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
            return cls.generate_filter_array_code(
                config.get('filterField', ''), 
                config.get('filterValue', '')
            )
        elif operation == 'custom_code':
            return cls.generate_custom_code(config.get('customCode', 'return data'))
        else:
            raise ValueError(f"Unknown operation: {operation}") 