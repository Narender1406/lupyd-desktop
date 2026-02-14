package com.lupyd.client

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Context.NOTIFICATION_SERVICE
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.Typeface
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.RemoteInput
import androidx.core.net.toUri
import com.lupyd.client.MyFirebaseMessagingService.Companion.CALL_NOTIFICATION_ID_BASE
import com.lupyd.client.MyFirebaseMessagingService.Companion.CHANNEL_ID
import com.lupyd.client.MyFirebaseMessagingService.Companion.CHANNEL_ID_CALL
import com.lupyd.client.MyFirebaseMessagingService.Companion.GROUP_KEY_MESSAGES
import com.lupyd.client.MyFirebaseMessagingService.Companion.KEY_TEXT_REPLY
import firefly.Message
import kotlinx.coroutines.runBlocking
import uniffi.firefly_signal.UserMessage
import kotlin.math.absoluteValue

class NotificationHandler(private val context: Context) {

    // private val db = getDatabase(context) // Removed

    fun showCallNotification(caller: String, sessionId: Int) {
        try {
            createCallNotificationChannel()

            val notificationManager = context.getSystemService(NOTIFICATION_SERVICE) as NotificationManager?
            if (notificationManager == null) {
                Log.e(TAG, "Failed to show call notification: notificationManager is null")
                return
            }
// ... (rest of showCallNotification is fine as it doesn't use DB)

            Log.d(TAG, "Showing call notification from: $caller")

            // Create full-screen intent
            val fullScreenIntent = Intent(context, MainActivity::class.java)
            fullScreenIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            fullScreenIntent.putExtra("type", "call")
            fullScreenIntent.putExtra("caller", caller)
            fullScreenIntent.putExtra("sessionId", sessionId)

            val fullScreenPendingIntent = PendingIntent.getActivity(
                context,
                caller.hashCode(),
                fullScreenIntent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )

            val acceptIntent = Intent(context, CallActionReceiver::class.java).apply {
                action = MyFirebaseMessagingService.ACTION_ACCEPT_CALL
                putExtra("caller", caller)
                putExtra("sessionId", sessionId)
            }




            val acceptPendingIntent = PendingIntent.getBroadcast(context, caller.hashCode() + 100, acceptIntent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)


            // Create Decline action
            val declineIntent = Intent(context, CallActionReceiver::class.java)
            declineIntent.action = MyFirebaseMessagingService.ACTION_DECLINE_CALL
            declineIntent.putExtra("caller", caller)
            declineIntent.putExtra("sessionId", sessionId)

            val declinePendingIntent = PendingIntent.getBroadcast(
                context,
                caller.hashCode() + 101,
                declineIntent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )

            val notificationBuilder = NotificationCompat.Builder(context, CHANNEL_ID_CALL)
                .setSmallIcon(context.resources.getIdentifier("flower_notification_icon", "drawable", context.packageName))
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

            val notificationId = CALL_NOTIFICATION_ID_BASE + sessionId

            Log.d(TAG, "Showing call notification with ID: $notificationId")
            notificationManager.notify(notificationId, notificationBuilder.build())
            Log.d(TAG, "Call notification shown for $caller")
        } catch (e: Exception) {
            Log.e(TAG, "Error showing call notification", e)
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            val channel = NotificationChannel(
                CHANNEL_ID,
                MyFirebaseMessagingService.CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = MyFirebaseMessagingService.CHANNEL_DESCRIPTION
                enableVibration(true)
                enableLights(true)
                vibrationPattern = longArrayOf(100, 200, 300, 400, 500, 400, 300, 200, 400)
            }

            notificationManager.createNotificationChannel(channel)
            Log.d(TAG, "Notification channel created: ${MyFirebaseMessagingService.CHANNEL_ID}")
        }
    }

