# app/main.py
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from app.services.executor import executor
from app.services.proxy import api_proxy
import sqlite3
import json
import uuid
import time

from app.services.security_analysis import run_security_scan
from app.services.data_processor import DataProcessorCodeGenerator
from app.services.code_generator import WorkflowCodeGenerator
import requests
from typing import Dict, Any, Optional, List, Union

app = FastAPI(
    title="API Sandbox",
    description="Interactive API development and testing environment",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CodeInput(BaseModel):
    code: str
    language: str = "python"
    session_id: str | None = None  # Allow session_id from client

class TestNodeRequest(BaseModel):
    method: str  # GET, POST, PUT, DELETE, PATCH
    url: str
    headers: Dict[str, str] = {}
    query_params: Dict[str, str] = {}
    path_params: Dict[str, str] = {}
    body: Optional[str] = None
    session_id: Optional[str] = None

class DataProcessingRequest(BaseModel):
    data: Any  # Input data to process
    operation: str  # filter_fields, map_array, filter_array, etc.
    config: Dict[str, Any]  # Operation-specific configuration

@app.post("/run")
async def run_code(code_input: CodeInput):
    print(code_input)
    try:
        # Create a session ID for tracking API calls
        session_id = code_input.session_id or api_proxy.create_session_id()
        
        # Add custom requests wrapper to intercept API calls
        proxy_code = f"""
import os
import sys
import requests
from functools import partial
from urllib.parse import urlparse
import json

# Store original requests functions
original_get = requests.get
original_post = requests.post
original_put = requests.put
original_delete = requests.delete
original_patch = requests.patch
original_request = requests.request

# Create a session ID for tracking - define this before using it
SESSION_ID = "{session_id}"

# Custom function to intercept requests
def intercept_request(original_func, *args, **kwargs):
    # Get the URL from args or kwargs
    url = kwargs.get('url', args[0] if args else None)
    method = original_func.__name__.upper() if hasattr(original_func, '__name__') else 'REQUEST'
    
    # For requests.request, extract method from kwargs or args
    if original_func == original_request:
        method = kwargs.get('method', args[0] if args else 'GET').upper()
    
    # Make the original request
    try:
        response = original_func(*args, **kwargs)
        
        # Send the intercepted request to our API
        requests_data = {{
            'method': method,
            'url': url,
            'headers': dict(response.headers),
            'response': response.text,
            'status': response.status_code
        }}
        
        # Use the original request to avoid infinite recursion and explicitly refer to SESSION_ID
        try:
            original_post(
                f'http://host.docker.internal:8000/api-proxy/record/{session_id}',
                json=requests_data
            )
        except Exception as e:
            print(f"Failed to record API call: {{e}}")
        
        return response
    except Exception as e:
        # Log even failed requests
        error_data = {{
            'method': method,
            'url': url,
            'error': str(e)
        }}
        
        # Use the original request to avoid infinite recursion and explicitly refer to SESSION_ID
        try:
            original_post(
                f'http://host.docker.internal:8000/api-proxy/record/{session_id}',
                json=error_data
            )
        except Exception as rec_error:
            print(f"Failed to record API error: {{rec_error}}")
        
        # Re-raise the original exception
        raise
    
# Replace request methods with interceptors
requests.get = partial(intercept_request, original_get)
requests.post = partial(intercept_request, original_post)
requests.put = partial(intercept_request, original_put)
requests.delete = partial(intercept_request, original_delete)
requests.patch = partial(intercept_request, original_patch)
requests.request = partial(intercept_request, original_request)

# Your code starts here:
{code_input.code}
"""
        
        # Execute the code
        result = await executor.execute_code(proxy_code, code_input.language)
        
        # Get the intercepted API calls
        api_calls = api_proxy.get_calls(session_id)
        
        # Include API calls in the result as a string to avoid type errors
        result["api_calls"] = json.dumps(api_calls)
        print("Result:", result)
        
        return result
        
    except Exception as e:
        import traceback
        print(f"Error executing code: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/test-node")
async def test_node(request: TestNodeRequest):
    try:
        # Create session ID for API call tracking
        session_id = request.session_id or api_proxy.create_session_id()
        
        # Construct the URL with path parameters
        url = request.url
        
        # If the URL is a relative path (starts with /), prepend the GitHub API base URL
        if url.startswith('/'):
            url = f"https://api.github.com{url}"
        
        for param_name, param_value in request.path_params.items():
            url = url.replace(f"{{{param_name}}}", param_value)
        
        # Prepare request parameters
        request_params = {
            "method": request.method.upper(),
            "url": url,
            "headers": request.headers,
            "params": request.query_params,
            "timeout": 30
        }
        
        # Add body for POST, PUT, PATCH requests
        if request.method.upper() in ["POST", "PUT", "PATCH"] and request.body:
            try:
                # Try to parse as JSON
                request_params["json"] = json.loads(request.body)
            except json.JSONDecodeError:
                # If not JSON, send as text
                request_params["data"] = request.body
        
        # Make the HTTP request
        response = requests.request(**request_params)
        
        # Try to parse response as JSON, fallback to text
        try:
            response_data = response.json()
        except json.JSONDecodeError:
            response_data = response.text
        
        # Record the API call in the proxy system
        api_call_data = {
            "method": request.method.upper(),
            "url": url,
            "headers": dict(response.headers),
            "response": response_data,
            "status": response.status_code,
            "query_params": request.query_params,
            "request_headers": request.headers,
            "request_body": request.body
        }
        
        # Store in API proxy for tracking
        api_call = {
            "id": len(api_proxy.get_calls(session_id)),
            "method": request.method.upper(),
            "url": url,
            "status": response.status_code,
            "response": response_data,
            "headers": dict(response.headers),
            "timestamp": time.time(),
            "request_headers": request.headers,
            "request_body": request.body,
            "query_params": request.query_params
        }
        
        if session_id in api_proxy.intercepted_calls:
            api_proxy.intercepted_calls[session_id].append(api_call)
        else:
            api_proxy.intercepted_calls[session_id] = [api_call]
        
        # Return comprehensive response
        return {
            "success": True,
            "status_code": response.status_code,
            "response_data": response_data,
            "response_headers": dict(response.headers),
            "request_url": url,
            "request_method": request.method.upper(),
            "request_headers": request.headers,
            "request_body": request.body,
            "query_params": request.query_params,
            "session_id": session_id,
            "execution_time": response.elapsed.total_seconds()
        }
        
    except requests.exceptions.RequestException as e:
        # Handle network/request errors
        error_message = str(e)
        
        # Record failed request
        api_call = {
            "id": len(api_proxy.get_calls(session_id)),
            "method": request.method.upper(),
            "url": request.url,
            "status": 0,
            "response": None,
            "headers": {},
            "timestamp": time.time(),
            "error": error_message
        }
        
        if session_id in api_proxy.intercepted_calls:
            api_proxy.intercepted_calls[session_id].append(api_call)
        else:
            api_proxy.intercepted_calls[session_id] = [api_call]
        
        return {
            "success": False,
            "error": error_message,
            "error_type": "network_error",
            "request_url": request.url,
            "request_method": request.method.upper(),
            "session_id": session_id
        }
        
    except Exception as e:
        # Handle other errors
        error_message = str(e)
        
        return {
            "success": False,
            "error": error_message,
            "error_type": "general_error",
            "request_url": request.url,
            "request_method": request.method.upper(),
            "session_id": session_id if 'session_id' in locals() else None
        }

@app.post("/api/process-data")
async def process_data(request: DataProcessingRequest):
    """
    Process data using Python code generation and execution.
    Generates Python code for the specified operation and executes it safely.
    """
    try:
        data = request.data
        operation = request.operation
        config = request.config
        
        # Generate Python code for the operation
        try:
            python_code = DataProcessorCodeGenerator.generate_code(operation, config)
        except ValueError as e:
            return {"success": False, "error": str(e)}
        
        # Prepare the code with data injection
        # Convert JSON to Python format (handle booleans and None values)
        data_python = repr(data)  # This converts to proper Python format
        full_code = f"""
import json

# Input data
data = {data_python}

{python_code}
"""
        
        # Execute the Python code using the executor service
        try:
            result = await executor.execute_code(full_code, "python")
            
            if result.get("status") == "success":
                # Parse the output to get the transformed data
                output = result.get("output", "")
                
                # Try to parse as JSON first (for most operations)
                try:
                    parsed_result = json.loads(output)
                    return {
                        "success": True, 
                        "result": parsed_result,
                        "generated_code": python_code.strip(),
                        "full_code": full_code.strip()
                    }
                except json.JSONDecodeError:
                    # If not JSON, return as string (for simple values like counts)
                    return {
                        "success": True, 
                        "result": output.strip(),
                        "generated_code": python_code.strip(),
                        "full_code": full_code.strip()
                    }
            else:
                return {
                    "success": False, 
                    "error": result.get("error", "Unknown execution error"),
                    "generated_code": python_code.strip(),
                    "full_code": full_code.strip()
                }
                
        except Exception as e:
            return {
                "success": False, 
                "error": f"Code execution failed: {str(e)}",
                "generated_code": python_code.strip(),
                "full_code": full_code.strip()
            }
    
    except Exception as e:
        return {"success": False, "error": f"Error processing data: {str(e)}"}


DB_PATH = "app/github_api_docs.db"  

def get_db_connection():
    return sqlite3.connect(DB_PATH)




@app.get("/api-docs/structure")
def get_api_docs_structure():
    """Return all endpoints grouped by top-level folder (e.g., 'repos', 'users')."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, method, path, summary, category FROM github_api_docs ORDER BY path")
    rows = cursor.fetchall()
    conn.close()

    structure = {}
    for id, method, path, summary, category in rows:
        top_level = path.strip("/").split("/")[0]
        if top_level not in structure:
            structure[top_level] = []
        structure[top_level].append({
            "id": id,
            "method": method,
            "path": path,
            "summary": summary,
            "category": category

        })
    return structure


@app.get("/api-docs/{doc_id}")
def get_api_doc_by_id(doc_id: int):
    """Return full documentation and details for a given doc ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT method, path, summary, operation_id, doc_url, documentation, required_params, response_schema, code_examples, category
        FROM github_api_docs
        WHERE id = ?
        """,
        (doc_id,)
    )
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="API doc not found")

    (
        method, path, summary, operation_id, doc_url,
        documentation, required_params, response_schema,
        code_examples, category
    ) = row

    try:
        return {
            "method": method,
            "path": path,
            "summary": summary,
            "operation_id": operation_id,
            "doc_url": doc_url,
            "documentation": {
                "description": documentation,
                "required_params": json.loads(required_params or "[]"),
                "response_schema": json.loads(response_schema or "{}"),
            },
            "code_examples": json.loads(code_examples or "[]"),
            "category": category
        }
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Error decoding stored JSON: {e}")


@app.post("/api-proxy/{session_id}")
async def proxy_api_request(request: Request, session_id: str):
    """Proxy API requests and capture them."""
    result = await api_proxy.proxy_request(request, session_id)
    return result

@app.get("/api-proxy/calls/{session_id}")
def get_proxy_calls(session_id: str):
    """Get all intercepted API calls for a session."""
    return api_proxy.get_calls(session_id)

@app.post("/api-proxy/clear/{session_id}")
def clear_proxy_calls(session_id: str):
    """Clear all intercepted API calls for a session."""
    api_proxy.clear_calls(session_id)
    return {"status": "success", "message": "Calls cleared"}

@app.get("/api-proxy/create-session")
def create_proxy_session():
    """Create a new session for tracking API calls."""
    print("[INFO] Creating new API proxy session.")
    session_id = api_proxy.create_session_id()
    print(f"Created new session with ID: {session_id}")
    return {"session_id": session_id}

@app.post("/api-proxy/record/{session_id}")
async def record_api_call(session_id: str, call_data: dict):
    """Record an intercepted API call."""
    api_call = {
        "id": len(api_proxy.get_calls(session_id)),
        "method": call_data.get("method", "UNKNOWN"),
        "url": call_data.get("url", ""),
        "status": call_data.get("status", 0),
        "response": call_data.get("response", ""),
        "headers": call_data.get("headers", {}),
        "timestamp": time.time(),
        "error": call_data.get("error")
    }
    
    if session_id in api_proxy.intercepted_calls:
        api_proxy.intercepted_calls[session_id].append(api_call)
    
    return {"status": "recorded"}

class SecurityScanRequest(BaseModel):
    code: str

class GenerateCodeRequest(BaseModel):
    nodes: List[Dict[str, Any]]
    connections: List[Dict[str, Any]]

@app.post("/security-scan")
async def security_scan(request: SecurityScanRequest):
    try:
        # temp. logging
        print("[INFO] Received /security-scan request.") 

        results = run_security_scan(request.code)

        # temp. logging
        print("[INFO] Security scan completed.")
        return results
    except Exception as e:
        # temp. logging
        print(f"[ERROR] Security scan failed: {str(e)}")
        
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-code")
async def generate_workflow_code(request: GenerateCodeRequest):
    """Generate Python code for a complete workflow."""
    try:
        # Generate the code using the WorkflowCodeGenerator
        generated_code = WorkflowCodeGenerator.generate_simple_workflow_code(
            request.nodes, 
            request.connections
        )
        
        return {
            "success": True,
            "generated_code": generated_code,
            "message": "Code generated successfully"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to generate code"
        }
