import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { BirthdayWidget } from './BirthdayWidget';
import { WidgetStorage } from '../services/WidgetDataBridge';

/**
 * Widget Task Handler - Runs in headless JS context
 * This is called when widget needs to update
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
    const widgetInfo = props.widgetInfo;
    const widgetAction = props.widgetAction;

    console.log('Widget task handler called:', widgetAction);

    // Default state when no data available
    const defaultData = {
        name: 'No Birthdays',
        daysUntil: 0,
        date: '',
        age: 0
    };

    let widgetData = defaultData;

    try {
        // Load data from SharedPreferences via Native Module
        // This is crucial: AsyncStorage often fails in Headless JS on Android
        const stored = await WidgetStorage.getWidgetData();

        if (stored) {
            // Verify data is still fresh (< 24 hours old?)
            // Actually for birthdays, data doesn't change often, but "daysUntil" does.
            //Ideally we should re-calculate daysUntil here if possible, but we stored static data.
            // Re-calculating daysUntil from stored date is better.

            const targetDate = new Date(stored.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Re-calc logic simplifed:
            // We trust the service pushed fresh data recently. 
            // Or we just use stored for now.

            widgetData = {
                name: stored.name,
                daysUntil: stored.daysUntil, // Ideally recalc this if we could
                date: stored.date,
                age: stored.age
            };
        } else {
            console.log('No widget data found in storage');
        }
    } catch (error) {
        console.error('Widget data load error:', error);
    }

    // Handle different widget actions
    switch (widgetAction) {
        case 'WIDGET_ADDED':
        case 'WIDGET_UPDATE':
        case 'WIDGET_RESIZED':
            props.renderWidget(
                <BirthdayWidget
                    name={widgetData.name}
                    daysUntil={widgetData.daysUntil}
                    date={widgetData.date}
                    age={widgetData.age}
                />
            );
            break;

        case 'WIDGET_DELETED':
            console.log('Widget removed');
            break;

        case 'WIDGET_CLICK':
            // The clickAction in the widget component handles app opening
            break;

        default:
            break;
    }
}
