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
              fontFamily: '"JetBrains Mono", "Courier New", monospace',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              padding: 1.5,
              letterSpacing: 0.3,
            }}
          >
            {loading ? (
              <Box sx={{ p: 1 }}>
                <Typography 
                  variant="body2" 
                  component="div" 
                  sx={{ 
                    opacity: 0.9,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: theme.custom.terminal.foreground,
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    mb: 1,
                  }}
                >
  
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, ml: 2 }}>
                  <CircularProgress size={16} sx={{ color: theme.palette.primary.main }} />
                  <Typography 
                    component="span" 
                    sx={{ 
                      ml: 1, 
                      color: theme.palette.grey[400],
                      fontFamily: 'inherit',
                      fontSize: 'inherit', 
                    }}
                  >
                    Processing request...
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ p: 0 }}>
                {response ? (
                  <>
                    <Box 
                      component="div" 
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 0.75,
                        color: theme.custom.terminal.foreground,
                        mb: 1,
                        fontSize: 'inherit',
                        fontFamily: 'inherit',
                      }}
                    >
                      <span style={{ color: theme.palette.success.main }}>{getCurrentTime()}</span>
                      <span style={{ color: theme.palette.info.main }}>user@sandbox</span>
                      <span style={{ color: theme.palette.grey[400] }}>:</span>
                      <span style={{ color: theme.palette.primary.main }}>~</span>
                      <span style={{ color: theme.palette.grey[400] }}>$</span> 
                    </Box>
                    <pre 
                      style={{ 
                        margin: '0 0 12px 0', 
                        padding: '4px 8px 8px 12px',
                        fontSize: 'inherit',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        color: theme.custom.terminal.foreground,
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        borderLeft: `2px solid ${theme.palette.primary.main}`,
                        borderRadius: '0 4px 4px 0',
                        fontWeight: 'normal',
                        fontFamily: 'inherit',
                      }}
                    >
                      {response}
                    </pre>
                    <Box 
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        color: theme.custom.terminal.foreground,
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                      }}
                    >
                      <span style={{ color: theme.palette.success.main }}>{getCurrentTime()}</span>
                      <span style={{ color: theme.palette.info.main }}>user@sandbox</span>
                      <span style={{ color: theme.palette.grey[400] }}>:</span>
                      <span style={{ color: theme.palette.primary.main }}>~</span>
                      <span style={{ color: theme.palette.grey[400] }}>$</span> 
                      <span 
                        style={{ 
                          display: 'inline-block', 
                          width: '8px', 
                          height: '15px',
                          backgroundColor: theme.palette.grey[400],
                          animation: 'blink 1s step-end infinite',
                          marginLeft: '4px',
                        }}
                      ></span>
                    </Box>
                  </>
                ) : (
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      color: theme.custom.terminal.foreground,
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                    }}
                  >
                    <span style={{ color: theme.palette.success.main }}>{getCurrentTime()}</span>
                    <span style={{ color: theme.palette.info.main }}>user@sandbox</span>
                    <span style={{ color: theme.palette.grey[400] }}>:</span>
                    <span style={{ color: theme.palette.primary.main }}>~</span>
                    <span style={{ color: theme.palette.grey[400] }}>$</span> 
                    <span 
                      style={{ 
                        display: 'inline-block', 
                        width: '8px', 
                        height: '15px',
                        backgroundColor: theme.palette.grey[400],
                        animation: 'blink 1s step-end infinite',
                        marginLeft: '4px',
                      }}
                    ></span>
                  </Box>
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