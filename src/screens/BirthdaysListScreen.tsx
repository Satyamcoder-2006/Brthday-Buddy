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

export const BirthdaysListScreen = () => {
    const [birthdays, setBirthdays] = useState<Birthday[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const isFocused = useIsFocused();

    const fetchBirthdays = async () => {
        if (isDemoMode) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.from('birthdays').select('*');
        if (error) console.error(error);
        else setBirthdays(data || []);
        setLoading(false);
    };

    useEffect(() => {
        if (isFocused) {
            fetchBirthdays();
        }
    }, [isFocused]);

    const handleDelete = async (id: string, name: string) => {
        if (isDemoMode) return;
        const { error } = await supabase.from('birthdays').delete().eq('id', id);
        if (!error) {
            setBirthdays(prev => prev.filter(b => b.id !== id));
        }
    };

    const handleEdit = (item: Birthday) => {
        if (isDemoMode) {
            Alert.alert('Demo Mode', 'Configure Supabase to edit birthdays');
            return;
        }
        console.log('Edit', item);
    };

    const processedData = useMemo(() => {
        let filtered = birthdays;

        if (search) {
            filtered = filtered.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
        }

        const withDiff = filtered.map(b => {
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

        if (activeFilter === 'This Week') {
            return withDiff.filter(b => b.diff <= 7);
        } else if (activeFilter === 'This Month') {
            const currentMonth = new Date().getMonth();
            return withDiff.filter(b => new Date(b.birthday_date).getMonth() === currentMonth);
        }

        return withDiff;
    }, [birthdays, search, activeFilter]);

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

            {isDemoMode ? (
                <EmptyState
                    message="Configure Supabase in app.json to manage birthdays"
                    icon="cloud-offline-outline"
                />
            ) : (
                <FlatList
                    data={processedData}
                    renderItem={({ item }) => (
                        <BirthdayListItem
                            item={item as any}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    )}
                    keyExtractor={(item: any) => item.id}
                    ListEmptyComponent={<EmptyState message="No birthdays found" />}
                    contentContainerStyle={styles.listContent}
                />
            )}
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
        paddingBottom: spacing.lg,
    },
});
