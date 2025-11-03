# Notification Features Implementation Guide

**Date**: 2025-11-03
**Version**: 1.0

## Overview
This document describes the comprehensive notification system implemented with bundling, inline reply, and call handling features.

---

## 1. Message Bundling Feature

### Description
Messages from the same sender are grouped into a single notification that displays multiple messages in an inbox-style format.

### Key Features
- **Grouping by Sender**: Uses sender name (body field temporarily) as the grouping key
- **Message Persistence**: All messages are stored in SharedPreferences and persist across app restarts
- **InboxStyle Display**: Shows up to 5 most recent messages in expanded view
- **Message Count**: Displays total number of messages from each sender
- **Auto-Update**: Same notification updates when new messages arrive from the same sender

### Implementation Details

**File**: `android/app/src/main/java/com/lupyd/app/MyFirebaseMessagingService.kt`

**Method**: `showBundledNotification(sender: String, messageBody: String)`

**Key Components**:
```kotlin
// Persistent storage using SharedPreferences
private val notificationPrefs: SharedPreferences by lazy {
    getSharedPreferences("lupyd_notification_messages", Context.MODE_PRIVATE)
}

// Message history functions
- addMessageToHistory(sender, message) // Add message to storage
- getMessagesFromSender(sender) // Retrieve all messages from sender
- clearMessageHistory(sender) // Clear history for sender
```

**Notification ID**: Uses `sender.hashCode()` to ensure same notification updates for same sender

**Storage Format**:
```json
{
  "sender_name": [
    {"text": "message 1", "timestamp": 1234567890},
    {"text": "message 2", "timestamp": 1234567891}
  ]
}
```

### Usage
Messages are automatically bundled when `handleDecryptedMessage()` receives a text message (not a call).

---

## 2. Inline Reply Feature

### Description
Users can reply directly from notifications without opening the app.

### Key Features
- **Direct Reply**: Reply input field appears in notification
- **Quick Response**: Reply without context switching
- **Auto-Generated Replies**: Android suggests smart replies
- **Reply Confirmation**: Shows "Reply sent" notification after sending

### Implementation Details

**Reply Action Creation** (in `showBundledNotification()`):
```kotlin
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
```

**Reply Handler**: `ReplyReceiver` BroadcastReceiver
- Registered in AndroidManifest.xml
- Extracts reply text from RemoteInput
- Logs reply for processing
- Updates notification to show "Reply sent"

**File**: `android/app/src/main/java/com/lupyd/app/MyFirebaseMessagingService.kt`
**Class**: `ReplyReceiver`

### TODO
The actual message sending logic needs to be implemented:
```kotlin
// TODO: Send the reply message through the encryption system
// This will require access to the database and encryption wrapper
```

---

## 3. Call Notification Feature

### Description
Full-screen incoming call notifications with Accept/Decline actions, following Android's native call handling patterns.

### Key Features
- **Full-Screen Intent**: Notification appears as full-screen on locked devices
- **Call Actions**: Accept and Decline buttons
- **Ongoing Notification**: Stays visible until action is taken
- **Custom Ringtone**: Uses device's default ringtone
- **Priority**: Highest priority for immediate visibility

### Implementation Details

**Detection** (in `handleDecryptedMessage()`):
```kotlin
if (!inner.callMessage.message.isEmpty) {
    Log.d(TAG, "=== CALL RECEIVED === from: ${msg.mfrom}")
    isCallMessage = true
    body = "Incoming call"
}

if (isCallMessage) {
    showCallNotification(msg.mfrom, msg.conversationId)
}
```

**Call Notification Channel**:
```kotlin
private fun createCallNotificationChannel() {
    val channel = NotificationChannel(
        CHANNEL_ID_CALL,
        CHANNEL_NAME_CALL,
        NotificationManager.IMPORTANCE_HIGH
    )
    channel.setSound(android.provider.Settings.System.DEFAULT_RINGTONE_URI, null)
    // ... vibration pattern, etc.
}
```

**Full-Screen Intent**:
```kotlin
.setFullScreenIntent(fullScreenPendingIntent, true)
.setCategory(NotificationCompat.CATEGORY_CALL)
.setOngoing(true)
```

**Call Actions**: Accept and Decline buttons handled by `CallActionReceiver`

**File**: `android/app/src/main/java/com/lupyd/app/MyFirebaseMessagingService.kt`
**Methods**: 
- `showCallNotification(caller, conversationId)`
- `createCallNotificationChannel()`

**Class**: `CallActionReceiver`

### Call Action Handling

**Accept Call**:
- Dismisses notification
- Launches MainActivity with call_accepted type
- Passes caller and conversationId

**Decline Call**:
- Dismisses notification
- Can send decline message to server (TODO)

### TODO
Implement actual call connection logic:
```kotlin
// TODO: Implement call acceptance logic
// This would typically open the call UI and establish the connection

// TODO: Implement call decline logic
// This would send a decline message to the caller
```

---

## 4. Permissions Required

### AndroidManifest.xml
All permissions are already configured:
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

### Broadcast Receivers
New receivers registered:
```xml
<receiver android:name=".ReplyReceiver" android:exported="false" />
<receiver android:name=".CallActionReceiver" android:exported="false" />
```

