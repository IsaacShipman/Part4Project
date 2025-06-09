import { Box, Typography, Accordion, AccordionSummary, 
         AccordionDetails, IconButton, Tooltip } from '@mui/material';
import { Code as CodeIcon, ExpandMore, ContentCopy } from '@mui/icons-material';
import { glassStyles } from '../../styles/containerStyles';
import { CodeExample } from '../../types/documentation';

interface CodeExamplesProps {
  examples: CodeExample[];
}

const CodeExamples = ({ examples }: { examples: CodeExample[] }) => (
  <Box>
    {examples.map((example, index) => (
      <Accordion 
        key={example.language}
        defaultExpanded={index === 0}
        sx={{ 
          ...glassStyles,
          mb: 1,
          '&:before': { display: 'none' },
          '&.Mui-expanded': { margin: '0 0 8px 0' }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore sx={{ color: '#60a5fa' }} />}
          sx={{ 
            minHeight: '40px',
            background: 'rgba(59, 130, 246, 0.1)',
            '& .MuiAccordionSummary-content': { margin: '8px 0' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CodeIcon fontSize="small" sx={{ color: '#60a5fa' }} />
            <Typography variant="body2" sx={{ color: '#f1f5f9', fontWeight: 600 }}>
              {example.language}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Box sx={{
            backgroundColor: '#0f172a',
            p: 2,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.8rem',
            color: '#e2e8f0',
            position: 'relative',
            maxHeight: '150px',
            overflow: 'auto',
          }}>
            <IconButton
              size="small"
              onClick={() => navigator.clipboard.writeText(example.code)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: '#94a3b8',
                background: 'rgba(30, 41, 59, 0.8)',
                zIndex: 1,
                '&:hover': { color: '#60a5fa' }
              }}
            >
              <ContentCopy fontSize="small" />
            </IconButton>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', paddingRight: '40px' }}>
              {example.code}
            </pre>
          </Box>
        </AccordionDetails>
      </Accordion>
    ))}
  </Box>
);

export default CodeExamples;
