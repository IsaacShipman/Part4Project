import React from 'react';
import { Box, Typography } from '@mui/material';

function SecurityScanView() {
  return (
    <Box sx={{ padding: 4, display: 'flex', flexDirection: 'column', height: '100%', marginTop: 8 }}>
      <Typography variant="h4">Security Scan View</Typography>
      <Typography variant="body1">This is where the security scan functionality will be implemented.</Typography>
    </Box>
  );
}

export default SecurityScanView;