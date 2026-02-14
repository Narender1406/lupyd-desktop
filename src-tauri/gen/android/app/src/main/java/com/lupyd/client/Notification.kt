package com.lupyd.client

import android.app.Activity
import app.tauri.plugin.Plugin
import org.json.JSONObject
import android.content.Intent
import android.app.PendingIntent
import androidx.core.app.RemoteInput
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.Rect
import android.content.Context

class Notification(private val activity: Activity): Plugin(activity) {
    companion object {
        @JvmStatic
        fun showUserBundledNotification(activity: Activity, json: String) {
            try {
                val jsonObject = JSONObject(json)
                val other = jsonObject.optString("other", "Unknown")
                val messagesArray = jsonObject.optJSONArray("messages")

                val notificationManager = activity.getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager

                val channelId = "lupyd_channel"
                // Create channel if needed
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                    val channelName = "Messages"
                    val channel = android.app.NotificationChannel(
                        channelId,
                        channelName,
                        android.app.NotificationManager.IMPORTANCE_HIGH
                    ).apply {
                        description = "New messages"
                        enableVibration(true)
                        enableLights(true)
                    }
                    notificationManager.createNotificationChannel(channel)
                }
                
                // Get resource ID for icon - using a standard fallback if not found
                var smallIconId = activity.resources.getIdentifier("flower_notification_icon", "drawable", activity.packageName)
                if (smallIconId == 0) {
                     smallIconId = android.R.drawable.ic_dialog_info // Fallback
                }

                val builder = androidx.core.app.NotificationCompat.Builder(activity, channelId)
                    .setSmallIcon(smallIconId)
                    .setContentTitle(other)
                    .setAutoCancel(true)
                    .setPriority(androidx.core.app.NotificationCompat.PRIORITY_HIGH)
                    .setCategory(androidx.core.app.NotificationCompat.CATEGORY_MESSAGE)

                // InboxStyle
                val inboxStyle = androidx.core.app.NotificationCompat.InboxStyle()
                var latestText = ""

                if (messagesArray != null) {
                    for (i in 0 until messagesArray.length()) {
                        val msgObj = messagesArray.getJSONObject(i)
                        val text = msgObj.optString("text", "")
                        val sentByMe = msgObj.optBoolean("sent_by_me", false)
                        val prefix = if (sentByMe) "Me: " else ""
                        inboxStyle.addLine(prefix + text)
                        latestText = text
                    }
                }
                
                // Set summary text if multiple messages
                if (messagesArray != null && messagesArray.length() > 1) {
                     inboxStyle.setSummaryText("${messagesArray.length()} messages")
                }

                builder.setStyle(inboxStyle)
                builder.setContentText(latestText)

                // Intents - deep link to open app
                // We use the package manager to get the launch intent to ensure we open the app correctly
                val launchIntent = activity.packageManager.getLaunchIntentForPackage(activity.packageName)
                
                val pendingIntent = if (launchIntent != null) {
                    android.app.PendingIntent.getActivity(
                        activity,
                        other.hashCode(),
                        launchIntent,
                        android.app.PendingIntent.FLAG_IMMUTABLE or android.app.PendingIntent.FLAG_UPDATE_CURRENT
                    )
                } else {
                    null
                }
                
                if (pendingIntent != null) {
                    builder.setContentIntent(pendingIntent)
                }

                notificationManager.notify(other.hashCode(), builder.build())

            } catch (e: Exception) {
                android.util.Log.e("lupyd-Notification", "Error showing notification", e)
            }
        }
    }
}