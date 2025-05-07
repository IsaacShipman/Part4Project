import json
import sqlite3
import os
import time
from openai import OpenAI
import argparse
from tqdm import tqdm
import re

class GitHubAPIDocRetriever:
    def __init__(self):
  
        self.client = OpenAI(api_key="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")
        self.model = "gpt-4o-mini"
        self.db_path = "github_api_docs.db"
        self.delay = 5
        self.setup_database()
    
    def setup_database(self):
        """Create SQLite database with required schema if it doesn't exist."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create table for storing endpoints and their documentation
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS github_api_docs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                method TEXT NOT NULL,
                path TEXT NOT NULL,
                summary TEXT,
                operation_id TEXT,
                doc_url TEXT,
                documentation TEXT,
                required_params TEXT,
                response_schema TEXT,
                code_examples TEXT,
                category TEXT);
            ''')
        
        conn.commit()
        conn.close()
    
    def load_endpoints(self, json_file):
        with open(json_file, 'r') as f:
            return json.load(f)
    
    def get_endpoint_documentation(self, method, path, summary, doc_url):
        """
        Retrieve documentation and code examples for a GitHub API endpoint using OpenAI.
        """
        prompt = f"""
        Please analyze the following GitHub API endpoint documentation:
        
        Endpoint: {method.upper()} {path}
        
        Raw Documentation:
        {doc_url}
        
        Please provide:
        1. A clear, concise summary (2-3 sentences)
        2. A more detailed description (2-3 paragraphs)
        3. Required parameters formatted as a JSON list
        4. Response schema overview formatted as JSON
        5. Code examples in Python and cURL
        
        Format your response in JSON with the following structure:
        {{
            "summary": "concise summary here",
            "description": "detailed description here",
            "required_params": [
                {{"name": "param_name", "type": "string", "description": "description"}}
            ],
            "response_schema": {{
                "brief": "brief description of response schema",
                "fields": [
                    {{"name": "field_name", "type": "string", "description": "description"}}
                ]
            }},
            "code_examples": [
                {{"language": "python", "code": "code here", "description": "description"}},
                {{"language": "curl", "code": "code here", "description": "description"}}
            ]
        }}
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=3000
            )
            
            # Check if the response is empty
            if not response or not response.choices or not response.choices[0].message.content:
                raise ValueError("Empty response from OpenAI API")
            
            content = response.choices[0].message.content
            print(f"Raw response: {content}")  # Debugging line
            
            content = re.sub(r"^```json|```$", "", content).strip() #Chat GPT response sometimes includes code block markers
            
            # Parse the JSON response
            parsed_response = json.loads(content)
            
            # Extract documentation and code examples
            documentation = {
                "summary": parsed_response.get("summary", ""),
                "description": parsed_response.get("description", ""),
                "required_params": parsed_response.get("required_params", []),
                "response_schema": parsed_response.get("response_schema", {})
            }
            code_examples = parsed_response.get("code_examples", [])
            
            return json.dumps(documentation), json.dumps(code_examples)

        except json.JSONDecodeError as e:
            print(f"Error parsing JSON response for {method} {path}: {e}")
            print(f"Response content: {content}")  # Log the problematic content
            return f"Error parsing JSON response: {e}", "[]"
        except Exception as e:
            print(f"Error retrieving documentation for {method} {path}: {e}")
            return f"Error retrieving documentation: {e}", "[]"
    
    def store_endpoint_documentation(self, endpoint_key, endpoint_data, documentation, code_examples):
        """
        Store endpoint documentation and code examples in the SQLite database.
        """
    
    
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        method = endpoint_data["method"]
        path = endpoint_data["path"]
        summary = endpoint_data.get("summary", "")
        operation_id = endpoint_data.get("operation_id", "")
        doc_url = endpoint_data.get("doc_url", "")
        category = endpoint_data.get("category", "")
        doc_data = json.loads(documentation)
        required_params = json.dumps(doc_data.get("required_params", []))
        response_schema = json.dumps(doc_data.get("response_schema", {}))
        description = doc_data.get("description", "")

        # Convert code examples to JSON
        try: 
            cursor.execute('''
            INSERT OR REPLACE INTO github_api_docs 
            (method, path, summary, operation_id, doc_url, documentation, required_params, response_schema, code_examples, category)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (method, path, summary, operation_id, doc_url, description, required_params, response_schema, code_examples, category))

            
            conn.commit()
            print(f"Stored documentation for {method} {path}")
            
        except Exception as e:
            print(f"Error storing documentation for {method} {path}: {e}")
    
        finally:
            conn.close()
    
    def process_endpoints(self, json_file):


        endpoints = self.load_endpoints(json_file)
        
        # Check how many endpoints are already in the database
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT method, path FROM github_api_docs")
        existing = {(method, path) for method, path in cursor.fetchall()}
        conn.close()
        
        # Process endpoints that aren't already in the database
        pending_endpoints = []
        for key, data in endpoints.items():
            if (data["method"], data["path"]) not in existing:
                pending_endpoints.append((key, data))
        
        print(f"Found {len(endpoints)} endpoints in JSON file")
        print(f"Already processed: {len(existing)}")
        print(f"Endpoints to process: {len(pending_endpoints)}")
        
        for key, data in tqdm(pending_endpoints, desc="Processing endpoints"):
            method = data["method"]
            path = data["path"]
            summary = data.get("summary", "")
            doc_url = data.get("doc_url", "")
            
            print(f"\nProcessing {method} {path}...")
            documentation, code_examples = self.get_endpoint_documentation(method, path, summary, doc_url)
            self.store_endpoint_documentation(key, data, documentation, code_examples)
            
            # Add delay to avoid rate limiting
            time.sleep(self.delay)
    

        """
        Query the database for endpoints matching search criteria.
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        query = "SELECT * FROM github_api_docs WHERE 1=1"
        params = []
        
        if search_term:
            query += " AND (path LIKE ? OR summary LIKE ? OR documentation LIKE ?)"
            term = f"%{search_term}%"
            params.extend([term, term, term])
        
        if method:
            query += " AND method = ?"
            params.append(method)
        
        cursor.execute(query, params)
        results = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return results

def main():
    parser = argparse.ArgumentParser(description="GitHub API Documentation Retriever")
    parser.add_argument("--input", help="Path to JSON file with GitHub API endpoints", required=True)


    args = parser.parse_args()
    
    # Initialize the retriever
    retriever = GitHubAPIDocRetriever()


    # Process and store the endpoints
    retriever.process_endpoints(args.input)
    print("Processing complete!")

if __name__ == "__main__":
    main()