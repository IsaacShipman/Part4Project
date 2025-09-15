import React, { useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
} from '@mui/material';
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface FlowStep {
  id: string;
  name: string;
  description: string;
  endpoint: {
    method: string;
    url_template: string;
  };
  confidence: number;
}

interface FlowCanvasProps {
  title?: string;
  description?: string;
  steps: FlowStep[];
  dataFlow?: {
    edges: Array<{
      from: string;
      to: string;
      map: string;
    }>;
  };
  metadata?: {
    estimated_calls_per_execution: number;
    auth?: {
      type: string;
      scopes?: string[];
    };
  };
  onNodeClick?: (stepId: string) => void;
}

// Custom Node Component
const StepNode: React.FC<{ data: FlowStep & { onClick?: () => void } }> = ({ data }) => {
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return '#10B981';
      case 'POST': return '#3B82F6';
      case 'PUT': return '#F59E0B';
      case 'DELETE': return '#EF4444';
      case 'PATCH': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  return (
    <Paper
      elevation={2}
      onClick={data.onClick}
      sx={{
        p: 2,
        minWidth: 200,
        maxWidth: 250,
        borderRadius: '12px',
        cursor: 'pointer',
        background: (theme) => `${theme.custom?.colors?.background?.secondary || '#fff'}95`,
        border: (theme) => `1px solid ${theme.custom?.colors?.border?.primary || '#ccc'}`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => `0 8px 25px ${theme.custom?.colors?.primary || '#000'}20`,
        },
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Chip
          label={data.endpoint.method}
          size="small"
          sx={{
            backgroundColor: getMethodColor(data.endpoint.method),
            color: 'white',
            fontWeight: 600,
            mr: 1
          }}
        />
        <Chip
          label={`${Math.round(data.confidence * 100)}%`}
          size="small"
          variant="outlined"
          color={data.confidence >= 0.8 ? 'success' : 'warning'}
        />
      </Box>
      
      <Typography
        variant="subtitle2"
        sx={{
          color: (theme) => theme.custom?.colors?.text?.primary || '#000',
          fontWeight: 600,
          mb: 0.5
        }}
      >
        {data.name}
      </Typography>
      
      <Typography
        variant="caption"
        sx={{
          color: (theme) => theme.custom?.colors?.text?.secondary || '#666',
          display: 'block',
          lineHeight: 1.3
        }}
      >
        {data.description}
      </Typography>
      
      <Typography
        variant="caption"
        sx={{
          color: (theme) => theme.custom?.colors?.text?.secondary || '#666',
          fontFamily: 'monospace',
          mt: 1,
          display: 'block',
          fontSize: '10px',
          backgroundColor: (theme) => `${theme.custom?.colors?.background?.tertiary || '#f5f5f5'}30`,
          p: 0.5,
          borderRadius: '4px'
        }}
      >
        {data.endpoint.url_template.replace('https://api.github.com', '')}
      </Typography>
    </Paper>
  );
};

const nodeTypes: NodeTypes = {
  step: StepNode,
};

const FlowCanvas: React.FC<FlowCanvasProps> = ({
  title,
  description,
  steps,
  dataFlow,
  metadata,
  onNodeClick
}) => {
  // Enhanced node positioning for DAG layout
  const getNodePosition = (index: number, totalSteps: number) => {
    if (totalSteps === 1) {
      return { x: 150, y: 100 };
    }
    
    // Calculate positions to create a more natural flow
    const stepWidth = 280;
    const stepHeight = 150;
    
    if (totalSteps <= 3) {
      // Linear horizontal layout for small workflows
      return { x: index * stepWidth, y: 100 };
    } else {
      // For larger workflows, create a more compact layout
      const nodesPerRow = Math.ceil(Math.sqrt(totalSteps));
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;
      
      return {
        x: col * stepWidth,
        y: row * stepHeight + 100
      };
    }
  };

  // Convert steps to React Flow nodes with better positioning
  const initialNodes: Node[] = steps.map((step, index) => ({
    id: step.id,
    type: 'step',
    position: getNodePosition(index, steps.length),
    data: {
      ...step,
      onClick: () => onNodeClick?.(step.id)
    }
  }));

  // Enhanced edge creation with proper styling for DAG
  const createEdges = (): Edge[] => {
    const edges: Edge[] = [];
    
if (steps.length > 0) {
      // If no dataFlow provided, create sequential connections
      for (let i = 0; i < steps.length - 1; i++) {
        const currentStep = steps[i];
        const nextStep = steps[i + 1];
        
        // Add null checks for safety
        if (currentStep && nextStep) {
          edges.push({
            id: `edge-${i}`,
            source: currentStep.id,
            target: nextStep.id,
            type: 'smoothstep',
            animated: true,
            style: { 
              stroke: '#10B981', 
              strokeWidth: 3,
              strokeDasharray: '0', // Solid line for sequential flow
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#10B981',
              width: 25,
              height: 25
            }
          });
        }
      }
    }
    
    return edges;
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(createEdges());

  // Update nodes when steps change
  useEffect(() => {
    const newNodes: Node[] = steps.map((step, index) => ({
      id: step.id,
      type: 'step',
      position: getNodePosition(index, steps.length),
      data: {
        ...step,
        onClick: () => onNodeClick?.(step.id)
      }
    }));
    setNodes(newNodes);
  }, [steps, onNodeClick, setNodes]);

  // Update edges when dataFlow or steps change
  useEffect(() => {
    setEdges(createEdges());
  }, [dataFlow, steps, setEdges]);

  const onConnect = useCallback(() => {
    // Prevent manual connections in this view
  }, []);

  if (steps.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '16px',
          background: (theme) => `${theme.custom.colors.background.secondary}95`,
          backdropFilter: 'blur(10px)',
          border: (theme) => `1px solid ${theme.custom.colors.border.primary}`,
          textAlign: 'center',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: (theme) => theme.custom.colors.text.secondary
          }}
        >
          Enter a prompt to generate your API workflow
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '16px',
        background: (theme) => `${theme.custom.colors.background.secondary}95`,
        backdropFilter: 'blur(10px)',
        border: (theme) => `1px solid ${theme.custom.colors.border.primary}`,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header with title and description */}
      {(title || description) && (
        <Box sx={{ p: 3, pb: 0 }}>
          {title && (
            <Typography
              variant="h6"
              sx={{
                color: (theme) => theme.custom.colors.text.primary,
                fontWeight: 600,
                mb: 1
              }}
            >
              {title}
            </Typography>
          )}
          {description && (
            <Typography
              variant="body2"
              sx={{
                color: (theme) => theme.custom.colors.text.secondary,
                mb: 2
              }}
            >
              {description}
            </Typography>
          )}
        </Box>
      )}

      {/* Flow diagram */}
      <Box sx={{ flex: 1, minHeight: '300px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{
            padding: 0.1,
            minZoom: 0.5,
            maxZoom: 1.5
          }}
          attributionPosition="bottom-left"
        >
          <Background />
        
        </ReactFlow>
      </Box>
    </Paper>
  );
};

export default FlowCanvas;
