import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Divider,
  useTheme,
  styled,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Close,
  ContentCopy,
  Download,
  Code,
  CheckCircle,
  ErrorOutline,
} from '@mui/icons-material';
import { useNodeState } from '../../contexts/NodeStateContext';
import { glassCardStyles } from '../../styles/containerStyles';

const PanelContainer = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: 20,
  right: 20,
  bottom: 20,
  width: 600,
  zIndex: 1000,
  ...glassCardStyles,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 60% 60%, rgba(59, 130, 246, 0.05) 0%, transparent 40%),
      radial-gradient(circle at 30% 90%, rgba(16, 185, 129, 0.08) 0%, transparent 30%)
    `,
    borderRadius: '12px',
    pointerEvents: 'none',
    zIndex: 1,
  }
}));

const PanelHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
  borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'relative',
  zIndex: 2,
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

const PanelContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 2,
  position: 'relative',
}));

const CodeContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  background: 'rgba(15, 23, 42, 0.9)',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '8px',
  margin: theme.spacing(2),
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}));

const CodeHeader = styled(Box)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.8)',
  borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
  padding: '8px 12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const CodeContent = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflowY: 'auto',
  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
  fontSize: '13px',
  lineHeight: '1.5',
  color: '#e2e8f0',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(71, 85, 105, 0.1)',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(71, 85, 105, 0.3)',
    borderRadius: '3px',
    '&:hover': {
      background: 'rgba(71, 85, 105, 0.5)',
    },
  },
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  gap: theme.spacing(1),
  justifyContent: 'flex-end',
  borderTop: '1px solid rgba(148, 163, 184, 0.2)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'rgba(59, 130, 246, 0.1)',
  border: '1px solid rgba(59, 130, 246, 0.3)',
  borderRadius: '8px',
  color: '#93c5fd',
  fontWeight: 600,
  fontSize: '0.8rem',
  textTransform: 'none',
  padding: '8px 16px',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'rgba(59, 130, 246, 0.2)',
    border: '1px solid rgba(59, 130, 246, 0.5)',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
  },
  '& .MuiButton-startIcon': {
    marginRight: '4px',
  },
}));

interface CodeGenerationPanelProps {
  onClose: () => void;
}

const CodeGenerationPanel: React.FC<CodeGenerationPanelProps> = ({ onClose }) => {
  const theme = useTheme();
  const { state } = useNodeState();
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  useEffect(() => {
    generateCode();
  }, []);

  const generateCode = async () => {
    setLoading(true);
    setError('');

    try {
      // Check if there are any nodes configured
      const nodeCount = Object.keys(state.configurations).length;
      if (nodeCount === 0) {
        setError('No nodes configured. Please add some nodes to your workflow first.');
        setLoading(false);
        return;
      }

      // Convert node state to the format expected by the backend
      const nodes = Object.entries(state.configurations).map(([nodeId, config]) => ({
        id: nodeId,
        data: config,
        position: { x: 0, y: 0 } // We don't need actual positions for code generation
      }));

      const response = await fetch('http://localhost:8000/api/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes: nodes,
          connections: state.connections
        }),
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedCode(result.generated_code);
      } else {
        setError(result.error || 'Failed to generate code');
      }
    } catch (err) {
      setError('Failed to connect to the backend service');
      console.error('Code generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      setError('Failed to copy code to clipboard');
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow_code.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getNodeCount = () => {
    return Object.keys(state.configurations).length;
  };

  return (
    <PanelContainer>
      <PanelHeader>
        <Box display="flex" alignItems="center" gap={1}>
          <Code sx={{ color: 'rgba(59, 130, 246, 0.8)' }} />
          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
            Generated Python Code
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', ml: 1 }}>
            ({getNodeCount()} nodes)
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              color: 'rgba(255, 255, 255, 0.9)',
              background: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <Close />
        </IconButton>
      </PanelHeader>

      <PanelContent>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              margin: 2,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5'
            }}
            icon={<ErrorOutline />}
          >
            {error}
          </Alert>
        )}

        <CodeContainer>
          <CodeHeader>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}>
              workflow_code.py
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              {loading && (
                <CircularProgress size={16} sx={{ color: 'rgba(59, 130, 246, 0.8)' }} />
              )}
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Python
              </Typography>
            </Box>
          </CodeHeader>
          
          <CodeContent>
            {loading ? (
              <Box display="flex" alignItems="center" justifyContent="center" height="200px">
                <CircularProgress size={32} sx={{ color: 'rgba(59, 130, 246, 0.8)' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', ml: 2 }}>
                  Generating code...
                </Typography>
              </Box>
            ) : generatedCode ? (
              generatedCode
            ) : (
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>
                No code generated. Please check your workflow configuration.
              </Typography>
            )}
          </CodeContent>
        </CodeContainer>

        <ActionButtons>
          <StyledButton
            onClick={handleDownloadCode}
            disabled={!generatedCode}
            startIcon={<Download />}
          >
            Download
          </StyledButton>
          <StyledButton
            onClick={handleCopyCode}
            disabled={!generatedCode}
            startIcon={copySuccess ? <CheckCircle /> : <ContentCopy />}
            sx={{
              background: copySuccess ? 'rgba(16, 185, 129, 0.1)' : undefined,
              border: copySuccess ? '1px solid rgba(16, 185, 129, 0.3)' : undefined,
              color: copySuccess ? '#86efac' : undefined,
            }}
          >
            {copySuccess ? 'Copied!' : 'Copy Code'}
          </StyledButton>
        </ActionButtons>
      </PanelContent>

      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        message="Code copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </PanelContainer>
  );
};

export default CodeGenerationPanel; 