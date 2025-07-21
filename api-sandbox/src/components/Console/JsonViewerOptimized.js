import React, { useState, useMemo, useCallback, memo, useRef, useEffect } from 'react';
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
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  ContentCopy,
  DataObject,
  DataArray
} from '@mui/icons-material';

// Virtualized list component for large arrays
const VirtualizedList = memo(({ items, renderItem, itemHeight = 24, containerHeight = 400 }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const visibleItemCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleItemCount + 1, items.length);

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      <Box sx={{ height: totalHeight, position: 'relative' }}>
        <Box sx={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <Box key={startIndex + index} sx={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
});

// Lazy loading component for large objects
const LazyObjectRenderer = memo(({ data, path, onToggleExpand, expandedKeys, onCopy, theme, maxItems = 50 }) => {
  const [showAll, setShowAll] = useState(false);
  const keys = Object.keys(data);
  const shouldLazyLoad = keys.length > maxItems;
  const displayKeys = showAll ? keys : keys.slice(0, maxItems);

  if (keys.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          icon={<DataObject />}
          label="Object(0)"
          size="small"
          variant="outlined"
          sx={{ height: 20, fontSize: '0.75rem' }}
        />
        <Tooltip title="Copy Python path">
          <IconButton
            size="small"
            onClick={() => onCopy(path)}
            sx={{ p: 0.25 }}
          >
            <ContentCopy sx={{ fontSize: 12 }} />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          size="small"
          onClick={() => onToggleExpand(path)}
          sx={{ p: 0.5 }}
        >
          {expandedKeys.has(path) ? <ExpandMore /> : <ChevronRight />}
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
            onClick={() => onCopy(path)}
            sx={{ p: 0.25 }}
          >
            <ContentCopy sx={{ fontSize: 12 }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Collapse in={expandedKeys.has(path)}>
        <Box sx={{ ml: 2, mt: 1, borderLeft: '2px solid', borderColor: 'divider', pl: 2 }}>
          {shouldLazyLoad && !showAll ? (
            <>
              {displayKeys.map(key => (
                <ObjectItem
                  key={key}
                  item={data[key]}
                  keyName={key}
                  path={path}
                  onToggleExpand={onToggleExpand}
                  expandedKeys={expandedKeys}
                  onCopy={onCopy}
                  theme={theme}
                />
              ))}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Showing {maxItems} of {keys.length} items
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setShowAll(true)}
                  sx={{ p: 0.5 }}
                >
                  <Typography variant="caption" color="primary">
                    Show All
                  </Typography>
                </IconButton>
              </Box>
            </>
          ) : (
            displayKeys.map(key => (
              <ObjectItem
                key={key}
                item={data[key]}
                keyName={key}
                path={path}
                onToggleExpand={onToggleExpand}
                expandedKeys={expandedKeys}
                onCopy={onCopy}
                theme={theme}
              />
            ))
          )}
        </Box>
      </Collapse>
    </Box>
  );
});

// Memoized value display component
const ValueDisplay = memo(({ value, path, onCopy, theme }) => {
  const getValueColor = useCallback((val) => {
    if (val === null) return theme.palette.error.main;
    if (val === undefined) return theme.palette.text.disabled;
    if (typeof val === 'boolean') return theme.palette.info.main;
    if (typeof val === 'number') return theme.palette.success.main;
    if (typeof val === 'string') return theme.palette.warning.main;
    return theme.palette.text.primary;
  }, [theme]);

  const handleClick = useCallback(() => onCopy(path), [onCopy, path]);

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
});

// Optimized array item component
const ArrayItem = memo(({ item, index, path, onToggleExpand, expandedKeys, onCopy, theme }) => {
  const currentPath = path ? `${path}.${index}` : `${index}`;
  const isExpanded = expandedKeys.has(currentPath);

  if (typeof item === 'object' && item !== null) {
    const isArray = Array.isArray(item);
    const keys = isArray ? item.length : Object.keys(item);
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
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
          {isArray ? (
            <LazyArrayRenderer
              data={item}
              path={currentPath}
              onToggleExpand={onToggleExpand}
              expandedKeys={expandedKeys}
              onCopy={onCopy}
              theme={theme}
            />
          ) : (
            <LazyObjectRenderer
              data={item}
              path={currentPath}
              onToggleExpand={onToggleExpand}
              expandedKeys={expandedKeys}
              onCopy={onCopy}
              theme={theme}
            />
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
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
        <ValueDisplay value={item} path={currentPath} onCopy={onCopy} theme={theme} />
      </Box>
    </Box>
  );
});

// Lazy array renderer for large arrays
const LazyArrayRenderer = memo(({ data, path, onToggleExpand, expandedKeys, onCopy, theme, maxItems = 100 }) => {
  const [showAll, setShowAll] = useState(false);
  const shouldLazyLoad = data.length > maxItems;
  const displayData = showAll ? data : data.slice(0, maxItems);

  if (data.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          icon={<DataArray />}
          label="Array(0)"
          size="small"
          variant="outlined"
          sx={{ height: 20, fontSize: '0.75rem' }}
        />
        <Tooltip title="Copy Python path">
          <IconButton
            size="small"
            onClick={() => onCopy(path)}
            sx={{ p: 0.25 }}
          >
            <ContentCopy sx={{ fontSize: 12 }} />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          size="small"
          onClick={() => onToggleExpand(path)}
          sx={{ p: 0.5 }}
        >
          {expandedKeys.has(path) ? <ExpandMore /> : <ChevronRight />}
        </IconButton>
        <Chip
          icon={<DataArray />}
          label={`Array(${data.length})`}
          size="small"
          variant="outlined"
          sx={{ height: 20, fontSize: '0.75rem' }}
        />
        <Tooltip title="Copy Python path">
          <IconButton
            size="small"
            onClick={() => onCopy(path)}
            sx={{ p: 0.25 }}
          >
            <ContentCopy sx={{ fontSize: 12 }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Collapse in={expandedKeys.has(path)}>
        <Box sx={{ ml: 2, mt: 1, borderLeft: '2px solid', borderColor: 'divider', pl: 2 }}>
          {shouldLazyLoad && !showAll ? (
            <>
              {displayData.map((item, index) => (
                <ArrayItem
                  key={index}
                  item={item}
                  index={index}
                  path={path}
                  onToggleExpand={onToggleExpand}
                  expandedKeys={expandedKeys}
                  onCopy={onCopy}
                  theme={theme}
                />
              ))}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Showing {maxItems} of {data.length} items
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setShowAll(true)}
                  sx={{ p: 0.5 }}
                >
                  <Typography variant="caption" color="primary">
                    Show All
                  </Typography>
                </IconButton>
              </Box>
            </>
          ) : (
            displayData.map((item, index) => (
              <ArrayItem
                key={index}
                item={item}
                index={index}
                path={path}
                onToggleExpand={onToggleExpand}
                expandedKeys={expandedKeys}
                onCopy={onCopy}
                theme={theme}
              />
            ))
          )}
        </Box>
      </Collapse>
    </Box>
  );
});

// Optimized object item component
const ObjectItem = memo(({ item, keyName, path, onToggleExpand, expandedKeys, onCopy, theme }) => {
  const currentPath = path ? `${path}.${keyName}` : keyName;
  const isExpanded = expandedKeys.has(currentPath);

  if (typeof item === 'object' && item !== null) {
    const isArray = Array.isArray(item);
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
        <Typography
          variant="caption"
          sx={{ 
            color: 'primary.main',
            fontFamily: 'monospace',
            fontWeight: 500,
            mt: 0.25
          }}
        >
          "{keyName}":
        </Typography>
        <Box sx={{ flex: 1 }}>
          {isArray ? (
            <LazyArrayRenderer
              data={item}
              path={currentPath}
              onToggleExpand={onToggleExpand}
              expandedKeys={expandedKeys}
              onCopy={onCopy}
              theme={theme}
            />
          ) : (
            <LazyObjectRenderer
              data={item}
              path={currentPath}
              onToggleExpand={onToggleExpand}
              expandedKeys={expandedKeys}
              onCopy={onCopy}
              theme={theme}
            />
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
      <Typography
        variant="caption"
        sx={{ 
          color: 'primary.main',
          fontFamily: 'monospace',
          fontWeight: 500,
          mt: 0.25
        }}
      >
        "{keyName}":
      </Typography>
      <Box sx={{ flex: 1 }}>
        <ValueDisplay value={item} path={currentPath} onCopy={onCopy} theme={theme} />
      </Box>
    </Box>
  );
});

// Main optimized JsonViewer component
const JsonViewerOptimized = ({ data }) => {
  const [expandedKeys, setExpandedKeys] = useState(new Set());
  const [copiedPath, setCopiedPath] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();

  const toggleExpand = useCallback((key) => {
    setExpandedKeys(prev => {
      const newExpandedKeys = new Set(prev);
      if (newExpandedKeys.has(key)) {
        newExpandedKeys.delete(key);
      } else {
        newExpandedKeys.add(key);
      }
      return newExpandedKeys;
    });
  }, []);

  const generatePythonPath = useCallback((path) => {
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
  }, []);

  const copyToClipboard = useCallback(async (path) => {
    const pythonCode = generatePythonPath(path);
    try {
      await navigator.clipboard.writeText(pythonCode);
      setCopiedPath(path);
      setSnackbarOpen(true);
      setTimeout(() => setCopiedPath(''), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, [generatePythonPath]);

  const parseAndFormatJson = useCallback((jsonString) => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      try {
        const fixedJson = jsonString
          .replace(/'/g, '"')
          .replace(/(\w+):/g, '"$1":'); 
        
        return JSON.parse(fixedJson);
      } catch (secondError) {
        return { error: error.message, raw: jsonString };
      }
    }
  }, []);

  const parsedData = useMemo(() => {
    if (typeof data === 'string') {
      return parseAndFormatJson(data);
    }
    return data;
  }, [data, parseAndFormatJson]);

  const renderContent = useMemo(() => {
    if (parsedData.error) {
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
            Invalid JSON: {parsedData.error}
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
            {parsedData.raw}
          </Paper>
        </Paper>
      );
    }

    if (Array.isArray(parsedData)) {
      if (parsedData.length === 0) {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<DataArray />}
              label="Array(0)"
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.75rem' }}
            />
            <Tooltip title="Copy Python path">
              <IconButton
                size="small"
                onClick={() => copyToClipboard('')}
                sx={{ p: 0.25 }}
              >
                <ContentCopy sx={{ fontSize: 12 }} />
              </IconButton>
            </Tooltip>
          </Box>
        );
      }

      return (
        <LazyArrayRenderer
          data={parsedData}
          path=""
          onToggleExpand={toggleExpand}
          expandedKeys={expandedKeys}
          onCopy={copyToClipboard}
          theme={theme}
        />
      );
    }

    if (typeof parsedData === 'object' && parsedData !== null) {
      return (
        <LazyObjectRenderer
          data={parsedData}
          path=""
          onToggleExpand={toggleExpand}
          expandedKeys={expandedKeys}
          onCopy={copyToClipboard}
          theme={theme}
        />
      );
    }

    return <ValueDisplay value={parsedData} path="" onCopy={copyToClipboard} theme={theme} />;
  }, [parsedData, expandedKeys, toggleExpand, copyToClipboard, theme]);

  return (
    <>
      <Paper
        sx={{
          bgcolor: 'transparent',
          overflow: 'auto',
          '& .MuiTypography-root': {
            fontSize: '1rem'
          },
          '& .MuiBox-root': {
            marginBottom: '2px'
          }
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          renderContent
        )}
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

export default JsonViewerOptimized; 