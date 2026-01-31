import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { supabase } from '../../services/supabase';
import { scheduleBirthdayNotifications } from '../../services/notifications';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { format } from 'date-fns';

interface AddBirthdayModalProps {
    visible: boolean;
    onClose: () => void;
    initialDate?: string;
    onSuccess?: () => void;
    birthdayToEdit?: any; // or Birthday type
    extractedData?: { name?: string; date?: string; notes?: string };
}

const birthdaySchema = Yup.object({
    name: Yup.string().required('Name is required').max(50),
    relationship: Yup.string().required('Relationship is required'),
    notes: Yup.string().max(200).nullable(),
    birthYear: Yup.string().nullable(), // 'unknown' or a year string
});

const RELATIONSHIPS = ['Friend', 'Family', 'Colleague', 'Other'];

export const AddBirthdayModal: React.FC<AddBirthdayModalProps> = ({
    visible,
    onClose,
    initialDate,
    onSuccess,
    birthdayToEdit,
    extractedData
}) => {
    const [avatar, setAvatar] = useState<string | null>(null);
    const [date, setDate] = useState(initialDate || format(new Date(), 'yyyy-MM-dd'));

    // Memoize year options for better performance
    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = ['unknown']; // Default option
        for (let year = currentYear; year >= 1900; year--) {
            years.push(year.toString());
        }
        return years;
    }, []);

    useEffect(() => {
        if (visible) {
            if (birthdayToEdit) {
                setDate(birthdayToEdit.birthday_date);
                setAvatar(birthdayToEdit.avatar_url ? supabase.storage.from('avatars').getPublicUrl(birthdayToEdit.avatar_url).data.publicUrl : null);
            } else if (extractedData) {
                // Pre-fill from AI extracted data
                setAvatar(null);
                if (extractedData.date) setDate(extractedData.date);
                else setDate(format(new Date(), 'yyyy-MM-dd'));
            } else {
                setAvatar(null);
                if (initialDate) setDate(initialDate);
                else setDate(format(new Date(), 'yyyy-MM-dd'));
            }
        }
    }, [visible, initialDate, birthdayToEdit, extractedData]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
        }
    };

    const handleSave = async (values: any) => {
        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error('Not authenticated');

            let avatarUrl = birthdayToEdit?.avatar_url || null;
            if (avatar && avatar !== (birthdayToEdit?.avatar_url ? supabase.storage.from('avatars').getPublicUrl(birthdayToEdit.avatar_url).data.publicUrl : null)) {
                if (avatar.startsWith('http')) {
                    // Already uploaded or public URL
                } else {
                    const fileName = `${user.id}/${Date.now()}.jpg`;
                    const formData = new FormData();
                    formData.append('file', {
                        uri: avatar,
                        name: 'photo.jpg',
                        type: 'image/jpeg',
                    } as any);

                    const { error: uploadError } = await supabase.storage
                        .from('avatars')
                        .upload(fileName, formData);

                    if (uploadError) throw uploadError;
                    avatarUrl = fileName;
                }
            }

            // Calculate birth year
            let birthYear = null;
            let finalYearStr = '1900'; // Default safe year for DB

            if (values.birthYear && values.birthYear !== 'unknown') {
                birthYear = parseInt(values.birthYear);
                finalYearStr = values.birthYear;
            }

            // Construct valid DB date (YYYY-MM-DD)
            // Handle if date is "0000-06-20" or just "06-20" (from extraction)
            // We assume 'date' state holds at least "-MM-DD" or "YYYY-MM-DD"
            const dateParts = date.split('-');
            // If we have at least 3 parts (YYYY, MM, DD)
            let month = '01';
            let day = '01';

            if (dateParts.length >= 3) {
                // [year, month, day]
                month = dateParts[1];
                day = dateParts[2];
            } else if (dateParts.length === 2 && date.startsWith('-')) {
                // [-MM, DD] ? unlikely format from normalizeDate
                // normalizeDate returns "0000-MM-DD"
            }

            const finalDate = `${finalYearStr}-${month}-${day}`;
            console.log(`Saving Birthday: Date=${finalDate}, Year=${birthYear}`);

            const payload = {
                user_id: user.id,
                name: values.name,
                birthday_date: finalDate,
                relationship: values.relationship,
                notes: values.notes,
                avatar_url: avatarUrl,
                birth_year: birthYear,
            };

            let data, error;
            if (birthdayToEdit) {
                const { data: updateData, error: updateError } = await supabase
                    .from('birthdays')
                    .update(payload)
                    .eq('id', birthdayToEdit.id)
                    .select()
                    .single();
                data = updateData;
                error = updateError;
            } else {
                const { data: insertData, error: insertError } = await supabase
                    .from('birthdays')
                    .insert(payload)
                    .select()
                    .single();
                data = insertData;
                error = insertError;
            }

            if (error) throw error;

            await scheduleBirthdayNotifications(data);

            Alert.alert('Success', birthdayToEdit ? 'Birthday updated!' : 'Birthday added!');
            onSuccess?.();
            onClose();
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>
                            {initialDate ? `Add Birthday for ${initialDate}` : 'Add Birthday'}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                        <View style={styles.avatarSection}>
                            <TouchableOpacity onPress={pickImage} style={styles.avatarButton}>
                                {avatar ? (
                                    <Image source={{ uri: avatar }} style={styles.avatarImage} />
                                ) : (
                                    <Ionicons name="camera" size={32} color={colors.textDisabled} />
                                )}
                            </TouchableOpacity>
                            <Text style={styles.avatarLabel}>Add Photo</Text>
                        </View>

                        <Formik
                            initialValues={{
                                name: birthdayToEdit?.name || extractedData?.name || '',
                                relationship: birthdayToEdit?.relationship || 'Friend',
                                notes: birthdayToEdit?.notes || extractedData?.notes || '',
                                birthYear: birthdayToEdit?.birth_year
                                    ? birthdayToEdit.birth_year.toString()
                                    : (extractedData?.date && extractedData.date.startsWith('0000')) ? 'unknown' : ''
                            }}
                            validationSchema={birthdaySchema}
                            onSubmit={handleSave}
                            enableReinitialize={true}
                        >
                            {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched, isSubmitting }) => (
                                <View>
                                    <Input
                                        label="Name"
                                        value={values.name}
                                        onChangeText={handleChange('name')}
                                        onBlur={handleBlur('name')}
                                        error={touched.name && errors.name ? errors.name as string : undefined}
                                    />

                                    {/* Birth Year Picker */}
                                    <View style={styles.yearPickerSection}>
                                        <Text style={styles.yearPickerLabel}>Birth Year (Optional)</Text>
                                        <View style={styles.pickerContainer}>
                                            <Picker
                                                selectedValue={values.birthYear || 'unknown'}
                                                onValueChange={(value) => setFieldValue('birthYear', value)}
                                                style={styles.picker}
                                                dropdownIconColor={colors.primary}
                                            >
                                                {yearOptions.map((year) => (
                                                    <Picker.Item
                                                        key={year}
                                                        label={year === 'unknown' ? 'Unknown' : year}
                                                        value={year}
                                                        color={colors.text}
                                                    />
                                                ))}
                                            </Picker>
                                        </View>
                                    </View>

                                    <View style={styles.relationshipSection}>
                                        <Text style={styles.relationshipLabel}>Relationship</Text>
                                        <View style={styles.relationshipContainer}>
                                            {RELATIONSHIPS.map(rel => (
                                                <TouchableOpacity
                                                    key={rel}
                                                    onPress={() => setFieldValue('relationship', rel)}
                                                    style={[
                                                        styles.relationshipChip,
                                                        values.relationship === rel && styles.relationshipChipActive
                                                    ]}
                                                >
                                                    <Text style={[
                                                        styles.relationshipText,
                                                        values.relationship === rel && styles.relationshipTextActive
                                                    ]}>
                                                        {rel}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    <Input
                                        label="Notes"
                                        value={values.notes}
                                        onChangeText={handleChange('notes')}
                                        onBlur={handleBlur('notes')}
                                        multiline={true}
                                        numberOfLines={3}
                                        style={styles.notesInput}
                                    />

                                    <Button
                                        title="Save Birthday"
                                        onPress={handleSubmit as any}
                                        loading={isSubmitting}
                                        style={styles.saveButton}
                                    />
                                    <Button
                                        title="Cancel"
                                        variant="ghost"
                                        onPress={onClose}
                                        style={styles.cancelButton}
                                    />
                                </View>
                            )}
                        </Formik>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        borderTopWidth: 1,
        borderColor: colors.borderLight,
        height: '85%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        color: colors.text,
        fontSize: typography.sizes['2xl'],
        fontFamily: typography.fonts.heading,
        letterSpacing: 1,
    },
    content: {
        padding: spacing.md,
    },
    scrollContent: {
        paddingBottom: spacing.xxl,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    avatarButton: {
        width: 96,
        height: 96,
        borderRadius: borderRadius.full,
        backgroundColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.borderLight,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarLabel: {
        color: colors.textDisabled,
        marginTop: spacing.sm,
        fontSize: typography.sizes.sm,
    },
    relationshipSection: {
        marginBottom: spacing.md,
    },
    relationshipLabel: {
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        marginLeft: 4,
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
    },
    relationshipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4, // Negative margin for spacing between chips
    },
    relationshipChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.borderLight,
        backgroundColor: colors.surfaceHighlight,
        margin: 4, // Replaces gap
    },
    relationshipChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    relationshipText: {
        color: colors.textSecondary,
    },
    relationshipTextActive: {
        color: colors.text,
        fontWeight: typography.weights.bold,
    },
    notesInput: {
        height: 80,
        paddingTop: spacing.sm, // Better than textAlignVertical
    },
    saveButton: {
        marginTop: spacing.md,
    },
    cancelButton: {
        marginTop: spacing.sm,
    },
    yearPickerSection: {
        marginBottom: spacing.md,
    },
    yearPickerLabel: {
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        marginLeft: 4,
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
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
        backgroundColor: 'transparent',
    },
});
