/**
 * App Theme Configuration
 */

export const theme = {
  colors: {
    primary: '#6366F1',
    secondary: '#F59E0B',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    
    background: '#F8FAFC',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    onBackground: '#1E293B',
    onSurface: '#334155',
    outline: '#E2E8F0',
    disabled: '#94A3B8',
    
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      light: '#9CA3AF',
      inverse: '#FFFFFF',
    },
    
    border: '#E5E7EB',
    divider: '#F3F4F6',
    
    // Social features
    achievement: {
      common: '#6B7280',
      rare: '#3B82F6',
      epic: '#8B5CF6',
      legendary: '#F59E0B',
    },
    
    // Learning states
    learning: {
      new: '#06B6D4',
      learning: '#F59E0B',
      reviewing: '#8B5CF6',
      mastered: '#10B981',
    }
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 999,
  },
  
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal' as const,
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal' as const,
      lineHeight: 20,
    },
    small: {
      fontSize: 12,
      fontWeight: 'normal' as const,
      lineHeight: 16,
    },
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};

export type Theme = typeof theme;