# app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from app.services.executor import executor
import sqlite3

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
        result = await executor.execute_code(code_input.code, code_input.language)
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

from fastapi import FastAPI, HTTPException
import json

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

