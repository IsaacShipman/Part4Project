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
  background: theme.custom.colors.background.gradient,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${theme.custom.colors.border.primary}`,
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  margin: '16px',
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100% - 32px)', // Full height minus margins
}));

// Terminal header with gradient
const TerminalHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.custom.colors.primary}20 0%, ${theme.custom.colors.accent}15 100%)`,
  borderBottom: `1px solid ${theme.custom.colors.primary}30`,
  padding: '8px 16px',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: `linear-gradient(90deg, transparent 0%, ${theme.custom.colors.primary}50 50%, transparent 100%)`,
  }
}));

// Content area with custom scrollbar
const TerminalContent = styled(Box)(({ theme }) => ({
  fontFamily: theme.custom.terminal.fontFamily,
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
  scrollbarColor: `${theme.custom.colors.primary}30 transparent`,
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: `linear-gradient(180deg, ${theme.custom.colors.primary}40, ${theme.custom.colors.accent}30)`,
    borderRadius: '4px',
    border: `1px solid ${theme.custom.colors.primary}20`,
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: `linear-gradient(180deg, ${theme.custom.colors.primary}60, ${theme.custom.colors.accent}40)`,
  },
}));

// Animated cursor
const AnimatedCursor = styled('span')(({ theme }) => ({
  display: 'inline-block',
  width: '8px',
  height: '16px',
  backgroundColor: `${theme.custom.colors.primary}80`,
  marginLeft: '4px',
  animation: `${blink} 1.2s infinite`,
  borderRadius: '1px',
  boxShadow: `0 0 8px ${theme.custom.colors.primary}40`,
}));

// Terminal prompt with enhanced styling
const PromptLine = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px',
  fontWeight: 500,
});

// Response container with glass effect
const ResponseContainer = styled('pre')(({ theme }) => ({
  margin: '0 0 16px 0',
  padding: '12px 16px',
  background: theme.custom.colors.background.tertiary,
  border: `1px solid ${theme.custom.colors.border.primary}`,
  borderLeft: `3px solid ${theme.custom.colors.primary}60`,
  borderRadius: '0 8px 8px 0',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  color: theme.custom.colors.text.primary,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
}));

// Loading indicator with glow effect
const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '12px',
  background: `${theme.custom.colors.primary}05`,
  border: `1px solid ${theme.custom.colors.primary}20`,
  borderRadius: '8px',
  marginTop: '8px',
}));

const Terminal: React.FC<TerminalProps> = ({
  response,
  loading,
  terminalMaximized,
  terminalMinimized,
  toggleMaximized,
  toggleMinimized,
  clearTerminal,
}) => {
  const theme = useTheme();
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
      <Typography component="span" sx={{ color: theme.custom.colors.accent, fontWeight: 600 }}>
        {formatTime(currentTime)}
      </Typography>
      <Typography component="span" sx={{ color: theme.custom.colors.primary, fontWeight: 500 }}>
        user@sandbox
      </Typography>
      <Typography component="span" sx={{ color: theme.custom.colors.text.muted }}>:</Typography>
      <Typography component="span" sx={{ color: theme.custom.colors.secondary, fontWeight: 600 }}>~</Typography>
      <Typography component="span" sx={{ color: theme.custom.colors.text.muted }}>$</Typography>
      {showCursor && <AnimatedCursor />}
    </PromptLine>
  );

  return (
    <GlassyPaper elevation={0}>
      <TerminalHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Monitor size={18} color={theme.custom.colors.primary} />
            <Typography 
              variant="subtitle2" 
              fontWeight="600"
              sx={{ 
                color: theme.custom.colors.text.primary,
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
                  color: theme.custom.colors.error,
                  backgroundColor: `${theme.custom.colors.error}10`,
                  border: `1px solid ${theme.custom.colors.error}20`,
                  width: 28,
                  height: 28,
                  '&:hover': { 
                    backgroundColor: `${theme.custom.colors.error}20`,
                    boxShadow: `0 0 12px ${theme.custom.colors.error}30`
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
                  color: theme.custom.colors.warning,
                  backgroundColor: `${theme.custom.colors.warning}10`,
                  border: `1px solid ${theme.custom.colors.warning}20`,
                  width: 28,
                  height: 28,
                  '&:hover': { 
                    backgroundColor: `${theme.custom.colors.warning}20`,
                    boxShadow: `0 0 12px ${theme.custom.colors.warning}30`
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
                  color: theme.custom.colors.accent,
                  backgroundColor: `${theme.custom.colors.accent}10`,
                  border: `1px solid ${theme.custom.colors.accent}20`,
                  width: 28,
                  height: 28,
                  '&:hover': { 
                    backgroundColor: `${theme.custom.colors.accent}20`,
                    boxShadow: `0 0 12px ${theme.custom.colors.accent}30`
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
                  color: theme.custom.colors.primary,
                  backgroundColor: `${theme.custom.colors.primary}10`,
                  border: `1px solid ${theme.custom.colors.primary}20`,
                  width: 28,
                  height: 28,
                  '&:hover': { 
                    backgroundColor: `${theme.custom.colors.primary}20`,
                    boxShadow: `0 0 12px ${theme.custom.colors.primary}30`
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
          color: theme.custom.colors.text.primary,
        }}
      >
        {loading ? (
          <LoadingContainer>
            <CircularProgress 
              size={18} 
              sx={{ 
                color: theme.custom.colors.primary,
                filter: `drop-shadow(0 0 4px ${theme.custom.colors.primary}40)`
              }} 
            />
            <Typography 
              component="span" 
              sx={{ 
                ml: 2, 
                color: theme.custom.colors.text.secondary,
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