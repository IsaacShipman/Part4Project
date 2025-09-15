import React, { useEffect } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import StatsOverview from './StatsOverview';
import ApiRequestsChart from './ApiRequestsChart';
import ErrorLogsTable from './ErrorLogsTable';
import ActivityFeed from './ActivityFeed';
import { useLogging } from '../../contexts/LoggingContext';

// Mock data - this would come from your logging service
const mockStatsData = {
  totalRequests: 12543,
  successfulRequests: 11892,
  errorRequests: 651,
  averageResponseTime: 245,
  securityScans: 23,
  uptime: 99.8,
  requestTrends: {
    totalChange: '+12.5%',
    successChange: '+8.3%',
    errorChange: '-2.1%',
    responseTimeChange: '-15ms'
  }
};

const mockChartData = [
  { time: '00:00', requests: 120, errors: 5, success: 115 },
  { time: '04:00', requests: 85, errors: 2, success: 83 },
  { time: '08:00', requests: 245, errors: 12, success: 233 },
  { time: '12:00', requests: 380, errors: 18, success: 362 },
  { time: '16:00', requests: 290, errors: 8, success: 282 },
  { time: '20:00', requests: 180, errors: 6, success: 174 }
];

const mockErrorLogs = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    level: 'error' as const,
    message: 'Failed to connect to external API service',
    endpoint: '/api/v1/users',
    statusCode: 500,
    details: 'Connection timeout after 30 seconds',
    stack: 'Error: Connection timeout\n    at APIService.connect (api.ts:45)\n    at UserController.getUsers (users.ts:23)'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    level: 'warning' as const,
    message: 'High response time detected',
    endpoint: '/api/v1/data',
    statusCode: 200,
    details: 'Response time exceeded 2000ms threshold'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    level: 'error' as const,
    message: 'Authentication failed',
    endpoint: '/api/v1/auth/login',
    statusCode: 401,
    details: 'Invalid JWT token provided'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    level: 'info' as const,
    message: 'Database migration completed',
    details: 'Successfully migrated 1,234 records'
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    level: 'warning' as const,
    message: 'Rate limit approaching',
    endpoint: '/api/v1/search',
    statusCode: 200,
    details: '80% of rate limit reached for user ID: 12345'
  }
];

const mockActivityData = [
  {
    id: '1',
    type: 'api_request' as const,
    title: 'API Request Processed',
    description: 'Successful data retrieval from GitHub API',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    metadata: {
      endpoint: '/api/v1/repos',
      method: 'GET',
      statusCode: 200,
      duration: 245
    }
  },
  {
    id: '2',
    type: 'error' as const,
    title: 'API Request Failed',
    description: 'Failed to authenticate with external service',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    metadata: {
      endpoint: '/api/v1/auth',
      method: 'POST',
      statusCode: 401,
      duration: 1250
    }
  },
  {
    id: '3',
    type: 'security_scan' as const,
    title: 'Security Scan Completed',
    description: 'Vulnerability scan finished with 2 medium-risk issues found',
    timestamp: new Date(Date.now() - 450000).toISOString()
  },
  {
    id: '4',
    type: 'code_execution' as const,
    title: 'Code Execution',
    description: 'Python script executed successfully',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    metadata: {
      duration: 1850
    }
  },
  {
    id: '5',
    type: 'success' as const,
    title: 'Backup Completed',
    description: 'Daily database backup completed successfully',
    timestamp: new Date(Date.now() - 900000).toISOString()
  }
];

const DashboardMain: React.FC = () => {
  const theme = useTheme();
  const { state, logInfo, logApiRequest, logError, addActivity } = useLogging();

  // Populate with some initial demo data
  useEffect(() => {
    const populateDemoData = () => {
      // Add some demo activities
      addActivity({
        type: 'api_request',
        title: 'API Request Processed',
        description: 'Successful data retrieval from GitHub API',
        metadata: {
          endpoint: '/api/v1/repos',
          method: 'GET',
          statusCode: 200,
          duration: 245
        }
      });

      addActivity({
        type: 'security_scan',
        title: 'Security Scan Completed',
        description: 'Vulnerability scan finished with 2 medium-risk issues found'
      });

      addActivity({
        type: 'code_execution',
        title: 'Code Execution',
        description: 'Python script executed successfully',
        metadata: { duration: 1850 }
      });

      // Log some demo API requests
      logApiRequest('/api/v1/users', 'GET', 200, 150);
      logApiRequest('/api/v1/data', 'POST', 201, 300);
      logApiRequest('/api/v1/auth', 'POST', 401, 1200);
      logApiRequest('/api/v1/files', 'GET', 404, 50);
      
      // Log some errors
      logError('Failed to connect to external API service', {
        endpoint: '/api/v1/external',
        statusCode: 500,
        details: 'Connection timeout after 30 seconds',
        stack: 'Error: Connection timeout\n    at APIService.connect (api.ts:45)\n    at UserController.getUsers (users.ts:23)'
      });

      logInfo('Database migration completed', {
        details: 'Successfully migrated 1,234 records'
      });
    };

    // Only populate demo data if we have no existing data
    if (state.logs.length === 0 && state.activities.length === 0) {
      populateDemoData();
    }
  }, [state.logs.length, state.activities.length, addActivity, logApiRequest, logError, logInfo]);

  // Use actual data from logging context, fallback to mock data for charts
  const statsData = {
    ...mockStatsData,
    ...state.metrics
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.custom.colors.background.gradient,
        pt: '88px', // Account for fixed AppBar height
        pb: 4
      }}
    >
      <Box sx={{ maxWidth: '1400px', mx: 'auto', px: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: theme.custom.colors.text.primary,
              mb: 1,
              background: `linear-gradient(135deg, ${theme.custom.colors.primary} 0%, ${theme.custom.colors.accent} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Dashboard
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: theme.custom.colors.text.secondary,
              fontWeight: 500
            }}
          >
            Monitor your API performance, errors, and system health
          </Typography>
        </Box>

        {/* Stats Overview */}
        <StatsOverview data={statsData} />

        {/* Charts and Tables Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: '2fr 1fr'
            },
            gap: 3,
            mb: 4
          }}
        >
          {/* API Requests Chart */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateRows: 'auto auto',
              gap: 3
            }}
          >
            <ApiRequestsChart
              data={mockChartData}
              title="API Requests Over Time"
              type="line"
              height={350}
            />
            <ApiRequestsChart
              data={mockChartData}
              title="Request Distribution"
              type="bar"
              height={300}
            />
          </Box>

          {/* Activity Feed */}
          <ActivityFeed activities={state.activities.length > 0 ? state.activities : mockActivityData} maxItems={10} />
        </Box>

        {/* Error Logs Table */}
        <ErrorLogsTable logs={state.logs.length > 0 ? state.logs : mockErrorLogs} />
      </Box>
    </Box>
  );
};

export default DashboardMain;
