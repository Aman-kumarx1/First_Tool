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
