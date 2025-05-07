import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Code as CodeIcon,
  ExpandMore,
  Description,
  Info,
  Code,
  AccountTree,
  ContentCopy
} from '@mui/icons-material';
import { EndpointData } from '../types'
import { defaultEndpointData } from '../types'
import { DocumentationPanelProps } from '../types'
import CodeBlock from './CodeBlock';





// Main component
const DocumentationPanel: React.FC<DocumentationPanelProps> = ({ endpointId }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<EndpointData>(defaultEndpointData);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    const fetchEndpointDocumentation = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:8000/api-docs/${endpointId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const fetchedDocumentation = await response.json();
        setData(fetchedDocumentation);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchEndpointDocumentation();
  }, [endpointId]);

  // Format method for method badge styling
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return '#2e7d32'; // Darker green for dark theme
      case 'POST': return '#1565c0'; // Darker blue
      case 'PUT': return '#e65100'; // Darker orange
      case 'DELETE': return '#c62828'; // Darker red
      case 'PATCH': return '#6a1b9a'; // Darker purple
      default: return '#424242'; // Darker grey
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        height: '100%', 
        width: '100%', 
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #333333',
      }}
    >
      {/* Header section */}
      <Box sx={{ p: 1.5, backgroundColor: '#252525', borderBottom: '1px solid #333333' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={data.method}
              size="small"
              sx={{ 
                fontWeight: 'bold',
                backgroundColor: getMethodColor(data.method),
                color: 'white'
              }}
            />
            <Typography variant="subtitle1" fontFamily="monospace" fontWeight="medium">
              {data.path}
            </Typography>
          </Box>
          <Box>
            <Chip 
              size="small"
              label={data.category}
              sx={{ backgroundColor: '#1e3a5f', color: '#90caf9' }}
            />
          </Box>
        </Box>
        <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
          {data.summary}
        </Typography>
      </Box>

      {/* Tabs navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="api documentation tabs"
          sx={{ 
            minHeight: '36px',
            '& .MuiTabs-indicator': {
              backgroundColor: '#90caf9',
            }
          }}
          TabIndicatorProps={{
            style: {
              backgroundColor: '#90caf9',
            }
          }}
        >
          <Tab 
            icon={<Description fontSize="small" />} 
            iconPosition="start" 
            label="Description" 
            sx={{ 
              minHeight: '36px', 
              py: 0,
              color: activeTab === 0 ? '#90caf9' : 'text.secondary',
              '&.Mui-selected': {
                color: '#90caf9'
              }
            }} 
          />
          <Tab 
            icon={<Info fontSize="small" />} 
            iconPosition="start" 
            label="Parameters" 
            sx={{ 
              minHeight: '36px', 
              py: 0,
              color: activeTab === 1 ? '#90caf9' : 'text.secondary',
              '&.Mui-selected': {
                color: '#90caf9'
              }
            }} 
          />
          <Tab 
            icon={<AccountTree fontSize="small" />} 
            iconPosition="start" 
            label="Response" 
            sx={{ 
              minHeight: '36px', 
              py: 0,
              color: activeTab === 2 ? '#90caf9' : 'text.secondary',
              '&.Mui-selected': {
                color: '#90caf9'
              }
            }} 
          />
          <Tab 
            icon={<Code fontSize="small" />} 
            iconPosition="start" 
            label="Examples" 
            sx={{ 
              minHeight: '36px', 
              py: 0,
              color: activeTab === 3 ? '#90caf9' : 'text.secondary',
              '&.Mui-selected': {
                color: '#90caf9'
              }
            }} 
          />
        </Tabs>
      </Box>

      {/* Content area with scroll */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
        {/* Description Tab */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="body2">{data.documentation.description}</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight="medium">Resources:</Typography>
              <Link href={data.doc_url} target="_blank" rel="noopener" underline="hover" color="primary" sx={{ color: '#90caf9' }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  Official Documentation
                </Typography>
              </Link>
            </Box>
          </Box>
        )}

        {/* Parameters Tab */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>Required Parameters:</Typography>
            {data.documentation.required_params.length > 0 ? (
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: '100%', border: '1px solid #333333' }}>
                <Table size="small" aria-label="parameters table">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#252525' }}>
                      <TableCell sx={{ fontWeight: 'bold', py: 1, borderBottom: '1px solid #333333' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 1, borderBottom: '1px solid #333333' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 1, borderBottom: '1px solid #333333' }}>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.documentation.required_params.map((param) => (
                      <TableRow key={param.name} sx={{ '&:hover': { backgroundColor: '#252525' } }}>
                        <TableCell sx={{ py: 1, borderBottom: '1px solid #333333' }}>{param.name}</TableCell>
                        <TableCell sx={{ py: 1, borderBottom: '1px solid #333333' }}>
                          <Chip 
                            label={param.type} 
                            size="small" 
                            sx={{ backgroundColor: '#1b4d3e', color: '#66bb6a', height: '20px' }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1, borderBottom: '1px solid #333333' }}>{param.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2">No required parameters</Typography>
            )}
          </Box>
        )}

        {/* Response Tab */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>{data.documentation.response_schema.brief}</Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: '100%', border: '1px solid #333333' }}>
              <Table size="small" aria-label="response fields table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#252525' }}>
                    <TableCell sx={{ fontWeight: 'bold', py: 1, borderBottom: '1px solid #333333' }}>Field</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 1, borderBottom: '1px solid #333333' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 1, borderBottom: '1px solid #333333' }}>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.documentation.response_schema.fields.map((field) => (
                    <TableRow key={field.name} sx={{ '&:hover': { backgroundColor: '#252525' } }}>
                      <TableCell sx={{ py: 1, borderBottom: '1px solid #333333' }}>{field.name}</TableCell>
                      <TableCell sx={{ py: 1, borderBottom: '1px solid #333333' }}>
                        <Chip 
                          label={field.type} 
                          size="small" 
                          sx={{ 
                            backgroundColor: field.type === 'object' ? '#1e3a5f' : '#3e1f3e',
                            color: field.type === 'object' ? '#90caf9' : '#f48fb1',
                            height: '20px'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1, borderBottom: '1px solid #333333' }}>{field.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Code Examples Tab */}
        {activeTab === 3 && (
          <Box>
            {data.code_examples.map((example, index) => (
              <Accordion 
                key={example.language}
                defaultExpanded={index === 0}
                disableGutters
                elevation={0}
                sx={{ 
                  border: '1px solid #333333', 
                  mb: 1,
                  backgroundColor: '#1e1e1e',
                  '&:before': {
                    display: 'none',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: '#90caf9' }} />}
                  sx={{ 
                    backgroundColor: '#252525',
                    minHeight: '36px', 
                    '& .MuiAccordionSummary-content': { 
                      margin: '6px 0',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CodeIcon fontSize="small" sx={{ color: '#90caf9' }} />
                    <Typography variant="body2">{example.language}</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <CodeBlock code={example.code} language={example.language} />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      p: 1, 
                      backgroundColor: '#252525', 
                      borderTop: '1px solid #333333',
                      color: 'text.secondary'
                    }}
                  >
                    {example.description}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
}

export default DocumentationPanel;