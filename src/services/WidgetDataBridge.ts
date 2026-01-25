import WidgetDataBridgeModule from '../../modules/widget-data-bridge';

// Data interface
export interface WidgetData {
    name: string;
    daysUntil: number;
    date: string;
    age: number;
    lastUpdated: string;
}

export const WidgetStorage = {
    saveWidgetData: async (data: WidgetData): Promise<void> => {
        try {
            if (WidgetDataBridgeModule) {
                await WidgetDataBridgeModule.saveWidgetData(JSON.stringify(data));
            }
        } catch (e) {
            console.error('Failed to save widget data to bridge', e);
        }
    },

    getWidgetData: async (): Promise<WidgetData | null> => {
        try {
            if (WidgetDataBridgeModule) {
                const json = await WidgetDataBridgeModule.getWidgetData();
                return json ? JSON.parse(json) : null;
            }
            return null;
        } catch (e) {
            console.error('Failed to get widget data from bridge', e);
            return null;
        }
    },

    clearWidgetData: async (): Promise<void> => {
        try {
            if (WidgetDataBridgeModule) {
                await WidgetDataBridgeModule.clearWidgetData();
            }
        } catch (e) {
            console.error('Failed to clear widget data from bridge', e);
        }
    }
};
