import { Box, Typography, TableContainer, Table, TableHead, TableRow, 
         TableCell, TableBody, Paper, Chip, useTheme } from '@mui/material';
import { Parameter } from '../../types/documentation';

interface ParametersTableProps {
  params: Parameter[];
}

const ParametersTable = ({ params }: ParametersTableProps) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ p: 1 }}>
      <Typography 
        variant="h6" 
        fontWeight="600" 
        sx={{ 
          mb: 2,
          color: theme.custom.colors.text.primary,
          fontSize: '1rem',
        }}
      >
        Required Parameters
      </Typography>
      {params.length > 0 ? (
        <TableContainer 
          component={Paper} 
          sx={{ 
            ...theme.custom.glassCard,
            overflow: 'hidden',
          }}
        >
          <Table size="medium">
            <TableHead>
              <TableRow sx={{ 
                background: `linear-gradient(135deg, ${theme.custom.colors.primary}10 0%, ${theme.custom.colors.secondary}10 100%)`,
              }}>
                <TableCell sx={{ 
                  fontWeight: '600', 
                  py: 2,
                  color: theme.custom.colors.text.primary,
                  borderBottom: `1px solid ${theme.custom.colors.border.secondary}`,
                  fontSize: '0.875rem',
                }}>
                  Name
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: '600', 
                  py: 2,
                  color: theme.custom.colors.text.primary,
                  borderBottom: `1px solid ${theme.custom.colors.border.secondary}`,
                  fontSize: '0.875rem',
                }}>
                  Type
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: '600', 
                  py: 2,
                  color: theme.custom.colors.text.primary,
                  borderBottom: `1px solid ${theme.custom.colors.border.secondary}`,
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
                      background: `${theme.custom.colors.primary}05`,
                    },
                    '&:last-child td': {
                      borderBottom: 'none',
                    }
                  }}
                >
                  <TableCell sx={{ 
                    py: 2,
                    color: theme.custom.colors.text.primary,
                    borderBottom: `1px solid ${theme.custom.colors.border.secondary}`,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.85rem',
                  }}>
                    {param.name}
                  </TableCell>
                  <TableCell sx={{ 
                    py: 2,
                    borderBottom: `1px solid ${theme.custom.colors.border.secondary}`,
                  }}>
                    <Chip 
                      label={param.type} 
                      size="small" 
                      sx={{ 
                        background: `linear-gradient(45deg, ${theme.custom.colors.success}, ${theme.custom.colors.accent})`,
                        color: 'white',
                        fontWeight: '500',
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ 
                    py: 2,
                    color: theme.custom.colors.text.secondary,
                    borderBottom: `1px solid ${theme.custom.colors.border.secondary}`,
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
          ...theme.custom.glassCard,
          p: 3,
          textAlign: 'center',
        }}>
          <Typography variant="body1" sx={{ color: theme.custom.colors.text.muted }}>
            No required parameters
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ParametersTable;
