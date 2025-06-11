import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface File {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FileManagerContextType {
  files: File[];
  activeFileId: string | null;
  setActiveFileId: (id: string | null) => void;
  createFile: (name: string, content?: string) => File;
  updateFile: (id: string, content: string) => void;
  deleteFile: (id: string) => void;
  getFileContent: (id: string) => string | null;
  getActiveFile: () => File | null;
}

const FileManagerContext = createContext<FileManagerContextType | undefined>(undefined);

// Helper functions for localStorage
const saveFilesToStorage = (files: File[]) => {
  // Convert Date objects to strings before storing
  const filesForStorage = files.map(file => ({
    ...file,
    createdAt: file.createdAt.toISOString(),
    updatedAt: file.updatedAt.toISOString()
  }));
  localStorage.setItem('sandbox-files', JSON.stringify(filesForStorage));
};

const loadFilesFromStorage = (): File[] => {
  const storedFiles = localStorage.getItem('sandbox-files');
  if (!storedFiles) return [];
  
  // Convert date strings back to Date objects
  return JSON.parse(storedFiles).map((file: any) => ({
    ...file,
    createdAt: new Date(file.createdAt),
    updatedAt: new Date(file.updatedAt)
  }));
};

const saveActiveFileId = (id: string | null) => {
  if (id) {
    localStorage.setItem('sandbox-active-file', id);
  } else {
    localStorage.removeItem('sandbox-active-file');
  }
};

const loadActiveFileId = (): string | null => {
  return localStorage.getItem('sandbox-active-file');
};

export const FileManagerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<File[]>(() => loadFilesFromStorage());
  const [activeFileId, setActiveFileIdState] = useState<string | null>(() => loadActiveFileId());

  const setActiveFileId = (id: string | null) => {
    setActiveFileIdState(id);
    saveActiveFileId(id);
  };

  const createFile = (name: string, content: string = '# New Python file\n\n') => {
    const fileName = name.endsWith('.py') ? name : `${name}.py`;
    const newFile: File = {
      id: `file-${Date.now()}`,
      name: fileName,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    saveFilesToStorage(updatedFiles);
    setActiveFileId(newFile.id);
    return newFile;
  };

  const updateFile = (id: string, content: string) => {
    const updatedFiles = files.map(file => 
      file.id === id 
        ? { ...file, content, updatedAt: new Date() }
        : file
    );
    setFiles(updatedFiles);
    saveFilesToStorage(updatedFiles);
  };

  const deleteFile = (id: string) => {
    const updatedFiles = files.filter(file => file.id !== id);
    setFiles(updatedFiles);
    saveFilesToStorage(updatedFiles);
    
    if (activeFileId === id) {
      setActiveFileId(updatedFiles.length > 0 ? updatedFiles[0].id : null);
    }
  };

  const getActiveFile = () => {
    return files.find(file => file.id === activeFileId) || null;
  };

  const getFileContent = (id: string): string | null => {
    const file = files.find(file => file.id === id);
    return file ? file.content : null;
  };

  useEffect(() => {
    console.log('FileManagerContext - activeFileId updated:', activeFileId);
  }, [activeFileId]);

  useEffect(() => {
    // Create a default file if there are no files
    if (files.length === 0) {
      createFile('example.py', `import requests
response = requests.get("https://jsonplaceholder.typicode.com/todos/1")
print(response.json())

# Try another request
response2 = requests.post("https://jsonplaceholder.typicode.com/posts", 
                         json={"title": "Test", "body": "Test body", "userId": 1})
print(f"Posted with status: {response2.status_code}")`);
    }
  }, []);

  const value = {
    files,
    activeFileId,
    setActiveFileId,
    createFile,
    updateFile,
    deleteFile,
    getFileContent,
    getActiveFile
  };

  return (
    <FileManagerContext.Provider value={value}>
      {children}
    </FileManagerContext.Provider>
  );
};

export const useFileManager = (): FileManagerContextType => {
  const context = useContext(FileManagerContext);
  if (context === undefined) {
    throw new Error('useFileManager must be used within a FileManagerProvider');
  }
  return context;
};