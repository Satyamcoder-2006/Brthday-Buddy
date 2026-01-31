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
import { DataExportService } from '../services/DataExportService';
import { DocumentImportService } from '../services/DocumentImportService';
import { MistralOCRService } from '../services/MistralOCRService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SettingsService } from '../services/SettingsService';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export const SettingsScreen = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const [profile, setProfile] = useState<any>({ name: 'Demo User', email: 'demo@example.com' });
    const [loading, setLoading] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [notificationTime, setNotificationTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [aiProvider, setAiProvider] = useState<'gemini' | 'mistral' | 'auto'>('auto');

    useEffect(() => {
        fetchProfile();
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const storedValue = await AsyncStorage.getItem('notificationsEnabled');
            const isEnabled = storedValue !== 'false';
            setNotificationsEnabled(isEnabled);

            // Load Time
            const time = await SettingsService.getNotificationTime();
            const date = new Date();
            date.setHours(time.hour, time.minute, 0, 0);
            setNotificationTime(date);

            // Load AI Provider
            const provider = await SettingsService.getAIProvider();
            setAiProvider(provider);

            if (isEnabled) {
                const { status } = await Notifications.getPermissionsAsync();
                if (status !== 'granted') setNotificationsEnabled(false);
            }
        } catch (e) {
            console.log('Error loading settings', e);
        }
    };

    const handleAIProviderChange = async (provider: 'gemini' | 'mistral' | 'auto') => {
        try {
            setAiProvider(provider);
            await SettingsService.setAIProvider(provider);
        } catch (e) {
            Alert.alert('Error', 'Failed to save AI preference');
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

    const onTimeChange = async (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || notificationTime;
        setShowTimePicker(false);
        setNotificationTime(currentDate);

        if (selectedDate) {
            await SettingsService.setNotificationTime(
                currentDate.getHours(),
                currentDate.getMinutes()
            );
        }
    };

    const handleExportData = async () => {
        try {
            if (isDemoMode) {
                // Mock data for demo export
                const mockBirthdays = [
                    { name: 'John Doe', birthday_date: '1990-01-01', relationship: 'Friend', notes: 'Likes golf' },
                    { name: 'Jane Smith', birthday_date: '1995-05-15', relationship: 'Sister', notes: 'Loves cats' }
                ];
                await DataExportService.exportToCSV(mockBirthdays as any);
                return;
            }

            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                Alert.alert('Error', 'You must be logged in to export data');
                return;
            }

            const { data, error } = await supabase
                .from('birthdays')
                .select('*')
                .eq('user_id', user.id);

            if (error) throw error;

            if (!data || data.length === 0) {
                Alert.alert('No Data', 'You have no birthdays to export.');
                return;
            }

            await DataExportService.exportToCSV(data);

        } catch (error: any) {
            Alert.alert('Export Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImportData = async () => {
        Alert.alert(
            'Import Birthdays',
            'Choose a source to import from (Powered by Mistral AI)',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Document (PDF/CSV)',
                    onPress: async () => {
                        processImport('document');
                    }
                },
                {
                    text: 'Image (Screenshot)',
                    onPress: async () => {
                        processImport('image');
                    }
                }
            ]
        );
    };

    const processImport = async (type: 'document' | 'image') => {
        setLoading(true);
        try {
            const importService = new DocumentImportService();
            const extractorService = new MistralOCRService();
            let extractedData: any[] = [];

            if (type === 'document') {
                const doc = await importService.pickDocument();
                const base64 = await importService.readFileAsBase64(doc.uri);

                if (doc.mimeType === 'application/pdf') {
                    extractedData = await extractorService.extractFromPDF(base64);
                } else if (doc.mimeType?.includes('text') || doc.mimeType?.includes('csv')) {
                    const text = await importService.readFileAsText(doc.uri);
                    extractedData = await extractorService.extractFromCSV(text);
                } else {
                    Alert.alert('Error', 'Unsupported file type');
                    return;
                }
            } else {
                const image = await importService.pickImage();
                if (image.base64) {
                    extractedData = await extractorService.extractFromImage(image.base64);
                }
            }

            if (extractedData && extractedData.length > 0) {
                navigation.navigate('ImportPreview', { extractedData });
            } else {
                Alert.alert('No Data Found', 'Could not extract any birthday information.');
            }

        } catch (error: any) {
            if (error.message !== 'Document selection cancelled' && error.message !== 'Image selection cancelled') {
                console.error(error);
                Alert.alert('Import Failed', error.message || 'An error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
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

                        {notificationsEnabled && (
                            <TouchableOpacity style={styles.row} onPress={() => setShowTimePicker(true)}>
                                <View style={styles.rowLeft}>
                                    <Ionicons name="time-outline" size={24} color={colors.textSecondary} />
                                    <Text style={styles.rowText}>Reminder Time</Text>
                                </View>
                                <Text style={styles.valueText}>
                                    {notificationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.textDisabled} style={styles.chevron} />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={styles.subRow} onPress={testNotification}>
                            <Text style={styles.subRowText}>Send Test Notification</Text>
                        </TouchableOpacity>
                    </View>

                    {showTimePicker && (
                        <DateTimePicker
                            value={notificationTime}
                            mode="time"
                            display="spinner"
                            onChange={onTimeChange}
                        />
                    )}

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
                        <Text style={styles.sectionTitle}>Party Hosting</Text>
                        <TouchableOpacity
                            style={styles.row}
                            onPress={() => navigation.navigate('MyParties')}
                        >
                            <Ionicons name="wine" size={24} color={colors.primary} />
                            <Text style={styles.rowText}>My Hosted Parties</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.textDisabled} style={styles.chevron} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>AI Preferences</Text>
                        {(['auto', 'mistral', 'gemini'] as const).map((provider) => (
                            <TouchableOpacity
                                key={provider}
                                style={styles.row}
                                onPress={() => handleAIProviderChange(provider)}
                            >
                                <Ionicons
                                    name={aiProvider === provider ? "radio-button-on" : "radio-button-off"}
                                    size={24}
                                    color={aiProvider === provider ? colors.primary : colors.textDisabled}
                                />
                                <Text style={[
                                    styles.rowText,
                                    aiProvider === provider && { color: colors.primary, fontWeight: 'bold' }
                                ]}>
                                    {provider === 'auto' ? 'Auto (Recommended)' : provider.charAt(0).toUpperCase() + provider.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.section}>
                        <TouchableOpacity style={styles.row} onPress={handleImportData}>
                            <Ionicons name="cloud-download" size={24} color={colors.info} />
                            <Text style={styles.rowText}>Import Birthdays (AI)</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.textDisabled} style={styles.chevron} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.row} onPress={handleExportData}>
                            <Ionicons name="cloud-upload" size={24} color={colors.textDisabled} />
                            <Text style={styles.rowText}>Export Data (CSV)</Text>
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
    sectionTitle: {
        color: colors.textDisabled,
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.bold,
        textTransform: 'uppercase',
        marginLeft: spacing.md,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
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
    valueText: {
        color: colors.primary,
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.medium,
        marginRight: spacing.sm,
    },
});
