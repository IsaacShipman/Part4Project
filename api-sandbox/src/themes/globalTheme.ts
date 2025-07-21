import { createTheme, ThemeOptions } from '@mui/material/styles';

// Type declarations for our custom theme properties
declare module '@mui/material/styles' {
  interface TypeBackground {
    default: string;
    paper: string;
    paperDark: string;
    subtle: string;
    hover: string;
    glass: string;
    glassCard: string;
  }
  
  interface Theme {
    custom: {
      colors: {
        primary: string;
        secondary: string;
        accent: string;
        success: string;
        warning: string;
        error: string;
        info: string;
        text: {
          primary: string;
          secondary: string;
          muted: string;
        };
        border: {
          primary: string;
          secondary: string;
          subtle: string;
        };
        background: {
          primary: string;
          secondary: string;
          tertiary: string;
          glass: string;
          glassCard: string;
          gradient: string;
        };
      };
      glass: {
        background: string;
        backdropFilter: string;
        border: string;
        borderRadius: string;
        boxShadow: string;
      };
      glassCard: {
        background: string;
        backdropFilter: string;
        border: string;
        borderRadius: string;
        boxShadow: string;
      };
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

  interface ThemeOptions {
    custom?: {
      colors?: {
        primary?: string;
        secondary?: string;
        accent?: string;
        success?: string;
        warning?: string;
        error?: string;
        info?: string;
        text?: {
          primary?: string;
          secondary?: string;
          muted?: string;
        };
        border?: {
          primary?: string;
          secondary?: string;
          subtle?: string;
        };
        background?: {
          primary?: string;
          secondary?: string;
          tertiary?: string;
          glass?: string;
          glassCard?: string;
          gradient?: string;
        };
      };
      glass?: {
        background?: string;
        backdropFilter?: string;
        border?: string;
        borderRadius?: string;
        boxShadow?: string;
      };
      glassCard?: {
        background?: string;
        backdropFilter?: string;
        border?: string;
        borderRadius?: string;
        boxShadow?: string;
      };
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

// Color palette definitions for both light and dark modes
const colorPalettes = {
  dark: {
    primary: '#60a5fa', // Blue
    secondary: '#a855f7', // Purple
    accent: '#10b981', // Green
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
      muted: '#94a3b8',
    },
    border: {
      primary: 'rgba(148, 163, 184, 0.2)',
      secondary: 'rgba(148, 163, 184, 0.1)',
      subtle: 'rgba(148, 163, 184, 0.05)',
    },
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
      glass: 'rgba(15, 23, 42, 0.7)',
      glassCard: 'rgba(30, 41, 59, 0.6)',
      gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    },
  },
  light: {
    primary: '#2563eb', // Blue
    secondary: '#7c3aed', // Purple
    accent: '#059669', // Green
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
    info: '#2563eb',
    text: {
      primary: '#1e293b',
      secondary: '#475569',
      muted: '#64748b',
    },
    border: {
      primary: 'rgba(71, 85, 105, 0.2)',
      secondary: 'rgba(71, 85, 105, 0.1)',
      subtle: 'rgba(71, 85, 105, 0.05)',
    },
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#e2e8f0',
      glass: 'rgba(255, 255, 255, 0.8)',
      glassCard: 'rgba(248, 250, 252, 0.8)',
      gradient: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
    },
  },
};

// Glass effect styles
const glassStyles = {
  dark: {
    background: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  light: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(71, 85, 105, 0.1)',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
};

const glassCardStyles = {
  dark: {
    background: 'rgba(30, 41, 59, 0.6)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
  },
  light: {
    background: 'rgba(248, 250, 252, 0.8)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(71, 85, 105, 0.1)',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  },
};

// Function to create theme based on mode
export const createGlobalTheme = (mode: 'light' | 'dark' = 'dark'): ThemeOptions => {
  const colors = colorPalettes[mode];
  const glass = glassStyles[mode];
  const glassCard = glassCardStyles[mode];

  return {
    palette: {
      mode,
      primary: {
        main: colors.primary,
        light: mode === 'dark' ? '#93c5fd' : '#3b82f6',
        dark: mode === 'dark' ? '#1d4ed8' : '#1e40af',
      },
      secondary: {
        main: colors.secondary,
        light: mode === 'dark' ? '#c084fc' : '#8b5cf6',
        dark: mode === 'dark' ? '#7c3aed' : '#6d28d9',
      },
      background: {
        default: colors.background.primary,
        paper: colors.background.secondary,
      },
      text: {
        primary: colors.text.primary,
        secondary: colors.text.secondary,
      },
      divider: colors.border.primary,
      success: {
        main: colors.success,
        light: mode === 'dark' ? '#4ade80' : '#22c55e',
        dark: mode === 'dark' ? '#16a34a' : '#15803d',
      },
      error: {
        main: colors.error,
        light: mode === 'dark' ? '#f87171' : '#ef4444',
        dark: mode === 'dark' ? '#dc2626' : '#b91c1c',
      },
      warning: {
        main: colors.warning,
        light: mode === 'dark' ? '#fbbf24' : '#f59e0b',
        dark: mode === 'dark' ? '#d97706' : '#d97706',
      },
      info: {
        main: colors.info,
        light: mode === 'dark' ? '#60a5fa' : '#3b82f6',
        dark: mode === 'dark' ? '#2563eb' : '#1d4ed8',
      },
      action: {
        active: colors.text.primary,
        hover: colors.background.tertiary,
        selected: colors.background.tertiary,
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        color: colors.text.primary,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        color: colors.text.primary,
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
        color: colors.text.primary,
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 600,
        color: colors.text.primary,
      },
      h5: {
        fontSize: '1.125rem',
        fontWeight: 600,
        color: colors.text.primary,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        color: colors.text.primary,
      },
      subtitle1: {
        fontSize: '1rem',
        color: colors.text.secondary,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: colors.text.secondary,
      },
      body1: {
        fontSize: '0.875rem',
        color: colors.text.primary,
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.8rem',
        color: colors.text.secondary,
        lineHeight: 1.5,
      },
      caption: {
        fontSize: '0.75rem',
        color: colors.text.muted,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: colors.background.secondary,
            color: colors.text.primary,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: colors.border.primary,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            // Remove global hover effect to allow components to define their own
            padding: 0,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            // Remove default Material-UI hover effects to allow custom styling
            '&:hover': {
              backgroundColor: 'transparent',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 8,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${colors.border.primary}`,
            padding: '12px 16px',
          },
          head: {
            fontWeight: 600,
            backgroundColor: colors.background.tertiary,
            color: colors.text.primary,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': { 
              backgroundColor: colors.background.tertiary,
            },
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            backgroundColor: colors.background.secondary,
            border: `1px solid ${colors.border.primary}`,
            '&:before': {
              display: 'none',
            },
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            backgroundColor: colors.background.tertiary,
            minHeight: '48px',
            '& .MuiAccordionSummary-content': {
              margin: '8px 0',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            height: '24px',
            fontWeight: 500,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: '48px',
          },
          indicator: {
            backgroundColor: colors.primary,
            height: '3px',
            borderRadius: '2px',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: '48px',
            padding: '0 16px',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            color: colors.text.secondary,
            '&.Mui-selected': {
              color: colors.primary,
              fontWeight: 600,
            },
            '&:hover': {
              color: colors.primary,
              backgroundColor: `${colors.primary}08`,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: colors.text.secondary,
            '&:hover': {
              backgroundColor: colors.background.tertiary,
            },
          },
        },
      },
    },
    custom: {
      colors,
      glass,
      glassCard,
      terminal: {
        background: colors.background.secondary,
        foreground: colors.text.primary,
        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
      },
      editor: {
        background: colors.background.secondary,
      },
      codeBlock: {
        background: mode === 'dark' ? '#0f172a' : '#f8fafc',
        foreground: colors.text.primary,
      },
      requestPanel: {
        methodColors: {
          get: colors.info,
          post: colors.success,
          put: colors.warning,
          delete: colors.error,
          patch: colors.secondary,
          default: colors.text.muted,
        },
        statusColors: {
          success: colors.success,
          redirect: colors.warning,
          clientError: colors.error,
          serverError: colors.secondary,
          default: colors.text.muted,
        },
      },
      documentation: {
        paramType: {
          background: mode === 'dark' ? '#065f46' : '#d1fae5',
          color: colors.success,
        },
        responseType: {
          object: {
            background: mode === 'dark' ? '#1e3a8a' : '#dbeafe',
            color: colors.info,
          },
          other: {
            background: mode === 'dark' ? '#581c87' : '#f3e8ff',
            color: colors.secondary,
          },
        },
      },
    },
  };
};

// Create and export the default dark theme
const globalTheme = createTheme(createGlobalTheme('dark'));

export default globalTheme;