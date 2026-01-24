import { NativeModule, requireNativeModule } from 'expo';
import { Platform } from 'react-native';

import { Media3TransformerModuleEvents } from './Media3Transformer.types';

declare class Media3TransformerModule extends NativeModule<Media3TransformerModuleEvents> {
  composeVideo(framePaths: string[], outputUri: string, frameDurationMs: number): Promise<string>;
}

// Lazy load the native module to prevent startup crashes if it's missing
let nativeModule: Media3TransformerModule | null = null;

const getMedia3Transformer = (): Media3TransformerModule | null => {
  if (Platform.OS !== 'android') return null;

  if (!nativeModule) {
    try {
      nativeModule = requireNativeModule<Media3TransformerModule>('Media3Transformer');
    } catch (e) {
      console.error('Failed to load Media3Transformer native module:', e);
      return null;
    }
  }
  return nativeModule;
};

// Export only the getter
export { getMedia3Transformer };
