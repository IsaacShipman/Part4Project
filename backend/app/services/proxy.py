import requests
from fastapi import FastAPI, Request, HTTPException
import uuid
import time
import json
from typing import Dict, List, Any

class ApiProxy:
    def __init__(self):
        self.intercepted_calls: Dict[str, List[Dict[str, Any]]] = {}
    
    def create_session_id(self) -> str:
        """Create a unique session ID for tracking API calls."""
        session_id = str(uuid.uuid4())
        self.intercepted_calls[session_id] = []
        return session_id
    
    def get_calls(self, session_id: str) -> List[Dict[str, Any]]:
        """Get all intercepted calls for a session."""
        return self.intercepted_calls.get(session_id, [])
    
    def clear_calls(self, session_id: str) -> None:
        """Clear all intercepted calls for a session."""
        if session_id in self.intercepted_calls:
            self.intercepted_calls[session_id] = []
    
    async def proxy_request(self, request: Request, session_id: str) -> dict:
        """Proxy an HTTP request and capture details."""
        # Extract request information
        method = request.method
        url = str(request.query_params.get("url"))
        if not url:
            raise HTTPException(status_code=400, detail="URL parameter is required")
        
        # Extract headers and body
        headers = {}
        for header, value in request.headers.items():
            # Skip headers that might interfere with the proxy
            if header.lower() not in ["host", "content-length"]:
                headers[header] = value
        
        # Get request body if any
        try:
            body = await request.json() if request.method in ["POST", "PUT", "PATCH"] else None
        except:
            body = None
        
        # Prepare request data for logging
        request_data = {
            "method": method,
            "url": url,
            "headers": headers,
            "data": body,
            "timestamp": time.time(),
        }
        
        # Make the actual request
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                json=body if body else None,
                timeout=10
            )
            
            # Extract response information
            response_data = {
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "content": response.text[:10000] if len(response.text) > 10000 else response.text
            }
            
            # Create complete call record
            call_data = {
                "id": len(self.intercepted_calls.get(session_id, [])),
                "method": method,
                "url": url,
                "status": response.status_code,
                "response": response.text[:10000] if len(response.text) > 10000 else response.text,
                "headers": dict(response.headers),
                "timestamp": time.time(),
                "request": request_data,
                "responseData": response_data
            }
            
            # Store the call
            if session_id in self.intercepted_calls:
                self.intercepted_calls[session_id].append(call_data)
            
            return {
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "content": response.text
            }
            
        except Exception as e:
            error_data = {
                "id": len(self.intercepted_calls.get(session_id, [])),
                "method": method,
                "url": url,
                "status": 500,
                "response": str(e),
                "timestamp": time.time(),
                "request": request_data,
                "responseData": {
                    "status_code": 500,
                    "content": str(e)
                }
            }
            
            if session_id in self.intercepted_calls:
                self.intercepted_calls[session_id].append(error_data)
            
            return {
                "status_code": 500,
                "error": str(e)
            }

api_proxy = ApiProxy()