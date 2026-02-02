import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../services/supabase';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { RootStackParamList } from '../types';

type PasswordResetScreenRouteProp = RouteProp<RootStackParamList, 'PasswordReset'>;

const resetPasswordSchema = Yup.object({
    password: Yup.string().min(8, 'Min 8 characters').required('Password required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm password required'),
});

export const PasswordResetScreen = () => {
    const route = useRoute<PasswordResetScreenRouteProp>();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async (values: { password: string }) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: values.password
            });

            if (error) throw error;

            Alert.alert(
                'Success',
                'Your password has been reset successfully! You can now log in with your new password.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Login' as never)
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LinearGradient
                colors={['rgba(255, 149, 0, 0.1)', 'transparent']}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="lock-closed" size={40} color={colors.primary} />
                    </View>
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>Enter your new password</Text>
                </View>

                <Formik
                    initialValues={{ password: '', confirmPassword: '' }}
                    validationSchema={resetPasswordSchema}
                    onSubmit={handleResetPassword}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                        <View>
                            <Input
                                label="New Password"
                                placeholder="••••••••"
                                isPassword={true}
                                onChangeText={handleChange('password')}
                                onBlur={handleBlur('password')}
                                value={values.password}
                                error={touched.password ? errors.password : undefined}
                            />

                            <Text style={styles.helperText}>
                                Password must be at least 8 characters
                            </Text>

                            <Input
                                label="Confirm New Password"
                                placeholder="••••••••"
                                isPassword={true}
                                onChangeText={handleChange('confirmPassword')}
                                onBlur={handleBlur('confirmPassword')}
                                value={values.confirmPassword}
                                error={touched.confirmPassword ? errors.confirmPassword : undefined}
                            />

                            <Button
                                title="Reset Password"
                                onPress={handleSubmit as any}
                                loading={loading}
                                style={styles.submitButton}
                            />

                            <Button
                                title="Back to Login"
                                variant="ghost"
                                onPress={() => navigation.navigate('Login' as never)}
                                style={styles.backButton}
                            />
                        </View>
                    )}
                </Formik>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        backgroundColor: colors.surfaceHighlight,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    title: {
        fontSize: typography.sizes['2xl'],
        fontFamily: typography.fonts.heading,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        color: colors.textDisabled,
        fontSize: typography.sizes.base,
    },
    submitButton: {
        marginTop: spacing.md,
    },
    backButton: {
        marginTop: spacing.sm,
    },
    helperText: {
        color: colors.textSecondary,
        fontSize: typography.sizes.xs,
        marginTop: -spacing.xs,
        marginBottom: spacing.md,
        marginLeft: spacing.xs,
    },
});
