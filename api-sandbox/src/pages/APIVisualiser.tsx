import React, { useState, useCallback, useRef, DragEvent, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Button, 
  Typography, 
  useTheme, 
  styled, 
  alpha,
  Fab
} from '@mui/material';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  addEdge, 
  useNodesState, 
  useEdgesState, 
  Connection, 
  Edge, 
  Node,
  ReactFlowProvider,
  BackgroundVariant,
  NodeMouseHandler
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Add, AccountTree, Api, Transform, Clear, Code } from '@mui/icons-material';
import NodeConfigurationPanel from '../components/API-Visualiser/NodeConfigurationPanel';
import DataProcessingConfigPanel from '../components/API-Visualiser/DataProcessingConfigPanel';
import CodeGenerationPanel from '../components/API-Visualiser/CodeGenerationPanel';
import { DraggableFolderStructure } from '../components/API-Visualiser/DraggableFolderStructure';
import { NodeStateProvider, useNodeState } from '../contexts/NodeStateContext';
import { saveFlowState, clearFlowState, clearNodeState, clearAllAPIVisualizerStorage } from '../utils/localStorageUtils';
import { getMethodColor } from '../utils/methodTypes';

// Custom styled components using the app's styling patterns
const FlowContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '95vh',
  marginTop: '65px',
  overflow: 'hidden',
  position: 'relative',
  background: theme.custom.colors.background.gradient,
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: `1px solid ${theme.custom.colors.border.primary}`,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.palette.mode === 'dark'
      ? `
        radial-gradient(circle at 60% 60%, ${theme.custom.colors.accent}05 0%, transparent 40%),
        radial-gradient(circle at 30% 90%, ${theme.custom.colors.accent}08 0%, transparent 30%),
        radial-gradient(circle at 20% 50%, ${theme.custom.colors.primary}10 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${theme.custom.colors.accent}10 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, ${theme.palette.secondary.main}05 0%, transparent 50%)
      `
      : `
        radial-gradient(circle at 60% 60%, ${theme.custom.colors.accent}03 0%, transparent 40%),
        radial-gradient(circle at 30% 90%, ${theme.custom.colors.accent}05 0%, transparent 30%),
        radial-gradient(circle at 20% 50%, ${theme.custom.colors.primary}05 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${theme.custom.colors.accent}05 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, ${theme.palette.secondary.main}03 0%, transparent 50%)
      `,
    borderRadius: '16px',
    pointerEvents: 'none',
    zIndex: 1,
    animation: 'subtleFloat 8s ease-in-out infinite'
  },
  '@keyframes subtleFloat': {
    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
    '50%': { transform: 'translateY(-3px) rotate(0.5deg)' }
  }
}));

const Sidebar = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: 20,
  left: 20,
  bottom: 20,
  width: 370,
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  background: theme.custom.colors.background.gradient,
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: `1px solid ${theme.custom.colors.border.primary}`,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.palette.mode === 'dark'
      ? `
        radial-gradient(circle at 60% 60%, ${theme.custom.colors.accent}05 0%, transparent 40%),
        radial-gradient(circle at 30% 90%, ${theme.custom.colors.accent}08 0%, transparent 30%)
      `
      : `
        radial-gradient(circle at 60% 60%, ${theme.custom.colors.accent}03 0%, transparent 40%),
        radial-gradient(circle at 30% 90%, ${theme.custom.colors.accent}05 0%, transparent 30%)
      `,
    borderRadius: '16px',
    pointerEvents: 'none',
    zIndex: 1,
  }
}));

const SidebarHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.custom.colors.primary}20 0%, ${theme.custom.colors.accent}15 100%)`,
  borderBottom: `1px solid ${theme.custom.colors.primary}30`,
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
    background: `linear-gradient(90deg, transparent 0%, ${theme.custom.colors.primary}50 50%, transparent 100%)`,
  }
}));

const SidebarContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 2,
  position: 'relative',
}));

const NodeButton = styled(Button)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(1.5),
  padding: theme.spacing(1.5, 2),
  background: `
  radial-gradient(circle at 70% 30%, ${theme.custom.colors.accent}03 0%, transparent 60%),
  linear-gradient(45deg, ${theme.custom.colors.accent}05 0%, transparent 50%)
