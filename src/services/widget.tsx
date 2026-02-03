import { Birthday } from '../types';
import { differenceInDays, addYears, isBefore, startOfDay } from 'date-fns';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { BirthdayWidget, SmallBirthdayWidget, MediumBirthdayWidget, EmptyBirthdayWidget } from '../widgets/BirthdayWidget';
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

            // Update only Small and Medium widgets to show "No birthdays"
            const widgetSizes = ['BirthdayWidgetSmall', 'BirthdayWidgetMedium'];
            for (const widgetName of widgetSizes) {
                await requestWidgetUpdate({
                    widgetName,
                    renderWidget: () => (
                        <EmptyBirthdayWidget />
                    ),
                    widgetNotFound: () => { }
                });
            }
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
                birthYear,
                nextBirthday
            };
        });

        // Sort by days until birthday (ascending)
        upcomingBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);

        const nextUp = upcomingBirthdays[0];
        const birthDate = new Date(nextUp.birthday_date);

        // New data structure with birthdayDate and birthYear
        const widgetData = {
            nextBirthday: {
                id: nextUp.id,
                name: nextUp.name,
                birthdayDate: nextUp.birthday_date, // Full date for recalculation
                birthYear: birthDate.getFullYear(),
                avatarUrl: nextUp.avatar_url,
                daysUntil: nextUp.daysUntil,
                turningAge: nextUp.turningAge,
                lastCalculated: new Date().toISOString()
            },
            upcomingBirthdays: upcomingBirthdays.slice(0, 5).map(b => ({
                id: b.id,
                name: b.name,
                birthdayDate: b.birthday_date,
                birthYear: new Date(b.birthday_date).getFullYear(),
                avatarUrl: b.avatar_url,
                daysUntil: b.daysUntil,
                turningAge: b.turningAge,
                lastCalculated: new Date().toISOString()
            })),
            version: "1.0",
            lastUpdated: new Date().toISOString()
        };

        // Save to SharedPreferences (accessible by widget and midnight receiver)
        await WidgetStorage.saveWidgetData(widgetData);

        // Trigger updates for the main Widget
        const nextUpProps = {
            id: nextUp.id,
            name: nextUp.name,
            daysUntil: nextUp.daysUntil,
            date: nextUp.birthday_date,
            age: nextUp.turningAge,
            photoUrl: nextUp.avatar_url,
            upcoming: widgetData.upcomingBirthdays.map(b => ({
                id: b.id,
                name: b.name,
                daysUntil: b.daysUntil,
                date: b.birthdayDate,
                age: b.turningAge,
                photoUrl: b.avatarUrl
            }))
        };

        await requestWidgetUpdate({
            widgetName: 'BirthdayWidget',
            renderWidget: () => <MediumBirthdayWidget {...nextUpProps} />,
            widgetNotFound: () => { }
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

        if (!data || !data.nextBirthday) {
            // No data, show empty widgets
            await requestWidgetUpdate({
                widgetName: 'BirthdayWidget',
                renderWidget: () => <EmptyBirthdayWidget />,
                widgetNotFound: () => { }
            });
            return;
        }

        const nextUpProps = {
            id: data.nextBirthday.id,
            name: data.nextBirthday.name,
            daysUntil: data.nextBirthday.daysUntil,
            date: data.nextBirthday.birthdayDate,
            age: data.nextBirthday.turningAge,
            photoUrl: data.nextBirthday.avatarUrl,
            upcoming: data.upcomingBirthdays.map(b => ({
                id: b.id,
                name: b.name,
                daysUntil: b.daysUntil,
                date: b.birthdayDate,
                age: b.turningAge,
                photoUrl: b.avatarUrl
            }))
        };

        await requestWidgetUpdate({
            widgetName: 'BirthdayWidget',
            renderWidget: () => <MediumBirthdayWidget {...nextUpProps} />,
            widgetNotFound: () => { }
        });

        // Large widget removed

    } catch (error) {
        console.error('Failed to refresh widgets:', error);
    }
};
