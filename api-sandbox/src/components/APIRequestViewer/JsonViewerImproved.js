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
import JsonViewerOptimized from '../Console/JsonViewerOptimized';

const EnhancedApiViewer = ({ 
  headers = {}, 
  responseData = {}, 
  requestData = null,
  statusCode = 200,
  responseTime = 250,
  url = '',
  method = 'GET'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedPath, setCopiedPath] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [prettifyJson, setPrettifyJson] = useState(true);
  const [showPlainJson, setShowPlainJson] = useState(false);
  const theme = useTheme();

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
    if (status >= 200 && status < 300) return theme.custom.colors.accent;
    if (status >= 300 && status < 400) return theme.custom.colors.primary;
    if (status >= 400 && status < 500) return theme.palette.warning.main;
    if (status >= 500) return theme.palette.error.main;
    return theme.custom.colors.text.muted;
  };

  const getStatusIcon = (status) => {
    const iconProps = { sx: { fontSize: 18, color: getStatusColor(status) } };
    if (status >= 200 && status < 300) return <CheckCircle {...iconProps} />;
    if (status >= 300 && status < 400) return <Info {...iconProps} />;
    if (status >= 400 && status < 500) return <Warning {...iconProps} />;
    if (status >= 500) return <Error {...iconProps} />;
    return <Info {...iconProps} />;
  };

  const renderHeaders = () => (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ color: theme.custom.colors.text.primary, fontWeight: 600 }}>
          Request Headers
        </Typography>
        <Chip 
          label={`${Object.keys(headers).length} headers`}
          size="small"
          sx={{ 
            backgroundColor: theme.custom.colors.background.tertiary,
            color: theme.custom.colors.text.muted,
            fontSize: '0.75rem'
          }}
        />
        <Tooltip title="Copy all headers as JSON" arrow>
          <IconButton 
            size="small"
            onClick={() => copyToClipboard(JSON.stringify(headers, null, 2), 'Headers copied to clipboard')}
            sx={{ 
              color: theme.custom.colors.text.muted,
              '&:hover': { 
                backgroundColor: theme.custom.colors.background.tertiary,
                color: theme.custom.colors.text.primary 
              }
            }}
          >
            <ContentCopy sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
      
      <TableContainer 
        component={Paper} 
        sx={{ 
          backgroundColor: theme.custom.colors.background.tertiary,
          border: `1px solid ${theme.custom.colors.border.secondary}`,
          borderRadius: 2,
          maxHeight: 300,
          overflow: 'auto'
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.custom.colors.background.secondary }}>
              <TableCell sx={{ color: theme.custom.colors.primary, fontWeight: 600, fontSize: '0.8rem' }}>
                Header
              </TableCell>
              <TableCell sx={{ color: theme.custom.colors.primary, fontWeight: 600, fontSize: '0.8rem' }}>
                Value
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(headers).map(([key, value]) => (
              <TableRow 
                key={key}
                sx={{ 
                  '&:hover': { backgroundColor: theme.custom.colors.background.secondary },
                  '&:nth-of-type(odd)': { backgroundColor: theme.custom.colors.background.tertiary }
                }}
              >
                <TableCell 
                  sx={{ 
                    color: theme.custom.colors.accent,
                    fontFamily: theme.custom.terminal.fontFamily,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    borderBottom: `1px solid ${theme.custom.colors.border.secondary}`
                  }}
                >
                  {key}
                </TableCell>
                <TableCell 
                  sx={{ 
                    color: theme.custom.colors.text.primary,
                    fontSize: '0.75rem',
                    borderBottom: `1px solid ${theme.custom.colors.border.secondary}`,
                    wordBreak: 'break-word'
                  }}
                >
                  {String(value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderJsonData = (data, title) => (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h6" sx={{ color: theme.custom.colors.text.primary, fontWeight: 600 }}>
          {title}
        </Typography>
        <Chip 
          label={`${typeof data === 'object' ? Object.keys(data).length : 1} items`}
          size="small"
          sx={{ 
            backgroundColor: theme.custom.colors.background.tertiary,
            color: theme.custom.colors.text.muted,
            fontSize: '0.75rem'
          }}
        />
        
        {/* Plain JSON Toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={showPlainJson}
              onChange={(e) => setShowPlainJson(e.target.checked)}
              size="small"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: theme.custom.colors.primary,
                  '&:hover': {
                    backgroundColor: `${theme.custom.colors.primary}10`,
                  },
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: theme.custom.colors.primary,
                },
              }}
            />
          }
          label={
            <Typography variant="caption" sx={{ color: theme.custom.colors.text.muted, fontSize: '0.7rem' }}>
              Plain JSON
            </Typography>
          }
          sx={{ ml: 1 }}
        />
        
        <Tooltip title="Copy as JSON" arrow>
          <IconButton 
            size="small"
            onClick={() => copyToClipboard(JSON.stringify(data, null, 2), `${title} copied to clipboard`)}
            sx={{ 
              color: theme.custom.colors.text.muted,
              '&:hover': { 
                backgroundColor: theme.custom.colors.background.tertiary,
                color: theme.custom.colors.text.primary 
              }
            }}
          >
            <ContentCopy sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Box sx={{ 
        backgroundColor: theme.custom.colors.background.tertiary,
        border: `1px solid ${theme.custom.colors.border.secondary}`,
        borderRadius: 2,
        p: 2,
        height: 'calc(100% - 80px)',
        overflow: 'auto'
      }}>
        {showPlainJson ? (
          <Box sx={{ 
            fontFamily: theme.custom.terminal.fontFamily,
            fontSize: '0.8rem',
            color: theme.custom.colors.text.primary,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {JSON.stringify(data, null, 2)}
          </Box>
        ) : (
          <JsonViewerOptimized data={data} />
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with request info */}
      <Box sx={{ 
        p: 2, 
        borderBottom: `1px solid ${theme.custom.colors.border.secondary}`,
        background: `linear-gradient(90deg, ${theme.custom.colors.background.tertiary} 0%, ${theme.custom.colors.background.secondary} 100%)`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Chip 
            label={method}
            size="small"
            sx={{ 
              backgroundColor: method === 'GET' ? `${theme.custom.colors.accent}20` : 
                       method === 'POST' ? `${theme.custom.colors.primary}20` :
                       method === 'PUT' ? `${theme.palette.warning.main}20` :
                       method === 'DELETE' ? `${theme.palette.error.main}20` : `${theme.custom.colors.text.muted}20`,
              color: method === 'GET' ? theme.custom.colors.accent : 
                     method === 'POST' ? theme.custom.colors.primary :
                     method === 'PUT' ? theme.palette.warning.main :
                     method === 'DELETE' ? theme.palette.error.main : theme.custom.colors.text.muted,
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          />
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.custom.colors.text.primary,
              fontFamily: theme.custom.terminal.fontFamily,
              fontSize: '0.8rem',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {url}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusIcon(statusCode)}
            <Typography 
              variant="body2" 
              sx={{ 
                color: getStatusColor(statusCode),
                fontWeight: 600,
                fontSize: '0.8rem'
              }}
            >
              {statusCode}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Schedule sx={{ fontSize: 16, color: theme.custom.colors.text.muted }} />
            <Typography variant="caption" sx={{ color: theme.custom.colors.text.muted }}>
              {responseTime}ms
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Speed sx={{ fontSize: 16, color: theme.custom.colors.text.muted }} />
            <Typography variant="caption" sx={{ color: theme.custom.colors.text.muted }}>
              {JSON.stringify(responseData).length} bytes
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: `1px solid ${theme.custom.colors.border.secondary}` }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: theme.custom.colors.text.muted,
              fontSize: '0.8rem',
              fontWeight: 500,
              textTransform: 'none',
              minHeight: 48,
              '&.Mui-selected': {
                color: theme.custom.colors.primary,
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: theme.custom.colors.primary,
            }
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Http sx={{ fontSize: 16 }} />
                Response
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DataObject sx={{ fontSize: 16 }} />
                Request
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Code sx={{ fontSize: 16 }} />
                Headers
              </Box>
            } 
          />
        </Tabs>
      </Box>

      {/* Tab content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 0 && renderJsonData(responseData, 'Response Data')}
        {activeTab === 1 && renderJsonData(requestData || {}, 'Request Data')}
        {activeTab === 2 && renderHeaders()}
      </Box>

      {/* Snackbar for copy notifications */}
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
            backgroundColor: theme.custom.colors.accent,
            color: '#ffffff',
            '& .MuiAlert-icon': { color: '#ffffff' }
          }}
        >
          {copiedPath}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnhancedApiViewer;