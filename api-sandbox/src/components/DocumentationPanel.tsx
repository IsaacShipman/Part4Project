import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Link } from '@mui/material';

const DocumentationPanel: React.FC = () => {
  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Typography variant="subtitle2" gutterBottom>
        JSONPlaceholder API
      </Typography>
      <Typography variant="body2" paragraph>
        A free online REST API that you can use whenever you need some fake data.
      </Typography>
      <Typography variant="subtitle2" gutterBottom>
        Endpoints:
      </Typography>
      <List dense>
        <ListItem disablePadding>
          <ListItemText 
            primary="/users" 
            secondary="Returns a list of users" 
          />
        </ListItem>
        <ListItem disablePadding>
          <ListItemText 
            primary="/users/{id}" 
            secondary="Returns a single user by ID" 
          />
        </ListItem>
        <ListItem disablePadding>
          <ListItemText 
            primary="/posts" 
            secondary="Returns a list of posts" 
          />
        </ListItem>
      </List>
      <Typography variant="subtitle2" sx={{ mt: 2 }}>
        Example:
      </Typography>
      <Box sx={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.1)', 
        p: 1, 
        borderRadius: 1,
        fontFamily: 'monospace',
        fontSize: '0.875rem'
      }}>
        GET https://jsonplaceholder.typicode.com/users/1
      </Box>
      <Link href="https://jsonplaceholder.typicode.com/" target="_blank" sx={{ mt: 2, display: 'block' }}>
        Full Documentation
      </Link>
    </Box>
  );
};

export default DocumentationPanel;