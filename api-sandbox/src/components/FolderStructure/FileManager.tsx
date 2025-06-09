import React, { useState, useEffect } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  TextField,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { 
  InsertDriveFile, 
  Add, 
  Delete, 
  Code as CodeIcon 
} from '@mui/icons-material';
import { listStyles } from '../../styles/containerStyles';
import { useFileSystem } from '../../hooks/useFileSystem';

interface File {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const FileManager = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  
  // This hook would be implemented separately to handle file operations
  const { loadFiles, saveFile, deleteFile, openFile } = useFileSystem();
  
  // Load files on component mount
  useEffect(() => {
    const loadSavedFiles = async () => {
      const savedFiles = await loadFiles();
      setFiles(savedFiles);
    };
    
    loadSavedFiles();
  }, [loadFiles]);
  
  const handleFileClick = (fileId: string) => {
    setSelectedFileId(fileId);
    const selectedFile = files.find(file => file.id === fileId);
    if (selectedFile) {
      openFile(selectedFile);
    }
  };
  
  const handleCreateNewFile = () => {
    setIsNewFileDialogOpen(true);
    setNewFileName('');
  };
  
  const handleNewFileSubmit = async () => {
    if (!newFileName.trim()) return;
    
    // Add .py extension if not present
    const fileName = newFileName.endsWith('.py') ? newFileName : `${newFileName}.py`;
    
    const newFile: File = {
      id: `file-${Date.now()}`,
      name: fileName,
      content: '# New Python file\n\n',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await saveFile(newFile);
    setFiles([...files, newFile]);
    setSelectedFileId(newFile.id);
    openFile(newFile);
    setIsNewFileDialogOpen(false);
  };
  
  const handleDeleteFile = (fileId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setFileToDelete(fileId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteFile = async () => {
    if (fileToDelete) {
      await deleteFile(fileToDelete);
      setFiles(files.filter(file => file.id !== fileToDelete));
      if (selectedFileId === fileToDelete) {
        setSelectedFileId(null);
      }
      setIsDeleteDialogOpen(false);
    }
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* File List Header with Add Button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '8px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Python Files
        </Typography>
        <IconButton 
          size="small" 
          onClick={handleCreateNewFile}
          sx={{ 
            color: 'rgba(59, 130, 246, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
            }
          }}
        >
          <Add fontSize="small" />
        </IconButton>
      </Box>
      
      {/* File List */}
      <List sx={listStyles}>
        {files.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
            <CodeIcon sx={{ fontSize: 40, mb: 2, opacity: 0.5 }} />
            <Typography variant="body2" gutterBottom>
              No Python files yet
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              startIcon={<Add />}
              onClick={handleCreateNewFile}
              sx={{ 
                mt: 1,
                borderColor: 'rgba(59, 130, 246, 0.6)',
                color: 'rgba(59, 130, 246, 0.8)',
                '&:hover': {
                  borderColor: 'rgba(59, 130, 246, 0.8)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)'
                }
              }}
            >
              Create new file
            </Button>
          </Box>
        ) : (
          files.map(file => (
            <ListItem key={file.id} disablePadding>
              <ListItemButton 
                selected={selectedFileId === file.id}
                onClick={() => handleFileClick(file.id)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.2)'
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <InsertDriveFile sx={{ color: 'rgba(59, 130, 246, 0.8)', fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={file.name} 
                  sx={{ 
                    '& .MuiListItemText-primary': { 
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.9rem'
                    }
                  }}
                />
                <IconButton 
                  size="small" 
                  onClick={(e) => handleDeleteFile(file.id, e)} 
                  sx={{ 
                    opacity: 0.5,
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      opacity: 1,
                      color: '#ff4d4f',
                      backgroundColor: 'rgba(255, 77, 79, 0.1)'
                    }
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>
      
      {/* New File Dialog */}
      <Dialog 
        open={isNewFileDialogOpen} 
        onClose={() => setIsNewFileDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }
        }}
      >
        <DialogTitle sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>Create New Python File</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="File Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="main.py"
            InputLabelProps={{
              sx: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
            InputProps={{
              sx: { 
                color: 'rgba(255, 255, 255, 0.9)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(59, 130, 246, 0.5)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(59, 130, 246, 0.8)'
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsNewFileDialogOpen(false)}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleNewFileSubmit}
            sx={{ 
              color: 'rgba(59, 130, 246, 0.9)',
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.1)'
              }
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }
        }}
      >
        <DialogTitle sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>Delete File?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Are you sure you want to delete this file? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsDeleteDialogOpen(false)}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteFile}
            sx={{ 
              color: '#ff4d4f',
              '&:hover': {
                backgroundColor: 'rgba(255, 77, 79, 0.1)'
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