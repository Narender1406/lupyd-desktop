package com.lupyd.app


import android.app.NotificationManager

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.RemoteInput
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import firefly.Message
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import org.json.JSONObject
import androidx.core.net.toUri
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.ProcessLifecycleOwner
import com.google.protobuf.ByteString
import uniffi.firefly_signal.UserMessage


class MyFirebaseMessagingService : FirebaseMessagingService() {
    lateinit var db: AppDatabase


    lateinit var notificationHandler: NotificationHandler

    lateinit var fireflyClient: FireflyClient

    @OptIn(DelicateCoroutinesApi::class)
    private val scope = GlobalScope



    override fun onCreate() {
        super.onCreate()

        db = getDatabase(this)

        notificationHandler = NotificationHandler(this)
        fireflyClient = FireflyClient.getInstance(this)

        fireflyClient.addOnMessageCallback (this::handleDecryptedMessage)

    }

    override fun onDestroy() {

        super.onDestroy()
        fireflyClient.removeOnMessageCallback (this::handleDecryptedMessage)
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
                    fireflyClient.initialize(this@MyFirebaseMessagingService)
//                    fireflyClient.handleMessage(data)
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to Sync Messages ${e}")
                }

            }
        } else {
            handleNotification(remoteMessage)
        }

    }

    private fun handleNotification(remoteMessage: RemoteMessage) {
        val notification = remoteMessage.notification
        if (null == notification) {
            return
        }

        val title = notification.title
        val body = notification.body

        showLocalNotification(title ?: "Received a Notification", body ?: "")
    }

    private fun showLocalNotification(title: String, body: String) {}

    fun handleDecryptedMessage(msg: UserMessage) {

        Log.i(TAG, "Showing decrypted message notification ${msg}");

        val inner = Message.UserMessageInner.parseFrom(msg.message)

        if (inner.hasMessagePayload() && msg.sentByOther) {
            val isForeground = ProcessLifecycleOwner.get().lifecycle.currentState.isAtLeast(
                Lifecycle.State.STARTED)

            if (!isForeground) {
                Log.i(TAG, "Showing decrypted message notification ${inner.toString()}");
                notificationHandler.showUserBundledNotification(msg)
            }

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

//    private fun createNotificationChannel() {
//        Log.d(TAG, "Creating notification channel...")
//        // Create the NotificationChannel, but only on API 26+ because
//        // the NotificationChannel class is new and not in the support library
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
//            Log.d(TAG, "Android O+ detected, creating channel")
//            val channel = NotificationChannel(
//                CHANNEL_ID,
//                CHANNEL_NAME,
//                NotificationManager.IMPORTANCE_HIGH
//            )
//            channel.setDescription(CHANNEL_DESCRIPTION)
//            channel.enableVibration(true)
//            channel.enableLights(true)
//            channel.setVibrationPattern(longArrayOf(100, 200, 300, 400, 500, 400, 300, 200, 400))
//
//
//            // Register the channel with the system
//            val notificationManager =
//                getSystemService<NotificationManager?>(NotificationManager::class.java)
//            if (notificationManager != null) {
//                Log.d(TAG, "Notification manager obtained, creating channel")
//                notificationManager.createNotificationChannel(channel)
//                Log.d(TAG, "Notification channel created successfully")
//            } else {
//                Log.e(TAG, "Failed to create notification channel: notificationManager is null")
//            }
//        } else {
//            Log.d(TAG, "Android version < O, no channel needed")
//        }
//    }
//
//    private fun createCallNotificationChannel() {
//        Log.d(TAG, "Creating call notification channel...")
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
//            val channel = NotificationChannel(
//                CHANNEL_ID_CALL,
//                CHANNEL_NAME_CALL,
//                NotificationManager.IMPORTANCE_HIGH
//            )
//            channel.setDescription(CHANNEL_DESCRIPTION_CALL)
//            channel.enableVibration(true)
//            channel.enableLights(true)
//            channel.setVibrationPattern(longArrayOf(0, 1000, 500, 1000))
//            channel.setSound(android.provider.Settings.System.DEFAULT_RINGTONE_URI, null)
//
//            val notificationManager =
//                getSystemService<NotificationManager?>(NotificationManager::class.java)
//            notificationManager?.createNotificationChannel(channel)
//            Log.d(TAG, "Call notification channel created successfully")
//        }
//    }

    /**
     * Create a profile bitmap with the first letter of the sender name
     * This creates a circular bitmap with a colored background and the first letter centered
     * Plus adds the app icon as an overlay at the bottom right
     */



//
//    private fun showUserBundledNotification(msg: DMessage, me: String) {
//
//        val other = if (msg.mfrom == me) msg.mto else msg.mfrom
//        try {
//            createNotificationChannel()
//
//            val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager?
//            if (notificationManager == null) {
//                Log.e(TAG, "Failed to show notification: notificationManager is null")
//                return
//            }
//
//            Log.d(TAG, "Showing bundled notification from: $other")
//
//            // Add message to persistent storage
//            addMessageToHistory(msg, me)
//
//            // Get all messages from this sender
//            val messages =  runBlocking {
//                db.userMessageNotificationsDao().getFromUser(other, 6)
//            }
//            val messageCount = messages.size
//
//            Log.d(TAG, "Total messages from $other: $messageCount")
//
//            // Create main intent
//
//            val deepLinkUrl = "lupyd://m.lupyd.com/messages/${other}".toUri()
//            val onClickIntent = Intent(Intent.ACTION_VIEW, deepLinkUrl).apply {
//                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
//            }
//
//            val pendingIntent = PendingIntent.getActivity(this, 0, onClickIntent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
//
//
//            // Create reply action
//            val replyIntent = Intent(this, ReplyReceiver::class.java)
//            replyIntent.putExtra("sender", other)
//            replyIntent.putExtra("conversationId", msg.conversationId)
//            val replyPendingIntent = PendingIntent.getBroadcast(
//                this,
//                other.hashCode() + 1,
//                replyIntent,
//                PendingIntent.FLAG_MUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
//            )
//
//            val remoteInput = RemoteInput.Builder(KEY_TEXT_REPLY)
//                .setLabel("Reply to $other")
//                .build()
//
//            val replyAction = NotificationCompat.Action.Builder(
//                android.R.drawable.ic_menu_send,
//                "Reply",
//                replyPendingIntent
//            )
//                .addRemoteInput(remoteInput)
//                .setAllowGeneratedReplies(true)
//                .build()
//
//            // Mark as Read action
//            val markAsReadIntent = Intent(this, MarkAsReadReceiver::class.java).apply {
//                putExtra("sender", other)
//                putExtra("msgId", msg.msgId)
//            }
//
//            val markAsReadPendingIntent = PendingIntent.getBroadcast(
//                this, other.hashCode() + 2, markAsReadIntent,
//                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
//            )
//
//            val markAsReadAction = NotificationCompat.Action.Builder(
//                android.R.drawable.ic_menu_view,
//                "Mark as Read",
//                markAsReadPendingIntent
//            ).build()
//
//            // Build notification with InboxStyle to show ALL messages
//            val inboxStyle = NotificationCompat.InboxStyle()
//
//            // Add ALL messages to inbox style when expanded
//            messages.forEach { msg ->
//                val text = Message.UserMessageInner.parseFrom(msg.text).messagePayload.text
//                inboxStyle.addLine(text)
//            }
//
//            val messageBody = Message.UserMessageInner.parseFrom(msg.text).messagePayload.text
//
//            // No summary text - just show sender name
//            inboxStyle.setBigContentTitle(other)
//
//            // Check for URLs in the latest message
//            var deepLinkAction: NotificationCompat.Action? = null
//            val urlPattern = "(https?://[^\\s]+)".toRegex()
//            val urlMatch = urlPattern.find(messageBody)
//
//            if (urlMatch != null) {
//                val url = urlMatch.value
//                Log.d(TAG, "URL detected in message: $url")
//
//                // Create deep link intent
//                val deepLinkIntent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url))
//                val deepLinkPendingIntent = PendingIntent.getActivity(
//                    this, other.hashCode() + 3, deepLinkIntent,
//                    PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
//                )
//
//                deepLinkAction = NotificationCompat.Action.Builder(
//                    android.R.drawable.ic_menu_share,
//                    "Open Link",
//                    deepLinkPendingIntent
//                ).build()
//            }
//
//            // Create large profile icon with letter
//            val profileIconSize = resources.getDimensionPixelSize(android.R.dimen.notification_large_icon_width)
//            val profileBitmap = createProfileBitmap(other, profileIconSize)
//
////            GlobalScope.launch {
////                val response = httpClient.get("${Constants.CDN_URL}/users/${other}")
////                if (!response.status.isSuccess()) {
////                    return@launch
////                }
////
////                val bitmap = BitmapFactory.decodeStream(response.bodyAsChannel().toInputStream())
////
////                // TODO: notify notification with loaded image
////            }
//
//            val notificationBuilder = NotificationCompat.Builder(this, CHANNEL_ID)
//                .setSmallIcon(resources.getIdentifier("flower_notification_icon", "drawable", packageName))
//                .setLargeIcon(profileBitmap) // Set the profile picture with letter
//                .setColor(0xFF000000.toInt()) // Black background
//                .setContentTitle(other)  // Just the sender name (no prefix)
//                .setContentText(messageBody)  // Latest message preview
//                .setAutoCancel(true)
//                .setContentIntent(pendingIntent)
//                .setPriority(NotificationCompat.PRIORITY_HIGH)
//                .setVibrate(longArrayOf(100, 200, 300, 400, 500, 400, 300, 200, 400))
//                .setDefaults(NotificationCompat.DEFAULT_SOUND or NotificationCompat.DEFAULT_VIBRATE)
//                .setStyle(inboxStyle)  // Shows ALL messages when expanded
//                .addAction(replyAction)
//                .addAction(markAsReadAction)
//                .setGroup(GROUP_KEY_MESSAGES)
//                .setOnlyAlertOnce(false)  // Alert for each new message
//                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)  // Ensure content is visible
//                .setCategory(NotificationCompat.CATEGORY_MESSAGE)
//                .setShowWhen(true)
//
//            // Add deep link action if URL detected
//            if (deepLinkAction != null) {
//                notificationBuilder.addAction(deepLinkAction)
//            }
//
//            // Use sender's hashCode as notification ID to update the same notification
//            val notificationId = other.hashCode()
//            Log.d(TAG, "Showing bundled notification with ID: $notificationId")
//            notificationManager.notify(notificationId, notificationBuilder.build())
//            Log.d(TAG, "Bundled notification shown for $other with $messageCount messages")
//        } catch (e: Exception) {
//            Log.e(TAG, "Error showing bundled notification", e)
//        }
//    }
//
//
//    /**
//     * Show call notification with full-screen intent
//     */
//    private fun showCallNotification(caller: String, conversationId: Long, sessionId: Long) {
//        try {
//            createCallNotificationChannel()
//
//            val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager?
//            if (notificationManager == null) {
//                Log.e(TAG, "Failed to show call notification: notificationManager is null")
//                return
//            }
//
//            Log.d(TAG, "Showing call notification from: $caller")
//
//            // Create full-screen intent
//            val fullScreenIntent = Intent(this, MainActivity::class.java)
//            fullScreenIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
//            fullScreenIntent.putExtra("type", "call")
//            fullScreenIntent.putExtra("caller", caller)
//            fullScreenIntent.putExtra("conversationId", conversationId)
//            fullScreenIntent.putExtra("sessionId", sessionId)
//
//            val fullScreenPendingIntent = PendingIntent.getActivity(
//                this,
//                caller.hashCode(),
//                fullScreenIntent,
//                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
//            )
//
//
//            val deepLinkUrl = "lupyd://m.lupyd.com/messages/${caller}/call?sessionId=${sessionId}&convoId=${conversationId}&accepted=true".toUri()
//            val onClickIntent = Intent(Intent.ACTION_VIEW, deepLinkUrl).apply {
//                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
//            }
//
//            val acceptPendingIntent = PendingIntent.getActivity(this, 0, onClickIntent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
//
//
//            // Create Decline action
//            val declineIntent = Intent(this, CallActionReceiver::class.java)
//            declineIntent.action = ACTION_DECLINE_CALL
//            declineIntent.putExtra("caller", caller)
//            declineIntent.putExtra("conversationId", conversationId)
//            declineIntent.putExtra("sessionId", sessionId)
//
//            val declinePendingIntent = PendingIntent.getBroadcast(
//                this,
//                caller.hashCode() + 101,
//                declineIntent,
//                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
//            )
//
//            val notificationBuilder = NotificationCompat.Builder(this, CHANNEL_ID_CALL)
//                .setSmallIcon(resources.getIdentifier("flower_notification_icon", "drawable", packageName))
//                .setColor(0xFF000000.toInt()) // Black background
//                .setContentTitle("Incoming call")
//                .setContentText("$caller is calling...")
//                .setPriority(NotificationCompat.PRIORITY_MAX)
//                .setCategory(NotificationCompat.CATEGORY_CALL)
//                .setFullScreenIntent(fullScreenPendingIntent, true)
//                .setAutoCancel(true)
//                .setOngoing(true)
//                .setVibrate(longArrayOf(0, 1000, 500, 1000))
//                .setDefaults(NotificationCompat.DEFAULT_SOUND or NotificationCompat.DEFAULT_VIBRATE)
//                .addAction(android.R.drawable.ic_menu_call, "Accept", acceptPendingIntent)
//                .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Decline", declinePendingIntent)
//
//            val notificationId = CALL_NOTIFICATION_ID_BASE + caller.hashCode()
//            Log.d(TAG, "Showing call notification with ID: $notificationId")
//            notificationManager.notify(notificationId, notificationBuilder.build())
//            Log.d(TAG, "Call notification shown for $caller")
//        } catch (e: Exception) {
//            Log.e(TAG, "Error showing call notification", e)
//        }
//    }
//
//    /**
//     * Add message to persistent history using SharedPreferences
//     */
//    private fun addMessageToHistory(msg: DMessage, me: String) {
//        try {
//            runBlocking {
//                db.userMessageNotificationsDao().put(
//                    DMessageNotification(msg.msgId, msg.conversationId, msg.mfrom, msg.mto, msg.text, msg.mfrom == me)
//                )
//            }
//        } catch (e: Exception) {
//            Log.e(TAG, "Error adding message to history", e)
//        }
//    }
//

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
                fireflyClient.initialize(this@MyFirebaseMessagingService)
                fireflyClient.sendFcmTokenToServer(token)
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

//suspend fun buildUserNotification(ctx: Context, other: String): Notification {
//    val profileIconSize = ctx.resources.getDimensionPixelSize(android.R.dimen.notification_large_icon_width)
//
//    val profileBitmap = createProfileBitmap(other, profileIconSize)
//
//    val db = getDatabase(ctx)
//    val messages =
//        db.userMessageNotificationsDao().getFromUser(other, 6)
//
//    val messageCount = messages.size
//
//    val lastMessage = messages.last()
//
//    Log.d(MyFirebaseMessagingService.Companion.TAG, "Total messages from $other: $messageCount")
//
//    // Create main intent
//
//    val deepLinkUrl = "lupyd://m.lupyd.com/messages/${other}".toUri()
//    val onClickIntent = Intent(Intent.ACTION_VIEW, deepLinkUrl).apply {
//        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
//    }
//
//    val pendingIntent = PendingIntent.getActivity(ctx, 0, onClickIntent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
//
//
//    // Create reply action
//    val replyIntent = Intent(ctx, ReplyReceiver::class.java)
//    replyIntent.putExtra("sender", other)
//    replyIntent.putExtra("conversationId", lastMessage.conversationId)
//    val replyPendingIntent = PendingIntent.getBroadcast(
//        ctx,
//        other.hashCode() + 1,
//        replyIntent,
//        PendingIntent.FLAG_MUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
//    )
//
//    val remoteInput = RemoteInput.Builder(KEY_TEXT_REPLY)
//        .setLabel("Reply to $other")
//        .build()
//
//    val replyAction = NotificationCompat.Action.Builder(
//        android.R.drawable.ic_menu_send,
//        "Reply",
//        replyPendingIntent
//    )
//        .addRemoteInput(remoteInput)
//        .setAllowGeneratedReplies(true)
//        .build()
//
//    // Mark as Read action
//    val markAsReadIntent = Intent(ctx, MarkAsReadReceiver::class.java).apply {
//        putExtra("sender", other)
//        putExtra("msgId", lastMessage.msgId)
//    }
//
//    val markAsReadPendingIntent = PendingIntent.getBroadcast(
//        ctx, other.hashCode() + 2, markAsReadIntent,
//        PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
//    )
//
//    val markAsReadAction = NotificationCompat.Action.Builder(
//        android.R.drawable.ic_menu_view,
//        "Mark as Read",
//        markAsReadPendingIntent
//    ).build()
//
//    // Build notification with InboxStyle to show ALL messages
//    val inboxStyle = NotificationCompat.InboxStyle()
//
//    // Add ALL messages to inbox style when expanded
//    messages.forEach { msg ->
//        val text = Message.UserMessageInner.parseFrom(msg.text).messagePayload.text
//        inboxStyle.addLine(text)
//    }
//
//    val messageBody = Message.UserMessageInner.parseFrom(lastMessage.text).messagePayload.text
//
//    // No summary text - just show sender name
//    inboxStyle.setBigContentTitle(other)
//
//    // Check for URLs in the latest message
//    var deepLinkAction: NotificationCompat.Action? = null
//    val urlPattern = "(https?://[^\\s]+)".toRegex()
//    val urlMatch = urlPattern.find(messageBody)
//
//    if (urlMatch != null) {
//        val url = urlMatch.value
//        Log.d(MyFirebaseMessagingService.Companion.TAG, "URL detected in message: $url")
//
//        // Create deep link intent
//        val deepLinkIntent = Intent(Intent.ACTION_VIEW, url.toUri())
//        val deepLinkPendingIntent = PendingIntent.getActivity(
//            ctx, other.hashCode() + 3, deepLinkIntent,
//            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
//        )
//
//        deepLinkAction = NotificationCompat.Action.Builder(
//            android.R.drawable.ic_menu_share,
//            "Open Link",
//            deepLinkPendingIntent
//        ).build()
//    }
//
//
//
//    val notificationBuilder = NotificationCompat.Builder(ctx, CHANNEL_ID)
//        .setSmallIcon(ctx.resources.getIdentifier("flower_notification_icon", "drawable", ctx.packageName))
//        .setLargeIcon(profileBitmap) // Set the profile picture with letter
//        .setColor(0xFF000000.toInt()) // Black background
//        .setContentTitle(other)  // Just the sender name (no prefix)
//        .setContentText(messageBody)  // Latest message preview
//        .setAutoCancel(true)
//        .setContentIntent(pendingIntent)
//        .setPriority(NotificationCompat.PRIORITY_HIGH)
//        .setVibrate(longArrayOf(100, 200, 300, 400, 500, 400, 300, 200, 400))
//        .setDefaults(NotificationCompat.DEFAULT_SOUND or NotificationCompat.DEFAULT_VIBRATE)
//        .setStyle(inboxStyle)  // Shows ALL messages when expanded
//        .addAction(replyAction)
//        .addAction(markAsReadAction)
//        .setGroup(GROUP_KEY_MESSAGES)
//        .setOnlyAlertOnce(false)  // Alert for each new message
//        .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)  // Ensure content is visible
//        .setCategory(NotificationCompat.CATEGORY_MESSAGE)
//        .setShowWhen(true)
//
//
//    return notificationBuilder.build()
//}



/**
 * BroadcastReceiver to handle inline reply actions
 */
class ReplyReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null || intent == null) return

        try {
            val sender = intent.getStringExtra("sender") ?: return
            val conversationId = intent.getLongExtra("conversationId", 0L)

            val remoteInput = RemoteInput.getResultsFromIntent(intent)
            val replyText = remoteInput?.getCharSequence(KEY_TEXT_REPLY)?.toString()

            val db = getDatabase(context)
//            val encryptionWrapper = EncryptionWrapper(context)
            val fireflyClient = FireflyClient.getInstance(context)

            if (replyText != null) {
                Log.d(TAG, "Reply received for $sender: $replyText")

                val failedToSend = runBlocking{
                    try {
                        Log.i(TAG, "Getting access token ${sender} ${conversationId}")
//                        val token = encryptionWrapper.getAccessToken()
                        Log.i(TAG, "Encrypting reply for ${sender} ${conversationId}")
                        val payload = Message.UserMessageInner.newBuilder().setMessagePayload(
                            Message.MessagePayload.newBuilder().setText(replyText).build()
                        ).build().toByteArray()

                        fireflyClient.initialize(context)

                        fireflyClient.waitUntilConnected(5000)

                        val msg = fireflyClient.encryptAndSend(payload,  sender)

                        db.userMessageNotificationsDao().put(DMessageNotification(msg.id.toLong(), msg.other,  msg.message, true))

                        Log.i(TAG, "Encrypted reply sent for ${sender} ${msg}")

                        return@runBlocking false
                    } catch (e: Exception) {
                        Log.e(TAG, "Failed to send reply", e)
                        return@runBlocking true
                    }
                }

                if (failedToSend) {
                    return
                }

//                runBlocking {
//                    val notification = buildUserNotification(context, sender)
//
//                }
                // Update notification to show reply but keep it visible with reply action
                val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

                val messages = runBlocking {
                    db.userMessageNotificationsDao().getFromUser(sender, 6)
                }

                // Create updated inbox style
                val inboxStyle = NotificationCompat.InboxStyle()
                messages.forEach { msg ->
                    val text = Message.UserMessageInner.parseFrom(msg.text).messagePayload.text
                    inboxStyle.addLine(text)
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
                    .setContentText(replyText)
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
            val sessionId = intent.getIntExtra("sessionId", 0)

            Log.d(TAG, "Call action received: $action from $caller, sessionId: $sessionId")
            val db = getDatabase(context)
            val fireflyClient = FireflyClient.getInstance(context)
//            val encryptionWrapper = EncryptionWrapper(context)

//            val (token, me) = runBlocking {
//                val token = encryptionWrapper.getAccessToken()
//                val username = encryptionWrapper.getUsernameFromToken(token)
//                token to username
//            }
//            if (me == null) {
//                throw Exception("User not logged in")
//            }
            when (action) {
                ACTION_ACCEPT_CALL -> {
                    Log.d(TAG, "Call accepted from $caller")
                    // TODO: Implement call acceptance logic
                    // This would typically open the call UI and establish the connection

                    // For now, just dismiss the notification
                    val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                    val notificationId = CALL_NOTIFICATION_ID_BASE + sessionId
                    notificationManager.cancel(notificationId)

                    val deepLinkUrl = "lupyd://m.lupyd.com/messages/${caller}/call?sessionId=${sessionId}&convoId=${conversationId}&accepted=true".toUri()

                    val i = Intent(Intent.ACTION_VIEW, deepLinkUrl)
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    context.startActivity(i)


                    // Show a toast or start the call activity
//                    val callIntent = Intent(context, MainActivity::class.java)
//                    callIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
//                    callIntent.putExtra("type", "call_accepted")
//                    callIntent.putExtra("caller", caller)
//                    callIntent.putExtra("conversationId", conversationId)
//                    context.startActivity(callIntent)
                }
                ACTION_DECLINE_CALL -> {
                    Log.d(TAG, "Call declined from $caller")
                    // TODO: Implement call decline logic
                    // This would send a decline message to the caller

                    // Dismiss the notification
                    val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                    val notificationId = CALL_NOTIFICATION_ID_BASE + sessionId
                    notificationManager.cancel(notificationId)

                    val payload = Message.UserMessageInner.newBuilder().setCallMessage(Message.CallMessage.newBuilder().setMessage(
                        ByteString.copyFrom(JSONObject()
                            .put("sessionId", sessionId)
//                            .put("from", me)
                            .put("type", "reject")
                            .toString().toByteArray())).build()
                    ).build().toByteArray()

                    runBlocking {
                        fireflyClient.initialize(context)
                        fireflyClient.waitUntilConnected(5000)
                        fireflyClient.encryptAndSend(payload,  caller)
                    }
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
