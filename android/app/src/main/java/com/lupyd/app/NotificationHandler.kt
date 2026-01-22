package com.lupyd.app

import android.app.Notification
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
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.RemoteInput
import androidx.core.net.toUri
import com.lupyd.app.MyFirebaseMessagingService.Companion.CALL_NOTIFICATION_ID_BASE
import com.lupyd.app.MyFirebaseMessagingService.Companion.CHANNEL_ID
import com.lupyd.app.MyFirebaseMessagingService.Companion.CHANNEL_ID_CALL
import com.lupyd.app.MyFirebaseMessagingService.Companion.GROUP_KEY_MESSAGES
import com.lupyd.app.MyFirebaseMessagingService.Companion.KEY_TEXT_REPLY
import firefly.Message
import kotlinx.coroutines.runBlocking
import uniffi.firefly_signal.UserMessage

class NotificationHandler(private val context: Context) {

    private val db = getDatabase(context)

    fun showCallNotification(caller: String, sessionId: Int) {
        try {
            createCallNotificationChannel()

            val notificationManager = context.getSystemService(NOTIFICATION_SERVICE) as NotificationManager?
            if (notificationManager == null) {
                Log.e(TAG, "Failed to show call notification: notificationManager is null")
                return
            }

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
                MyFirebaseMessagingService.CHANNEL_ID,
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

        try {
            runBlocking {
                db.userMessageNotificationsDao().deleteAll()
            }
        } catch (e: Exception) {
            Log.e(MyFirebaseMessagingService.Companion.TAG, "Error clearing message history", e)
        }
    }

    fun addMessageToHistory(msg: UserMessage) {
        try {

            runBlocking {
                db.userMessageNotificationsDao().put(
                    DMessageNotification(msg.id.toLong(),  msg.other, msg.message, !msg.sentByOther)
                )
            }
        } catch (e: Exception) {
            Log.e(MyFirebaseMessagingService.Companion.TAG, "Error adding message to history", e)
        }
    }

    fun showUserBundledNotification(msg: UserMessage) {

        val other = msg.other
        try {
            createNotificationChannel()

            val notificationManager = context.getSystemService(NOTIFICATION_SERVICE) as NotificationManager?
            if (notificationManager == null) {
                Log.e(MyFirebaseMessagingService.Companion.TAG, "Failed to show notification: notificationManager is null")
                return
            }

            Log.d(MyFirebaseMessagingService.Companion.TAG, "Showing bundled notification from: $other")

            // Add message to persistent storage
            addMessageToHistory(msg)

            // Get all messages from this sender
            val messages =  runBlocking {
                db.userMessageNotificationsDao().getFromUser(other, 6)
            }
            val messageCount = messages.size

            Log.d(MyFirebaseMessagingService.Companion.TAG, "Total messages from $other: $messageCount")

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
            messages.forEach { msg ->
                val text = Message.UserMessageInner.parseFrom(msg.text).messagePayload.text
                inboxStyle.addLine(text)
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
            val profileBitmap = com.lupyd.app.createProfileBitmap(other, profileIconSize)

//            GlobalScope.launch {
//                val response = httpClient.get("${Constants.CDN_URL}/users/${other}")
//                if (!response.status.isSuccess()) {
//                    return@launch
//                }
//
//                val bitmap = BitmapFactory.decodeStream(response.bodyAsChannel().toInputStream())
//
//                // TODO: notify notification with loaded image
//            }

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
            notificationManager.notify(notificationId, notificationBuilder.build())
            Log.d(MyFirebaseMessagingService.Companion.TAG, "Bundled notification shown for $other with $messageCount messages")
        } catch (e: Exception) {
            Log.e(MyFirebaseMessagingService.Companion.TAG, "Error showing bundled notification", e)
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
suspend fun buildUserNotification(ctx: Context, other: String): Notification {
    val profileIconSize = ctx.resources.getDimensionPixelSize(android.R.dimen.notification_large_icon_width)

    val profileBitmap = createProfileBitmap(other, profileIconSize)

    val messages = getDatabase(ctx).userMessageNotificationsDao().getFromUser(other, 6)

    val messageCount = messages.size

    val lastMessage = messages.last()

    Log.d(MyFirebaseMessagingService.TAG, "Total messages from $other: $messageCount")

    val deepLinkUrl = "lupyd://m.lupyd.com/messages/${other}".toUri()
    val onClickIntent = Intent(Intent.ACTION_VIEW, deepLinkUrl)

    val pendingIntent = PendingIntent.getActivity(ctx, 0, onClickIntent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)

    val replyIntent = Intent(ctx, ReplyReceiver::class.java)
    replyIntent.putExtra("sender", other)
    val replyPendingIntent = PendingIntent.getBroadcast(
        ctx,
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

    val markAsReadIntent = Intent(ctx, MarkAsReadReceiver::class.java).apply {
        putExtra("sender", other)
        putExtra("msgId", lastMessage.msgId)
    }

    val markAsReadPendingIntent = PendingIntent.getBroadcast(
        ctx, other.hashCode() + 2, markAsReadIntent,
        PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
    )

    val markAsReadAction = NotificationCompat.Action.Builder(
        android.R.drawable.ic_menu_view,
        "Mark as Read",
        markAsReadPendingIntent
    ).build()

    val inboxStyle = NotificationCompat.InboxStyle()

    messages.forEach { msg ->
        val text = Message.UserMessageInner.parseFrom(msg.text).messagePayload.text
        val prefix = if (msg.sentByMe) "Me: " else ""
        inboxStyle.addLine(prefix + text)
    }

    val messageBody = Message.UserMessageInner.parseFrom(lastMessage.text).messagePayload.text

    inboxStyle.setBigContentTitle(other)

    var deepLinkAction: NotificationCompat.Action? = null
    val urlPattern = "(https?://[^\\s]+)".toRegex()
    val urlMatch = urlPattern.find(messageBody)

    if (urlMatch != null) {
        val url = urlMatch.value
        Log.d(MyFirebaseMessagingService.TAG, "URL detected in message: $url")

        val deepLinkIntent = Intent(Intent.ACTION_VIEW, url.toUri())
        val deepLinkPendingIntent = PendingIntent.getActivity(
            ctx, other.hashCode() + 3, deepLinkIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        deepLinkAction = NotificationCompat.Action.Builder(
            android.R.drawable.ic_menu_share,
            "Open Link",
            deepLinkPendingIntent
        ).build()
    }

    val notificationBuilder = NotificationCompat.Builder(ctx, CHANNEL_ID)
        .setSmallIcon(ctx.resources.getIdentifier("flower_notification_icon", "drawable", ctx.packageName))
        .setLargeIcon(profileBitmap)
        .setColor(0xFF000000.toInt())
        .setContentTitle(other)
        .setContentText(messageBody)
        .setAutoCancel(true)
        .setContentIntent(pendingIntent)
        .setPriority(NotificationCompat.PRIORITY_HIGH)
        .setVibrate(longArrayOf(100, 200, 300, 400, 500, 400, 300, 200, 400))
        .setDefaults(NotificationCompat.DEFAULT_SOUND or NotificationCompat.DEFAULT_VIBRATE)
        .setStyle(inboxStyle)
        .addAction(replyAction)
        .addAction(markAsReadAction)
        .setGroup(GROUP_KEY_MESSAGES)
        .setOnlyAlertOnce(false)
        .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
        .setCategory(Notification.CATEGORY_MESSAGE)
        .setShowWhen(true)

    if (deepLinkAction != null) {
        notificationBuilder.addAction(deepLinkAction)
    }

    return notificationBuilder.build()
}
