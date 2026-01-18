import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Linking } from 'react-native';
import { File, Paths } from 'expo-file-system';

export const CardExportService = {
    /**
     * Export birthday card as high-quality image
     */
    async exportAsImage(
        viewRef: React.RefObject<any>,
        options: {
            format?: 'png' | 'jpg';
            quality?: number;
            width?: number;
            height?: number;
        } = {}
    ): Promise<string> {
        const {
            format = 'png',
            quality = 1.0,
            width = 1080,
            height = 1920,
        } = options;

        try {
            // Capture the view
            const uri = await captureRef(viewRef, {
                format,
                quality,
                width,
                height,
                result: 'tmpfile',
            });

            console.log('✅ Card exported:', uri);
            return uri;
        } catch (error: any) {
            console.error('❌ Export failed:', error);
            throw new Error(`Failed to export card: ${error.message}`);
        }
    },

    /**
     * Save to device photo library
     */
    async saveToGallery(uri: string): Promise<void> {
        // Request write-only permission to avoid needing READ_MEDIA_AUDIO/VIDEO on Android 13+
        const { status } = await MediaLibrary.requestPermissionsAsync(true);

        if (status !== 'granted') {
            throw new Error('Permission to access media library denied');
        }

        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync('Birthday Buddy', asset, false);
        console.log('✅ Saved to gallery');
    },

    /**
     * Share the card image
     */
    async share(uri: string): Promise<void> {
        const canShare = await Sharing.isAvailableAsync();

        if (!canShare) {
            throw new Error('Sharing not available on this device');
        }

        await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share Birthday Card',
        });
    },

    /**
     * Share to Instagram Stories (Deep Link)
     */
    async shareToInstagramStories(uri: string): Promise<void> {
        const instagramURL = 'instagram-stories://share';
        const canOpen = await Linking.canOpenURL(instagramURL);

        if (!canOpen) {
            // If Instagram isn't installed, fallback to normal share
            return this.share(uri);
        }

        // Read as base64 for deep link using modern API
        const base64 = await new File(uri).base64();

        const shareUrl = `${instagramURL}?backgroundImage=${encodeURIComponent('data:image/png;base64,' + base64)}`;
        await Linking.openURL(shareUrl);
    }
};
