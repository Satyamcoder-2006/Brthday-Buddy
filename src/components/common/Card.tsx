import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';

export const Card: React.FC<ViewProps> = ({ children, style, ...props }) => {
    return (
        <View style={[styles.card, style]} {...props}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
});
