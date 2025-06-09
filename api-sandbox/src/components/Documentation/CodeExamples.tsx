import { Box, Typography, Accordion, AccordionSummary, 
         AccordionDetails, IconButton, Tooltip } from '@mui/material';
import { Code as CodeIcon, ExpandMore, ContentCopy } from '@mui/icons-material';
import { glassCardStyles } from '../../styles/containerStyles';
import { CodeExample } from '../../types/documentation';

interface CodeExamplesProps {
  examples: CodeExample[];
}

const CodeExamples = ({ examples }: CodeExamplesProps) => (
  <Box sx={{ p: 1 }}>
    {examples.map((example, index) => (
      <Accordion 
        key={example.language}
        defaultExpanded={index === 0}
        disableGutters
        elevation={0}
        sx={{ 
          ...glassCardStyles,
          mb: 2,
          overflow: 'hidden',
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: '0 0 16px 0',
          }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore sx={{ color: '#60a5fa' }} />}
          sx={{ 
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
            minHeight: '56px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%)',
            },
            '& .MuiAccordionSummary-content': { 
              margin: '12px 0',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CodeIcon fontSize="medium" sx={{ color: '#60a5fa' }} />
            <Typography 
              variant="h6" 
              fontWeight="600"
              sx={{ 
                color: '#f1f5f9',
                fontSize: '1rem',
              }}
            >
              {example.language}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Box sx={{
            backgroundColor: '#0f172a',
            p: 3,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.875rem',
            lineHeight: 1.6,
            color: '#e2e8f0',
            overflow: 'auto',
            position: 'relative',
          }}>
            <Box sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 1,
            }}>
              <Tooltip title="Copy code">
                <IconButton
                  size="small"
                  onClick={() => navigator.clipboard.writeText(example.code)}
                  sx={{
                    color: '#94a3b8',
                    background: 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(8px)',
                    '&:hover': {
                      color: '#60a5fa',
                      background: 'rgba(30, 41, 59, 0.9)',
                    }
                  }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <pre style={{ 
              margin: 0, 
              whiteSpace: 'pre-wrap',
              paddingRight: '48px',
            }}>
              {example.code}
            </pre>
          </Box>
          <Box sx={{
            p: 2,
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
            borderTop: '1px solid rgba(148, 163, 184, 0.1)',
          }}>
            <Typography 
              variant="body2"
              sx={{ 
                color: '#94a3b8',
                fontStyle: 'italic',
                lineHeight: 1.5,
              }}
            >
              {example.description}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>
    ))}
  </Box>
);

export default CodeExamples;
