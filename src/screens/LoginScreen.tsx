import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../services/supabase';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';

const loginSchema = Yup.object({
    email: Yup.string().email('Invalid email').required('Email required'),
    password: Yup.string().min(8, 'Min 8 characters').required('Password required'),
});

const signupSchema = Yup.object({
    fullName: Yup.string().optional(),
    email: Yup.string().email('Invalid email').required('Email required'),
    password: Yup.string().min(8, 'Min 8 characters').required('Password required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm password required'),
});

export const LoginScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyEmail, setVerifyEmail] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

    const handleAuth = async (values: any) => {
        setLoading(true);
        const { email, password, fullName } = values;

        console.log('Attempting auth:', isLogin ? 'Login' : 'SignUp', email);

        try {
            if (!supabase) {
                throw new Error('Supabase client is not initialized. Check configuration.');
            }

            if (isLogin) {
                const { error, data } = await supabase.auth.signInWithPassword({ email, password });
                console.log('Login result:', { error, data });
                if (error) throw error;
            } else {
                console.log('Signing up...');
                const { error, data } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: fullName || email.split('@')[0],
                        },
                    },
                });
                console.log('Signup result:', { error, user: data?.user, session: !!data?.session });

                if (error) throw error;

                // Switch to verification mode
                setVerifyEmail(email);
                setIsVerifying(true);
                Alert.alert('Verification Code Sent', 'Please check your email for a security code.');
            }
        } catch (error: any) {
            console.error('Auth Error:', error);
            Alert.alert('Error', error.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (token: string) => {
        // Check lockout
        if (lockoutUntil && Date.now() < lockoutUntil) {
            const minsLeft = Math.ceil((lockoutUntil - Date.now()) / 60000);
            Alert.alert('Locked Out', `Please wait ${minsLeft} minutes before trying again.`);
            return;
        }

        setLoading(true);
        try {
            const { error, data } = await supabase.auth.verifyOtp({
                email: verifyEmail,
                token,
                type: 'signup',
            });

            if (error) {
                const nextAttempts = attempts + 1;
                setAttempts(nextAttempts);

                if (nextAttempts >= 2) {
                    const lockoutTime = Date.now() + 10 * 60 * 1000; // 10 minutes
                    setLockoutUntil(lockoutTime);
                    Alert.alert('Security Lockout', 'Too many failed attempts. Please wait 10 minutes.');
                } else {
                    Alert.alert('Incorrect Code', `That code didn't match. You have ${2 - nextAttempts} attempt left.`);
                }
                throw error;
            }

            Alert.alert('Success', 'Email verified successfully! You can now log in.');
            setIsVerifying(false);
            setIsLogin(true);
            setAttempts(0);
            setLockoutUntil(null);
        } catch (e: any) {
            console.log('Verification Error:', e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: verifyEmail,
            });
            if (error) throw error;
            Alert.alert('Code Resent', 'A new security code has been sent to your email.');
            setAttempts(0); // Reset attempts on resend
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (email: string) => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email first');
            return;
        }
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) Alert.alert('Error', error.message);
        else Alert.alert('Success', 'Password reset email sent');
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
                    <View style={styles.logoContainer}>
                        <Ionicons name="gift" size={40} color={colors.primary} />
                    </View>
                    <Text style={styles.title}>Birthday Buddy</Text>
                    <Text style={styles.subtitle}>Never Miss a Birthday Again</Text>
                </View>

                <View style={styles.tabContainer}>
                    <Button
                        title="Login"
                        onPress={() => {
                            setIsLogin(true);
                            setIsVerifying(false);
                        }}
                        variant={(isVerifying || isLogin) ? 'primary' : 'ghost'}
                        style={styles.tabButton}
                    />
                    <Button
                        title="Sign Up"
                        onPress={() => {
                            setIsLogin(false);
                            setIsVerifying(false);
                        }}
                        variant={(!isVerifying && !isLogin) ? 'primary' : 'ghost'}
                        style={styles.tabButton}
                    />
                </View>

                {isVerifying ? (
                    <Formik
                        initialValues={{ code: '' }}
                        validationSchema={Yup.object({
                            code: Yup.string().length(8, 'Must be 8 digits').required('Code is required'),
                        })}
                        onSubmit={(values) => handleVerifyOtp(values.code)}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                            <View>
                                <Text style={styles.verifyTitle}>Verify Your Email</Text>
                                <Text style={styles.verifySubtitle}>Enter the 8-digit security code sent to {verifyEmail}</Text>

                                <Input
                                    label="Security Code"
                                    placeholder="00000000"
                                    keyboardType="number-pad"
                                    maxLength={8}
                                    onChangeText={handleChange('code')}
                                    onBlur={handleBlur('code')}
                                    value={values.code}
                                    error={touched.code ? errors.code : undefined}
                                />

                                <Button
                                    title="Confirm Code"
                                    onPress={handleSubmit as any}
                                    loading={loading}
                                    disabled={!!(lockoutUntil && Date.now() < lockoutUntil)}
                                    style={styles.submitButton}
                                />

                                <View style={styles.resendContainer}>
                                    <Text style={styles.resendText}>Didn't get a code?</Text>
                                    <TouchableOpacity
                                        onPress={handleResendCode}
                                        disabled={loading || !!(lockoutUntil && Date.now() < lockoutUntil)}
                                    >
                                        <Text style={[
                                            styles.resendLink,
                                            (loading || (lockoutUntil && Date.now() < lockoutUntil)) ? styles.disabledText : null
                                        ]}>
                                            Resend Code
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <Button
                                    title="Back to Sign Up"
                                    variant="ghost"
                                    onPress={() => setIsVerifying(false)}
                                    style={styles.backButton}
                                />
                            </View>
                        )}
                    </Formik>
                ) : (
                    <Formik
                        initialValues={{ email: '', password: '', fullName: '', confirmPassword: '' }}
                        validationSchema={isLogin ? loginSchema : signupSchema}
                        onSubmit={handleAuth}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => {
                            if (Object.keys(errors).length > 0) {
                                console.log('Formik Errors:', errors);
                            }

                            return (
                                <View>
                                    {!isLogin && (
                                        <Input
                                            label="Full Name"
                                            placeholder="John Doe"
                                            onChangeText={handleChange('fullName')}
                                            onBlur={handleBlur('fullName')}
                                            value={values.fullName}
                                            error={touched.fullName ? errors.fullName : undefined}
                                        />
                                    )}

                                    <Input
                                        label="Email"
                                        placeholder="hello@example.com"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        onChangeText={handleChange('email')}
                                        onBlur={handleBlur('email')}
                                        value={values.email}
                                        error={touched.email ? errors.email : undefined}
                                    />

                                    <Input
                                        label="Password"
                                        placeholder="••••••••"
                                        isPassword={true}
                                        onChangeText={handleChange('password')}
                                        onBlur={handleBlur('password')}
                                        value={values.password}
                                        error={touched.password ? errors.password : undefined}
                                    />

                                    {!isLogin && (
                                        <Text style={styles.helperText}>
                                            Password must be at least 8 characters
                                        </Text>
                                    )}

                                    {!isLogin && (
                                        <Input
                                            label="Confirm Password"
                                            placeholder="••••••••"
                                            isPassword={true}
                                            onChangeText={handleChange('confirmPassword')}
                                            onBlur={handleBlur('confirmPassword')}
                                            value={values.confirmPassword}
                                            error={touched.confirmPassword ? errors.confirmPassword : undefined}
                                        />
                                    )}

                                    {isLogin && (
                                        <View style={styles.forgotContainer}>
                                            <Text
                                                style={styles.forgotText}
                                                onPress={() => handleResetPassword(values.email)}
                                            >
                                                Forgot Password?
                                            </Text>
                                        </View>
                                    )}

                                    <Button
                                        title={isLogin ? "Log In" : "Create Account"}
                                        onPress={() => {
                                            console.log('Button Pressed! Form valid?', Object.keys(errors).length === 0);
                                            handleSubmit();
                                        }}
                                        loading={loading}
                                        style={styles.submitButton}
                                    />
                                </View>
                            );
                        }}
                    </Formik>
                )}
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
    logoContainer: {
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
        fontSize: typography.sizes['4xl'],
        fontFamily: typography.fonts.heading,
        color: colors.text,
        marginBottom: spacing.xs,
        letterSpacing: 2,
    },
    subtitle: {
        color: colors.textDisabled,
        fontSize: typography.sizes.base,
    },
    tabContainer: {
        backgroundColor: colors.surface,
        padding: 4,
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tabButton: {
        flex: 1,
    },
    forgotContainer: {
        alignItems: 'flex-end',
        marginBottom: spacing.lg,
    },
    forgotText: {
        color: colors.primary,
        fontWeight: typography.weights.medium,
    },
    submitButton: {
        marginTop: spacing.md,
    },
    helperText: {
        color: colors.textSecondary,
        fontSize: typography.sizes.xs,
        marginTop: -spacing.xs,
        marginBottom: spacing.md,
        marginLeft: spacing.xs,
    },
    verifyTitle: {
        color: colors.text,
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        textAlign: 'center',
        marginTop: spacing.md,
    },
    verifySubtitle: {
        color: colors.textSecondary,
        fontSize: typography.sizes.sm,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    backButton: {
        marginTop: spacing.sm,
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.lg,
    },
    resendText: {
        color: colors.textSecondary,
        marginRight: spacing.xs,
    },
    resendLink: {
        color: colors.primary,
        fontWeight: typography.weights.bold,
    },
    disabledText: {
        color: colors.textDisabled,
    },
});
