import WidgetDataBridgeModule from '../../modules/widget-data-bridge';

// Data interface for widget storage
export interface WidgetBirthdayData {
    id: string;
    name: string;
    birthdayDate: string; // "YYYY-MM-DD" format - CRITICAL for recalculation
    birthYear: number; // Birth year for age calculation
    avatarUrl?: string;
    daysUntil: number;
    turningAge: number;
    lastCalculated: string; // ISO timestamp of last calculation
}

export interface WidgetData {
    nextBirthday: WidgetBirthdayData;
    upcomingBirthdays: WidgetBirthdayData[];
    version: string; // For future data migrations
    lastUpdated: string; // ISO timestamp
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
