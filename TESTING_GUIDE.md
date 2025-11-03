# Testing Native Bundled Notifications

## ❌ Problem: Local Notifications Don't Have Bundling/Reply

**Why**: Capacitor's `LocalNotifications.schedule()` API doesn't support:
- ❌ Message bundling
- ❌ Inline reply actions  
- ❌ InboxStyle notifications
- ❌ Custom action buttons

**These features ONLY work in native Android `NotificationCompat`** which is used by `MyFirebaseMessagingService.kt`.

---

## ✅ Solution: Test with PUSH Notifications

The bundling/reply features **ONLY work when push notifications arrive** because they trigger `MyFirebaseMessagingService.kt`.

---

## 🧪 How to Test

### Method 1: Firebase Console (Easiest)

1. **Get your FCM token** from logs:
   ```bash
   adb logcat | findstr "FCM Token received"
   ```
   Copy the long token string

2. **Go to Firebase Console**:
   - https://console.firebase.google.com
   - Select your project
   - Cloud Messaging → Send test message

3. **Send test notification**:
   - Paste your FCM token
   - Title: `John` (this will be the sender name)
   - Body: `Hello, this is a test message`
   - Click "Test"

4. **Send another message**:
   - Title: `John` (same sender!)
   - Body: `How are you doing?`
   - Click "Test"

5. **Check notification tray**:
   - ✅ Should see ONE notification with both messages bundled
   - ✅ Tap to expand - see both messages
   - ✅ Reply button should be visible

---

### Method 2: Using curl (Advanced)

```bash
# Get your Server Key from Firebase Console → Project Settings → Cloud Messaging

curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "YOUR_FCM_TOKEN_HERE",
    "notification": {
      "title": "John",
      "body": "Hello from curl!"
    }
  }'
```

---

### Method 3: Direct Native Test (Create Test Function)

Since Capacitor LocalNotifications can't do bundling, we need to call the native service directly.

**Add this to your app** (e.g., in settings page):

```tsx
import { useNotification } from '../context/notification-context'

function TestNotificationButton() {
  const { pushToken } = useNotification()
  
  const testBundling = () => {
    console.log('To test bundling, send a push notification to this token:')
    console.log(pushToken)
    console.log('\nUse Firebase Console or curl command from TESTING_GUIDE.md')
    alert(`FCM Token copied to console!

Go to Firebase Console → Cloud Messaging → Send test message

Paste token and send 2-3 messages with same title to test bundling`)
  }
  
  return (
    <button onClick={testBundling}>
      🧪 Test Bundled Notifications
    </button>
  )
}
```

---

## 📊 Expected Results

### When App is OPEN (Foreground):

**Logs**:
```
=== PUSH NOTIFICATION RECEIVED IN APP (FOREGROUND) ===
Notification title: John
Notification body: Hello, this is a test message
Notification will be handled by native service
```

**Notification Tray**:
- ✅ Bundled notification appears
- ✅ Shows sender name: "John"
- ✅ Shows message count if multiple
- ✅ Tap to expand → see all messages
- ✅ Reply button visible

### When App is CLOSED/BACKGROUND:

**Same behavior** - notifications handled by `MyFirebaseMessagingService.kt`

---

## 🐛 Troubleshooting

### "I don't see any notifications"

**Check 1**: Are notifications arriving?
```bash
adb logcat -s lupyd-FCM
```
Look for: `=== PUSH NOTIFICATION RECEIVED ===`

**Check 2**: Is the service handling them?
```bash
adb logcat -s lupyd-FCM | findstr "bundled"
```
Should see: `Showing bundled notification from: John`

**Check 3**: presentationOptions setting
File: `capacitor.config.ts`
```typescript
PushNotifications: {
  presentationOptions: [], // MUST be empty!
}
```

---

### "Notifications appear but not bundled"

**Issue**: Sending from different sender names

**Fix**: Make sure multiple notifications have the SAME title
- Message 1: Title="John", Body="Hello"
- Message 2: Title="John", Body="How are you?" ✅
- NOT: Title="Jane", Body="Hi" ❌ (different sender)

---

### "No reply button"

**Check 1**: Android version must be 7.0+ (API 24+)

**Check 2**: Expand the notification (long-press or swipe down)

**Check 3**: Check logs:
```bash
adb logcat -s lupyd-FCM | findstr "Reply"
```

---

## 📝 Summary

**To test bundling/reply features, you MUST:**
1. ✅ Send PUSH notifications (not local)
2. ✅ Use same sender name for bundling
3. ✅ Check notification tray (not in-app)
4. ✅ Expand notification to see reply button

**You CANNOT test with:**
- ❌ `sendLocalNotification()` function
- ❌ Capacitor's `LocalNotifications.schedule()`
- ❌ In-app alerts

**The features ONLY work via:**
- ✅ Push notifications from FCM
- ✅ Native `MyFirebaseMessagingService.kt`
- ✅ Android NotificationCompat API

---

## 🎯 Quick Test Checklist

- [ ] Get FCM token from logs
- [ ] Go to Firebase Console
- [ ] Send test message with title="John"
- [ ] Send another with same title="John"
- [ ] Check notification tray
- [ ] See bundled notification with 2 messages
- [ ] Expand and see reply button
- [ ] Test reply functionality

**If all checked ✅ = Features working!**
