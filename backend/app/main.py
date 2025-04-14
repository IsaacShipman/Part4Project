# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from app.services.executor import executor

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
    print (code_input)
    result = await executor.execute_code(code_input.code, code_input.language)
    return result
