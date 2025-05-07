import json
import argparse
import re

def extract_endpoints(input_file, output_file):
    """
    Extract all API endpoints from a GitHub OpenAPI spec JSON file and write them to a JSON file
    with documentation links.
    """
    print(f"Reading OpenAPI spec from {input_file}")
    
    try:
        # Load the OpenAPI spec
        with open(input_file, 'r', encoding='utf-8') as f:
            spec = json.load(f)
        
        # Dictionary to store endpoints and their docs
        endpoints_data = {}
        
        # Process all paths
        for path, path_data in spec.get('paths', {}).items():
            for method, method_data in path_data.items():
                if method.lower() in ['get', 'post', 'put', 'delete', 'patch', 'head', 'options']:
                    # Create a key for the endpoint
                    endpoint_key = f"{method.upper()} {path}"
                    
                    # Generate documentation URL
                    doc_url = generate_doc_url(path, method)
                    
                    # Get summary and operation ID if available
                    summary = method_data.get('summary', '')
                    operation_id = method_data.get('operationId', '')
                    
                    # Store endpoint data
                    endpoints_data[endpoint_key] = {
                        'method': method.upper(),
                        'path': path,
                        'doc_url': doc_url,
                        'summary': summary,
                        'operation_id': operation_id
                    }
        
        # Write data to JSON file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(endpoints_data, f, indent=2, sort_keys=True)
        
        # Print summary
        print(f"Extracted {len(endpoints_data)} endpoints")
        print(f"Results written to {output_file}")
        
    except Exception as e:
        print(f"Error: {str(e)}")

def generate_doc_url(path, method):
    """
    Generate a documentation URL for a GitHub API endpoint.
    
    """
    # Clean up path for URL construction
    # Remove parameters like {owner}, {repo}, etc.
    clean_path = re.sub(r'\{[^}]+\}', '', path)
    
    # Replace multiple slashes with a single slash
    clean_path = re.sub(r'/+', '/', clean_path)
    
    # Remove trailing slash
    clean_path = clean_path.rstrip('/')
    
    # Generate base slug for the docs URL
    parts = clean_path.strip('/').split('/')
    
    if not parts:
        return "https://docs.github.com/en/rest/reference"
    
    # GitHub REST API documentation typically organizes by resource type
    if len(parts) >= 1:
        resource = parts[0]
    else:
        resource = "reference"
        
    # Handle special cases
    if resource == "repos" and len(parts) >= 3:
        # Look for the actual resource after repos/{owner}/{repo}
        if len(parts) >= 3:
            resource = parts[2]
    
    # Generate the URL
    return f"https://docs.github.com/en/rest/{resource}"

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract GitHub API endpoints from OpenAPI spec")
    parser.add_argument("--input", "-i", required=True, help="Path to input OpenAPI JSON file")
    parser.add_argument("--output", "-o", required=True, help="Path to output JSON file")
    
    args = parser.parse_args()
    
    extract_endpoints(args.input, args.output)