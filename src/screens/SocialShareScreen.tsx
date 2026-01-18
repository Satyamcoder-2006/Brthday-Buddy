import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, Share } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { CardCanvas } from '../components/sharing/CardCanvas';
import { colors, spacing, typography } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/common/Button';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { supabase } from '../services/supabase';
import { CustomizationPanel } from '../components/sharing/CustomizationPanel';
import { CardState } from '../components/sharing/types';
import { CardExportService } from '../services/CardExportService';
import { AnimatedExportService } from '../services/AnimatedExportService';

type SocialShareScreenRouteProp = RouteProp<RootStackParamList, 'SocialShare'>;

export const SocialShareScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<SocialShareScreenRouteProp>();
    const { birthday } = route.params;

    const viewShotRef = useRef<ViewShot>(null);
    const [capturing, setCapturing] = useState(false);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

    // Helper to get full URL
    const getPhotoUrl = (path?: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
    };

    // Initial State
    const [cardState, setCardState] = useState<CardState>({
        layoutId: 'minimal_elegance',
        theme: 'midnight',
        customMessage: '',
        showPhoto: true,
        photoUri: getPhotoUrl(birthday.avatar_url),
        elements: [],
    });

    const handleUpdateElement = (id: string, updates: Partial<CardState['elements'][0]>) => {
        setCardState(prev => ({
            ...prev,
            elements: prev.elements.map(el => el.id === id ? { ...el, ...updates } : el)
        }));
    };

    const handleDeleteElement = (id: string) => {
        setCardState(prev => ({
            ...prev,
            elements: prev.elements.filter(el => el.id !== id)
        }));
        if (selectedElementId === id) setSelectedElementId(null);
    };

    const handleShare = async () => {
        if (capturing) return;
        setCapturing(true);

        try {
            const uri = await CardExportService.exportAsImage(viewShotRef, {
                width: 1080,
                height: 1920,
            });
            await CardExportService.share(uri);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setCapturing(false);
        }
    };

    const handleSaveToGallery = async () => {
        if (capturing) return;
        setCapturing(true);

        try {
            const uri = await CardExportService.exportAsImage(viewShotRef, {
                width: 1080,
                height: 1920,
            });
            await CardExportService.saveToGallery(uri);
            Alert.alert('Success', 'Card saved to Photos! 📸');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setCapturing(false);
        }
    };

    const handleInstagramShare = async () => {
        if (capturing) return;
        setCapturing(true);

        try {
            const uri = await CardExportService.exportAsImage(viewShotRef, {
                width: 1080,
                height: 1920,
            });
            await CardExportService.shareToInstagramStories(uri);
        } catch (error: any) {
            Alert.alert('Error', 'Could not share to Instagram Stories.');
        } finally {
            setCapturing(false);
        }
    };

    const handleAnimatedShare = async () => {
        if (capturing) return;
        setCapturing(true);

        try {
            await AnimatedExportService.exportAnimation(viewShotRef, birthday.name);
        } catch (error: any) {
            console.error('Animation export failed', error);
            Alert.alert('Error', 'Animation export failed. Please try again.');
        } finally {
            setCapturing(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Card Studio</Text>
                <TouchableOpacity onPress={handleShare}>
                    <Ionicons name="share-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Canvas Preview Area */}
            <View style={styles.previewContainer} onStartShouldSetResponder={() => {
                setSelectedElementId(null);
                return false;
            }}>
                <ViewShot
                    ref={viewShotRef}
                    options={{ format: 'png', quality: 1.0, result: 'tmpfile' }}
                    style={{ backgroundColor: 'transparent' }}
                >
                    <CardCanvas
                        birthday={{
                            name: birthday.name,
                            age: birthday.birth_year ? new Date().getFullYear() - birthday.birth_year : 0,
                            photoUrl: cardState.photoUri
                        }}
                        state={cardState}
                        selectedElementId={selectedElementId}
                        onUpdateElement={handleUpdateElement}
                        onDeleteElement={handleDeleteElement}
                        onSelectElement={setSelectedElementId}
                    />
                </ViewShot>
            </View>

            {/* Customization Panel */}
            <CustomizationPanel
                state={cardState}
                onChange={setCardState}
            />

            {/* Actions */}
            <View style={styles.actionContainer}>
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.premiumAction, { backgroundColor: '#2C2C2E' }]}
                        onPress={handleSaveToGallery}
                        disabled={capturing}
                    >
                        <Ionicons name="download-outline" size={18} color="white" />
                        <Text style={styles.premiumActionText}>Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.premiumAction, { backgroundColor: colors.primary }]}
                        onPress={handleAnimatedShare}
                        disabled={capturing}
                    >
                        <Ionicons name="sparkles-outline" size={18} color="white" />
                        <Text style={styles.premiumActionText}>Animation</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.premiumAction, { backgroundColor: '#E1306C' }]}
                        onPress={handleInstagramShare}
                        disabled={capturing}
                    >
                        <Ionicons name="logo-instagram" size={18} color="white" />
                        <Text style={styles.premiumActionText}>Story</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.simpleShareLink}
                    onPress={handleShare}
                >
                    <Ionicons name="share-social-outline" size={14} color={colors.textDisabled} />
                    <Text style={styles.simpleShareText}>More Sharing Options</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 45,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
        backgroundColor: '#1A1A1A',
    },
    headerTitle: {
        color: colors.text,
        fontSize: typography.sizes.lg,
        fontFamily: typography.fonts.heading,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 60,
    },
    backText: {
        color: colors.text,
        marginLeft: spacing.xs,
        fontFamily: typography.fonts.body,
    },
    previewContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.md,
    },
    actionContainer: {
        padding: spacing.lg,
        backgroundColor: '#1A1A1A',
        paddingBottom: 35,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    premiumAction: {
        flex: 1,
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    premiumActionText: {
        color: 'white',
        fontSize: 10, // Further reduced
        fontWeight: 'bold',
        marginTop: 2,
        fontFamily: typography.fonts.body,
    },
    simpleShareLink: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    simpleShareText: {
        color: colors.textDisabled,
        fontSize: 13,
        fontWeight: '500',
    }
});
