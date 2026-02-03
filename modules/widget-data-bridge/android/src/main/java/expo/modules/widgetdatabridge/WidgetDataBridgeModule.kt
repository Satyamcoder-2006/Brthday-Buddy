package expo.modules.widgetdatabridge

import android.content.Context
import android.content.SharedPreferences
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class WidgetDataBridgeModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("WidgetDataBridge")

    Function("saveWidgetData") { data: String ->
      val context = appContext.reactContext ?: return@Function false
      val prefs = context.getSharedPreferences("BirthdayWidgetPrefs", Context.MODE_PRIVATE)
      prefs.edit().putString("birthday_widget_data", data).apply()
      return@Function true
    }

    Function("getWidgetData") {
      val context = appContext.reactContext ?: return@Function null
      val prefs = context.getSharedPreferences("BirthdayWidgetPrefs", Context.MODE_PRIVATE)
      return@Function prefs.getString("birthday_widget_data", null)
    }

    Function("clearWidgetData") {
      val context = appContext.reactContext ?: return@Function false
      val prefs = context.getSharedPreferences("BirthdayWidgetPrefs", Context.MODE_PRIVATE)
      prefs.edit().remove("birthday_widget_data").apply()
      return@Function true
    }
  }
}
