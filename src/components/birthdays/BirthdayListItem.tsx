import React from 'react';
import { View, Text, Animated, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../common/Avatar';
import { Birthday } from '../../types';
import { supabase } from '../../services/supabase';
import { differenceInDays, addYears, format } from 'date-fns';
import { colors, spacing, typography } from '../../theme';

interface Props {
    item: Birthday;
    onDelete: (id: string, name: string) => void;
    onEdit: (item: Birthday) => void;
    onShare: (item: Birthday) => void;
    onGift: (item: Birthday) => void;
}

export const BirthdayListItem: React.FC<Props> = ({ item, onDelete, onEdit, onShare, onGift }) => {
    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        return (
            <RectButton
                style={styles.editAction}
                onPress={() => onEdit(item)}
            >
                <Ionicons name="pencil" size={24} color="white" />
            </RectButton>
        );
    };

    const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        return (
            <RectButton
                style={styles.deleteAction}
                onPress={() => Alert.alert(
                    'Delete Birthday?',
                    `Are you sure you want to remove ${item.name}?`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id, item.name) }
                    ]
                )}
            >
                <Ionicons name="trash" size={24} color="white" />
            </RectButton>
        );
    };

    const calculateInfo = () => {
        const today = new Date();
        const bDate = new Date(item.birthday_date);

        // Use next birthday date logic
        let nextYear = today.getFullYear();
        let nextBday = new Date(nextYear, bDate.getMonth(), bDate.getDate());

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (nextBday < now) {
            nextBday = addYears(nextBday, 1);
        }

        const diff = differenceInDays(nextBday, now);

        // Calculate age turning this year
        // If we have birth_year, use it. Otherwise default to 0.
        const birthYear = item.birth_year || bDate.getFullYear();
        const age = nextBday.getFullYear() - birthYear;

        return { diff, age, nextBday };
    };

    const info = calculateInfo();
    const imageUrl = item.avatar_url && supabase
        ? supabase.storage.from('avatars').getPublicUrl(item.avatar_url).data.publicUrl
        : undefined;

    return (
        <Swipeable renderRightActions={renderRightActions} renderLeftActions={renderLeftActions}>
            <View style={styles.container}>
                <Avatar name={item.name} uri={imageUrl} />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    </View>

                    <View style={styles.metaRow}>
                        <Text style={styles.date}>
                            {format(new Date(item.birthday_date), 'MMM d')}
                        </Text>
                        <View style={styles.dot} />
                        <Text style={[styles.daysLeft, info.diff <= 7 && styles.daysLeftUrgent]}>
                            {info.diff === 0 ? "Today! 🎉" : `${info.diff} days left`}
                        </Text>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.details} numberOfLines={1}>
                            {item.relationship} • Turning {info.age}
                        </Text>
                    </View>
                </View>

                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => onEdit(item)}
                    >
                        <Ionicons name="pencil" size={20} color={colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => onGift(item)}
                    >
                        <Ionicons name="sparkles" size={20} color={colors.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => onShare(item)}
                    >
                        <Ionicons name="color-palette" size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        </Swipeable>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    content: {
        marginLeft: spacing.md,
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 4,
    },
    name: {
        color: colors.text,
        fontWeight: typography.weights.bold,
        fontSize: typography.sizes.lg,
        lineHeight: 24, // Consistent line height
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        flexWrap: 'wrap',
    },
    date: {
        color: colors.text,
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: colors.textDisabled,
        marginHorizontal: 6,
    },
    daysLeft: {
        color: colors.primary,
        fontWeight: typography.weights.bold,
        fontSize: typography.sizes.sm,
    },
    daysLeftUrgent: {
        color: colors.error,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    details: {
        color: colors.textDisabled,
        fontSize: typography.sizes.xs,
        marginTop: 2,
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: spacing.sm,
    },
    actionBtn: {
        width: 40,
        height: 40,
        marginLeft: 8,
        backgroundColor: colors.surfaceHighlight,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editAction: {
        backgroundColor: colors.info,
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
    },
    deleteAction: {
        backgroundColor: colors.error,
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
    },
});
