import * as Notifications from 'expo-notifications';
import { Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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


// ... (existing imports)

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

    // Get Data
    let preferredHour = 9;
    let preferredMinute = 0;
    try {
        const storedTime = await AsyncStorage.getItem('notification_time');
        if (storedTime) {
            const { hour, minute } = JSON.parse(storedTime);
            preferredHour = hour;
            preferredMinute = minute;
        }
    } catch (e) {
        console.warn('Could not load notification time preference', e);
    }

    const now = new Date();
    const bDate = new Date(birthday.birthday_date);

    // Create Date object for this year's birthday
    const birthdayThisYear = new Date(
        now.getFullYear(),
        bDate.getMonth(),
        bDate.getDate()
    );
    birthdayThisYear.setHours(0, 0, 0, 0);

    let targetBirthday = new Date(birthdayThisYear);
    if (targetBirthday < now) {
        targetBirthday.setFullYear(now.getFullYear() + 1);
    }

    // 1 DAY PRIOR NOTIFICATION
    // We stick to the user's preferred time for the prior day too, or maybe keep it 9AM? 
    // Spec didn't start. Let's use preferred time for consistency.
    const oneDayPrior = new Date(targetBirthday);
    oneDayPrior.setDate(oneDayPrior.getDate() - 1);
    oneDayPrior.setHours(preferredHour, preferredMinute, 0, 0);

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

    // ON THE DAY NOTIFICATION
    const onTheDay = new Date(targetBirthday);
    onTheDay.setHours(preferredHour, preferredMinute, 0, 0);

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
