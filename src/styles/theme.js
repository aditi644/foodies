// Design System for FoodHub App
export const theme = {
  // Typography
  fonts: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    secondary: "'Plus Jakarta Sans', 'Outfit', sans-serif",
    heading: "'Inter', sans-serif",
  },
  
  fontWeights: {
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
    extraBold: 800,
  },

  fontSizes: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
  },

  // Color Palette - "The Appetite Stimulator"
  colors: {
    // Primary - Appetite Stimulating
    primary: '#E23744', // Cinnabar Red
    primaryDark: '#C42A35',
    primaryLight: '#FF5A6B',
    
    // Secondary - Action/Healthy
    secondary: '#27AE60', // Leaf Green
    secondaryDark: '#1E8E4F',
    secondaryLight: '#34D178',
    
    // Accent - Deep Orange
    accent: '#F24E1E',
    accentDark: '#D43A0E',
    accentLight: '#FF6B3D',
    
    // Surface Colors
    surface: '#FFFFFF',
    surfaceSecondary: '#F8F8F8',
    surfaceTertiary: '#F0F0F0',
    
    // Text Colors
    textPrimary: '#1C1C1C', // Dark Charcoal
    textSecondary: '#686B78', // Slate Grey
    textTertiary: '#9B9B9B',
    textInverse: '#FFFFFF',
    
    // Status Colors
    success: '#27AE60',
    warning: '#F39C12',
    error: '#E23744',
    info: '#3498DB',
    
    // Borders & Dividers
    border: '#E5E5E5',
    borderLight: '#F0F0F0',
    divider: '#E8E8E8',
  },

  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },

  // Border Radius - "Food-Friendly"
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
    card: '0 4px 20px rgba(226, 55, 68, 0.08)',
  },

  // Transitions
  transitions: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
};

// Dark mode colors (for future implementation)
export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    surface: '#1C1C1C',
    surfaceSecondary: '#252525',
    surfaceTertiary: '#2C2C2C',
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#808080',
    border: '#3A3A3A',
    borderLight: '#2A2A2A',
    primary: '#FF6B7A', // Softer coral for dark mode
  },
};

