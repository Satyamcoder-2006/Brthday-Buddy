import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase, isDemoMode } from '../services/supabase';
import { AddBirthdayModal } from '../components/calendar/AddBirthdayModal';
import { DaySummaryModal } from '../components/calendar/DaySummaryModal';
import { GiftSuggestionsModal } from '../components/gifts/GiftSuggestionsModal';
import { Loading } from '../components/common/Loading';
import { colors, spacing, typography, borderRadius } from '../theme';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';

export const CalendarScreen = () => {
    const [birthdays, setBirthdays] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [modalVisible, setModalVisible] = useState(false);
    const [summaryVisible, setSummaryVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const [birthdayToEdit, setBirthdayToEdit] = useState<any>(undefined);
    const [giftModalVisible, setGiftModalVisible] = useState(false);
    const [selectedBirthday, setSelectedBirthday] = useState<any>(null);

    const handleGift = (birthday: any) => {
        setSelectedBirthday(birthday);
        setGiftModalVisible(true);
    };

    const fetchBirthdays = async () => {
        try {
            if (isDemoMode) {
                setBirthdays([
                    { id: '1', name: 'John Doe', birthday_date: '1990-01-20', relationship: 'Friend', notes: 'Loves spicy food and hiking', user_id: 'demo' },
                    { id: '2', name: 'Jane Smith', birthday_date: '1992-05-15', relationship: 'Family', notes: 'Enjoys reading and coffee', user_id: 'demo' },
                    { id: '3', name: 'Bob Wilson', birthday_date: '1985-11-30', relationship: 'Colleague', notes: 'Tech enthusiast', user_id: 'demo' },
                ]);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase.from('birthdays').select('*');
            if (error) throw error;
            setBirthdays(data || []);
        } catch (e: any) {
            console.log('Error fetching birthdays', e.message);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBirthdays();
        }, [])
    );

    const getBirthdaysForDay = (date: Date) => {
        return birthdays.filter(b => {
            const bDate = new Date(b.birthday_date);
            return bDate.getMonth() === date.getMonth() && bDate.getDate() === date.getDate();
        });
    };

    const hasBirthday = (date: Date) => {
        return getBirthdaysForDay(date).length > 0;
    };

    const onDayPress = (date: Date) => {
        setSelectedDate(date);
        const dayBirthdays = getBirthdaysForDay(date);
        if (dayBirthdays.length > 0) {
            setSummaryVisible(true);
        } else {
            setBirthdayToEdit(undefined);
            setModalVisible(true);
        }
    };

    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const renderCalendar = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

        // Pad beginning with empty cells
        const startDay = monthStart.getDay();
        const paddingDays = Array(startDay).fill(null);

        return (
            <View style={styles.calendarContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
                        <Ionicons name="chevron-back" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.monthText}>{format(currentMonth, 'MMMM yyyy')}</Text>
                    <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
                        <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Day names */}
                <View style={styles.dayNamesRow}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <View key={day} style={styles.dayNameContainer}>
                            <Text style={styles.dayName}>{day}</Text>
                        </View>
                    ))}
                </View>

                {/* Calendar grid */}
                <View style={styles.daysGrid}>
                    {paddingDays.map((_, i) => (
                        <View key={`pad-${i}`} style={styles.dayCell} />
                    ))}
                    {days.map(day => {
                        const isSelected = isSameDay(day, selectedDate);
                        const isTodayDate = isToday(day);
                        const hasBday = hasBirthday(day);

                        return (
                            <TouchableOpacity
                                key={day.toISOString()}
                                style={[
                                    styles.dayCell,
                                    isSelected && styles.selectedDay,
                                    isTodayDate && styles.todayDay,
                                ]}
                                onPress={() => onDayPress(day)}
                            >
                                <Text style={[
                                    styles.dayText,
                                    isSelected && styles.selectedDayText,
                                    isTodayDate && styles.todayDayText,
                                ]}>
                                    {format(day, 'd')}
                                </Text>
                                {hasBday && <View style={styles.birthdayDot} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        );
    };

    if (loading && birthdays.length === 0 && !isDemoMode) return <Loading />;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {renderCalendar()}
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => {
                    setBirthdayToEdit(undefined);
                    setModalVisible(true);
                }}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>

            <AddBirthdayModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                initialDate={format(selectedDate, 'yyyy-MM-dd')}
                onSuccess={fetchBirthdays}
                birthdayToEdit={birthdayToEdit}
            />

            <DaySummaryModal
                visible={summaryVisible}
                onClose={() => setSummaryVisible(false)}
                date={format(selectedDate, 'MMMM d')}
                birthdays={getBirthdaysForDay(selectedDate)}
                onAddBirthday={() => {
                    setSummaryVisible(false);
                    setBirthdayToEdit(undefined);
                    setModalVisible(true);
                }}
                onEditBirthday={(birthday) => {
                    setSummaryVisible(false);
                    setBirthdayToEdit(birthday);
                    setModalVisible(true);
                }}
                onGiftBirthday={handleGift}
                onDeleteSuccess={fetchBirthdays}
            />

            <GiftSuggestionsModal
                visible={giftModalVisible}
                onClose={() => setGiftModalVisible(false)}
                birthday={selectedBirthday}
            />
        </View>
    );
};

const { width } = Dimensions.get('window');
// contentWidth and cellSize removed - using percentage widths instead

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    calendarContainer: {
        padding: spacing.md,
        paddingVertical: spacing.xl,
        backgroundColor: colors.surface, // Card-like background
        borderRadius: borderRadius.xl,
        margin: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
    },
    navButton: {
        padding: spacing.sm,
        backgroundColor: colors.surfaceHighlight,
        borderRadius: borderRadius.lg,
    },
    monthText: {
        color: colors.text,
        fontSize: typography.sizes['3xl'],
        fontFamily: typography.fonts.heading,
        letterSpacing: 1,
        textTransform: 'capitalize',
    },
    dayNamesRow: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
        // Removed space-between to align perfectly with grid
    },
    dayNameContainer: {
        width: '14.28%', // 100% / 7
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayName: {
        textAlign: 'center',
        color: colors.textSecondary,
        fontSize: typography.sizes.sm,
        fontFamily: typography.fonts.medium,
        textTransform: 'uppercase',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%', // 100% / 7
        height: 65,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginVertical: 0,
    },
    selectedDay: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.full, // Circle for selected
    },
    todayDay: {
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: borderRadius.full,
    },
    dayText: {
        color: colors.text,
        fontSize: typography.sizes.lg,
        fontFamily: typography.fonts.medium,
    },
    selectedDayText: {
        color: '#000000',
        fontFamily: typography.fonts.bold,
    },
    todayDayText: {
        color: colors.primary,
        fontFamily: typography.fonts.bold,
    },
    birthdayDot: {
        position: 'absolute',
        bottom: 6,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.text, // White dot on selected
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
