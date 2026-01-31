import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase, isDemoMode } from '../services/supabase';
import { cancelBirthdayNotifications } from '../services/notifications';
import { BirthdayListItem } from '../components/birthdays/BirthdayListItem';
import { Loading } from '../components/common/Loading';
import { EmptyState } from '../components/common/EmptyState';
import { Birthday, RootStackParamList } from '../types';
import { addYears, differenceInDays } from 'date-fns';
import { colors, spacing, borderRadius, typography, gradients } from '../theme';
import { NextBirthdayCard } from '../components/birthdays/NextBirthdayCard';
import { AddBirthdayModal } from '../components/calendar/AddBirthdayModal';
import { GiftSuggestionsModal } from '../components/gifts/GiftSuggestionsModal';
import { updateWidgetData } from '../services/widget';
import { LinearGradient } from 'expo-linear-gradient';

const FILTERS = ['All', 'This Week', 'This Month'];

export const BirthdaysListScreen = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
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

                        try {
                            // Find the birthday to get notification IDs
                            const birthday = birthdays.find(b => b.id === id);
                            if (birthday) {
                                // Cancel notifications first
                                await cancelBirthdayNotifications(birthday);
                            }

                            // Then delete from database
                            const { error } = await supabase.from('birthdays').delete().eq('id', id);
                            if (error) throw error;

                            setBirthdays(prev => prev.filter(b => b.id !== id));
                        } catch (error: any) {
                            Alert.alert('Error', `Failed to delete birthday: ${error.message}`);
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
        <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
            <View style={styles.header}>
                <View style={styles.topHeader}>
                    <Text style={styles.title}>Birthdays</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            setBirthdayToEdit(undefined);
                            setModalVisible(true);
                        }}
                    >
                        <LinearGradient
                            colors={gradients.primary as any}
                            style={styles.addButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="add" size={24} color="white" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {!isDemoMode && (
                    <>
                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={16} color={colors.textTertiary} />
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
                        onPress={() => navigation.navigate('BirthdayDetail', { birthday: nextBirthday as any })}
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
                        onPress={(item) => navigation.navigate('BirthdayDetail', { birthday: item })}
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
    },
    header: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.sm,
    },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        color: colors.text,
        fontSize: 28, // Reduced from 34
        fontFamily: typography.fonts.heading,
        letterSpacing: 0.5,
    },
    addButton: {
        width: 40, // Reduced from 44
        height: 40, // Reduced from 44
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        backgroundColor: 'rgba(255,255,255,0.08)', // Blur/translucency effect
        height: 40, // Reduced from 44
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.sm,
        color: colors.text,
        fontSize: 16,
    },
    filterContainer: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    filterChip: {
        marginRight: spacing.md, // Increased spacing
        paddingHorizontal: spacing.md, // Reduced padding
        paddingVertical: 8,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surfaceHighlight,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    filterTextActive: {
        color: 'white',
        fontWeight: '700',
    },
    listContent: {
        paddingBottom: spacing.xxl,
    },
});
