import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { updateWidgetData } from '../services/widget';
import { supabase } from '../services/supabase';

/**
 * Custom hook to automatically sync widgets with latest birthday data
 * Syncs on:
 * - Initial app launch
 * - App returning to foreground
 * - Birthday data changes
 */
export const useWidgetSync = () => {
    useEffect(() => {
        // Initial sync on mount
        const syncWidgets = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: birthdays, error } = await supabase
                    .from('birthdays')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('birthday_date', { ascending: true });

                if (error) {
                    console.error('Failed to fetch birthdays for widget sync:', error);
                    return;
                }

                if (birthdays) {
                    await updateWidgetData(birthdays);
                    console.log('[useWidgetSync] Widgets synced with', birthdays.length, 'birthdays');
                }
            } catch (error) {
                console.error('[useWidgetSync] Widget sync failed:', error);
            }
        };

        // Sync immediately on mount
        syncWidgets();

        // Set up listener for app state changes
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                console.log('[useWidgetSync] App became active, syncing widgets...');
                syncWidgets();
            }
        });

        // Cleanup
        return () => {
            subscription.remove();
        };
    }, []);
};
