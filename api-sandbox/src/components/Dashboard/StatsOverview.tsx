import React from 'react';
import { Box } from '@mui/material';
import MetricsCard from './MetricsCard';
import {
  Api as ApiIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

interface StatsData {
  totalRequests: number;
  successfulRequests: number;
  errorRequests: number;
  averageResponseTime: number;
  securityScans: number;
  uptime: number;
  requestTrends: {
    totalChange: string;
    successChange: string;
    errorChange: string;
    responseTimeChange: string;
  };
}

interface StatsOverviewProps {
  data: StatsData;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ data }) => {
  const successRate = data.totalRequests > 0 
    ? ((data.successfulRequests / data.totalRequests) * 100).toFixed(1)
    : '0';

  const errorRate = data.totalRequests > 0 
    ? ((data.errorRequests / data.totalRequests) * 100).toFixed(1)
    : '0';

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          },
          gap: 3
        }}
      >
        <MetricsCard
          title="Total API Requests"
          value={data.totalRequests.toLocaleString()}
          subtitle="Requests processed today"
          trend={parseFloat(data.requestTrends.totalChange) > 0 ? 'up' : parseFloat(data.requestTrends.totalChange) < 0 ? 'down' : 'neutral'}
          trendValue={data.requestTrends.totalChange}
          icon={<ApiIcon />}
          color="primary"
        />

        <MetricsCard
          title="Success Rate"
          value={`${successRate}%`}
          subtitle={`${data.successfulRequests.toLocaleString()} successful requests`}
          trend={parseFloat(data.requestTrends.successChange) > 0 ? 'up' : parseFloat(data.requestTrends.successChange) < 0 ? 'down' : 'neutral'}
          trendValue={data.requestTrends.successChange}
          icon={<CheckCircleIcon />}
          color="success"
        />

        <MetricsCard
          title="Error Rate"
          value={`${errorRate}%`}
          subtitle={`${data.errorRequests.toLocaleString()} failed requests`}
          trend={parseFloat(data.requestTrends.errorChange) > 0 ? 'down' : parseFloat(data.requestTrends.errorChange) < 0 ? 'up' : 'neutral'}
          trendValue={data.requestTrends.errorChange}
          icon={<ErrorIcon />}
          color="error"
        />

        <MetricsCard
          title="Avg Response Time"
          value={`${data.averageResponseTime}ms`}
          subtitle="Average API response time"
          trend={parseFloat(data.requestTrends.responseTimeChange) > 0 ? 'down' : parseFloat(data.requestTrends.responseTimeChange) < 0 ? 'up' : 'neutral'}
          trendValue={data.requestTrends.responseTimeChange}
          icon={<SpeedIcon />}
          color="info"
        />

        <MetricsCard
          title="Security Scans"
          value={data.securityScans.toLocaleString()}
          subtitle="Vulnerabilities detected today"
          trend="neutral"
          icon={<SecurityIcon />}
          color="warning"
        />

        <MetricsCard
          title="System Uptime"
          value={`${data.uptime.toFixed(1)}%`}
          subtitle="Service availability"
          trend={data.uptime > 99 ? 'up' : data.uptime > 95 ? 'neutral' : 'down'}
          trendValue={data.uptime > 99 ? '+0.1%' : data.uptime > 95 ? '0%' : '-2.3%'}
          icon={<TimelineIcon />}
          color="secondary"
        />
      </Box>
    </Box>
  );
};

export default StatsOverview;
