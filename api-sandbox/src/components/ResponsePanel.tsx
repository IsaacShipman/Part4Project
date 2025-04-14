import React from 'react';
import { Box, Typography, Divider, Chip } from '@mui/material';
import loading from '../App'

interface ResponsePanelProps {
  response: any;
}

type Props = {
    response: string | null;
    loading: boolean;
  };
  
  const ResponsePanel: React.FC<Props> = ({ response, loading }) => {
    return (
      <Box sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
        <Typography variant="body2">
          {loading ? "Running code..." : response ?? "No output yet"}
        </Typography>
      </Box>
    );
  }
export default ResponsePanel;