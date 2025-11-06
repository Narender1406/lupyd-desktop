package com.lupyd.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.Typeface
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.RemoteInput
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import firefly.Message
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject

class MyFirebaseMessagingService : FirebaseMessagingService() {
    lateinit var db: AppDatabase
    lateinit var encryptionWrapper: EncryptionWrapper

    @OptIn(DelicateCoroutinesApi::class)
    private val scope = GlobalScope
    
    // SharedPreferences for persisting notification messages
    private val notificationPrefs: SharedPreferences by lazy {
        getSharedPreferences("lupyd_notification_messages", Context.MODE_PRIVATE)
    }

    override fun onCreate() {
        super.onCreate()

        db = getDatabase(this)
        encryptionWrapper = EncryptionWrapper(db, this::handleDecryptedMessage)



    }

    override fun onDestroy() {
//        scope.cancel()
        super.onDestroy()
    }



    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        Log.d(TAG, "=== PUSH NOTIFICATION RECEIVED ===")
        Log.d(TAG, "Received message from: " + remoteMessage.getFrom())
        Log.d(TAG, "Message contains notification: " + (remoteMessage.getNotification() != null))
        Log.d(TAG, "Message contains data: " + (remoteMessage.data.toString()))


        val data = remoteMessage.data

        if (data["ty"] == "umsg") {
            scope.launch {
                try {
                    encryptionWrapper.syncUserMessages()
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to Sync Messages ${e}")
                }

            }
        } else {
            handleNotification(remoteMessage)
        }

//        // Handle notification payload (when app is in foreground)
//        if (remoteMessage.getNotification() != null) {
//            Log.d(
//                TAG,
//                "Processing notification payload: " + remoteMessage.getNotification()!!.getTitle()
//            )
//            val originalTitle = if (remoteMessage.getNotification()!!
//                    .getTitle() != null
//            ) remoteMessage.getNotification()!!.getTitle() else "Notification"
//            val convertedTitle = originalTitle + "+++ (converted)"
//
//            showLocalNotification(
//                convertedTitle,
//                if (remoteMessage.getNotification()!!
//                        .getBody() != null
//                ) remoteMessage.getNotification()!!.getBody() else "You have a new message"
//            )
//        }
//
//
//        // Handle data payload (works in all app states: foreground, background, closed)
//        if (remoteMessage.getData().size > 0) {
//            Log.d(TAG, "Processing data payload: " + remoteMessage.getData())
//
//
//            // Extract title and body from data
//            val title = remoteMessage.getData().get("title")
//            val body = remoteMessage.getData().get("body")
//            val message = remoteMessage.getData().get("message")
//
//
//            // Convert to local notification
//            val originalTitle = if (title != null) title else "Notification"
//            val convertedTitle = originalTitle + "+++ (converted)"
//
//            showLocalNotification(
//                convertedTitle,
//                if (body != null) body else (if (message != null) message else "You have a new message")
//            )
//        }
//
//        Log.d(TAG, "=== PUSH NOTIFICATION PROCESSED ===")
    }

    private fun handleNotification(remoteMessage: RemoteMessage) {
        val notification = remoteMessage.notification
        if (null == notification) {
            return
        }

        val title = notification.title
        val body = notification.body

        showBundledNotification(title ?: "Received a Notification", body ?: "")
    }

    fun handleDecryptedMessage(msg: DMessage) {

        val inner = Message.UserMessageInner.parseFrom(msg.text)

        var body = ""
        var isCallMessage = false

        if (inner.messagePayload.text.isNotEmpty()) {
            body = inner.messagePayload.text
        } else if (!inner.callMessage.message.isEmpty) {
            Log.d(TAG, "=== CALL RECEIVED === from: ${msg.mfrom}")
            isCallMessage = true
            body = "Incoming call"
        }

        if (isCallMessage) {
            showCallNotification(msg.mfrom, msg.conversationId)
        } else {
            showBundledNotification(msg.mfrom, body)
        }
    }

    override fun onNewToken(token: String) {
        sendRegistrationToServer(token)
    }

    override fun onDeletedMessages() {
        Log.d(TAG, "=== MESSAGES DELETED ===")
        super.onDeletedMessages()
    }

    override fun onMessageSent(msgId: String) {
        Log.d(TAG, "=== MESSAGE SENT ===")
        Log.d(TAG, "Message sent: " + msgId)
        super.onMessageSent(msgId)
    }

    override fun onSendError(msgId: String, exception: Exception) {
        Log.e(TAG, "=== SEND ERROR ===")
        Log.e(TAG, "Message send error for " + msgId, exception)
        super.onSendError(msgId, exception)
    }

    private fun createNotificationChannel() {
        Log.d(TAG, "Creating notification channel...")
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Log.d(TAG, "Android O+ detected, creating channel")
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            )
            channel.setDescription(CHANNEL_DESCRIPTION)
            channel.enableVibration(true)
            channel.enableLights(true)
            channel.setVibrationPattern(longArrayOf(100, 200, 300, 400, 500, 400, 300, 200, 400))


            // Register the channel with the system
            val notificationManager =
                getSystemService<NotificationManager?>(NotificationManager::class.java)
            if (notificationManager != null) {
                Log.d(TAG, "Notification manager obtained, creating channel")
                notificationManager.createNotificationChannel(channel)
                Log.d(TAG, "Notification channel created successfully")
            } else {
                Log.e(TAG, "Failed to create notification channel: notificationManager is null")
            }
        } else {
            Log.d(TAG, "Android version < O, no channel needed")
        }
    }
    
    private fun createCallNotificationChannel() {
        Log.d(TAG, "Creating call notification channel...")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID_CALL,
                CHANNEL_NAME_CALL,
                NotificationManager.IMPORTANCE_HIGH
            )
            channel.setDescription(CHANNEL_DESCRIPTION_CALL)
            channel.enableVibration(true)
            channel.enableLights(true)
            channel.setVibrationPattern(longArrayOf(0, 1000, 500, 1000))
            channel.setSound(android.provider.Settings.System.DEFAULT_RINGTONE_URI, null)
            
            val notificationManager =
                getSystemService<NotificationManager?>(NotificationManager::class.java)
            notificationManager?.createNotificationChannel(channel)
            Log.d(TAG, "Call notification channel created successfully")
        }
    }

    /**
     * Create a profile bitmap with the first letter of the sender name
     * This creates a circular bitmap with a colored background and the first letter centered
     * Plus adds the app icon as an overlay at the bottom right
     */
    private fun createProfileBitmap(sender: String, size: Int): Bitmap {
        // Create a bitmap with the specified size
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        
        // Create paint for background circle
        val paint = Paint().apply {
            isAntiAlias = true
            style = Paint.Style.FILL
            color = 0xFF4CAF50.toInt() // Green color similar to WhatsApp
        }
        
        // Draw background circle
        val radius = size / 2f
        canvas.drawCircle(radius, radius, radius, paint)
        
        // Draw the first letter
        if (sender.isNotEmpty()) {
            val firstLetter = sender.substring(0, 1).uppercase()
            
            val textPaint = Paint().apply {
                isAntiAlias = true
                color = 0xFFFFFFFF.toInt() // White text
                textSize = size * 0.6f // Larger text
                textAlign = Paint.Align.CENTER
                typeface = Typeface.DEFAULT_BOLD
            }
            
            // Measure text to center it
            val textBounds = Rect()
            textPaint.getTextBounds(firstLetter, 0, firstLetter.length, textBounds)
            
            // Draw centered text
            val x = size / 2f
            val y = (size / 2f) - (textBounds.exactCenterY())
            
            canvas.drawText(firstLetter, x, y, textPaint)
        }
        
        return bitmap
    }
    
    /**
     * Show bundled notification - groups messages by sender
     * Using 'body' (sender name) as the grouping key temporarily (will change to username later)
     */
    private fun showBundledNotification(sender: String, messageBody: String) {
        try {
            createNotificationChannel()
            
            val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager?
            if (notificationManager == null) {
                Log.e(TAG, "Failed to show notification: notificationManager is null")
                return
            }
            
            Log.d(TAG, "Showing bundled notification from: $sender")
            
            // Add message to persistent storage
            addMessageToHistory(sender, messageBody)
            
            // Get all messages from this sender
            val messages = getMessagesFromSender(sender)
            val messageCount = messages.size
            
            Log.d(TAG, "Total messages from $sender: $messageCount")
            
            // Create main intent
            val intent = Intent(this, MainActivity::class.java)
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            intent.putExtra("sender", sender)
            
            val pendingIntent = PendingIntent.getActivity(
                this, sender.hashCode(), intent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )
            
            // Create reply action
            val replyIntent = Intent(this, ReplyReceiver::class.java)
            replyIntent.putExtra("sender", sender)
            val replyPendingIntent = PendingIntent.getBroadcast(
                this,
                sender.hashCode() + 1,
                replyIntent,
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
            

             //Reply reciever
             
            // Build notification with InboxStyle to show ALL messages
            val inboxStyle = NotificationCompat.InboxStyle()
            
            // Add ALL messages to inbox style when expanded
            messages.forEach { msg ->
                inboxStyle.addLine(msg)
            }
            
            // No summary text - just show sender name
            inboxStyle.setBigContentTitle(sender)
            
            // Check for URLs in the latest message
            var deepLinkAction: NotificationCompat.Action? = null
            val urlPattern = "(https?://[^\\s]+)".toRegex()
            val urlMatch = urlPattern.find(messageBody)
            
            if (urlMatch != null) {
                val url = urlMatch.value
                Log.d(TAG, "URL detected in message: $url")
                
                // Create deep link intent
                val deepLinkIntent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url))
                val deepLinkPendingIntent = PendingIntent.getActivity(
                    this, sender.hashCode() + 3, deepLinkIntent,
                    PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
                )
                
                deepLinkAction = NotificationCompat.Action.Builder(
                    android.R.drawable.ic_menu_share,
                    "Open Link",
                    deepLinkPendingIntent
                ).build()
            }
            
            // Create large profile icon with letter
            val profileIconSize = resources.getDimensionPixelSize(android.R.dimen.notification_large_icon_width)
            val profileBitmap = createProfileBitmap(sender, profileIconSize)
            
            val notificationBuilder = NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(resources.getIdentifier("flower_notification_icon", "drawable", packageName))
                .setLargeIcon(profileBitmap) // Set the profile picture with letter
                .setColor(0xFF000000.toInt()) // Black background
                .setContentTitle(sender)  // Just the sender name (no prefix)
                .setContentText(messageBody)  // Latest message preview
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setVibrate(longArrayOf(100, 200, 300, 400, 500, 400, 300, 200, 400))
                .setDefaults(NotificationCompat.DEFAULT_SOUND or NotificationCompat.DEFAULT_VIBRATE)
                .setStyle(inboxStyle)  // Shows ALL messages when expanded
                .addAction(replyAction)
                .setGroup(GROUP_KEY_MESSAGES)
                .setOnlyAlertOnce(false)  // Alert for each new message
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)  // Ensure content is visible
                .setCategory(NotificationCompat.CATEGORY_MESSAGE)
                .setShowWhen(true)
            
            // Add deep link action if URL detected
            if (deepLinkAction != null) {
                notificationBuilder.addAction(deepLinkAction)
            }
            
            // Use sender's hashCode as notification ID to update the same notification
            val notificationId = sender.hashCode()
            Log.d(TAG, "Showing bundled notification with ID: $notificationId")
            notificationManager.notify(notificationId, notificationBuilder.build())
            Log.d(TAG, "Bundled notification shown for $sender with $messageCount messages")
        } catch (e: Exception) {
            Log.e(TAG, "Error showing bundled notification", e)
        }
    }
    
    /**
     * Show call notification with full-screen intent
     */
    private fun showCallNotification(caller: String, conversationId: Long) {
        try {
            createCallNotificationChannel()
            
            val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager?
            if (notificationManager == null) {
                Log.e(TAG, "Failed to show call notification: notificationManager is null")
                return
            }
            
            Log.d(TAG, "Showing call notification from: $caller")
            
            // Create full-screen intent
            val fullScreenIntent = Intent(this, MainActivity::class.java)
            fullScreenIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            fullScreenIntent.putExtra("type", "call")
            fullScreenIntent.putExtra("caller", caller)
            fullScreenIntent.putExtra("conversationId", conversationId)
            
            val fullScreenPendingIntent = PendingIntent.getActivity(
                this,
                caller.hashCode(),
                fullScreenIntent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )
            
            // Create Accept action
            val acceptIntent = Intent(this, CallActionReceiver::class.java)
            acceptIntent.action = ACTION_ACCEPT_CALL
            acceptIntent.putExtra("caller", caller)
            acceptIntent.putExtra("conversationId", conversationId)
            
            val acceptPendingIntent = PendingIntent.getBroadcast(
                this,
                caller.hashCode() + 100,
                acceptIntent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )
            
            // Create Decline action
            val declineIntent = Intent(this, CallActionReceiver::class.java)
            declineIntent.action = ACTION_DECLINE_CALL
            declineIntent.putExtra("caller", caller)
            declineIntent.putExtra("conversationId", conversationId)
            
            val declinePendingIntent = PendingIntent.getBroadcast(
                this,
                caller.hashCode() + 101,
                declineIntent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )
            
            val notificationBuilder = NotificationCompat.Builder(this, CHANNEL_ID_CALL)
                .setSmallIcon(resources.getIdentifier("flower_notification_icon", "drawable", packageName))
                .setColor(0xFF000000.toInt()) // Black background
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
            
            val notificationId = CALL_NOTIFICATION_ID_BASE + caller.hashCode()
            Log.d(TAG, "Showing call notification with ID: $notificationId")
            notificationManager.notify(notificationId, notificationBuilder.build())
            Log.d(TAG, "Call notification shown for $caller")
        } catch (e: Exception) {
            Log.e(TAG, "Error showing call notification", e)
        }
    }
    
    /**
     * Add message to persistent history using SharedPreferences
     */
    private fun addMessageToHistory(sender: String, message: String) {
        try {
            val messagesJson = notificationPrefs.getString(sender, "[]")
            val messagesArray = JSONArray(messagesJson)
            
            // Add new message with timestamp
            val messageObj = JSONObject()
            messageObj.put("text", message)
            messageObj.put("timestamp", System.currentTimeMillis())
            messagesArray.put(messageObj)
            
            // Save back to preferences
            notificationPrefs.edit().putString(sender, messagesArray.toString()).apply()
            
            Log.d(TAG, "Message added to history for $sender. Total: ${messagesArray.length()}")
        } catch (e: Exception) {
            Log.e(TAG, "Error adding message to history", e)
        }
    }
    
    /**
     * Get all messages from a specific sender
     */
    private fun getMessagesFromSender(sender: String): List<String> {
        try {
            val messagesJson = notificationPrefs.getString(sender, "[]")
            val messagesArray = JSONArray(messagesJson)
            val messagesList = mutableListOf<String>()
            
            for (i in 0 until messagesArray.length()) {
                val messageObj = messagesArray.getJSONObject(i)
                messagesList.add(messageObj.getString("text"))
            }
            
            return messagesList
        } catch (e: Exception) {
            Log.e(TAG, "Error getting messages from sender", e)
            return emptyList()
        }
    }
    
    /**
     * Clear message history for a sender
     */
    private fun clearMessageHistory(sender: String) {
        try {
            notificationPrefs.edit().remove(sender).apply()
            Log.d(TAG, "Message history cleared for $sender")
        } catch (e: Exception) {
            Log.e(TAG, "Error clearing message history", e)
        }
    }

    private val notificationIcon: Int
        get() {
            // Try to use the app's launcher icon
            val icon = getApplicationInfo().icon
            Log.d(
                TAG,
                "Using notification icon: " + icon
            )
            return icon
        }

    private fun sendRegistrationToServer(token: String) {
        // Implement this method to send token to your app server
        Log.d(TAG, "Sending token to server: " + token)



        scope.launch {
            try {
                db.keyValueDao().put(KeyValueEntry("fcmToken", token))
                encryptionWrapper.sendFcmTokenToServer()
            } catch (e: Exception) {
                Log.e(TAG, "Failed to send fcm token to server ${e}")
            }
        }
        
    }

    companion object {
        const val TAG = "lupyd-FCM"
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
}

