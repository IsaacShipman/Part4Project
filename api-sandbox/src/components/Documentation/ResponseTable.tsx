import { Box, Typography, TableContainer, Table, TableHead, 
         TableRow, TableCell, TableBody, Paper, Chip } from '@mui/material';
import { glassCardStyles } from '../../styles/containerStyles'; 
import { ResponseSchemaType } from '../../types/documentation';

interface ResponseSchemaProps {
  schema: ResponseSchemaType;
}

const ResponseSchema = ({ schema }: ResponseSchemaProps) => (
  <Box sx={{ p: 1 }}>
    <Box sx={{ 
      ...glassCardStyles,
      p: 3,
      mb: 3,
    }}>
      <Typography 
        variant="body1" 
        sx={{ 
          color: '#e2e8f0',
          lineHeight: 1.6,
          fontSize: '0.95rem',
        }}
      >
        {schema.brief}
      </Typography>
    </Box>
    
    <TableContainer 
      component={Paper} 
      sx={{ 
        ...glassCardStyles,
        overflow: 'hidden',
      }}
    >
      <Table size="medium">
        <TableHead>
          <TableRow sx={{ 
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
          }}>
            <TableCell sx={{ 
              fontWeight: '600', 
              py: 2,
              color: '#f1f5f9',
              borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
              fontSize: '0.875rem',
            }}>
              Field
            </TableCell>
            <TableCell sx={{ 
              fontWeight: '600', 
              py: 2,
              color: '#f1f5f9',
              borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
              fontSize: '0.875rem',
            }}>
              Type
            </TableCell>
            <TableCell sx={{ 
              fontWeight: '600', 
              py: 2,
              color: '#f1f5f9',
              borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
              fontSize: '0.875rem',
            }}>
              Description
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schema.fields.map((field) => (
            <TableRow 
              key={field.name}
              sx={{ 
                '&:hover': { 
                  background: 'rgba(96, 165, 250, 0.05)',
                },
                '&:last-child td': {
                  borderBottom: 'none',
                }
              }}
            >
              <TableCell sx={{ 
                py: 2,
                color: '#e2e8f0',
                borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.85rem',
              }}>
                {field.name}
              </TableCell>
              <TableCell sx={{ 
                py: 2,
                borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
              }}>
                <Chip 
                  label={field.type} 
                  size="small" 
                  sx={{ 
                    background: field.type === 'object' 
                      ? 'linear-gradient(45deg, #3b82f6, #1d4ed8)'
                      : 'linear-gradient(45deg, #ec4899, #be185d)',
                    color: 'white',
                    fontWeight: '500',
                    fontSize: '0.75rem',
                  }}
                />
              </TableCell>
              <TableCell sx={{ 
                py: 2,
                color: '#cbd5e1',
                borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                fontSize: '0.875rem',
                lineHeight: 1.5,
              }}>
                {field.description}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

export default ResponseSchema;
