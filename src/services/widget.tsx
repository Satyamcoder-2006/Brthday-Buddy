import { Birthday } from '../types';
import { differenceInDays, addYears, isBefore, startOfDay } from 'date-fns';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { BirthdayWidget } from '../widgets/BirthdayWidget';
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
                    <BirthdayWidget
                        name="No Birthdays"
                        daysUntil={0}
                        date=""
                        age={0}
                    />
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
            name: nextUp.name,
            daysUntil: nextUp.daysUntil,
            date: nextUp.birthday_date,
            age: nextUp.turningAge,
            lastUpdated: new Date().toISOString(),
        };

        // Save to SharedPreferences (accessible by widget)
        await WidgetStorage.saveWidgetData(widgetData);

        // Trigger widget update
        await requestWidgetUpdate({
            widgetName: 'BirthdayWidget',
            renderWidget: () => (
                <BirthdayWidget
                    name={widgetData.name}
                    daysUntil={widgetData.daysUntil}
                    date={widgetData.date}
                    age={widgetData.age}
                />
            ),
            widgetNotFound: () => {
                console.log('Birthday widget not found on home screen');
            }
        });

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

        if (!data) {
            console.log('No widget data available');
            return;
        }

        await requestWidgetUpdate({
            widgetName: 'BirthdayWidget',
            renderWidget: () => (
                <BirthdayWidget
                    name={data.name}
                    daysUntil={data.daysUntil}
                    date={data.date}
                    age={data.age}
                />
            ),
            widgetNotFound: () => {
                console.log('Birthday widget not found on home screen');
            }
        });
    } catch (error) {
        console.error('Failed to refresh widget:', error);
    }
};
