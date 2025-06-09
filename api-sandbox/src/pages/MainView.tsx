import React, { useState, useEffect, useCallback, useRef } from 'react';
import Split from 'react-split';
import { Box, Paper, Button, useTheme } from '@mui/material';
import CodeEditor from '../components/CodeEditor/CodeEditor';
import ResponsePanel from '../components/Console/ResponsePanel';
import DocumentationPanel from '../components/Documentation/DocumentationPanel';
import APIFolderStructure from '../components/FolderStructure/APIFolderStructure';
import RequestPanel from '../components/RequestPanel';
import axios from 'axios';
import { ApiCall } from '../types/api';

// Define interfaces for compatibility with existing components
interface APIRequest {
  line?: number;
  method: string;
  url: string;
  status?: number;
  response?: string;
  timestamp?: number;
  headers?: Record<string, string>;
}

interface MainViewProps {
  onExecuteCode: (fn: () => void) => void;
}

function MainView({ onExecuteCode }: MainViewProps) {
  const theme = useTheme();
  const [code, setCode] = useState(`import requests
response = requests.get("https://jsonplaceholder.typicode.com/todos/1")
print(response.json())

# Try another request
response2 = requests.post("https://jsonplaceholder.typicode.com/posts", 
                         json={"title": "Test", "body": "Test body", "userId": 1})
print(f"Posted with status: {response2.status_code}")`);
  
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedEndpointId, setSelectedEndpointId] = useState<number | null>(null);
  const [activePanel, setActivePanel] = useState<'documentation' | 'console'>('console');
  const [apiRequests, setApiRequests] = useState<APIRequest[]>([]);
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([]);
  const [isRequestPanelOpen, setIsRequestPanelOpen] = useState(false);
  
  const [selectedRequestIndex, setSelectedRequestIndex] = useState<number | null>(null);

  const handleExecuteCode = useCallback(async () => {
    setLoading(true);
    setResponse(null);
    // Clear previous API calls
    setApiCalls([]);
    setApiRequests([]);

    try {
      const result = await axios.post("http://localhost:8000/run", {
        code,
        language: "python",
      });

      setResponse(result.data.output || "Code executed successfully.");
      
      // Process intercepted API calls
      if (result.data.api_calls && Array.isArray(result.data.api_calls)) {
        const calls = result.data.api_calls;
        setApiCalls(calls);
        
        // Update API requests for the request panel
        interface APIRequestDetails {
          line?: number;
          method: string;
          url: string;
          status?: number;
          response?: string;
          timestamp?: number;
          headers?: Record<string, string>;
        }

        const requests: APIRequestDetails[] = calls.map((call: ApiCall) => ({
          line: call.request?.line,
          method: call.method,
          url: call.url,
          status: call.status,
          response: call.response,
          timestamp: call.timestamp,
          headers: call.headers
        }));
        
        setApiRequests(requests);
        
        // Automatically open request panel if there are API calls
        if (calls.length > 0) {
          setIsRequestPanelOpen(true);
        }
      }
    } catch (error) {
      console.error("Error executing code:", error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.detail || error.message || "Unknown error occurred"
        : "Unknown error occurred";
      setResponse(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [code]);

  const handleSelectEndpoint = (endpointId: number) => {
    setSelectedEndpointId(endpointId);
    setActivePanel('documentation');
  };

  const handleSelectRequest = (index: number) => {
    setSelectedRequestIndex(index);
    setActivePanel('console');
  };

  useEffect(() => {
    onExecuteCode(handleExecuteCode);
  }, [handleExecuteCode, onExecuteCode]);

  const selectedApiCall = selectedRequestIndex !== null ? apiCalls[selectedRequestIndex] : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', pt: 8 }}>
      <Split
        direction="vertical"
        sizes={[70, 30]}
        minSize={100}
        gutterSize={5}
        style={{ height: '100%' }}
      >
        <Split
          sizes={isRequestPanelOpen ? [20, 50, 30] : [20, 77, 3]}
          minSize={isRequestPanelOpen ? 50 : 30}
          gutterSize={5}
          style={{ 
            display: 'flex', 
            height: '100%', 
            backgroundColor: theme.palette.background.default 
          }}
        >
          <Paper elevation={3} sx={{ overflow: 'auto', borderRadius: 0, m: 0 }}>
            <APIFolderStructure onSelectEndpoint={handleSelectEndpoint} />
          </Paper>

          <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 0, m: 0, height: '100%' }}>
            <CodeEditor code={code} setCode={setCode} />
          </Paper>

          <RequestPanel
            setIsOpen={setIsRequestPanelOpen}
            requests={apiRequests.map(req => ({
              method: req.method,
              url: req.url,
              status: req.status || 0,
            }))}
            onSelectRequest={handleSelectRequest}
            selectedIndex={selectedRequestIndex}
            apiCalls={apiCalls}
            isOpen={isRequestPanelOpen}
          />
        </Split>

        <Paper
          elevation={3}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'hidden',
            backgroundColor: theme.palette.background.paper,
            borderTop: `1px solid ${theme.palette.divider}`,
            borderRadius: 0,
            m: 0,
            p: 0,
            height: '100%',
          }}
        >
          <Box
            sx={{
              backgroundColor: theme.palette.background.default,
              pl: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 1,
            }}
          >
            <Button
              variant={activePanel === 'console' ? 'contained' : 'text'}
              onClick={() => setActivePanel('console')}
              sx={{
                fontFamily: theme.custom.terminal.fontFamily,
                color: activePanel === 'console' 
                  ? theme.palette.text.primary 
                  : theme.palette.text.secondary,
                backgroundColor: activePanel === 'console' 
                  ? theme.palette.action.selected 
                  : 'transparent',
                alignSelf: 'left',
              }}
            >
              CONSOLE
            </Button>
            <Button
              variant={activePanel === 'documentation' ? 'contained' : 'text'}
              onClick={() => setActivePanel('documentation')}
              sx={{
                fontFamily: theme.custom.terminal.fontFamily,
                color: activePanel === 'documentation' 
                  ? theme.palette.text.primary 
                  : theme.palette.text.secondary,
                backgroundColor: activePanel === 'documentation' 
                  ? theme.palette.action.selected 
                  : 'transparent',
              }}
            >
              DOCUMENTATION
            </Button>
          </Box>

          <Box sx={{ overflow: 'hidden', height: '100%', flexGrow: 1 }}>
            {activePanel === 'documentation' ? (
              <DocumentationPanel endpointId={selectedEndpointId !== null ? String(selectedEndpointId) : ""} />
            ) : (
              <Box sx={{ height: '100%', flexGrow: 1 }}>
                <ResponsePanel
                  response={response}
                  loading={loading}
                  getRequests={apiRequests.map(req => ({
                    line: req.line ?? 0,
                    url: req.url,
                    type: req.method || "UNKNOWN",
                  }))}
                  apiResponses={apiRequests.map(req => ({
                    line: req.line ?? 0,
                    url: req.url,
                    response: req.response || "No Response",
                  }))}
                  selectedRequestIndex={selectedRequestIndex}
                  selectedApiCall={selectedApiCall}
                />
              </Box>
            )}
          </Box>
        </Paper>
      </Split>
    </Box>
  );
}

export default MainView;