import { Box, Typography, TableContainer, Table, TableHead, 
         TableRow, TableCell, TableBody, Paper, Chip } from '@mui/material';
import { glassStyles } from '../../styles/containerStyles'; 
import { ResponseSchemaType } from '../../types/documentation';

interface ResponseSchemaProps {
  schema: ResponseSchemaType;
}

const ResponseSchema = ({ schema }: { schema: ResponseSchemaType }) => (
  <Box>
    <Typography variant="body2" sx={{ color: '#e2e8f0', mb: 2, fontSize: '0.875rem' }}>
      {schema.brief}
    </Typography>
    
    <TableContainer sx={{ 
      ...glassStyles,
      maxHeight: '200px',
      '&::-webkit-scrollbar': { width: '6px' },
      '&::-webkit-scrollbar-thumb': { 
        background: 'rgba(96, 165, 250, 0.3)',
        borderRadius: '3px',
      },
    }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ background: 'rgba(59, 130, 246, 0.1)' }}>
            <TableCell sx={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.8rem', py: 1 }}>
              Field
            </TableCell>
            <TableCell sx={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.8rem', py: 1 }}>
              Type
            </TableCell>
            <TableCell sx={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.8rem', py: 1 }}>
              Description
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schema.fields.map((field) => (
            <TableRow key={field.name} sx={{ 
              '&:hover': { background: 'rgba(96, 165, 250, 0.05)' },
            }}>
              <TableCell sx={{ 
                py: 1,
                color: '#e2e8f0',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.8rem',
                borderColor: 'rgba(148, 163, 184, 0.1)',
              }}>
                {field.name}
              </TableCell>
              <TableCell sx={{ py: 1, borderColor: 'rgba(148, 163, 184, 0.1)' }}>
                <Chip 
                  label={field.type} 
                  size="small" 
                  sx={{ 
                    background: field.type === 'object' 
                      ? 'linear-gradient(45deg, #3b82f6, #1d4ed8)'
                      : 'linear-gradient(45deg, #ec4899, #be185d)',
                    color: 'white',
                    fontSize: '0.7rem',
                    height: '20px',
                  }}
                />
              </TableCell>
              <TableCell sx={{ 
                py: 1,
                color: '#cbd5e1',
                fontSize: '0.8rem',
                borderColor: 'rgba(148, 163, 184, 0.1)',
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
