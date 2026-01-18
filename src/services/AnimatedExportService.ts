import { captureRef } from 'react-native-view-shot';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export const AnimatedExportService = {
    /**
     * Create an animated HTML bundle (Guaranteed to work in Expo Go)
     */
    async exportAnimation(viewRef: any, name: string): Promise<void> {
        console.log('🎬 Starting export...');

        try {
            const frames: string[] = [];
            const frameCount = 25; // Good balance for file size
            const delay = 60; // ~15fps for recording speed vs file size

            // 1. Capture frames as base64
            for (let i = 0; i < frameCount; i++) {
                const uri = await captureRef(viewRef, {
                    format: 'jpg',
                    quality: 0.7,
                    width: 540,  // Lower res for the animation frames to keep HTML small
                    height: 960,
                });

                const frameFile = new File(uri);
                const base64 = await frameFile.base64();
                frames.push(`data:image/jpeg;base64,${base64}`);

                // Clean up immediately
                await frameFile.delete();

                if ((i + 1) % 5 === 0) {
                    console.log(`📸 Progress: ${Math.round(((i + 1) / frameCount) * 100)}%`);
                }

                // Small delay to let animations play
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            console.log(`✅ Captured ${frames.length} frames`);

            // 2. Create the HTML viewer
            const html = this.createViewerTemplate(frames, name);

            // 3. Save to cache
            const fileName = `birthday_card_${Date.now()}.html`;
            const htmlFile = new File(Paths.cache, fileName);
            await htmlFile.write(html);

            console.log('📤 Sharing HTML Bundle...');

            // 4. Share
            const canShare = await Sharing.isAvailableAsync();
            if (!canShare) throw new Error('Sharing is not available');

            await Sharing.shareAsync(htmlFile.uri, {
                mimeType: 'text/html',
                dialogTitle: `Share ${name}'s Animation`,
            });

            console.log('✅ Done!');

        } catch (error: any) {
            console.error('Export failed:', error);
            Alert.alert('Error', 'Failed to create animation. Please try again.');
        }
    },

    createViewerTemplate(frames: string[], name: string): string {
        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${name}'s Birthday Card</title>
  <style>
    body {
        margin: 0;
        background: #000;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica;
        color: white;
    }
    #viewer {
        width: 100%;
        max-width: 450px;
        aspect-ratio: 9/16;
        background: #111;
        position: relative;
        overflow: hidden;
        box-shadow: 0 20px 50px rgba(255,149,0,0.4);
    }
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .badge {
        position: absolute;
        bottom: 20px;
        right: 20px;
        background: rgba(0,0,0,0.6);
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 12px;
        border: 1px solid rgba(255,255,255,0.2);
    }
    .footer {
        margin-top: 20px;
        opacity: 0.6;
        font-size: 14px;
    }
  </style>
</head>
<body>
  <div id="viewer">
    <img id="f">
    <div class="badge">Celebration Playback ✨</div>
  </div>
  <div class="footer">Made with Birthday Buddy</div>
  <script>
    const frames = ${JSON.stringify(frames)};
    let cur = 0;
    const img = document.getElementById('f');
    function play() {
        img.src = frames[cur];
        cur = (cur + 1) % frames.length;
        setTimeout(play, 60);
    }
    play();
  </script>
</body>
</html>`;
    }
};
