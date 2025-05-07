import json
import argparse
import os
from pathlib import Path
from typing import Dict, List, Any, Set


class GitHubAPISpecFilter:
    """Filter GitHub API OpenAPI specification by selecting specific endpoints and categories."""


    DEFAULT_CATEGORIES = {
        "repos",     
        "issues",      
        "pulls",       
    }
    

    
    # Patterns to exclude 
    EXCLUDE_PATTERNS = [
    "/migrations",
    "/enterprise",
    "/scim",
    "/billing",
    "/marketplace",
    "/codes_of_conduct",
    "/emojis",
    "/licenses",
    "/hooks",
    "/rate_limit",
    "/meta",
    "/feeds",
    "/interaction-limits",
    "/protection",
    "/actions",           # Remove GitHub Actions entirely
    "/teams",             # Remove Teams management
    "/projects",          # Remove Projects management
    "/branches",          # Keep only specific branch operations
    "/milestones",        # Remove milestone operations
    "/labels",            # Keep only basic label functions
    "/assignees",         # Remove assignee operations
    "/comments",          # Keep only essential comment operations
    "/events",            # Remove events
    "/statuses",          # Remove statuses
    "/releases",          # Remove releases for prototype
    "/notifications",     # Remove notifications
    "/check",             # Remove checks
    "/reactions",         # Remove reactions
    "/merges",            # Keep only essential merge operations
    "/reviews",           # Simplify PR reviews
    "/traffic",           # Remove traffic stats
    "/collaborators",     # Remove collaborator management
    "/deployments",       # Remove deployments
    "/pages",             # Remove GitHub Pages
    "/stats",             # Remove repository statistics
]

    def __init__(self, input_file: str, output_file: str, categories: List[str] = None, 
                 include_patterns: List[str] = None, exclude_patterns: List[str] = None):
        
        self.input_file = input_file
        self.output_file = output_file
        
        # Use provided categories or defaults
        self.categories = set(categories) if categories else self.DEFAULT_CATEGORIES
        
        self.exclude_patterns = exclude_patterns if exclude_patterns else self.EXCLUDE_PATTERNS
        
        # Load the spec
        self.spec = self.load_spec()
        
    def load_spec(self) -> Dict:
        """Load the OpenAPI spec from JSON or YAML file."""
        file_extension = os.path.splitext(self.input_file)[1].lower()
        
        print(f"Loading spec from {self.input_file}")
        try:
            with open(self.input_file, 'r', encoding='utf-8') as f:
                if file_extension in ['.json']:
                    return json.load(f)
                else:
                    raise ValueError(f"Unsupported file format: {file_extension}. Use JSON or YAML.")
        except Exception as e:
            print(f"Error loading spec: {e}")
            raise
    
    def should_include_path(self, path: str) -> bool:
        """
        Determine if a path should be included in the filtered spec.
        """
        path_parts = path.strip('/').split('/')
        
        # Check if the path matches any exclude patterns
        if any(pattern in path for pattern in self.exclude_patterns):
            return False
        
        # Check if the path matches any include patterns
        if any(pattern in path for pattern in self.include_patterns):
            return True
        
        # Check if the path's first segment matches any of our categories
        return path_parts[0] in self.categories if path_parts else False
    
    def filter_spec(self) -> Dict:
        """
        Filter the OpenAPI spec to include only paths defined in endpoints.json.
        """
        # Load the allowed endpoints from endpoints.json
        try:
            with open('endpoints.json', 'r', encoding='utf-8') as f:
                allowed_endpoints = json.load(f)
        except Exception as e:
            print(f"Error loading endpoints.json: {e}")
            raise

        # Create a set of allowed paths and methods
        allowed_paths = {
            endpoint["endpoint"]: endpoint["method"].lower()
            for endpoint in allowed_endpoints
        }

        filtered_spec = self.spec.copy()
        original_paths = self.spec.get('paths', {})
        filtered_paths = {}

        # Filter paths based on allowed_endpoints
        for path, path_item in original_paths.items():
            if path in allowed_paths:
                method = allowed_paths[path]
                if method in path_item:
                    filtered_paths[path] = {method: path_item[method]}

        # Update the filtered spec with the new paths
        filtered_spec['paths'] = filtered_paths

        return filtered_spec
    
    def write_filtered_spec(self):
        """Write the filtered spec to the output file."""
        filtered_spec = self.filter_spec()
        
        file_extension = os.path.splitext(self.output_file)[1].lower()
        
        print(f"Writing filtered spec to {self.output_file}")
        try:
            with open(self.output_file, 'w', encoding='utf-8') as f:
                if file_extension == '.json':
                    json.dump(filtered_spec, f, indent=2)
                else:
                    raise ValueError(f"Unsupported output format: {file_extension}. Use JSON or YAML.")
            
            # Print stats
            original_count = len(self.spec.get('paths', {}))
            filtered_count = len(filtered_spec.get('paths', {}))
            reduction = (1 - filtered_count / original_count) * 100 if original_count else 0
            
            print(f"Original paths: {original_count}")
            print(f"Filtered paths: {filtered_count}")
            print(f"Reduction: {reduction:.1f}%")
            
        except Exception as e:
            print(f"Error writing filtered spec: {e}")
            raise



def main():
    parser = argparse.ArgumentParser(description="Filter GitHub API OpenAPI spec to include only selected endpoints")
    parser.add_argument("--input", "-i", required=True, help="Path to input OpenAPI spec (JSON or YAML)")
    parser.add_argument("--output", "-o", required=True, help="Path to output filtered spec (JSON or YAML)")
   
    
    args = parser.parse_args()
    
    
    # Create and run the filter
    filter = GitHubAPISpecFilter(
        input_file=args.input,
        output_file=args.output,
    )
    
    filter.write_filtered_spec()
    print(f"Filtered spec written to {args.output}")


if __name__ == "__main__":
    main()