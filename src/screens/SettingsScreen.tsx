import React, { useEffect, useState } from 'react';
import { View, Text, Switch, Alert, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase, isDemoMode } from '../services/supabase';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, typography } from '../theme';

export const SettingsScreen = () => {
    const [profile, setProfile] = useState<any>({ name: 'Demo User', email: 'demo@example.com' });
    const [loading, setLoading] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    useEffect(() => {
        fetchProfile();
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const storedValue = await AsyncStorage.getItem('notificationsEnabled');
            // CRITICAL: Type safe conversion
            const isEnabled = storedValue !== 'false';
            setNotificationsEnabled(isEnabled);

            // Update system permissions if needed
            if (isEnabled) {
                const { status } = await Notifications.getPermissionsAsync();
                if (status !== 'granted') setNotificationsEnabled(false);
            }
        } catch (e) {
            console.log('Error loading settings', e);
        }
    };

    const fetchProfile = async () => {
        try {
            if (isDemoMode) {
                setLoading(false);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(data || { name: user.user_metadata.name || 'User', email: user.email });
            }
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    const checkPermissions = async () => {
        const { status } = await Notifications.getPermissionsAsync();
        setNotificationsEnabled(status === 'granted');
    };

    const handleLogout = async () => {
        if (isDemoMode) {
            Alert.alert('Demo Mode', 'Configure Supabase to enable authentication');
            return;
        }
        const { error } = await supabase.auth.signOut();
        if (error) Alert.alert('Error', error.message);
    };

    const toggleNotifications = async (value: boolean) => {
        try {
            if (value) {
                const { status } = await Notifications.requestPermissionsAsync();
                const granted = status === 'granted';
                setNotificationsEnabled(granted);
                await AsyncStorage.setItem('notificationsEnabled', granted.toString());
                if (!granted) Linking.openSettings();
            } else {
                setNotificationsEnabled(false);
                await AsyncStorage.setItem('notificationsEnabled', 'false');
            }
        } catch (e) {
            console.log(e);
        }
    };

    const testNotification = async () => {
        if (!notificationsEnabled) {
            Alert.alert('Notifications Disabled', 'Please enable notifications first.');
            return;
        }
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Test Birthday 🎉",
                body: "This is what a birthday notification looks like!",
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 2,
                channelId: 'birthdays'
            },
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>

            <ScrollView>
                <View style={styles.profileContainer}>
                    <TouchableOpacity>
                        <Avatar name={profile?.name || 'User'} size="xl" />
                        <View style={styles.editBadge}>
                            <Ionicons name="pencil" size={16} color="white" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.profileName}>{profile?.name}</Text>
                    <Text style={styles.profileEmail}>{profile?.email}</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.section}>
                        <View style={styles.row}>
                            <View style={styles.rowLeft}>
                                <Ionicons name="notifications" size={24} color={colors.primary} />
                                <Text style={styles.rowText}>Notifications</Text>
                            </View>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={toggleNotifications}
                                thumbColor={notificationsEnabled ? colors.primary : colors.borderLight}
                                ios_backgroundColor={colors.borderLight}
                            />
                        </View>
                        <TouchableOpacity style={styles.subRow} onPress={testNotification}>
                            <Text style={styles.subRowText}>Send Test Notification</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.row}>
                            <View style={styles.rowLeft}>
                                <Ionicons name="grid-outline" size={24} color={colors.primary} />
                                <Text style={styles.rowText}>Home Screen Widget</Text>
                            </View>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>ACTIVE</Text>
                            </View>
                        </View>
                        <View style={styles.subRow}>
                            <Text style={styles.widgetHint}>
                                Your next birthday is automatically synced to the widget.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Demo Mode', 'Export feature requires Supabase configuration')}>
                            <Ionicons name="cloud-upload" size={24} color={colors.textDisabled} />
                            <Text style={styles.rowText}>Export Data</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.textDisabled} style={styles.chevron} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.rowLast} onPress={handleLogout}>
                            <Ionicons name="log-out" size={24} color={colors.error} />
                            <Text style={[styles.rowText, styles.logoutText]}>Log Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: spacing.xxl,
    },
    title: {
        color: colors.text,
        fontSize: typography.sizes['4xl'],
        fontFamily: typography.fonts.heading,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
        letterSpacing: 1,
    },
    profileContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary,
        padding: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 2,
        borderColor: colors.background,
    },
    profileName: {
        color: colors.text,
        fontSize: typography.sizes['2xl'],
        fontWeight: typography.weights.bold,
        marginTop: spacing.md,
    },
    profileEmail: {
        color: colors.textDisabled,
    },
    content: {
        paddingHorizontal: spacing.md,
    },
    section: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.lg,
        overflow: 'hidden',
    },
    row: {
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    rowLast: {
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rowText: {
        color: colors.text,
        fontSize: typography.sizes.lg,
        marginLeft: spacing.sm + 4,
    },
    logoutText: {
        color: colors.error,
    },
    chevron: {
        marginLeft: 'auto',
    },
    subRow: {
        padding: spacing.md,
        paddingLeft: spacing.md * 4,
    },
    subRowText: {
        color: colors.primary,
        fontWeight: typography.weights.medium,
    },
    badge: {
        backgroundColor: colors.surfaceHighlight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.success,
    },
    widgetHint: {
        color: colors.textSecondary,
        fontSize: 12,
        fontStyle: 'italic',
    },
});
