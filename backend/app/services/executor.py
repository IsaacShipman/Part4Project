# app/services/executor.py
import docker
import uuid
import os
import asyncio
from fastapi import HTTPException

class CodeExecutor:
    def __init__(self):
        self.client = docker.from_env()
    
    async def execute_code(self, code: str, language: str = "python"):
   
        container_name = f"sandbox-{uuid.uuid4()}"
        
        if language != "python":
            raise HTTPException(status_code=400, detail=f"Language {language} not supported yet")
 
        file_path = f"/tmp/{container_name}.py"
        with open(file_path, "w") as f:
            f.write(code)
        
        try:
            # Run the code in a container with resource limitations
            container = self.client.containers.run(
                    "python-sandbox",
                    volumes={file_path: {"bind": "/code/script.py", "mode": "ro"}},
                    detach=True,
                    name=container_name,
                    mem_limit="50m",
                    nano_cpus=1000000000,
                    network_mode="host",  # Allows the container to access internet
                    cap_drop=["ALL"],
                    security_opt=["no-new-privileges"],
                    read_only=False  # Needed to allow pip to install inside the container
                )



            
            # Wait for execution or timeout after 5 seconds
            try:
                await asyncio.wait_for(
                    asyncio.get_event_loop().run_in_executor(
                        None, container.wait
                    ),
                    timeout=5.0
                )
            except asyncio.TimeoutError:
                container.kill()
                return {"status": "error", "output": "Execution timed out"}
            
            # Get the logs from the container
            logs = container.logs(stdout=True, stderr=True).decode('utf-8')
            print(logs)


            return {"status": "success", "output": logs}
            
        except Exception as e:
            return {"status": "error", "output": str(e)}
        finally:
            # Cleanup
            try:
                container = self.client.containers.get(container_name)
                container.remove(force=True)
            except:
                pass
            if os.path.exists(file_path):
                os.unlink(file_path)

executor = CodeExecutor()