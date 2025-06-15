import React from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  Paper,
  Chip,
  Divider,
  CircularProgress,
  Badge,
  alpha,
  useTheme
} from '@mui/material';
import { 
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Shield as ShieldIcon,
  CheckCircle as CheckCircleIcon 
} from '@mui/icons-material';

interface SecurityIssue {
  issue: string;
  line: number;
  severity: 'moderate' | 'high' | 'critical';
  recommendation: string;
}

interface SecurityScanTabProps {
  scanResults: SecurityIssue[] | null;
  isLoading: boolean;
  highlightLine?: (lineNumber: number) => void;
}

const SecurityScanTab: React.FC<SecurityScanTabProps> = ({ 
  scanResults, 
  isLoading,
  highlightLine 
}) => {
  const theme = useTheme();
  
  const getSeverityColor = (severity: string): string => {
    switch(severity) {
      case 'critical': return '#ef4444'; // red-500
      case 'high': return '#f97316';     // orange-500
      case 'moderate': return '#eab308'; // yellow-500
      default: return '#64748b';         // slate-500
    }
  };
  
  const getSeverityIcon = (severity: string) => {
    const color = getSeverityColor(severity);
    switch(severity) {
      case 'critical': return <ErrorIcon sx={{ color, fontSize: 20 }} />;
      case 'high': return <ErrorIcon sx={{ color, fontSize: 20 }} />;
      case 'moderate': return <WarningIcon sx={{ color, fontSize: 20 }} />;
      default: return <InfoIcon sx={{ color, fontSize: 20 }} />;
    }
  };

  const getSeverityCount = (severity: string) => {
    if (!scanResults) return 0;
    return scanResults.filter(issue => issue.severity === severity).length;
  };

  // Updated glass style to better match other components
  const glassStyle = {
    background: alpha(theme.palette.background.paper, 0.6),
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    borderRadius: 1.5,
  };

  const glassHoverStyle = {
    background: alpha(theme.palette.background.paper, 0.4),
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    borderRadius: 1.5,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      background: alpha(theme.palette.background.paper, 0.6),
      transform: 'translateY(-1px)',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
    }
  };

  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%',
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
      background: `linear-gradient(135deg, 
        ${alpha(theme.palette.background.default, 0.7)} 0%, 
        ${alpha(theme.palette.background.paper, 0.7)} 50%,
        ${alpha(theme.palette.background.default, 0.7)} 100%)`,
      color: theme.palette.text.primary,
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        pb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <ShieldIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Security Scan
        </Typography>
        
        {/* Summary badges */}
        {scanResults && scanResults.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            {getSeverityCount('critical') > 0 && (
              <Badge 
                badgeContent={getSeverityCount('critical')} 
                sx={{ 
                  '& .MuiBadge-badge': { 
                    backgroundColor: getSeverityColor('critical'),
                    color: 'white',
                    fontSize: '0.75rem'
                  }
                }}
              >
                <Chip 
                  label="Critical" 
                  size="small" 
                  sx={{ 
                    ...glassStyle,
                    color: getSeverityColor('critical'),
                    borderColor: alpha(getSeverityColor('critical'), 0.3)
                  }} 
                />
              </Badge>
            )}
            {getSeverityCount('high') > 0 && (
              <Badge 
                badgeContent={getSeverityCount('high')} 
                sx={{ 
                  '& .MuiBadge-badge': { 
                    backgroundColor: getSeverityColor('high'),
                    color: 'white',
                    fontSize: '0.75rem'
                  }
                }}
              >
                <Chip 
                  label="High" 
                  size="small" 
                  sx={{ 
                    ...glassStyle,
                    color: getSeverityColor('high'),
                    borderColor: alpha(getSeverityColor('high'), 0.3)
                  }} 
                />
              </Badge>
            )}
            {getSeverityCount('moderate') > 0 && (
              <Badge 
                badgeContent={getSeverityCount('moderate')} 
                sx={{ 
                  '& .MuiBadge-badge': { 
                    backgroundColor: getSeverityColor('moderate'),
                    color: 'black',
                    fontSize: '0.75rem'
                  }
                }}
              >
                <Chip 
                  label="Moderate" 
                  size="small" 
                  sx={{ 
                    ...glassStyle,
                    color: getSeverityColor('moderate'),
                    borderColor: alpha(getSeverityColor('moderate'), 0.3)
                  }} 
                />
              </Badge>
            )}
          </Box>
        )}
      </Box>
      
      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {isLoading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            height: '100%',
            gap: 2
          }}>
            <CircularProgress 
              sx={{ color: theme.palette.primary.main }} 
              size={48}
            />
            <Typography 
              variant="body1" 
              sx={{ 
                color: alpha(theme.palette.text.secondary, 0.8),
                textAlign: 'center'
              }}
            >
              Scanning code for vulnerabilities...
            </Typography>
          </Box>
        ) : scanResults === null ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            height: '100%',
            gap: 2
          }}>
            <ShieldIcon sx={{ color: alpha(theme.palette.text.secondary, 0.7), fontSize: 64 }} />
            <Typography 
              variant="body1" 
              sx={{ 
                color: alpha(theme.palette.text.secondary, 0.7),
                textAlign: 'center'
              }}
            >
              Click "Run" to scan code for security issues
            </Typography>
          </Box>
        ) : scanResults.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            height: '100%',
            gap: 2
          }}>
            <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 64 }} /> {/* green-500 */}
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#22c55e',
                fontWeight: 600
              }}
            >
              No security issues found!
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: alpha(theme.palette.text.secondary, 0.7),
                textAlign: 'center'
              }}
            >
              Your code appears to be secure
            </Typography>
          </Box>
        ) : (
          <List sx={{ 
            flex: 1, 
            overflow: 'auto',
            gap: 2,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {scanResults.map((issue, index) => (
              <ListItem 
                key={index} 
                sx={{ 
                  p: 0,
                  cursor: highlightLine ? 'pointer' : 'default'
                }}
                onClick={() => highlightLine && highlightLine(issue.line)}
              >
                <Paper 
                  elevation={0} 
                  sx={{ 
                    ...glassHoverStyle,
                    p: 3, 
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      background: `linear-gradient(180deg, ${getSeverityColor(issue.severity)} 0%, ${alpha(getSeverityColor(issue.severity), 0.3)} 100%)`,
                    }
                  }}
                >
                  {/* Header */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    gap: 2
                  }}>
                    {getSeverityIcon(issue.severity)}
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600,
                        color: theme.palette.text.primary
                      }}
                    >
                      Line {issue.line}
                    </Typography>
                    <Chip 
                      label={issue.severity.toUpperCase()} 
                      size="small" 
                      sx={{ 
                        ml: 'auto',
                        backgroundColor: alpha(getSeverityColor(issue.severity), 0.2),
                        color: getSeverityColor(issue.severity),
                        border: `1px solid ${alpha(getSeverityColor(issue.severity), 0.3)}`,
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }} 
                    />
                  </Box>
                  
                  {/* Issue description */}
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 2,
                      color: theme.palette.text.primary,
                      lineHeight: 1.6
                    }}
                  >
                    {issue.issue}
                  </Typography>
                  
                  {/* Recommendation */}
                  <Box 
                    sx={{ 
                      p: 2,
                      borderRadius: 1.5,
                      background: alpha(theme.palette.background.default, 0.5),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: alpha(theme.palette.text.secondary, 0.8),
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        mb: 1,
                        display: 'block'
                      }}
                    >
                      Recommendation
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        lineHeight: 1.5
                      }}
                    >
                      {issue.recommendation}
                    </Typography>
                  </Box>
                </Paper>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default SecurityScanTab;