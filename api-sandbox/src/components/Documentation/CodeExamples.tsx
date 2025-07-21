import { Box, Typography, Accordion, AccordionSummary, 
         AccordionDetails, IconButton, Tooltip, useTheme } from '@mui/material';
import { Code as CodeIcon, ExpandMore, ContentCopy } from '@mui/icons-material';
import { CodeExample } from '../../types/documentation';

interface CodeExamplesProps {
  examples: CodeExample[];
}

const CodeExamples = ({ examples }: { examples: CodeExample[] }) => {
  const theme = useTheme();
  
  return (
    <Box>
      {examples.map((example, index) => (
        <Accordion 
          key={example.language}
          defaultExpanded={index === 0}
          sx={{ 
            ...theme.custom.glass,
            mb: 1,
            '&:before': { display: 'none' },
            '&.Mui-expanded': { margin: '0 0 8px 0' }
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore sx={{ color: theme.custom.colors.primary }} />}
            sx={{ 
              minHeight: '40px',
              background: `${theme.custom.colors.primary}10`,
              '& .MuiAccordionSummary-content': { margin: '8px 0' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CodeIcon fontSize="small" sx={{ color: theme.custom.colors.primary }} />
              <Typography variant="body2" sx={{ 
                color: theme.custom.colors.text.primary, 
                fontWeight: 600 
              }}>
                {example.language}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Box sx={{
              backgroundColor: theme.custom.codeBlock.background,
              p: 2,
              fontFamily: theme.custom.terminal.fontFamily,
              fontSize: '0.8rem',
              color: theme.custom.codeBlock.foreground,
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
                  color: theme.custom.colors.text.muted,
                  background: theme.custom.colors.background.tertiary,
                  zIndex: 1,
                  '&:hover': { color: theme.custom.colors.primary }
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
};

export default CodeExamples;
