import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Birthday } from '../../types';
import { format, differenceInDays, addYears } from 'date-fns';
import { colors, spacing, borderRadius, typography, gradients } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

    return (
        <TouchableOpacity style={styles.touchable} onPress={onPress} activeOpacity={0.9}>
            <LinearGradient
                colors={gradients.primary as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>NEXT UP</Text>
                        </View>
                        <View style={styles.daysBadge}>
                            <Ionicons name="time-outline" size={12} color="black" style={{ marginRight: 4 }} />
                            <Text style={styles.daysBadgeText}>{diff === 0 ? 'TODAY' : `IN ${diff} DAYS`}</Text>
                        </View>
                    </View>

                    <View style={styles.info}>
                        <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>{birthday.name}</Text>
                        <Text style={styles.date}>
                            {format(bDate, 'MMMM do')} • Turning <Text style={styles.ageHighlight}>{age}</Text>
                        </Text>
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.relationshipContainer}>
                            <Ionicons name="people" size={14} color="rgba(0,0,0,0.5)" style={{ marginRight: 4 }} />
                            <Text style={styles.relationship}>{birthday.relationship}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={(e) => {
                                e.stopPropagation();
                                onGiftPress?.();
                            }}
                        >
                            <Text style={styles.actionText}>Gift Ideas</Text>
                            <Ionicons name="sparkles" size={14} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
                {/* Decorative background element */}
                <View style={styles.decoration} />
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    touchable: {
        marginHorizontal: spacing.md,
        marginBottom: spacing.xl,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    container: {
        borderRadius: borderRadius.xxl,
        padding: spacing.xl,
        overflow: 'hidden',
        position: 'relative',
    },
    content: {
        flex: 1,
        zIndex: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: spacing.sm,
        paddingVertical: 5,
        borderRadius: borderRadius.sm,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
    },
    daysBadge: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: borderRadius.full,
    },
    daysBadgeText: {
        color: '#000000',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    info: {
        marginBottom: spacing.xl,
        marginTop: spacing.sm,
    },
    name: {
        color: '#FFFFFF',
        fontSize: typography.sizes['4xl'],
        fontFamily: typography.fonts.heading,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    date: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: typography.sizes.lg,
        fontFamily: typography.fonts.medium,
        marginTop: -6,
    },
    ageHighlight: {
        color: '#FFFFFF',
        fontWeight: '900',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    relationshipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    relationship: {
        color: 'rgba(0,0,0,0.6)',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    actionBtn: {
        backgroundColor: 'rgba(0,0,0,0.2)', // Translucent
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    actionText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
        marginRight: 6,
    },
    decoration: {
        position: 'absolute',
        right: -50,
        top: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.15)',
        zIndex: 1,
    }
});
