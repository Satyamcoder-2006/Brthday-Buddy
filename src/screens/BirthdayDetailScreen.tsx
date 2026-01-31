import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, gradients } from '../theme';
import { RootStackParamList } from '../types';
import { Avatar } from '../components/common/Avatar';
import { supabase } from '../services/supabase';

const { width } = Dimensions.get('window');

type BirthdayDetailRouteProp = RouteProp<RootStackParamList, 'BirthdayDetail'>;

export const BirthdayDetailScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<BirthdayDetailRouteProp>();
    const { birthday } = route.params;

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    const calculateTimeInfo = (dateStr: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const birthDate = new Date(dateStr);
        const currentYear = today.getFullYear();
        let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
        if (nextBirthday < today) {
            nextBirthday.setFullYear(currentYear + 1);
        }
        const diffTime = Math.abs(nextBirthday.getTime() - today.getTime());
        const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { daysUntil, nextBirthday };
    };

    const { daysUntil, nextBirthday } = calculateTimeInfo(birthday.birthday_date);
    const avatarUrl = birthday.avatar_url
        ? supabase.storage.from('avatars').getPublicUrl(birthday.avatar_url).data.publicUrl
        : undefined;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
                {/* Hero Section */}
                <LinearGradient
                    colors={gradients.primary as any}
                    style={styles.hero}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <SafeAreaView style={styles.safeHeader}>
                        <View style={styles.navHeader}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                                <Ionicons name="chevron-back" size={28} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('SocialShare', { birthday })}
                                style={styles.iconButton}
                            >
                                <Ionicons name="share-outline" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>

                    <View style={styles.heroContent}>
                        <View style={styles.avatarWrapper}>
                            <View style={styles.avatarBorder}>
                                <Avatar name={birthday.name} size="xxl" uri={avatarUrl} />
                            </View>
                            <View style={styles.countDownBubble}>
                                <Text style={styles.bubbleText}>
                                    {daysUntil === 0 ? '🎉' : `${daysUntil}d`}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.heroName}>{birthday.name}</Text>
                        <View style={styles.relationshipBadge}>
                            <Text style={styles.relationshipText}>{birthday.relationship}</Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.contentCard}>
                    {/* Basic Info */}
                    <View style={styles.infoSection}>
                        <View style={styles.infoItem}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(255,149,0,0.1)' }]}>
                                <Ionicons name="calendar" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Birthday</Text>
                                <Text style={styles.infoValue}>
                                    {new Date(birthday.birthday_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                                </Text>
                            </View>
                        </View>

                        {birthday.birth_year && birthday.birth_year > 1900 && (
                            <View style={styles.infoItem}>
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(88,86,214,0.1)' }]}>
                                    <Ionicons name="star" size={20} color={colors.accent} />
                                </View>
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Turning</Text>
                                    <Text style={styles.infoValue}>{nextBirthday.getFullYear() - birthday.birth_year}</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {birthday.notes && (
                        <View style={styles.notesContainer}>
                            <Text style={styles.sectionTitle}>Notes</Text>
                            <Text style={styles.notesText}>{birthday.notes}</Text>
                        </View>
                    )}

                    {/* Planning Tools */}
                    <Text style={styles.sectionTitle}>Planning Tools</Text>
                    <View style={styles.toolsContainer}>
                        <TouchableOpacity
                            style={styles.toolCard}
                            onPress={() => navigation.navigate('GiftRegistry', { birthday })}
                        >
                            <LinearGradient
                                colors={['#1C1C1E', '#121212']}
                                style={styles.toolGradient}
                            >
                                <View style={[styles.toolIcon, { backgroundColor: colors.surfaceElevated }]}>
                                    <Ionicons name="gift" size={24} color={colors.primary} />
                                </View>
                                <View style={styles.toolTextContainer}>
                                    <Text style={styles.toolTitle}>Gift Registry</Text>
                                    <Text style={styles.toolSub}>AI-powered tracking</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.toolCard}
                            onPress={() => navigation.navigate('PartyHosting', { birthdayId: birthday.id })}
                        >
                            <LinearGradient
                                colors={['#1C1C1E', '#121212']}
                                style={styles.toolGradient}
                            >
                                <View style={[styles.toolIcon, { backgroundColor: colors.surfaceElevated }]}>
                                    <Ionicons name="wine" size={24} color={colors.accentLight} />
                                </View>
                                <View style={styles.toolTextContainer}>
                                    <Text style={styles.toolTitle}>Host Party</Text>
                                    <Text style={styles.toolSub}>Organize event</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                            </LinearGradient>
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
    },
    scrollContent: {
        paddingBottom: spacing.xxl,
    },
    hero: {
        height: 340, // Increased to cover content comfortably
        paddingHorizontal: spacing.md,
        borderBottomLeftRadius: borderRadius.xxl,
        borderBottomRightRadius: borderRadius.xxl,
    },
    safeHeader: {
        zIndex: 10,
    },
    navHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroContent: {
        alignItems: 'center',
        marginTop: spacing.md, // Add a bit of top margin
        paddingBottom: spacing.lg, // Ensure orange part extends past Friend badge
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: spacing.md,
    },
    avatarBorder: {
        padding: 3,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 999,
    },
    countDownBubble: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: 'white',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    bubbleText: {
        color: colors.primary,
        fontWeight: '800',
        fontSize: 12,
    },
    heroName: {
        fontSize: 32, // Reduced from 42
        color: 'white',
        fontFamily: typography.fonts.heading,
        letterSpacing: 0.5, // Reduced from 2
        textTransform: 'uppercase',
        marginBottom: spacing.xs,
    },
    relationshipBadge: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
    },
    relationshipText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    contentCard: {
        marginTop: spacing.xxl,
        marginHorizontal: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xxl,
        padding: spacing.lg, // Reduced padding from xl/xxl
        paddingTop: spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    infoSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg, // Reduced from xl
        gap: spacing.sm, // Reduced gap
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        backgroundColor: colors.surfaceHighlight, // Add subtle background
        padding: spacing.sm,
        borderRadius: borderRadius.lg,
    },
    iconBox: {
        width: 36, // Reduced from 44
        height: 36, // Reduced from 44
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        color: colors.textSecondary,
        fontSize: 9, // Reduced from 10
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    infoValue: {
        color: colors.text,
        fontSize: 14, // Reduced from 16
        fontWeight: '700',
        lineHeight: 18,
    },
    notesContainer: {
        marginBottom: spacing.lg,
        backgroundColor: colors.surfaceHighlight,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    sectionTitle: {
        color: colors.text,
        fontSize: 18, // Reduced from 20
        fontWeight: '700',
        marginBottom: spacing.md, // Reduced from lg
        letterSpacing: 0.5,
    },
    notesText: {
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
    },
    toolsContainer: {
        gap: spacing.sm,
    },
    toolCard: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        backgroundColor: colors.surfaceHighlight, // Ensure bg color
    },
    toolGradient: {
        padding: spacing.md, // Drastically reduced from xl
        flexDirection: 'row',
        alignItems: 'center',
    },
    toolIcon: {
        width: 40, // Reduced from 56
        height: 40, // Reduced from 56
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    toolTextContainer: {
        flex: 1,
        paddingRight: spacing.sm,
    },
    toolTitle: {
        color: colors.text,
        fontSize: 15, // Reduced from 18
        fontWeight: '600',
    },
    toolSub: {
        color: colors.textTertiary,
        fontSize: 12,
        marginTop: 0,
    },
    toolArrow: {
        marginLeft: spacing.sm,
    },
});
