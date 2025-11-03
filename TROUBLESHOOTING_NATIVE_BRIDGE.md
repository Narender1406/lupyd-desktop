# Troubleshooting: Native Bridge Not Working

**Problem**: No logs, no bundling, no push notifications

---

## Step-by-Step Fix

### Step 1: Rebuild Everything from Scratch

```bash
# 1. Clean everything
cd android
.\gradlew.bat clean
cd ..

# 2. Sync Capacitor (CRITICAL!)
npx cap sync android

# 3. Build fresh
cd android
.\gradlew.bat assembleDebug

# 4. Install
.\gradlew.bat installDebug
```

**Why this matters**: The new plugin files won't be included unless you sync and rebuild!

---

### Step 2: Check if Plugin is Registered

Open the app and check logs:

```bash
adb logcat | findstr "lupyd-cap"
```

**You MUST see**:
```
lupyd-cap: Encryption Plugin registered
lupyd-cap: NotificationBridge Plugin registered  ← THIS IS CRITICAL!
```

**If you DON'T see "NotificationBridge Plugin registered"**:
- The app wasn't rebuilt
- OR MainActivity.kt has syntax errors
- OR the build failed silently

---

### Step 3: Test the Bridge Manually

**Option A**: Add test button to your app

1. Import in any component:
```tsx
import { NotificationBridgeTest } from '../components/NotificationBridgeTest'
```

2. Add to JSX:
```tsx
<NotificationBridgeTest />
```

3. Tap the button and check logs:
```bash
adb logcat | findstr "TESTING NATIVE BRIDGE"
```

**Option B**: Use browser console (if app is open)

Open Chrome DevTools connected to your app and run:
```javascript
const { Capacitor } = await import('@capacitor/core');
console.log('Bridge available:', Capacitor.isPluginAvailable('NotificationBridge'));
```

---

### Step 4: Check Build Logs for Errors

```bash
cd android
.\gradlew.bat assembleDebug 2>&1 | findstr "error"
```

**Common errors**:
- Unresolved reference to `NotificationBridgePlugin`
- Package declaration missing
- Import errors

---

### Step 5: Verify Files Exist

Check these files were created:

1. ✅ `android/app/src/main/java/com/lupyd/app/NotificationBridgePlugin.kt`
2. ✅ `android/app/src/main/java/com/lupyd/app/NotificationHelper.kt`
3. ✅ `android/app/src/main/java/com/lupyd/app/MainActivity.kt` (updated)
4. ✅ `src/plugins/notification-bridge.ts`
5. ✅ `src/context/notification-context.tsx` (updated)

---

### Step 6: Check Full Logs

```bash
# All logs
adb logcat

# Or filtered
adb logcat | findstr "lupyd"
```

**Look for**:
```
=== INITIALIZING NOTIFICATIONS ===
🔍 NotificationBridge plugin available: true  ← MUST BE TRUE!
```

---

## Common Issues & Fixes

### Issue 1: "NotificationBridge plugin available: false"

**Cause**: App not rebuilt with plugin

**Fix**:
```bash
npx cap sync android
cd android
.\gradlew.bat clean assembleDebug installDebug
```

---

### Issue 2: No logs at all

**Cause**: App crashed or not running

**Fix**: Check crash logs
```bash
adb logcat *:E
```

---

### Issue 3: Build fails with "Unresolved reference"

**Cause**: Kotlin compilation error

**Fix**: Check MainActivity.kt syntax
```bash
cd android
.\gradlew.bat assembleDebug --stacktrace
```

---

### Issue 4: Plugin registered but crashes when called

**Cause**: Missing imports in NotificationHelper

**Fix**: Verify all imports in NotificationHelper.kt:
- `android.content.Context`
- `android.content.SharedPreferences`
- `androidx.core.app.NotificationCompat`
- `androidx.core.app.RemoteInput`

---

## Quick Test Command

Run this ALL-IN-ONE command:

```bash
npx cap sync android && cd android && .\gradlew.bat clean assembleDebug installDebug && cd .. && adb logcat -c && adb logcat | findstr "lupyd"
```

**Expected output**:
```
lupyd-cap: NotificationBridge Plugin registered
=== INITIALIZING NOTIFICATIONS ===
🔍 NotificationBridge plugin available: true
```

---

## If Still Not Working

### Nuclear Option: Complete Reset

```bash
# 1. Remove build artifacts
cd android
.\gradlew.bat clean
rd /s /q .gradle
rd /s /q build
rd /s /q app\build

# 2. Reinstall node modules
cd ..
rd /s /q node_modules
pnpm install

# 3. Sync and build
npx cap sync android
cd android
.\gradlew.bat assembleDebug installDebug
```

---

## Verification Checklist

Before testing, verify:

- [ ] `npx cap sync android` was run
- [ ] Build completed without errors
- [ ] App installed on device/emulator
- [ ] Logs show: "NotificationBridge Plugin registered"
- [ ] Logs show: "🔍 NotificationBridge plugin available: true"
- [ ] Test button added to app (optional)

---

## Success Indicators

When everything works, you'll see:

```
=== INITIALIZING NOTIFICATIONS ===
Platform: android
🔍 NotificationBridge plugin available: true  ✓
lupyd-cap: NotificationBridge Plugin registered  ✓

=== PUSH NOTIFICATION RECEIVED ===
Calling native NotificationBridge for bundled notification...
✓ Native bundled notification shown successfully  ✓
lupyd-NotificationHelper: Showing bundled notification from: John  ✓
lupyd-NotificationHelper: Total messages from John: 2  ✓
```

**And in your notification tray**:
- ✅ Notification grouped by sender
- ✅ Shows multiple messages
- ✅ Has "Reply" button
- ✅ Shows message count

---

**Most likely issue**: You haven't run `npx cap sync android` or rebuilt the app!
