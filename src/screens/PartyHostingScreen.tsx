import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { colors, spacing, borderRadius, typography } from '../theme';
import { RootStackParamList } from '../types';
import { createParty } from '../services/PartyService';
import { Button } from '../components/common/Button';

type PartyHostingScreenRouteProp = RouteProp<RootStackParamList, 'PartyHosting'>;
type PartyHostingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PartyHosting'>;

const THEMES = ['Casual', 'Formal', 'Themed', 'Surprise', 'Outdoor', 'Virtual'];

export const PartyHostingScreen = () => {
    const navigation = useNavigation<PartyHostingScreenNavigationProp>();
    const route = useRoute<PartyHostingScreenRouteProp>();
    const insets = useSafeAreaInsets();
    const { birthdayId } = route.params || {};

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
    const [venueName, setVenueName] = useState('');
    const [venueAddress, setVenueAddress] = useState('');
    const [maxGuests, setMaxGuests] = useState('50');
    const [theme, setTheme] = useState('Casual');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onDateChange = (event: any, selectedDate?: Date) => {
        // Platform specific handling for better stability
        const isAndroid = Platform.OS === 'android';

        if (event.type === 'dismissed') {
            setShowDatePicker(false);
            return;
        }

        if (selectedDate) {
            const currentSelectedDate = selectedDate;

            if (isAndroid && pickerMode === 'date') {
                // If we just finished selecting date on Android, show time picker next
                setDate(currentSelectedDate);
                setPickerMode('time');
                // We keep showDatePicker true but change the mode
            } else {
                // We reached the end of selection (Time on Android, or Datetime on iOS)
                setDate(currentSelectedDate);
                setShowDatePicker(false);
                setPickerMode('date'); // Reset for next time
            }
        } else {
            setShowDatePicker(false);
        }
    };

    const handleDatePress = () => {
        setPickerMode('date');
        setShowDatePicker(true);
    };

    const handleCreateParty = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a party title');
            return;
        }

        if (new Date(date) < new Date()) {
            Alert.alert('Error', 'Party date must be in the future');
            return;
        }

        const guestCount = parseInt(maxGuests);
        if (isNaN(guestCount) || guestCount < 1 || guestCount > 500) {
            Alert.alert('Error', 'Max guests must be between 1 and 500');
            return;
        }

        setIsSubmitting(true);
        try {
            const party = await createParty({
                title: title.trim(),
                description: description.trim() || undefined,
                party_date: date.toISOString(),
                venue_name: venueName.trim() || undefined,
                venue_address: venueAddress.trim() || undefined,
                max_guests: guestCount,
                theme,
                birthday_id: birthdayId,
            });

            Alert.alert('Success', 'Party created! 🎉', [
                { text: 'OK', onPress: () => navigation.replace('PartyDetail', { partyId: party.id }) }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create party');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Host Birthday Party</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Party Title *</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g., John's 30th Birthday Bash"
                        placeholderTextColor={colors.textDisabled}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Tell guests what to expect..."
                        placeholderTextColor={colors.textDisabled}
                        multiline
                        numberOfLines={3}
                    />
                    <Text style={styles.charCount}>{description.length}/200</Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Party Date & Time *</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={handleDatePress}
                    >
                        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                        <Text style={styles.dateText}>
                            {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode={Platform.OS === 'android' ? pickerMode : 'datetime'}
                            is24Hour={true}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onDateChange}
                        />
                    )}
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Venue Name</Text>
                    <TextInput
                        style={styles.input}
                        value={venueName}
                        onChangeText={setVenueName}
                        placeholder="e.g., The Garden Restaurant"
                        placeholderTextColor={colors.textDisabled}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Venue Address</Text>
                    <TextInput
                        style={styles.input}
                        value={venueAddress}
                        onChangeText={setVenueAddress}
                        placeholder="Full address or location"
                        placeholderTextColor={colors.textDisabled}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Max Guests *</Text>
                    <TextInput
                        style={styles.input}
                        value={maxGuests}
                        onChangeText={setMaxGuests}
                        keyboardType="number-pad"
                        placeholder="50"
                        placeholderTextColor={colors.textDisabled}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Theme</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={theme}
                            onValueChange={setTheme}
                            style={styles.picker}
                        >
                            {THEMES.map(t => (
                                <Picker.Item key={t} label={t} value={t} />
                            ))}
                        </Picker>
                    </View>
                </View>

                <Button
                    title="Create Party"
                    onPress={handleCreateParty}
                    loading={isSubmitting}
                    style={styles.submitButton}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        paddingBottom: spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        marginRight: spacing.md,
    },
    headerTitle: {
        fontSize: typography.sizes.xl,
        fontFamily: typography.fonts.heading,
        color: colors.primary,
    },
    form: {
        padding: spacing.lg,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    input: {
        backgroundColor: colors.surfaceHighlight,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.borderLight,
        padding: spacing.md,
        fontSize: typography.sizes.base,
        color: colors.text,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: typography.sizes.xs,
        color: colors.textDisabled,
        textAlign: 'right',
        marginTop: 4,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceHighlight,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.borderLight,
        padding: spacing.md,
    },
    dateText: {
        marginLeft: spacing.sm,
        fontSize: typography.sizes.base,
        color: colors.text,
    },
    pickerContainer: {
        backgroundColor: colors.surfaceHighlight,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.borderLight,
        overflow: 'hidden',
    },
    picker: {
        color: colors.text,
    },
    submitButton: {
        marginTop: spacing.md,
    },
});
