import React, { useEffect, useState } from 'react';
import { NavigationContainer, DarkTheme, LinkingOptions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { supabase, isDemoMode } from '../services/supabase';
import { LoginScreen } from '../screens/LoginScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { BirthdaysListScreen } from '../screens/BirthdaysListScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { MyPartiesScreen } from '../screens/MyPartiesScreen';
import { SocialShareScreen } from '../screens/SocialShareScreen';
import { Loading } from '../components/common/Loading';
import { ImportPreviewScreen } from '../screens/ImportPreviewScreen';
import { BirthdayDetailScreen } from '../screens/BirthdayDetailScreen';
import { GiftRegistryScreen } from '../screens/GiftRegistryScreen';
import { PartyHostingScreen } from '../screens/PartyHostingScreen';
import { PartyDetailScreen } from '../screens/PartyDetailScreen';
import { PartyJoinScreen } from '../screens/PartyJoinScreen';
import { MainTabParamList, RootStackParamList } from '../types';
import { colors, spacing, typography } from '../theme';
import { useDeepLinking } from '../utils/DeepLinkManager';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const DemoBanner = () => (
    <View style={styles.demoBanner}>
        <Ionicons name="warning" size={16} color={colors.primary} />
        <Text style={styles.demoText}>DEMO MODE - Configure Supabase in </Text>
    </View>
);

const MainTabs = () => {
    return (
        <>
            {isDemoMode && <DemoBanner />}
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: colors.surface,
                        borderTopColor: colors.border,
                        height: 85,
                        paddingTop: 8,
                    },
                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: colors.textDisabled,
                    tabBarShowLabel: true,
                    tabBarLabelStyle: {
                        paddingBottom: 8,
                        fontSize: 12,
                        fontWeight: '500',
                    },
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName: keyof typeof Ionicons.glyphMap = 'help';

                        if (route.name === 'Calendar') {
                            iconName = focused ? 'calendar' : 'calendar-outline';
                        } else if (route.name === 'Birthdays') {
                            iconName = focused ? 'gift' : 'gift-outline';
                        } else if (route.name === 'Settings') {
                            iconName = focused ? 'settings' : 'settings-outline';
                        }

                        return <Ionicons name={iconName} size={24} color={color} />;
                    },
                })}
            >
                <Tab.Screen name="Calendar" component={CalendarScreen} />
                <Tab.Screen name="Birthdays" component={BirthdaysListScreen} />
                <Tab.Screen name="Settings" component={SettingsScreen} />
            </Tab.Navigator>
        </>
    );
};

const linking: LinkingOptions<RootStackParamList> = {
    prefixes: ['birthdaybuddy://', 'https://birthdaybuddy.app'],
    config: {
        screens: {
            Main: {
                screens: {
                    Calendar: 'calendar',
                    Birthdays: 'birthdays',
                    Settings: 'settings',
                }
            },
            MyParties: 'parties/hosted',
            PartyJoin: 'party/:partyId',
            PartyDetail: 'party/detail/:partyId',
            PartyHosting: 'party/host',
            BirthdayDetail: 'birthday/:birthdayId',
            SocialShare: 'share/:birthdayId',
        },
    },
};

const DeepLinkHandler = () => {
    useDeepLinking();
    return null;
};

export const AppNavigator = () => {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isDemoMode) {
            // In demo mode, skip auth and go straight to main app
            setSession({ user: { id: 'demo', email: 'demo@example.com' } });
            setLoading(false);
            return;
        }

        supabase.auth.getSession().then(({ data: { session } }: any) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return <Loading />;
    }

    return (
        <NavigationContainer linking={linking} theme={DarkTheme}>
            <DeepLinkHandler />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {session || isDemoMode ? (
                    <>
                        <Stack.Screen name="Main" component={MainTabs} />
                        <Stack.Screen name="SocialShare" component={SocialShareScreen} />
                        <Stack.Screen name="ImportPreview" component={ImportPreviewScreen} />
                        <Stack.Screen name="BirthdayDetail" component={BirthdayDetailScreen} />
                        <Stack.Screen name="GiftRegistry" component={GiftRegistryScreen} />
                        <Stack.Screen name="PartyHosting" component={PartyHostingScreen} />
                        <Stack.Screen name="PartyDetail" component={PartyDetailScreen} />
                        <Stack.Screen name="PartyJoin" component={PartyJoinScreen} />
                        <Stack.Screen name="MyParties" component={MyPartiesScreen} />
                    </>
                ) : (
                    <Stack.Screen name="Auth" component={LoginScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    demoBanner: {
        backgroundColor: colors.surfaceHighlight,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.primary,
    },
    demoText: {
        color: colors.primary,
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.bold,
        marginLeft: spacing.sm,
    },
});
