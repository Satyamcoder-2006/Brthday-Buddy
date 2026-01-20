import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { Birthday } from '../../types';
import { getGiftSuggestions, GiftSuggestion } from '../../services/ai';
import { isDemoMode } from '../../services/supabase';

interface Props {
    visible: boolean;
    onClose: () => void;
    birthday: Birthday | null;
}

type Step = 'budget' | 'loading' | 'results';
type Budget = 'Low' | 'Medium' | 'High';

export const GiftSuggestionsModal: React.FC<Props> = ({ visible, onClose, birthday }) => {
    const [step, setStep] = useState<Step>('budget');
    const [budget, setBudget] = useState<Budget>('Medium');
    const [suggestions, setSuggestions] = useState<GiftSuggestion[]>([]);

    const handleGetSuggestions = async (selectedBudget: Budget) => {
        if (!birthday) return;
        setBudget(selectedBudget);
        setStep('loading');

        try {
            const results = await getGiftSuggestions(birthday, selectedBudget, isDemoMode);
            setSuggestions(results);
            setStep('results');
        } catch (error) {
            console.error(error);
            setStep('budget');
        }
    };

    const reset = () => {
        setStep('budget');
        setSuggestions([]);
        onClose();
    };

    if (!birthday) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>AI Gift Finder</Text>
                            <Text style={styles.subtitle}>For {birthday.name}</Text>
                        </View>
                        <TouchableOpacity onPress={reset} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {step === 'budget' && (
                        <View style={styles.body}>
                            <Text style={styles.question}>What's your budget for this gift?</Text>
                            <View style={styles.budgetRow}>
                                {(['Low', 'Medium', 'High'] as Budget[]).map((b) => (
                                    <TouchableOpacity
                                        key={b}
                                        style={[styles.budgetCard, budget === b && styles.budgetCardActive]}
                                        onPress={() => handleGetSuggestions(b)}
                                    >
                                        <Ionicons
                                            name={b === 'Low' ? 'wallet-outline' : b === 'Medium' ? 'cash-outline' : 'diamond-outline'}
                                            size={32}
                                            color={budget === b ? 'black' : colors.primary}
                                        />
                                        <Text style={[styles.budgetLabel, budget === b && styles.budgetLabelActive]}>{b}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Text style={styles.hint}>AI will suggest 3 personalized gifts based on their profile and your choice.</Text>
                        </View>
                    )}

                    {step === 'loading' && (
                        <View style={styles.loadingBody}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.loadingText}>Curating personal suggestions...</Text>
                            <Text style={styles.loadingSub}>Analyzing relationship and interests</Text>
                        </View>
                    )}

                    {step === 'results' && (
                        <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
                            {suggestions.map((item, idx) => (
                                <View key={item.id} style={styles.suggestionCard}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.rankBadge}>
                                            <Text style={styles.rankText}>#{idx + 1}</Text>
                                        </View>
                                        <Text style={styles.itemTitle}>{item.title}</Text>
                                    </View>
                                    <Text style={styles.itemDesc}>{item.description}</Text>
                                    <View style={styles.whyBox}>
                                        <Text style={styles.whyLabel}>AI REASONING:</Text>
                                        <Text style={styles.whyText}>{item.why}</Text>
                                    </View>
                                </View>
                            ))}
                            <TouchableOpacity style={styles.retryBtn} onPress={() => setStep('budget')}>
                                <Text style={styles.retryText}>Try another budget</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing.lg,
        height: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: typography.sizes['xl'],
        fontFamily: typography.fonts.heading,
        color: colors.primary,
    },
    subtitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        fontFamily: typography.fonts.medium,
    },
    closeBtn: {
        backgroundColor: colors.surfaceHighlight,
        padding: spacing.sm,
        borderRadius: borderRadius.full,
    },
    body: {
        flex: 1,
        justifyContent: 'center',
        paddingBottom: spacing.xxl,
    },
    question: {
        fontSize: typography.sizes.xl,
        color: colors.text,
        fontFamily: typography.fonts.bold,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    budgetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    budgetCard: {
        flex: 1,
        backgroundColor: colors.surfaceHighlight,
        marginHorizontal: 5,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    budgetCardActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    budgetLabel: {
        color: colors.textSecondary,
        marginTop: spacing.sm,
        fontWeight: 'bold',
    },
    budgetLabelActive: {
        color: 'black',
    },
    hint: {
        color: colors.textDisabled,
        fontSize: typography.sizes.xs,
        textAlign: 'center',
        paddingHorizontal: spacing.xl,
    },
    loadingBody: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: colors.text,
        fontSize: typography.sizes.lg,
        fontFamily: typography.fonts.bold,
        marginTop: spacing.md,
    },
    loadingSub: {
        color: colors.textSecondary,
        fontSize: typography.sizes.sm,
        marginTop: 4,
    },
    scrollBody: {
        flex: 1,
    },
    suggestionCard: {
        backgroundColor: colors.surfaceHighlight,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    rankBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: spacing.sm,
    },
    rankText: {
        color: 'black',
        fontSize: 10,
        fontWeight: 'bold',
    },
    itemTitle: {
        color: colors.text,
        fontSize: typography.sizes.lg,
        fontFamily: typography.fonts.bold,
        flex: 1,
    },
    itemDesc: {
        color: colors.textSecondary,
        fontSize: typography.sizes.sm,
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    whyBox: {
        backgroundColor: 'rgba(255,149,0,0.05)',
        padding: spacing.sm,
        borderRadius: borderRadius.sm,
        borderLeftWidth: 2,
        borderLeftColor: colors.primary,
    },
    whyLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 2,
        letterSpacing: 1,
    },
    whyText: {
        color: colors.text,
        fontSize: 12,
        fontStyle: 'italic',
    },
    retryBtn: {
        alignItems: 'center',
        padding: spacing.md,
        marginBottom: spacing.xl,
    },
    retryText: {
        color: colors.primary,
        fontWeight: 'bold',
    },
});