/**
 * BroadcastReceiver to handle inline reply actions
 */
class ReplyReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null || intent == null) return
        
        try {
            val sender = intent.getStringExtra("sender") ?: return
            val remoteInput = RemoteInput.getResultsFromIntent(intent)
            val replyText = remoteInput?.getCharSequence(KEY_TEXT_REPLY)
            
            if (replyText != null) {
                Log.d(TAG, "Reply received for $sender: $replyText")
                
                // TODO: Send the reply message through the encryption system
                // This will require access to the database and encryption wrapper
                // For now, we'll just log it
                
                // Add reply to message history using shared preferences directly
                val prefs = context.getSharedPreferences("lupyd_notification_messages", Context.MODE_PRIVATE)
                try {
                    val messagesJson = prefs.getString(sender, "[]")
                    val messagesArray = JSONArray(messagesJson)
                    
                    val messageObj = JSONObject().apply {
                        put("text", "You: $replyText")
                        put("timestamp", System.currentTimeMillis())
                    }
                    messagesArray.put(messageObj)
                    
                    prefs.edit().putString(sender, messagesArray.toString()).apply()
                } catch (e: Exception) {
                    Log.e(TAG, "Error adding reply to history", e)
                }
                
                // Update notification to show reply but keep it visible with reply action
                val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                
                // Get updated messages
                val messages = try {
                    val messagesJson = prefs.getString(sender, "[]")
                    val messagesArray = JSONArray(messagesJson)
                    (0 until messagesArray.length()).map {
                        messagesArray.getJSONObject(it).getString("text")
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error getting messages", e)
                    emptyList<String>()
                }
                
                // Create updated inbox style
                val inboxStyle = NotificationCompat.InboxStyle()
                messages.forEach { msg ->
                    inboxStyle.addLine(msg)
                }
                inboxStyle.setBigContentTitle(sender)
                
                // Create content intent
                val contentIntent = Intent(context, MainActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
                    putExtra("sender", sender)
                }
                
                val contentPendingIntent = PendingIntent.getActivity(
                    context, sender.hashCode(), contentIntent,
                    PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
                )
                
                // Create reply action (keep it available)
                val replyIntent = Intent(context, ReplyReceiver::class.java).apply {
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
                
                // Build updated notification with reply action still available
                val builder = NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(context.resources.getIdentifier("flower_notification_icon", "drawable", context.packageName))
                    .setColor(0xFF000000.toInt()) // Black background
                    .setContentTitle(sender)
                    .setContentText("You: $replyText")
                    .setAutoCancel(false) // Keep notification visible
                    .setContentIntent(contentPendingIntent)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setStyle(inboxStyle)
                    .addAction(replyAction) // Keep reply action
                    .setGroup(CHANNEL_ID)
                    .setOnlyAlertOnce(true) // Don't alert again
                
                notificationManager.notify(sender.hashCode(), builder.build())
                
                Log.d(TAG, "Reply notification updated for $sender")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error handling reply", e)
        }
    }
    
    companion object {
        private const val TAG = "lupyd-FCM"
        private const val KEY_TEXT_REPLY = "key_text_reply"
        private const val CHANNEL_ID = "lupyd_notifications"
    }
}

/**
 * BroadcastReceiver to handle call action buttons (Accept/Decline)
 */
class CallActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null || intent == null) return
        
        try {
            val action = intent.action
            val caller = intent.getStringExtra("caller") ?: return
            val conversationId = intent.getLongExtra("conversationId", 0L)
            
            Log.d(TAG, "Call action received: $action from $caller")
            
            when (action) {
                ACTION_ACCEPT_CALL -> {
                    Log.d(TAG, "Call accepted from $caller")
                    // TODO: Implement call acceptance logic
                    // This would typically open the call UI and establish the connection
                    
                    // For now, just dismiss the notification
                    val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                    val notificationId = CALL_NOTIFICATION_ID_BASE + caller.hashCode()
                    notificationManager.cancel(notificationId)
                    
                    // Show a toast or start the call activity
                    val callIntent = Intent(context, MainActivity::class.java)
                    callIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                    callIntent.putExtra("type", "call_accepted")
                    callIntent.putExtra("caller", caller)
                    callIntent.putExtra("conversationId", conversationId)
                    context.startActivity(callIntent)
                }
                ACTION_DECLINE_CALL -> {
                    Log.d(TAG, "Call declined from $caller")
                    // TODO: Implement call decline logic
                    // This would send a decline message to the caller
                    
                    // Dismiss the notification
                    val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                    val notificationId = CALL_NOTIFICATION_ID_BASE + caller.hashCode()
                    notificationManager.cancel(notificationId)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error handling call action", e)
        }
    }
    
    companion object {
        private const val TAG = "lupyd-FCM"
        private const val ACTION_ACCEPT_CALL = "com.lupyd.app.ACCEPT_CALL"
        private const val ACTION_DECLINE_CALL = "com.lupyd.app.DECLINE_CALL"
        private const val CALL_NOTIFICATION_ID_BASE = 10000
    }
}
