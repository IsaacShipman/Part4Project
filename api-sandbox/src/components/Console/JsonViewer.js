import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Paper,
  Collapse,
  Tooltip,
  Snackbar,
  Alert,
  useTheme
} from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  ContentCopy,
  DataObject,
  DataArray
} from '@mui/icons-material';

const JsonViewer = ({ data }) => {
  const [expandedKeys, setExpandedKeys] = useState(new Set());
  const [copiedPath, setCopiedPath] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const theme = useTheme();

  const toggleExpand = (key) => {
    const newExpandedKeys = new Set(expandedKeys);
    if (newExpandedKeys.has(key)) {
      newExpandedKeys.delete(key);
    } else {
      newExpandedKeys.add(key);
    }
    setExpandedKeys(newExpandedKeys);
  };

  const generatePythonPath = (path) => {
    if (!path) return 'data';
    
    const parts = path.split('.').filter(part => part !== '');
    let pythonPath = 'data';
    
    parts.forEach(part => {
      if (/^\d+$/.test(part)) {
        pythonPath += `[${part}]`;
      } else {
        pythonPath += `["${part}"]`;
      }
    });
    
    return pythonPath;
  };

  const copyToClipboard = async (path) => {
    const pythonCode = generatePythonPath(path);
    try {
      await navigator.clipboard.writeText(pythonCode);
      setCopiedPath(path);
      setSnackbarOpen(true);
      setTimeout(() => setCopiedPath(''), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const getValueColor = (value) => {
    if (value === null) return theme.palette.error.main;
    if (value === undefined) return theme.palette.text.disabled;
    if (typeof value === 'boolean') return theme.palette.info.main;
    if (typeof value === 'number') return theme.palette.success.main;
    if (typeof value === 'string') return theme.palette.warning.main;
    return theme.palette.text.primary;
  };

  const formatValue = (value, nestLevel = 0, path = '') => {
    const handleClick = () => copyToClipboard(path);

    if (value === null) {
      return (
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: 1,
            '&:hover': {
              backgroundColor: 'action.hover',
              '& .copy-icon': { opacity: 1 }
            }
          }}
          onClick={handleClick}
        >
          <Typography
            component="span"
            sx={{ color: getValueColor(value), fontWeight: 500 }}
          >
            null
          </Typography>
          <ContentCopy
            className="copy-icon"
            sx={{ fontSize: 12, opacity: 0, transition: 'opacity 0.2s', color: 'text.secondary' }}
          />
        </Box>
      );
    }
    
    if (value === undefined) {
      return (
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: 1,
            '&:hover': {
              backgroundColor: 'action.hover',
              '& .copy-icon': { opacity: 1 }
            }
          }}
          onClick={handleClick}
        >
          <Typography
            component="span"
            sx={{ color: getValueColor(value), fontWeight: 500 }}
          >
            undefined
          </Typography>
          <ContentCopy
            className="copy-icon"
            sx={{ fontSize: 12, opacity: 0, transition: 'opacity 0.2s', color: 'text.secondary' }}
          />
        </Box>
      );
    }
    
    if (typeof value === 'boolean' || typeof value === 'number') {
      return (
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: 1,
            '&:hover': {
              backgroundColor: 'action.hover',
              '& .copy-icon': { opacity: 1 }
            }
          }}
          onClick={handleClick}
        >
          <Typography
            component="span"
            sx={{ color: getValueColor(value), fontWeight: 500 }}
          >
            {value.toString()}
          </Typography>
          <ContentCopy
            className="copy-icon"
            sx={{ fontSize: 12, opacity: 0, transition: 'opacity 0.2s', color: 'text.secondary' }}
          />
        </Box>
      );
    }
    
    if (typeof value === 'string') {
      return (
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: 1,
            '&:hover': {
              backgroundColor: 'action.hover',
              '& .copy-icon': { opacity: 1 }
            }
          }}
          onClick={handleClick}
        >
          <Typography
            component="span"
            sx={{ color: getValueColor(value), fontWeight: 500 }}
          >
            "{value}"
          </Typography>
          <ContentCopy
            className="copy-icon"
            sx={{ fontSize: 12, opacity: 0, transition: 'opacity 0.2s', color: 'text.secondary' }}
          />
        </Box>
      );
    }
    
    if (Array.isArray(value)) {
      const currentPath = path;
      const isExpanded = expandedKeys.has(currentPath);
      
      if (value.length === 0) {
        return (
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              cursor: 'pointer',
              padding: '2px 4px',
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'action.hover',
                '& .copy-icon': { opacity: 1 }
              }
            }}
            onClick={handleClick}
          >
            <Typography component="span" sx={{ color: 'text.primary' }}>
              []
            </Typography>
            <ContentCopy
              className="copy-icon"
              sx={{ fontSize: 12, opacity: 0, transition: 'opacity 0.2s', color: 'text.secondary' }}
            />
          </Box>
        );
      }
      
      return (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => toggleExpand(currentPath)}
              sx={{ p: 0.5 }}
            >
              {isExpanded ? <ExpandMore /> : <ChevronRight />}
            </IconButton>
            <Chip
              icon={<DataArray />}
              label={`Array(${value.length})`}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.75rem' }}
            />
            <Tooltip title="Copy Python path">
              <IconButton
                size="small"
                onClick={handleClick}
                sx={{ 
                  p: 0.25,
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  '.MuiBox-root:hover &': { opacity: 1 }
                }}
              >
                <ContentCopy sx={{ fontSize: 12 }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Collapse in={isExpanded}>
            <Box sx={{ ml: 2, mt: 1, borderLeft: '2px solid', borderColor: 'divider', pl: 2 }}>
              {value.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{ 
                      color: 'text.secondary',
                      fontFamily: 'monospace',
                      minWidth: 24,
                      mt: 0.25
                    }}
                  >
                    {index}:
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    {formatValue(item, nestLevel + 1, currentPath ? `${currentPath}.${index}` : `${index}`)}
                  </Box>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Box>
      );
    }
    
    if (typeof value === 'object') {
      const currentPath = path;
      const isExpanded = expandedKeys.has(currentPath);
      const keys = Object.keys(value);
      
      if (keys.length === 0) {
        return (
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              cursor: 'pointer',
              padding: '2px 4px',
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'action.hover',
                '& .copy-icon': { opacity: 1 }
              }
            }}
            onClick={handleClick}
          >
            <Typography component="span" sx={{ color: 'text.primary' }}>
              {'{}'}
            </Typography>
            <ContentCopy
              className="copy-icon"
              sx={{ fontSize: 12, opacity: 0, transition: 'opacity 0.2s', color: 'text.secondary' }}
            />
          </Box>
        );
      }
      
      return (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => toggleExpand(currentPath)}
              sx={{ p: 0.5 }}
            >
              {isExpanded ? <ExpandMore /> : <ChevronRight />}
            </IconButton>
            <Chip
              icon={<DataObject />}
              label={`Object(${keys.length})`}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.75rem' }}
            />
            <Tooltip title="Copy Python path">
              <IconButton
                size="small"
                onClick={handleClick}
                sx={{ 
                  p: 0.25,
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  '.MuiBox-root:hover &': { opacity: 1 }
                }}
              >
                <ContentCopy sx={{ fontSize: 12 }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Collapse in={isExpanded}>
            <Box sx={{ ml: 2, mt: 1, borderLeft: '2px solid', borderColor: 'divider', pl: 2 }}>
              {keys.map(key => (
                <Box key={key} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{ 
                      color: 'primary.main',
                      fontFamily: 'monospace',
                      fontWeight: 500,
                      mt: 0.25
                    }}
                  >
                    "{key}":
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    {formatValue(value[key], nestLevel + 1, currentPath ? `${currentPath}.${key}` : key)}
                  </Box>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Box>
      );
    }

    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: 'pointer',
          padding: '2px 4px',
          borderRadius: 1,
          '&:hover': {
            backgroundColor: 'action.hover',
            '& .copy-icon': { opacity: 1 }
          }
        }}
        onClick={handleClick}
      >
        <Typography component="span" sx={{ color: 'text.primary' }}>
          {String(value)}
        </Typography>
        <ContentCopy
          className="copy-icon"
          sx={{ fontSize: 12, opacity: 0, transition: 'opacity 0.2s', color: 'text.secondary' }}
        />
      </Box>
    );
  };

  const parseAndFormatJson = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      return formatValue(parsed);
    } catch (error) {
      try {
        const fixedJson = jsonString
          .replace(/'/g, '"')
          .replace(/(\w+):/g, '"$1":'); 
        
        const parsed = JSON.parse(fixedJson);
        return formatValue(parsed);
      } catch (secondError) {
        return (
          <Paper
            sx={{
              p: 2,
              bgcolor: 'error.dark',
              border: 1,
              borderColor: 'error.main'
            }}
          >
            <Typography variant="body2" color="error.light" gutterBottom>
              Invalid JSON: {error.message}
            </Typography>
            <Paper
              component="pre"
              sx={{
                p: 1,
                bgcolor: 'background.default',
                color: 'text.primary',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                overflow: 'auto',
                whiteSpace: 'pre-wrap'
              }}
            >
              {jsonString}
            </Paper>
          </Paper>
        );
      }
    }
  };

  return (
    <>
      <Paper
        sx={{
          bgcolor: 'transparent',
          overflow: 'auto',
          '& .MuiTypography-root': {
            fontSize: '1rem' // Increase font size from default
          },
          '& .MuiBox-root': {
            marginBottom: '2px' // Reduce gap between lines (default was 0.5 which translates to 4px)
          }
        }}
      >
        {typeof data === 'string' ? parseAndFormatJson(data) : formatValue(data)}
      </Paper>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Copied to clipboard: {generatePythonPath(copiedPath)}
        </Alert>
      </Snackbar>
    </>
  );
};

// Export the scan function as well
export const scanForRequests = (code) => {
  const lines = code.split("\n");
  const requests = [];

  lines.forEach((line, index) => {
    const match = line.match(/requests\.(get|post|put|delete|patch)\(([^)]+)\)/);

    if (match) {
      const [, type, paramContent] = match;

      const stringMatch = paramContent.match(/['"]([^'"]+)['"]/);
      let url = "Variable used - check definition";

      if (stringMatch) {
        url = stringMatch[1];
      } else {
        const varMatch = paramContent.trim();
        url = `Variable: ${varMatch}`;
      }

      requests.push({
        line: index + 1,
        url,
        type: type.toUpperCase(),
      });
    }

    if (index > 0) {
      const prevLine = lines[index - 1];
      const fStringMatch = prevLine.match(/url\s*=\s*f['"](.*)['"]/);
      const currentRequestMatch = line.match(/requests\.(get|post|put|delete|patch)\((\w+)\)/);

      if (fStringMatch && currentRequestMatch && currentRequestMatch[2] === 'url') {
        requests.push({
          line: index + 1,
          url: fStringMatch[1],
          type: currentRequestMatch[1].toUpperCase(),
        });
      }
    }
  });

  return requests;
};

export default JsonViewer;