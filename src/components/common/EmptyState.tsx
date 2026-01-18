import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface EmptyStateProps {
    message: string;
    icon?: keyof typeof Ionicons.glyphMap;
    onAction?: () => void;
    actionLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    message,
    icon = 'gift-outline',
    onAction,
    actionLabel
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={48} color={colors.primary} />
            </View>
            <Text style={styles.message}>{message}</Text>
            {onAction && actionLabel && (
                <Button title={actionLabel} onPress={onAction} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    iconContainer: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.lg,
    },
    message: {
        color: colors.text,
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
});
