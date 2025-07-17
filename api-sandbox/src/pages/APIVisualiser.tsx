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
import EndpointPanel from '../components/API-Visualiser/EndpointPanel';
import NodeConfigurationPanel from '../components/API-Visualiser/NodeConfigurationPanel';
import DataProcessingConfigPanel from '../components/API-Visualiser/DataProcessingConfigPanel';
import CodeGenerationPanel from '../components/API-Visualiser/CodeGenerationPanel';
import { DraggableFolderStructure } from '../components/API-Visualiser/DraggableFolderStructure';
import { NodeStateProvider, useNodeState } from '../contexts/NodeStateContext';
import { saveFlowState, loadFlowState, clearFlowState, clearNodeState } from '../utils/localStorageUtils';
import { containerStyles, glassCardStyles } from '../styles/containerStyles';

// Custom styled components using the app's styling patterns
const FlowContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '95vh',
  marginTop: '65px',
  overflow: 'hidden',
  position: 'relative',
  background: `
    radial-gradient(circle at 20% 80%, rgba(6, 78, 59, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(5, 46, 22, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(7, 25, 82, 0.9) 100%)
  `,
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: '1px solid rgba(71, 85, 105, 0.3)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 60% 60%, rgba(16, 185, 129, 0.05) 0%, transparent 40%),
      radial-gradient(circle at 30% 90%, rgba(6, 95, 70, 0.08) 0%, transparent 30%),
      radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)
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
  width: 320,
  zIndex: 1000,
  ...glassCardStyles,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 60% 60%, rgba(16, 185, 129, 0.05) 0%, transparent 40%),
      radial-gradient(circle at 30% 90%, rgba(6, 95, 70, 0.08) 0%, transparent 30%)
    `,
    borderRadius: '12px',
    pointerEvents: 'none',
    zIndex: 1,
  }
}));

const SidebarHeader = styled(Box)(({ theme }) => ({
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
  background: 'rgba(30, 41, 59, 0.6)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '12px',
  color: '#e2e8f0',
  fontWeight: 600,
  fontSize: '0.875rem',
  textTransform: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'rgba(59, 130, 246, 0.15)',
    border: '1px solid rgba(59, 130, 246, 0.4)',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
  },
  '& .MuiButton-startIcon': {
    color: 'rgba(59, 130, 246, 0.8)',
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  background: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  borderRadius: '8px',
  color: '#fca5a5',
  fontWeight: 600,
  fontSize: '0.8rem',
  textTransform: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    transform: 'translateY(-1px)',
  },
  '& .MuiButton-startIcon': {
    color: '#fca5a5',
  }
}));

const FlowCanvas = styled(Box)({
  width: '100%',
  height: '95vh',
  '& .react-flow__background': {
    backgroundColor: 'transparent',
  },
  '& .react-flow__controls': {
    background: 'rgba(30, 41, 59, 0.95)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
  },
  '& .react-flow__controls button': {
    background: 'transparent',
    border: 'none',
    color: '#e2e8f0',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(148, 163, 184, 0.1)',
      transform: 'scale(1.05)',
    },
  },
  '& .react-flow__minimap': {
    background: 'rgba(30, 41, 59, 0.95)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
  },
});

// Node types
const nodeTypes = {
  apiEndpoint: 'API Endpoint',
  dataProcessor: 'Data Processor',
  database: 'Database',
  service: 'Service',
};

// Load initial state from localStorage
const { nodes: initialNodes, edges: initialEdges } = loadFlowState();

// Generate unique IDs based on timestamp and random number to avoid conflicts
const getId = () => `node_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

const APIVisualiser: React.FC = () => {
  const theme = useTheme();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [panelType, setPanelType] = useState<'endpoint' | 'dataProcessing' | null>(null);
  const [showCodePanel, setShowCodePanel] = useState(false);
  const { dispatch } = useNodeState();

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

  // Update node styles based on connection status
  const updateNodeStyles = useCallback(() => {
    setNodes(currentNodes => currentNodes.map(node => {
      const hasIncomingConnection = state.connections.some(conn => conn.targetNodeId === node.id);
      const hasOutgoingConnection = state.connections.some(conn => conn.sourceNodeId === node.id);
      const hasData = state.testResults[node.id]?.success;
      
      let borderColor = getNodeBorderColor(node.data.label);
      let backgroundColor = getNodeColor(node.data.label);
      
      // Add visual indicators for connection status
      if (hasIncomingConnection) {
        borderColor = `${borderColor}CC`; // More transparent
      }
      if (hasOutgoingConnection) {
        backgroundColor = `${backgroundColor}EE`; // Slightly lighter
      }
      if (hasData) {
        borderColor = theme.palette.success.main;
      }
      
      return {
        ...node,
        style: {
          ...node.style,
          border: `2px solid ${borderColor}`,
          backgroundColor: backgroundColor,
          boxShadow: hasData ? `0 0 10px ${theme.palette.success.main}40` : 'none'
        }
      };
    }));
  }, [theme, state.connections, state.testResults]);

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
          newNode = {
            id: getId(),
            type: 'default',
            position,
            data: { 
              label: `${parsedData.endpoint.method} ${parsedData.endpoint.path}`,
              endpoint: parsedData.endpoint
            },
            style: {
              background: getNodeColor('API Endpoint'),
              color: '#e0e0e0',
              border: `1px solid ${getNodeBorderColor('API Endpoint')}`,
              borderRadius: '8px',
              padding: '10px',
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
            color: '#e0e0e0',
            border: `1px solid ${getNodeBorderColor(dragData)}`,
            borderRadius: '8px',
            padding: '10px',
          },
        };
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'API Endpoint':
        return 'rgba(27, 77, 62, 0.9)';
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

  const getNodeBorderColor = (type: string) => {
    switch (type) {
      case 'API Endpoint':
        return '#66bb6a';
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

  const addRandomNode = () => {
    const types = Object.values(nodeTypes);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const newNode: Node = {
      id: getId(),
      type: 'default',
      position: { 
        x: Math.random() * 500 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: { label: randomType },
      style: {
        background: getNodeColor(randomType),
        color: '#e0e0e0',
        border: `1px solid ${getNodeBorderColor(randomType)}`,
        borderRadius: '8px',
        padding: '10px',
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const clearAll = () => {
    setNodes([]);
    setEdges([]);
    clearFlowState(); // Also clear from localStorage
    clearNodeState(); // Clear node state from localStorage
    dispatch({ type: 'CLEAR_ALL_NODES' }); // Clear node state from context
  };

  const handleGenerateCode = () => {
    setShowCodePanel(true);
  };

  return (
    <FlowContainer sx={{ width: '100%', height: '95vh', marginTop: '65px' }}>
      <Sidebar elevation={0}>
        <SidebarHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Api sx={{ color: 'rgba(59, 130, 246, 0.8)', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
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
                color: 'rgba(255, 255, 255, 0.8)', 
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
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#93c5fd',
                    '&:hover': {
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.5)',
                    },
                    '& .MuiButton-startIcon': {
                      color: '#93c5fd',
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
            color={alpha(theme.palette.text.secondary, 0.3)}
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
