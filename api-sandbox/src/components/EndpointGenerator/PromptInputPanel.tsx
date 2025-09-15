import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Paper,
  SelectChangeEvent
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

interface PromptInputPanelProps {
  onGenerate: (prompt: string, authMethod: string, language: string) => void;
  isLoading?: boolean;
}

const PromptInputPanel: React.FC<PromptInputPanelProps> = ({ 
  onGenerate, 
  isLoading = false 
}) => {
  const [prompt, setPrompt] = useState('');
  const [authMethod, setAuthMethod] = useState('none');
  const [language, setLanguage] = useState('typescript');

  const handleAuthMethodChange = (event: SelectChangeEvent) => {
    setAuthMethod(event.target.value);
  };

  const handleLanguageChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value);
  };

  const handleSubmit = () => {
    if (prompt.trim()) {
      onGenerate(prompt.trim(), authMethod, language);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '16px',
        background: (theme) => `${theme.custom.colors.background.secondary}95`,
        backdropFilter: 'blur(10px)',
        border: (theme) => `1px solid ${theme.custom.colors.border.primary}`,
        height: 'fit-content'
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          color: (theme) => theme.custom.colors.text.primary,
          mb: 3,
          fontWeight: 600
        }}
      >
        Generate API Workflow
      </Typography>

      {/* Main prompt input */}
      <TextField
        fullWidth
        multiline
        rows={8}
        placeholder="Describe what you want to achieve with the API... 

Examples:
• Get repos for user and latest commit
• List issues in a repository with labels
• Create a new repository with initial files"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyPress}
        variant="outlined"
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: (theme) => `${theme.custom.colors.background.tertiary}50`,
            '& fieldset': {
              borderColor: (theme) => theme.custom.colors.border.secondary,
            },
            '&:hover fieldset': {
              borderColor: (theme) => theme.custom.colors.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: (theme) => theme.custom.colors.primary,
            }
          },
          '& .MuiInputBase-input': {
            color: (theme) => theme.custom.colors.text.primary,
            fontSize: '14px',
            lineHeight: 1.5
          },
          '& .MuiInputBase-input::placeholder': {
            color: (theme) => theme.custom.colors.text.secondary,
            opacity: 0.7
          }
        }}
      />

          
   

      {/* Generate button */}
      <Button
        fullWidth
        variant="contained"
        onClick={handleSubmit}
        disabled={!prompt.trim() || isLoading}
        startIcon={<SendIcon />}
        sx={{
          borderRadius: '12px',
          py: 1.5,
          fontSize: '16px',
          fontWeight: 600,
          textTransform: 'none',
          background: (theme) => `linear-gradient(135deg, ${theme.custom.colors.primary} 0%, ${theme.custom.colors.accent} 100%)`,
          boxShadow: (theme) => `0 4px 16px ${theme.custom.colors.primary}40`,
          '&:hover': {
            background: (theme) => `linear-gradient(135deg, ${theme.custom.colors.primary}dd 0%, ${theme.custom.colors.accent}dd 100%)`,
            boxShadow: (theme) => `0 6px 20px ${theme.custom.colors.primary}50`,
          },
          '&:disabled': {
            background: (theme) => theme.custom.colors.text.secondary,
            color: 'white',
            opacity: 0.5
          }
        }}
      >
        {isLoading ? 'Generating...' : 'Generate Workflow'}
      </Button>

    
    </Paper>
  );
};

export default PromptInputPanel;
