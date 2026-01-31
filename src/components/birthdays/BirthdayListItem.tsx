import React from 'react';
import { View, Text, Animated, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../common/Avatar';
import { Birthday } from '../../types';
import { supabase } from '../../services/supabase';
import { differenceInDays, addYears, format } from 'date-fns';
import { colors, spacing, typography, borderRadius, gradients } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
    item: Birthday;
    onDelete: (id: string, name: string) => void;
    onEdit: (item: Birthday) => void;
    onShare: (item: Birthday) => void;
    onGift: (item: Birthday) => void;
    onPress: (item: Birthday) => void;
}

export const BirthdayListItem: React.FC<Props> = ({ item, onDelete, onEdit, onShare, onGift, onPress }) => {
    // ... existing renderRightActions/renderLeftActions ... (wait, I should keep them but I'll update styles later)
    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const scale = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0.5],
            extrapolate: 'clamp',
        });
        return (
            <RectButton
                style={styles.editAction}
                onPress={() => onEdit(item)}
            >
                <Animated.View style={{ transform: [{ scale }] }}>
                    <Ionicons name="pencil" size={24} color="white" />
                </Animated.View>
            </RectButton>
        );
    };

    const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const scale = dragX.interpolate({
            inputRange: [0, 100],
            outputRange: [0.5, 1],
            extrapolate: 'clamp',
        });
        return (
            <RectButton
                style={styles.deleteAction}
                onPress={() => Alert.alert(
                    'Delete Birthday?',
                    `Are you sure?`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id, item.name) }
                    ]
                )}
            >
                <Animated.View style={{ transform: [{ scale }] }}>
                    <Ionicons name="trash" size={24} color="white" />
                </Animated.View>
            </RectButton>
        );
    };

    const calculateInfo = () => {
        const today = new Date();
        const bDate = new Date(item.birthday_date);
        let nextYear = today.getFullYear();
        let nextBday = new Date(nextYear, bDate.getMonth(), bDate.getDate());
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        if (nextBday < now) {
            nextBday = addYears(nextBday, 1);
        }
        const diff = differenceInDays(nextBday, now);
        let age = null;
        if (item.birth_year && item.birth_year !== 0 && item.birth_year !== 1900) {
            age = nextBday.getFullYear() - item.birth_year;
        }
        return { diff, age, nextBday };
    };

    const info = calculateInfo();
    const imageUrl = item.avatar_url && supabase
        ? supabase.storage.from('avatars').getPublicUrl(item.avatar_url).data.publicUrl
        : undefined;

    return (
        <Swipeable
            renderRightActions={renderRightActions}
            renderLeftActions={renderLeftActions}
        >
            <TouchableOpacity
                style={styles.container}
                onPress={() => onPress(item)}
                activeOpacity={0.8}
            >
                <View style={styles.avatarContainer}>
                    <Avatar name={item.name} uri={imageUrl} size="md" />
                </View>

                <View style={styles.content}>
                    <View style={styles.mainInfo}>
                        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.details}>
                            {item.relationship} {info.age ? `• Turning ${info.age}` : ''}
                        </Text>
                    </View>

                    <View style={styles.dateInfo}>
                        <Text style={styles.date}>
                            {format(new Date(item.birthday_date), 'MMM d')}
                        </Text>
                        <View style={[
                            styles.countdownBadge,
                            info.diff === 0 && styles.countdownToday,
                            (info.diff > 0 && info.diff <= 7) && styles.countdownUrgent
                        ]}>
                            <Text style={[
                                styles.countdownText,
                                info.diff <= 7 && styles.countdownTextHigh
                            ]}>
                                {info.diff === 0 ? "Today" : `${info.diff}d`}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.miniAction, { backgroundColor: colors.surfaceHighlight }]}
                        onPress={() => onGift(item)}
                    >
                        <Ionicons name="sparkles" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.miniAction, { backgroundColor: colors.surfaceHighlight }]}
                        onPress={() => onShare(item)}
                    >
                        <Ionicons name="color-palette" size={18} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Swipeable>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        marginHorizontal: spacing.md,
        marginVertical: spacing.sm, // Increased from xs
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.borderLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    avatarContainer: {
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: spacing.md,
    },
    mainInfo: {
        flex: 1,
    },
    name: {
        color: colors.text,
        fontWeight: '800', // Increased form 700
        fontSize: typography.sizes.base,
        letterSpacing: 0.5,
    },
    details: {
        color: colors.textSecondary,
        fontSize: typography.sizes.xs,
        marginTop: 2,
        opacity: 0.7, // Added opacity
    },
    dateInfo: {
        alignItems: 'flex-end',
        marginHorizontal: spacing.sm,
    },
    date: {
        color: colors.text,
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
    },
    countdownBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: borderRadius.xs,
        backgroundColor: colors.surfaceElevated,
    },
    countdownUrgent: {
        backgroundColor: 'rgba(255, 69, 58, 0.15)',
    },
    countdownToday: {
        backgroundColor: 'rgba(50, 215, 75, 0.15)',
    },
    countdownText: {
        color: colors.text, // Better contrast (was textSecondary)
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    countdownTextHigh: {
        color: colors.error,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    miniAction: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    editAction: {
        backgroundColor: colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        height: '85%',
        alignSelf: 'center',
        borderRadius: borderRadius.md,
        marginRight: spacing.sm,
    },
    deleteAction: {
        backgroundColor: colors.error,
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        height: '85%',
        alignSelf: 'center',
        borderRadius: borderRadius.md,
        marginLeft: spacing.sm,
    },
});
