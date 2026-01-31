export const colors = {
    primary: '#FF9500',
    primaryLight: '#FFB347',
    primaryDark: '#D47D00',
    accent: '#5856D6', // Royal Purple
    accentLight: '#AF52DE', // Pinkish Purple
    background: '#000000',
    surface: '#121212',
    surfaceHighlight: '#1C1C1E',
    surfaceElevated: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#EBEBF599', // 60% opacity white
    textTertiary: '#EBEBF54D', // 30% opacity white
    textDisabled: '#48484A',
    border: '#2C2C2E',
    borderLight: '#3A3A3C',
    error: '#FF453A',
    success: '#32D74B',
    warning: '#FFD60A',
    info: '#64D2FF',
    gold: '#FFD700',
};

export const gradients = {
    primary: ['#FF9500', '#FF5E00'],
    premium: ['#5856D6', '#AF52DE'],
    dark: ['#1C1C1E', '#000000'],
    surface: ['#2C2C2E', '#1C1C1E'],
    success: ['#32D74B', '#248A3D'],
};

export const spacing = {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
};

export const borderRadius = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
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
        '3xl': 32,
        '4xl': 48,
        '5xl': 64,
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
    letterSpacing: {
        tight: -0.5,
        normal: 0,
        wide: 0.5,
        wider: 1,
        widest: 2,
    }
};
