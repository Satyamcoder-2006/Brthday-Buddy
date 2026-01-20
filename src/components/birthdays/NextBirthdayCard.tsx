import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Birthday } from '../../types';
import { format, differenceInDays, addYears } from 'date-fns';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';

interface Props {
    birthday: Birthday;
    onPress: () => void;
    onGiftPress?: () => void;
}

export const NextBirthdayCard: React.FC<Props> = ({ birthday, onPress, onGiftPress }) => {
    const bDate = new Date(birthday.birthday_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nextBday = new Date(today.getFullYear(), bDate.getMonth(), bDate.getDate());
    if (nextBday < today) {
        nextBday = addYears(nextBday, 1);
    }

    const diff = differenceInDays(nextBday, today);
    const age = nextBday.getFullYear() - (birthday.birth_year || bDate.getFullYear());

    const imageUrl = birthday.avatar_url && supabase
        ? supabase.storage.from('avatars').getPublicUrl(birthday.avatar_url).data.publicUrl
        : undefined;

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>NEXT UP</Text>
                    </View>
                    <View style={styles.daysBadge}>
                        <Text style={styles.daysBadgeText}>{diff === 0 ? 'TODAY' : `IN ${diff} DAYS`}</Text>
                    </View>
                </View>

                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>{birthday.name}</Text>
                    <Text style={styles.date}>
                        {format(bDate, 'MMMM do')} • Turning {age}
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.relationship}>{birthday.relationship}</Text>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={(e) => {
                            e.stopPropagation();
                            onGiftPress?.();
                        }}
                    >
                        <Text style={styles.actionText}>Gift Ideas</Text>
                        <Ionicons name="sparkles" size={16} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.xl,
        marginHorizontal: spacing.md,
        marginBottom: spacing.xl,
        padding: spacing.lg,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    badge: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
    },
    badgeText: {
        color: '#000000',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    daysBadge: {
        backgroundColor: '#000000',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
    },
    daysBadgeText: {
        color: colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    info: {
        marginBottom: spacing.lg,
        marginTop: spacing.xs,
    },
    name: {
        color: '#000000',
        fontSize: typography.sizes['4xl'],
        fontFamily: typography.fonts.heading,
        textTransform: 'uppercase',
    },
    date: {
        color: 'rgba(0,0,0,0.6)',
        fontSize: typography.sizes.lg,
        fontFamily: typography.fonts.medium,
        marginTop: -4, // Pull closer to the heading for a tighter look
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    relationship: {
        color: '#000000',
        fontSize: typography.sizes.sm,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    actionBtn: {
        backgroundColor: '#000000',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
    },
    actionText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 6,
    },
});
