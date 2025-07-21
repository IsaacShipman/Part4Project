export const getMethodColor = (method: string) => {
  const methodStyles = {
    POST: {
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      color: '#60a5fa',
      border: '1px solid rgba(59, 130, 246, 0.3)'
    },
    GET: {
      backgroundColor: 'rgba(34, 197, 94, 0.15)',
      color: '#4ade80',
      border: '1px solid rgba(34, 197, 94, 0.3)'
    },
    PUT: {
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      color: '#fbbf24',
      border: '1px solid rgba(245, 158, 11, 0.3)'
    },
    PATCH: {
      backgroundColor: 'rgba(168, 85, 247, 0.15)',
      color: '#a855f7',
      border: '1px solid rgba(168, 85, 247, 0.3)'
    },
    DELETE: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      color: '#f87171',
      border: '1px solid rgba(239, 68, 68, 0.3)'
    }
  };

  return methodStyles[method as keyof typeof methodStyles] || {
    backgroundColor: 'rgba(107, 114, 128, 0.15)',
    color: '#9ca3af',
    border: '1px solid rgba(107, 114, 128, 0.3)'
  };
};