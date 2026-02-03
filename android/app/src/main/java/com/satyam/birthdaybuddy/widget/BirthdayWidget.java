package com.satyam.birthdaybuddy.widget;

import android.content.Context;
import com.reactnativeandroidwidget.RNWidgetProvider;

public class BirthdayWidget extends RNWidgetProvider {
    @Override
    public void onEnabled(Context context) {
        super.onEnabled(context);
        // Schedule midnight updates when widget is first added
        WidgetAlarmManager.scheduleMidnightUpdate(context);
    }

    @Override
    public void onDisabled(Context context) {
        super.onDisabled(context);
        // Cancel alarms when last widget is removed
        WidgetAlarmManager.cancelAlarm(context);
    }
}
