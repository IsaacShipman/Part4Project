import { Box, Typography, TableContainer, Table, TableHead, 
         TableRow, TableCell, TableBody, Paper, Chip, useTheme } from '@mui/material';
import { ResponseSchemaType } from '../../types/documentation';

interface ResponseSchemaProps {
  schema: ResponseSchemaType;
}

const ResponseSchema = ({ schema }: { schema: ResponseSchemaType }) => {
  const theme = useTheme();
  
  return (
    <Box>
      <Typography variant="body2" sx={{ 
        color: theme.custom.colors.text.primary, 
        mb: 2, 
        fontSize: '0.875rem' 
      }}>
        {schema.brief}
      </Typography>
      
      <TableContainer sx={{ 
        ...theme.custom.glass,
        maxHeight: '200px',
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-thumb': { 
          background: theme.custom.colors.border.secondary,
          borderRadius: '3px',
        },
      }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: `${theme.custom.colors.primary}10` }}>
              <TableCell sx={{ 
                color: theme.custom.colors.text.primary, 
                fontWeight: 600, 
                fontSize: '0.8rem', 
                py: 1 
              }}>
                Field
              </TableCell>
              <TableCell sx={{ 
                color: theme.custom.colors.text.primary, 
                fontWeight: 600, 
                fontSize: '0.8rem', 
                py: 1 
              }}>
                Type
              </TableCell>
              <TableCell sx={{ 
                color: theme.custom.colors.text.primary, 
                fontWeight: 600, 
                fontSize: '0.8rem', 
                py: 1 
              }}>
                Description
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schema.fields.map((field) => (
              <TableRow key={field.name} sx={{ 
                '&:hover': { background: `${theme.custom.colors.primary}05` },
              }}>
                <TableCell sx={{ 
                  py: 1,
                  color: theme.custom.colors.text.primary,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.8rem',
                  borderColor: theme.custom.colors.border.secondary,
                }}>
                  {field.name}
                </TableCell>
                <TableCell sx={{ py: 1, borderColor: theme.custom.colors.border.secondary }}>
                  <Chip 
                    label={field.type} 
                    size="small" 
                    sx={{ 
                      background: field.type === 'object' 
                        ? `linear-gradient(45deg, ${theme.custom.colors.info}, ${theme.custom.colors.primary})`
                        : `linear-gradient(45deg, ${theme.custom.colors.secondary}, ${theme.custom.colors.accent})`,
                      color: 'white',
                      fontSize: '0.7rem',
                      height: '20px',
                    }}
                  />
                </TableCell>
                <TableCell sx={{ 
                  py: 1,
                  color: theme.custom.colors.text.secondary,
                  fontSize: '0.8rem',
                  borderColor: theme.custom.colors.border.secondary,
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
};

export default ResponseSchema;
