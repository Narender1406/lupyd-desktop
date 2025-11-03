# Using Local Notifications with Bundling & Reply

## ✅ What You Have

**Local notifications now have native Android bundling and reply features!**

---

## 📱 How to Use in Your App

### Import the hook:
```typescript
import { useNotification } from '@/context/notification-context'
```

### Use in your component:
```typescript
function MyComponent() {
  const { showBundledNotification } = useNotification()
  
  const handleNewMessage = async (sender: string, message: string) => {
    // This will show a BUNDLED notification with REPLY button
    await showBundledNotification(sender, message)
  }
  
  return (
    <button onClick={() => handleNewMessage('John', 'Hello!')}>
      Send Test Notification
    </button>
  )
}
```

---

## ✨ Features

### ✅ Message Bundling:
- Multiple messages from same sender group together
- Shows last 5 messages in expandable list
- Displays message count
- Updates existing notification instead of creating new ones

### ✅ Inline Reply:
- "Reply" button on notifications
- Type and send without opening app
- Uses Android's native RemoteInput

### ✅ Message Persistence:
- Messages saved in SharedPreferences
- Survives app restarts
- Survives device reboots

---

## 🧪 Testing

1. **Open your app**
2. **Call `showBundledNotification()`** from anywhere:
   ```typescript
   await showBundledNotification('Alice', 'First message')
   await showBundledNotification('Alice', 'Second message')
   await showBundledNotification('Alice', 'Third message')
   ```

3. **Check notification tray**:
   - ✅ ONE notification (not three separate ones)
   - ✅ Tap to expand → see all three messages
   - ✅ "Reply" button visible
   - ✅ "3 messages" badge

4. **Test reply**:
   - Long-press or expand notification
   - Tap "Reply"
   - Type and send
   - See "Reply sent" confirmation

---

## 📊 Logs to Monitor

```bash
adb logcat -s lupyd-NativeNotif
```

**Expected output**:
```
lupyd-NativeNotif: Showing bundled notification from: Alice
lupyd-NativeNotif: Total messages from Alice: 3
lupyd-NativeNotif: Bundled notification shown for Alice with 3 messages
```

---

## 🎯 Example Integration

### In a chat component:
```typescript
import { useNotification } from '@/context/notification-context'

function ChatComponent() {
  const { showBundledNotification } = useNotification()
  
  useEffect(() => {
    // When new message arrives
    socket.on('new_message', (data) => {
      showBundledNotification(data.sender, data.message)
    })
  }, [])
  
  return <div>...</div>
}
```

### In a message handler:
```typescript
const handleIncomingMessage = async (sender: string, text: string) => {
  const { showBundledNotification } = useNotification()
  
  // Show notification
  await showBundledNotification(sender, text)
  
  // Update UI
  updateMessageList(sender, text)
}
```

---

## 🔍 Troubleshooting

### No notification appears:
**Check 1**: Is plugin initialized?
```bash
adb logcat -s lupyd-cap | findstr "NativeNotification Plugin registered"
```
Should see: `NativeNotification Plugin registered`

**Check 2**: Are you on a real device/emulator?
```typescript
const { initializeNotifications } = useNotification()
await initializeNotifications()
```

**Check 3**: Check logs for errors:
```bash
adb logcat -s lupyd-NativeNotif
```

### Notification appears but not bundled:
**Issue**: Calling with different sender names
**Fix**: Use SAME sender name for bundling:
```typescript
// ✅ Correct - will bundle
await showBundledNotification('Alice', 'Msg 1')
await showBundledNotification('Alice', 'Msg 2')

// ❌ Wrong - won't bundle
await showBundledNotification('Alice', 'Msg 1')
await showBundledNotification('Bob', 'Msg 2')
```

### No reply button:
**Requirement**: Android 7.0+ (API 24+)
**Fix**: Expand the notification (swipe down or long-press)

---

## ✅ Summary

**What works**:
- ✅ Local notifications called from React have bundling
- ✅ Local notifications called from React have reply
- ✅ Messages persist across app restarts
- ✅ Native Android implementation (no Capacitor plugin limitations)

**How to use**:
```typescript
const { showBundledNotification } = useNotification()
await showBundledNotification(sender, message)
```

**That's it!** 🎉