`,
  backdropFilter: 'blur(16px)',
  border: `1px solid ${theme.custom.colors.border.secondary}`,
  borderRadius: '12px',
  color: theme.custom.colors.text.primary,
  fontWeight: 600,
  fontSize: '0.875rem',
  textTransform: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    border: `1px solid ${theme.custom.colors.primary}40`,
    transform: 'translateY(-1px)',
    boxShadow: `0 4px 12px ${theme.custom.colors.primary}20`,
  },
  '& .MuiButton-startIcon': {
    color: theme.custom.colors.primary,
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  background: `${theme.palette.error.main}10`,
  border: `1px solid ${theme.palette.error.main}30`,
  borderRadius: '8px',
  color: theme.palette.error.main,
  fontWeight: 600,
  fontSize: '0.8rem',
  textTransform: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    border: `1px solid ${theme.palette.error.main}50`,
    transform: 'translateY(-1px)',
  },
  '& .MuiButton-startIcon': {
    color: theme.palette.error.main,
  }
}));

const FlowCanvas = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '95vh',
  '& .react-flow__background': {
    backgroundColor: 'transparent',
  },
  '& .react-flow__controls': {
    background: theme.custom.colors.background.tertiary,
    backdropFilter: 'blur(16px)',
    border: `1px solid ${theme.custom.colors.border.secondary}`,
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
  },
  '& .react-flow__controls button': {
    background: 'transparent',
    border: 'none',
    color: theme.custom.colors.text.primary,
    transition: 'all 0.2s ease',
    '&:hover': {
      background: theme.custom.colors.background.secondary,
      transform: 'scale(1.05)',
    },
  },
  '& .react-flow__minimap': {
    background: theme.custom.colors.background.tertiary,
    backdropFilter: 'blur(16px)',
    border: `1px solid ${theme.custom.colors.border.secondary}`,
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
  },
}));



// Generate unique IDs based on timestamp and random number to avoid conflicts
const getId = () => `node_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

