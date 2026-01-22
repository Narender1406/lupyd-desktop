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
            val fireflyClient = FireflyClient.getInstance(context)

            when (action) {
                ACTION_ACCEPT_CALL -> {
                    Log.d(TAG, "Call accepted from $caller")

                    val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                    val notificationId = CALL_NOTIFICATION_ID_BASE + sessionId
                    notificationManager.cancel(notificationId)

                    val deepLinkUrl = "lupyd://m.lupyd.com/messages/${caller}/call?sessionId=${sessionId}&convoId=${conversationId}&accepted=true".toUri()

                    val i = Intent(Intent.ACTION_VIEW, deepLinkUrl)
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    context.startActivity(i)


                }
                ACTION_DECLINE_CALL -> {
                    Log.d(TAG, "Call declined from $caller")

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
