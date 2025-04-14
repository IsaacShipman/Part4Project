# Part4Project

This project is designed as an API sandbox where users can write, execute, and test code in a secure, isolated environment. The frontend allows users to interact with the API and execute code, while the backend manages the execution within a Docker container.

## Setup Instructions

### Setting up the Frontend
cd api-sandbox
npm install
npm start 

runs on localhost:3000

### Setting up the backend
cd backend
poetry install (You need docker, you shouldnt have to do this if docker is already installed)
poetry run uvicorn app.main:app --reload

runs on localhost:8000

### Setting up docker image
Run this command once at the start and it should  be good to go
docker build -t python-sandbox .