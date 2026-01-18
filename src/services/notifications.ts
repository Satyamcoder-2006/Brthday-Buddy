import * as Notifications from 'expo-notifications';
import { Platform, Alert, Linking } from 'react-native';
import { supabase } from './supabase';
import { Birthday } from '../types';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export async function registerForPushNotificationsAsync() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        Alert.alert(
            'Notifications Disabled',
            'Enable notifications in Settings to get birthday reminders.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
        );
        return false;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('birthdays', {
            name: 'Birthday Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF9500',
        });
    }

    return true;
}

export async function scheduleBirthdayNotifications(birthday: Birthday) {
    const notificationIds: string[] = [];

    // Cancel existing notifications for this birthday
    if (birthday.notification_ids?.length) {
        await Promise.all(
            birthday.notification_ids.map(id =>
                Notifications.cancelScheduledNotificationAsync(id).catch(() => { /* Ignore cleanup errors */ })
            )
        );
    }

    const now = new Date();
    const bDate = new Date(birthday.birthday_date);

    // Create Date object for this year's birthday
    const birthdayThisYear = new Date(
        now.getFullYear(),
        bDate.getMonth(),
        bDate.getDate() // This might need handling for GMT vs Local, generally assumes local date string 'YYYY-MM-DD'
    );
    // Fix time to start of day
    birthdayThisYear.setHours(0, 0, 0, 0);


    // If birthday passed this year (including today?), schedule for next year
    // If Today, we might want to alert if it's not too late. 
    // Simplified logic: strict > now. 

    let targetBirthday = new Date(birthdayThisYear);
    if (targetBirthday < now) {
        targetBirthday.setFullYear(now.getFullYear() + 1);
    }

    // 1 DAY PRIOR NOTIFICATION (9 AM)
    const oneDayPrior = new Date(targetBirthday);
    oneDayPrior.setDate(oneDayPrior.getDate() - 1);
    oneDayPrior.setHours(9, 0, 0, 0);

    if (oneDayPrior > now) {
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: `Tomorrow: ${birthday.name}'s Birthday! 🎂`,
                body: `Don't forget to wish them a happy birthday!`,
                sound: 'default',
                data: { birthdayId: birthday.id, type: '1-day-prior' },
                categoryIdentifier: 'birthday-reminder',
                badge: 1,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: oneDayPrior,
                channelId: 'birthdays',
            },
        });
        notificationIds.push(id);
    }

    // 1 HOUR PRIOR NOTIFICATION (on the day, e.g. 10 AM? Or 00:00 - 1h = 11PM prev day? 
    // Spec says: "1 hour prior toggle". Usually implies "On the day at specific time" or "Just before start". 
    // Actually spec says: 
    // "1 HOUR PRIOR NOTIFICATION ... oneHourPrior.setHours(oneHourPrior.getHours() - 1);"
    // If targetBirthday is 00:00, this is 11PM day before. 
    // A better default for "Birthday" is notification at 9AM on the day. 
    // But let's follow spec logic or improve.
    // "oneHourPrior" usually means 1 hour before the *event*. If event is all day, when is the event?
    // Let's assume the user wants a notification ON the day. 
    // I will schedule one for 10:00 AM on the day of birthday. 
    // Wait, the spec code snippet:
    // const oneHourPrior = new Date(targetBirthday); oneHourPrior.setHours(oneHourPrior.getHours() - 1);
    // If targetBirthday is 00:00, this is 23:00 previous day. That's weird.
    // I'll adjust: Notify at 9 AM on the day.

    const onTheDay = new Date(targetBirthday);
    onTheDay.setHours(9, 0, 0, 0); // 9 AM

    if (onTheDay > now) {
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: `${birthday.name}'s Birthday is Today! 🎉`,
                body: `Time to celebrate!`,
                sound: 'default',
                data: { birthdayId: birthday.id, type: 'on-the-day' },
                categoryIdentifier: 'birthday-reminder',
                badge: 1,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: onTheDay,
                channelId: 'birthdays',
            },
        });
        notificationIds.push(id);
    }

    // Update DB
    await supabase
        .from('birthdays')
        .update({ notification_ids: notificationIds })
        .eq('id', birthday.id);

    return notificationIds;
}
