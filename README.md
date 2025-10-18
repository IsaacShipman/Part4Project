
# Part4Project — API Sandbox

An isolated, browser-based environment for writing, executing, and testing code against APIs.  
The **frontend** provides the interactive UI; the **backend** (FastAPI) orchestrates execution inside a **Docker** container to keep runs sandboxed and reproducible.

----------

## Table of Contents

-   [Prerequisites](#prerequisites)
    
-   [Quick Start](#quick-start)
    
-   [Frontend (api-sandbox)](#frontend-api-sandbox)
    
-   [Backend (FastAPI)](#backend-fastapi)
    
-   [Sandbox Docker Image](#sandbox-docker-image)
    
-   [Project Structure](#project-structure)
    
-   [Configuration](#configuration)
    
-   [Security & Resource Isolation](#security--resource-isolation)
    
-   [Troubleshooting](#troubleshooting)
    
-   [License](#license)
    

----------

## Prerequisites

Ensure the following are installed and available on your PATH:

-   **Node.js** ≥ 18 and **npm** ≥ 9
    
    `node -v && npm -v` 
    
-   **Python** ≥ 3.10 and **Poetry** ≥ 1.6
    
    `python3 --version && poetry --version` 
    
-   **Docker Desktop / Engine** ≥ 24 (must be running)
    
    `docker -v` 
    

> The backend relies on Docker to safely execute user code in a container. Start Docker before running the backend.

----------

## Quick Start

1.  **Build the sandbox image (one-time or when Dockerfile changes):**
    

`docker build -t python-sandbox .` 

2.  **Start the backend (FastAPI on :8000):**
    

`cd backend
poetry install
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` 

3.  **Start the frontend (React on :3000):**
    

`cd api-sandbox
npm install
npm start` 

4.  **Open the app:**  
    `http://localhost:3000` (frontend)  
    `http://localhost:8000/docs` (backend OpenAPI docs)
    

----------

## Frontend (api-sandbox)

**Development**

`cd api-sandbox
npm install
npm start` 

-   Runs at `http://localhost:3000`.
    
-   Hot reload is enabled by default.
    

**Production build (optional)**

`cd api-sandbox
npm run build` 

-   Outputs a static bundle in `api-sandbox/build`.
    

----------

## Backend (FastAPI)

**Install & run**

`cd backend
poetry install
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` 

**Notes**

-   The backend manages execution inside Docker (`python-sandbox` image).
    
-   OpenAPI docs available at `http://localhost:8000/docs`.
    
----------

## Sandbox Docker Image

Build once at the repository root:

`docker build -t python-sandbox .` 

-   Tag: `python-sandbox`
    
-   Purpose: provide a controlled runtime for executing user code.
    
-   Rebuild this image whenever you change the Dockerfile or base runtime.
    

----------

## Configuration

-   **Default ports:** frontend `3000`, backend `8000`.
    
-   **API base URL:** the frontend expects the backend at `http://localhost:8000`.  
    If you run the backend elsewhere, update the frontend’s API base URL in its configuration (e.g., a `.env` file or config module) before `npm start`.
    
----------


## Troubleshooting

-   **Docker isn’t running / permission denied:**  
    Start Docker Desktop (or the Docker daemon). On Linux, ensure your user is in the `docker` group or run with `sudo`.
    
-   **Port already in use:**  
    Change ports with `--port` in Uvicorn or update the frontend dev server port.
    
-   **Poetry not found:**  
    Install Poetry from https://python-poetry.org/ and ensure it’s on PATH.
    
-   **Frontend can’t reach backend:**  
    Confirm `http://localhost:8000/docs` loads. Update the frontend API base URL if needed.
    

----------
