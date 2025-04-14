import React, { useState } from 'react';
import Split from 'react-split';
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import {
  Code as CodeIcon,
  PlayArrow as PlayArrowIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import axios from 'axios';
import CodeEditor from './components/CodeEditor';
import ResponsePanel from './components/ResponsePanel';
import DocumentationPanel from './components/DocumentationPanel';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' },
  },
});

function App() {
  // Delete this if you dont want text appearing when reloading the page
  const [code, setCode] = useState<string>(`import requests

url = "https://jsonplaceholder.typicode.com/todos/1"


response = requests.get(url)


if response.status_code == 200:
    data = response.json()
    print("API Response:", data)
else:
    print(f"Failed to retrieve data. Status code: {response.status_code}")


`);
    
    
  
  const [response, setResponse] = useState<any>(null);
  const [showDocs, setShowDocs] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);

  const handleExecuteCode = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/run", {
        code,
        language: "python"
      });
      setResponse(res.data.output);
    } catch (err) {
      setResponse("Error: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };
  


  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            API Sandbox
          </Typography>
          <IconButton color="inherit" onClick={handleExecuteCode}>
            <PlayArrowIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', mt: 8 }}>
        <Split
          direction="vertical"
          sizes={showDocs ? [75, 25] : [100, 0]}
          minSize={0}
          expandToMin={false}
          gutterSize={6}
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          {/* Top Section: Main App */}
          <Split
            className="split-horizontal"
            sizes={[15, 60, 25]}
            minSize={150}
            gutterSize={10}
            direction="horizontal"
            style={{ display: 'flex', height: '100%' }}
          >
            {/* Sidebar */}
            <Box sx={{ p: 1, backgroundColor: '#1e1e1e' }}>
              <List>
                <ListItemButton onClick={() => setShowDocs(prev => !prev)}>
                  <ListItemIcon><DescriptionIcon /></ListItemIcon>
                  <ListItemText primary="Docs" />
                </ListItemButton> 
              </List>
            </Box>

            {/* Code Editor */}
            <Box sx={{ p: 1 }}>
              <Paper elevation={3} sx={{ height: '100%', p: 2 }}>
                <CodeEditor value={code} onChange={setCode} />
              </Paper>
            </Box>

            {/* Response Panel */}
            <Box sx={{ p: 1 }}>
              <Paper elevation={3} sx={{ height: '100%', p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Response
                </Typography>
                <ResponsePanel response={response} loading={loading} />
              </Paper>
            </Box>
          </Split>

          {/* Bottom Section: Documentation */}
          <Box sx={{ p: 1 }}>
            {showDocs && (
              <Paper elevation={3} sx={{ height: '100%', p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Documentation
                </Typography>
                <DocumentationPanel />
              </Paper>
            )}
          </Box>
        </Split>
      </Box>
    </ThemeProvider>
  );
}

export default App;
