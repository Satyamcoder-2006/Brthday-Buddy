import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { getMyHostedParties } from '../services/PartyService';
import { Party, RootStackParamList } from '../types';
import { Loading } from '../components/common/Loading';
import { format } from 'date-fns';

type MyPartiesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MyParties'>;

export const MyPartiesScreen = () => {
    const navigation = useNavigation<MyPartiesScreenNavigationProp>();
    const insets = useSafeAreaInsets();
    const [parties, setParties] = useState<Party[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchParties = async () => {
        try {
            const data = await getMyHostedParties();
            setParties(data);
        } catch (error) {
            console.error('Error fetching hosted parties:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchParties();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchParties();
    };

    const renderPartyItem = ({ item }: { item: Party }) => {
        const partyDate = new Date(item.party_date);
        const isPast = partyDate < new Date();

        return (
            <TouchableOpacity
                style={styles.partyCard}
                onPress={() => navigation.navigate('PartyDetail', { partyId: item.id })}
            >
                <View style={[styles.dateBadge, isPast && styles.pastBadge]}>
                    <Text style={styles.dateDay}>{format(partyDate, 'dd')}</Text>
                    <Text style={styles.dateMonth}>{format(partyDate, 'MMM')}</Text>
                </View>
                <View style={styles.partyInfo}>
                    <Text style={styles.partyTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.partyVenue} numberOfLines={1}>
                        <Ionicons name="location-outline" size={14} color={colors.textSecondary} /> {item.venue_name || 'No venue set'}
                    </Text>
                    <Text style={styles.partyTime}>
                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} /> {format(partyDate, 'p')}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textDisabled} />
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return <Loading />;
    }

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Hosted Parties</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('PartyHosting', {})}
                    style={styles.addButton}
                >
                    <Ionicons name="add" size={28} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={parties}
                keyExtractor={(item) => item.id}
                renderItem={renderPartyItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="wine-outline" size={64} color={colors.textDisabled} />
                        </View>
                        <Text style={styles.emptyTitle}>No Parties Hosted Yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Plan your first birthday bash and invite your friends!
                        </Text>
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => navigation.navigate('PartyHosting', {})}
                        >
                            <Text style={styles.createButtonText}>Host a Party</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        flex: 1,
        fontSize: typography.sizes.xl,
        fontFamily: typography.fonts.heading,
        color: colors.primary,
        marginLeft: spacing.md,
    },
    addButton: {
        padding: spacing.xs,
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    partyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    dateBadge: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
        marginRight: spacing.md,
    },
    pastBadge: {
        backgroundColor: colors.textDisabled,
    },
    dateDay: {
        color: 'white',
        fontSize: typography.sizes.lg,
        fontWeight: 'bold',
        lineHeight: 20,
    },
    dateMonth: {
        color: 'white',
        fontSize: typography.sizes.xs,
        textTransform: 'uppercase',
    },
    partyInfo: {
        flex: 1,
    },
    partyTitle: {
        color: colors.text,
        fontSize: typography.sizes.base,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    partyVenue: {
        color: colors.textSecondary,
        fontSize: typography.sizes.sm,
        marginBottom: 2,
    },
    partyTime: {
        color: colors.textSecondary,
        fontSize: typography.sizes.sm,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.surfaceHighlight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    emptyTitle: {
        color: colors.text,
        fontSize: typography.sizes.xl,
        fontWeight: 'bold',
        marginBottom: spacing.sm,
    },
    emptySubtitle: {
        color: colors.textSecondary,
        fontSize: typography.sizes.base,
        textAlign: 'center',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.xl,
    },
    createButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.full,
    },
    createButtonText: {
        color: 'white',
        fontSize: typography.sizes.base,
        fontWeight: 'bold',
    },
});
