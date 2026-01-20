import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase, isDemoMode } from '../services/supabase';
import { BirthdayListItem } from '../components/birthdays/BirthdayListItem';
import { Loading } from '../components/common/Loading';
import { EmptyState } from '../components/common/EmptyState';
import { Birthday } from '../types';
import { addYears, differenceInDays } from 'date-fns';
import { colors, spacing, borderRadius, typography } from '../theme';

const FILTERS = ['All', 'This Week', 'This Month'];

import { NextBirthdayCard } from '../components/birthdays/NextBirthdayCard';
import { AddBirthdayModal } from '../components/calendar/AddBirthdayModal';
import { GiftSuggestionsModal } from '../components/gifts/GiftSuggestionsModal';
import { updateWidgetData } from '../services/widget';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

export const BirthdaysListScreen = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [birthdays, setBirthdays] = useState<Birthday[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [modalVisible, setModalVisible] = useState(false);
    const [giftModalVisible, setGiftModalVisible] = useState(false);
    const [selectedBirthday, setSelectedBirthday] = useState<Birthday | null>(null);
    const [birthdayToEdit, setBirthdayToEdit] = useState<Birthday | undefined>(undefined);
    const isFocused = useIsFocused();

    const fetchBirthdays = async () => {
        if (isDemoMode) {
            const mock = [
                { id: '1', name: 'John Doe', birthday_date: '1990-01-20', relationship: 'Friend' as const, notes: 'Loves spicy food and hiking', user_id: 'demo' },
                { id: '2', name: 'Jane Smith', birthday_date: '1992-05-15', relationship: 'Family' as const, notes: 'Enjoys reading and coffee', user_id: 'demo' },
            ];
            setBirthdays(mock);
            updateWidgetData(mock);
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.from('birthdays').select('*');
        if (error) console.error(error);
        else {
            const list = data || [];
            setBirthdays(list);
            updateWidgetData(list);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isFocused) {
            fetchBirthdays();
        }
    }, [isFocused]);

    const handleDelete = async (id: string, name: string) => {
        Alert.alert(
            'Delete Birthday',
            `Are you sure you want to delete ${name}'s birthday?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        if (isDemoMode) {
                            setBirthdays(prev => prev.filter(b => b.id !== id));
                            return;
                        }
                        const { error } = await supabase.from('birthdays').delete().eq('id', id);
                        if (!error) {
                            setBirthdays(prev => prev.filter(b => b.id !== id));
                        }
                    }
                }
            ]
        );
    };

    const handleEdit = (item: Birthday) => {
        setBirthdayToEdit(item);
        setModalVisible(true);
    };

    const handleShare = (item: Birthday) => {
        navigation.navigate('SocialShare', { birthday: item });
    };

    const handleGift = (item: Birthday) => {
        setSelectedBirthday(item);
        setGiftModalVisible(true);
    };

    const sortedData = useMemo(() => {
        const withDiff = birthdays.map(b => {
            const today = new Date();
            const bDate = new Date(b.birthday_date);
            let nextBday = new Date(today.getFullYear(), bDate.getMonth(), bDate.getDate());
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            if (nextBday < now) {
                nextBday = addYears(nextBday, 1);
            }
            const diff = differenceInDays(nextBday, now);
            return { ...b, diff };
        });

        withDiff.sort((a, b) => a.diff - b.diff);
        return withDiff;
    }, [birthdays]);

    const nextBirthday = sortedData.length > 0 && activeFilter === 'All' && !search ? sortedData[0] : null;

    const processedData = useMemo(() => {
        let filtered = sortedData;

        // If we're showing "Next Up" card, remove it from the list
        if (nextBirthday) {
            filtered = filtered.filter(b => b.id !== nextBirthday.id);
        }

        if (search) {
            filtered = filtered.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
        }

        if (activeFilter === 'This Week') {
            return filtered.filter(b => b.diff <= 7);
        } else if (activeFilter === 'This Month') {
            const currentMonth = new Date().getMonth();
            return filtered.filter(b => new Date(b.birthday_date).getMonth() === currentMonth);
        }

        return filtered;
    }, [sortedData, search, activeFilter, nextBirthday]);

    if (loading && birthdays.length === 0 && !isDemoMode) return <Loading />;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Birthdays</Text>

                {!isDemoMode && (
                    <>
                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color={colors.textDisabled} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search"
                                placeholderTextColor={colors.textDisabled}
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>

                        <View style={styles.filterContainer}>
                            {FILTERS.map(f => (
                                <TouchableOpacity
                                    key={f}
                                    onPress={() => setActiveFilter(f)}
                                    style={[
                                        styles.filterChip,
                                        activeFilter === f && styles.filterChipActive
                                    ]}
                                >
                                    <Text style={[
                                        styles.filterText,
                                        activeFilter === f && styles.filterTextActive
                                    ]}>
                                        {f}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}
            </View>

            <FlatList
                data={processedData}
                ListHeaderComponent={nextBirthday ? (
                    <NextBirthdayCard
                        birthday={nextBirthday as any}
                        onPress={() => handleShare(nextBirthday as any)}
                        onGiftPress={() => handleGift(nextBirthday as any)}
                    />
                ) : null}
                renderItem={({ item }) => (
                    <BirthdayListItem
                        item={item as any}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onShare={handleShare}
                        onGift={handleGift}
                    />
                )}
                keyExtractor={(item: any) => item.id}
                ListEmptyComponent={
                    <EmptyState
                        message="No birthdays found"
                        onAction={() => {
                            setBirthdayToEdit(undefined);
                            setModalVisible(true);
                        }}
                        actionLabel="Add Birthday"
                    />
                }
                contentContainerStyle={styles.listContent}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => {
                    setBirthdayToEdit(undefined);
                    setModalVisible(true);
                }}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>

            <AddBirthdayModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={fetchBirthdays}
                birthdayToEdit={birthdayToEdit}
            />

            <GiftSuggestionsModal
                visible={giftModalVisible}
                onClose={() => setGiftModalVisible(false)}
                birthday={selectedBirthday}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: spacing.xxl,
    },
    header: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    title: {
        color: colors.text,
        fontSize: typography.sizes['4xl'],
        fontFamily: typography.fonts.heading,
        marginBottom: spacing.sm,
        letterSpacing: 1,
    },
    searchContainer: {
        backgroundColor: colors.surfaceHighlight,
        height: 40,
        borderRadius: borderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm + 4,
        marginBottom: spacing.md,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.sm,
        color: colors.text,
    },
    filterContainer: {
        flexDirection: 'row',
    },
    filterChip: {
        marginRight: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.borderLight,
        backgroundColor: 'transparent',
    },
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterText: {
        color: colors.textDisabled,
    },
    filterTextActive: {
        color: colors.text,
        fontWeight: typography.weights.bold,
    },
    listContent: {
        paddingBottom: spacing.lg + 80,
    },
    fab: {
        position: 'absolute',
        bottom: spacing.lg,
        right: spacing.lg,
        width: 56,
        height: 56,
        backgroundColor: colors.primary,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
