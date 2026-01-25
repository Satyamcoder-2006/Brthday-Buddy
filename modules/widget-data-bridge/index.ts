import { requireNativeModule } from 'expo';

interface WidgetDataBridgeModule {
    saveWidgetData(data: string): Promise<boolean>;
    getWidgetData(): Promise<string | null>;
    clearWidgetData(): Promise<boolean>;
}

// It loads the native module object from the JSI or falls back to
// the bridge module (from NativeModulesProxy) if the remote debugger is on.
let WidgetDataBridge: WidgetDataBridgeModule | null = null;

try {
    WidgetDataBridge = requireNativeModule<WidgetDataBridgeModule>('WidgetDataBridge');
} catch (e) {
    console.warn("WidgetDataBridge native module not found. Widgets will not persist data. (Are you in Expo Go?)");
}

export default WidgetDataBridge;
