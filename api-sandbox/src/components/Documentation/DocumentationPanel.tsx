import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Tabs, Paper
} from '@mui/material';
import {
  Description, Info, AccountTree, Code,
} from '@mui/icons-material';

// Import all required components
import DescriptionTab from './DescriptionTab';
import ParametersTable from './ParametersTable';
import ResponseSchema from './ResponseTable';
import CodeExamples from './CodeExamples';
import DocumentationHeader from './Header';
import { CustomTab } from './TabView';
import { DocumentationData } from '../../types/documentation';

const glassStyles = {
  background: 'rgba(15, 23, 42, 0.7)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(148, 163, 184, 0.1)',
  borderRadius: '8px',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
};

// API URL base - configure based on your environment
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

interface DocumentationPanelProps {
  endpointId: string;
}

const DocumentationPanel = ({ endpointId }: DocumentationPanelProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DocumentationData | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    const fetchEndpointDocumentation = async () => {
      if (!endpointId) {
        setLoading(false);
        setError("No endpoint selected");
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching documentation for endpoint: ${endpointId}`);
        const response = await fetch(`${API_BASE_URL}/api-docs/${endpointId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch documentation: ${response.status} ${response.statusText}`);
        }
        
        const documentationData = await response.json();
        console.log('Documentation data received:', documentationData);
        setData(documentationData);
      } catch (err) {
        console.error('Error fetching documentation:', err);
        setError(
          err && typeof err === 'object' && 'message' in err
            ? (err as { message: string }).message
            : 'Failed to load documentation'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEndpointDocumentation();
  }, [endpointId]);

  type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string;

  const getMethodColor = (method: HttpMethod): string => {
    const colors: Record<string, string> = {
      'GET': '#3b82f6',
      'POST': '#10b981', 
      'PUT': '#f59e0b',
      'DELETE': '#ef4444',
      'PATCH': '#8b5cf6',
    };
    return colors[method?.toUpperCase()] || '#6b7280';
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{
        height: '100%',
        width: '100%',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Paper elevation={0} sx={{ ...glassStyles, p: 4 }}>
          <Typography variant="h6" color="white">Loading documentation...</Typography>
        </Paper>
      </Box>
    );
  }

  // Show error state
  if (error || !data) {
    return (
      <Box sx={{
        height: '100%',
        width: '100%',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Paper elevation={0} sx={{ ...glassStyles, p: 4 }}>
          <Typography variant="h6" color="error">
            {error || "Documentation not found"}
          </Typography>
          <Typography variant="body2" color="white" sx={{ mt: 1 }}>
            Please select a valid endpoint or try again later.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{
      height: '100%',
      width: '100%',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <Paper 
        elevation={0}
        sx={{ 
          ...glassStyles,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <DocumentationHeader data={data} getMethodColor={getMethodColor} />

        <Box sx={{ 
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          background: 'rgba(15, 23, 42, 0.3)',
        }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(45deg, #60a5fa, #3b82f6)',
                height: '3px',
                borderRadius: '2px',
              },
              '& .MuiTabs-scrollButtons': {
                color: '#94a3b8',
              }
            }}
          >
            <CustomTab 
              icon={<Description fontSize="small" />} 
              label="Description" 
              isActive={activeTab === 0}
            />
            <CustomTab 
              icon={<Info fontSize="small" />} 
              label="Parameters" 
              isActive={activeTab === 1}
            />
            <CustomTab 
              icon={<AccountTree fontSize="small" />} 
              label="Response" 
              isActive={activeTab === 2}
            />
            <CustomTab 
              icon={<Code fontSize="small" />} 
              label="Examples" 
              isActive={activeTab === 3}
            />
          </Tabs>
        </Box>

        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          background: 'rgba(15, 23, 42, 0.2)',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(15, 23, 42, 0.3)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(96, 165, 250, 0.3)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(96, 165, 250, 0.5)',
          },
        }}>
          <Box sx={{ p: 2 }}>
            {activeTab === 0 && <DescriptionTab data={data} />}
            {activeTab === 1 && <ParametersTable params={data.documentation.required_params} />}
            {activeTab === 2 && <ResponseSchema schema={data.documentation.response_schema} />}
            {activeTab === 3 && <CodeExamples examples={data.code_examples} />}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default DocumentationPanel;