

  import React, { useState, useEffect } from 'react';
import { Button, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import EndpointCards from './EndpointCards';
import { SimpleEndpoint, isValidEndpoint } from './simpleTypes';

// Simple localStorage persistence
const STORAGE_KEY = 'endpoint-cards';

const getStoredEndpoints = (): SimpleEndpoint[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setStoredEndpoints = (endpoints: SimpleEndpoint[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(endpoints));
  } catch {}
};

const PromptInputPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [endpoints, setEndpoints] = useState<SimpleEndpoint[]>(getStoredEndpoints());
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStoredEndpoints(endpoints);
  }, [endpoints]);

  // Call your backend API
  const generateEndpoints = async (userPrompt: string): Promise<SimpleEndpoint[]> => {
    try {
      // Try the backend first
      const response = await fetch('http://localhost:8000/api/endpoints/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Raw API response:', data);
        
        // Check if the response has an error
        if (data.error) {
          throw new Error(`Backend error: ${data.error}`);
        }
        
        // Validate and filter the endpoints
        if (Array.isArray(data)) {
          const validEndpoints = data.filter(isValidEndpoint);
          if (validEndpoints.length > 0) {
            return validEndpoints;
          }
          throw new Error('No valid endpoints returned from API');
        } else {
          throw new Error('Invalid response format from API');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Backend API call failed, using demo data:', error);
      // Fallback to demo data that matches your prompt
      const fallbackEndpoints: SimpleEndpoint[] = [
        {
          id: '1',
          name: 'Get Repository',
          method: 'GET',
          url_template: 'https://api.github.com/repos/{owner}/{repo}',
          description: 'Retrieves details about a specific repository including name, description, stars, and other metadata. Perfect for getting basic repository information.',
          confidence: 0.95
        },
        {
          id: '2',
          name: 'List Repository Issues',
          method: 'GET',
          url_template: 'https://api.github.com/repos/{owner}/{repo}/issues',
          description: 'Lists all issues for a repository with filtering options. Use this to track bugs, feature requests, and other discussions.',
          confidence: 0.88
        },
        {
          id: '3',
          name: 'Create New Issue',
          method: 'POST',
          url_template: 'https://api.github.com/repos/{owner}/{repo}/issues',
          description: 'Creates a new issue in the repository. Essential for reporting bugs or requesting new features programmatically.',
          confidence: 0.82
        }
      ];
      
      return fallbackEndpoints.filter(isValidEndpoint);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newEndpoints = await generateEndpoints(prompt);
      setEndpoints(newEndpoints);
      if (newEndpoints.length > 0 && newEndpoints[0]) {
        setSelectedEndpointId(newEndpoints[0].id);
      }
    } catch (err) {
      setError(`Failed to generate endpoints: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEndpoints([]);
    setSelectedEndpointId(undefined);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleEndpointSelect = (endpointId: string) => {
    setSelectedEndpointId(endpointId);
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      <Paper sx={{ p: 3, borderRadius: '16px', width: '100%', maxWidth: 600, mb: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Describe your API task in natural language
        </Typography>
        <TextField
          fullWidth
          value={prompt}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value)}
          placeholder="E.g., I want to get repository information and list all issues for a specific GitHub repo"
          variant="outlined"
          multiline
          rows={3}
          sx={{ mb: 2 }}
          disabled={isLoading}
        />
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={handleGenerate} 
            disabled={!prompt.trim() || isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
          >
            {isLoading ? 'Generating...' : 'Generate Endpoints'}
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleReset}
            disabled={isLoading}
          >
            Reset
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, maxWidth: 700 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ width: '100%', maxWidth: 700 }}>
        <EndpointCards 
          endpoints={endpoints} 
          selectedEndpointId={selectedEndpointId}
          onEndpointSelect={handleEndpointSelect}
        />
      </Box>
    </Box>
  );
};

export default PromptInputPanel;
