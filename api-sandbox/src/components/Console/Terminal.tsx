import React, { useRef, useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, CircularProgress, 
  IconButton, Tooltip, useTheme, styled, keyframes
} from '@mui/material';
import { X, Maximize2, Minimize2, Monitor, RefreshCw } from 'lucide-react';

interface TerminalProps {
  response: string | null;
  loading: boolean;
  terminalMaximized: boolean;
  terminalMinimized: boolean;
  toggleMaximized: () => void;
  toggleMinimized: () => void;
  clearTerminal: () => void;
}

// Animated cursor blink
const blink = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
`;

// Glassy container with backdrop blur effect
const GlassyPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(15, 20, 25, 0.9) 0%, rgba(26, 35, 50, 0.95) 100%)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  margin: '16px',
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100% - 32px)', // Full height minus margins
}));

// Terminal header with gradient
const TerminalHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
  borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
  padding: '8px 16px',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.5) 50%, transparent 100%)',
  }
}));

// Content area with custom scrollbar
const TerminalContent = styled(Box)(({ theme }) => ({
  fontFamily: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
  fontSize: '0.875rem',
  lineHeight: 1.6,
  padding: '16px',
  letterSpacing: '0.025em',
  overflowY: 'auto',
  overflowX: 'hidden',
  flexGrow: 1,
  height: '100%', // Fill available space
  maxHeight: '100%', // Don't exceed container
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(59, 130, 246, 0.3) transparent',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.4), rgba(16, 185, 129, 0.3))',
    borderRadius: '4px',
    border: '1px solid rgba(59, 130, 246, 0.2)',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.6), rgba(16, 185, 129, 0.4))',
  },
}));

// Animated cursor
const AnimatedCursor = styled('span')({
  display: 'inline-block',
  width: '8px',
  height: '16px',
  backgroundColor: 'rgba(59, 130, 246, 0.8)',
  marginLeft: '4px',
  animation: `${blink} 1.2s infinite`,
  borderRadius: '1px',
  boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)',
});

// Terminal prompt with enhanced styling
const PromptLine = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px',
  fontWeight: 500,
});

// Response container with glass effect
const ResponseContainer = styled('pre')({
  margin: '0 0 16px 0',
  padding: '12px 16px',
  background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(15, 20, 25, 0.4) 100%)',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  borderLeft: '3px solid rgba(59, 130, 246, 0.6)',
  borderRadius: '0 8px 8px 0',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  color: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
});

// Loading indicator with glow effect
const LoadingContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  padding: '12px',
  background: 'rgba(59, 130, 246, 0.05)',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  borderRadius: '8px',
  marginTop: '8px',
});

const Terminal: React.FC<TerminalProps> = ({
  response,
  loading,
  terminalMaximized,
  terminalMinimized,
  toggleMaximized,
  toggleMinimized,
  clearTerminal,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to bottom when terminal content changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [response]);

  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };

  const renderPrompt = (showCursor: boolean = false) => (
    <PromptLine>
      <Typography component="span" sx={{ color: '#10b981', fontWeight: 600 }}>
        {formatTime(currentTime)}
      </Typography>
      <Typography component="span" sx={{ color: '#3b82f6', fontWeight: 500 }}>
        user@sandbox
      </Typography>
      <Typography component="span" sx={{ color: '#6b7280' }}>:</Typography>
      <Typography component="span" sx={{ color: '#8b5cf6', fontWeight: 600 }}>~</Typography>
      <Typography component="span" sx={{ color: '#6b7280' }}>$</Typography>
      {showCursor && <AnimatedCursor />}
    </PromptLine>
  );

  return (
    <GlassyPaper elevation={0}>
      <TerminalHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Monitor size={18} color="rgba(59, 130, 246, 0.8)" />
            <Typography 
              variant="subtitle2" 
              fontWeight="600"
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
              }}
            >
              TERMINAL
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {/* Terminal control buttons with Mac-style colors */}
            <Tooltip title="Clear Terminal" arrow>
              <IconButton 
                size="small" 
                onClick={clearTerminal}
                sx={{ 
                  color: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  width: 28,
                  height: 28,
                  '&:hover': { 
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    boxShadow: '0 0 12px rgba(239, 68, 68, 0.3)'
                  }
                }}
              >
                <X size={14} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Refresh" arrow>
              <IconButton 
                size="small"
                sx={{ 
                  color: '#f59e0b',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  width: 28,
                  height: 28,
                  '&:hover': { 
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    boxShadow: '0 0 12px rgba(245, 158, 11, 0.3)'
                  }
                }}
              >
                <RefreshCw size={14} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={terminalMinimized ? "Restore" : "Minimize"} arrow>
              <IconButton 
                size="small" 
                onClick={toggleMinimized}
                sx={{ 
                  color: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  width: 28,
                  height: 28,
                  '&:hover': { 
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    boxShadow: '0 0 12px rgba(16, 185, 129, 0.3)'
                  }
                }}
              >
                <Minimize2 size={14} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={terminalMaximized ? "Restore" : "Maximize"} arrow>
              <IconButton 
                size="small" 
                onClick={toggleMaximized}
                sx={{ 
                  color: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  width: 28,
                  height: 28,
                  '&:hover': { 
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    boxShadow: '0 0 12px rgba(59, 130, 246, 0.3)'
                  }
                }}
              >
                <Maximize2 size={14} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </TerminalHeader>
      
      <TerminalContent
        ref={terminalRef}
        sx={{
          flexGrow: 1,
          maxHeight: '100%',
          color: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        {loading ? (
          <LoadingContainer>
            <CircularProgress 
              size={18} 
              sx={{ 
                color: '#3b82f6',
                filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.4))'
              }} 
            />
            <Typography 
              component="span" 
              sx={{ 
                ml: 2, 
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                fontWeight: 500,
              }}
            >
              Processing request...
            </Typography>
          </LoadingContainer>
        ) : (
          <Box>
            {response ? (
              <>
                {renderPrompt()}
                <ResponseContainer>
                  {response}
                </ResponseContainer>
                {renderPrompt(true)}
              </>
            ) : (
              renderPrompt(true)
            )}
          </Box>
        )}
      </TerminalContent>
    </GlassyPaper>
  );
};

export default Terminal;