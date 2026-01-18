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
}

export const BirthdayListItem: React.FC<Props> = ({ item, onDelete, onEdit }) => {
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
    const imageUrl = item.avatar_url
        ? supabase.storage.from('avatars').getPublicUrl(item.avatar_url).data.publicUrl
        : undefined;

    return (
        <Swipeable renderRightActions={renderRightActions} renderLeftActions={renderLeftActions}>
            <View style={styles.container}>
                <Avatar name={item.name} uri={imageUrl} />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.name}>{item.name}</Text>
                        <TouchableOpacity
                            onPress={() => Alert.alert(
                                'Delete Birthday?',
                                `Are you sure you want to remove ${item.name}?`,
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id, item.name) }
                                ]
                            )}
                            style={styles.deleteBtn}
                        >
                            <Ionicons name="trash-outline" size={20} color={colors.error} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.date}>
                        {format(new Date(item.birthday_date), 'MMM d')} • {info.diff === 0 ?
                            <Text style={styles.today}>Today! 🎉</Text> :
                            `${info.diff} days left`
                        }
                    </Text>

                    <Text style={styles.details}>
                        {item.relationship} • 🎂 Turning {info.age}
                    </Text>
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
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        color: colors.text,
        fontWeight: typography.weights.bold,
        fontSize: typography.sizes.lg,
    },
    date: {
        color: colors.textDisabled,
        fontSize: typography.sizes.sm,
        marginBottom: 4,
    },
    today: {
        color: colors.primary,
        fontWeight: typography.weights.bold,
    },
    details: {
        color: colors.textDisabled,
        fontSize: typography.sizes.xs,
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
    deleteBtn: {
        padding: spacing.xs,
    },
});
