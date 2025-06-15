import React, { useState, useEffect, useCallback, useRef } from 'react';
import Split from 'react-split';
import { Box, Paper, Button, useTheme, styled, alpha } from '@mui/material';
import CodeEditor from '../components/CodeEditor/CodeEditor';
import ResponsePanel from '../components/Console/ResponsePanel';
import DocumentationPanel from '../components/Documentation/DocumentationPanel';
import APIFolderStructure from '../components/FolderStructure/APIFolderStructure';
import RequestPanel from '../components/RequestPanel/RequestPanel';
import axios from 'axios';
import { ApiCall } from '../types/api';
import Description from '@mui/icons-material/Description';
import Code from '@mui/icons-material/Code';
import MainEditor from '../components/CodeEditor/MainEditor';
import { useFileManager } from '../contexts/FileManagerContext';
import { saveApiCalls, loadApiCalls } from '../utils/localStorageUtils';



const MainContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${theme.palette.background.default} 0%, 
    ${alpha(theme.palette.background.paper, 0.8)} 50%,
    ${theme.palette.background.default} 100%)`,
  minHeight: '100vh',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at 20% 50%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
                 radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%),
                 radial-gradient(circle at 40% 80%, ${alpha(theme.palette.info.main, 0.05)} 0%, transparent 50%)`,
    pointerEvents: 'none',
  },
}));

const SplitContainer = styled(Box)({
  '& .gutter': {
    background: 'transparent',
    border: 'none',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.1)',
    },
  },
  '& .gutter-horizontal': {
    cursor: 'col-resize',
    width: '6px',
  },
  '& .gutter-vertical': {
    cursor: 'row-resize',
    height: '6px',
  },
});

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
  const { getActiveFile } = useFileManager();
  // Keep the default code for new files or when no file is selected
  const [defaultCode, setDefaultCode] = useState(`import requests
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
  const [apiCalls, setApiCalls] = useState<ApiCall[]>(() => loadApiCalls());
  const [isRequestPanelOpen, setIsRequestPanelOpen] = useState(false);
  
  const [selectedRequestIndex, setSelectedRequestIndex] = useState<number | null>(null);

  // Load saved requests on component mount
  useEffect(() => {
    const savedCalls = loadApiCalls();
    if (savedCalls.length > 0) {
      setApiCalls(savedCalls);
      
      // Convert saved API calls to API requests format
      const requests: APIRequest[] = savedCalls.map(call => ({
        line: call.request?.line,
        method: call.method,
        url: call.url,
        status: call.status,
        response: call.response,
        timestamp: call.timestamp,
        headers: call.headers
      }));
      
      setApiRequests(requests);
      setIsRequestPanelOpen(true);
    }
  }, []);

  // Save API calls whenever they change
  useEffect(() => {
    if (apiCalls.length > 0) {
      saveApiCalls(apiCalls);
    }
  }, [apiCalls]);

  const handleExecuteCode = useCallback(async () => {
    setLoading(true);
    setResponse(null);
    // Clear previous API calls
    setApiCalls([]);
    setApiRequests([]);
    
    // Get the code from the active file or use default code as fallback
    const activeFile = getActiveFile();
    const codeToExecute = activeFile ? activeFile.content : defaultCode;
    
    console.log("Executing code:", codeToExecute);

    try {
      const result = await axios.post("http://localhost:8000/run", {
        code: codeToExecute,
        language: "python",
      });

      setResponse(result.data.output || "Code executed successfully.");
      
      // Process intercepted API calls
      if (result.data.api_calls && Array.isArray(result.data.api_calls)) {
        const calls = result.data.api_calls;
        setApiCalls(calls);
        saveApiCalls(calls); // Save to localStorage
        
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
  }, [defaultCode, getActiveFile]); 

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
    <MainContainer sx={{ height: 'calc(100vh - 72px)', pt: 8 }}>
      <SplitContainer sx={{ height: 'calc(100vh - 72px)', position: 'relative' }}>
        <Split
          direction="vertical"
          sizes={[70, 30]}
          minSize={100}
          gutterSize={6}
          style={{ height: '100%' }}
        >
          <Split
            sizes={isRequestPanelOpen ? [20, 60, 20] : [20, 77, 3]}
            minSize={isRequestPanelOpen ? 50 : 30}
            gutterSize={6}
            style={{ 
              display: 'flex', 
              height: '100%',
              gap: '8px',
              padding: '10px',
            }}
          >
  
            <APIFolderStructure onSelectEndpoint={handleSelectEndpoint} />
       
            <MainEditor 
                code={defaultCode} 
                setCode={setDefaultCode} 
                onExecuteCode={handleExecuteCode} 
                standalone={false}
              />
            
         
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

          <Box sx={{ padding: '8px', paddingTop: 0 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden',
                borderRadius: '12px',
              }}
            >
              {/* Replace the TabContainer with a more compact floating toggle */}
              <Box sx={{ 
  position: 'relative',
  overflow: 'hidden', 
  height: '100%', 
  flexGrow: 1,
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.background.paper, 0.02)} 0%, 
    ${alpha(theme.palette.background.paper, 0.01)} 100%)`,
}}>
  {/* Content panels */}
  <Box sx={{ height: 'calc(100% - 36px)', overflow: 'auto' }}>
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
  
  {/* Tab strip at the bottom */}
  <Box
    sx={{
      display: 'flex',
      height: '36px',
      borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      background: alpha(theme.palette.background.paper, 0.1),
      backdropFilter: 'blur(5px)',
      WebkitBackdropFilter: 'blur(5px)',
    }}
  >
    <Button
      sx={{
        flex: 1,
        borderRadius: 0,
        height: '36px',
        background: activePanel === 'console' ? alpha(theme.palette.primary.main, 0.15) : 'transparent',
        color: activePanel === 'console' ? theme.palette.primary.main : theme.palette.text.secondary,
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        '&:hover': {
          background: alpha(theme.palette.primary.main, 0.1),
        },
      }}
      onClick={() => setActivePanel('console')}
      startIcon={<Code fontSize="small" />}
    >
      Console
    </Button>
    <Button
      sx={{
        flex: 1,
        borderRadius: 0,
        height: '36px',
        background: activePanel === 'documentation' ? alpha(theme.palette.primary.main, 0.15) : 'transparent',
        color: activePanel === 'documentation' ? theme.palette.primary.main : theme.palette.text.secondary,
        '&:hover': {
          background: alpha(theme.palette.primary.main, 0.1),
        },
      }}
      onClick={() => setActivePanel('documentation')}
      startIcon={<Description fontSize="small" />}
    >
      Docs
    </Button>
  </Box>
</Box>
            </Box>
          </Box>
        </Split>
      </SplitContainer>
    </MainContainer>
  );
}

export default MainView;