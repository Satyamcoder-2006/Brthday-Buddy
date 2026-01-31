import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { RootStackParamList, Party } from '../types';
import { getParty, submitRSVP, getPartyGuestCount } from '../services/PartyService';
import { Loading } from '../components/common/Loading';
import { Button } from '../components/common/Button';

type PartyJoinScreenRouteProp = RouteProp<RootStackParamList, 'PartyJoin'>;

const RSVP_OPTIONS = [
    { value: 'accepted', label: 'Accept', icon: 'checkmark-circle', color: colors.success },
    { value: 'maybe', label: 'Maybe', icon: 'help-circle', color: colors.warning },
    { value: 'declined', label: 'Decline', icon: 'close-circle', color: colors.error },
] as const;

export const PartyJoinScreen = () => {
    const route = useRoute<PartyJoinScreenRouteProp>();
    const navigation = useNavigation();
    const { partyId } = route.params;

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [party, setParty] = useState<Party | null>(null);
    const [currentGuestCount, setCurrentGuestCount] = useState(0);

    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestsCount, setGuestsCount] = useState('1');
    const [message, setMessage] = useState('');
    const [rsvpStatus, setRsvpStatus] = useState<'accepted' | 'maybe' | 'declined'>('accepted');

    useEffect(() => {
        loadPartyInfo();
    }, [partyId]);

    const loadPartyInfo = async () => {
        try {
            const [partyData, guestCount] = await Promise.all([
                getParty(partyId),
                getPartyGuestCount(partyId)
            ]);
            setParty(partyData);
            setCurrentGuestCount(guestCount);
        } catch (error: any) {
            Alert.alert('Error', 'Failed to load party information');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitRSVP = async () => {
        if (!guestName.trim() || !guestEmail.trim()) {
            Alert.alert('Error', 'Please enter your name and email');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        const count = parseInt(guestsCount);
        if (isNaN(count) || count < 1 || count > 10) {
            Alert.alert('Error', 'Number of guests must be between 1 and 10');
            return;
        }

        setIsSubmitting(true);
        try {
            await submitRSVP(partyId, {
                guest_name: guestName.trim(),
                guest_email: guestEmail.trim().toLowerCase(),
                guests_count: count,
                rsvp_status: rsvpStatus,
                message: message.trim() || undefined,
            });

            Alert.alert(
                'RSVP Submitted!',
                rsvpStatus === 'accepted'
                    ? `Thanks for confirming! See you at the party 🎉`
                    : rsvpStatus === 'maybe'
                        ? 'Thanks for letting us know. Hope you can make it!'
                        : 'Thanks for letting us know.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to submit RSVP');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <Loading />;
    if (!party) return <View style={styles.container}><Text style={styles.errorText}>Party not found</Text></View>;

    const partyDate = new Date(party.party_date);
    const isUpcoming = partyDate > new Date();
    const spotsLeft = party.max_guests - currentGuestCount;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={28} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.partyInfo}>
                <Text style={styles.title}>{party.title}</Text>
                <View style={styles.dateRow}>
                    <Ionicons name="calendar" size={18} color={colors.primary} />
                    <Text style={styles.dateText}>
                        {partyDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Text>
                </View>
                <View style={styles.dateRow}>
                    <Ionicons name="time" size={18} color={colors.primary} />
                    <Text style={styles.dateText}>
                        {partyDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                {party.venue_name && (
                    <View style={styles.dateRow}>
                        <Ionicons name="location" size={18} color={colors.primary} />
                        <Text style={styles.dateText}>{party.venue_name}</Text>
                    </View>
                )}
            </View>

            {!isUpcoming ? (
                <View style={styles.warningBox}>
                    <Ionicons name="alert-circle" size={24} color={colors.warning} />
                    <Text style={styles.warningText}>This party has already happened</Text>
                </View>
            ) : spotsLeft <= 0 && rsvpStatus === 'accepted' ? (
                <View style={styles.warningBox}>
                    <Ionicons name="people" size={24} color={colors.error} />
                    <Text style={styles.warningText}>Party is at capacity ({currentGuestCount}/{party.max_guests} guests)</Text>
                </View>
            ) : (
                <Text style={styles.spotsText}>{spotsLeft} spots remaining</Text>
            )}

            <View style={styles.form}>
                <Text style={styles.sectionTitle}>Your RSVP</Text>

                <View style={styles.rsvpOptions}>
                    {RSVP_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.rsvpOption,
                                rsvpStatus === option.value && styles.rsvpOptionActive,
                                rsvpStatus === option.value && { borderColor: option.color }
                            ]}
                            onPress={() => setRsvpStatus(option.value)}
                        >
                            <Ionicons
                                name={option.icon as any}
                                size={32}
                                color={rsvpStatus === option.value ? option.color : colors.textDisabled}
                            />
                            <Text style={[
                                styles.rsvpLabel,
                                rsvpStatus === option.value && { color: option.color, fontWeight: '700' }
                            ]}>{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Your Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={guestName}
                        onChangeText={setGuestName}
                        placeholder="John Doe"
                        placeholderTextColor={colors.textDisabled}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address *</Text>
                    <TextInput
                        style={styles.input}
                        value={guestEmail}
                        onChangeText={setGuestEmail}
                        placeholder="john@example.com"
                        placeholderTextColor={colors.textDisabled}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                {rsvpStatus === 'accepted' && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Number of Guests (including you)</Text>
                        <TextInput
                            style={styles.input}
                            value={guestsCount}
                            onChangeText={setGuestsCount}
                            keyboardType="number-pad"
                            placeholder="1"
                            placeholderTextColor={colors.textDisabled}
                        />
                    </View>
                )}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Message to Host (Optional)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Looking forward to it!"
                        placeholderTextColor={colors.textDisabled}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <Button
                    title="Submit RSVP"
                    onPress={handleSubmitRSVP}
                    loading={isSubmitting}
                    style={styles.submitButton}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        paddingBottom: spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: spacing.lg,
    },
    partyInfo: {
        padding: spacing.lg,
        backgroundColor: colors.surface,
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: typography.sizes['2xl'],
        fontFamily: typography.fonts.heading,
        color: colors.primary,
        marginBottom: spacing.md,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    dateText: {
        marginLeft: spacing.sm,
        fontSize: typography.sizes.base,
        color: colors.text,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceHighlight,
        padding: spacing.md,
        marginHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
    },
    warningText: {
        marginLeft: spacing.sm,
        color: colors.warning,
        flex: 1,
    },
    spotsText: {
        textAlign: 'center',
        color: colors.success,
        fontSize: typography.sizes.sm,
        marginBottom: spacing.lg,
    },
    form: {
        padding: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    rsvpOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    rsvpOption: {
        flex: 1,
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: colors.border,
        marginHorizontal: 4,
    },
    rsvpOptionActive: {
        backgroundColor: colors.surfaceHighlight,
    },
    rsvpLabel: {
        marginTop: spacing.xs,
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    input: {
        backgroundColor: colors.surfaceHighlight,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.borderLight,
        padding: spacing.md,
        fontSize: typography.sizes.base,
        color: colors.text,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    submitButton: {
        marginTop: spacing.md,
    },
    errorText: {
        textAlign: 'center',
        color: colors.error,
        padding: spacing.xl,
    },
});
