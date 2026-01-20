import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Birthday } from '../../types';
import { Avatar } from '../common/Avatar';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { supabase } from '../../services/supabase';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

interface DaySummaryModalProps {
    visible: boolean;
    onClose: () => void;
    date: string;
    birthdays: Birthday[];
    onAddBirthday: () => void;
    onEditBirthday: (birthday: Birthday) => void;
    onGiftBirthday: (birthday: Birthday) => void;
    onDeleteSuccess: () => void;
}

export const DaySummaryModal: React.FC<DaySummaryModalProps> = ({
    visible,
    onClose,
    date,
    birthdays,
    onAddBirthday,
    onEditBirthday,
    onGiftBirthday,
    onDeleteSuccess,
}) => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('birthdays').delete().eq('id', id);
        if (!error) {
            onDeleteSuccess();
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{date}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        {birthdays.length > 0 ? (
                            birthdays.map((b) => (
                                <View key={b.id} style={styles.item}>
                                    <Avatar
                                        name={b.name}
                                        uri={b.avatar_url ? supabase.storage.from('avatars').getPublicUrl(b.avatar_url).data.publicUrl : undefined}
                                    />
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemName} numberOfLines={1}>{b.name}</Text>
                                        <Text style={styles.itemRel} numberOfLines={1}>{b.relationship}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => onGiftBirthday(b)}
                                        style={styles.actionBtn}
                                    >
                                        <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            onClose();
                                            navigation.navigate('SocialShare', { birthday: b });
                                        }}
                                        style={styles.actionBtn}
                                    >
                                        <Ionicons name="share-social-outline" size={20} color={colors.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => onEditBirthday(b)}
                                        style={styles.actionBtn}
                                    >
                                        <Ionicons name="pencil-outline" size={20} color={colors.info} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(b.id)} style={styles.actionBtn}>
                                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No birthdays on this day</Text>
                        )}
                    </ScrollView>

                    <TouchableOpacity style={styles.addButton} onPress={onAddBirthday}>
                        <Ionicons name="add" size={20} color="black" />
                        <Text style={styles.addButtonText}>Add New Birthday</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    container: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        maxHeight: '70%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: typography.sizes['xl'],
        fontFamily: typography.fonts.heading,
        color: colors.primary,
        letterSpacing: 1,
    },
    content: {
        marginBottom: spacing.lg,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceHighlight,
        padding: spacing.sm,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
    },
    itemInfo: {
        flex: 1,
        marginLeft: spacing.sm,
        justifyContent: 'center',
    },
    itemName: {
        color: colors.text,
        fontSize: typography.sizes.base,
        fontFamily: typography.fonts.bold,
    },
    itemRel: {
        color: colors.textSecondary,
        fontSize: typography.sizes.xs,
    },
    actionBtn: {
        padding: spacing.xs,
        marginLeft: 2,
    },
    emptyText: {
        color: colors.textDisabled,
        textAlign: 'center',
        padding: spacing.xl,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    addButtonText: {
        marginLeft: spacing.sm,
        fontSize: typography.sizes.base,
        fontFamily: typography.fonts.bold,
        color: 'black',
    },
});
