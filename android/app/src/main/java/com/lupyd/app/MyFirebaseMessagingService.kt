package com.lupyd.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import firefly.Message
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

class MyFirebaseMessagingService : FirebaseMessagingService() {
    lateinit var db: AppDatabase
    lateinit var encryptionWrapper: EncryptionWrapper

    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    override fun onCreate() {
        super.onCreate()

        db = getDatabase(this)
        encryptionWrapper = EncryptionWrapper(db, this::handleDecryptedMessage)



    }

    override fun onDestroy() {
        scope.cancel()
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

        showLocalNotification(title ?: "Received a Notification", body)
    }

    fun handleDecryptedMessage(msg: DMessage) {

        val inner = Message.UserMessageInner.parseFrom(msg.text)

        var body = ""

        if (inner.messagePayload.text.isNotEmpty()) {
            body = inner.messagePayload.text
        } else if (!inner.callMessage.message.isEmpty) {
            Log.d(TAG, "=== CALL RECEIVED === from: ${msg.mfrom}")
        }


        showLocalNotification(msg.mfrom, body)
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

    private fun showLocalNotification(title: String, message: String?) {
        try {
            // Create notification channel if needed
            createNotificationChannel()

            val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager?
            if (notificationManager == null) {
                Log.e(TAG, "Failed to show notification: notificationManager is null")
                return
            }

            Log.d(TAG, "Notification manager obtained")


            // Create an intent that will be fired when the user clicks the notification
            val intent = Intent(this, MainActivity::class.java)
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)

            val pendingIntent = PendingIntent.getActivity(
                this, 0, intent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )

            Log.d(TAG, "Pending intent created")

            val notificationBuilder: NotificationCompat.Builder =
                NotificationCompat.Builder(this, CHANNEL_ID)
                    .setSmallIcon(this.notificationIcon) // Use proper app icon
                    .setContentTitle(title) // This will show the marker
                    .setContentText(message)
                    .setAutoCancel(true)
                    .setContentIntent(pendingIntent)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setVibrate(longArrayOf(100, 200, 300, 400, 500, 400, 300, 200, 400))
                    .setDefaults(NotificationCompat.DEFAULT_SOUND or NotificationCompat.DEFAULT_VIBRATE)
                    .setStyle(NotificationCompat.BigTextStyle().bigText(message))

            Log.d(TAG, "Notification builder created")

            val notificationId = System.currentTimeMillis().toInt()
            Log.d(TAG, "Showing notification with ID: $notificationId")
            notificationManager.notify(notificationId, notificationBuilder.build())
            Log.d(TAG, "Local notification shown with ID: $notificationId")
        } catch (e: Exception) {
            Log.e(TAG, "Error showing local notification", e)
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
        private const val TAG = "lupyd-FCM"
        private const val CHANNEL_ID = "lupyd_notifications"
        private const val CHANNEL_NAME = "Lupyd Notifications"
        private const val CHANNEL_DESCRIPTION = "Lupyd app notifications"
    }
}