import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Typography, Button, Select, MenuItem, Divider,
  FormControl, ButtonGroup, Paper, CircularProgress,
  Stack, useTheme, SelectChangeEvent, IconButton, Tooltip
} from '@mui/material';
import Split from 'react-split';
import '../split-view.css';
import JsonViewer from './JsonViewer';
import { ChevronRight, X, Maximize2, Minimize2, Terminal as TerminalIcon, RefreshCw } from 'lucide-react';
import { ApiCall } from '../types/api';

interface GetRequest {
  line: number;
  url: string;
  type: string;
}

interface ResponsePanelProps {
  response: string | null;
  loading: boolean;
  getRequests: { line: number; url: string; type: string }[];
  apiResponses: { line: number; url: string; response: string }[];
  selectedRequestIndex: number | null;
  selectedApiCall: ApiCall | null;
}

const ResponsePanel: React.FC<ResponsePanelProps> = ({ response, loading, apiResponses, selectedRequestIndex }) => {
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

  const selectedApiResponse = selectedRequestIndex !== null ? apiResponses[selectedRequestIndex] : null;

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
    console.log("Terminal cleared");
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
      style={{ display: 'flex', flexGrow: 1, height: '100%' }}
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
          flexGrow: 1,
          height: '100%',
          overflow: 'hidden',
          borderRadius: 0,
          m: 0,
          p: 0,
          visibility: splitSizes[0] === 0 ? 'hidden' : 'visible',
          minHeight: 0,
        }}
      >
        <Box sx={{ 
          bgcolor: theme.palette.background.subtle,
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
          bgcolor: theme.palette.background.subtle,
        }}>
          
          <ButtonGroup 
            size="small" 
            variant="outlined" 
            aria-label="view selector"
            sx={{ 
              minHeight: 28,
              '.MuiButton-root': {
                borderColor: `rgba(255, 255, 255, 0.12)`
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
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.paper,
        }}>
          <Box
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              p: 1.5,
              scrollbarWidth: 'thin',
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
              <Stack direction="row" alignItems="center" spacing={1}>
                <CircularProgress size={20} />
                <Typography variant="body2">Processing request...</Typography>
              </Stack>
            ) : selectedApiResponse ? (
              <Box
                sx={{
                  maxHeight: '100%',
                  overflow: 'auto',
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
          flexGrow: 1,
          height: '100%',
          overflow: 'hidden',
          bgcolor: theme.custom.terminal.background,
          color: theme.custom.terminal.foreground,
          borderRadius: 0,
          m: 0,
          p: 0,
          visibility: splitSizes[1] === 0 ? 'hidden' : 'visible',
          minHeight: 0,
        }}
      >
        <Box 
          sx={{ 
            py: 0.75,
            px: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: theme.palette.background.subtle
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TerminalIcon size={16} />
            <Typography variant="subtitle2" fontWeight="medium">TERMINAL</Typography>
            {loading && (
              <CircularProgress size={14} sx={{ color: theme.palette.primary.main, ml: 1 }} />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Clear Terminal">
              <IconButton 
                size="small" 
                onClick={clearTerminal}
                sx={{ color: theme.palette.text.secondary, '&:hover': { color: theme.palette.text.primary } }}
              >
                <X size={14} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton 
                size="small"
                sx={{ color: theme.palette.text.secondary, '&:hover': { color: theme.palette.text.primary } }}
              >
                <RefreshCw size={14} />
              </IconButton>
            </Tooltip>
            <Tooltip title={terminalMinimized ? "Restore" : "Minimize"}>
              <IconButton 
                size="small" 
                onClick={toggleMinimized}
                sx={{ color: theme.palette.text.secondary, '&:hover': { color: theme.palette.text.primary } }}
              >
                <Minimize2 size={14} />
              </IconButton>
            </Tooltip>
            <Tooltip title={terminalMaximized ? "Restore" : "Maximize"}>
              <IconButton 
                size="small" 
                onClick={toggleMaximized}
                sx={{ color: theme.palette.text.secondary, '&:hover': { color: theme.palette.text.primary } }}
              >
                <Maximize2 size={14} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box 
          sx={{ 
            flexGrow: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.custom.terminal.background,
            fontFamily: theme.custom.terminal.fontFamily,
          }}
        >
          <Box
            ref={terminalRef}
            sx={{
              flexGrow: 1,
              overflowY: 'auto', 
              overflowX: 'hidden', 
              scrollbarWidth: 'thin',
              maxHeight: '100%',
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
                    color: theme.custom.terminal.foreground
                  }}
                >
                  <span style={{ color: theme.palette.info.main }}>$</span> Running process... 
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <CircularProgress size={16} sx={{ color: theme.palette.primary.main }} />
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
                      color: theme.custom.terminal.foreground
                    }}
                  >
                    {response}
                  </pre>
                ) : (
                  <Typography variant="body2" sx={{ color: theme.palette.primary.main }}>
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