---

## 5. Notification Channels

### Main Notification Channel
- **ID**: `lupyd_notifications`
- **Name**: Lupyd Notifications
- **Importance**: HIGH
- **Features**: Vibration, Lights, Sound

### Call Notification Channel
- **ID**: `lupyd_calls`
- **Name**: Lupyd Calls
- **Importance**: HIGH
- **Features**: Vibration, Lights, Custom Ringtone

---

## 6. Constants

### Notification IDs
- **Bundled Messages**: `sender.hashCode()` (unique per sender)
- **Calls**: `CALL_NOTIFICATION_ID_BASE (10000) + caller.hashCode()`

### Action Constants
- `ACTION_ACCEPT_CALL`: "com.lupyd.app.ACCEPT_CALL"
- `ACTION_DECLINE_CALL`: "com.lupyd.app.DECLINE_CALL"
- `KEY_TEXT_REPLY`: "key_text_reply"
- `GROUP_KEY_MESSAGES`: "com.lupyd.app.MESSAGES"

---

## 7. Testing Guide

### Test Message Bundling
1. Send multiple messages from the same sender
2. Verify all messages appear in notification
3. Verify message count is correct
4. Kill and restart app - verify messages persist
5. Send another message - verify it's added to existing bundle

### Test Inline Reply
1. Receive a message notification
2. Expand notification
3. Tap "Reply" button
4. Type a reply
5. Send reply
6. Verify "Reply sent" notification appears

### Test Call Notifications
1. Trigger a call message
2. Verify full-screen notification appears
3. Test "Accept" button - verify app opens with call data
4. Test "Decline" button - verify notification dismisses

---

## 8. Key Files Modified

1. **MyFirebaseMessagingService.kt**
   - Added: `showBundledNotification()`
   - Added: `showCallNotification()`
   - Added: `addMessageToHistory()`, `getMessagesFromSender()`, `clearMessageHistory()`
   - Added: `createCallNotificationChannel()`
   - Added: `ReplyReceiver` class
   - Added: `CallActionReceiver` class
   - Modified: `handleDecryptedMessage()` to detect calls
   - Modified: `handleNotification()` to use bundled notifications

2. **AndroidManifest.xml**
   - Added: ReplyReceiver registration
   - Added: CallActionReceiver registration

3. **capacitor.config.ts**
   - No changes required (already configured)

---

## 9. Future Enhancements

### Short Term (TODO in code)
1. **Reply Integration**: Connect reply feature to encryption system
2. **Call Connection**: Implement actual call establishment logic
3. **Call Decline**: Send decline message to server

### Long Term
1. **Username Grouping**: Change from body to username once available
2. **Message Cleanup**: Auto-delete old messages from SharedPreferences
3. **Rich Media**: Support image/video thumbnails in bundled notifications
4. **Call UI**: Dedicated in-app call interface
5. **Call History**: Track accepted/declined calls
6. **Group Calls**: Support multi-participant calls

---

## 10. Reverting Changes

If you need to revert to the original implementation:

1. Refer to `BACKUP_ORIGINAL_CODE.md` for original methods
2. Replace modified methods in `MyFirebaseMessagingService.kt`
3. Remove `ReplyReceiver` and `CallActionReceiver` classes
4. Remove receiver registrations from `AndroidManifest.xml`
5. Rebuild the app

**Revert Command**:
```bash
git checkout HEAD -- android/app/src/main/java/com/lupyd/app/MyFirebaseMessagingService.kt
git checkout HEAD -- android/app/src/main/AndroidManifest.xml
```

---

## 11. Build and Deploy

### Build Commands
```bash
# Navigate to android directory
cd android

# Clean build
.\gradlew.bat clean

# Build debug APK
.\gradlew.bat assembleDebug

# Install on device
.\gradlew.bat installDebug
```

### Sync Changes
```bash
# From project root
npx cap sync android
```

---

## 12. Troubleshooting

### Messages Not Bundling
- Check logcat for "Showing bundled notification from:" messages
- Verify SharedPreferences is being written to
- Check notification ID matches (sender.hashCode())

### Reply Not Working
- Verify ReplyReceiver is registered in manifest
- Check PendingIntent flags (MUTABLE required for reply)
- Check logcat for "Reply received for" messages

### Call Notification Not Full-Screen
- Verify USE_FULL_SCREEN_INTENT permission
- Check if battery optimization is blocking
- Ensure notification category is CATEGORY_CALL

### Persistence Issues
- Clear app data and test fresh install
- Verify SharedPreferences file exists: `/data/data/com.lupyd.app/shared_prefs/lupyd_notification_messages.xml`

---

## 13. Code Quality Notes

✅ **No Breaking Changes**: All original functionality preserved
✅ **Backward Compatible**: Gracefully handles old and new message formats
✅ **Error Handling**: Try-catch blocks in all critical sections
✅ **Logging**: Comprehensive logging for debugging
✅ **Memory Efficient**: Uses SharedPreferences (not database) for notification history
✅ **Thread Safe**: Proper coroutine usage maintained

---

**End of Guide**
