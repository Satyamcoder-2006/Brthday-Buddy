import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../types';
import { supabase } from '../services/supabase';

type ImportPreviewRouteProp = RouteProp<RootStackParamList, 'ImportPreview'>;

import { ExtractedBirthday, MistralOCRService } from '../services/MistralOCRService';
import { DeduplicationService } from '../services/DeduplicationService';
import { AddBirthdayModal } from '../components/calendar/AddBirthdayModal';

interface PreviewItem extends ExtractedBirthday {
    status: 'new' | 'exact_match' | 'potential_duplicate';
    existingId?: string;
    existingName?: string;
}

export const ImportPreviewScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<ImportPreviewRouteProp>();
    const { extractedData } = route.params;

    const [items, setItems] = useState<PreviewItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PreviewItem | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);

    useEffect(() => {
        analyzeData();
    }, []);

    const analyzeData = async () => {
        try {
            const { data: existingBirthdays } = await supabase
                .from('birthdays')
                .select('*');

            if (!existingBirthdays) {
                // If fetch fails, treat all as new
                setItems(extractedData.map(item => ({ ...item, status: 'new' })));
                setLoading(false);
                return;
            }

            const dedupService = new DeduplicationService();
            // Cast existing to generic BirthdayEntry for the service
            const results = dedupService.findDuplicates(extractedData, existingBirthdays as any);

            const processedItems: PreviewItem[] = [];

            // Process matches first
            results.matches.forEach(match => {
                processedItems.push({
                    ...match.extracted,
                    status: match.matchType === 'exact' ? 'exact_match' : 'potential_duplicate',
                    existingId: match.existing.id,
                    existingName: match.existing.name
                });
            });

            // Process new entries
            results.newEntries.forEach(entry => {
                processedItems.push({
                    ...entry,
                    status: 'new'
                });
            });

            setItems(processedItems);
        } catch (error) {
            console.error('Analysis failed', error);
            Alert.alert('Error', 'Failed to analyze duplicates. Treating all as new.');
            setItems(extractedData.map(item => ({ ...item, status: 'new' })));
        } finally {
            setLoading(false);
        }
    };

    const verifyItem = (item: PreviewItem, index: number) => {
        setSelectedItem(item);
        setSelectedIndex(index);
        setModalVisible(true);
    };

    const handleVerificationSuccess = () => {
        // Remove verified item from list
        if (selectedIndex > -1) {
            const newItems = [...items];
            newItems.splice(selectedIndex, 1);
            setItems(newItems);

            if (newItems.length === 0) {
                Alert.alert(
                    'All Done!',
                    'All imports have been processed.',
                    [{ text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'Birthdays' }) }]
                );
            }
        }
        setModalVisible(false);
        setSelectedItem(null);
        setSelectedIndex(-1);
    };

    const renderItem = ({ item, index }: { item: PreviewItem; index: number }) => {
        let statusColor = colors.success;
        let statusText = 'New';
        let statusIcon: keyof typeof Ionicons.glyphMap = 'add-circle-outline';

        if (item.status === 'exact_match') {
            statusColor = colors.error;
            statusText = 'Exact Duplicate';
            statusIcon = 'alert-circle';
        } else if (item.status === 'potential_duplicate') {
            statusColor = colors.primary;
            statusText = 'Potential Match';
            statusIcon = 'warning-outline';
        }

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => verifyItem(item, index)}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.name}>{item.name}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                            <Ionicons name={statusIcon} size={12} color={statusColor} />
                            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                        </View>
                    </View>
                    <View style={styles.verifyBtn}>
                        <Text style={styles.verifyBtnText}>Verify & Add</Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                    </View>
                </View>

                <Text style={styles.date}>{item.date}</Text>

                {item.status !== 'new' && (
                    <Text style={styles.conflictText}>
                        Matches existing: {item.existingName}
                    </Text>
                )}

                {item.relationship && <Text style={styles.meta}>Relationship: {item.relationship}</Text>}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Analyzing extracted data...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Review Import</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.statsBar}>
                <Text style={styles.statsText}>
                    {items.length} items found. Tap to verify and add.
                </Text>
            </View>

            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${index}-${item.name}`}
                contentContainerStyle={styles.listContent}
            />

            <AddBirthdayModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={handleVerificationSuccess}
                extractedData={selectedItem || undefined}
                initialDate={selectedItem?.date}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: colors.textSecondary,
        marginTop: spacing.md,
        fontSize: typography.sizes.base,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: spacing.xs,
    },
    title: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
        fontFamily: 'Inter_700Bold',
    },
    statsBar: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.surface,
    },
    statsText: {
        color: colors.textSecondary,
        fontFamily: 'Inter_400Regular',
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xs,
    },
    headerLeft: {
        flex: 1,
    },
    name: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.bold,
        color: colors.text,
        fontFamily: 'Inter_500Medium',
        marginBottom: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    date: {
        fontSize: typography.sizes.sm,
        color: colors.text,
        marginBottom: spacing.xs,
        fontFamily: 'Inter_400Regular',
    },
    meta: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        fontFamily: 'Inter_400Regular',
    },
    conflictText: {
        fontSize: typography.sizes.xs,
        color: colors.primaryLight,
        marginTop: 2,
        fontStyle: 'italic',
    },
    verifyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    verifyBtnText: {
        color: colors.primary,
        fontWeight: 'bold',
        fontSize: typography.sizes.sm,
        marginRight: 4,
    },
});
