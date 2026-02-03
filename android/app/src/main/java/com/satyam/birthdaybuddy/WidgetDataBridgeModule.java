package com.satyam.birthdaybuddy;

import android.content.Context;
import android.content.SharedPreferences;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class WidgetDataBridgeModule extends ReactContextBaseJavaModule {
    private static final String PREFS_NAME = "BirthdayWidgetPrefs";
    private static final String KEY_WIDGET_DATA = "birthday_widget_data";

    private final ReactApplicationContext reactContext;

    public WidgetDataBridgeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "WidgetDataBridgeModule";
    }

    @ReactMethod
    public void saveWidgetData(String data, Promise promise) {
        try {
            SharedPreferences prefs = reactContext.getSharedPreferences(
                PREFS_NAME, 
                Context.MODE_PRIVATE
            );
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString(KEY_WIDGET_DATA, data);
            editor.apply();
            
            android.util.Log.d("WidgetDataBridge", "Data saved successfully: " + data);
            promise.resolve(true);
        } catch (Exception e) {
            android.util.Log.e("WidgetDataBridge", "Failed to save data", e);
            promise.reject("SAVE_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getWidgetData(Promise promise) {
        try {
            SharedPreferences prefs = reactContext.getSharedPreferences(
                PREFS_NAME, 
                Context.MODE_PRIVATE
            );
            String data = prefs.getString(KEY_WIDGET_DATA, null);
            
            android.util.Log.d("WidgetDataBridge", "Data retrieved: " + (data != null ? data : "NULL"));
            promise.resolve(data);
        } catch (Exception e) {
            android.util.Log.e("WidgetDataBridge", "Failed to get data", e);
            promise.reject("GET_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void clearWidgetData(Promise promise) {
        try {
            SharedPreferences prefs = reactContext.getSharedPreferences(
                PREFS_NAME, 
                Context.MODE_PRIVATE
            );
            SharedPreferences.Editor editor = prefs.edit();
            editor.remove(KEY_WIDGET_DATA);
            editor.apply();
            
            android.util.Log.d("WidgetDataBridge", "Data cleared");
            promise.resolve(true);
        } catch (Exception e) {
            android.util.Log.e("WidgetDataBridge", "Failed to clear data", e);
            promise.reject("CLEAR_ERROR", e.getMessage());
        }
    }
}
