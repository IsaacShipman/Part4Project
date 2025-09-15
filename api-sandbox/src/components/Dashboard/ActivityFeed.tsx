import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  useTheme
} from '@mui/material';
import {
  Api as ApiIcon,
  Security as SecurityIcon,
  Code as CodeIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface ActivityItem {
  id: string;
  type: 'api_request' | 'security_scan' | 'code_execution' | 'error' | 'success' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    endpoint?: string;
    method?: string;
    statusCode?: number;
    duration?: number;
  };
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, maxItems = 20 }) => {
  const theme = useTheme();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'api_request':
        return <ApiIcon />;
      case 'security_scan':
        return <SecurityIcon />;
      case 'code_execution':
        return <CodeIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'success':
        return <CheckCircleIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'api_request':
        return theme.custom.colors.primary;
      case 'security_scan':
        return theme.custom.colors.accent;
      case 'code_execution':
        return theme.custom.colors.secondary;
      case 'error':
        return theme.custom.colors.error;
      case 'success':
        return theme.custom.colors.success;
      case 'warning':
        return theme.custom.colors.warning;
      case 'info':
        return theme.custom.colors.info;
      default:
        return theme.custom.colors.text.secondary;
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

  const formatDuration = (duration?: number) => {
    if (!duration) return '';
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return time.toLocaleDateString();
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card
      sx={{
        background: theme.custom.colors.background.secondary,
        border: `1px solid ${theme.custom.colors.border.primary}`,
        borderRadius: '16px',
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{
            color: theme.custom.colors.text.primary,
            fontWeight: 600,
            mb: 3
          }}
        >
          Activity Feed
        </Typography>

        <List sx={{ p: 0 }}>
          {displayedActivities.map((activity, index) => (
            <ListItem
              key={activity.id}
              sx={{
                p: 2,
                borderRadius: '12px',
                mb: 1,
                border: `1px solid ${theme.custom.colors.border.primary}`,
                background: `${theme.custom.colors.background.tertiary}30`,
                '&:hover': {
                  background: `${theme.custom.colors.background.tertiary}50`,
                  transform: 'translateX(4px)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  background: getActivityColor(activity.type),
                  borderRadius: '0 4px 4px 0'
                }
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    background: `${getActivityColor(activity.type)}20`,
                    color: getActivityColor(activity.type),
                    width: 40,
                    height: 40
                  }}
                >
                  {getActivityIcon(activity.type)}
                </Avatar>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        color: theme.custom.colors.text.primary,
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}
                    >
                      {activity.title}
                    </Typography>
                    {activity.metadata?.statusCode && (
                      <Chip
                        label={activity.metadata.statusCode}
                        size="small"
                        color={getStatusCodeColor(activity.metadata.statusCode) as any}
                        sx={{ fontSize: '0.75rem', height: 20 }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.custom.colors.text.secondary,
                        mb: 1
                      }}
                    >
                      {activity.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.custom.colors.text.secondary,
                          fontSize: '0.75rem'
                        }}
                      >
                        {formatTimestamp(activity.timestamp)}
                      </Typography>
                      
                      {activity.metadata?.endpoint && (
                        <Chip
                          label={`${activity.metadata.method || 'GET'} ${activity.metadata.endpoint}`}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.7rem',
                            height: 18,
                            color: theme.custom.colors.text.secondary,
                            borderColor: theme.custom.colors.border.primary
                          }}
                        />
                      )}
                      
                      {activity.metadata?.duration && (
                        <Chip
                          label={formatDuration(activity.metadata.duration)}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.7rem',
                            height: 18,
                            color: theme.custom.colors.info,
                            borderColor: theme.custom.colors.info
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        {activities.length > maxItems && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: theme.custom.colors.text.secondary,
                cursor: 'pointer',
                '&:hover': {
                  color: theme.custom.colors.primary
                }
              }}
            >
              View {activities.length - maxItems} more activities
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
