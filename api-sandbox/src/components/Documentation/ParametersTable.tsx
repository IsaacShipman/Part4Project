import { Box, Typography, TableContainer, Table, TableHead, TableRow, 
         TableCell, TableBody, Paper, Chip } from '@mui/material';
import { glassCardStyles } from '../../styles/containerStyles'; 
import { Parameter } from '../../types/documentation';

interface ParametersTableProps {
  params: Parameter[];
}

const ParametersTable = ({ params }: ParametersTableProps) => (
  <Box sx={{ p: 1 }}>
    <Typography 
      variant="h6" 
      fontWeight="600" 
      sx={{ 
        mb: 2,
        color: '#f1f5f9',
        fontSize: '1rem',
      }}
    >
      Required Parameters
    </Typography>
    {params.length > 0 ? (
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
                Name
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
            {params.map((param) => (
              <TableRow 
                key={param.name}
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
                  {param.name}
                </TableCell>
                <TableCell sx={{ 
                  py: 2,
                  borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                }}>
                  <Chip 
                    label={param.type} 
                    size="small" 
                    sx={{ 
                      background: 'linear-gradient(45deg, #10b981, #059669)',
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
                  {param.description}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ) : (
      <Box sx={{ 
        ...glassCardStyles,
        p: 3,
        textAlign: 'center',
      }}>
        <Typography variant="body1" sx={{ color: '#94a3b8' }}>
          No required parameters
        </Typography>
      </Box>
    )}
  </Box>
);

export default ParametersTable;
