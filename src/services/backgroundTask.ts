import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { supabase } from './supabase';
import { scheduleBirthdayNotifications } from './notifications';

const BACKGROUND_FETCH_TASK = 'BIRTHDAY_NOTIFICATION_CHECK';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    try {
        const { data: birthdays, error } = await supabase
            .from('birthdays')
            .select('*');
        // Logic: we might want to re-schedule/check notifications for ALL birthdays 
        // ensuring they are scheduled.
        // Since scheduleBirthdayNotifications checks for existing IDs and cancels them, 
        // we can theoretically re-run this periodically to ensure upcoming ones are set.

        if (error || !birthdays) return BackgroundFetch.BackgroundFetchResult.Failed;

        for (const birthday of birthdays) {
            await scheduleBirthdayNotifications(birthday);
        }

        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

export async function registerBackgroundFetchAsync() {
    return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 60 * 60 * 24, // 24 hours
        stopOnTerminate: false,
        startOnBoot: true,
    });
}
