package com.lupyd.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MyFirebaseMessagingService extends FirebaseMessagingService {
    private static final String TAG = "MyFirebaseMsgService";
    private static final String CHANNEL_ID = "lupyd_notifications";
    private static final String CHANNEL_NAME = "Lupyd Notifications";
    private static final String CHANNEL_DESCRIPTION = "Lupyd app notifications";

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        
        Log.d(TAG, "=== PUSH NOTIFICATION RECEIVED ===");
        Log.d(TAG, "Received message from: " + remoteMessage.getFrom());
        Log.d(TAG, "Message contains notification: " + (remoteMessage.getNotification() != null));
        Log.d(TAG, "Message contains data: " + (remoteMessage.getData().size() > 0));
        
        // Handle notification payload (when app is in foreground)
        if (remoteMessage.getNotification() != null) {
            Log.d(TAG, "Processing notification payload: " + remoteMessage.getNotification().getTitle());
            String originalTitle = remoteMessage.getNotification().getTitle() != null ? 
                remoteMessage.getNotification().getTitle() : "Notification";
            String convertedTitle = originalTitle + "+++ (converted)";
            
            showLocalNotification(
                convertedTitle,
                remoteMessage.getNotification().getBody() != null ? 
                remoteMessage.getNotification().getBody() : "You have a new message"
            );
        }
        
        // Handle data payload (works in all app states: foreground, background, closed)
        if (remoteMessage.getData().size() > 0) {
            Log.d(TAG, "Processing data payload: " + remoteMessage.getData());
            
            // Extract title and body from data
            String title = remoteMessage.getData().get("title");
            String body = remoteMessage.getData().get("body");
            String message = remoteMessage.getData().get("message");
            
            // Convert to local notification
            String originalTitle = title != null ? title : "Notification";
            String convertedTitle = originalTitle + "+++ (converted)";
            
            showLocalNotification(
                convertedTitle,
                body != null ? body : (message != null ? message : "You have a new message")
            );
        }
        
        Log.d(TAG, "=== PUSH NOTIFICATION PROCESSED ===");
    }
    
    @Override
    public void onNewToken(String token) {
        Log.d(TAG, "=== NEW FCM TOKEN ===");
        Log.d(TAG, "Refreshed token: " + token);
        sendRegistrationToServer(token);
    }
    
    @Override
    public void onDeletedMessages() {
        Log.d(TAG, "=== MESSAGES DELETED ===");
        super.onDeletedMessages();
    }
    
    @Override
    public void onMessageSent(String msgId) {
        Log.d(TAG, "=== MESSAGE SENT ===");
        Log.d(TAG, "Message sent: " + msgId);
        super.onMessageSent(msgId);
    }
    
    @Override
    public void onSendError(String msgId, Exception exception) {
        Log.e(TAG, "=== SEND ERROR ===");
        Log.e(TAG, "Message send error for " + msgId, exception);
        super.onSendError(msgId, exception);
    }
    
    private void createNotificationChannel() {
        Log.d(TAG, "Creating notification channel...");
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Log.d(TAG, "Android O+ detected, creating channel");
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription(CHANNEL_DESCRIPTION);
            channel.enableVibration(true);
            channel.enableLights(true);
            channel.setVibrationPattern(new long[]{100, 200, 300, 400, 500, 400, 300, 200, 400});
            
            // Register the channel with the system
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                Log.d(TAG, "Notification manager obtained, creating channel");
                notificationManager.createNotificationChannel(channel);
                Log.d(TAG, "Notification channel created successfully");
            } else {
                Log.e(TAG, "Failed to create notification channel: notificationManager is null");
            }
        } else {
            Log.d(TAG, "Android version < O, no channel needed");
        }
    }
    
    private void showLocalNotification(String title, String message) {
        try {
            Log.d(TAG, "=== SHOWING LOCAL NOTIFICATION ===");
            Log.d(TAG, "Original Title: " + title.replace("+++ (converted)", ""));
            Log.d(TAG, "Converted Title: " + title);
            Log.d(TAG, "Message: " + message);
            
            // Create notification channel if needed
            createNotificationChannel();
            
            NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (notificationManager == null) {
                Log.e(TAG, "Failed to show notification: notificationManager is null");
                return;
            }
            
            Log.d(TAG, "Notification manager obtained");
            
            // Create an intent that will be fired when the user clicks the notification
            Intent intent = new Intent(this, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            
            PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, intent, 
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
            );
            
            Log.d(TAG, "Pending intent created");
            
            NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(getNotificationIcon()) // Use proper app icon
                .setContentTitle(title)  // This will show the marker
                .setContentText(message)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setVibrate(new long[]{100, 200, 300, 400, 500, 400, 300, 200, 400})
                .setDefaults(NotificationCompat.DEFAULT_SOUND | NotificationCompat.DEFAULT_VIBRATE)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(message));
            
            Log.d(TAG, "Notification builder created");
            
            int notificationId = (int) System.currentTimeMillis();
            Log.d(TAG, "Showing notification with ID: " + notificationId);
            notificationManager.notify(notificationId, notificationBuilder.build());
            Log.d(TAG, "Local notification shown with ID: " + notificationId);
            Log.d(TAG, "=== LOCAL NOTIFICATION DISPLAYED ===");
        } catch (Exception e) {
            Log.e(TAG, "Error showing local notification", e);
        }
    }
    
    private int getNotificationIcon() {
        // Try to use the app's launcher icon
        int icon = getApplicationInfo().icon;
        Log.d(TAG, "Using notification icon: " + icon);
        return icon;
    }
    
    private void sendRegistrationToServer(String token) {
        // Implement this method to send token to your app server
        Log.d(TAG, "Sending token to server: " + token);
    }
}