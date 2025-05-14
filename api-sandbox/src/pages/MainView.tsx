import React, { useState, useEffect } from 'react';
import Split from 'react-split';
import { Box, Paper, Button } from '@mui/material';
import CodeEditor from '../components/CodeEditor';
import ResponsePanel from '../components/ResponsePanel';
import DocumentationPanel from '../components/DocumentationPanel';
import FolderStructure from '../components/FolderStructure';
import { scanForRequests } from '../components/JsonViewer';
import RequestPanel from '../components/RequestPanel';


interface MainViewProps {
  onExecuteCode: (fn: () => void) => void;
  pyodide: any; // Add pyodide as a prop
}

function MainView({ onExecuteCode, pyodide }: MainViewProps  ) {
  const [code, setCode] = useState(`print("Hello, Pyodide!")`);
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedEndpointId, setSelectedEndpointId] = useState<number | null>(null);
  const [activePanel, setActivePanel] = useState<'documentation' | 'console'>('console');
  const [getRequests, setGetRequests] = useState<{ line: number; url: string; type: string }[]>([]);
  const [apiResponses, setApiResponses] = useState<{ line: number; url: string; response: string }[]>([]);
  const [isRequestPanelOpen, setIsRequestPanelOpen] = useState(false);


  const handleExecuteCode = async () => {
    if (!pyodide) {
      setResponse("Error: Pyodide is not loaded yet.");
      return;
    }

    setActivePanel('console');
    setLoading(true);
    setApiResponses([]);
    try {
      pyodide.runPython(`
        import sys
        from io import StringIO
        sys.stdout = StringIO()
      `);

      const wrappedCode = `import requests
original_get = requests.get
responses = []

def custom_get(url, *args, **kwargs):
    response = original_get(url, *args, **kwargs)
    responses.append((url, response.text))
    return response

requests.get = custom_get

${code}

requests.get = original_get
responses
      `;

      const apiResponsesResult = await pyodide.runPythonAsync(wrappedCode);

      const stdout = pyodide.runPython("sys.stdout.getvalue()");
      setResponse(stdout);

      const parsedResponses = apiResponsesResult.map(([url, response]: [string, string], index: number) => ({
        line: getRequests[index]?.line || -1,
        url,
        response,
      }));
      setApiResponses(parsedResponses);
    } catch (err) {
      setResponse("Error:\n" + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEndpoint = (endpointId: number) => {
    setSelectedEndpointId(endpointId);
    setActivePanel('documentation');
  };

  useEffect(() => {
    const requests = scanForRequests(code);
    setGetRequests(requests);
    onExecuteCode(handleExecuteCode);
  }, [code, onExecuteCode]);

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
          minSize={50}
          gutterSize={5}
          style={{ display: 'flex', height: '100%', backgroundColor: '#2d2d2d' }}
        >
          <Paper elevation={3} sx={{ overflow: 'auto', borderRadius: 0, m: 0 }}>
            <FolderStructure onSelectEndpoint={handleSelectEndpoint} />
          </Paper>

          <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 0, m: 0, height: '100%' }}>
            <CodeEditor code={code} setCode={setCode} />
          </Paper>

          <RequestPanel setIsOpen={setIsRequestPanelOpen} />
        </Split>

        <Paper
          elevation={3}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'hidden',
            backgroundColor: '#1e1e1e',
            borderTop: '1px solid #333',
            borderRadius: 0,
            m: 0,
            p: 0,
            height: '100%',
          }}
        >
          <Box
            sx={{
              backgroundColor: '#2d2d2d',
              pl: 2,
              borderBottom: '1px solid #333',
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
                fontFamily: 'monospace',
                color: activePanel === 'console' ? '#ffffff' : '#cccccc',
                backgroundColor: activePanel === 'console' ? '#3a3a3a' : 'transparent',
                alignSelf: 'left',
              }}
            >
              CONSOLE
            </Button>
            <Button
              variant={activePanel === 'documentation' ? 'contained' : 'text'}
              onClick={() => setActivePanel('documentation')}
              sx={{
                fontFamily: 'monospace',
                color: activePanel === 'documentation' ? '#ffffff' : '#cccccc',
                backgroundColor: activePanel === 'documentation' ? '#3a3a3a' : 'transparent',
              }}
            >
              DOCUMENTATION
            </Button>
          </Box>

          <Box sx={{ overflow: 'hidden', height: '100%', flexGrow: 1 }}>
            {activePanel === 'documentation' ? (
              <DocumentationPanel endpointId={selectedEndpointId} />
            ) : (
              <Box sx={{ height: '100%', flexGrow: 1 }}>
                <ResponsePanel
                  response={response}
                  loading={loading}
                  getRequests={getRequests}
                  apiResponses={apiResponses}
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