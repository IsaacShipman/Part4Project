import { createTheme } from '@mui/material/styles';
import { Theme, ThemeOptions } from '@mui/material/styles';

// Update your declaration module for background properties
declare module '@mui/material/styles' {
  interface TypeBackground {
    default: string;
    paper: string;
    paperDark: string;
    subtle: string;
    hover: string;
  }
  
  // Declare module augmentation for custom theme properties
  interface Theme {
    custom: {
      terminal: {
        background: string;
        foreground: string;
        fontFamily: string;
      };
      editor: {
        background: string;
      };
      codeBlock: {
        background: string;
        foreground: string;
      };
      requestPanel: {
        methodColors: {
          get: string;
          post: string;
          put: string;
          delete: string;
          patch: string;
          default: string;
        };
        statusColors: {
          success: string;
          redirect: string;
          clientError: string;
          serverError: string;
          default: string;
        };
      };
      documentation: {
        paramType: {
          background: string;
          color: string;
        };
        responseType: {
          object: {
            background: string;
            color: string;
          };
          other: {
            background: string;
            color: string;
          };
        };
      };
    };
  }

  // The rest of your interface declarations remain the same
  interface ThemeOptions {
    custom?: {
      terminal?: {
        background?: string;
        foreground?: string;
        fontFamily?: string;
      };
      editor?: {
        background?: string;
      };
      codeBlock?: {
        background?: string;
        foreground?: string;
      };
      requestPanel?: {
        methodColors?: {
          get?: string;
          post?: string;
          put?: string;
          delete?: string;
          patch?: string;
          default?: string;
        };
        statusColors?: {
          success?: string;
          redirect?: string;
          clientError?: string;
          serverError?: string;
          default?: string;
        };
      };
      documentation?: {
        paramType?: {
          background?: string;
          color?: string;
        };
        responseType?: {
          object?: {
            background?: string;
            color?: string;
          };
          other?: {
            background?: string;
            color?: string;
          };
        };
      };
    };
  }
}

// Base colors - changing these will affect the entire theme
const baseColors = {
  // Primary UI colors
  primary: '#90caf9', // Blue
  secondary: '#f48fb1', // Pink

  // Semantic colors
  success: '#66bb6a', // Green
  error: '#f44336', // Red
  warning: '#ff9800', // Orange
  info: '#2196f3', // Light Blue

  // Background colors
  background: {
    default: '#121212', // Main app background
    paper: '#1e1e1e', // Paper elements
    paperDark: '#0a0a0a', // Darker paper (codeblock)
    subtle: '#252525', // Subtle highlights
    hover: '#2a2a2a', 
  },

  // Text colors
  text: {
    primary: '#e0e0e0',
    secondary: '#a0a0a0',
  },

  // Dividers and borders
  divider: '#333333',

  // Darkened theme colors (for backgrounds)
  primaryDark: '#1e3a5f',
  secondaryDark: '#3e1f3e',
  successDark: '#1b4d3e',
  errorDark: '#c62828',
  warningDark: '#e65100',
  infoDark: '#1565c0',
};

// Create and export the theme
const globalTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: baseColors.primary,
      dark: baseColors.primaryDark,
    },
    secondary: {
      main: baseColors.secondary,
      dark: baseColors.secondaryDark,
    },
    background: {
      paper: baseColors.background.paper,
      default: baseColors.background.default,
    },
    text: {
      primary: baseColors.text.primary,
      secondary: baseColors.text.secondary,
    },
    divider: baseColors.divider,
    success: {
      main: baseColors.success,
      light: baseColors.successDark,
    },
    error: {
      main: baseColors.error,
      light: baseColors.errorDark,
    },
    warning: {
      main: baseColors.warning,
      light: baseColors.warningDark,
    },
    info: {
      main: baseColors.info,
      light: baseColors.infoDark,
    },
    action: {
      active: '#ffffff',
      hover: baseColors.background.hover,
      selected: '#3a3a3a',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    subtitle1: {
      fontSize: '1rem',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.875rem',
    },
    body2: {
      fontSize: '0.8rem',
    },
    caption: {
      fontSize: '0.75rem',
      color: baseColors.text.secondary,
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: baseColors.background.paper,
          boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: baseColors.background.paper,
          color: baseColors.text.primary,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: baseColors.divider,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: baseColors.background.hover,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${baseColors.divider}`,
          padding: '8px 16px',
        },
        head: {
          fontWeight: 'bold',
          backgroundColor: baseColors.background.subtle,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: baseColors.background.subtle },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: baseColors.background.paper,
          border: `1px solid ${baseColors.divider}`,
          '&:before': {
            display: 'none',
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          backgroundColor: baseColors.background.subtle,
          minHeight: '36px',
          '& .MuiAccordionSummary-content': {
            margin: '6px 0',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          height: '24px',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: '36px',
        },
        indicator: {
          backgroundColor: baseColors.primary,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: '36px',
          padding: '0',
          '&.Mui-selected': {
            color: baseColors.primary,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: baseColors.text.secondary,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
    },
  },
  // Custom properties for our application - now using the base colors
  custom: {
    terminal: {
      background: baseColors.background.paper,
      foreground: baseColors.text.primary,
      fontFamily: '"Cascadia Code", "Fira Code", "Roboto Mono", monospace',
    },
    editor: {
      background: baseColors.background.paper,
    },
    codeBlock: {
      background: baseColors.background.paperDark,
      foreground: baseColors.text.primary,
    },
    requestPanel: {
      methodColors: {
        get: baseColors.info,
        post: baseColors.success,
        put: baseColors.warning,
        delete: baseColors.error,
        patch: baseColors.secondary,
        default: '#757575',
      },
      statusColors: {
        success: baseColors.success,
        redirect: baseColors.warning,
        clientError: baseColors.error,
        serverError: baseColors.secondary,
        default: '#757575',
      },
    },
    documentation: {
      paramType: {
        background: baseColors.successDark,
        color: baseColors.success,
      },
      responseType: {
        object: {
          background: baseColors.primaryDark,
          color: baseColors.primary,
        },
        other: {
          background: baseColors.secondaryDark,
          color: baseColors.secondary,
        },
      },
    },
  },
});

export default globalTheme;