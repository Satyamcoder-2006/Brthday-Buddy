import React, { useEffect, useState } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { supabase, isDemoMode } from '../services/supabase';
import { LoginScreen } from '../screens/LoginScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { BirthdaysListScreen } from '../screens/BirthdaysListScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SocialShareScreen } from '../screens/SocialShareScreen';
import { Loading } from '../components/common/Loading';
import { MainTabParamList, RootStackParamList } from '../types';
import { colors, spacing, typography } from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const DemoBanner = () => (
    <View style={styles.demoBanner}>
        <Ionicons name="warning" size={16} color={colors.primary} />
        <Text style={styles.demoText}>DEMO MODE - Configure Supabase in app.json</Text>
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
                            iconName = focused ? 'list' : 'list-outline';
                        } else if (route.name === 'Settings') {
                            iconName = focused ? 'settings' : 'settings-outline';
                        }

                        return <Ionicons name={iconName} size={size} color={color} />;
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
        <NavigationContainer theme={DarkTheme}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {session || isDemoMode ? (
                    <>
                        <Stack.Screen name="Main" component={MainTabs} />
                        <Stack.Screen name="SocialShare" component={SocialShareScreen} />
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
