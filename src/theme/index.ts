export const colors = {
    primary: '#FF9500',
    primaryLight: '#FFB347',
    background: '#000000',
    surface: '#111111',
    surfaceHighlight: '#1A1A1A',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textDisabled: '#999999',
    border: '#222222',
    borderLight: '#333333',
    error: '#FF3B30',
    success: '#34C759',
    info: '#00ADEF',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const typography = {
    sizes: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 48, // Added for hero titles
    },
    weights: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
    fonts: {
        heading: 'BebasNeue_400Regular',
        body: 'Inter_400Regular',
        medium: 'Inter_500Medium',
        bold: 'Inter_700Bold',
    },
};
