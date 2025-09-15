import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Tabs,
  Tab,
  Button,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Code as CodeIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { EndpointStep, Parameter, Header } from './types';

interface EndpointCardsProps {
  steps: EndpointStep[];
  selectedStepId?: string;
  language: string;
  onRunRequest?: (stepId: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

const EndpointCards: React.FC<EndpointCardsProps> = ({
  steps,
  selectedStepId,
  language,
  onRunRequest
}) => {
  const [expandedCard, setExpandedCard] = useState<string | false>(false);
  const [tabValues, setTabValues] = useState<Record<string, number>>({});

  const handleTabChange = (stepId: string, newValue: number) => {
    setTabValues(prev => ({ ...prev, [stepId]: newValue }));
  };

  const handleAccordionToggle = (stepId: string) => {
    setExpandedCard(prev => prev === stepId ? false : stepId);
  };

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const generateCodeExample = (step: EndpointStep, lang: string) => {
    const { endpoint } = step;
    const url = endpoint.url_template.replace(/{(\w+)}/g, '${$1}');
    
    switch (lang) {
      case 'typescript':
        return `// ${step.name}
const response = await fetch('${url}', {
  method: '${endpoint.method}',
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    ${endpoint.headers?.find(h => h.name === 'Authorization') ? "'Authorization': 'token YOUR_TOKEN'," : ''}
  }
});

const data = await response.json();
console.log(data);`;

      case 'python':
        return `# ${step.name}
import requests

response = requests.${endpoint.method.toLowerCase()}(
    '${url}',
    headers={
        'Accept': 'application/vnd.github.v3+json',
        ${endpoint.headers?.find(h => h.name === 'Authorization') ? "'Authorization': 'token YOUR_TOKEN'," : ''}
    }
)

data = response.json()
print(data)`;

      case 'curl':
        return step.example_request?.curl || `curl -X ${endpoint.method} \\
  -H "Accept: application/vnd.github.v3+json" \\
  ${endpoint.headers?.find(h => h.name === 'Authorization') ? '-H "Authorization: token YOUR_TOKEN" \\' : ''}
  "${url}"`;

      default:
        return step.example_request?.curl || `curl -X ${endpoint.method} "${url}"`;
    }
  };

  if (steps.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '16px',
          background: (theme) => `${theme.custom.colors.background.secondary}95`,
          backdropFilter: 'blur(10px)',
          border: (theme) => `1px solid ${theme.custom.colors.border.primary}`,
          textAlign: 'center'
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: (theme) => theme.custom.colors.text.secondary,
            mb: 1
          }}
        >
          No endpoints generated yet
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: (theme) => theme.custom.colors.text.secondary
          }}
        >
          Endpoint details will appear here after generation
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {steps.map((step) => {
        const isExpanded = expandedCard === step.id;
        const isSelected = selectedStepId === step.id;
        const currentTab = tabValues[step.id] || 0;

        return (
          <Accordion
            key={step.id}
            expanded={isExpanded}
            onChange={() => handleAccordionToggle(step.id)}
            sx={{
              borderRadius: '16px !important',
              background: (theme) => `${theme.custom.colors.background.secondary}95`,
              backdropFilter: 'blur(10px)',
              border: (theme) => `1px solid ${
                isSelected ? theme.custom.colors.primary : theme.custom.colors.border.primary
              }`,
              boxShadow: isSelected ? 
                (theme) => `0 0 0 2px ${theme.custom.colors.primary}30` : 'none',
              overflow: 'visible',
              '&:before': { display: 'none' },
              '&.Mui-expanded': {
                margin: 0
              }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                borderRadius: '16px',
                '&.Mui-expanded': {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                  <Chip
                    label={step.endpoint.method}
                    size="small"
                    sx={{
                      backgroundColor: getMethodColor(step.endpoint.method),
                      color: 'white',
                      fontWeight: 600,
                      minWidth: '60px'
                    }}
                  />
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: (theme) => theme.custom.colors.text.primary,
                        fontWeight: 600
                      }}
                    >
                      {step.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: (theme) => theme.custom.colors.text.secondary,
                        fontFamily: 'monospace'
                      }}
                    >
                      {step.endpoint.url_template.replace('https://api.github.com', '')}
                    </Typography>
                  </Box>
                </Box>
                
                <Chip
                  label={`${Math.round(step.confidence * 100)}%`}
                  size="small"
                  variant="outlined"
                  color={step.confidence >= 0.8 ? 'success' : 'warning'}
                />
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 0 }}>
              {/* AI Guidance */}
              {step.ai_guidance && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: (theme) => theme.custom.colors.text.primary,
                      fontWeight: 600,
                      mb: 1
                    }}
                  >
                    What to do at this step:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: (theme) => theme.custom.colors.text.secondary,
                      lineHeight: 1.5,
                      backgroundColor: (theme) => `${theme.custom.colors.background.tertiary}20`,
                      p: 2,
                      borderRadius: '8px',
                      border: (theme) => `1px solid ${theme.custom.colors.border.secondary}`
                    }}
                  >
                    {step.ai_guidance}
                  </Typography>
                </Box>
              )}

              {/* Code Examples */}
              <Box>
                <Tabs
                  value={currentTab}
                  onChange={(_, newValue) => handleTabChange(step.id, newValue)}
                  sx={{
                    minHeight: 'auto',
                    '& .MuiTab-root': {
                      minHeight: 'auto',
                      py: 1,
                      textTransform: 'none',
                      fontSize: '12px'
                    }
                  }}
                >
                  <Tab icon={<CodeIcon sx={{ fontSize: 16 }} />} label="cURL" />
                  <Tab icon={<CodeIcon sx={{ fontSize: 16 }} />} label="Python" />
                  <Tab icon={<CodeIcon sx={{ fontSize: 16 }} />} label="TypeScript" />
                </Tabs>

                <Divider sx={{ my: 2 }} />

                <TabPanel value={currentTab} index={0}>
                  <Box
                    sx={{
                      backgroundColor: (theme) => `${theme.custom.colors.background.tertiary}50`,
                      borderRadius: '8px',
                      p: 2,
                      position: 'relative',
                      overflow: 'auto'
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(generateCodeExample(step, 'curl'))}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1
                      }}
                      title="Copy to clipboard"
                    >
                      <CopyIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    
                    <pre
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        lineHeight: 1.4,
                        fontFamily: 'Monaco, Consolas, monospace',
                        whiteSpace: 'pre-wrap',
                        paddingRight: '48px'
                      }}
                    >
                      {generateCodeExample(step, 'curl')}
                    </pre>
                  </Box>
                </TabPanel>

                <TabPanel value={currentTab} index={1}>
                  <Box
                    sx={{
                      backgroundColor: (theme) => `${theme.custom.colors.background.tertiary}50`,
                      borderRadius: '8px',
                      p: 2,
                      position: 'relative',
                      overflow: 'auto'
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(generateCodeExample(step, 'python'))}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1
                      }}
                      title="Copy to clipboard"
                    >
                      <CopyIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    
                    <pre
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        lineHeight: 1.4,
                        fontFamily: 'Monaco, Consolas, monospace',
                        whiteSpace: 'pre-wrap',
                        paddingRight: '48px'
                      }}
                    >
                      {generateCodeExample(step, 'python')}
                    </pre>
                  </Box>
                </TabPanel>

                <TabPanel value={currentTab} index={2}>
                  <Box
                    sx={{
                      backgroundColor: (theme) => `${theme.custom.colors.background.tertiary}50`,
                      borderRadius: '8px',
                      p: 2,
                      position: 'relative',
                      overflow: 'auto'
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(generateCodeExample(step, 'typescript'))}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1
                      }}
                      title="Copy to clipboard"
                    >
                      <CopyIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    
                    <pre
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        lineHeight: 1.4,
                        fontFamily: 'Monaco, Consolas, monospace',
                        whiteSpace: 'pre-wrap',
                        paddingRight: '48px'
                      }}
                    >
                      {generateCodeExample(step, 'typescript')}
                    </pre>
                  </Box>
                </TabPanel>
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default EndpointCards;
