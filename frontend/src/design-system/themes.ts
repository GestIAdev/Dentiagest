/**
 * 🎨 DENTIAGEST DESIGN SYSTEM - THEMES
 * By PunkClaude & Radwulf - November 9, 2025
 * 
 * 3 THEMES CONFIGURABLES:
 * - Classic: Profesional blanco/gris (conservador)
 * - Dark: Elegante negro (moderno)
 * - Cyberpunk Medical: Tech + Medical (DEFAULT - balanceado)
 */

export type ThemeType = 'classic' | 'dark' | 'cyberpunk-medical';

export interface ThemeColors {
  // Primary colors
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string; // Main
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  // Secondary colors
  secondary: {
    50: string;
    100: string;
    500: string;
    600: string;
    900: string;
  };
  
  // Status colors
  success: {
    light: string;
    main: string;
    dark: string;
  };
  warning: {
    light: string;
    main: string;
    dark: string;
  };
  error: {
    light: string;
    main: string;
    dark: string;
  };
  info: {
    light: string;
    main: string;
    dark: string;
  };
  
  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    paper: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    hint: string;
  };
  
  // Border colors
  border: {
    light: string;
    main: string;
    dark: string;
  };
}

export interface Theme {
  id: ThemeType;
  name: string;
  description: string;
  colors: ThemeColors;
  fonts: {
    primary: string[];
    mono: string[];
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// ========================================
// 🎨 THEME 1: CLASSIC (Profesional Blanco)
// ========================================
export const classicTheme: Theme = {
  id: 'classic',
  name: 'Classic',
  description: 'Tema clásico profesional con fondo blanco',
  
  colors: {
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6', // Azul corporativo
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
    },
    
    secondary: {
      50: '#F5F3FF',
      100: '#EDE9FE',
      500: '#8B5CF6',
      600: '#7C3AED',
      900: '#581C87',
    },
    
    success: {
      light: '#34D399',
      main: '#10B981',
      dark: '#059669',
    },
    warning: {
      light: '#FCD34D',
      main: '#F59E0B',
      dark: '#D97706',
    },
    error: {
      light: '#F87171',
      main: '#EF4444',
      dark: '#DC2626',
    },
    info: {
      light: '#60A5FA',
      main: '#3B82F6',
      dark: '#2563EB',
    },
    
    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6',
      paper: '#FFFFFF',
    },
    
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
      hint: '#D1D5DB',
    },
    
    border: {
      light: '#F3F4F6',
      main: '#E5E7EB',
      dark: '#D1D5DB',
    },
  },
  
  fonts: {
    primary: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
    mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
};

// ========================================
// 🌑 THEME 2: DARK (Elegante Negro)
// ========================================
export const darkTheme: Theme = {
  id: 'dark',
  name: 'Dark',
  description: 'Tema oscuro elegante y moderno',
  
  colors: {
    primary: {
      50: '#F0F9FF',
      100: '#E0F2FE',
      200: '#BAE6FD',
      300: '#7DD3FC',
      400: '#38BDF8',
      500: '#0EA5E9', // Sky blue
      600: '#0284C7',
      700: '#0369A1',
      800: '#075985',
      900: '#0C4A6E',
    },
    
    secondary: {
      50: '#FAF5FF',
      100: '#F3E8FF',
      500: '#A78BFA',
      600: '#8B5CF6',
      900: '#581C87',
    },
    
    success: {
      light: '#34D399',
      main: '#10B981',
      dark: '#059669',
    },
    warning: {
      light: '#FCD34D',
      main: '#F59E0B',
      dark: '#D97706',
    },
    error: {
      light: '#F87171',
      main: '#EF4444',
      dark: '#DC2626',
    },
    info: {
      light: '#60A5FA',
      main: '#3B82F6',
      dark: '#2563EB',
    },
    
    background: {
      primary: '#0F172A', // Slate-900
      secondary: '#1E293B', // Slate-800
      tertiary: '#334155', // Slate-700
      paper: '#1E293B',
    },
    
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
      disabled: '#64748B',
      hint: '#475569',
    },
    
    border: {
      light: 'rgba(255, 255, 255, 0.05)',
      main: 'rgba(255, 255, 255, 0.1)',
      dark: 'rgba(255, 255, 255, 0.2)',
    },
  },
  
  fonts: {
    primary: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
  },
  
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
};

// ========================================
// 🤖 THEME 3: CYBERPUNK MEDICAL (DEFAULT - BALANCEADO)
// ========================================
export const cyberpunkMedicalTheme: Theme = {
  id: 'cyberpunk-medical',
  name: 'Cyberpunk Medical',
  description: 'Tecnología moderna + Profesionalismo médico (Default)',
  
  colors: {
    primary: {
      50: '#ECFEFF',
      100: '#CFFAFE',
      200: '#A5F3FC',
      300: '#67E8F9',
      400: '#22D3EE',
      500: '#06B6D4', // Cyan más suave (NO el #00FFFF agresivo)
      600: '#0891B2',
      700: '#0E7490',
      800: '#155E75',
      900: '#164E63',
    },
    
    secondary: {
      50: '#FAF5FF',
      100: '#F3E8FF',
      500: '#A78BFA', // Púrpura más suave
      600: '#8B5CF6',
      900: '#581C87',
    },
    
    success: {
      light: '#6EE7B7',
      main: '#10B981',
      dark: '#059669',
    },
    warning: {
      light: '#FCD34D',
      main: '#F59E0B',
      dark: '#D97706',
    },
    error: {
      light: '#FCA5A5',
      main: '#EF4444',
      dark: '#DC2626',
    },
    info: {
      light: '#93C5FD',
      main: '#3B82F6',
      dark: '#2563EB',
    },
    
    background: {
      primary: '#0F172A', // Slate-900 (NO negro puro)
      secondary: '#1E293B', // Slate-800
      tertiary: '#334155', // Slate-700
      paper: 'rgba(30, 41, 59, 0.8)', // Transparente sutil
    },
    
    text: {
      primary: '#F1F5F9', // Slate-100 (suave)
      secondary: '#CBD5E1', // Slate-300
      disabled: '#94A3B8', // Slate-400
      hint: '#64748B', // Slate-500
    },
    
    border: {
      light: 'rgba(6, 182, 212, 0.1)', // Cyan muy sutil
      main: 'rgba(6, 182, 212, 0.2)', // Cyan sutil
      dark: 'rgba(6, 182, 212, 0.3)', // Cyan visible
    },
  },
  
  fonts: {
    primary: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(6, 182, 212, 0.15)', // Sutil cyan glow
    lg: '0 10px 15px -3px rgba(6, 182, 212, 0.2)', // Cyan glow medio
    xl: '0 20px 25px -5px rgba(6, 182, 212, 0.25)', // Cyan glow suave
  },
  
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
};

// ========================================
// 🎯 THEME MAP & DEFAULT
// ========================================
export const themes: Record<ThemeType, Theme> = {
  'classic': classicTheme,
  'dark': darkTheme,
  'cyberpunk-medical': cyberpunkMedicalTheme,
};

export const DEFAULT_THEME: ThemeType = 'cyberpunk-medical';

// ========================================
// 🛠️ THEME UTILITIES
// ========================================
export const getTheme = (themeId: ThemeType): Theme => {
  return themes[themeId] || themes[DEFAULT_THEME];
};

export const getThemeList = (): Theme[] => {
  return Object.values(themes);
};
