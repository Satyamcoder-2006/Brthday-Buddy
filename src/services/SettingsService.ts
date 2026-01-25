import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleBirthdayNotifications } from './notifications';
import { supabase } from './supabase';

const NOTIFICATION_TIME_KEY = 'notification_time';

export const SettingsService = {
    /**
     * Get the preferred notification time (default 9:00 AM)
     */
    async getNotificationTime(): Promise<{ hour: number; minute: number }> {
        try {
            const data = await AsyncStorage.getItem(NOTIFICATION_TIME_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('Failed to load notification time', e);
        }
        // Default: 9:00 AM
        return { hour: 9, minute: 0 };
    },

    /**
     * Set the preferred notification time and reschedule all notifications
     */
    async setNotificationTime(hour: number, minute: number): Promise<void> {
        if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
            throw new Error('Invalid time values');
        }

        try {
            // 1. Save preference
            await AsyncStorage.setItem(NOTIFICATION_TIME_KEY, JSON.stringify({ hour, minute }));

            // 2. Reschedule all notifications
            // We need to fetch all birthdays and reschedule them.
            // This might be expensive if there are many, but for a personal app it's fine.
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: birthdays } = await supabase
                    .from('birthdays')
                    .select('*')
                    .eq('user_id', user.id);

                if (birthdays && birthdays.length > 0) {
                    console.log(`Rescheduling ${birthdays.length} birthdays to ${hour}:${minute}...`);
                    // Process in parallel chunks to speed up
                    await Promise.all(birthdays.map(b => scheduleBirthdayNotifications(b)));
                }
            }
        } catch (error) {
            console.error('Failed to set notification time:', error);
            throw error;
        }
    }
};
