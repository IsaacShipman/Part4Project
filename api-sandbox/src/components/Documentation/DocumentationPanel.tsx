import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Tabs, Paper, useTheme
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
import  CustomTab  from './TabView';
import { DocumentationData } from '../../types/documentation';

// API URL base - configure based on your environment
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

interface DocumentationPanelProps {
  endpointId: string;
}

const DocumentationPanel = ({ endpointId }: DocumentationPanelProps) => {
  const theme = useTheme();
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
      'GET': theme.custom.requestPanel.methodColors.get,
      'POST': theme.custom.requestPanel.methodColors.post, 
      'PUT': theme.custom.requestPanel.methodColors.put,
      'DELETE': theme.custom.requestPanel.methodColors.delete,
      'PATCH': theme.custom.requestPanel.methodColors.patch,
    };
    return colors[method?.toUpperCase()] || theme.custom.requestPanel.methodColors.default;
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{
        height: '100%',
        width: '100%',
        background: theme.custom.colors.background.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Paper elevation={0} sx={{ 
          ...theme.custom.glass, 
          p: 4 
        }}>
          <Typography variant="h6" color="primary">
            Loading documentation...
          </Typography>
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
        background: theme.custom.colors.background.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Paper elevation={0} sx={{ 
          ...theme.custom.glass, 
          p: 4 
        }}>
          <Typography variant="h6" color="error">
            {error || "Documentation not found"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please select a valid endpoint or try again later.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Paper 
      elevation={0}
      sx={{ 
        ...theme.custom.glass,
        width: 'calc(100% - 24px)', // Account for left and right margins
        height: 'calc(100% - 24px)', // Account for top and bottom margins
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        margin: '12px', // Add consistent margin on all sides
      }}
    >
      <DocumentationHeader data={data} />

      <Box sx={{ 
        borderBottom: `1px solid ${theme.custom.colors.border.secondary}`,
        background: theme.custom.colors.background.tertiary,
        padding: '0 8px',
      }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            '& .MuiTabs-indicator': {
              background: `linear-gradient(45deg, ${theme.custom.colors.primary}, ${theme.custom.colors.info})`,
              height: '3px',
              borderRadius: '2px',
            },
            '& .MuiTabs-scrollButtons': {
              color: theme.custom.colors.text.muted,
            },
            '& .MuiTabs-flexContainer': {
              gap: '4px',  // Add space between tabs
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
        background: theme.custom.colors.background.secondary,
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: theme.custom.colors.background.tertiary,
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme.custom.colors.border.secondary,
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: theme.custom.colors.border.primary,
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
  );
};

export default DocumentationPanel;