const APIVisualiser: React.FC = () => {
  const theme = useTheme();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [panelType, setPanelType] = useState<'endpoint' | 'dataProcessing' | null>(null);
  const [showCodePanel, setShowCodePanel] = useState(false);
  const { dispatch, enablePersistence, disablePersistence } = useNodeState();

  // Clear storage only on first load of the session
  useEffect(() => {
    const hasInitialized = sessionStorage.getItem('api-visualizer-initialized');
    if (!hasInitialized) {
      // Disable persistence during initialization
      disablePersistence();
      // Clear all storage on app startup
      clearAllAPIVisualizerStorage();
      dispatch({ type: 'CLEAR_ALL_NODES' });
      sessionStorage.setItem('api-visualizer-initialized', 'true');
      // Re-enable persistence after initialization
      setTimeout(() => enablePersistence(), 100);
    } else {
      // Enable persistence for subsequent loads
      enablePersistence();
    }
  }, [dispatch, enablePersistence, disablePersistence]);

  // Save flow state whenever nodes or edges change
  useEffect(() => {
    saveFlowState(nodes, edges);
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = addEdge(params, edges);
      setEdges(newEdge);
      
      // Also add connection to NodeStateContext
      if (params.source && params.target) {
        dispatch({
          type: 'ADD_CONNECTION',
          connection: {
            sourceNodeId: params.source,
            targetNodeId: params.target,
            sourceField: params.sourceHandle || 'output',
            targetField: params.targetHandle || 'input'
          }
        });
      }
    },
    [setEdges, edges, dispatch]
  );

  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    // Show panel for API Endpoint nodes (including dragged endpoints)
    if (node.data.label === 'API Endpoint' || 
        node.data.label?.includes('API Endpoint') || 
        node.data.endpoint) {
      
      // Initialize node if not already configured
      dispatch({
        type: 'INITIALIZE_NODE',
        nodeId: node.id,
        endpoint: node.data.endpoint
      });
      
      setSelectedNodeId(node.id);
      setPanelType('endpoint');
      setShowConfigPanel(true);
    }
    // Show panel for Data Processor nodes
    else if (node.data.label === 'Data Processor' || 
             node.data.label?.includes('Data Processor')) {
      
      // Initialize data processing node if not already configured
      dispatch({
        type: 'INITIALIZE_DATA_PROCESSING_NODE',
        nodeId: node.id
      });
      
      setSelectedNodeId(node.id);
      setPanelType('dataProcessing');
      setShowConfigPanel(true);
    }
  }, [dispatch]);

  const { state } = useNodeState();

  // Update node styles based on connection status
  const updateNodeStyles = useCallback(() => {
    setNodes(currentNodes => currentNodes.map(node => {
      const hasData = state.testResults[node.id]?.success;
      
      // Get method from node data for API endpoints
      const method = node.data.method || node.data.endpoint?.method;
      const borderColor = getNodeBorderColor(node.data.label, method);
      const backgroundColor = getNodeColor(node.data.label, method);
      
      return {
        ...node,
        style: {
          ...node.style,
          border: `2px solid ${borderColor}`,
          backgroundColor: backgroundColor,
          boxShadow: hasData 
            ? `0 0 10px ${theme.palette.success.main}40` 
            : `0 4px 12px ${borderColor}30`,
          wordBreak: 'break-word' as const,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }
      };
    }));
  }, [theme, state.testResults]);

  // Clean up orphaned node state when nodes are removed
  useEffect(() => {
    const existingNodeIds = new Set(nodes.map(node => node.id));
    const stateNodeIds = Object.keys(state.configurations);
    
    // Find orphaned node IDs (exist in state but not in nodes)
    const orphanedNodeIds = stateNodeIds.filter(nodeId => !existingNodeIds.has(nodeId));
    
    // Remove orphaned nodes from state
    orphanedNodeIds.forEach(nodeId => {
      dispatch({ type: 'REMOVE_NODE', nodeId });
    });
  }, [nodes, state.configurations, dispatch]);

  // Update node styles when state changes
  useEffect(() => {
    updateNodeStyles();
  }, [updateNodeStyles, state.testResults]);

  const handleClosePanel = useCallback(() => {
    setShowConfigPanel(false);
    setSelectedNodeId(null);
    setPanelType(null);
  }, []);

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const dragData = event.dataTransfer.getData('application/reactflow');

      if (typeof dragData === 'undefined' || !dragData) {
        return;
      }

      const position = reactFlowInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let newNode: Node;

      try {
        // Try to parse as JSON (for dragged endpoints)
        const parsedData = JSON.parse(dragData);
        
        if (parsedData.type === 'apiEndpoint' && parsedData.endpoint) {
          // Create node from endpoint data
          const method = parsedData.endpoint.method;
          const path = parsedData.endpoint.path;
          
          // Truncate path if too long
          const maxPathLength = 40;
          const displayPath = path.length > maxPathLength 
            ? path.substring(0, maxPathLength) + '...' 
            : path;
          
          newNode = {
            id: getId(),
            type: 'default',
            position,
            data: { 
              label: `${method} ${displayPath}`,
              endpoint: parsedData.endpoint,
              method: method,
              fullPath: path
            },
            style: {
              background: getNodeColor('API Endpoint', method),
              color: '#ffffff',
              border: `2px solid ${getNodeBorderColor('API Endpoint', method)}`,
              borderRadius: '12px',
              padding: '12px 16px',
              minWidth: '200px',
              maxWidth: '300px',
              boxShadow: `0 4px 12px ${getNodeBorderColor('API Endpoint', method)}30`,
              backdropFilter: 'blur(8px)',
              fontSize: '0.85rem',
              fontWeight: '600',
              textAlign: 'center',
              wordBreak: 'break-word' as const,
              lineHeight: '1.3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60px',
            },
          };
        } else {
          return;
        }
      } catch (e) {
        // If parsing fails, treat as string (for backward compatibility)
        newNode = {
          id: getId(),
          type: 'default',
          position,
          data: { label: `${dragData}` },
          style: {
            background: getNodeColor(dragData),
            color: '#ffffff',
            border: `2px solid ${getNodeBorderColor(dragData)}`,
            borderRadius: '12px',
            padding: '12px 16px',
            minWidth: '150px',
            maxWidth: '250px',
            boxShadow: `0 4px 12px ${getNodeBorderColor(dragData)}30`,
            backdropFilter: 'blur(8px)',
            fontSize: '0.85rem',
            fontWeight: '600',
            textAlign: 'center',
            wordBreak: 'break-word' as const,
            lineHeight: '1.3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50px',
          },
        };
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const getNodeColor = (type: string, method?: string) => {
    // For API Endpoints, use the method color
    if (type === 'API Endpoint' || type?.includes('API Endpoint')) {
      if (method) {
        const methodStyle = getMethodColor(method);
        // Convert the color to a more opaque background for nodes
        const color = methodStyle.color;
        return `${color}20`; // 20% opacity
      }
      // Fallback for API endpoints without method
      return 'rgba(59, 130, 246, 0.2)'; // Blue fallback
    }
    
    switch (type) {
      case 'Data Processor':
        return 'rgba(62, 31, 62, 0.9)';
      case 'Database':
        return 'rgba(30, 58, 95, 0.9)';
      case 'Service':
        return 'rgba(74, 74, 74, 0.9)';
      default:
        return 'rgba(50, 50, 50, 0.9)';
    }
  };

  const getNodeBorderColor = (type: string, method?: string) => {
    // For API Endpoints, use the method color
    if (type === 'API Endpoint' || type?.includes('API Endpoint')) {
      if (method) {
        const methodStyle = getMethodColor(method);
        return methodStyle.color;
      }
      // Fallback for API endpoints without method
      return '#60a5fa'; // Blue fallback
    }
    
    switch (type) {
      case 'Data Processor':
        return '#f48fb1';
      case 'Database':
        return '#90caf9';
      case 'Service':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  
  const clearAll = () => {
    // Disable persistence during clear
    disablePersistence();
    
    // Clear ReactFlow state
    setNodes([]);
    setEdges([]);
    
    // Clear all storage (localStorage and sessionStorage)
    clearAllAPIVisualizerStorage();
    
    // Clear node state from context
    dispatch({ type: 'CLEAR_ALL_NODES' });
    
    // Re-enable persistence after clear
    setTimeout(() => enablePersistence(), 100);
    
    // Force a re-render by updating the state
    setTimeout(() => {
      setNodes([]);
      setEdges([]);
    }, 0);
  };

  const handleGenerateCode = () => {
    setShowCodePanel(true);
  };

  return (
    <FlowContainer sx={{ width: '100%', height: '95vh', marginTop: '65px' }}>
      <Sidebar elevation={0}>
        <SidebarHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Api sx={{ color: theme.custom.colors.primary, fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ 
              color: theme.custom.colors.text.primary, 
              fontWeight: '600', 
              fontSize: '0.9rem',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
            }}>
              API VISUALISER
            </Typography>
          </Box>
        </SidebarHeader>

        <SidebarContent>
          <Box sx={{ p: 2, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <DraggableFolderStructure />
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ 
                color: theme.custom.colors.text.primary, 
                fontWeight: '600', 
                mb: 2,
                fontSize: '0.85rem'
              }}>
                Node Types
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                <NodeButton
                  onDragStart={(event) => onDragStart(event, 'Data Processor')}
                  draggable
                  variant="outlined"
                  startIcon={<Transform />}
                >
                  Data Processor
                </NodeButton>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <ActionButton 
                  variant="outlined" 
                  size="small" 
                  onClick={clearAll}
                  startIcon={<Clear />}
                >
                  Clear All
                </ActionButton>
                <ActionButton 
                  variant="outlined" 
                  size="small" 
                  onClick={handleGenerateCode}
                  startIcon={<Code />}
                  sx={{
                    background: `${theme.custom.colors.primary}10`,
                    border: `1px solid ${theme.custom.colors.primary}30`,
                    color: theme.custom.colors.primary,
                    '&:hover': {
                      background: `${theme.custom.colors.primary}20`,
                      border: `1px solid ${theme.custom.colors.primary}50`,
                    },
                    '& .MuiButton-startIcon': {
                      color: theme.custom.colors.primary,
                    }
                  }}
                >
                  Generate Code
                </ActionButton>
              </Box>
            </Box>
          </Box>
        </SidebarContent>
      </Sidebar>

      <FlowCanvas ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1} 
            color={alpha(theme.custom.colors.text.muted, 0.3)}
          />
        </ReactFlow>
      </FlowCanvas>

      {showConfigPanel && selectedNodeId && panelType === 'endpoint' && (
        <NodeConfigurationPanel
          nodeId={selectedNodeId}
          onClose={handleClosePanel}
        />
      )}
      
      {showConfigPanel && selectedNodeId && panelType === 'dataProcessing' && (
        <DataProcessingConfigPanel
          nodeId={selectedNodeId}
          onClose={handleClosePanel}
        />
      )}

      {showCodePanel && (
        <CodeGenerationPanel
          onClose={() => setShowCodePanel(false)}
        />
      )}
    </FlowContainer>
  );
};

const APIVisualiserWrapper: React.FC = () => {
  return (
    <ReactFlowProvider>
      <NodeStateProvider>
        <APIVisualiser />
      </NodeStateProvider>
    </ReactFlowProvider>
  );
};

export default APIVisualiserWrapper;
