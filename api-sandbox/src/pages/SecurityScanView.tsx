import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import MainEditor from "../components/CodeEditor/MainEditor";

function SecurityScanView() {
  const [defaultCode, setDefaultCode] = useState(
    `import requests
    API_KEY = "12345-SECRET-API-KEY"
    BASE_URL = "https://example.com/data"

    def get_data():
        headers = {
            "Authorization": f"Bearer {API_KEY}"
        }
        response = requests.get(BASE_URL, headers=headers)
        return response.json()

    print(get_data())
    `);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExecuteCode = async () => {
    console.log("Code being sent: " + defaultCode);

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/security-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: defaultCode }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error response:", errorData);
        setScanResult(`Error: ${errorData}`);
        return;
      }
      
      const data = await response.json();
      console.log("Received data:", data);
      
      let results = data.results;

      try {
        results = JSON.parse(results);
        setScanResult(JSON.stringify(results, null, 2));
      } catch {
        setScanResult(results);
      }
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error) {
        setScanResult("Error: " + error.message);
      } else {
        setScanResult("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        padding: 2,
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
        marginTop: 8,
      }}
    >
      <MainEditor
        code={defaultCode}
        setCode={setDefaultCode}
        onExecuteCode={handleExecuteCode}
        standalone={true}
      />
      <Typography variant="h6" mt={2}>Scan Results:</Typography>
      <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
        {loading ? "Scanning..." : scanResult}
      </pre>
    </Box>
  );
}

export default SecurityScanView;
