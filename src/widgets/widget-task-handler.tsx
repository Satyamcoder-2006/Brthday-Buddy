import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { BirthdayWidget, SmallBirthdayWidget, MediumBirthdayWidget, EmptyBirthdayWidget } from './BirthdayWidget';
import { differenceInDays, startOfDay, addYears, isBefore } from 'date-fns';

// Import NativeModules to access SharedPreferences
import { NativeModules } from 'react-native';
const { WidgetDataBridgeModule } = NativeModules;

/**
 * Widget Task Handler - Runs in headless JS context
 * This is called when widget needs to update
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
    const widgetInfo = props.widgetInfo;
    const widgetAction = props.widgetAction;
    const widgetName = widgetInfo.widgetName;

    console.log('=== WIDGET DEBUG START ===');
    console.log('Widget task handler called:', widgetAction, 'for', widgetName);

    let widgetData = null;

    try {
        // Load data from SharedPreferences via Native Module
        let stored = null;

        if (WidgetDataBridgeModule) {
            const jsonData = await WidgetDataBridgeModule.getWidgetData();
            console.log('Raw JSON from native:', jsonData);

            if (jsonData) {
                stored = JSON.parse(jsonData);
                console.log('Parsed widget data:', JSON.stringify(stored, null, 2));
            } else {
                console.log('❌ No data in SharedPreferences');
            }
        } else {
            console.log('❌ WidgetDataBridgeModule not available!');
        }

        if (stored && stored.nextBirthday) {
            // New Data Structure Logic
            const nextBirthdayData = stored.nextBirthday;

            // Re-calculate daysUntil to ensure widget is always up to date
            const today = startOfDay(new Date());
            const birthDateStr = nextBirthdayData.birthdayDate;
            const birthDate = new Date(birthDateStr);

            if (!isNaN(birthDate.getTime())) {
                const currentYear = today.getFullYear();
                // Re-calculate main birthday
                let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
                nextBirthday = startOfDay(nextBirthday);
                if (isBefore(nextBirthday, today)) nextBirthday = addYears(nextBirthday, 1);
                const daysUntil = differenceInDays(nextBirthday, today);

                widgetData = {
                    id: nextBirthdayData.id,
                    name: nextBirthdayData.name,
                    daysUntil: daysUntil, // Use recalculated value
                    date: nextBirthdayData.birthdayDate,
                    age: nextBirthday.getFullYear() - nextBirthdayData.birthYear,
                    photoUrl: nextBirthdayData.avatarUrl,
                    // Re-calculate for all upcoming items too
                    upcoming: (stored.upcomingBirthdays || []).map(u => {
                        const uDate = new Date(u.birthdayDate);
                        if (isNaN(uDate.getTime())) return u;

                        let uNext = new Date(currentYear, uDate.getMonth(), uDate.getDate());
                        uNext = startOfDay(uNext);
                        if (isBefore(uNext, today)) uNext = addYears(uNext, 1);
                        return {
                            id: u.id,
                            name: u.name,
                            daysUntil: differenceInDays(uNext, today),
                            date: u.birthdayDate,
                            age: uNext.getFullYear() - u.birthYear,
                            photoUrl: u.avatarUrl
                        };
                    })
                };
            } else {
                // Fallback if date is invalid, though shouldn't happen
                widgetData = {
                    id: nextBirthdayData.id,
                    name: nextBirthdayData.name,
                    daysUntil: nextBirthdayData.daysUntil,
                    date: nextBirthdayData.birthdayDate,
                    age: nextBirthdayData.turningAge,
                    photoUrl: nextBirthdayData.avatarUrl,
                    upcoming: stored.upcomingBirthdays
                };
            }

            console.log(`✅ Widget successfully updated at ${new Date().toLocaleTimeString()} for ${widgetName}`);
        } else {
            console.log('❌ NO DATA - Will show empty widget');
        }
    } catch (error) {
        console.error('❌ Widget data load error:', error);
    }

    console.log('Widget data status:', widgetData ? '✅ HAS DATA' : '❌ NULL');
    console.log('=== WIDGET DEBUG END ===');

    const renderSelectedWidget = () => {
        if (!widgetData) {
            console.log('Rendering EmptyBirthdayWidget');
            return <EmptyBirthdayWidget />;
        }

        switch (widgetName) {
            case 'BirthdayWidget':
                console.log('Rendering BirthdayWidget (Medium) with data');
                return <MediumBirthdayWidget {...widgetData} />;
            case 'BirthdayWidgetSmall':
                console.log('Rendering SmallBirthdayWidget with data');
                return <SmallBirthdayWidget {...widgetData} />;
            case 'BirthdayWidgetMedium':
            default:
                console.log('Rendering MediumBirthdayWidget with data');
                return <MediumBirthdayWidget {...widgetData} />;
        }
    };

    // Handle different widget actions
    switch (widgetAction) {
        case 'WIDGET_ADDED':
        case 'WIDGET_UPDATE':
        case 'WIDGET_RESIZED':
            props.renderWidget(renderSelectedWidget());
            break;

        case 'WIDGET_DELETED':
            console.log('Widget removed');
            break;

        case 'WIDGET_CLICK':
            // Click is handled by clickAction in the widget components
            break;

        default:
            props.renderWidget(renderSelectedWidget());
            break;
    }
}
