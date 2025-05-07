import { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Typography,
  Box,
  Chip,
  CircularProgress
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Define types for the data structure
interface Endpoint {
  id: number;
  method: string;
  path: string;
  summary: string;
  category: string;
}

interface FolderStructure {
  isEndpoint: boolean;
  fullPath: string;
  children: Record<string, FolderStructure>;
  endpoints: Endpoint[];
}

interface FolderItemProps {
  name: string;
  structure: FolderStructure;
  onSelectEndpoint: (endpointId: number) => void;
  selectedEndpointId: number | null;
}

interface APIFolderStructureProps {
  onSelectEndpoint: (endpointId: number) => void;
}

export default function APIFolderStructure({ onSelectEndpoint }: APIFolderStructureProps) {
  const [data, setData] = useState<Record<string, Endpoint[]> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [selectedEndpointId, setSelectedEndpointId] = useState<number | null>(null);

  // Predefined categories
  const predefinedCategories = ["repositories", "contents", "branches", "commits", "pull_requests", "issues"];

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8000/api-docs/structure"); // Adjust the URL if needed
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Record<string, Endpoint[]> = await response.json();
        setData(data);
        setLoading(false);
  
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  const handleEndpointClick = (endpointId: number) => {
    setSelectedEndpointId(endpointId);
    onSelectEndpoint(endpointId); // Notify parent component
  };

  // Function to get method color based on HTTP method
  const getMethodColor = (method: string): { color: string; backgroundColor: string } => {
    switch (method) {
      case "GET":
        return { color: "primary", backgroundColor: "primary.dark" };
      case "POST":
        return { color: "success", backgroundColor: "success.light" };
      case "PUT":
        return { color: "warning", backgroundColor: "warning.light" };
      case "PATCH":
        return { color: "secondary", backgroundColor: "secondary.dark" };
      case "DELETE":
        return { color: "error", backgroundColor: "error.light" };
      default:
        return { color: "default", backgroundColor: "grey.300" };
    }
  };

  // Organize endpoints into predefined categories
  const organizeEndpoints = () => {
    if (!data) return {};
    
    // Initialize categories with empty arrays
    const categories: Record<string, Endpoint[]> = {};
    predefinedCategories.forEach(category => {
      categories[category] = [];
    });
    
    // Process all endpoints from data
    const allEndpoints = [...(data.repos || []), ...(data.user || [])];
    
    allEndpoints.forEach(endpoint => {
      // Check if the endpoint's category exists in our predefined categories
      if (predefinedCategories.includes(endpoint.category)) {
        categories[endpoint.category].push(endpoint);
      }
    });
    
    return categories;
  };

  const categoryData = organizeEndpoints();

  const FolderItem: React.FC<FolderItemProps> = ({ name, structure, onSelectEndpoint, selectedEndpointId }) => {
    const isExpanded = expandedFolders[name] || false;
    const hasEndpoints = structure.endpoints && structure.endpoints.length > 0;

    return (
      <>
        <ListItem 
          component="div"
          onClick={() => toggleFolder(name)}
          sx={{ 
            borderRadius: 1,
            '&:hover': { bgcolor: 'action.hover' },
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <ListItemIcon 
            sx={{
              display: 'flex',
              flexGrow: 0,
            }}
          >
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
           
          </ListItemIcon>
          <ListItemText 
            primary={<Typography variant="body1" fontWeight="medium">{name}</Typography>}
            secondary={hasEndpoints ? `${structure.endpoints.length} endpoints` : 'No endpoints'}
            sx={{
              flexGrow: 1,
            }}
          />
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              alignItems: 'center', 
              flexGrow: 0,
              height: '100%',
              cursor: 'pointer',
            }}
          >
            
          </Box>
        </ListItem>
        
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {hasEndpoints && structure.endpoints.map((endpoint) => {
              const methodStyle = getMethodColor(endpoint.method);
              const isSelected = selectedEndpointId === endpoint.id;
              
              return (
                <ListItem 
                  key={endpoint.id}
                  component="div"
                  onClick={() => onSelectEndpoint(endpoint.id)}
                  sx={{ 
                    pl: 4,
                    borderRadius: 1,
                    bgcolor: isSelected ? 'action.selected' : 'transparent',
                    '&:hover': { bgcolor: isSelected ? 'action.selected' : 'action.hover' },
                    cursor: 'pointer'
                  }}
                >
                  <Box display="flex" alignItems="center" width="100%">
                    <Chip 
                      label={endpoint.method}
                      size="small" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: methodStyle.color,
                        bgcolor: methodStyle.backgroundColor,
                        mr: 1,
                        fontFamily: 'monospace'
                      }} 
                    />
                    <Typography variant="body2">{endpoint.summary}</Typography>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        </Collapse>
      </>
    );
  };

  // Create folder structure for each predefined category
  const createFolderStructures = () => {
    const folderStructures: Record<string, FolderStructure> = {};
    
    // Create a folder for each predefined category, even if there are no endpoints for it
    predefinedCategories.forEach(category => {
      folderStructures[category] = {
        isEndpoint: false,
        fullPath: `/${category}`,
        children: {},
        endpoints: categoryData[category] || []
      };
    });
    
    return folderStructures;
  };

  // Only create folder structures if data has been loaded
  const folderStructures = data ? createFolderStructures() : {};

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      height="100%" 
      width="100%"
      overflow="auto"
    >
      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Typography color="error" p={2}>Error loading API data: {error.message}</Typography>
      )}
      
      {!loading && !error && data && (
        <List sx={{ width: '100%', height: '100%' }}>
          {predefinedCategories.map((category) => (
            <FolderItem 
              key={category}
              name={category}
              structure={folderStructures[category]}
              onSelectEndpoint={handleEndpointClick}
              selectedEndpointId={selectedEndpointId}
            />
          ))}
        </List>
      )}
    </Box>
  );
}