import { captureRef } from 'react-native-view-shot';
import { File, Paths, Directory } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import { getMedia3Transformer } from '../../modules/media3check/src/Media3TransformerModule';

export const VideoExportService = {
    /**
     * Export animated birthday card as high-quality MP4 video
     */
    async exportAsVideo(
        viewRef: React.RefObject<any>,
        name: string,
        onProgress?: (progress: number) => void
    ): Promise<string | null> {
        console.log('🎬 Starting video export for:', name);

        // Defensive check for native module availability (Android only)
        if (Platform.OS !== 'android') {
            Alert.alert('Not Supported', 'Video export is currently only supported on Android.');
            return null;
        }

        const timestamp = Date.now();
        const outputVideoName = `birthday_card_${timestamp}.mp4`;
        const tempDirName = `video_frames_${timestamp}`;

        try {
            // 1. Initialize Paths
            const cacheDir = Paths.cache;
            const tempDir = new Directory(cacheDir, tempDirName);
            const outputVideoFile = new File(cacheDir, outputVideoName);

            // Ensure the temporary directory exists
            await tempDir.create();

            const frameCount = 30; // 30 frames for testing
            const fps = 15;
            const frameDurationMs = Math.round(1000 / fps);
            const delay = 60; // Match HTML animation timing

            console.log('📸 Capturing frames...');

            const framePaths: string[] = [];

            // 2. Capture frames
            for (let i = 0; i < frameCount; i++) {
                const uri = await captureRef(viewRef, {
                    format: 'jpg',
                    quality: 0.8,
                    width: 720,
                    height: 1280,
                    result: 'tmpfile',
                });

                const frameName = `frame_${i.toString().padStart(3, '0')}.jpg`;
                const targetFile = new File(tempDir, frameName);

                const tmpFile = new File(uri);
                await tmpFile.copy(targetFile);
                await tmpFile.delete();

                framePaths.push(targetFile.uri); // transformer needs URIs

                if (onProgress) {
                    onProgress(Math.round(((i + 1) / frameCount) * 0.7 * 100));
                }

                await new Promise(resolve => setTimeout(resolve, delay));
            }

            console.log('🎞️ Stitching video with Media3...');

            // 3. Media3 Transformer (Native)
            try {
                // Determine output URI (must be absolute file path usually, or file://)
                // The native module handles file:// stripping
                const media3 = getMedia3Transformer();
                if (!media3) {
                    throw new Error('Video export module is not ready. Please restart the app.');
                }

                const outputUri = await media3.composeVideo(
                    framePaths,
                    outputVideoFile.uri,
                    frameDurationMs
                );

                console.log('✅ Video encoding successful:', outputUri);
                if (onProgress) onProgress(100);

                // Cleanup
                try {
                    await tempDir.delete();
                } catch (e) {
                    console.warn('Failed to cleanup temp frames', e);
                }

                return outputUri;

            } catch (nativeError: any) {
                console.error('❌ Media3 Transformer failed:', nativeError);
                throw new Error(nativeError.message || 'Verification failed');
            }

        } catch (error: any) {
            console.error('❌ Video export failed:', error);
            Alert.alert(
                'Video Export Error',
                `Failed to generate video: ${error.message || 'Unknown error'}. Please try again.`
            );
            return null;
        }
    },

    /**
     * Share the generated video
     */
    async shareVideo(uri: string, name: string): Promise<void> {
        const canShare = await Sharing.isAvailableAsync();
        if (!canShare) {
            Alert.alert('Error', 'Sharing is not available on this device');
            return;
        }

        await Sharing.shareAsync(uri, {
            mimeType: 'video/mp4',
            dialogTitle: `Share ${name}'s Birthday Video`,
        });
    }
};
