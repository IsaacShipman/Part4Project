import React, { useState } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Typography,
  useTheme,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Send,
  Http,
  Close,
  ClearAll,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { ApiCall } from '../../types/api';
import { saveApiCalls, loadApiCalls, clearApiCalls } from '../../utils/localStorageUtils';

interface ManualRequestPanelProps {
  onRequestSent: (newCall: ApiCall) => void;
  onClearRequests?: () => void;
}

const GlassContainer = styled(Paper)(({ theme }) => ({
  background: theme.custom.colors.background.gradient,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  border: `1px solid ${theme.custom.colors.border.primary}`,
  marginBottom: '16px',
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  padding: '16px 24px',
  background: `linear-gradient(90deg, ${theme.custom.colors.primary}20 0%, ${theme.custom.colors.accent}15 100%)`,
  borderBottom: `1px solid ${theme.custom.colors.primary}30`,
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

const ManualRequestPanel: React.FC<ManualRequestPanelProps> = ({ onRequestSent, onClearRequests }) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [authType, setAuthType] = useState('none');
  const [token, setToken] = useState('');

  const authTypes = [
    { value: 'none', label: 'No Authentication' },
    { value: 'bearer', label: 'Bearer Token' },
    { value: 'api-key', label: 'API Key' },
    { value: 'basic', label: 'Basic Auth' },
  ];

  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

  const buildHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'API-Sandbox/1.0',
    };

    if (authType === 'bearer' && token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (authType === 'api-key' && token) {
      headers['X-API-Key'] = token;
    } else if (authType === 'basic' && token) {
      // For basic auth, token should be base64 encoded username:password
      headers['Authorization'] = `Basic ${token}`;
    }

    return headers;
  };

  const validateForm = (): boolean => {
    if (!url.trim()) {
      setError('URL is required');
      return false;
    }

    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL');
      return false;
    }

    if (authType !== 'none' && !token.trim()) {
      setError('Authentication token is required for the selected auth type');
      return false;
    }

    return true;
  };

  const sendRequest = async () => {
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const headers = buildHeaders();
      const startTime = Date.now();

      const requestOptions: RequestInit = {
        method,
        headers,
      };

      // For methods that can have a body, add an empty JSON object if needed
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        requestOptions.body = JSON.stringify({});
      }

      const response = await fetch(url, requestOptions);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Parse response
      let responseData;
      const responseText = await response.text();
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      // Convert Headers to plain object
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Create ApiCall object
      const newApiCall: ApiCall = {
        id: Date.now(),
        method,
        url,
        status: response.status,
        response: JSON.stringify(responseData),
        headers: responseHeaders,
        timestamp: Date.now(),
        request: {
          method,
          url,
          headers,
          timestamp: new Date().toISOString(),
        },
        responseData: {
          status_code: response.status,
          headers: responseHeaders,
          content: responseText,
        },
      };

      // Save to localStorage
      const existingCalls = loadApiCalls();
      const updatedCalls = [newApiCall, ...existingCalls];
      saveApiCalls(updatedCalls);

      // Notify parent component
      onRequestSent(newApiCall);

      setSuccess(`Request sent successfully! Status: ${response.status} (${responseTime}ms)`);
      
      // Clear form after successful request
      setUrl('');
      setToken('');
      setAuthType('none');
      setMethod('GET');

    } catch (err) {
      console.error('Request failed:', err);
      setError(`Request failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleClearRequests = () => {
    clearApiCalls();
    if (onClearRequests) {
      onClearRequests();
    }
    setSuccess('All requests cleared successfully!');
  };

  return (
    <Box sx={{ mb: 2 }}>
      {/* Error/Success Messages */}
         <GlassContainer elevation={0}>
        <Box sx={{ p: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            alignItems: 'center',
            height: '56px' // Standard Material-UI input height
          }}>
            {/* HTTP Method Selector */}
            <FormControl sx={{ minWidth: 100 }}>
              <InputLabel size="small">Method</InputLabel>
              <Select
                value={method}
                label="Method"
                size="small"
                onChange={(e) => setMethod(e.target.value)}
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: theme.custom.colors.border.secondary,
                    },
                    '&:hover fieldset': {
                      borderColor: theme.custom.colors.border.primary,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.custom.colors.primary,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.custom.colors.text.muted,
                  },
                  '& .MuiSelect-select': {
                    color: theme.custom.colors.text.primary,
                  },
                }}
              >
                {httpMethods.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* URL Input */}
            <TextField
              label="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              size="small"
              placeholder="https://api.example.com/endpoint"
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: theme.custom.colors.border.secondary,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.custom.colors.border.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.custom.colors.primary,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme.custom.colors.text.muted,
                },
                '& .MuiOutlinedInput-input': {
                  color: theme.custom.colors.text.primary,
                },
              }}
            />

            {/* Authentication Type */}
            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel size="small">Auth</InputLabel>
              <Select
                value={authType}
                label="Auth"
                size="small"
                onChange={(e) => setAuthType(e.target.value)}
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: theme.custom.colors.border.secondary,
                    },
                    '&:hover fieldset': {
                      borderColor: theme.custom.colors.border.primary,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.custom.colors.primary,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.custom.colors.text.muted,
                  },
                  '& .MuiSelect-select': {
                    color: theme.custom.colors.text.primary,
                  },
                }}
              >
                {authTypes.map((auth) => (
                  <MenuItem key={auth.value} value={auth.value}>
                    {auth.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Token Input */}
            <TextField
              label={authType === 'bearer' ? 'Bearer Token' : 
                     authType === 'api-key' ? 'API Key' :
                     authType === 'basic' ? 'Base64 Creds' : 'Token'}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={isLoading || authType === 'none'}
              size="small"
              type="password"
              placeholder={authType === 'bearer' ? 'token...' :
                         authType === 'api-key' ? 'key...' :
                         authType === 'basic' ? 'base64...' : ''}
              sx={{
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: theme.custom.colors.border.secondary,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.custom.colors.border.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.custom.colors.primary,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme.custom.colors.text.muted,
                },
                '& .MuiOutlinedInput-input': {
                  color: theme.custom.colors.text.primary,
                },
              }}
            />

            {/* Clear Requests Button */}
            <Tooltip title="Clear all requests" arrow>
              <Button
                variant="outlined"
                onClick={handleClearRequests}
                disabled={isLoading}
                startIcon={<ClearAll />}
                sx={{
                  borderColor: theme.custom.colors.border.secondary,
                  color: theme.custom.colors.text.muted,
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 2,
                  height: '40px', // Match input height
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: theme.palette.warning.main,
                    backgroundColor: `${theme.palette.warning.main}10`,
                    color: theme.palette.warning.main,
                  },
                  '&:disabled': {
                    borderColor: theme.custom.colors.background.tertiary,
                    color: theme.custom.colors.text.muted,
                  },
                }}
              >
                Clear
              </Button>
            </Tooltip>

            {/* Send Button */}
            <Button
              variant="contained"
              onClick={sendRequest}
              disabled={isLoading || !url.trim()}
              startIcon={isLoading ? <CircularProgress size={16} /> : <Send />}
              sx={{
                backgroundColor: theme.custom.colors.primary,
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                height: '40px', // Match input height
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: theme.custom.colors.accent,
                },
                '&:disabled': {
                  backgroundColor: theme.custom.colors.background.tertiary,
                  color: theme.custom.colors.text.muted,
                },
              }}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </Box>
        </Box>
      </GlassContainer>
    </Box>
  );
};

export default ManualRequestPanel;
