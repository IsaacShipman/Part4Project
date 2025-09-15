import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  subtitle,
  trend = 'neutral',
  trendValue,
  icon,
  color = 'primary'
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'success.main';
      case 'down': return 'error.main';
      default: return 'text.secondary';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp fontSize="small" />;
      case 'down': return <TrendingDown fontSize="small" />;
      default: return null;
    }
  };

  return (
    <Card
      sx={{
        background: (theme) => theme.custom.colors.background.secondary,
        border: (theme) => `1px solid ${theme.custom.colors.border.primary}`,
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: (theme) => `linear-gradient(135deg, ${theme.custom.colors[color]} 0%, ${theme.custom.colors.accent} 100%)`
        },
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => `0 8px 32px ${theme.custom.colors[color]}20`
        },
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: (theme) => theme.custom.colors.text.secondary,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.75rem'
            }}
          >
            {title}
          </Typography>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: (theme) => `linear-gradient(135deg, ${theme.custom.colors[color]}20 0%, ${theme.custom.colors[color]}40 100%)`,
              color: (theme) => theme.custom.colors[color]
            }}
          >
            {icon}
          </Avatar>
        </Box>
        
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            color: (theme) => theme.custom.colors.text.primary,
            mb: 1,
            lineHeight: 1.2
          }}
        >
          {value}
        </Typography>
        
        {subtitle && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: (theme) => theme.custom.colors.text.secondary,
              mb: 1
            }}
          >
            {subtitle}
          </Typography>
        )}
        
        {trendValue && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ color: getTrendColor(), display: 'flex', alignItems: 'center' }}>
              {getTrendIcon()}
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                color: getTrendColor(),
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            >
              {trendValue}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: (theme) => theme.custom.colors.text.secondary,
                fontSize: '0.75rem'
              }}
            >
              vs last week
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricsCard;
