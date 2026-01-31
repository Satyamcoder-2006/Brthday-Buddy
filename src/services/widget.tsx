import { Birthday } from '../types';
import { differenceInDays, addYears, isBefore, startOfDay } from 'date-fns';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { BirthdayWidget, EmptyBirthdayWidget } from '../widgets/BirthdayWidget';
import React from 'react';
import { WidgetStorage } from './WidgetDataBridge';

/**
 * Updates widget data and triggers widget refresh
 * Call this whenever birthdays list changes
 */
export const updateWidgetData = async (birthdays: Birthday[]): Promise<void> => {
    try {
        if (birthdays.length === 0) {
            await WidgetStorage.clearWidgetData();

            // Update widget to show "No birthdays"
            await requestWidgetUpdate({
                widgetName: 'BirthdayWidget',
                renderWidget: () => (
                    <EmptyBirthdayWidget />
                ),
                widgetNotFound: () => {
                    console.log('Birthday widget not found on home screen');
                }
            });
            return;
        }

        // Find the next upcoming birthday
        const today = startOfDay(new Date());

        const upcomingBirthdays = birthdays.map(birthday => {
            const birthDate = new Date(birthday.birthday_date);
            const birthYear = birthDate.getFullYear();
            const currentYear = today.getFullYear();

            // Create this year's birthday
            let nextBirthday = new Date(
                currentYear,
                birthDate.getMonth(),
                birthDate.getDate()
            );
            nextBirthday = startOfDay(nextBirthday);

            // If birthday has passed this year, use next year
            if (isBefore(nextBirthday, today)) {
                nextBirthday = addYears(nextBirthday, 1);
            }

            const daysUntil = differenceInDays(nextBirthday, today);

            // Calculate turning age
            const turningAge = nextBirthday.getFullYear() - birthYear;

            return {
                ...birthday,
                daysUntil,
                turningAge,
                nextBirthday
            };
        });

        // Sort by days until birthday (ascending)
        upcomingBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);

        const nextUp = upcomingBirthdays[0];

        const widgetData = {
            id: nextUp.id,
            name: nextUp.name,
            daysUntil: nextUp.daysUntil,
            date: nextUp.birthday_date,
            age: nextUp.turningAge,
            lastUpdated: new Date().toISOString(),
            upcoming: upcomingBirthdays.slice(0, 5).map(b => ({
                id: b.id,
                name: b.name,
                daysUntil: b.daysUntil,
                date: b.birthday_date,
                age: b.turningAge,
                photoUrl: b.avatar_url
            }))
        };

        // Save to SharedPreferences (accessible by widget)
        await WidgetStorage.saveWidgetData(widgetData);

        // Trigger updates for all widget sizes
        const widgetSizes = ['BirthdayWidgetSmall', 'BirthdayWidgetMedium', 'BirthdayWidgetLarge'];

        for (const widgetName of widgetSizes) {
            try {
                await requestWidgetUpdate({
                    widgetName,
                    renderWidget: () => <EmptyBirthdayWidget />, // Placeholder, handler will do real render
                    widgetNotFound: () => {
                        // This is expected for sizes not added to home screen
                    }
                });
            } catch (e) {
                console.log(`Failed to trigger update for ${widgetName}`);
            }
        }

    } catch (error) {
        console.error('Failed to update widget data:', error);
    }
};

/**
 * Gets current widget data from storage
 */
export const getWidgetData = async () => {
    try {
        return await WidgetStorage.getWidgetData();
    } catch (error) {
        console.error('Failed to get widget data:', error);
        return null;
    }
};

/**
 * Force widget refresh
 * Call this on app foreground or after data changes
 */
export const refreshWidget = async (): Promise<void> => {
    try {
        const data = await WidgetStorage.getWidgetData();
        const widgetSizes = ['BirthdayWidgetSmall', 'BirthdayWidgetMedium', 'BirthdayWidgetLarge'];

        for (const widgetName of widgetSizes) {
            try {
                await requestWidgetUpdate({
                    widgetName,
                    renderWidget: () => <EmptyBirthdayWidget />, // Handler will do real render
                    widgetNotFound: () => { }
                });
            } catch (e) {
                console.log(`Failed to refresh widget ${widgetName}`);
            }
        }
    } catch (error) {
        console.error('Failed to refresh widgets:', error);
    }
};
