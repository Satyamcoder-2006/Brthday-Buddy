import AsyncStorage from '@react-native-async-storage/async-storage';
import { Birthday } from '../types';
import { differenceInDays, addYears } from 'date-fns';

const WIDGET_DATA_KEY = 'widget_birthday_data';

export const updateWidgetData = async (birthdays: Birthday[]) => {
    try {
        if (birthdays.length === 0) {
            await AsyncStorage.removeItem(WIDGET_DATA_KEY);
            return;
        }

        // Find the absolute next birthday
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sorted = birthdays.map(b => {
            const bDate = new Date(b.birthday_date);
            let nextBday = new Date(today.getFullYear(), bDate.getMonth(), bDate.getDate());
            if (nextBday < today) {
                nextBday = addYears(nextBday, 1);
            }
            const daysUntil = differenceInDays(nextBday, today);
            return { ...b, daysUntil };
        }).sort((a, b) => a.daysUntil - b.daysUntil);

        const nextUp = sorted[0];

        const widgetData = {
            name: nextUp.name,
            daysUntil: nextUp.daysUntil,
            relationship: nextUp.relationship,
            date: nextUp.birthday_date,
            lastUpdated: new Date().toISOString(),
        };

        // 1. Save to local storage for the app's own use
        await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(widgetData));

        // 2. In a real native implementation, we would use a NativeModule 
        // to write to AppGroups (iOS) or Shared Preferences (Android)
        // console.log('Widget data updated for native bridge:', widgetData);

    } catch (error) {
        console.error('Failed to update widget data', error);
    }
};

export const getWidgetData = async () => {
    const data = await AsyncStorage.getItem(WIDGET_DATA_KEY);
    return data ? JSON.parse(data) : null;
};
