# Start with a minimal Python image
FROM python:3.9-slim

# Create a directory for our application code
WORKDIR /code

# Install any dependencies you need for execution
RUN pip install --no-cache-dir numpy requests

# Set the default command to run the Python script
CMD ["python", "/code/script.py"]
