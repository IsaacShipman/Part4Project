import React, { useState } from 'react';
import { Box, IconButton, Tooltip, useTheme } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';

const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false);
  const theme = useTheme();

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Box
      component="div"
      sx={{
        position: 'relative',
        backgroundColor: theme.custom.codeBlock.background,
        color: theme.custom.codeBlock.foreground,
        padding: 2,
        borderRadius: 1,
        overflow: 'auto',
        fontSize: '0.8rem',
        fontFamily: theme.custom.terminal.fontFamily,
        maxHeight: '180px',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
        },
      }}
    >
      <Box component="code">{code}</Box>
      <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'} placement="top">
        <IconButton
          onClick={handleCopy}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: theme.palette.primary.main,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          <ContentCopy fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default CodeBlock;
