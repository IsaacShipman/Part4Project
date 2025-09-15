import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  IconButton,
  Collapse,
  TablePagination,
  useTheme
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info' | 'success';
  message: string;
  endpoint?: string;
  statusCode?: number;
  details?: string;
  stack?: string;
}

interface ErrorLogsTableProps {
  logs: ErrorLog[];
}

const ErrorLogsTable: React.FC<ErrorLogsTableProps> = ({ logs }) => {
  const theme = useTheme();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleExpandRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <ErrorIcon sx={{ color: theme.custom.colors.error, fontSize: 18 }} />;
      case 'warning':
        return <WarningIcon sx={{ color: theme.custom.colors.warning, fontSize: 18 }} />;
      case 'info':
        return <InfoIcon sx={{ color: theme.custom.colors.info, fontSize: 18 }} />;
      case 'success':
        return <CheckCircleIcon sx={{ color: theme.custom.colors.success, fontSize: 18 }} />;
      default:
        return <InfoIcon sx={{ color: theme.custom.colors.info, fontSize: 18 }} />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'success': return 'success';
      default: return 'default';
    }
  };

  const getStatusCodeColor = (statusCode?: number) => {
    if (!statusCode) return 'default';
    if (statusCode >= 200 && statusCode < 300) return 'success';
    if (statusCode >= 300 && statusCode < 400) return 'info';
    if (statusCode >= 400 && statusCode < 500) return 'warning';
    if (statusCode >= 500) return 'error';
    return 'default';
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedLogs = logs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card
      sx={{
        background: theme.custom.colors.background.secondary,
        border: `1px solid ${theme.custom.colors.border.primary}`,
        borderRadius: '16px',
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, pb: 0 }}>
          <Typography
            variant="h6"
            sx={{
              color: theme.custom.colors.text.primary,
              fontWeight: 600,
              mb: 2
            }}
          >
            Error Logs
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.custom.colors.background.tertiary }}>
                <TableCell sx={{ color: theme.custom.colors.text.secondary, fontWeight: 600 }}>
                  Level
                </TableCell>
                <TableCell sx={{ color: theme.custom.colors.text.secondary, fontWeight: 600 }}>
                  Timestamp
                </TableCell>
                <TableCell sx={{ color: theme.custom.colors.text.secondary, fontWeight: 600 }}>
                  Message
                </TableCell>
                <TableCell sx={{ color: theme.custom.colors.text.secondary, fontWeight: 600 }}>
                  Endpoint
                </TableCell>
                <TableCell sx={{ color: theme.custom.colors.text.secondary, fontWeight: 600 }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: theme.custom.colors.text.secondary, fontWeight: 600 }}>
                  Details
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <TableRow
                    sx={{
                      '&:hover': {
                        backgroundColor: `${theme.custom.colors.background.tertiary}50`
                      },
                      cursor: log.details || log.stack ? 'pointer' : 'default'
                    }}
                    onClick={() => (log.details || log.stack) && handleExpandRow(log.id)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getLevelIcon(log.level)}
                        <Chip
                          label={log.level.toUpperCase()}
                          size="small"
                          color={getLevelColor(log.level) as any}
                          variant="outlined"
                          sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: theme.custom.colors.text.secondary, fontSize: '0.875rem' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ color: theme.custom.colors.text.primary, maxWidth: '300px' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {log.message}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: theme.custom.colors.text.secondary, fontSize: '0.875rem' }}>
                      {log.endpoint || '-'}
                    </TableCell>
                    <TableCell>
                      {log.statusCode ? (
                        <Chip
                          label={log.statusCode}
                          size="small"
                          color={getStatusCodeColor(log.statusCode) as any}
                          variant="filled"
                        />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {(log.details || log.stack) && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExpandRow(log.id);
                          }}
                          sx={{
                            transform: expandedRow === log.id ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s'
                          }}
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                  {(log.details || log.stack) && (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0, border: 'none' }}>
                        <Collapse in={expandedRow === log.id} timeout="auto" unmountOnExit>
                          <Box
                            sx={{
                              p: 3,
                              backgroundColor: `${theme.custom.colors.background.tertiary}30`,
                              borderTop: `1px solid ${theme.custom.colors.border.primary}`
                            }}
                          >
                            {log.details && (
                              <Box sx={{ mb: 2 }}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ color: theme.custom.colors.text.primary, fontWeight: 600, mb: 1 }}
                                >
                                  Details:
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: theme.custom.colors.text.secondary }}
                                >
                                  {log.details}
                                </Typography>
                              </Box>
                            )}
                            {log.stack && (
                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ color: theme.custom.colors.text.primary, fontWeight: 600, mb: 1 }}
                                >
                                  Stack Trace:
                                </Typography>
                                <Box
                                  component="pre"
                                  sx={{
                                    backgroundColor: theme.custom.colors.background.primary,
                                    border: `1px solid ${theme.custom.colors.border.primary}`,
                                    borderRadius: '8px',
                                    p: 2,
                                    fontSize: '0.75rem',
                                    color: theme.custom.colors.text.secondary,
                                    overflow: 'auto',
                                    maxHeight: '200px'
                                  }}
                                >
                                  {log.stack}
                                </Box>
                              </Box>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={logs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: `1px solid ${theme.custom.colors.border.primary}`,
            color: theme.custom.colors.text.secondary
          }}
        />
      </CardContent>
    </Card>
  );
};

export default ErrorLogsTable;
