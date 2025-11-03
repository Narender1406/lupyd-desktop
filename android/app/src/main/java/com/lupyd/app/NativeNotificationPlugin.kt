package com.lupyd.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.RemoteInput
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.firebase.messaging.FirebaseMessaging
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
        
        const val KEY_TEXT_REPLY = "key_text_reply"
        const val GROUP_KEY_MESSAGES = "com.lupyd.app.MESSAGES"
        
        const val ACTION_ACCEPT_CALL = "com.lupyd.app.ACCEPT_CALL"
        const val ACTION_DECLINE_CALL = "com.lupyd.app.DECLINE_CALL"
        
        const val CALL_NOTIFICATION_ID_BASE = 10000
    }
    
    private val notificationPrefs: SharedPreferences by lazy {
        context.getSharedPreferences("lupyd_notification_messages", Context.MODE_PRIVATE)
    }
    
    override fun load() {
        super.load()
        Log.d(TAG, "NativeNotificationPlugin loaded")
        createNotificationChannels()
    }
    
    /**
     * Initialize FCM and request token
     */
    @PluginMethod
    fun initialize(call: PluginCall) {
        Log.d(TAG, "Initializing FCM...")
        
        try {
            FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                if (!task.isSuccessful) {
                    Log.e(TAG, "Failed to get FCM token", task.exception)
                    call.reject("Failed to get FCM token: ${task.exception?.message}")
                    return@addOnCompleteListener
                }
                
                val token = task.result
                Log.d(TAG, "FCM Token received: $token")
                
                val ret = JSObject()
                ret.put("token", token)
                ret.put("success", true)
                call.resolve(ret)
                
                // Also send as event to JS
                notifyTokenReceived(token)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing FCM", e)
            call.reject("Error initializing FCM: ${e.message}")
        }
    }
    
    /**
     * Show bundled notification
     */
    @PluginMethod
    fun showBundledNotification(call: PluginCall) {
        val sender = call.getString("sender")
        val message = call.getString("message")
        
        if (sender == null || message == null) {
            call.reject("Missing required parameters: sender or message")
            return
        }
        
        Log.d(TAG, "Showing bundled notification from: $sender")
        
        try {
            showBundled(sender, message)
            
            val ret = JSObject()
            ret.put("success", true)
            call.resolve(ret)
        } catch (e: Exception) {
            Log.e(TAG, "Error showing bundled notification", e)
            call.reject("Error: ${e.message}")
        }
    }
    
    /**
     * Show call notification
     */
    @PluginMethod
    fun showCallNotification(call: PluginCall) {
        val caller = call.getString("caller")
        val conversationId = call.getLong("conversationId") ?: 0L
        
        if (caller == null) {
            call.reject("Missing required parameter: caller")
            return
        }
        
        Log.d(TAG, "Showing call notification from: $caller")
        
        try {
            showCall(caller, conversationId)
            
            val ret = JSObject()
            ret.put("success", true)
            call.resolve(ret)
        } catch (e: Exception) {
            Log.e(TAG, "Error showing call notification", e)
            call.reject("Error: ${e.message}")
        }
    }
    
    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            
            // Messages channel
            val messagesChannel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = CHANNEL_DESCRIPTION
                enableVibration(true)
                enableLights(true)
                vibrationPattern = longArrayOf(100, 200, 300, 400, 500, 400, 300, 200, 400)
            }
            
            // Calls channel
            val callsChannel = NotificationChannel(
                CHANNEL_ID_CALL,
                CHANNEL_NAME_CALL,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = CHANNEL_DESCRIPTION_CALL
                enableVibration(true)
                enableLights(true)
                vibrationPattern = longArrayOf(0, 1000, 500, 1000)
                setSound(android.provider.Settings.System.DEFAULT_RINGTONE_URI, null)
            }
            
            notificationManager.createNotificationChannel(messagesChannel)
            notificationManager.createNotificationChannel(callsChannel)
            
            Log.d(TAG, "Notification channels created")
        }
    }
    
    private fun showBundled(sender: String, messageBody: String) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        // Add message to history
        addMessageToHistory(sender, messageBody)
        val messages = getMessagesFromSender(sender)
        val messageCount = messages.size
        
        Log.d(TAG, "Total messages from $sender: $messageCount")
        
        // Create intents
        val contentIntent = Intent(context, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            putExtra("sender", sender)
        }
        
        val contentPendingIntent = PendingIntent.getActivity(
            context, sender.hashCode(), contentIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        
        // Reply action
        val replyIntent = Intent(context, ReplyReceiverNative::class.java).apply {
            putExtra("sender", sender)
        }
        
        val replyPendingIntent = PendingIntent.getBroadcast(
            context, sender.hashCode() + 1, replyIntent,
            PendingIntent.FLAG_MUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        
        val remoteInput = RemoteInput.Builder(KEY_TEXT_REPLY)
            .setLabel("Reply to $sender")
            .build()
        
        val replyAction = NotificationCompat.Action.Builder(
            android.R.drawable.ic_menu_send,
            "Reply",
            replyPendingIntent
        )
            .addRemoteInput(remoteInput)
            .setAllowGeneratedReplies(true)
            .build()
        
        // Build inbox style
        val inboxStyle = NotificationCompat.InboxStyle()
        messages.takeLast(5).forEach { msg ->
            inboxStyle.addLine(msg)
        }
        inboxStyle.setSummaryText(if (messageCount > 1) "$messageCount messages" else "New message")
        inboxStyle.setBigContentTitle(sender)
        
        // Build notification
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(context.applicationInfo.icon)
            .setContentTitle(sender)
            .setContentText(messageBody)
            .setAutoCancel(true)
            .setContentIntent(contentPendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setVibrate(longArrayOf(100, 200, 300, 400, 500, 400, 300, 200, 400))
            .setDefaults(NotificationCompat.DEFAULT_SOUND or NotificationCompat.DEFAULT_VIBRATE)
            .setStyle(inboxStyle)
            .addAction(replyAction)
            .setGroup(GROUP_KEY_MESSAGES)
            .setNumber(messageCount)
            .build()
        
        val notificationId = sender.hashCode()
        notificationManager.notify(notificationId, notification)
        
        Log.d(TAG, "Bundled notification shown for $sender with $messageCount messages")
    }
    
    private fun showCall(caller: String, conversationId: Long) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        // Full-screen intent
        val fullScreenIntent = Intent(context, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            putExtra("type", "call")
            putExtra("caller", caller)
            putExtra("conversationId", conversationId)
        }
        
        val fullScreenPendingIntent = PendingIntent.getActivity(
            context, caller.hashCode(), fullScreenIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        
        // Accept action
        val acceptIntent = Intent(context, CallActionReceiverNative::class.java).apply {
            action = ACTION_ACCEPT_CALL
            putExtra("caller", caller)
            putExtra("conversationId", conversationId)
        }
        
        val acceptPendingIntent = PendingIntent.getBroadcast(
            context, caller.hashCode() + 100, acceptIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        
        // Decline action
        val declineIntent = Intent(context, CallActionReceiverNative::class.java).apply {
            action = ACTION_DECLINE_CALL
            putExtra("caller", caller)
            putExtra("conversationId", conversationId)
        }
        
        val declinePendingIntent = PendingIntent.getBroadcast(
            context, caller.hashCode() + 101, declineIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        
        // Build notification
        val notification = NotificationCompat.Builder(context, CHANNEL_ID_CALL)
            .setSmallIcon(context.applicationInfo.icon)
            .setContentTitle("Incoming call")
            .setContentText("$caller is calling...")
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setFullScreenIntent(fullScreenPendingIntent, true)
            .setAutoCancel(true)
            .setOngoing(true)
            .setVibrate(longArrayOf(0, 1000, 500, 1000))
            .setDefaults(NotificationCompat.DEFAULT_SOUND or NotificationCompat.DEFAULT_VIBRATE)
            .addAction(android.R.drawable.ic_menu_call, "Accept", acceptPendingIntent)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Decline", declinePendingIntent)
            .build()
        
        val notificationId = CALL_NOTIFICATION_ID_BASE + caller.hashCode()
        notificationManager.notify(notificationId, notification)
        
        Log.d(TAG, "Call notification shown for $caller")
    }
    
    private fun addMessageToHistory(sender: String, message: String) {
        try {
            val messagesJson = notificationPrefs.getString(sender, "[]")
            val messagesArray = JSONArray(messagesJson)
            
            val messageObj = JSONObject().apply {
                put("text", message)
                put("timestamp", System.currentTimeMillis())
            }
            messagesArray.put(messageObj)
            
            notificationPrefs.edit().putString(sender, messagesArray.toString()).apply()
        } catch (e: Exception) {
            Log.e(TAG, "Error adding message to history", e)
        }
    }
    
    private fun getMessagesFromSender(sender: String): List<String> {
        return try {
            val messagesJson = notificationPrefs.getString(sender, "[]")
            val messagesArray = JSONArray(messagesJson)
            (0 until messagesArray.length()).map {
                messagesArray.getJSONObject(it).getString("text")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting messages", e)
            emptyList()
        }
    }
    
    private fun notifyTokenReceived(token: String) {
        val ret = JSObject()
        ret.put("token", token)
        notifyListeners("tokenReceived", ret)
    }
}

// Broadcast Receivers
class ReplyReceiverNative : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null || intent == null) return
        
        val sender = intent.getStringExtra("sender") ?: return
        val remoteInput = RemoteInput.getResultsFromIntent(intent)
        val replyText = remoteInput?.getCharSequence(NativeNotificationPlugin.KEY_TEXT_REPLY)
        
        if (replyText != null) {
            Log.d("lupyd-ReplyReceiver", "Reply received for $sender: $replyText")
            // TODO: Send reply through encryption system
            
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            val builder = NotificationCompat.Builder(context, NativeNotificationPlugin.CHANNEL_ID)
                .setSmallIcon(context.applicationInfo.icon)
                .setContentTitle("Reply sent")
                .setContentText("Your reply to $sender has been sent")
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setAutoCancel(true)
            
            notificationManager.notify(sender.hashCode(), builder.build())
        }
    }
}

class CallActionReceiverNative : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null || intent == null) return
        
        val action = intent.action
        val caller = intent.getStringExtra("caller") ?: return
        val conversationId = intent.getLongExtra("conversationId", 0L)
        
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val notificationId = NativeNotificationPlugin.CALL_NOTIFICATION_ID_BASE + caller.hashCode()
        
        when (action) {
            NativeNotificationPlugin.ACTION_ACCEPT_CALL -> {
                Log.d("lupyd-CallReceiver", "Call accepted from $caller")
                notificationManager.cancel(notificationId)
                
                val callIntent = Intent(context, MainActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                    putExtra("type", "call_accepted")
                    putExtra("caller", caller)
                    putExtra("conversationId", conversationId)
                }
                context.startActivity(callIntent)
            }
            NativeNotificationPlugin.ACTION_DECLINE_CALL -> {
                Log.d("lupyd-CallReceiver", "Call declined from $caller")
                notificationManager.cancel(notificationId)
            }
        }
    }
}
