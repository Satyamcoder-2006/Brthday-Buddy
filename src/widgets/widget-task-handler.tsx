import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { BirthdayWidget, SmallBirthdayWidget, MediumBirthdayWidget, LargeBirthdayWidget, EmptyBirthdayWidget } from './BirthdayWidget';
import { WidgetStorage } from '../services/WidgetDataBridge';
import { differenceInDays, startOfDay, addYears, isBefore } from 'date-fns';

/**
 * Widget Task Handler - Runs in headless JS context
 * This is called when widget needs to update
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
    const widgetInfo = props.widgetInfo;
    const widgetAction = props.widgetAction;
    const widgetName = widgetInfo.widgetName;

    console.log('Widget task handler called:', widgetAction, 'for', widgetName);

    let widgetData = null;

    try {
        // Load data from SharedPreferences via Native Module
        const stored = await WidgetStorage.getWidgetData();

        if (stored) {
            // Re-calculate daysUntil to ensure widget is always up to date
            // even if the app hasn't been opened effectively "auto-updating" the count
            const today = startOfDay(new Date());
            const birthDate = new Date(stored.date);

            const currentYear = today.getFullYear();
            // Re-calculate main birthday
            let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
            nextBirthday = startOfDay(nextBirthday);
            if (isBefore(nextBirthday, today)) nextBirthday = addYears(nextBirthday, 1);
            const daysUntil = differenceInDays(nextBirthday, today);

            widgetData = {
                ...stored,
                daysUntil,
                // Re-calculate for all upcoming items too
                upcoming: (stored.upcoming || []).map(u => {
                    const uDate = new Date(u.date);
                    let uNext = new Date(currentYear, uDate.getMonth(), uDate.getDate());
                    uNext = startOfDay(uNext);
                    if (isBefore(uNext, today)) uNext = addYears(uNext, 1);
                    return {
                        ...u,
                        daysUntil: differenceInDays(uNext, today),
                        // Also update age if birthday passed
                        age: uNext.getFullYear() - uDate.getFullYear()
                    };
                })
            };

            console.log(`Widget successfully updated at ${new Date().toLocaleTimeString()} for ${widgetName}`);
        } else {
            console.log('No widget data found in storage');
        }
    } catch (error) {
        console.error('Widget data load error:', error);
    }

    const renderSelectedWidget = () => {
        if (!widgetData) return <EmptyBirthdayWidget />;

        switch (widgetName) {
            case 'BirthdayWidgetSmall':
                return <SmallBirthdayWidget {...widgetData} />;
            case 'BirthdayWidgetLarge':
                return <LargeBirthdayWidget {...widgetData} />;
            case 'BirthdayWidgetMedium':
            default:
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
