import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  useTheme,
  styled,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Close,
  Api,
  ExpandMore,
  Code,
  Description,
  Settings,
} from '@mui/icons-material';

const PanelContainer = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: 20,
  right: 20,
  bottom: 20,
  width: 400,
  zIndex: 1000,
  backgroundColor: alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}));

const PanelHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
}));

const PanelContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
}));

const EndpointItem = styled(ListItem)(({ theme }) => ({
  padding: 0,
  '& .MuiListItemButton-root': {
    padding: theme.spacing(1, 2),
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(0.5),
    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    },
  },
}));

const MethodChip = styled(Chip)(({ theme }) => ({
  minWidth: 60,
  fontSize: '0.75rem',
  fontWeight: 'bold',
}));

interface EndpointPanelProps {
  nodeData: {
    id: string;
    label: string;
    type?: string;
  } | null;
  onClose: () => void;
}

interface EndpointInfo {
  id: string;
  method: string;
  path: string;
  summary: string;
  category: string;
}

const EndpointPanel: React.FC<EndpointPanelProps> = ({ nodeData, onClose }) => {
  const theme = useTheme();
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointInfo | null>(null);
  
  // Mock data - in the future this will come from the backend
  const mockEndpoints: EndpointInfo[] = [
    {
      id: '1',
      method: 'GET',
      path: '/api/users',
      summary: 'Get all users',
      category: 'users'
    },
    {
      id: '2',
      method: 'POST',
      path: '/api/users',
      summary: 'Create a new user',
      category: 'users'
    },
    {
      id: '3',
      method: 'GET',
      path: '/api/users/{id}',
      summary: 'Get user by ID',
      category: 'users'
    },
    {
      id: '4',
      method: 'PUT',
      path: '/api/users/{id}',
      summary: 'Update user',
      category: 'users'
    },
    {
      id: '5',
      method: 'DELETE',
      path: '/api/users/{id}',
      summary: 'Delete user',
      category: 'users'
    },
  ];

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return theme.palette.success.main;
      case 'POST':
        return theme.palette.primary.main;
      case 'PUT':
        return theme.palette.warning.main;
      case 'DELETE':
        return theme.palette.error.main;
      case 'PATCH':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const handleEndpointSelect = (endpoint: EndpointInfo) => {
    setSelectedEndpoint(endpoint);
    // TODO: Implement endpoint selection logic
  };

  return (
    <PanelContainer elevation={3}>
      <PanelHeader>
        <Box display="flex" alignItems="center" gap={1}>
          <Api color="primary" />
          <Typography variant="h6">
            API Endpoint
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </PanelHeader>

      <PanelContent>
        <Box mb={2}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Node Information
          </Typography>
          <Typography variant="body2">
            <strong>ID:</strong> {nodeData?.id}
          </Typography>
          <Typography variant="body2">
            <strong>Label:</strong> {nodeData?.label}
          </Typography>
          <Typography variant="body2">
            <strong>Type:</strong> {nodeData?.type || 'API Endpoint'}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Available Endpoints</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <List>
              {mockEndpoints.map((endpoint) => (
                <EndpointItem key={endpoint.id}>
                  <ListItemButton
                    onClick={() => handleEndpointSelect(endpoint)}
                    selected={selectedEndpoint?.id === endpoint.id}
                  >
                    <Box display="flex" alignItems="center" gap={1} width="100%">
                      <MethodChip
                        label={endpoint.method}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getMethodColor(endpoint.method), 0.1),
                          color: getMethodColor(endpoint.method),
                          border: `1px solid ${alpha(getMethodColor(endpoint.method), 0.3)}`,
                        }}
                      />
                      <Box flex={1}>
                        <Typography variant="body2" fontWeight="medium">
                          {endpoint.path}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {endpoint.summary}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItemButton>
                </EndpointItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        {selectedEndpoint && (
          <>
            <Divider sx={{ my: 2 }} />
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">Endpoint Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    <strong>Method:</strong> {selectedEndpoint.method}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Path:</strong> {selectedEndpoint.path}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Summary:</strong> {selectedEndpoint.summary}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Category:</strong> {selectedEndpoint.category}
                  </Typography>
                  
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      Documentation will be displayed here in the future
                    </Typography>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Code />
                  <Typography variant="subtitle1">Code Examples</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Code examples will be displayed here in the future
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Description />
                  <Typography variant="subtitle1">Response Schema</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Response schema will be displayed here in the future
                </Typography>
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </PanelContent>
    </PanelContainer>
  );
};

export default EndpointPanel; 