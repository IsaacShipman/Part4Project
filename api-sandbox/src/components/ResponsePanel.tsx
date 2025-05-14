import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Select, 
  MenuItem, 
  Divider,
  FormControl,
  ButtonGroup,
  Paper,
  CircularProgress,
  Stack,
  useTheme,
  SelectChangeEvent,
  IconButton,
  Tooltip
} from '@mui/material';
import Split from 'react-split';
import '../split-view.css';
import JsonViewer from './JsonViewer';
import { ChevronRight, X, Maximize2, Minimize2, Terminal as TerminalIcon, RefreshCw } from 'lucide-react';

interface GetRequest {
  line: number;
  url: string;
  type: string;
}

interface ResponsePanelProps {
  response: string | null;
  loading: boolean;
  getRequests: GetRequest[];
  apiResponses: { line: number; url: string; response: string }[];
}

const ResponsePanel: React.FC<ResponsePanelProps> = ({ response, loading, getRequests, apiResponses }) => {
  const [view, setView] = useState<'headers' | 'body' | 'response'>('response');
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [terminalMaximized, setTerminalMaximized] = useState<boolean>(false);
  const [terminalMinimized, setTerminalMinimized] = useState<boolean>(false);
  const theme = useTheme();
  const terminalRef = useRef<HTMLDivElement>(null);
  const [splitSizes, setSplitSizes] = useState([30, 70]);

  const handleLineChange = (event: SelectChangeEvent) => {
    setSelectedLine(event.target.value ? Number(event.target.value) : null);
  };

  const selectedApiResponse = apiResponses.find((res) => res.line === selectedLine);

  // Auto-scroll to bottom when terminal content changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [response]);

  // Toggle maximized terminal view
  const toggleMaximized = () => {
    if (terminalMaximized) {
      setSplitSizes([30, 70]);
    } else {
      setSplitSizes([0, 100]);
    }
    setTerminalMaximized(!terminalMaximized);
    setTerminalMinimized(false);
  };

  // Toggle minimized terminal view
  const toggleMinimized = () => {
    if (terminalMinimized) {
      setSplitSizes([30, 70]);
    } else {
      setSplitSizes([100, 0]);
    }
    setTerminalMinimized(!terminalMinimized);
    setTerminalMaximized(false);
  };

  // Clear the terminal (mock function)
  const clearTerminal = () => {
    // In a real app, you would clear the terminal content here
    console.log("Terminal cleared");
    // This would be handled by your state management
  };

  // Get the current time for terminal prompt
  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  };

  return (
    <Split
      sizes={splitSizes}
      minSize={0}
      expandToMin={false}
      gutterSize={5}
      gutterAlign="center"
      snapOffset={30}
      dragInterval={1}
      direction="horizontal"
      cursor="col-resize"
      style={{ display: 'flex', flexGrow: 1, height: '100%' }} // Ensure Split fills the parent container
      onDragEnd={(sizes) => {
        setSplitSizes(sizes);
        setTerminalMaximized(sizes[0] === 0);
        setTerminalMinimized(sizes[1] === 0);
      }}
    >
      {/* Left Panel - API Responses */}
      <Paper 
        elevation={3} 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          flexGrow: 1, // Allow the panel to grow
          height: '100%', // Ensure it fills the Split container
          overflow: 'hidden',
          borderRadius: 0, // Remove border radius if unnecessary
          m: 0, // Ensure no margin
          p: 0, // Ensure no padding
          visibility: splitSizes[0] === 0 ? 'hidden' : 'visible',
          minHeight: 0, // Prevent collapsing
        }}
      >
        <Box sx={{ 
          bgcolor: theme.palette.mode === 'dark' ? '#252526' : '#f3f3f3',
          py: 1, 
          px: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="subtitle2" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ChevronRight size={16} />
            API Response Explorer
          </Typography>
        </Box>

        <Box sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          p: 1,
          bgcolor: theme.palette.mode === 'dark' ? '#252526' : '#f3f3f3',
        }}>
          
          <ButtonGroup 
            size="small" 
            variant="outlined" 
            aria-label="view selector"
            sx={{ 
              minHeight: 28,
              '.MuiButton-root': {
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
              }
            }}
            fullWidth
          >
            <Button 
              onClick={() => setView('headers')}
              variant={view === 'headers' ? 'contained' : 'outlined'}
              sx={{ px: 1 }}
            >
              Headers
            </Button>
            <Button 
              onClick={() => setView('body')}
              variant={view === 'body' ? 'contained' : 'outlined'}
              sx={{ px: 1 }}
            >
              Body
            </Button>
            <Button 
              onClick={() => setView('response')}
              variant={view === 'response' ? 'contained' : 'outlined'}
              sx={{ px: 1 }}
            >
              Response
            </Button>
          </ButtonGroup>
        </Box>

        <Box sx={{ 
          flexGrow: 1, 
          
          overflow: 'hidden', // Prevent the entire component from scrolling
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.mode === 'dark' ? '#1E1E1E' : '#ffffff',
        }}>
          <Box
            sx={{
              flexGrow: 1,
              overflow: 'auto', // Enable scrolling only for this container
              p: 1.5,
              scrollbarWidth: 'thin',
              scrollbarColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2) transparent' : 'rgba(0,0,0,0.2) transparent',
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
              },
            }}
          >
            {loading ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <CircularProgress size={20} />
                <Typography variant="body2">Processing request...</Typography>
              </Stack>
            ) : selectedApiResponse ? (
              <Box
                sx={{
                  maxHeight: '100%', // Ensure the JSON viewer doesn't exceed the container height
                  overflow: 'auto', // Enable scrolling for the JSON viewer
                }}
              >
                <JsonViewer data={selectedApiResponse.response} />
              </Box>
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  color: theme.palette.text.secondary,
                }}
              >
                <Typography variant="body2">Select a request to view response</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Right Panel - Terminal Output */}
      <Paper 
        elevation={3} 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          flexGrow: 1, // Allow the panel to grow
          height: '100%', // Ensure it fills the Split container
          overflow: 'hidden',
          bgcolor: '#1E1E1E', 
          color: '#E0E0E0',
          borderRadius: 0, // Remove border radius if unnecessary
          m: 0, // Ensure no margin
          p: 0, // Ensure no padding
          visibility: splitSizes[1] === 0 ? 'hidden' : 'visible',
          minHeight: 0, // Prevent collapsing
        }}
      >
        <Box 
          sx={{ 
            py: 0.75,
            px: 1.5,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#252526'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TerminalIcon size={16} />
            <Typography variant="subtitle2" fontWeight="medium">TERMINAL</Typography>
            {loading && (
              <CircularProgress size={14} sx={{ color: '#75BEFF', ml: 1 }} />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Clear Terminal">
              <IconButton 
                size="small" 
                onClick={clearTerminal}
                sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'rgba(255,255,255,0.8)' } }}
              >
                <X size={14} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton 
                size="small"
                sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'rgba(255,255,255,0.8)' } }}
              >
                <RefreshCw size={14} />
              </IconButton>
            </Tooltip>
            <Tooltip title={terminalMinimized ? "Restore" : "Minimize"}>
              <IconButton 
                size="small" 
                onClick={toggleMinimized}
                sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'rgba(255,255,255,0.8)' } }}
              >
                <Minimize2 size={14} />
              </IconButton>
            </Tooltip>
            <Tooltip title={terminalMaximized ? "Restore" : "Maximize"}>
              <IconButton 
                size="small" 
                onClick={toggleMaximized}
                sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'rgba(255,255,255,0.8)' } }}
              >
                <Maximize2 size={14} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box 
          sx={{ 
            flexGrow: 1, // Allow the terminal content to grow
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#1E1E1E',
            fontFamily: '"Cascadia Code", "Fira Code", "Roboto Mono", monospace',
          }}
        >
          <Box
            ref={terminalRef}
            sx={{
              flexGrow: 1, // Allow the terminal content to grow
              overflowY: 'auto', 
              overflowX: 'hidden', 
              scrollbarWidth: 'thin',
              maxHeight: '100%', // Remove any restrictions on height
              scrollbarColor: 'rgba(255,255,255,0.2) transparent',
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            {loading ? (
              <Box sx={{ p: 2 }}>
                <Typography 
                  variant="body2" 
                  component="div" 
                  sx={{ 
                    opacity: 0.8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: '#E0E0E0'
                  }}
                >
                  <span style={{ color: '#569CD6' }}>$</span> Running process... 
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <CircularProgress size={16} sx={{ color: '#75BEFF' }} />
                </Box>
              </Box>
            ) : (
              <Box sx={{ p: 1 }}>
                {response ? (
                  <pre 
                    style={{ 
                      margin: 0, 
                      padding: '8px 0',
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      color: '#CCCCCC'
                    }}
                  >
                    {response}
                  </pre>
                ) : (
                  <Typography variant="body2" sx={{ color: '#75BEFF' }}>
                    Terminal ready
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Split>
  );
};

export default ResponsePanel;