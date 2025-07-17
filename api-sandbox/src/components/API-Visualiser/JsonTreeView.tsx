import React, { useState, useEffect } from 'react';
import {
  Box,
  Checkbox,
  IconButton,
  Typography,
  Chip,
  useTheme,
  styled,
  alpha,
} from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  DataObject,
  DataArray,
  TextFields,
  Numbers,
  CheckBox,
  IndeterminateCheckBox,
} from '@mui/icons-material';

const TreeContainer = styled(Box)(({ theme }) => ({
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  lineHeight: 1.5,
}));

const TreeItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  minHeight: 32,
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: alpha(theme.palette.action.hover, 0.04),
  },
}));

const IndentContainer = styled(Box)<{ depth: number }>(({ depth }) => ({
  marginLeft: depth * 20,
}));

const TypeChip = styled(Chip)(({ theme }) => ({
  height: 16,
  fontSize: '0.65rem',
  marginLeft: theme.spacing(1),
  '& .MuiChip-label': {
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
  },
}));

interface JsonTreeViewProps {
  data: any;
  selectedFields: Set<string>;
  onFieldToggle: (fieldPath: string, selected: boolean) => void;
  path?: string;
  depth?: number;
}

interface TreeNodeProps {
  nodeKey: string;
  value: any;
  selectedFields: Set<string>;
  onFieldToggle: (fieldPath: string, selected: boolean) => void;
  path: string;
  depth: number;
  autoExpand?: boolean;
}

const getValueType = (value: any): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return 'unknown';
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'object':
      return 'primary';
    case 'array':
      return 'secondary';
    case 'string':
      return 'success';
    case 'number':
      return 'warning';
    case 'boolean':
      return 'info';
    case 'null':
      return 'default';
    default:
      return 'default';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'object':
      return <DataObject fontSize="small" />;
    case 'array':
      return <DataArray fontSize="small" />;
    case 'string':
      return <TextFields fontSize="small" />;
    case 'number':
      return <Numbers fontSize="small" />;
    case 'boolean':
      return <CheckBox fontSize="small" />;
    default:
      return <DataObject fontSize="small" />;
  }
};

