package com.satyam.birthdaybuddy.widget;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import org.json.JSONArray;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

/**
 * BroadcastReceiver that handles midnight updates for birthday widgets
 * Recalculates countdowns when the date changes
 */
public class WidgetUpdateReceiver extends BroadcastReceiver {
    private static final String TAG = "WidgetUpdateReceiver";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        
        if (Intent.ACTION_DATE_CHANGED.equals(action) || 
            Intent.ACTION_TIME_CHANGED.equals(action) ||
            "com.satyam.birthdaybuddy.UPDATE_WIDGET".equals(action)) {
            
            Log.d(TAG, "Received update trigger: " + action);
            recalculateAndUpdateWidgets(context);
        }
    }
    
    /**
     * Recalculates birthday countdowns and updates widgets
     */
    private void recalculateAndUpdateWidgets(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(
                "WidgetDataPrefs", 
                Context.MODE_PRIVATE
            );
            
            String widgetDataJson = prefs.getString("widgetData", null);
            if (widgetDataJson == null) {
                Log.w(TAG, "No widget data found");
                return;
            }
            
            JSONObject widgetData = new JSONObject(widgetDataJson);
            JSONObject nextBirthday = widgetData.optJSONObject("nextBirthday");
            JSONArray upcomingBirthdays = widgetData.optJSONArray("upcomingBirthdays");
            
            if (nextBirthday != null) {
                // Recalculate next birthday countdown
                String birthdayDate = nextBirthday.getString("birthdayDate");
                int birthYear = nextBirthday.getInt("birthYear");
                int newDaysUntil = calculateDaysUntil(birthdayDate);
                int newAge = calculateAge(birthYear, birthdayDate);
                
                // Update JSON
                nextBirthday.put("daysUntil", newDaysUntil);
                nextBirthday.put("turningAge", newAge);
                nextBirthday.put("lastCalculated", new Date().toString());
                
                Log.d(TAG, "Widget data recalculated. Days until: " + newDaysUntil);
            }

            if (upcomingBirthdays != null) {
                // Recalculate all upcoming birthdays
                for (int i = 0; i < upcomingBirthdays.length(); i++) {
                    JSONObject birthday = upcomingBirthdays.getJSONObject(i);
                    String bDate = birthday.getString("birthdayDate");
                    int bYear = birthday.getInt("birthYear");
                    
                    birthday.put("daysUntil", calculateDaysUntil(bDate));
                    birthday.put("turningAge", calculateAge(bYear, bDate));
                    birthday.put("lastCalculated", new Date().toString());
                }
            }
            
            // Save updated data
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("widgetData", widgetData.toString());
            editor.apply();
            
            // Trigger widget re-render
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName thisWidget = new ComponentName(context, BirthdayWidget.class);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget);
            
            // Notify the widget provider that data has changed
            Intent intent = new Intent(context, BirthdayWidget.class);
            intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds);
            context.sendBroadcast(intent);
            
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to recalculate widget data", e);
        }
    }
    
    /**
     * Calculate days until next occurrence of birthday
     * @param birthdayDate Birthday in "YYYY-MM-DD" format
     * @return Days until next birthday
     */
    private int calculateDaysUntil(String birthdayDate) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
            Date birthDate = sdf.parse(birthdayDate);
            if (birthDate == null) return 0;
            
            // Use NOON to avoid DST off-by-one errors when crossing midnight
            Calendar today = Calendar.getInstance();
            today.set(Calendar.HOUR_OF_DAY, 12);
            today.set(Calendar.MINUTE, 0);
            today.set(Calendar.SECOND, 0);
            today.set(Calendar.MILLISECOND, 0);
            
            Calendar nextBirthday = Calendar.getInstance();
            nextBirthday.setTime(birthDate);
            nextBirthday.set(Calendar.YEAR, today.get(Calendar.YEAR));
            nextBirthday.set(Calendar.HOUR_OF_DAY, 12);
            nextBirthday.set(Calendar.MINUTE, 0);
            nextBirthday.set(Calendar.SECOND, 0);
            nextBirthday.set(Calendar.MILLISECOND, 0);
            
            // If birthday already passed this year (by checking day of year roughly)
            // We use compareTo or before. Since both are set to Noon, safe comparison.
            if (nextBirthday.before(today)) {
                nextBirthday.add(Calendar.YEAR, 1);
            }
            
            long diffMillis = nextBirthday.getTimeInMillis() - today.getTimeInMillis();
            // Round to nearest day to handle minor DST shifts (23h or 25h)
            return Math.round(diffMillis / (float) (24 * 60 * 60 * 1000));
            
        } catch (Exception e) {
            Log.e(TAG, "Error calculating days until", e);
            return 0;
        }
    }
    
    /**
     * Calculate age on next birthday
     * @param birthYear Year of birth
     * @param birthdayDate Birthday in "YYYY-MM-DD" format
     * @return Age on next birthday
     */
    private int calculateAge(int birthYear, String birthdayDate) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
            Date birthDate = sdf.parse(birthdayDate);
            if (birthDate == null) return 0;
            
            Calendar today = Calendar.getInstance();
            Calendar nextBirthday = Calendar.getInstance();
            nextBirthday.setTime(birthDate);
            nextBirthday.set(Calendar.YEAR, today.get(Calendar.YEAR));
            
            if (nextBirthday.before(today)) {
                nextBirthday.add(Calendar.YEAR, 1);
            }
            
            return nextBirthday.get(Calendar.YEAR) - birthYear;
            
        } catch (Exception e) {
            Log.e(TAG, "Error calculating age", e);
            return 0;
        }
    }
}
