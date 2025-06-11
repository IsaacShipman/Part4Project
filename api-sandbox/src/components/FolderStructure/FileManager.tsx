import React, { useState } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Paper
} from '@mui/material';
import { 
  InsertDriveFile, 
  Add as AddIcon,
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { useFileManager } from '../../contexts/FileManagerContext';

const FileManager: React.FC = () => {
  const {
    files,
    activeFileId,
    setActiveFileId,
    createFile,
    deleteFile,
    getFileContent  
  } = useFileManager();

  const [newFileDialogOpen, setNewFileDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [fileToDeleteId, setFileToDeleteId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      createFile(newFileName);
      setNewFileName('');
      setNewFileDialogOpen(false);
    }
  };

  const handleDeleteFile = () => {
    if (fileToDeleteId) {
      deleteFile(fileToDeleteId);
      setFileToDeleteId(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteClick = (fileId: string, event: React.MouseEvent) => {
    // Stop propagation to prevent file selection
    event.stopPropagation();
    setFileToDeleteId(fileId);
    setDeleteDialogOpen(true);
  };

  const handleFileSelection = (fileId: string) => {
    console.log('File selected:', fileId);
    console.log('File content:', getFileContent(fileId));
    // Simply set the active file ID - everything else will flow through context
    setActiveFileId(fileId);
  };

  // Glassomorphic styles
  const dialogStyles = {
    paper: {
      margin: 2,
      background: 'rgba(30, 41, 59, 0.85)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(71, 85, 105, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      borderRadius: '12px',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 70% 30%, rgba(16, 185, 129, 0.07) 0%, transparent 60%),
          linear-gradient(45deg, rgba(59, 130, 246, 0.05) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }
    }
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 1, 
        borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
        background: 'rgba(30, 41, 59, 0.2)',
        backdropFilter: 'blur(8px)',
      }}>
        <Typography variant="subtitle2" sx={{ 
          color: '#e2e8f0', 
          fontWeight: 600, 
          letterSpacing: '0.5px',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
        }}>
          Python Files
        </Typography>
        <IconButton 
          size="small" 
          onClick={() => setNewFileDialogOpen(true)}
          sx={{ 
            color: 'rgba(59, 130, 246, 0.8)', 
            '&:hover': { 
              color: '#10b981',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
      
      <List dense sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {files.length === 0 ? (
          <ListItem sx={{ 
            margin: '8px', 
            borderRadius: '8px',
            background: 'rgba(30, 41, 59, 0.3)',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(71, 85, 105, 0.2)',
            width: '96%', // Use percentage width for responsive centering
          }}>
            <ListItemText 
              primary="No files yet" 
              secondary="Create a new file to get started" 
              primaryTypographyProps={{ 
                variant: 'body2', 
                color: 'rgba(226, 232, 240, 0.8)',
                fontWeight: 500
              }}
              secondaryTypographyProps={{ 
                variant: 'caption', 
                color: 'rgba(148, 163, 184, 0.8)' 
              }}
            />
          </ListItem>
        ) : (
          files.map(file => (
            <ListItem 
              key={file.id} 
              disablePadding
              sx={{ 
                margin: '4px 0',
                width: '95%', // Use percentage width for responsive centering
                position: 'relative', // Needed for absolute positioning of delete button
              }}
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="delete" 
                  size="small"
                  onClick={(e) => handleDeleteClick(file.id, e)}
                  sx={{ 
                    opacity: 0.5, 
                    right: '8px', // Ensure proper positioning
                    zIndex: 2, // Keep above other elements
                    '&:hover': { 
                      opacity: 1, 
                      color: 'error.main',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemButton 
                selected={activeFileId === file.id}
                onClick={() => handleFileSelection(file.id)}
                sx={{ 
                  borderRadius: '8px',
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(5px)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  padding: '8px 12px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: '100%', // Make button take full width of parent
                  paddingRight: '40px', // Make space for the delete button
                  '&.Mui-selected': {
                    background: `
                      radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%),
                      rgba(59, 130, 246, 0.2)
                    `,
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    '&:hover': {
                      background: 'rgba(59, 130, 246, 0.3)',
                    }
                  },
                  '&:hover': { 
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                  }
                  // Remove pr: 6 as we now use paddingRight directly
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <InsertDriveFile 
                    fontSize="small" 
                    sx={{ 
                      color: activeFileId === file.id 
                        ? 'rgba(59, 130, 246, 0.9)' 
                        : 'rgba(148, 163, 184, 0.8)'
                    }} 
                  />
                </ListItemIcon>
                <ListItemText 
                  primary={file.name} 
                  primaryTypographyProps={{ 
                    variant: 'body2',
                    sx: {
                      color: '#e2e8f0',
                      fontWeight: activeFileId === file.id ? 600 : 400
                    }
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>

      {/* New File Dialog */}
      <Dialog 
        open={newFileDialogOpen} 
        onClose={() => setNewFileDialogOpen(false)}
        PaperProps={{ sx: dialogStyles.paper }}
        BackdropProps={{
          sx: { backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)' }
        }}
      >
        <DialogTitle sx={{ 
          color: '#e2e8f0', 
          borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
          background: 'rgba(30, 41, 59, 0.5)',
          padding: '16px 24px',
        }}>
          Create New Python File
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          <TextField
            autoFocus
            margin="dense"
            label="File Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="example.py"
            helperText="File name will automatically get .py extension if not included"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateFile();
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(15, 23, 42, 0.3)',
                '& fieldset': {
                  borderColor: 'rgba(71, 85, 105, 0.5)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(59, 130, 246, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(59, 130, 246, 0.8)',
                },
              },
              '& .MuiFormLabel-root': {
                color: 'rgba(148, 163, 184, 0.8)',
              },
              '& .MuiInputBase-input': {
                color: '#e2e8f0',
              },
              '& .MuiFormHelperText-root': {
                color: 'rgba(148, 163, 184, 0.7)',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ 
          padding: '12px 24px',
          borderTop: '1px solid rgba(71, 85, 105, 0.3)',
        }}>
          <Button 
            onClick={() => setNewFileDialogOpen(false)}
            sx={{
              color: 'rgba(148, 163, 184, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(51, 65, 85, 0.5)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateFile} 
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.9), rgba(16, 185, 129, 0.9))',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
              '&:hover': {
                background: 'linear-gradient(45deg, rgba(59, 130, 246, 1), rgba(16, 185, 129, 1))',
                boxShadow: '0 6px 16px rgba(59, 130, 246, 0.6)',
              }
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: dialogStyles.paper }}
        BackdropProps={{
          sx: { backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)' }
        }}
      >
        <DialogTitle sx={{ 
          color: '#e2e8f0', 
          borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
          background: 'rgba(30, 41, 59, 0.5)',
          padding: '16px 24px',
        }}>
          Delete File
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          <Typography sx={{ color: '#e2e8f0' }}>
            Are you sure you want to delete this file? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          padding: '12px 24px',
          borderTop: '1px solid rgba(71, 85, 105, 0.3)',
        }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              color: 'rgba(148, 163, 184, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(51, 65, 85, 0.5)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteFile} 
            color="error"
            variant="contained"
            sx={{
              background: 'rgba(239, 68, 68, 0.8)',
              '&:hover': {
                background: 'rgba(239, 68, 68, 1)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileManager;