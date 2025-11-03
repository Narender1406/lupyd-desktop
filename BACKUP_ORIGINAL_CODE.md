# Original Code Backup - Notification System

**Date**: 2025-11-03
**Purpose**: Backup of original files before implementing notification bundling, reply, and call features

## Files Modified
1. `android/app/src/main/java/com/lupyd/app/MyFirebaseMessagingService.kt`
2. `src/context/notification-context.tsx`
3. `capacitor.config.ts`
4. `android/app/src/main/AndroidManifest.xml`

## Original MyFirebaseMessagingService.kt Key Methods

### showLocalNotification (Original - Line 177-227)
```kotlin
private fun showLocalNotification(title: String, message: String?) {
    try {
        createNotificationChannel()
        val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager?
        if (notificationManager == null) {
            Log.e(TAG, "Failed to show notification: notificationManager is null")
            return
        }
        Log.d(TAG, "Notification manager obtained")
        
        val intent = Intent(this, MainActivity::class.java)
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        Log.d(TAG, "Pending intent created")
        
        val notificationBuilder: NotificationCompat.Builder =
            NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(this.notificationIcon)
                .setContentTitle(title)
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
```

### handleDecryptedMessage (Original - Line 124-141)
```kotlin
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
```

## Revert Instructions
To revert changes:
1. Copy the original methods from this file
2. Replace the modified methods in MyFirebaseMessagingService.kt
3. Remove any new methods added (related to bundling, reply handling, call handling)
4. Rebuild the Android app

## New Features Being Added
1. **Message Bundling**: Group notifications by sender (using body field temporarily)
2. **Inline Reply**: Add reply action to notifications
3. **Message Persistence**: Use SharedPreferences to persist notification history
4. **Call Notifications**: Full-screen intent with Accept/Decline actions
