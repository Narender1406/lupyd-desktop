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
import app.tauri.annotation.Command
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSObject


import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import android.content.pm.PackageManager
import android.Manifest
import android.os.Build

@TauriPlugin
class NotificationHandlerPlugin(private val activity: Activity): Plugin(activity) {
    private val PERMISSION_REQUEST_CODE = 56789
    private var pendingPermissionInvoke: Invoke? = null
    
    init {
        instance = java.lang.ref.WeakReference(this)
    }

    companion object {
        var instance: java.lang.ref.WeakReference<NotificationHandlerPlugin>? = null

        fun showUserBundledNotificationInner(activity: Activity, jsObj: JSObject) {
            try {
                val jsonObject = jsObj
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
  
    @Command
    fun showUserBundledNotification(invoke: Invoke) {
      val obj = invoke.getArgs()
      showUserBundledNotificationInner(activity, obj)
      invoke.resolve()
    }


    @Command
    fun requestAllPermissions(invoke: Invoke) {
        val permissionsToRequest = mutableListOf<String>()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
             if (ContextCompat.checkSelfPermission(activity, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                 permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS)
             }
        }

        if (ContextCompat.checkSelfPermission(activity, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.CAMERA)
        }

        if (ContextCompat.checkSelfPermission(activity, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.RECORD_AUDIO)
        }

        if (permissionsToRequest.isEmpty()) {
            val ret = JSObject()
            ret.put("granted", true)
            invoke.resolve(ret)
            return
        }

        pendingPermissionInvoke = invoke
        ActivityCompat.requestPermissions(activity, permissionsToRequest.toTypedArray(), PERMISSION_REQUEST_CODE)
    }

    fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        if (requestCode == PERMISSION_REQUEST_CODE) {
             if (pendingPermissionInvoke == null) return

             val invoke = pendingPermissionInvoke!!
             pendingPermissionInvoke = null

             var allGranted = true
             for (result in grantResults) {
                 if (result != PackageManager.PERMISSION_GRANTED) {
                     allGranted = false
                     break
                 }
             }

             if (allGranted) {
                 val ret = JSObject()
                 ret.put("granted", true)
                 invoke.resolve(ret)
             } else {
                 invoke.reject("Permissions denied")
             }
        }
    }

}