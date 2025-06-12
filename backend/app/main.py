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

@app.post("/run")
async def run_code(code_input: CodeInput):
    print(code_input)
    try:
        # Create a session ID for tracking API calls
        session_id = api_proxy.create_session_id()
        
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
        
        # Include API calls in the result
        result["api_calls"] = api_calls
        
        return result
    except Exception as e:
        import traceback
        print(f"Error executing code: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
    


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

@app.post("/api-proxy/create-session")
def create_proxy_session():
    """Create a new session for tracking API calls."""
    session_id = api_proxy.create_session_id()
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

@app.post("/security-scan")
async def security_scan(request: SecurityScanRequest):
    try:
        print(f"Incoming code for scan (first 100 chars): {request.code[:100]}...")
        results = run_security_scan(request.code)
        print(f"Scan results type: {type(results)}")
        print(f"Scan results (first 200 chars): {str(results)[:200]}...")
        return {"results": results}
    except Exception as e:
        print(f"Error in /security-scan: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
