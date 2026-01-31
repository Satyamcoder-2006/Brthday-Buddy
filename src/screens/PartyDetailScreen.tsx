import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share, RefreshControl } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { RootStackParamList, Party, PartyInvitation } from '../types';
import { Loading } from '../components/common/Loading';
import { supabase } from '../services/supabase';
import { getPartyWithGuests, generateInvitationLink, deleteParty, joinPartyFromInvite } from '../services/PartyService';

type PartyDetailScreenRouteProp = RouteProp<RootStackParamList, 'PartyDetail'>;

export const PartyDetailScreen = () => {
    const route = useRoute<PartyDetailScreenRouteProp>();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { partyId } = route.params;

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [party, setParty] = useState<Party | null>(null);
    const [invitations, setInvitations] = useState<PartyInvitation[]>([]);
    const [guestCount, setGuestCount] = useState(0);

    const loadPartyData = async (showRefreshIndicator = false) => {
        try {
            if (showRefreshIndicator) setRefreshing(true);
            else setLoading(true);

            // If coming from invite, attempt to auto-join first
            const { data: { user } } = await supabase.auth.getUser();
            if (route.params.fromInvite && user) {
                await joinPartyFromInvite(partyId, user.id, route.params.inviterId);
            }

            const data = await getPartyWithGuests(partyId);
            setParty(data.party);
            setInvitations(data.invitations);
            setGuestCount(data.guestCount);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to load party details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadPartyData();
    }, [partyId]);

    const handleShareInvitation = async () => {
        if (!party) return;

        const { data: { user } } = await supabase.auth.getUser();
        const inviteLink = generateInvitationLink(partyId, user?.id || '');
        const message = `🎉 You're invited to ${party.title}!\n\n📅 ${new Date(party.party_date).toLocaleString()}\n${party.venue_name ? `📍 ${party.venue_name}\n` : ''}Join the party: ${inviteLink}\n\nSee you there!`;

        try {
            await Share.share({ message });
        } catch (error) {
            console.error('Share failed:', error);
        }
    };

    const handleDeleteParty = () => {
        Alert.alert(
            'Delete Party',
            'Are you sure? This will remove all RSVPs and cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteParty(partyId);
                            navigation.goBack();
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    if (loading) return <Loading />;
    if (!party) return <View style={styles.container}><Text>Party not found</Text></View>;

    const partyDate = new Date(party.party_date);
    const isUpcoming = partyDate > new Date();
    const acceptedGuests = invitations.filter(i => i.rsvp_status === 'accepted');

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadPartyData(true)} />}
        >
            <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{party.title}</Text>
                <TouchableOpacity onPress={handleDeleteParty}>
                    <Ionicons name="trash-outline" size={24} color={colors.error} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar" size={20} color={colors.primary} />
                        <Text style={styles.infoText}>{partyDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="time" size={20} color={colors.primary} />
                        <Text style={styles.infoText}>{partyDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    {party.venue_name && (
                        <View style={styles.infoRow}>
                            <Ionicons name="location" size={20} color={colors.primary} />
                            <View>
                                <Text style={styles.infoText}>{party.venue_name}</Text>
                                {party.venue_address && <Text style={styles.infoSubtext}>{party.venue_address}</Text>}
                            </View>
                        </View>
                    )}
                    {party.description && (
                        <View style={styles.descriptionBox}>
                            <Text style={styles.descriptionText}>{party.description}</Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity style={styles.shareButton} onPress={handleShareInvitation}>
                    <Ionicons name="share-social" size={24} color="white" />
                    <Text style={styles.shareButtonText}>Share Invitation</Text>
                </TouchableOpacity>

                <View style={styles.guestSection}>
                    <Text style={styles.sectionTitle}>Guest List ({guestCount}/{party.max_guests})</Text>
                    {!isUpcoming && <Text style={styles.pastNotice}>This party has passed</Text>}

                    {acceptedGuests.length === 0 ? (
                        <Text style={styles.emptyText}>No RSVPs yet</Text>
                    ) : (
                        acceptedGuests.map((invitation) => (
                            <View key={invitation.id} style={styles.guestCard}>
                                <View>
                                    <Text style={styles.guestName}>{invitation.guest_name || 'Anonymous'}</Text>
                                    <Text style={styles.guestEmail}>{invitation.guest_email}</Text>
                                </View>
                                <View style={styles.guestBadge}>
                                    <Text style={styles.guestCount}>{invitation.guests_count} {invitation.guests_count === 1 ? 'guest' : 'guests'}</Text>
                                </View>
                            </View>
                        ))
                    )}

                    {invitations.filter(i => i.rsvp_status !== 'accepted').length > 0 && (
                        <>
                            <Text style={styles.subsectionTitle}>Pending/Declined</Text>
                            {invitations.filter(i => i.rsvp_status !== 'accepted').map((invitation) => (
                                <View key={invitation.id} style={[styles.guestCard, styles.guestCardSecondary]}>
                                    <Text style={styles.guestName}>{invitation.guest_name || 'Anonymous'}</Text>
                                    <Text style={[
                                        styles.statusBadge,
                                        invitation.rsvp_status === 'declined' && styles.statusDeclined
                                    ]}>{invitation.rsvp_status}</Text>
                                </View>
                            ))}
                        </>
                    )}
                </View>
            </View>
        </ScrollView>
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
        justifyContent: 'space-between',
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        marginRight: spacing.md,
    },
    headerTitle: {
        flex: 1,
        fontSize: typography.sizes.xl,
        fontFamily: typography.fonts.heading,
        color: colors.primary,
    },
    content: {
        padding: spacing.lg,
    },
    infoCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    infoText: {
        marginLeft: spacing.sm,
        fontSize: typography.sizes.base,
        color: colors.text,
        flex: 1,
    },
    infoSubtext: {
        marginLeft: spacing.sm,
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    descriptionBox: {
        marginTop: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.surfaceHighlight,
        borderRadius: borderRadius.sm,
    },
    descriptionText: {
        color: colors.text,
        fontSize: typography.sizes.sm,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
    },
    shareButtonText: {
        color: 'white',
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.bold,
        marginLeft: spacing.sm,
    },
    guestSection: {
        marginTop: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    subsectionTitle: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.textSecondary,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    pastNotice: {
        color: colors.textDisabled,
        fontSize: typography.sizes.sm,
        fontStyle: 'italic',
        marginBottom: spacing.md,
    },
    emptyText: {
        textAlign: 'center',
        color: colors.textDisabled,
        padding: spacing.xl,
    },
    guestCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
    },
    guestCardSecondary: {
        opacity: 0.7,
    },
    guestName: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.text,
    },
    guestEmail: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    guestBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
    },
    guestCount: {
        color: 'black',
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.bold,
    },
    statusBadge: {
        fontSize: typography.sizes.xs,
        textTransform: 'uppercase',
        color: colors.primary,
    },
    statusDeclined: {
        color: colors.error,
    },
});
