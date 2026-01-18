import React, { useState } from 'react';
import { Text, TextInput, View, TouchableOpacity, TextInputProps, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    isPassword = false,
    style,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={[
                styles.inputContainer,
                error && styles.inputError,
                isFocused && styles.inputFocused,
            ]}>
                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={colors.textDisabled}
                    secureTextEntry={isPassword && !showPassword}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                {isPassword && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                            name={showPassword ? "eye-off" : "eye"}
                            size={20}
                            color={colors.textDisabled}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
        width: '100%',
    },
    label: {
        color: colors.textSecondary,
        marginBottom: 6,
        marginLeft: 4,
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceHighlight,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.borderLight,
        paddingHorizontal: spacing.md,
        height: 48,
    },
    inputError: {
        borderColor: colors.error,
    },
    inputFocused: {
        borderColor: colors.primary,
    },
    input: {
        flex: 1,
        color: colors.text,
        fontSize: typography.sizes.base,
        height: '100%',
    },
    errorText: {
        color: colors.error,
        fontSize: typography.sizes.xs,
        marginTop: 4,
        marginLeft: 4,
    },
});
