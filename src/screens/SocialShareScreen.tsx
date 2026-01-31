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
import { VideoExportService } from '../services/VideoExportService';

type SocialShareScreenRouteProp = RouteProp<RootStackParamList, 'SocialShare'>;

export const SocialShareScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<SocialShareScreenRouteProp>();
    const { birthday } = route.params;

    const viewShotRef = useRef<ViewShot>(null);
    const [capturing, setCapturing] = useState(false);
    const [exportingVideo, setExportingVideo] = useState(false);
    const [videoProgress, setVideoProgress] = useState(0);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

    // Helper to get full URL
    const getPhotoUrl = (path?: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        if (!supabase) return null;
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
        if (capturing || exportingVideo) return;
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

    const handleVideoExport = async () => {
        if (capturing || exportingVideo) return;
        setExportingVideo(true);
        setVideoProgress(0);

        try {
            const videoUri = await VideoExportService.exportAsVideo(
                viewShotRef,
                birthday.name,
                (progress) => setVideoProgress(progress)
            );

            if (videoUri) {
                await VideoExportService.shareVideo(videoUri, birthday.name);
            }
        } catch (error: any) {
            console.error('Video export failed', error);
            Alert.alert('Error', 'Video export failed. Please try again.');
        } finally {
            setExportingVideo(false);
            setVideoProgress(0);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Studio</Text>
                <View style={{ width: 44 }} />
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
                birthday={birthday}
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
                        onPress={handleVideoExport}
                        disabled={capturing || exportingVideo}
                    >
                        <Ionicons name="videocam-outline" size={18} color="white" />
                        <Text style={styles.premiumActionText}>
                            {exportingVideo ? `${videoProgress}%` : 'Video'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.premiumAction, { backgroundColor: '#5856D6' }]}
                        onPress={handleAnimatedShare}
                        disabled={capturing || exportingVideo}
                    >
                        <Ionicons name="sparkles-outline" size={18} color="white" />
                        <Text style={styles.premiumActionText}>HTML</Text>
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
        paddingTop: 55,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
        backgroundColor: colors.background,
    },
    headerTitle: {
        color: colors.text,
        fontSize: 20,
        fontFamily: typography.fonts.heading,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
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
