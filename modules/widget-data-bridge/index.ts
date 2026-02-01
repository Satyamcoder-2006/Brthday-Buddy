import { NativeModules } from 'react-native';

interface WidgetDataBridgeInterface {
    saveWidgetData(data: string): Promise<boolean>;
    getWidgetData(): Promise<string | null>;
    clearWidgetData(): Promise<boolean>;
}

const { WidgetDataBridgeModule } = NativeModules;

export default WidgetDataBridgeModule as WidgetDataBridgeInterface;
