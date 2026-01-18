import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    loading?: boolean;
    disabled?: boolean;
    style?: any;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    icon,
}) => {
    const buttonStyles = [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        (disabled || loading) && styles.disabled,
        style,
    ];

    const textStyle = [
        styles.text,
        variant === 'primary' && styles.textPrimary,
        variant === 'secondary' && styles.textSecondary,
        variant === 'ghost' && styles.textGhost,
        variant === 'danger' && styles.textDanger,
    ];

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={buttonStyles}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'ghost' ? colors.primary : 'white'} />
            ) : (
                <>
                    {icon && <View style={styles.icon}>{icon}</View>}
                    <Text style={textStyle}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        height: 48,
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
    },
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.borderLight,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    danger: {
        backgroundColor: colors.error,
    },
    disabled: {
        opacity: 0.6,
    },
    text: {
        fontSize: typography.sizes.base,
    },
    textPrimary: {
        color: colors.text,
        fontWeight: typography.weights.bold,
    },
    textSecondary: {
        color: colors.text,
        fontWeight: typography.weights.semibold,
    },
    textGhost: {
        color: colors.primary,
        fontWeight: typography.weights.semibold,
    },
    textDanger: {
        color: colors.text,
        fontWeight: typography.weights.bold,
    },
    icon: {
        marginRight: spacing.sm,
    },
});
