import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Linking, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { RootStackParamList } from '../types';
import { GiftRegistryService, GiftIdea } from '../services/GiftRegistryService';
import { supabase } from '../services/supabase';

type GiftRegistryRouteProp = RouteProp<RootStackParamList, 'GiftRegistry'>;

export const GiftRegistryScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<GiftRegistryRouteProp>();
    const { birthday } = route.params;

    const [gifts, setGifts] = useState<GiftIdea[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    // Form
    const [link, setLink] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [analyzing, setAnalyzing] = useState(false);

    const giftService = new GiftRegistryService();

    useEffect(() => {
        loadGifts();
    }, [birthday.id]);

    const loadGifts = async () => {
        try {
            const data = await giftService.getGifts(birthday.id);
            setGifts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzeLink = async () => {
        if (!link) return;
        setAnalyzing(true);
        try {
            const info = await giftService.extractProductInfoFromUrl(link);
            if (info.product_name) setName(info.product_name);
            if (info.price) setPrice(info.price.toString());
        } catch (e) {
            Alert.alert('AI Error', 'Could not extract details. Please enter manually.');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleAddGift = async () => {
        if (!name) {
            Alert.alert('Required', 'Please enter a product name');
            return;
        }

        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            const newGift: any = {
                birthday_id: birthday.id,
                user_id: user.id,
                product_name: name,
                product_url: link,
                price: parseFloat(price) || 0,
                status: 'idea'
            };

            const saved = await giftService.addGift(newGift);
            setGifts([...gifts, saved]);
            setAdding(false);
            resetForm();
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    const resetForm = () => {
        setLink('');
        setName('');
        setPrice('');
    };

    const handleDelete = async (id: string) => {
        try {
            await giftService.deleteGift(id);
            setGifts(gifts.filter(g => g.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    const handleOpenLink = (url?: string) => {
        if (url) Linking.openURL(url);
    };

    const renderItem = ({ item }: { item: GiftIdea }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.textContainer}>
                    <Text style={styles.productName}>{item.product_name}</Text>
                    {item.price ? <Text style={styles.price}>${item.price.toFixed(2)}</Text> : null}
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                    </View>
                </View>
                <View style={styles.actions}>
                    {item.product_url && (
                        <TouchableOpacity onPress={() => handleOpenLink(item.product_url)} style={styles.iconBtn}>
                            <Ionicons name="link" size={20} color={colors.info} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>{birthday.name}'s Wishlist</Text>
                <TouchableOpacity onPress={() => setAdding(!adding)}>
                    <Ionicons name={adding ? "close" : "add"} size={28} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {adding && (
                <View style={styles.form}>
                    <Text style={styles.formTitle}>Add New Gift Idea</Text>

                    <View style={styles.inputGroup}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Paste product link..."
                            placeholderTextColor={colors.textDisabled}
                            value={link}
                            onChangeText={setLink}
                            onBlur={handleAnalyzeLink}
                        />
                        {analyzing && <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />}
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Product Name"
                        placeholderTextColor={colors.textDisabled}
                        value={name}
                        onChangeText={setName}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Price (approx)"
                        placeholderTextColor={colors.textDisabled}
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                    />

                    <TouchableOpacity style={styles.addButton} onPress={handleAddGift}>
                        <Text style={styles.addButtonText}>Save Gift Idea</Text>
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={gifts}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="gift-outline" size={48} color={colors.textDisabled} />
                        <Text style={styles.emptyText}>No gift ideas yet</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: typography.sizes.lg,
        fontWeight: 'bold',
        color: colors.text,
    },
    list: {
        padding: spacing.md,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
    },
    productName: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: typography.sizes.base,
        marginBottom: 4,
    },
    price: {
        color: colors.success,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statusBadge: {
        backgroundColor: colors.surfaceHighlight,
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        color: colors.textSecondary,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBtn: {
        padding: 8,
        marginLeft: 8,
    },
    form: {
        padding: spacing.md,
        backgroundColor: colors.surfaceHighlight,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    formTitle: {
        color: colors.text,
        fontWeight: 'bold',
        marginBottom: spacing.md,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.md,
    },
    addButton: {
        backgroundColor: colors.primary,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    empty: {
        alignItems: 'center',
        marginTop: spacing.xl * 2,
    },
    emptyText: {
        color: colors.textDisabled,
        marginTop: spacing.md,
    }
});
