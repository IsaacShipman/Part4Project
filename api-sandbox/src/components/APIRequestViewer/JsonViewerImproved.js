import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Paper,
  Collapse,
  Tooltip,
  Snackbar,
  Alert,
  useTheme,
  Tabs,
  Tab,
  Chip,
  Badge,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  ContentCopy,
  Search,
  Code,
  DataObject,
  Http,
  Schedule,
  Speed,
  CheckCircle,
  Error,
  Warning,
  Info,
  Refresh,
  Download,
  Upload,
} from '@mui/icons-material';

const EnhancedApiViewer = ({ 
  headers = {}, 
  responseData = {}, 
  requestData = null,
  statusCode = 200,
  responseTime = 250,
  url = '',
  method = 'GET'
}) => {
  const [expandedKeys, setExpandedKeys] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedPath, setCopiedPath] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [prettifyJson, setPrettifyJson] = useState(true);
  const theme = useTheme();

  // Custom theme colors for glassomorphic design
  const glassTheme = {
    background: 'rgba(15, 23, 42, 0.8)',
    backgroundLight: 'rgba(30, 41, 59, 0.6)',
    border: 'rgba(71, 85, 105, 0.3)',
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
      accent: '#60a5fa',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
    }
  };

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
    const parts = path.split('.').filter((part) => part !== '');
    let pythonPath = 'data';
    parts.forEach((part) => {
      if (/^\d+$/.test(part)) {
        pythonPath += `[${part}]`;
      } else {
        pythonPath += `["${part}"]`;
      }
    });
    return pythonPath;
  };

  const copyToClipboard = async (text, customMessage = null) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPath(customMessage || text);
      setSnackbarOpen(true);
      setTimeout(() => setCopiedPath(''), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return glassTheme.text.success;
    if (status >= 300 && status < 400) return glassTheme.text.accent;
    if (status >= 400 && status < 500) return glassTheme.text.warning;
    if (status >= 500) return glassTheme.text.error;
    return glassTheme.text.secondary;
  };

  const getStatusIcon = (status) => {
    const iconProps = { sx: { fontSize: 18, color: getStatusColor(status) } };
    if (status >= 200 && status < 300) return <CheckCircle {...iconProps} />;
    if (status >= 300 && status < 400) return <Info {...iconProps} />;
    if (status >= 400 && status < 500) return <Warning {...iconProps} />;
    if (status >= 500) return <Error {...iconProps} />;
    return <Info {...iconProps} />;
  };

  const formatValue = (value, nestLevel = 0, path = '') => {
    const handleClick = () => copyToClipboard(generatePythonPath(path), `Python path: ${generatePythonPath(path)}`);

    if (typeof value === 'object' && value !== null) {
      const currentPath = path;
      const isExpanded = expandedKeys.has(currentPath);
      const keys = Array.isArray(value) ? value : Object.keys(value);

      return (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
            <IconButton 
              size="small" 
              onClick={() => toggleExpand(currentPath)}
              sx={{ 
                color: glassTheme.text.secondary,
                '&:hover': { 
                  backgroundColor: 'rgba(71, 85, 105, 0.2)',
                  color: glassTheme.text.accent 
                }
              }}
            >
              {isExpanded ? <ExpandMore sx={{ fontSize: 16 }} /> : <ChevronRight sx={{ fontSize: 16 }} />}
            </IconButton>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'SF Mono, Monaco, Menlo, Consolas, monospace',
                fontWeight: 500,
                color: glassTheme.text.accent,
                fontSize: '0.8rem'
              }}
            >
              {Array.isArray(value) ? `Array[${keys.length}]` : `Object{${keys.length}}`}
            </Typography>
            <Tooltip title="Copy Python path" arrow>
              <IconButton 
                size="small" 
                onClick={handleClick}
                sx={{ 
                  color: glassTheme.text.secondary,
                  '&:hover': { 
                    backgroundColor: 'rgba(71, 85, 105, 0.2)',
                    color: glassTheme.text.primary 
                  }
                }}
              >
                <ContentCopy sx={{ fontSize: 12 }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Collapse in={isExpanded}>
            <Box sx={{ 
              ml: 2, 
              mt: 0.5, 
              borderLeft: '1px solid',
              borderColor: glassTheme.border,
              pl: 2 
            }}>
              {keys.map((key, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 0.5, alignItems: 'flex-start' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: glassTheme.text.accent,
                      fontFamily: 'SF Mono, Monaco, Menlo, Consolas, monospace',
                      fontSize: '0.75rem',
                      minWidth: 'fit-content',
                      mt: 0.1
                    }}
                  >
                    {Array.isArray(value) ? `[${index}]` : `"${key}"`}:
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    {formatValue(Array.isArray(value) ? value[key] : value[key], nestLevel + 1, currentPath ? `${currentPath}.${key}` : key)}
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
          padding: '2px 6px',
          borderRadius: '4px',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(71, 85, 105, 0.2)',
            '& .copy-icon': { opacity: 1 },
          },
        }}
        onClick={handleClick}
      >
        <Typography 
          component="span" 
          sx={{ 
            color: getValueColor(value),
            fontFamily: 'SF Mono, Monaco, Menlo, Consolas, monospace',
            fontSize: '0.8rem',
            fontWeight: 400
          }}
        >
          {typeof value === 'string' ? `"${value}"` : String(value)}
        </Typography>
        <ContentCopy 
          className="copy-icon" 
          sx={{ 
            fontSize: 12, 
            opacity: 0, 
            transition: 'opacity 0.2s',
            color: glassTheme.text.secondary 
          }} 
        />
      </Box>
    );
  };

  const getValueColor = (value) => {
    if (value === null) return glassTheme.text.error;
    if (value === undefined) return glassTheme.text.secondary;
    if (typeof value === 'boolean') return glassTheme.text.accent;
    if (typeof value === 'number') return glassTheme.text.success;
    if (typeof value === 'string') return glassTheme.text.primary;
    return glassTheme.text.primary;
  };

  const parseAndFormatJson = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      return formatValue(parsed);
    } catch (error) {
      return (
        <Paper sx={{ 
          p: 2, 
          background: 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${glassTheme.text.error}`,
          borderRadius: 2,
          backdropFilter: 'blur(10px)'
        }}>
          <Typography variant="body2" sx={{ color: glassTheme.text.error, mb: 1 }}>
            Invalid JSON: {error.message}
          </Typography>
          <Paper
            component="pre"
            sx={{
              p: 2,
              background: glassTheme.backgroundLight,
              color: glassTheme.text.primary,
              fontSize: '0.8rem',
              fontFamily: 'SF Mono, Monaco, Menlo, Consolas, monospace',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              border: `1px solid ${glassTheme.border}`,
              borderRadius: 1,
              backdropFilter: 'blur(10px)'
            }}
          >
            {jsonString}
          </Paper>
        </Paper>
      );
    }
  };

  const filteredData = (data) => {
    if (!searchTerm) return data;
    const filter = (obj) => {
      if (typeof obj === 'object' && obj !== null) {
        return Object.entries(obj).reduce((acc, [key, value]) => {
          if (key.toLowerCase().includes(searchTerm.toLowerCase()) || 
              (typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase()))) {
            acc[key] = value;
          } else if (typeof value === 'object' && value !== null) {
            const filteredChild = filter(value);
            if (Object.keys(filteredChild).length > 0) acc[key] = filteredChild;
          }
          return acc;
        }, {});
      }
      return obj;
    };
    return filter(data);
  };

  const renderHeaders = () => (
    <TableContainer 
      component={Paper} 
      sx={{ 
        mt: 2,
        background: glassTheme.backgroundLight,
        border: `1px solid ${glassTheme.border}`,
        borderRadius: 2,
        backdropFilter: 'blur(10px)'
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ 
              fontWeight: 600, 
              color: glassTheme.text.primary,
              fontSize: '0.8rem',
              borderBottom: `1px solid ${glassTheme.border}`
            }}>
              Header
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 600, 
              color: glassTheme.text.primary,
              fontSize: '0.8rem',
              borderBottom: `1px solid ${glassTheme.border}`
            }}>
              Value
            </TableCell>
            <TableCell sx={{ borderBottom: `1px solid ${glassTheme.border}` }} width={50}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(headers).map(([key, value]) => (
            <TableRow key={key} sx={{ '&:hover': { backgroundColor: 'rgba(71, 85, 105, 0.1)' } }}>
              <TableCell sx={{ 
                fontFamily: 'SF Mono, Monaco, Menlo, Consolas, monospace',
                color: glassTheme.text.accent,
                fontSize: '0.8rem',
                borderBottom: `1px solid ${glassTheme.border}`
              }}>
                {key}
              </TableCell>
              <TableCell sx={{ 
                fontFamily: 'SF Mono, Monaco, Menlo, Consolas, monospace',
                wordBreak: 'break-all',
                color: glassTheme.text.primary,
                fontSize: '0.8rem',
                borderBottom: `1px solid ${glassTheme.border}`
              }}>
                {value}
              </TableCell>
              <TableCell sx={{ borderBottom: `1px solid ${glassTheme.border}` }}>
                <IconButton 
                  size="small" 
                  onClick={() => copyToClipboard(`${key}: ${value}`, `Header: ${key}`)}
                  sx={{ 
                    color: glassTheme.text.secondary,
                    '&:hover': { 
                      backgroundColor: 'rgba(71, 85, 105, 0.2)',
                      color: glassTheme.text.primary 
                    }
                  }}
                >
                  <ContentCopy sx={{ fontSize: 14 }} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderJsonData = (data, title) => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Search sx={{ color: glassTheme.text.secondary, fontSize: 20 }} />
        <TextField
          label={`Search ${title}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ 
            flex: 1,
            '& .MuiOutlinedInput-root': {
              backgroundColor: glassTheme.backgroundLight,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${glassTheme.border}`,
              '& fieldset': { border: 'none' },
              color: glassTheme.text.primary,
              fontSize: '0.9rem'
            },
            '& .MuiInputLabel-root': {
              color: glassTheme.text.secondary,
              fontSize: '0.9rem'
            }
          }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={prettifyJson}
              onChange={(e) => setPrettifyJson(e.target.checked)}
              size="small"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: glassTheme.text.accent,
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: glassTheme.text.accent,
                },
              }}
            />
          }
          label={<Typography sx={{ color: glassTheme.text.secondary, fontSize: '0.9rem' }}>Pretty</Typography>}
        />
        <Button
          size="small"
          startIcon={<ContentCopy sx={{ fontSize: 16 }} />}
          onClick={() => copyToClipboard(JSON.stringify(data, null, 2), 'JSON data')}
          sx={{
            backgroundColor: glassTheme.backgroundLight,
            border: `1px solid ${glassTheme.border}`,
            color: glassTheme.text.primary,
            backdropFilter: 'blur(10px)',
            fontSize: '0.8rem',
            '&:hover': {
              backgroundColor: 'rgba(71, 85, 105, 0.3)',
              borderColor: glassTheme.text.accent
            }
          }}
        >
          Copy JSON
        </Button>
      </Box>

      <Paper
        sx={{
          background: glassTheme.backgroundLight,
          border: `1px solid ${glassTheme.border}`,
          borderRadius: 2,
          maxHeight: '70vh',
          overflow: 'auto',
          p: 2,
          backdropFilter: 'blur(10px)',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(71, 85, 105, 0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(71, 85, 105, 0.3)',
            borderRadius: '3px',
          },
        }}
      >
        {prettifyJson ? (
          typeof data === 'string' ? parseAndFormatJson(data) : formatValue(filteredData(data))
        ) : (
          <Typography
            component="pre"
            sx={{
              fontFamily: 'SF Mono, Monaco, Menlo, Consolas, monospace',
              fontSize: '0.8rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: glassTheme.text.primary,
              lineHeight: 1.5
            }}
          >
            {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
          </Typography>
        )}
      </Paper>
    </Box>
  );

  const tabData = [
    { label: 'Response', icon: <DataObject sx={{ fontSize: 18 }} />, count: Object.keys(responseData).length },
    { label: 'Headers', icon: <Http sx={{ fontSize: 18 }} />, count: Object.keys(headers).length },
    ...(requestData ? [{ label: 'Request', icon: <Upload sx={{ fontSize: 18 }} />, count: Object.keys(requestData).length }] : []),
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: '100vw', height: '100%' }}>
      {/* Status Bar */}
      <Paper sx={{ 
        p: 2,  
        background: glassTheme.backgroundLight,
        border: `1px solid ${glassTheme.border}`,
        borderRadius: 2,
        backdropFilter: 'blur(10px)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={method}
              size="small"
              sx={{
                backgroundColor: glassTheme.text.accent,
                color: '#0f172a',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            />
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'SF Mono, Monaco, Menlo, Consolas, monospace',
                color: glassTheme.text.secondary,
                fontSize: '0.8rem'
              }}
            >
              {url || 'No URL provided'}
            </Typography>
          </Box>
          
          <Divider orientation="vertical" flexItem sx={{ borderColor: glassTheme.border }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusIcon(statusCode)}
            <Chip
              label={`${statusCode}`}
              size="small"
              sx={{
                backgroundColor: getStatusColor(statusCode),
                color: '#0f172a',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            />
          </Box>

          {responseTime && (
            <>
              <Divider orientation="vertical" flexItem sx={{ borderColor: glassTheme.border }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Speed sx={{ fontSize: 16, color: glassTheme.text.secondary }} />
                <Typography variant="body2" sx={{ color: glassTheme.text.secondary, fontSize: '0.8rem' }}>
                  {responseTime}ms
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ 
        width: '100%',
        background: glassTheme.backgroundLight,
        border: `1px solid ${glassTheme.border}`,
        borderRadius: 2,
        backdropFilter: 'blur(10px)'
      }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ 
            borderBottom: `1px solid ${glassTheme.border}`,
            '& .MuiTab-root': {
              color: glassTheme.text.secondary,
              fontSize: '0.8rem',
              textTransform: 'none',
              fontWeight: 500,
              '&.Mui-selected': {
                color: glassTheme.text.accent
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: glassTheme.text.accent
            }
          }}
        >
          {tabData.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={
                <Badge 
                  badgeContent={tab.count} 
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: glassTheme.text.accent,
                      color: '#0f172a',
                      fontSize: '0.7rem'
                    }
                  }}
                  max={999}
                >
                  {tab.label}
                </Badge>
              }
              iconPosition="start"
            />
          ))}
        </Tabs>

        <Box sx={{ p: 2 }}>
          {activeTab === 0 && renderJsonData(responseData, 'Response')}
          {activeTab === 1 && renderHeaders()}
          {activeTab === 2 && requestData && renderJsonData(requestData, 'Request')}
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity="success" 
          sx={{ 
            width: '100%',
            background: glassTheme.backgroundLight,
            border: `1px solid ${glassTheme.text.success}`,
            backdropFilter: 'blur(10px)',
            color: glassTheme.text.primary
          }}
        >
          Copied: {copiedPath}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnhancedApiViewer;