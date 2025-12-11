# WhatsApp Archiver (React Native prototype)

This folder contains a React Native prototype and Android native module snippets to help watch WhatsApp media folders and save copies into the app storage.

Important notes / limitations:
- You must only use this on devices/accounts you own or have explicit permission for.
- View-once media may not be recoverable.
- Some functionality requires special Android permissions (notification listener, manage external storage, accessibility) which have privacy and Play Store implications.

Quick setup (development machine):

1. Create a React Native project using the React Native CLI, or copy these files into a new project.

2. Install dependencies:

```powershell
cd mobile-react-native
npm install
npx pod-install # if developing on macOS for iOS (not needed for Android-only testing)
```

3. Add the Android native module snippets from `android-module/` into your Android app source (`android/app/src/main/...`).

4. Add the `NotificationListenerService` and declare permissions in `AndroidManifest.xml`. See `android-module/AndroidManifest.snippet`.
   - Register the native module package in `MainApplication.kt` by adding `WhatsAppWatcherPackage()` to the packages list. See `android-module/MainApplication.snippet` for an example.
   - The `NotificationListenerService` writes a `last_sender` and `last_sender_time` value into `SharedPreferences` to provide a best-effort mapping between incoming media and the most-recent sender. The FileObserver module uses this to place new media into per-contact folders.

5. Build and run on an Android device, grant the requested permissions, and tap "Start Watcher".

Notes about per-contact folder logic:
- WhatsApp saves media to shared folders grouped by media type, not by sender. This prototype uses a heuristic: when a notification is received, the listener records the sender and timestamp. If a media file appears shortly after (within ~2 minutes), the file is placed into a folder named for that sender. This is best-effort and will not always be accurate (race conditions, delayed writes, forwarded media).
- For production, consider a more robust mapping approach (parsing WhatsApp DB — not possible without access, or hooking into the app UI via Accessibility with explicit consent).

This prototype demonstrates the approach. For a production app you must handle scoped storage properly, background execution, and follow Play Store privacy rules.
# Permissions & how to enable

- Accessibility Service: enable the app's accessibility service manually in Settings → Accessibility → Installed services. Use the "Open Accessibility Settings" button in the app to jump there.

- Notification access: grant Notification Access to let the `NotificationListenerService` read WhatsApp notification content. Use the "Open Notification Access" button in the app.

- Storage access:
   - For Android 10 and below: request `READ_EXTERNAL_STORAGE` and `WRITE_EXTERNAL_STORAGE` at runtime (the app prototype requests these permissions).
   - For Android 11+ (API 30+): prefer using MediaStore or SAF. If broad file access is required, request `MANAGE_EXTERNAL_STORAGE`. Use the "Request All Files Access" button to open the system setting. Note: `MANAGE_EXTERNAL_STORAGE` has Play Store implications.

Testing checklist:

1. Build and install the app on an Android device.
2. Open the app and grant storage permissions when prompted.
3. Open Accessibility Settings and enable the `WhatsAppAccessibilityService`.
4. Open Notification Access and enable the app's notification listener.
5. Tap "Start Watcher" in the app and send/receive media in WhatsApp; verify files are copied under the app external directory (`/Android/data/<package>/files/WhatsAppArchive/<chat>/`).

# WhatsApp Archiver (React Native prototype)

This folder contains a React Native prototype and Android native module snippets to help watch WhatsApp media folders and save copies into the app storage.

Important notes / limitations:
- You must only use this on devices/accounts you own or have explicit permission for.
- View-once media may not be recoverable.
- Some functionality requires special Android permissions (notification listener, manage external storage, accessibility) which have privacy and Play Store implications.

Quick setup (development machine):

1. Create a React Native project using the React Native CLI, or copy these files into a new project.

2. Install dependencies:

```powershell
cd mobile-react-native
npm install
npx pod-install # if developing on macOS for iOS (not needed for Android-only testing)
```

3. Add the Android native module snippets from `android-module/` into your Android app source (`android/app/src/main/...`).

4. Add the `NotificationListenerService` and declare permissions in `AndroidManifest.xml`. See `android-module/AndroidManifest.snippet`.

5. Build and run on an Android device, grant the requested permissions, and tap "Start Watcher".

This prototype demonstrates the approach. For a production app you must handle scoped storage properly, background execution, and follow Play Store privacy rules.
