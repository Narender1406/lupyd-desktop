package com.lupyd.app

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.Typeface
import android.os.Build
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.RemoteInput
import androidx.core.content.ContextCompat
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.firebase.messaging.FirebaseMessaging
import firefly.Message
import kotlinx.coroutines.runBlocking
import org.json.JSONArray
import org.json.JSONObject

/**
 * Pure Native Notification Plugin
 * Handles ALL notification functionality without relying on Capacitor notification plugins
 */
@CapacitorPlugin(name = "NativeNotification")
class NativeNotificationPlugin : Plugin() {

    companion object {
        private const val TAG = "lupyd-NativeNotif"
        const val CHANNEL_ID = "lupyd_notifications"
        const val CHANNEL_NAME = "Lupyd Notifications"
        const val CHANNEL_DESCRIPTION = "Lupyd app notifications"

        const val CHANNEL_ID_CALL = "lupyd_calls"
        const val CHANNEL_NAME_CALL = "Lupyd Calls"
        const val CHANNEL_DESCRIPTION_CALL = "Incoming call notifications"

        const val ACTION_ACCEPT_CALL = "com.lupyd.app.ACCEPT_CALL"
        const val ACTION_DECLINE_CALL = "com.lupyd.app.DECLINE_CALL"

        const val CALL_NOTIFICATION_ID_BASE = 10000
    }

}

class MarkAsReadReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null || intent == null) return
        
        val sender = intent.getStringExtra("sender") ?: return
        val msgId = intent.getLongExtra("msgId", 0L)
        
        Log.d("lupyd-MarkAsRead", "Marking conversation with $sender until $msgId as read")
        
        // Cancel the notification
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(sender.hashCode())
        


        val db = getDatabase(context)

        val fireflyClient = FireflyClient.getInstance(context)

        runBlocking {

            fireflyClient.initialize(context)

            fireflyClient.markAsReadUntil(sender, msgId)
            db.userMessageNotificationsDao().deleteUntilOfSender(sender, msgId)
        }
    }
}
