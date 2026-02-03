package com.satyam.birthdaybuddy.widget;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;
import java.util.Calendar;

public class WidgetAlarmManager {
    private static final String TAG = "WidgetAlarmManager";
    private static final int ALARM_REQUEST_CODE = 10001;
    
    public static void scheduleMidnightUpdate(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) {
            Log.e(TAG, "AlarmManager not available");
            return;
        }
        
        // Check if we can schedule exact alarms (Android 12+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (!alarmManager.canScheduleExactAlarms()) {
                Log.w(TAG, "Cannot schedule exact alarms. User needs to grant permission.");
                // Fallback to inexact alarm
                scheduleInexactAlarm(context, alarmManager);
                return;
            }
        }
        
        Intent intent = new Intent(context, WidgetUpdateReceiver.class);
        intent.setAction("com.satyam.birthdaybuddy.UPDATE_WIDGET");
        
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context,
            ALARM_REQUEST_CODE,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        
        // Schedule for next midnight
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        calendar.add(Calendar.DAY_OF_YEAR, 1); // Tomorrow midnight
        
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    calendar.getTimeInMillis(),
                    pendingIntent
                );
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    calendar.getTimeInMillis(),
                    pendingIntent
                );
            }
            
            Log.d(TAG, "Scheduled exact midnight alarm for: " + calendar.getTime());
            
        } catch (SecurityException e) {
            Log.e(TAG, "Permission denied for exact alarm", e);
            scheduleInexactAlarm(context, alarmManager);
        }
    }
    
    private static void scheduleInexactAlarm(Context context, AlarmManager alarmManager) {
        Intent intent = new Intent(context, WidgetUpdateReceiver.class);
        intent.setAction("com.satyam.birthdaybuddy.UPDATE_WIDGET");
        
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context,
            ALARM_REQUEST_CODE,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        
        // Schedule inexact repeating alarm (daily, within 1 hour window)
        alarmManager.setInexactRepeating(
            AlarmManager.RTC,
            System.currentTimeMillis() + AlarmManager.INTERVAL_DAY,
            AlarmManager.INTERVAL_DAY,
            pendingIntent
        );
        
        Log.d(TAG, "Scheduled inexact daily alarm");
    }
    
    public static void cancelAlarm(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;
        
        Intent intent = new Intent(context, WidgetUpdateReceiver.class);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context,
            ALARM_REQUEST_CODE,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        
        alarmManager.cancel(pendingIntent);
        Log.d(TAG, "Cancelled widget alarm");
    }
}