const TreeNode: React.FC<TreeNodeProps> = ({
  nodeKey,
  value,
  selectedFields,
  onFieldToggle,
  path,
  depth,
  autoExpand = false,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const type = getValueType(value);
  const currentPath = path ? `${path}.${nodeKey}` : nodeKey;
  const isSelected = selectedFields.has(currentPath);
  
  // Check if this node or any of its children are selected (for indeterminate state)
  const hasSelectedChildren = () => {
    if (type === 'object' && value) {
      return Object.keys(value).some(key => {
        const childPath = `${currentPath}.${key}`;
        return selectedFields.has(childPath) || hasSelectedChildrenRecursive(value[key], childPath);
      });
    }
    if (type === 'array' && Array.isArray(value)) {
      return value.some((item, index) => {
        const childPath = `${currentPath}[${index}]`;
        return selectedFields.has(childPath) || hasSelectedChildrenRecursive(item, childPath);
      });
    }
    return false;
  };
  
  const hasSelectedChildrenRecursive = (obj: any, basePath: string): boolean => {
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        return obj.some((item, index) => {
          const childPath = `${basePath}[${index}]`;
          return selectedFields.has(childPath) || hasSelectedChildrenRecursive(item, childPath);
        });
      } else {
        return Object.keys(obj).some(key => {
          const childPath = `${basePath}.${key}`;
          return selectedFields.has(childPath) || hasSelectedChildrenRecursive(obj[key], childPath);
        });
      }
    }
    return false;
  };

  // Auto-expand nodes that have selected children
  useEffect(() => {
    if (autoExpand && hasSelectedChildren()) {
      setExpanded(true);
    }
  }, [selectedFields, autoExpand, currentPath]);

  const isIndeterminate = !isSelected && hasSelectedChildren();
  const isExpandable = type === 'object' || type === 'array';
  const hasChildren = isExpandable && 
    ((type === 'object' && value && Object.keys(value).length > 0) ||
     (type === 'array' && Array.isArray(value) && value.length > 0));

  const handleToggle = () => {
    onFieldToggle(currentPath, !isSelected);
  };

  const formatValue = (val: any): string => {
    if (val === null) return 'null';
    if (typeof val === 'string') return `"${val}"`;
    if (typeof val === 'boolean') return val.toString();
    if (typeof val === 'number') return val.toString();
    if (Array.isArray(val)) return `Array(${val.length})`;
    if (typeof val === 'object') return `Object(${Object.keys(val).length})`;
    return String(val);
  };

  return (
    <Box>
      <IndentContainer depth={depth}>
        <TreeItem>
          <Box display="flex" alignItems="center" flex={1}>
            {/* Expand/Collapse Button */}
            {hasChildren ? (
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{ p: 0.5, mr: 0.5 }}
              >
                {expanded ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
              </IconButton>
            ) : (
              <Box sx={{ width: 24, height: 24 }} />
            )}

            {/* Checkbox */}
            <Checkbox
              size="small"
              checked={isSelected}
              indeterminate={isIndeterminate}
              onChange={handleToggle}
              sx={{ p: 0.5, mr: 1 }}
            />

            {/* Type Icon */}
            <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
              {getTypeIcon(type)}
            </Box>

            {/* Field Name */}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'medium',
                color: theme.palette.text.primary,
                mr: 1,
              }}
            >
              {nodeKey}
            </Typography>

            {/* Type Chip */}
            <TypeChip
              label={type}
              size="small"
              color={getTypeColor(type)}
              variant="outlined"
            />

            {/* Value Preview */}
            {!hasChildren && (
              <Typography
                variant="body2"
                sx={{
                  ml: 1,
                  color: theme.palette.text.secondary,
                  fontStyle: 'italic',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 200,
                }}
              >
                {formatValue(value)}
              </Typography>
            )}
          </Box>
        </TreeItem>
      </IndentContainer>

      {/* Children */}
      {expanded && hasChildren && (
        <Box>
          {type === 'object' && value && Object.entries(value).map(([key, val]) => (
            <TreeNode
              key={key}
              nodeKey={key}
              value={val}
              selectedFields={selectedFields}
              onFieldToggle={onFieldToggle}
              path={currentPath}
              depth={depth + 1}
              autoExpand={autoExpand}
            />
          ))}
          {type === 'array' && Array.isArray(value) && value.map((item, index) => (
            <TreeNode
              key={index.toString()}
              nodeKey={`[${index}]`}
              value={item}
              selectedFields={selectedFields}
              onFieldToggle={onFieldToggle}
              path={currentPath}
              depth={depth + 1}
              autoExpand={autoExpand}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

const JsonTreeView: React.FC<JsonTreeViewProps> = ({
  data,
  selectedFields,
  onFieldToggle,
  path = '',
  depth = 0,
}) => {
  const theme = useTheme();

  if (!data || (typeof data !== 'object' && !Array.isArray(data))) {
    return (
      <Box p={2} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          No data to display
        </Typography>
      </Box>
    );
  }

  return (
    <TreeContainer>
      <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1, p: 1 }}>
                  {Array.isArray(data) ? (
            data.map((item, index) => (
              <TreeNode
                key={index.toString()}
                nodeKey={`[${index}]`}
                value={item}
                selectedFields={selectedFields}
                onFieldToggle={onFieldToggle}
                path={path}
                depth={depth}
                autoExpand={true}
              />
            ))
          ) : (
          Object.entries(data).map(([key, value]) => (
            <TreeNode
              key={key}
              nodeKey={key}
              value={value}
              selectedFields={selectedFields}
              onFieldToggle={onFieldToggle}
              path={path}
              depth={depth}
              autoExpand={true}
            />
          ))
        )}
      </Box>
    </TreeContainer>
  );
};

export default JsonTreeView; 