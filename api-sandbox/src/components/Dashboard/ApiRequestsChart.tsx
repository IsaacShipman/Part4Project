import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';

interface ApiRequestsChartProps {
  data: Array<{
    time: string;
    requests: number;
    errors: number;
    success: number;
  }>;
  type?: 'line' | 'bar';
  title: string;
  height?: number;
}

// Simple fallback chart component while recharts loads
const SimpleChart: React.FC<{ data: any[], type: string, height: number }> = ({ data, type, height }) => {
  const theme = useTheme();
  
  const maxValue = Math.max(...data.map(d => Math.max(d.requests, d.errors, d.success)));
  
  return (
    <Box sx={{ height, display: 'flex', alignItems: 'end', gap: 1, px: 2, py: 1 }}>
      {data.map((item, index) => (
        <Box
          key={index}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: '2px',
              alignItems: 'end',
              height: '80%'
            }}
          >
            <Box
              sx={{
                width: '8px',
                height: `${(item.requests / maxValue) * 100}%`,
                background: theme.custom.colors.primary,
                borderRadius: '2px 2px 0 0',
                minHeight: '2px'
              }}
            />
            <Box
              sx={{
                width: '8px',
                height: `${(item.success / maxValue) * 100}%`,
                background: theme.custom.colors.success,
                borderRadius: '2px 2px 0 0',
                minHeight: '2px'
              }}
            />
            <Box
              sx={{
                width: '8px',
                height: `${(item.errors / maxValue) * 100}%`,
                background: theme.custom.colors.error,
                borderRadius: '2px 2px 0 0',
                minHeight: '2px'
              }}
            />
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: theme.custom.colors.text.secondary,
              fontSize: '0.7rem',
              textAlign: 'center'
            }}
          >
            {item.time}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const ApiRequestsChart: React.FC<ApiRequestsChartProps> = ({
  data,
  type = 'line',
  title,
  height = 300
}) => {
  const theme = useTheme();

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
          {title}
        </Typography>
        
        <Box sx={{ height }}>
          <SimpleChart data={data} type={type} height={height - 20} />
        </Box>
        
        {/* Legend */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: theme.custom.colors.primary
              }}
            />
            <Typography variant="caption" sx={{ color: theme.custom.colors.text.secondary }}>
              Total Requests
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: theme.custom.colors.success
              }}
            />
            <Typography variant="caption" sx={{ color: theme.custom.colors.text.secondary }}>
              Success
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: theme.custom.colors.error
              }}
            />
            <Typography variant="caption" sx={{ color: theme.custom.colors.text.secondary }}>
              Errors
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ApiRequestsChart;
