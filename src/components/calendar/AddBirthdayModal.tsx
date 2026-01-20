import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
}

const birthdaySchema = Yup.object({
    name: Yup.string().required('Name is required').max(50),
    relationship: Yup.string().required('Relationship is required'),
    turningAge: Yup.number().typeError('Must be a number').min(0, 'Min 0').max(120, 'Max 120'),
    notes: Yup.string().max(200).nullable(),
});

const RELATIONSHIPS = ['Friend', 'Family', 'Colleague', 'Other'];

export const AddBirthdayModal: React.FC<AddBirthdayModalProps> = ({
    visible,
    onClose,
    initialDate,
    onSuccess,
    birthdayToEdit
}) => {
    const [avatar, setAvatar] = useState<string | null>(null);
    const [date, setDate] = useState(initialDate || format(new Date(), 'yyyy-MM-dd'));

    useEffect(() => {
        if (visible) {
            if (birthdayToEdit) {
                setDate(birthdayToEdit.birthday_date);
                setAvatar(birthdayToEdit.avatar_url ? supabase.storage.from('avatars').getPublicUrl(birthdayToEdit.avatar_url).data.publicUrl : null);
            } else {
                setAvatar(null);
                if (initialDate) setDate(initialDate);
                else setDate(format(new Date(), 'yyyy-MM-dd'));
            }
        }
    }, [visible, initialDate, birthdayToEdit]);

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

            // Calculate birth year based on turningAge
            let birthYear = null;
            if (values.turningAge) {
                const bDate = new Date(date);
                birthYear = bDate.getFullYear() - parseInt(values.turningAge);
                // Adjust if birthday hasn't happened yet this year? 
                // Actually "turning age" usually refers to the age they WILL be on their birthday in the CURRENT year.
                // So birthYear = 2026 - 25 = 2001.
            }

            const payload = {
                user_id: user.id,
                name: values.name,
                birthday_date: date,
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
                                name: birthdayToEdit?.name || '',
                                relationship: birthdayToEdit?.relationship || 'Friend',
                                notes: birthdayToEdit?.notes || '',
                                turningAge: birthdayToEdit?.birth_year
                                    ? (new Date().getFullYear() - birthdayToEdit.birth_year).toString()
                                    : ''
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

                                    <Input
                                        label="How old are they turning this year?"
                                        placeholder="e.g. 25"
                                        keyboardType="numeric"
                                        value={values.turningAge}
                                        onChangeText={handleChange('turningAge')}
                                        onBlur={handleBlur('turningAge')}
                                        error={touched.turningAge && errors.turningAge ? errors.turningAge as string : undefined}
                                    />

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
});