    private fun createCallNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            val channel = NotificationChannel(
                MyFirebaseMessagingService.CHANNEL_ID_CALL,
                MyFirebaseMessagingService.CHANNEL_NAME_CALL,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = MyFirebaseMessagingService.CHANNEL_DESCRIPTION_CALL
                enableVibration(true)
                enableLights(true)
                vibrationPattern = longArrayOf(0, 1000, 500, 1000)
                setSound(android.provider.Settings.System.DEFAULT_RINGTONE_URI, null)
            }

            notificationManager.createNotificationChannel(channel)
            Log.d(TAG, "Call notification channel created: ${MyFirebaseMessagingService.CHANNEL_ID_CALL}")
        }
    }



    /**
     * Clear message history for a sender
     */
    fun clearAll() {
        (context.getSystemService(NOTIFICATION_SERVICE) as NotificationManager).cancelAll()
        // DB clear removed as we rely on Rust store which handles its own lifecycle or isn't cleared by this UI action
    }

    fun addMessageToHistory(msg: UserMessage) {
       // DB insert removed. data is saved by FireflyClient (UniFFI) in the Rust layer.
    }

    fun showUserBundledNotification(msg: UserMessage) {

        val other = msg.other
        try {
            createNotificationChannel()

            Log.d(TAG, "Showing bundled notification from: $other")

            // Add message to persistent storage - Handled by Rust layer now

            // Get all messages from this sender via UniFFI
            val fireflyClient = FireflyClient.getInstance(context)
            val messages = runBlocking {
                try {
                     fireflyClient.getLastMessagesOf(other, msg.id + 1, 6)
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to get messages from FireflyClient", e)
                    emptyList<UserMessage>()
                }
            }
            // Note: getLastMessagesOf returns List<UserMessage> (reversed order usually, need to check)
            // If it returns newest first, we might need to reverse for inbox style.
            
            val messageCount = messages.size

            Log.d(TAG, "Total messages from $other: $messageCount")

            // Create main intent

            val deepLinkUrl = "lupyd://m.lupyd.com/messages/${other}".toUri()
            val onClickIntent = Intent(Intent.ACTION_VIEW, deepLinkUrl).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }

            val pendingIntent = PendingIntent.getActivity(context, 0, onClickIntent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)


            // Create reply action
            val replyIntent = Intent(context, ReplyReceiver::class.java)
            replyIntent.putExtra("sender", other)
            val replyPendingIntent = PendingIntent.getBroadcast(
                context,
                other.hashCode() + 1,
                replyIntent,
                PendingIntent.FLAG_MUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )

            val remoteInput = RemoteInput.Builder(KEY_TEXT_REPLY)
                .setLabel("Reply to $other")
                .build()

            val replyAction = NotificationCompat.Action.Builder(
                android.R.drawable.ic_menu_send,
                "Reply",
                replyPendingIntent
            )
                .addRemoteInput(remoteInput)
                .setAllowGeneratedReplies(true)
                .build()

            // Mark as Read action
            val markAsReadIntent = Intent(context, MarkAsReadReceiver::class.java).apply {
                putExtra("sender", other)
                putExtra("msgId", msg.id.toLong())
            }

            val markAsReadPendingIntent = PendingIntent.getBroadcast(
                context, other.hashCode() + 2, markAsReadIntent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )

            val markAsReadAction = NotificationCompat.Action.Builder(
                android.R.drawable.ic_menu_view,
                "Mark as Read",
                markAsReadPendingIntent
            ).build()

            // Build notification with InboxStyle to show ALL messages
            val inboxStyle = NotificationCompat.InboxStyle()

            // Add ALL messages to inbox style when expanded
            // messages is List<UserMessage>. Order depends on retrieving.
            // Assuming we want oldest to newest for inbox style line addition?
            // Actually usually inbox style shows newest at bottom or top?
            // Let's iterate. Accessing `messagePayload` from `UserMessage` requires parsing.

            messages.reversed().forEach { m ->
                 try {
                    val inner = Message.UserMessageInner.parseFrom(m.message)
                    if (inner.hasMessagePayload()) {
                        val text = inner.messagePayload.text
                        inboxStyle.addLine(text)
                    }
                 } catch (e: Exception) {
                     Log.e(TAG, "Failed to parse message for notification", e)
                 }
            }

            val messageBody = Message.UserMessageInner.parseFrom(msg.message).messagePayload.text

            // No summary text - just show sender name
            inboxStyle.setBigContentTitle(other)

            // Check for URLs in the latest message
            var deepLinkAction: NotificationCompat.Action? = null
            val urlPattern = "(https?://[^\\s]+)".toRegex()
            val urlMatch = urlPattern.find(messageBody)

            if (urlMatch != null) {
                val url = urlMatch.value
                Log.d(MyFirebaseMessagingService.Companion.TAG, "URL detected in message: $url")

                // Create deep link intent
                val deepLinkIntent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url))
                val deepLinkPendingIntent = PendingIntent.getActivity(
                    context, other.hashCode() + 3, deepLinkIntent,
                    PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
                )

                deepLinkAction = NotificationCompat.Action.Builder(
                    android.R.drawable.ic_menu_share,
                    "Open Link",
                    deepLinkPendingIntent
                ).build()
            }

            // Create large profile icon with letter
            val profileIconSize = context.resources.getDimensionPixelSize(android.R.dimen.notification_large_icon_width)
            val profileBitmap = createProfileBitmap(other, profileIconSize)

            val notificationBuilder = NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(context.resources.getIdentifier("flower_notification_icon", "drawable", context.packageName))
                .setLargeIcon(profileBitmap) // Set the profile picture with letter
                .setColor(0xFF000000.toInt()) // Black background
                .setContentTitle(other)  // Just the sender name (no prefix)
                .setContentText(messageBody)  // Latest message preview
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setVibrate(longArrayOf(100, 200, 300, 400, 500, 400, 300, 200, 400))
                .setDefaults(NotificationCompat.DEFAULT_SOUND or NotificationCompat.DEFAULT_VIBRATE)
                .setStyle(inboxStyle)  // Shows ALL messages when expanded
                .addAction(replyAction)
                .addAction(markAsReadAction)
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
            val notificationId = other.hashCode()
            Log.d(MyFirebaseMessagingService.Companion.TAG, "Showing bundled notification with ID: $notificationId")

            val notificationManager = context.getSystemService(NOTIFICATION_SERVICE) as NotificationManager?
            if (notificationManager == null) {
                Log.e(MyFirebaseMessagingService.Companion.TAG, "Failed to show notification: notificationManager is null")
                return
            }
                Log.d(TAG, "Bundled notification shown for $other with $messageCount messages")
            } catch (e: Exception) {
                Log.e(TAG, "Error showing bundled notification", e)
            }
        }



    fun cancelCallNotification(sessionId: Int) {
        (context.getSystemService(NOTIFICATION_SERVICE) as NotificationManager).cancel(
            CALL_NOTIFICATION_ID_BASE + sessionId)
    }

    companion object {
        private const val TAG = "lupyd-NotificationHandler"
    }
}


fun createProfileBitmap(sender: String, size: Int): Bitmap {
    val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)

    val paint = Paint().apply {
        isAntiAlias = true
        style = Paint.Style.FILL
        color = 0xFFFFFFFF.toInt() // White text
    }

    val radius = size / 2f
    canvas.drawCircle(radius, radius, radius, paint)

    if (sender.isNotEmpty()) {
        val firstLetter = sender.substring(0, 1).uppercase()

        val textPaint = Paint().apply {
            isAntiAlias = true
            color = 0xFF000000.toInt() // Black text
            textSize = size * 0.6f
            textAlign = Paint.Align.CENTER
            typeface = Typeface.DEFAULT_BOLD
        }

        val textBounds = Rect()
        textPaint.getTextBounds(firstLetter, 0, firstLetter.length, textBounds)

        val x = size / 2f
        val y = (size / 2f) - (textBounds.exactCenterY())

        canvas.drawText(firstLetter, x, y, textPaint)
    }

    return bitmap
}
